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
