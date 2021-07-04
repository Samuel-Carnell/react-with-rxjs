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

This hook will return an observable which emits `value` on the initial render, then on subsequent re-renders will check if value has changed between the current and previous render, emitting the updated `value` if it has. Similar to RxJS' [BehaviorSubjects](https://rxjs.dev/api/index/class/BehaviorSubject) whenever a new observer subscribes to the observable, the observer immediately receives the last emitted `value`, then listens for new values to be emitted. The instance of the created observable will also persist across the components lifecycle to avoid issues with consumer hooks subscribing to a new instance on each render.

This hook is intended for creating observable from values that are returned from built-in or third party hooks that don't themselves return observables, such as `useContext`.

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
