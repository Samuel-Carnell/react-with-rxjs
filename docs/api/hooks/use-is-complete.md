---
title: useIsComplete
prev: false
next: false
---

## useIsComplete

Subscribes to `source$` and returns `true` if it has completed, otherwise false.

```ts
useIsComplete(source$: Observable<unknown>): boolean;
```

Like [useSubscription](/api/hooks/use-subscription) if the source observable changes in between re-renders this hook will automatically unsubscribe from the old observable and resubscribe to the new one.

```tip Concurrent mode safety
To make this hook concurrent mode safe the subscription is created after the component initially mounts, thus will always return `false` when called on the initial render. You can find out more about concurrent mode safety [here](/guide/core-concepts#concurrent-mode-safety).
```

:::tip Error Handling
Errors thrown by the source observable are treated as if thrown by the component, requiring a React error boundary to catch the error.
:::
