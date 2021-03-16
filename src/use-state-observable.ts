import { useCallback, useLayoutEffect } from 'react';
import { BehaviorSubject, Observable, pipe, Subject, UnaryFunction } from 'rxjs';
import { distinctUntilChanged, filter, scan } from 'rxjs/operators';
import { useFactory } from './helpers/use-factory';

const NO_EMIT = Symbol();

type ValueOrFactory<TValue> = (() => TValue) | TValue;
type ValueOrAccumulator<TValue> = ((prevValue: TValue) => TValue) | TValue;

function isFunction<T extends Function>(value: unknown): value is T {
	return typeof value === 'function' && value instanceof Function;
}

function createStateSubject<TValue>(
	initialValueOrFn: ValueOrFactory<TValue> | typeof NO_EMIT
): Subject<ValueOrAccumulator<TValue> | typeof NO_EMIT> {
	const initialValue: TValue | typeof NO_EMIT = isFunction(initialValueOrFn)
		? initialValueOrFn()
		: initialValueOrFn;
	return new BehaviorSubject(initialValue);
}

function resolveNextState<TValue>(): UnaryFunction<
	Observable<ValueOrAccumulator<TValue> | typeof NO_EMIT>,
	Observable<TValue>
> {
	return pipe(
		filter((nextState): nextState is ValueOrAccumulator<TValue> => nextState !== NO_EMIT),
		scan((currentState: ValueOrAccumulator<TValue>, nextStateOrFn: TValue) => {
			const nextState = isFunction(nextStateOrFn) ? nextStateOrFn(currentState) : nextStateOrFn;
			return nextState;
		}),
		distinctUntilChanged(Object.is)
	);
}

/**
 * Returns a new multi-casted observable and a function feed new values to it.
 *
 * Alternative to Reacts `useState` hook where the first value in the array returned is an observable
 * representing the current value rather than the raw value.
 * @param initialValue - Optional. An initial value for the returned observable to emit.
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
	initialValue: ValueOrFactory<TValue> | typeof NO_EMIT = NO_EMIT
): [Observable<TValue>, (value: ValueOrAccumulator<TValue>) => void] {
	const nextStateOrFn$ = useFactory(() => createStateSubject(initialValue), []);

	useLayoutEffect(() => {
		return () => nextStateOrFn$.complete();
	}, [nextStateOrFn$]);

	const updateState = useCallback(
		(nextValue: ValueOrAccumulator<TValue>) => {
			nextStateOrFn$.next(nextValue);
		},
		[nextStateOrFn$]
	);

	const state$: Observable<TValue> = useFactory(() => nextStateOrFn$.pipe(resolveNextState()), [
		nextStateOrFn$,
	]);

	return [state$, updateState];
}
