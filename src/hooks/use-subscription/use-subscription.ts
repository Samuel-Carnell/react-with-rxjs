import { isFunction } from 'helpers';
import { useLayoutEffect } from 'react';
import { SubscriptionLike } from 'rxjs';

/**
 * Establishes a new subscription using the given `subscriptionFactory`. This subscription persists across renders, and
 * is destroyed when the component unmounts. If any of the dependencies change between render, the previous subscription
 * will be destroy and a new subscription established using the `subscriptionFactory`.
 */
export function useSubscription(
	subscriptionFactory: () => SubscriptionLike,
	dependencies: unknown[]
): void {
	if (!isFunction(subscriptionFactory)) {
		throw new TypeError(
			`${subscriptionFactory} is not a function. For argument subscriptionFactory in useSubscription`
		);
	}

	if (!Array.isArray(dependencies)) {
		throw new TypeError(
			`${dependencies} is not an Array. For argument dependencies in useSubscription`
		);
	}

	useLayoutEffect(() => {
		const subscription = subscriptionFactory();
		return () => {
			if (!subscription.closed) {
				subscription.unsubscribe();
			}
		};
	}, dependencies);
}
