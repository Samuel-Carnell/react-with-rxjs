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

If the source observables changes between re-renders this hook will automatically unsubscribe from the old observable and resubscribe to the new one.

This hook is useful in cases where a component needs to be conditionally rendered, such as a loading spinner, dependant on if the source observable is complete.

To make this hook concurrent mode safe the subscription is created after the component initially mounts, thus will always return `false` on the initial render. You can find out more about concurrent mode safety [here](/guide/core-concepts#concurrent-mode-safety).

:::tip Error Handling
If an error is thrown by the source observable then it will be treated as if thrown by the component during the rendering process. Thus requiring a React error boundary to catch the error.
:::

:::warning
Because internally this hook uses the `useState` hook, synchronous updates may be batched by React in order to reduce re-renders. In very rare cases this may cause unexpected results.

To prevent this the source observable must be modified so that the subscription creation and/or the notification delivery are performed asynchronously. This can be done by calling the `subscribeOn` operator and/or the `observeOn` operator with the `asyncScheduler`. You can find out more on RxJS schedulers [here](https://rxjs.dev/guide/scheduler).
:::
