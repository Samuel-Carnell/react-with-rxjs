---
title: useContextObservable
prev: false
next: false
---

## useContextObservable

Returns an observable of the current value for the given context.

```ts
function useContextObservable<T>(context: Context<T>): Observable<T>;
```

This hook is essentially an observable version of Reacts' `useContext` hook.

:::tip Shorthand Alias
This hook can be called with the shorthand alias `useContext$`.
:::
