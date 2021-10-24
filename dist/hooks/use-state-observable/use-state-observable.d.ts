import { Observable } from 'rxjs';
declare type Factory<T> = () => T;
declare type Operator<T> = (value: T) => T;
declare type SetSate<T> = (state: T | Operator<T>) => void;
/**
 * Returns an observable of the current state (`state$`) and a function to update the current state (`setState`).
 */
export declare function useStateObservable<TState>(): [
    state$: Observable<TState | undefined>,
    setState: SetSate<TState>
];
/**
 * Returns an observable of the current state and a function to update the current state.
 */
export declare function useStateObservable<TState>(initialState: TState | Factory<TState>): [state$: Observable<TState>, setState: SetSate<TState>];
export {};
