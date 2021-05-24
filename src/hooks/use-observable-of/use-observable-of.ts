import { useEffect } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { useFactory, useHasInputChanged } from 'hooks/internal';

/**
 * Returns an observable which emits `value` on the initial render, and then again if `value` has changed between
 * re-renders.
 */
export function useObservableOf<TValue>(value: TValue): Observable<TValue> {
	// value is not specified as a dependency so the behavior subject is only created on the first render
	const value$: BehaviorSubject<TValue> = useFactory(
		() => new BehaviorSubject(value),
		[],
		'useValueObservable'
	);
	const hasValueChanged = useHasInputChanged([value], 'useValueObservable');

	useEffect(() => {
		if (hasValueChanged) {
			value$.next(value);
		}
	});

	return value$.asObservable();
}
