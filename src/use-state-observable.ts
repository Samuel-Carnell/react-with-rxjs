import { useCallback, useLayoutEffect } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, scan } from 'rxjs/operators';
import { useFactory } from './helpers/use-factory';
import { isFunction } from './helpers/is-function';

type ValueOrFactory<TValue> = (() => TValue) | TValue;
type ValueOrAccumulator<TValue> = ((prevValue: TValue) => TValue) | TValue;

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
export function useStateObservable<TValue>(): [
	Observable<TValue | undefined>,
	(value: ValueOrAccumulator<TValue>) => void
];

/**
 * Returns a new multi-casted observable and an updater function to feed new values to it.
 *
 * Alternative to Reacts `useState` hook where the first value in the array returned is an observable
 * representing the current value rather than the raw value.
 * @typeParam `TValue` The type of the value emitted by the returned observable and the first parameter of the updater
 * function.
 * @param initialValue An initial value for the returned observable to emit.
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
export function useStateObservable<TValue>(
	initialValue: ValueOrFactory<TValue>
): [Observable<TValue>, (value: ValueOrAccumulator<TValue>) => void];

export function useStateObservable(
	initialValue?: ValueOrFactory<unknown>
): [Observable<unknown>, (value: ValueOrAccumulator<unknown>) => void] {
	const valueOrAcc$ = useFactory(
		() => {
			const value = isFunction(initialValue) ? initialValue() : initialValue;
			return new BehaviorSubject<ValueOrAccumulator<unknown>>(value);
		},
		[],
		'useStateObservable'
	);

	useLayoutEffect(() => {
		return () => valueOrAcc$.complete();
	}, [valueOrAcc$]);

	const updateValue = useCallback(
		(state: ValueOrAccumulator<unknown>) => {
			valueOrAcc$.next(state);
		},
		[valueOrAcc$]
	);

	const value$: Observable<unknown> = useFactory(
		() =>
			valueOrAcc$.pipe(
				scan((previousState: unknown, stateOrAcc: ValueOrAccumulator<unknown>) => {
					const state = isFunction(stateOrAcc) ? stateOrAcc(previousState) : stateOrAcc;
					return state;
				}),
				distinctUntilChanged(Object.is)
			),
		[valueOrAcc$],
		'useStateObservable'
	);

	return [value$, updateValue];
}
