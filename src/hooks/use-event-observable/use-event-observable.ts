import { useCallback, useLayoutEffect } from 'react';
import { Observable, Subject } from 'rxjs';
import { useFactory } from 'hooks/internal';

type Emit<T> = (event: T) => void;

/**
 * Returns an observable of events (`events$`) and a function to emit a new event (`emit`).
 */
export function useEventObservable<TEvent>(): [events$: Observable<TEvent>, emit: Emit<TEvent>] {
	const eventSubject: Subject<TEvent> = useFactory(
		() => new Subject<TEvent>(),
		[],
		'useEventObservable'
	);

	useLayoutEffect(() => {
		return () => eventSubject.complete();
	}, [eventSubject]);

	const emit: Emit<TEvent> = useCallback((event) => eventSubject.next(event), [eventSubject]);

	const events$: Observable<TEvent> = useFactory(
		() => eventSubject.asObservable(),
		[],
		'useEventObservable'
	);

	return [events$, emit];
}
