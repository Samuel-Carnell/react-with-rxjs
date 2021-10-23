---
title: useSubscription
prev: false
next: false
---

## useSubscription

Establishes a new subscription using the given `subscriptionFactory`. This subscription persists across renders, and is destroyed when the component unmounts. If any of the dependencies change between render, the previous subscription will be destroy and a new subscription established using the `subscriptionFactory`.

```ts
function useSubscription(
	subscriptionFactory: () => SubscriptionLike,
	dependencies: unknown[]
): void;
```

:::tip Concurrent mode safety
To make this hook concurrent mode safe the `subscriptionFactory` will be called after the component initially mounts. You can find out more about concurrent mode safety [here](/guide/core-concepts#concurrent-mode-safety).
:::

:::tip
Before using this hook check that your use case isn't already covered by [useLatestValue](/api/hooks/use-latest-value) or [useIsComplete](/api/hooks/use-is-complete).
:::

:::warning
Similar to the `useEffect` hook, the length of the dependency array should stay the same across re-renders. Changes in the length of the array could lead to unpredictable results.
:::
