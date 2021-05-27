import { useEffect } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { useFactory, useHasInputChanged } from 'hooks/internal';

/**
 * Returns an observable which emits `value` on the initial render, and then emits `value` again if it changes in
 * between re-renders.
 */
export function useObservableOf<TValue>(value: TValue): Observable<TValue> {
	// value is not specified as a dependency so the behavior subject is only created on the first render
	const value$: BehaviorSubject<TValue> = useFactory(
		() => new BehaviorSubject(value),
		[],
		'useObservableOf'
	);
	const hasValueChanged = useHasInputChanged([value], 'useObservableOf');

	useEffect(() => {
		if (hasValueChanged) {
			value$.next(value);
		}
	});

	return useFactory(() => value$.asObservable(), [value$], 'useObservableOf');
}
