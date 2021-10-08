import { useThrowComponentError } from 'hooks/internal';
import { useSubscription } from 'hooks/use-subscription';
import { useState } from 'react';
import { BehaviorSubject, isObservable, Observable } from 'rxjs';

function isBehaviorSubject(source$: Observable<unknown>): source$ is BehaviorSubject<unknown> {
	return 'getValue' in source$;
}

/**
 * Subscribes to the given observable, returning the latest emitted value and re-rendering the component when it emits a
 * new value. If the observable changes between renders this hook will unsubscribe from the previous observable and
 * subscribe to the new observable, but will return the last emitted value from the previous observable until the new
 * observable emits a new value.
 */
export function useLatestValue<TValue>(source$: BehaviorSubject<TValue>): TValue;

/**
 * Subscribes to the given observable, returning the latest emitted value and re-rendering the component when it emits a
 * new value. If the observable changes between renders this hook will unsubscribe from the previous observable and
 * subscribe to the new observable, but will return the last emitted value from the previous observable until the new
 * observable emits a new value.
 */
export function useLatestValue<TValue>(source$: Observable<TValue>): TValue | undefined;

export function useLatestValue(source$: Observable<unknown>): unknown {
	if (!isObservable(source$)) {
		throw new TypeError(
			`${source$} is not an Observable. For return value of argument observable in useLatestValue`
		);
	}

	const throwComponentError = useThrowComponentError();
	const [latestValue, setLatestValue] = useState(() => {
		return isBehaviorSubject(source$) ? source$.getValue() : undefined;
	});

	useSubscription(() => {
		return source$.subscribe({
			next(value: unknown): void {
				setLatestValue(() => value);
			},
			error(error: unknown): void {
				throwComponentError(error);
			},
		});
	}, [source$]);

	return latestValue;
}
