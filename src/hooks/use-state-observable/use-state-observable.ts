import { useCallback, useLayoutEffect } from 'react';
import { connectable, Connectable, Observable, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, scan, startWith } from 'rxjs/operators';
import { useFactory } from 'hooks/internal';
import { useSubscription } from 'hooks/use-subscription';
import { isFunction } from 'helpers';

type Factory<T> = () => T;
type Operator<T> = (value: T) => T;

type SetSate<T> = (state: T | Operator<T>) => void;

function currentValue$<TValue>(
	valueOrOperatorFn$: Observable<TValue | Operator<TValue>>,
	initialValueOrFactoryFn: TValue | Factory<TValue>
): Connectable<TValue> {
	const initialValue: TValue = isFunction(initialValueOrFactoryFn)
		? initialValueOrFactoryFn()
		: initialValueOrFactoryFn;

	const currentValue$: Observable<TValue> = valueOrOperatorFn$.pipe(
		startWith(initialValue),
		scan((previousValue: TValue, valueOrTransform: TValue | Operator<TValue>) => {
			return isFunction(valueOrTransform) ? valueOrTransform(previousValue) : valueOrTransform;
		}),
		distinctUntilChanged(Object.is)
	);

	return connectable(currentValue$, {
		connector: () => new ReplaySubject(1),
		resetOnDisconnect: false,
	});
}

/**
 * Returns an observable of the current state (`state$`) and a function to update the current state (`setState`).
 */
export function useStateObservable<TState>(): [
	state$: Observable<TState | undefined>,
	setState: SetSate<TState>
];

/**
 * Returns an observable of the current state and a function to update the current state.
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
	const currentState$: Connectable<unknown> = useFactory(
		() => currentValue$(valueOrOperatorFn$, initialState),
		[valueOrOperatorFn$],
		'useStateObservable'
	);

	useSubscription(() => currentState$.connect(), [currentState$]);

	return [currentState$, setState];
}
