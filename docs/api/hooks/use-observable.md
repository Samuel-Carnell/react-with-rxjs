---
title: useObservable
prev: false
next: false
---

## useObservable

Uses the provided `observableFactory` to compute the returned observable. This observable persists across renders,
only being recomputed if any of values in the `dependencies` array change.

```ts
function useObservable<TObservable extends Observable<unknown>>(
	observableFactory: () => TObservable,
	dependencies: unknown[] = []
): TObservable;
```

This hook is essentially a observable specific version of `useMemo`, in that it will only recompute the observable value when one of the dependencies has changed. However, unlike `useMemo` it is guaranteed to always return the same observable reference if none of the dependencies have changed, never "forgetting" a previously computed observable. This is behavior is crucial as recreating the observable will cause any hooks which subscribe to it to established new subscription leading to unpredictable results.

:::tip
The dependencies array should be used to specify all closure variables the `observableFactory` uses.
:::

:::warning
Similar to the `useEffect` hook, if the length of the dependencies array changes between re-renders this hook will throw an Error.
:::
