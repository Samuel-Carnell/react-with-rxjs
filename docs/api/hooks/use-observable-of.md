---
title: useObservableOf
prev: false
next: false
---

## useObservableOf

Returns an observable of distinct values passed, with this hook checking if the value has changed on each render.

```ts
function useObservableOf<TValue>(value: TValue): Observable<TValue>;
```

This hook is intended for converting raw values returned from other hooks into observable of those values, emitting each time the raw value changes.

:::tip Comparison checking
Internally this hook uses the `Object.is` function to compare the old and new values, determining if it has changed between re-renders.
:::

### Example

Example using the `useParams` hook from [React Router](https://github.com/ReactTraining/react-router) and the [useObservable](/api/hooks/use-observable) hook.

```js
const { userId } = useParams();

// Convert userId into observable of userId
const userId$ = useObservableOf(userId);

// Create a new observable which maps userId to a user object
const user$ = useObservable(() => {
	return userId$.pipe(map((userId) => fetchUser(userId)));
}, [userId$]);
```
