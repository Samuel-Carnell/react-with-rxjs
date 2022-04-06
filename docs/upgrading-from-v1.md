---
title: Upgrading from version 1
sidebar: false
---

# Upgrading from version 1

React with RxJS version 2 brings a major breaking changes, removing the previous hooks and replacing them with a single `bind` API.

This new bind API will, given a callback function, convert the arguments the hook was called with into observables, call the callback with those observables and bind any observables returned from the callback to the components state. The hook will then resolve and return the latest emitted from those observables.

To make switching easier below are examples of how you can recreate the functionality of hooks provided in version 1 using the new `bind` API. You can find more practical examples on how to use the new bind function [here](/examples/product-navigation).

### useStateObservable

```jsx
const useState = bind(() => {
	const state = new BehaviorSubject(1 /* initialValue */);
	const setState = (x) => state.next(x);
	return [state.asObservable(), setState];
});
```

### useObservableOf

```jsx
const useObservableOf = bind((value$) => {
	return [value$];
});
```

### useEventObservable

```jsx
const useEventObservable = bind(() => {
	const event = new Subject();
	const emit = (event) => event.next(event);
	return [event, emit];
});
```
