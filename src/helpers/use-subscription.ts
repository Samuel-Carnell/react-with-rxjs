import { useEffect } from 'react';
import { SubscriptionLike } from 'rxjs';
import { useFactoryFunction } from './use-factory-function';

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
