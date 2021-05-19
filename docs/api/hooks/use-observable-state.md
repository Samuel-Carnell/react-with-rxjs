---
title: useObservableState
prev: false
next: false
---

## useObservableState

```ts
function useObservableState<TValue, TError = any>(
	observable: Observable<TValue>
): [TValue | undefined, TError | undefined, boolean];
```

Subscribes to `observable` and returns the latest value it emitted, the latest error it thrown, and a boolean representing if it has completed.

If `observable` changes between re-renders then this function subscribes to new observable, and disposes of the previous subscription.

**Type parameters:**

- `TValue` The type of the value emitted by `observable`.
- `TError` The type of error thrown by `observable`.

**Parameters:**

- `observable` The source observable to subscribe to

**Returns:**
A tuple containing the latest value it emitted by `observable`, the error thrown by `observable`, and a boolean representing if it has completed.
