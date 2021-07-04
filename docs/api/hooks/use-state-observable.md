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

Similar to RxJS' [BehaviorSubjects](https://rxjs.dev/api/index/class/BehaviorSubject) whenever a new observer subscribes to the returned `state$` observable, the observer immediately receives the current state, then listens for current state to be emitted when it's updated. The instance of the observable will also persist across the components lifecycle to avoid issues with consumer hooks subscribing to a new instance on each render.

This hook is designed to act as a direct alternative to React's [useState](https://reactjs.org/docs/hooks-reference.html#usestate) hook. Returning an observable of the current state instead of the state itself.

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
