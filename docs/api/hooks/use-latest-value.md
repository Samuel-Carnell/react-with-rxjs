---
title: useLatestValue
prev: false
next: false
---

## useLatestValue

Subscribes to the given observable, returning the latest emitted value and re-rendering the component when it emits a new value. If the observable changes between renders this hook will unsubscribe from the previous observable and subscribe to the new observable, but will return the last emitted value from the previous observable until the new observable emits a new value.

```ts
function useLatestValue<TValue>(source$: Observable<TValue>): TValue | undefined;
function useLatestValue<TValue>(source$: BehaviorSubject<TValue>): TValue;
```

:::tip Concurrent mode safety
To make this hook concurrent mode safe the subscription is created after the component initially mounts, thus will always return `undefined` when called on the initial render. BehaviorSubject subjects however can negate this, as they provide a `getValue` method for reading their current value. You can find out more about concurrent mode safety [here](/guide/core-concepts#concurrent-mode-safety).
:::

:::tip Error Handling
If an error is thrown by the source observable, then it will be treated as if thrown by the component during the rendering process. Thus requiring a React error boundary to catch the error.
:::

:::warning
Internally this hook uses the `useState` hook, as a result synchronous updates may be batched by React in order to reduce re-renders. In very rare cases this may cause unexpected results.

To prevent this the source observable must be modified so that the subscription creation and/or the notification delivery is performed asynchronously. This can be done by calling the `subscribeOn` operator and/or the `observeOn` operator with the `asyncScheduler`. You can find out more on RxJS' schedulers [here](https://rxjs.dev/guide/scheduler).
:::

### Example

Example counter code with [useStateObservable](/api/hooks/use-state-observable).

```jsx
// Create an observable of the current value and a function to update it
const [count$, setCount] = useStateObservable(0);

// Yield the latest emitted value from count
const count = useLatestValue(count$);

<p>The current count is {count}</p>;
```
