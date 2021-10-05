import { SubscriptionLike } from 'rxjs';
/**
 * Establishes a new subscription using the `subscriptionFactory`. This subscription persists across renders, and is
 * destroyed when the component unmounts. Only being re-established if any of the dependencies change, destroying the
 * previous subscription in the process.
 */
export declare function useSubscription(subscriptionFactory: () => SubscriptionLike, dependencies: unknown[]): void;
