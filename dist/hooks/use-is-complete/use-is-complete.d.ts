import { Observable } from 'rxjs';
/**
 * Subscribes to `source$` and returns true if it has completed, otherwise false.
 */
export declare function useIsComplete(source$: Observable<unknown>): boolean;
