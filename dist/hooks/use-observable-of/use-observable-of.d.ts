import { Observable } from 'rxjs';
/**
 * Returns an observable persisting across renders. Emitting `value` on the initial render, then emitting `value` again
 * if it has changed in between re-renders.
 */
export declare function useObservableOf<TValue>(value: TValue): Observable<TValue>;
