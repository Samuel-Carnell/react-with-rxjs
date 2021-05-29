---
title: useObservableOf
prev: false
next: false
---

## useObservableOf

Returns an observable persisting across renders. Emitting `value` on the initial render, then emitting `value` again if it has changed in between re-renders.

```ts
function useObservableOf<TValue>(value: TValue): Observable<TValue>;
```

This hook is intended for creating observable from values that are returned from built-in or third party hooks that don't themselves return observables, such as `useContext`.

### Example

Below is an example of this hook's intended usage, using the `useParams` hook from [React Router](https://github.com/ReactTraining/react-router) and the `useObservable` hook.

```js
const { userId } = useParams();
const userId$ = useObservableOf(userId);
const user$ = useObservable(() => {
	return userId$.pipe(map((userId) => fetchUser(userId)));
}, [userId$]);
```

:::tip Comparison checking
Internally this hook uses the `Object.is` function to compare the old and new value, determining if it has changed between re-renders.
:::
