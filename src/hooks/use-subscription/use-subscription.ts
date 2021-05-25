import { useLayoutEffect } from 'react';
import { SubscriptionLike } from 'rxjs';

/**
 * Establishes a new subscription using the `subscriptionFactory` which persists across renders, and is destroyed once
 * the component unmounts. Only being reestablished if any of the dependencies changes, in which the previous
 * subscription is destroyed.
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
