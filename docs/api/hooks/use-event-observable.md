---
title: useEventObservable
prev: false
next: false
---

## useEventObservable

Returns an observable of events and a function to emit a new event.

```ts
function useEventObservable<TEvent>(): [events$: Observable<TEvent>, emit: Emit<TEvent>];
```

:::tip Shorthand Alias
This hook can be called with the shorthand alias `useEvent$`.
:::
