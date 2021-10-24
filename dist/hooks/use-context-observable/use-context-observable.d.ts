import { Context } from 'react';
import { Observable } from 'rxjs';
/**
 * Returns an observable of the current value for the given context .
 */
export declare function useContextObservable<T>(context: Context<T>): Observable<T>;
