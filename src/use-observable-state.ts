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
): [TValue | undefined, TError | undefined, boolean] {
	if (!isObservable(observable)) {
		throw new TypeError(
			`${observable} is not an Observable. For return value of argument observable in useObservableState`
		);
	}

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
