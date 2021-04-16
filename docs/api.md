---
title: API Reference
sidebarDepth: 3
sidebar: auto
---

# API Reference

[[toc]]

## Hooks

### useEventObservable

```ts
function useEventObservable<TEvent>(): [event$: Observable<TEvent>, emit: Emit<TEvent>];
```

Creates an observable of events (`event$`) and a function to emit a new event (`emit`).

Whenever the `emit` is called, `event$` will emit the event passed.

**Type parameters:**

- `TEvent` The type of event emitted by `event$` and the first parameter of `emit`.

**Returns:**

A tuple containing an observable of events (`event$`) and a function to emit a new event (`emit`).

### useObservable

```ts
function useObservable<TValue>(
	observableFactory: () => Observable<TValue>,
	dependencies: unknown[] = []
): Observable<TValue>;
```

Uses the provided `observableFactory` to compute the returned observable. This observable persists across renders, only being recomputed if any of the dependencies change.

**Type parameters:**

- `TValue` The type of the value emitted by observable returned from `observableFactory`.

**Parameters:**

- `observableFactory` Function to use to re/compute the returned observable.
- `dependencies` Optional. A list of dependencies used by `observableFactory` function.

**Returns:**

The observable produced by `observableFactory` function.

### useStateObservable

Alternative to Reacts `useState` hook except the first value in the tuple returned is an observable representing the current state rather than the value, and will not trigger an update of the component.

```ts
function useStateObservable<TState>(
	initialState: TState | (() => TState)
): [state$: Observable<TState>, setState: (state: TState | ((value: TState) => TState)) => void];
```

Creates an observable of the current state (`state$`) and a function to set the current state (`setState`).

When `state$` is subscribed to, it will replay the current state to the subscriber, then emit the state when it is updated through calling `setState`.

The first argument passed to `setState` accepts the same signature to that of the `setState` function returned from Reacts `useState` hook. It can be either a value to set the current state to or a function to compute the current state from the previous state.

**Type parameters:**

- `TState` The type of state emitted by `state$` and the first parameter of `setState`.

**Parameters:**

- `initialState` A value to use as the initial state or a factory function to create the initial state.

**Returns:**

A tuple containing an observable of the current state (`state$`) and a function to set the current state (`setState`).

### useValueObservable

```ts
function useValueObservable<TValue>(value: TValue): Observable<TValue>;
```

Returns a observable which watches `value` and emits `value` whenever it changes between re-renders.

This is useful for converting raw values returned from other hooks such as `useContext`, into observables of those
values.

**Type parameters:**

- `TValue` The type of value to watch.

**Parameters:**

- `value` The value to watch, and emit when the component mounts, then when `value` changes.

**Returns:**
Returns a observable which watches `value` and emits `value` whenever it changes between re-renders.
. This observable will replay the latest `value` when subscribed to, and complete when the component is unmounted.
