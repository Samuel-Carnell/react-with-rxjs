import { SubscriptionLike } from 'rxjs';
/**
 * Establishes a new subscription using the given `subscriptionFactory`. This subscription persists across renders, and
 * is destroyed when the component unmounts. If any of the dependencies change between render, the previous subscription
 * will be destroy and a new subscription established using the `subscriptionFactory`.
 */
export declare function useSubscription(subscriptionFactory: () => SubscriptionLike, dependencies: unknown[]): void;
