---
title: useValueObservable
prev: false
next: false
---

## useValueObservable

```ts
function useValueObservable<TValue>(value: TValue): Observable<TValue>;
```

Returns a observable which watches `value` and emits `value` whenever it changes between re-renders.

This is useful for converting raw values returned from other hooks such as `useContext`, into observables of those
values.

**Type parameters:**

- `TValue` The type of value to watch.

**Parameters:**

- `value` The value to watch, and emit when the component mounts, then when `value` changes.

**Returns:**
Returns a observable which watches `value` and emits `value` whenever it changes between re-renders.
. This observable will replay the latest `value` when subscribed to, and complete when the component is unmounted.
