import { useState } from 'react';
import { Observable } from 'rxjs';
import { useSubscription } from './helpers/use-subscription';

type ObservableState<TValue, TError> = {
	value: TValue | undefined;
	error: TError | undefined;
	isComplete: boolean;
} & [TValue | undefined, TError | undefined, boolean];

export function useObservableState<TValue, TError = any>(
	observable: Observable<TValue>
): ObservableState<TValue, TError> {
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

	const observableState: any = [value, error, isComplete];
	observableState.value = value;
	observableState.error = error;
	observableState.isComplete = isComplete;

	return observableState as ObservableState<TValue, TError>;
}
