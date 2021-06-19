---
title: useIsComplete
prev: false
next: false
---

## useIsComplete

Subscribes to `source$` and returns true if it has completed, otherwise false.

```ts
useIsComplete(source$: Observable<unknown>): boolean;
```

Like [useSubscription](/api/hooks/use-subscription) if the source observable changes in between re-renders this hook will automatically unsubscribe from the old observable and resubscribe to the new one.

If the source observable changes in between re-renders this hook will automatically unsubscribe from the old observable and resubscribe to the new one.

To make this hook concurrent mode safe the subscription is created after the component initially mounts, thus will always return `false` when called on the initial render. You can find out more about concurrent mode safety [here](/guide/core-concepts#concurrent-mode-safety).

:::tip Error Handling
If an error is thrown by the source observable, then it will be treated as if thrown by the component during the rendering process. Thus requiring a React error boundary to catch the error.
:::
