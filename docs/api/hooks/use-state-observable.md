---
title: useStateObservable
prev: false
next: false
---

## useStateObservable

Returns an observable of the current state (`state$`) and a function to update the current state (`setState`).

```ts
function useStateObservable<TState>(): [
	state$: Observable<TState | undefined>,
	setState: (state: TState | Operator<TState>) => void
];
function useStateObservable<TState>(
	initialState: TState | (() => TState)
): [state$: Observable<TState>, setState: (state: TState | Operator<TState>) => void];
```

The `state$` observable will replay the current state when subscribed, then re emit the current state when it is updated.

This is designed to act as a direct alternative to React's `useState` hook. Returning an observable of the current state instead of the state its self.

:::tip
Like React's `useState` hook, this hook can be given a callback function to compute the initial state, that will only be called on the initial render. Along with this, the returned `setState` function can be called with a reducer function. This reducer function will be automatically called with the current state and the returned value will be used as the new state.
:::

:::tip Shorthand Alias
This hook can be called with the shorthand alias `useState$`.
:::
