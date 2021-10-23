import { useHasInputChanged, useThrowComponentError } from 'hooks/internal';
import { useSubscription } from 'hooks/use-subscription';
import { useLayoutEffect, useState } from 'react';
import { isObservable, Observable } from 'rxjs';

/**
 * Subscribes to the given observable and returns `true` if its complete, otherwise `false` until it does complete. If
 * the observable changes between renders this hook will unsubscribe from the previous observable and subscribe to the
 * new observable, returning its current completed state.
 */
export function useIsComplete(source$: Observable<unknown>): boolean {
	if (!isObservable(source$)) {
		throw new TypeError(
			`${source$} is not an Observable. For return value of argument observable in useIsComplete`
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
