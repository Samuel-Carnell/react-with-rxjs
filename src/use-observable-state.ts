import { useState } from 'react';
import { Observable } from 'rxjs';
import { useSubscription } from './helpers/use-subscription';

/**
 * Stores and returns the current state of the given observable `observable`.
 * This state will get updated whenever the observable emits a new value, throws an error or completes,
 * and will trigger a re-render of the component.
 * @typeParam TValue The type of the value emitted by the observable `observable`.
 * @typeParam TError The type of error throw by the observable `observable`. Defaults to `any`.
 * @param observable The observable to store and return the state of.
 * @returns An array with each value in the array being
 *  1. The latest value emitted by the observable. If the observable has not yet emitted a value this will be undefined.
 *  2. The error thrown by the observable. If the observable has not yet thrown a value this will be undefined.
 *  3. A boolean representing if the observable is complete.
 */
export function useObservableState<TValue, TError = any>(
	observable: Observable<TValue>
): [TValue | undefined, TError | undefined, boolean] {
	const [value, setValue] = useState<TValue | undefined>(undefined);
	const [error, setError] = useState<TError | undefined>(undefined);
	const [isComplete, setIsComplete] = useState<boolean>(false);

	useSubscription(() => {
		return observable.subscribe({
			next(value: TValue) {
				setValue(value);
			},
			error(error: any) {
				setError(error as TError);
			},
			complete() {
				setIsComplete(true);
			},
		});
	}, [observable]);

	return [value, error, isComplete];
}
