---
title: useSubscription
prev: false
next: false
---

## useSubscription

Establishes a new subscription using the `subscriptionFactory` which persists across renders, and is destroyed once
the component unmounts. Only being reestablished if any of the dependencies changes, in which the previous
subscription is destroyed.

```ts
function useSubscription(
	subscriptionFactory: () => SubscriptionLike,
	dependencies: unknown[]
): void;
```

This hook is designed for edge cases not covered by `useLatestValue` or `useIsComplete`.
