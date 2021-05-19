---
title: useSubject
prev: false
next: false
---

## useSubject

```ts
function useSubject<TValue>(
	subjectFactory: () => Subject<TValue>,
	dependencies: unknown[] = []
): Subject<TValue>;
```

Uses the provided `subjectFactory` to compute the returned subject. This subject persists across renders,
only being recomputed if any of the dependencies change.

**Type parameters:**

- `TValue` The type of the value emitted by the subject returned from `subjectFactory`.

**Parameters:**

- `subjectFactory` The function to use to re/compute the returned observable.
- `dependencies` A list of dependencies used by `subjectFactory` function.

**Returns:**

The subject produced by `subjectFactory` function.
