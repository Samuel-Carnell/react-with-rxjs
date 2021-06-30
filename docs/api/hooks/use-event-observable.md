---
title: useEventObservable
prev: false
next: false
---

## useEventObservable

Returns an observable of events (`events$`) and a function to emit a new event (`emit`).

```ts
function useEventObservable<TEvent>(): [events$: Observable<TEvent>, emit: Emit<TEvent>];
```

Like RxJS' [Subjects](https://rxjs.dev/api/index/class/Subject), whenever a new observer subscribes to the returned `event$` observable, the observer listens for new events to be emitted. The instance of the observable will also persist across the components lifecycle to avoid issue with consumer hooks subscribing to a new instance on each render.

### Example

Example with [useSubscription](/api/hooks/use-subscription).

```jsx
// Create an observable of click events and a function to emit a click event
const [click$, onClick] = useEventObservable();

// Listen for and log click events
useSubscription({
	next() {
		console.log('I was clicked');
	},
});

<button click={onClick} />;
```
