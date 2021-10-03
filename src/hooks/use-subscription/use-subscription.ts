import { isFunction } from 'helpers';
import { useLayoutEffect } from 'react';
import { SubscriptionLike } from 'rxjs';

/**
 * Establishes a new subscription using the `subscriptionFactory`. This subscription persists across renders, and is
 * destroyed when the component unmounts. Only being re-established if any of the dependencies change, destroying the
 * previous subscription in the process.
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
