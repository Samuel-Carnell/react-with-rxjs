import { Observable } from 'rxjs';
import { MutableValue as MutableState } from './mutable-state';
declare type WatchObservable<T> = (observable: Observable<T>) => MutableState<T>;
declare type WatchedState = {
    error?: unknown;
    value?: unknown;
};
declare function useWatchObservable(): WatchObservable<unknown>;
export { useWatchObservable };
export type { WatchedState };
