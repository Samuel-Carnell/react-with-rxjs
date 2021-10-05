import { Observable } from 'rxjs';
declare type Emit<T> = (event: T) => void;
/**
 * Returns an observable of events (`events$`) and a function to emit a new event (`emit`).
 */
export declare function useEventObservable<TEvent>(): [events$: Observable<TEvent>, emit: Emit<TEvent>];
export {};
