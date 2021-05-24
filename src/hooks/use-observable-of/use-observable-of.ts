import { useLayoutEffect } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { useFactory, useHasInputChanged } from 'hooks/internal';

/**
 * Returns a observable which watches `value` and emits `value` when the component mounts, then when `value` changes between
 * re-renders.
 *
 * This is useful for converting raw values returned from other hooks such as `useContext`, into observables of those
 * values.
 *
 * @param value The value to watch, and emit when the component mounts, then when `value` changes.
 * @returns An observable which emits `value` when the component mounts, then when `value` changes between re-renders.
 *
 * This observable will replay the latest `value` when subscribed to, and complete when the component is unmounted.
 */
export function useObservableOf<TValue>(value: TValue): Observable<TValue> {
	// value is not specified as a dependency so the behavior subject is only created on the first render
	const value$ = useFactory(() => new BehaviorSubject(value), [], 'useValueObservable');
	const hasValueChanged = useHasInputChanged([value], 'useValueObservable');

	useLayoutEffect(() => {
		if (hasValueChanged) {
			value$.next(value);
		}
	});

	useLayoutEffect(() => {
		return () => value$.complete();
	}, []);

	return value$.asObservable();
}
