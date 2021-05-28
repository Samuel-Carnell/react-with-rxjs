import { useThrowComponentError } from 'hooks/internal';
import { useSubscription } from 'hooks/use-subscription';
import { useState } from 'react';
import { BehaviorSubject, isObservable, Observable } from 'rxjs';

function isBehaviorSubject(source$: Observable<unknown>): source$ is BehaviorSubject<unknown> {
	return 'value' in source$;
}

export function useLatestValue<TValue>(source$: BehaviorSubject<TValue>): TValue;

export function useLatestValue<TValue>(source$: Observable<TValue>): TValue | undefined;

export function useLatestValue(source$: Observable<unknown>): unknown {
	if (!isObservable(source$)) {
		throw new TypeError(
			`${source$} is not an Observable. For return value of argument observable in useLatestValue`
		);
	}

	const throwComponentError = useThrowComponentError();
	const [latestValue, setLatestValue] = useState(() => {
		return isBehaviorSubject(source$) ? source$.value : undefined;
	});

	useSubscription(() => {
		return source$.subscribe({
			next(value: unknown) {
				setLatestValue(value);
			},
			error(error: unknown): void {
				throwComponentError(error);
			},
		});
	}, [source$]);

	return latestValue;
}
