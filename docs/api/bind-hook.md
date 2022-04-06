---
title: BindHook
---

# BindHook

Creates a hook that returns a copy of the object/array returned by the `getState` function, resolving any observables properties to their latest emitted value (or undefined until the observable emits a value). If the hook is called with any arguments those arguments will be converted into observables that replay their current value and emit if the argument has changed between renders. These observables are then passed along to the getState function.

```ts
function bindHook<
	T extends {} | unknown[] | [],
	P extends Observable<unknown>[]
>(getState: (...params: P) => T): UseCurrentState<T, P>;
```

::: warning Non synchronous values
If any of the observables returned from the `getState` function do not emit a value synchronously at subscription time, then it value will be returned as undefined for the first render.
:::

::: warning Errors
If any of the observables returned from the `getState` function throw an error then that error will be caught and re thrown by the component during rendering.
:::

## Example

In this example the `useClickCounter` hook will return both the `onClick` property and the current value emitted by the `count` observable. When the `onClick` function is called the `count` observable will emit a new value, causing the component to re render and the hook to return the new value of `count` on the next render.

```tsx
const useClickCounter = bindHook(() => {
	const clicks$ = new Subject();
	return {
		onClick: () => clicks$.next(),
		count: clicks$.pipe(scan((acc) => acc++, 0)),
	};
});

function MyComponent() {
	const { onClick, count } = useClickCounter();
	return <div onClick={onClick}>{count}</div>;
}
```

## Example with inputs

Here the `value$` prop will be emit the argument the hook is first called with, then again when the value of that argument changes. The hook will then return a debounced version of that value. On the initial render however it will returned undefined, this is because the observable will not emit the debounced value until after 300ms of the initial render.

```tsx
const useDebounce = bindHook((value$) => {
	return { debouncedValue: value$.pipe(debounceTime(300)) };
});

function MyComponent({ someProp }) {
	const { debouncedValue: debouncedProp } = useDebounce(someProp);
	return <div>{debouncedProp}</div>;
}
```
