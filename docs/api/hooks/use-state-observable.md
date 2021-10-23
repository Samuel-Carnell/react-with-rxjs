---
title: useStateObservable
prev: false
next: false
---

## useStateObservable

Returns an observable of the current state and a function to update the current state.

```ts
function useStateObservable<TState>(): [
	state$: Observable<TState | undefined>,
	setState: (state: TState | Operator<TState>) => void
];
function useStateObservable<TState>(
	initialState: TState | (() => TState)
): [state$: Observable<TState>, setState: (state: TState | Operator<TState>) => void];
```

This hook is designed to act as a direct alternative to React's [useState](https://reactjs.org/docs/hooks-reference.html#usestate) hook. Like the [useState](https://reactjs.org/docs/hooks-reference.html#usestate) hook a function can be passed to the hook to only compute the initial state on the first render, and a accumulator function can be passed to the `setState` function to compute the new state from the previous.

:::tip
Like React's [useState](https://reactjs.org/docs/hooks-reference.html#usestate) hook, this hook can be given an callback function to compute the initial state, that will only be called on the initial render. Along with this, the returned `setState` function can be called with a reducer function. This reducer function will be automatically called with the current state and the returned value will be used as the new state.
:::

:::tip Shorthand Alias
This hook can be called with the shorthand alias `useState$`.
:::

### Example

Example counter code with [useLatestValue](/api/hooks/use-latest-value).

```jsx
// Create an observable of the current value and a function to update it
const [count$, setCount] = useStateObservable(0);

// Yield the latest emitted value from count
const count = useLatestValue(count$);

<p>The current count is {count}</p>;
```
