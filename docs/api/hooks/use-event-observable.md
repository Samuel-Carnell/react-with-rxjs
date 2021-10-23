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
