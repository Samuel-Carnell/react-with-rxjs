---
title: useSubscription
prev: false
next: false
---

## useSubscription

Establishes a new subscription using the `subscriptionFactory`. This subscription persists across renders, and is destroyed when the component unmounts. Only being re-established if any of the dependencies change, destroying the previous subscription in the process.

```ts
function useSubscription(
	subscriptionFactory: () => SubscriptionLike,
	dependencies: unknown[]
): void;
```

This hook is useful in scenarios where you need to pass a custom observer to the subscription.

To make this hook concurrent mode safe the `subscriptionFactory` will be called after the component initially mounts. You can find out more about concurrent mode safety [here](/guide/core-concepts#concurrent-mode-safety).

:::tip
Before using this hook check that your use case isn't already covered by [useLatestValue](/api/hooks/use-latest-value) or [useIsComplete](/api/hooks/use-is-complete).
:::

:::warning
Similar to the `useEffect` hook, the length of the dependencies array should stay the same across re-renders. Changes in the length of the array could lead to unpredictable results.
:::

### Example

Example with [useEventObservable](/api/hooks/use-event-observable).

```jsx
// Create an observable of click events and a function to emit a click event
const [click$, onClick] = useEventObservable();

// Listen for and log click events
useSubscription({
	next() {
		console.log('I was clicked');
	},
});

<button click={onClick} />;
```
