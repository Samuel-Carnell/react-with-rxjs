import { BehaviorSubject, Observable } from 'rxjs';
/**
 * Subscribes to `source$` and returns/yields the latest emitted value, re-rendering the component when `source$` emits a new value.
 */
export declare function useLatestValue<TValue>(source$: BehaviorSubject<TValue>): TValue;
/**
 * Subscribes to `source$` and returns/yields the latest emitted value, re-rendering the component when `source$` emits a new value.
 */
export declare function useLatestValue<TValue>(source$: Observable<TValue>): TValue | undefined;
