import { useState } from 'react';
import { isObservable, Observable } from 'rxjs';
import { useSubscription } from './helpers/use-subscription';

/**
 * Subscribes to the given observable and returns it's current state.
 * @typeParam TValue The type of the value emitted by the observable `observable`.
 * @typeParam TError The type of error throw by the observable `observable`. Defaults to `any`.
 * @param observable The observable to store and return the state of.
 * @returns The latest value emitted by the observable, the error thrown by the observable,
 * a boolean representing if the observable is complete.
 * If the observable has not yet emitted a value the latest value will be undefined.
 * If the observable has not thrown an error the error will be undefined.
 */
export function useObservableState<TValue, TError = any>(
	observable: Observable<TValue>
): [TValue | undefined, TError | undefined, boolean];

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

	const [value, setValue] = useState<unknown>(initialValue);
	const [error, setError] = useState<unknown>(undefined);
	const [isComplete, setIsComplete] = useState<boolean>(false);

	useSubscription(() => {
		return observable.subscribe({
			next(value: unknown): void {
				console.log(value);
				setValue(value);
			},
			error(error: unknown): void {
				setError(error);
			},
			complete(): void {
				setIsComplete(true);
			},
		});
	}, [observable]);

	return [value, error, isComplete];
}
