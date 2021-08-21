---
title: useObservable
prev: false
next: false
---

## useObservable

Uses the provided `observableFactory` to compute the returned observable. This observable persists across renders, only being recomputed if any values in the `dependencies` array change.

```ts
function useObservable<TObservable extends Observable<unknown>>(
	observableFactory: () => TObservable,
	dependencies: unknown[] = []
): TObservable;
```

This hook is essentially an observable specific version of `useMemo`, in that it will only recompute the observable when the dependencies have changed. However, unlike `useMemo` it is guaranteed to always return the same observable instance if none of the dependencies have changed, never "forgetting" a previously computed observable. This is behaviour is crucial as recreating the observable will cause any hooks which subscribes to it to establish a new subscription leading to unpredictable results.

:::tip
The dependencies array should be used to specify all closure variables the `observableFactory` uses.
:::

:::warning
Similar to the `useEffect` hook, if the length of the dependencies array changes between re-renders this hook will throw an Error.
:::

### Example

```js
// Create a new observable which maps userId to a user object
const user$ = useObservable(() => {
	return userId$.pipe(map((userId) => fetchUser(userId)));
}, [userId$]);
```
