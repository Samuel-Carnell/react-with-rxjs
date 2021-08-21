---
title: Core Concepts
---

# Core Concepts

## Push vs Pull

Historically, React uses a pull-based architecture. This means that when React needs to re-render, it will call the render function of every affected component. This will return a new representation of the UI, which React can reconcile with the previous one. Any changes are then propagated to the DOM.

This kind of behavior is called pull because the consumer (in this case, React), is the one that requests the new value.

On the other hand, RxJS uses a push-based approach, where you declaratively define streams and their relationships, and RxJS will propagate every change from one stream to the next one.

This is called push because now the producer of the state is responsible for pushing the new value over to those that are subscribed to it. This benefit of this is that only those entities that depend on the value that has changed will update, and it can be done without having to make comparisons or detect changes.

Not only can this approach significantly improve performance, it also makes state management more declarative, in a way that can be read top-to-bottom.

## Enhanced unidirectional data flow

Both React and RXJS are design with unidirectional data flow in mind. State is owned by some component or observable, which more complex data structures can be derived from. This process can be repeated multiple times until you eventually end up with a complete UI.

However unlike React, RXJS utilizes it's asynchronous nature to take this one step further. Take this example

```js
const selectedUserId$ = new Subject();
const selectedUser$ = selectedUserId$.pipe(
  mergeMap(userId => from(fetchUser(userId)))
);

selectedUser$.subscribe({ ... });
```

Given that RXJS uses a push based architecture, it doesn't matter when the selected user is returned, just that is pushed on to those that are subscribed to it. This contrasts with React in which the selected user would typically be store in the components state and, updated it through an effect running when the selected user id is updated.

## Concurrent mode safety

With the introduction of concurrent mode, React can work on several renders concurrently. These renders take an unpredictable amount of time to complete or can be abandoned completely.

To ensure this package is compatible with React concurrent mode, observables must be subscribed to as a side effect of the rendering process. So that only a single subscription is established after the render is committed to the screen.

The consequence of this is that the `useLatestValue` hook must return a default value on the initial render, even if the observable emits values synchronously. In cases where the source observable does emit values synchronously this hook will prevent any screen tearing, however it must still return a default value.
