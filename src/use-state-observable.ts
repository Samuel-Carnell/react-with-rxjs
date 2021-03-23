import { useCallback, useLayoutEffect } from 'react';
import { ConnectableObservable, Observable, OperatorFunction, pipe, Subject } from 'rxjs';
import { distinctUntilChanged, publishReplay, scan, startWith } from 'rxjs/operators';
import { useFactory } from './helpers/use-factory';
import { isFunction } from './helpers/is-function';
import { useSubscription } from './helpers/use-subscription';

type Factory<T> = () => T;
type Operator<T> = (value: T) => T;
type SetSate<T> = (state: T | Operator<T>) => void;

function publishCurrentState$<TState>(
	stateOrOperatorFn$: Observable<TState | Operator<TState>>,
	initialStateOrFactory: TState | Factory<TState>
): ConnectableObservable<TState> {
	const initialState: TState = isFunction(initialStateOrFactory)
		? initialStateOrFactory()
		: initialStateOrFactory;

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
	return stateOrOperatorFn$.pipe(publishCurrentValue) as ConnectableObservable<TState>;
}

/**
 * Returns a new multi-casted observable and an updater function to feed new values to it.
 *
 * Alternative to Reacts `useState` hook where the first value in the array returned is an observable
 * representing the current value rather than the raw value.
 * @typeParam `TValue` The type of the value emitted by the returned observable and the first parameter of the updater
 * function.
 *
 * @returns
 * `[0]` - A multi-casted observable which holds the current value emitted to consumers, where the current value
 * defaults to undefined until the current value is updated. This observable will replay the current value when a new observer
 * subscribes to it, then any subsequent values fed to it.
 *
 * `[1]` - An updater function for feeding new values to the observable.
 * @param value The next value to feed to the observable.
 *
 * If a function is provided then it will be called with the current value to calculate the next value.
 *
 * If the next value is the same as the current value, then the observable will not emit the new value.
 */
export function useStateObservable<TState>(): [
	Observable<TState | undefined>,
	(value: TState | Factory<TState>) => void
];

/**
 * Returns a new multi-casted observable and an updater function to feed new values to it.
 *
 * Alternative to Reacts `useState` hook where the first value in the array returned is an observable
 * representing the current value rather than the raw value.
 * @typeParam `TValue` The type of the value emitted by the returned observable and the first parameter of the updater
 * function.
 * @param initialState An initial value for the returned observable to emit.
 *
 * If a function is provided then it will be called only on the initial render to calculate the initial value.
 * @returns
 * `[0]` - A multi-casted observable which holds the current value emitted to consumers. This observable will replay the
 * current value when a new observer subscribes to it, then any subsequent values fed to it.
 *
 * `[1]` - An updater function for feeding new values to the observable.
 * @param value The next value to feed to the observable.
 *
 * If a function is provided then it will be called with the current value to calculate the next value.
 *
 * If the next value is the same as the current value, then the observable will not emit the new value.
 */
export function useStateObservable<TState>(
	initialState: TState | Factory<TState>
): [Observable<TState>, SetSate<TState>];

export function useStateObservable(
	initialState?: unknown | Factory<unknown>
): [Observable<unknown>, SetSate<unknown>] {
	const stateOrOperatorFn$: Subject<unknown | Operator<unknown>> = useFactory(
		() => new Subject<unknown | Operator<unknown>>(),
		[],
		'useStateObservable'
	);

	useLayoutEffect(() => {
		return () => stateOrOperatorFn$.complete();
	}, []);

	const setState: SetSate<unknown> = useCallback(
		(state: unknown | Operator<unknown>) => {
			const stateOrOperator = state;
			stateOrOperatorFn$.next(stateOrOperator);
		},
		[stateOrOperatorFn$]
	);

	// initialState is not specified as a dependency as it is only used on the first render
	const currentState$: ConnectableObservable<unknown> = useFactory(
		() => publishCurrentState$(stateOrOperatorFn$, initialState),
		[stateOrOperatorFn$],
		'useStateObservable'
	);

	useSubscription(() => currentState$.connect(), [currentState$]);

	return [currentState$, setState];
}
