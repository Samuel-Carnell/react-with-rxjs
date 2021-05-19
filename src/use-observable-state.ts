import { useLayoutEffect, useState } from 'react';
import { isObservable, Observable } from 'rxjs';
import { useHasInputChanged } from './helpers/use-has-input-changed';
import { useSubscription } from './helpers/use-subscription';

/**
 * Subscribes to `observable` and returns the latest value it emitted, the latest error it thrown, and a boolean
 * representing if it has completed.
 */
export function useObservableState<TValue, TError = any>(
	observable: Observable<TValue>
): [value: TValue | undefined, error: TError | undefined, isComplete: boolean];

/**
 * Subscribes to `observable` and returns the latest value it emitted, the latest error it thrown, and a boolean
 * representing if it has completed.
 */
export function useObservableState<TValue, TError = any>(
	observable: Observable<TValue>,
	initialValue: TValue
): [value: TValue, error: TError | undefined, isComplete: boolean];

export function useObservableState(
	observable: Observable<unknown>,
	initialValue?: unknown
): [value: unknown, error: unknown, isComplete: boolean] {
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
