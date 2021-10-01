import { useCallback, useLayoutEffect } from 'react';
import { ConnectableObservable, Observable, OperatorFunction, pipe, Subject } from 'rxjs';
import { distinctUntilChanged, publishReplay, scan, startWith } from 'rxjs/operators';
import { useFactory } from 'hooks/internal';
import { useSubscription } from 'hooks/use-subscription';
import { isFunction } from 'helpers';

type Factory<T> = () => T;
type Operator<T> = (value: T) => T;

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

	// The pipe operator doesn't infer the return type as ConnectableObservable, so the return type needs to be cast
	return valueOrOperatorFn$.pipe(publishCurrentValue) as ConnectableObservable<TState>;
}

/**
 * Returns an observable of the current state (`state$`) and a function to update the current state (`setState`).
 */
export function useStateObservable<TState>(): [
	state$: Observable<TState | undefined>,
	setState: SetSate<TState>
];

/**
 * Returns an observable of the current state (`state$`) and a function to update the current state (`setState`).
 */
export function useStateObservable<TState>(
	initialState: TState | Factory<TState>
): [state$: Observable<TState>, setState: SetSate<TState>];

export function useStateObservable(
	initialState?: unknown | Factory<unknown>
): [state$: Observable<unknown>, setState: SetSate<unknown>] {
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
