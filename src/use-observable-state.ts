import { useLayoutEffect, useState } from 'react';
import { isObservable, Observable } from 'rxjs';
import { useHasInputChanged } from './helpers/use-has-input-changed';
import { useSubscription } from './helpers/use-subscription';

/**
 * Subscribes to `observable` and returns the latest value it emitted, the latest error it thrown, and a boolean
 * representing if it has completed.
 *
 * If `observable` changes between re-renders then this function subscribes to
 * new observable, and disposes of the previous subscription.
 * @typeParam `TValue` The type of the value emitted by `observable`.
 * @typeParam `TError` The type of error thrown by `observable`. Defaults to `any`.
 * @param observable The source observable to subscribe to.
 * @returns
 *
 * `[0]` - The latest value emitted by `observable`, or `initialValue` if it has not yet emitted a value.
 *
 * `[1]` - The error thrown by `observable`, or `undefined` if it has not thrown an error.
 *
 * `[2]` - A boolean representing if the given observable is complete. If the observable changes between re-renders,
 * then this will be reset to `false`.
 */
export function useObservableState<TValue, TError = any>(
	observable: Observable<TValue>
): [TValue | undefined, TError | undefined, boolean];

/**
 * Subscribes to `observable` and returns the latest value it emitted, the latest error it thrown, and a boolean
 * representing if it has completed.
 *
 * If `observable` changes between re-renders then this function subscribes to
 * new observable, and disposes of the previous subscription.
 * @typeParam `TValue` The type of the value emitted by `observable`.
 * @typeParam `TError` The type of error thrown by `observable`. Defaults to `any`.
 * @param observable The source observable to subscribe to.
 * @param initialValue The value to return until the given observable has emitted a value.
 * @returns
 * `[0]` - The latest value emitted by `observable`, or `initialValue` if it has not yet emitted a value.
 *
 * `[1]` - The error thrown by `observable`, or `undefined` if it has not thrown an error.
 *
 * `[2]` - A boolean representing if the given observable is complete. If the observable changes between re-renders,
 * then this will be reset to `false`.
 */
export function useObservableState<TValue, TError = any>(
	observable: Observable<TValue>,
	initialValue: TValue
): [TValue, TError | undefined, boolean];

export function useObservableState(
	observable: Observable<unknown>,
	initialValue?: unknown
): [unknown, unknown, boolean] {
	if (!isObservable(observable)) {
		throw new TypeError(
			`${observable} is not an Observable. For return value of argument observable in useObservableState`
		);
	}

	const [value, setValue] = useState<unknown>(() => initialValue);
	const [error, setError] = useState<unknown>(undefined);
	const [isComplete, setIsComplete] = useState<boolean>(false);

	const observableChanged = useHasInputChanged([observable], 'useObservableState');
	useLayoutEffect(() => {
		if (observableChanged) {
			setIsComplete(false);
		}
	});

	useSubscription(() => {
		return observable.subscribe({
			next(nextValue: unknown): void {
				setValue(() => nextValue);
			},
			error(error: unknown): void {
				setError(() => error);
			},
			complete(): void {
				setIsComplete(true);
			},
		});
	}, [observable]);

	return [value, error, isComplete];
}
