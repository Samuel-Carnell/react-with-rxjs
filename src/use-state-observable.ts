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

function resolveCurrentState<TValue>(): UnaryFunction<
	Observable<ValueOrAccumulator<TValue>>,
	Observable<TValue>
> {
	return pipe(
		scan<ValueOrAccumulator<TValue>, TValue>((currentState, nextStateRequest) => {
			const nextState = isFunction(nextStateRequest)
				? nextStateRequest(currentState)
				: nextStateRequest;
			return nextState;
		}),
		distinctUntilChanged<TValue>(Object.is)
	);
}

export function useStateObservable<TValue>(
	initialValue?: ValueOrFactory<TValue>
): [Observable<TValue>, (value: ValueOrAccumulator<TValue>) => void] {
	const nextStateRequest$: Subject<ValueOrAccumulator<TValue>> = useFactory(
		() => createStateSubject(initialValue),
		[]
	);

	const updateState = useCallback(
		(value: ValueOrAccumulator<TValue>) => {
			nextStateRequest$.next(value);
		},
		[nextStateRequest$]
	);

	const currentState$: Observable<TValue> = useFactory(
		() => nextStateRequest$.pipe(resolveCurrentState()),
		[nextStateRequest$]
	);

	return [currentState$, updateState];
}
