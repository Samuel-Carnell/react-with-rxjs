import { useCallback } from 'react';
import { BehaviorSubject, Observable, pipe, ReplaySubject, Subject, UnaryFunction } from 'rxjs';
import { distinctUntilChanged, scan } from 'rxjs/operators';
import { useFactory } from './helpers/use-factory';

type ValueOrFactory<TValue> = (() => TValue) | TValue;
type ValueOrAccumulator<TValue> = ((prevValue: TValue) => TValue) | TValue;

function isFunction<T extends Function>(value: unknown): value is T {
	return typeof value === 'function' && value instanceof Function;
}

function createStateSubject<TValue>(
	initialValueOrFn?: ValueOrFactory<TValue>
): Subject<ValueOrAccumulator<TValue>> {
	const initialValue: TValue | undefined = isFunction(initialValueOrFn)
		? initialValueOrFn()
		: initialValueOrFn;
	return initialValue === undefined
		? new ReplaySubject<ValueOrAccumulator<TValue>>(1)
		: new BehaviorSubject<ValueOrAccumulator<TValue>>(initialValue);
}

function resolveNextState<TValue>(): UnaryFunction<
	Observable<ValueOrAccumulator<TValue>>,
	Observable<TValue>
> {
	return pipe(
		scan<ValueOrAccumulator<TValue>, TValue>((currentState, nextStateOrFn) => {
			const nextState = isFunction(nextStateOrFn) ? nextStateOrFn(currentState) : nextStateOrFn;
			return nextState;
		}),
		distinctUntilChanged<TValue>(Object.is)
	);
}

/**
 * Returns a new multi-casted observable and a function feed new values to it.
 *
 * Alternative to Reacts `useState` hook where the first value in the array returned is an observable
 * representing the current value rather than the raw value.
 * @param initialValue - An initial value for the returned observable to emit.
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
	initialValue?: ValueOrFactory<TValue>
): [Observable<TValue>, (value: ValueOrAccumulator<TValue>) => void] {
	const nextStateOrFn$: Subject<ValueOrAccumulator<TValue>> = useFactory(
		() => createStateSubject(initialValue),
		[]
	);

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
