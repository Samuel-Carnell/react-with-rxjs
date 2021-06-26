---
title: useEventObservable
prev: false
next: false
---

## useEventObservable

Returns a observable of events (`events$`) and a function to emit a new event (`emit`).

```ts
function useEventObservable<TEvent>(): [events$: Observable<TEvent>, emit: Emit<TEvent>];
```

Similar to [useStateObservable](/api/hooks/use-state-observable) the returned `event$` observable will persist across the components lifecycle. Like a rxjs [Subject](https://rxjs.dev/api/index/class/Subject), it's values are multicasted amongst its observers.

### Example

Example with [useSubscription](/api/hooks/use-subscription)

```jsx
const [click$, onClick] = useEventObservable();
useSubscription({
	next() {
		console.log('I was clicked');
	},
});

<button click={onClick} />;
```
