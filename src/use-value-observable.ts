import { useLayoutEffect } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { useFactory } from './helpers/use-factory';
import { useHasInputChanged } from './helpers/use-has-input-changed';

export function useValueObservable<TValue>(value: TValue): Observable<TValue> {
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
