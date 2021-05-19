import { useLayoutEffect } from 'react';
import { SubscriptionLike } from 'rxjs';

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
