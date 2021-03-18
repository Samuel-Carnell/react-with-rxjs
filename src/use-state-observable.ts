import { useCallback, useLayoutEffect } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, scan } from 'rxjs/operators';
import { useFactory } from './helpers/use-factory';

type ValueOrFactory<TValue> = (() => TValue) | TValue;
type ValueOrAccumulator<TValue> = ((prevValue: TValue) => TValue) | TValue;

function isFunction<T extends Function>(value: unknown): value is T {
	return typeof value === 'function' && value instanceof Function;
}

/**
 * Returns a new multi-casted observable and a function feed new values to it.
 *
 * Alternative to Reacts `useState` hook where the first value in the array returned is an observable
 * representing the current value rather than the raw value.
 * @param initialState - Optional. An initial value for the returned observable to emit.
 *
 * If no value is provided then the returned observable will not emit an initial value.
 *
 * If a function is provided then it will be called only on the initial render to calculate the initial value.
 * @returns
 * `[0]` - A multi-casted observable which holds the current value emitted to consumers. This observable will replay the
 * current value when a new observer subscribes to it then any subsequent values fed to it.
 *
 * `[1]` - A function for feeding new values to the observable.
 * @param nextValue - The next value to feed to the observable.
 *
 * If a function is provided then it will be called with the current value to calculate the next value.
 *
 * If the next value is the same as the current value, then the observable will not emit the new value.
 */
export function useStateObservable<TValue>(
	initialState: ValueOrFactory<TValue>
): [Observable<TValue>, (value: ValueOrAccumulator<TValue>) => void] {
	const stateOrAcc$ = useFactory(() => {
		const state: TValue = isFunction(initialState) ? initialState() : initialState;
		return new BehaviorSubject<ValueOrAccumulator<TValue>>(state);
	}, []);

	useLayoutEffect(() => {
		return () => stateOrAcc$.complete();
	}, [stateOrAcc$]);

	const setState = useCallback(
		(state: ValueOrAccumulator<TValue>) => {
			stateOrAcc$.next(state);
		},
		[stateOrAcc$]
	);

	const state$: Observable<TValue> = useFactory(
		() =>
			stateOrAcc$.pipe(
				scan((previousState: ValueOrAccumulator<TValue>, stateOrAcc: TValue) => {
					const state = isFunction(stateOrAcc) ? stateOrAcc(previousState) : stateOrAcc;
					return state;
				}),
				distinctUntilChanged(Object.is)
			),
		[stateOrAcc$]
	);

	return [state$, setState];
}
