import { useHasInputChanged, useThrowComponentError, useSubscription } from 'hooks/internal';
import { useLayoutEffect, useState } from 'react';
import { isObservable, Observable } from 'rxjs';

/**
 * Subscribes to `source$` and returns true if it has completed, otherwise false.
 */
export function useIsComplete(source$: Observable<unknown>): boolean {
	if (!isObservable(source$)) {
		throw new TypeError(
			`${source$} is not an Observable. For return value of argument observable in useObservableState`
		);
	}

	const throwComponentError = useThrowComponentError();
	const [isComplete, setIsComplete] = useState<boolean>(false);

	const hasSource$Changed = useHasInputChanged([source$], 'useIsComplete');
	useLayoutEffect(() => {
		if (hasSource$Changed) {
			setIsComplete(false);
		}
	}, [hasSource$Changed]);

	useSubscription(() => {
		return source$.subscribe({
			complete(): void {
				setIsComplete(true);
			},
			error(error: unknown): void {
				throwComponentError(error);
			},
		});
	}, [source$]);

	return isComplete;
}
