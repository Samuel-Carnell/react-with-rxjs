---
title: useStateObservable
---

## useStateObservable

```ts
function useStateObservable<TState>(
	initialState: TState | () => T
): [state$: Observable<TState>, setState: (state: T | (value: T) => T) => void];
```

Alternative to Reacts `useState` hook except the first value in the tuple returned is an observable representing the current state rather than the value, and will not trigger an update of the component.

Returns observable of the current state (`state$`) and a function to set the current state (`setState`).

When `state$` is subscribed to, it will replay the current state to the subscriber, then re-emit the current state when it is updated.

The first argument passed to `setState` accepts the same signature to that of the `setState` function returned from Reacts `useState` hook. It can be either a value to set the current state to or a function to compute the current state from the previous state.

**Type parameters:**

- `TState` The type of state emitted by the returned observable and the first parameter of the setState function.

**Parameters:**

- `initialState` A value to use as the initial state or a factory function to create the initial state.

**Returns:**

A tuple containing an observable of the current state (`state$`) and a function to set the current state (`setState`).
