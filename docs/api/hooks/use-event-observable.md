---
title: useEventObservable
prev: false
next: false
---

## useEventObservable

```ts
function useEventObservable<TEvent>(): [event$: Observable<TEvent>, emit: Emit<TEvent>];
```

Creates an observable of events (`event$`) and a function to emit a new event (`emit`).

Whenever the `emit` is called, `event$` will emit the event passed.

**Type parameters:**

- `TEvent` The type of event emitted by `event$` and the first parameter of `emit`.

**Returns:**

A tuple containing an observable of events (`event$`) and a function to emit a new event (`emit`).

### useObservable

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
