import { BehaviorSubject, Observable } from 'rxjs';
/**
 * Subscribes to the given observable, returning the latest emitted value and re-rendering the component when it emits a
 * new value. If the observable changes between renders this hook will unsubscribe from the previous observable and
 * subscribe to the new observable, but will return the last emitted value from the previous observable until the new
 * observable emits a new value.
 */
export declare function useLatestValue<TValue>(source$: BehaviorSubject<TValue>): TValue;
/**
 * Subscribes to the given observable, returning the latest emitted value and re-rendering the component when it emits a
 * new value. If the observable changes between renders this hook will unsubscribe from the previous observable and
 * subscribe to the new observable, but will return the last emitted value from the previous observable until the new
 * observable emits a new value.
 */
export declare function useLatestValue<TValue>(source$: Observable<TValue>): TValue | undefined;
