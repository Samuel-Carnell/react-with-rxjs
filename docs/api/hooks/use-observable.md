---
title: useObservable
---

## useObservable

```ts
function useObservable<TValue>(
	observableFactory: () => Observable<TValue>,
	dependencies: unknown[] = []
): Observable<TValue>;
```

Uses the provided `observableFactory` to compute the returned observable. This observable persists across renders, only being recomputed if any of the dependencies change.

**Type parameters:**

- `TValue` The type of the value emitted by observable returned from `observableFactory`.

**Parameters:**

- `observableFactory` Function to use to re/compute the returned observable.
- `dependencies` Optional. A list of dependencies used by `observableFactory` function.

**Returns:**

The observable produced by `observableFactory` function.
