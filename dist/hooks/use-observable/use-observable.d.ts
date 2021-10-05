import { Observable } from 'rxjs';
/**
 * Uses the provided `observableFactory` to compute the returned observable. This observable persists across renders,
 * only being recomputed if any values in the `dependencies` array change.
 */
export declare function useObservable<TObservable extends Observable<unknown>>(observableFactory: () => TObservable, dependencies?: unknown[]): TObservable;
