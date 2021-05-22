---
title: useObservable
prev: false
next: false
---

## useIsComplete

Subscribes to `source$` and returns true if it has completed, otherwise false.

```ts
useIsComplete(source$: Observable<unknown>): boolean
```

This hook is useful in cases where a component needs to be conditionally rendered, such as a loading spinner, dependant on if the source observable is complete.

:::warning
This will always return `false` on the initial render as the source observable will not yet be subscribed to. This behavior can be avoided be passing a `ResourceObservable` instead, which will suspend the rendering of the component until the observable has emitted an initial value.
:::

:::warning
Because this hook relies on the `useState` hook, React may batch synchronous updates in order to reduce re-renders. In rare cases this may cause unexpected results.

To prevent this the source observable must be modified so that the subscription creation and/or the notification delivery are performed asynchronously. This can be done by calling the `subscribeOn` operator and/or the `observeOn` operator with the `asyncScheduler`. You can find out more on RxJS schedulers here.
:::
