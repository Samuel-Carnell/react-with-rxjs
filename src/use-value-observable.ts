import { useLayoutEffect } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { useFactory } from './helpers/use-factory';
import { useHasInputChanged } from './helpers/use-has-input-changed';

/**
 * Returns a observable which watches `value` and emits `value` on the first render, then when `value` changes between
 * re-renders.
 *
 * This is useful for converting raw values returned from other hooks such as `useContext`, into observables of those
 * values.
 *
 * @param value The value to watch, and emit on the first render and when changed.
 * @returns An observable which emits `value` on the first render, then when `value` changes between re-renders.
 *
 * This observable will replay the latest `value` when subscribed to, and complete when the component is unmounted.
 */
export function useValueObservable<TValue>(value: TValue): Observable<TValue> {
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
