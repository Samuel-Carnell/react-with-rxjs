import { useCallback, useLayoutEffect } from 'react';
import { Observable, Subject } from 'rxjs';
import { useFactory } from './helpers/use-factory';

type Emit<T> = (event: T) => void;

export function useEventObservable<TEvent>(): [Observable<TEvent>, Emit<TEvent>] {
	const eventSubject = useFactory(() => new Subject<TEvent>(), [], 'useEventObservable');

	useLayoutEffect(() => {
		return () => eventSubject.complete();
	}, [eventSubject]);

	const emit: Emit<TEvent> = useCallback((event) => eventSubject.next(event), [eventSubject]);

	const event$ = useFactory(() => eventSubject.asObservable(), [], 'useEventObservable');

	return [event$, emit];
}
