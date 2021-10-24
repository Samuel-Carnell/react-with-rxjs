import { useLayoutEffect } from 'react';
import { SubscriptionLike } from 'rxjs';

export function useSubscriptionInternal(
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
