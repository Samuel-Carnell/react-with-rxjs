import { useLayoutEffect } from 'react';
import { SubscriptionLike } from 'rxjs';

/**
 * Establishes a new subscription using the `subscriptionFactory`. This subscription persists across renders, and is
 * destroyed when the component unmounts. Only being reestablished if any of the dependencies change,
 * destroying the previous subscription in the process.
 */
export function useSubscription(
	subscriptionFactory: () => SubscriptionLike,
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
