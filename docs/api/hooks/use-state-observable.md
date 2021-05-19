---
title: useStateObservable
prev: false
next: false
---

## useStateObservable

Alternative to Reacts `useState` hook except the first value in the tuple returned is an observable representing the current state rather than the value, and will not trigger an update of the component.

```ts
function useStateObservable<TState>(
	initialState: TState | (() => TState)
): [state$: Observable<TState>, setState: (state: TState | ((value: TState) => TState)) => void];
```

Creates an observable of the current state (`state$`) and a function to set the current state (`setState`).

When `state$` is subscribed to, it will replay the current state to the subscriber, then emit the state when it is updated through calling `setState`.

The first argument passed to `setState` accepts the same signature to that of the `setState` function returned from Reacts `useState` hook. It can be either a value to set the current state to or a function to compute the current state from the previous state.

**Type parameters:**

- `TState` The type of state emitted by `state$` and the first parameter of `setState`.

**Parameters:**

- `initialState` A value to use as the initial state or a factory function to create the initial state.

**Returns:**

A tuple containing an observable of the current state (`state$`) and a function to set the current state (`setState`).
