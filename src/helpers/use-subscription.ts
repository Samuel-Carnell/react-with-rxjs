import { useLayoutEffect } from 'react';
import { Subscription, SubscriptionLike } from 'rxjs';

function hasTypeOfProperty(obj: {}, propertyName: string, propertyType: string) {
	return propertyName in obj && typeof obj[propertyName] === propertyType;
}

function isSubscriptionLike(value: unknown): value is SubscriptionLike {
	return (
		typeof value === 'object' &&
		!!value &&
		(value instanceof Subscription ||
			(hasTypeOfProperty(value, 'unsubscribe', 'function') && hasTypeOfProperty(value, 'closed', 'boolean')))
	);
}

/**
 * Uses the provided `subscriptionFactory` to compute the returned subscription.
 * This subscription will only being recomputed if any of the dependencies change, and the pre-existing subscription
 * will be asynchronously disposed of.
 * @typeParam TSubscription The type of value produced by the `subscriptionFactory`.
 * @param subscriptionFactory Function to use to re/compute the returned subscription.
 * @param dependencies A list of dependencies used by the `subscriptionFactory` function.
 * @returns The subscription produced by the `subscriptionFactory`.
 */
export function useSubscription<TSubscription extends SubscriptionLike>(
	subscriptionFactory: () => TSubscription,
	dependencies: unknown[]
): void {
	if (!Array.isArray(dependencies)) {
		throw new TypeError(`${dependencies} is an Array. For argument input in useSubscription`);
	}

	useLayoutEffect(() => {
		const subscription = subscriptionFactory();
		if (!isSubscriptionLike(subscription)) {
			throw new TypeError(
				`${subscription} is not a subscription. For return value of argument subscriptionFactory in useSubscription`
			);
		}

		return () => {
			if (!subscription.closed) {
				subscription.unsubscribe();
			}
		};
	}, dependencies);
}
