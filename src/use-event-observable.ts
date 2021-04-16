import { useCallback, useLayoutEffect } from 'react';
import { Observable, Subject } from 'rxjs';
import { useFactory } from './helpers/use-factory';

/**
 * A function to emit a new event, emitted by `event$` returned from `useEventObservable`.
 * @param event The event for `event$` to emit.
 */
type Emit<T> = (event: T) => void;

/**
 * Returns an observable of events, and a function to emit a new event.
 *
 * @returns
 * `event$` - An observable of events which emits when `emit` is called and completes when the component is
 * unmounted.
 *
 * `emit` - A function to emit a new event, emitted by the returned observable.
 */
export function useEventObservable<TEvent>(): [event$: Observable<TEvent>, emit: Emit<TEvent>] {
	const eventSubject: Subject<TEvent> = useFactory(
		() => new Subject<TEvent>(),
		[],
		'useEventObservable'
	);

	useLayoutEffect(() => {
		return () => eventSubject.complete();
	}, [eventSubject]);

	const emit: Emit<TEvent> = useCallback((event) => eventSubject.next(event), [eventSubject]);

	const event$: Observable<TEvent> = useFactory(
		() => eventSubject.asObservable(),
		[],
		'useEventObservable'
	);

	return [event$, emit];
}

function useStateObservable<TState>(
	initialState: TState | (() => TState)
): [
	state$: Observable<TState>,
	setState: (state: TState | ((value: TState) => TState)) => void,
	test: false
] {}
