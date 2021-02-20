import { useEffect } from 'react';
import { SubscriptionLike } from 'rxjs';
import { useFactoryFunction } from './use-factory-function';

/**
 * Uses the provided `subscriptionFactory` to compute the returned subscription.
 * This subscription will only being recomputed if any of the dependencies change, and the pre-existing subscription
 * will be asynchronously disposed of.
 * @typeParam TSubscription The type of value produced by the `subscriptionFactory`.
 * @param subscriptionFactory Function to use to re/compute the returned subscription.
 * @param dependencies Optional. A list of dependencies used by the `subscriptionFactory` function.
 * @returns The subscription produced by the `subscriptionFactory`.
 */
export function useSubscription<TSubscription extends SubscriptionLike>(
	subscriptionFactory: () => TSubscription,
	dependencies: unknown[]
): TSubscription {
	const subscription = useFactoryFunction(subscriptionFactory, dependencies);

	useEffect(() => {
		return () => {
			if (!subscription.closed) {
				subscription.unsubscribe();
			}
		};
	}, [subscription]);

	return subscription;
}
