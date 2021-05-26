---
title: useSubscription
prev: false
next: false
---

## useSubscription

Establishes a new subscription using the `subscriptionFactory`. This subscription persists across renders, and is destroyed when the component unmounts. Only being reestablished if any of the dependencies changes, destroying the previous subscription in the process.

```ts
function useSubscription(
	subscriptionFactory: () => SubscriptionLike,
	dependencies: unknown[]
): void;
```

This hook is useful in scenarios where you need to pass a custom observer to the subscription.

To make this hook concurrent mode safe the `subscriptionFactory` will be called after the component initially mounts. You can find out more about concurrent mode safety [here](/guide/core-concepts#concurrent-mode-safety).

:::tip
Before using this hook check that your use case isn't already covered `useLatestValue` or `useIsComplete`.
:::

:::warning
Similar to the `useEffect` hook, then length of the dependencies array should stay the same across re-renders. Changes in the length of the array could lead to un-predictable results.
:::
