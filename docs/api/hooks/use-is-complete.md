---
title: useIsComplete
prev: false
next: false
---

## useIsComplete

Subscribes to the given observable and returns `true` if its complete, otherwise `false` until it does complete. If the observable changes between renders this hook will unsubscribe from the previous observable and subscribe to the new observable, returning its current completed state.

```ts
useIsComplete(source$: Observable<unknown>): boolean;
```

:::tip Concurrent mode safety
To make this hook concurrent mode safe the subscription is created after the component initially mounts, thus will always return `false` when called on the initial render. You can find out more about concurrent mode safety [here](/guide/core-concepts#concurrent-mode-safety).
:::

:::tip Error Handling
Errors thrown by the source observable are treated as if thrown by the component, requiring a React error boundary to catch the error.
:::
