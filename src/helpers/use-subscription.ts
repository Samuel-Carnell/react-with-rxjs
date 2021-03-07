import { useLayoutEffect } from 'react';
import { SubscriptionLike } from 'rxjs';

/**
 * Uses the provided `subscriptionFactory` to compute the returned subscription. This subscription will only being
 * recomputed if any of the dependencies change, and the pre-existing subscription will be disposed of.
 * @typeParam TSubscription The type of value produced by the `subscriptionFactory`.
 * @param subscriptionFactory Function to use to re/compute the returned subscription.
 * @param dependencies A list of dependencies used by the `subscriptionFactory` function.
 */
export function useSubscription<TSubscription extends SubscriptionLike>(
	subscriptionFactory: () => TSubscription,
	dependencies: unknown[]
): void {
	useLayoutEffect(() => {
		const subscription = subscriptionFactory();
		return () => {
			if (!subscription.closed) {
				subscription.unsubscribe();
			}
		};
	}, dependencies);
}
