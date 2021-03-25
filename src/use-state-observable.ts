import { useCallback, useLayoutEffect } from 'react';
import { ConnectableObservable, Observable, OperatorFunction, pipe, Subject } from 'rxjs';
import { distinctUntilChanged, publishReplay, scan, startWith } from 'rxjs/operators';
import { useFactory } from './helpers/use-factory';
import { isFunction } from './helpers/is-function';
import { useSubscription } from './helpers/use-subscription';

type Factory<T> = () => T;
type Operator<T> = (value: T) => T;

/**
 * A function to set the current state emitted by the observable return from `useStateObservable`
 * @param state A value to set the current state to or a function to calculate the current state from the previous state.
 */
type SetSate<T> = (state: T | Operator<T>) => void;

function publishCurrentState$<TState>(
	valueOrOperatorFn$: Observable<TState | Operator<TState>>,
	initialValueOrFactoryFn: TState | Factory<TState>
): ConnectableObservable<TState> {
	const initialState: TState = isFunction(initialValueOrFactoryFn)
		? initialValueOrFactoryFn()
		: initialValueOrFactoryFn;

	const publishCurrentValue: OperatorFunction<TState | Operator<TState>, TState> = pipe(
		startWith(initialState),
		scan((previousValue: TState, valueOrTransform: TState | Operator<TState>) => {
			return isFunction(valueOrTransform) ? valueOrTransform(previousValue) : valueOrTransform;
		}),
		distinctUntilChanged(Object.is),
		// Using publishReplay rather than shareReplay so the current state is always calculated when the observable is
		// connected, even if nothing is subscribed to the observable.
		publishReplay(1)
	);

	// The pipe operator doesn't infer the return type as ConnectableObservable, so the return type needs to be casted
	return valueOrOperatorFn$.pipe(publishCurrentValue) as ConnectableObservable<TState>;
}

/**
 * Returns observable of the current state and a function to set the current state, with the current state initially set
 * to `undefined`.
 *
 * Alternative to Reacts `useState` hook where the first value in the array returned is an observable
 * representing the current state rather than the value.
 * @typeParam `TState` The type of state emitted by the returned observable and the first parameter of the setState function
 *
 * @returns
 * `[0]` - An observable which replays the current state when subscribed to, then emits when the current state is updated.
 *
 * `[1]` - A function to set the current state, emitted by the returned observable.
 */
export function useStateObservable<TState>(): [Observable<TState | undefined>, SetSate<TState>];

/**
 * Returns observable of the current state and a function to set the current state.
 *
 * Alternative to Reacts `useState` hook where the first value in the array returned is an observable
 * representing the current state rather than the value.
 * @typeParam `TState` The type of state emitted by the returned observable and the first parameter of the setState function
 * @param initialState A value to use as the initial state or a factory function to create the initial state.
 *
 * If a factory function is provided then it will only be called when the component is initially mounted.
 * @returns
 * `[0]` - An observable which replays the current state when subscribed to, then emits when the current state is updated.
 *
 * `[1]` - A function to set the current state, emitted by the returned observable.
 */
export function useStateObservable<TState>(
	initialState: TState | Factory<TState>
): [Observable<TState>, SetSate<TState>];

export function useStateObservable(
	initialState?: unknown | Factory<unknown>
): [Observable<unknown>, SetSate<unknown>] {
	const valueOrOperatorFn$: Subject<unknown | Operator<unknown>> = useFactory(
		() => new Subject<unknown | Operator<unknown>>(),
		[],
		'useStateObservable'
	);

	useLayoutEffect(() => {
		return () => valueOrOperatorFn$.complete();
	}, []);

	const setState: SetSate<unknown> = useCallback(
		(state: unknown | Operator<unknown>) => {
			const valueOrOperator = state;
			valueOrOperatorFn$.next(valueOrOperator);
		},
		[valueOrOperatorFn$]
	);

	// initialState is not specified as a dependency as it is only used when the component mounts
	const currentState$: ConnectableObservable<unknown> = useFactory(
		() => publishCurrentState$(valueOrOperatorFn$, initialState),
		[valueOrOperatorFn$],
		'useStateObservable'
	);

	useSubscription(() => currentState$.connect(), [currentState$]);

	return [currentState$, setState];
}
