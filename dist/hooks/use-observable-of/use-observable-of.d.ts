import { Observable } from 'rxjs';
/**
 * Returns an observable of distinct values passed, with this hook checking if the value has changed on each render.
 */
export declare function useObservableOf<TValue>(value: TValue): Observable<TValue>;
