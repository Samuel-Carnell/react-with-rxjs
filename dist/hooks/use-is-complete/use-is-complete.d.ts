import { Observable } from 'rxjs';
/**
 * Subscribes to the given observable and returns `true` if its complete, otherwise `false` until it does complete. If
 * the observable changes between renders this hook will unsubscribe from the previous observable and subscribe to the
 * new observable, returning its current completed state.
 */
export declare function useIsComplete(source$: Observable<unknown>): boolean;
