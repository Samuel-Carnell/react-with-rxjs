import { Observable } from 'rxjs';
declare type Emit<T> = (event: T) => void;
/**
 * Returns an observable of events and a function to emit a new event.
 */
export declare function useEventObservable<TEvent>(): [events$: Observable<TEvent>, emit: Emit<TEvent>];
export {};
