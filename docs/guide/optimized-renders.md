---
title: Optimized Renders
---

# Optimized renders

Everyone knows that React will rerender when state is updated. It's a reasonable assumption that if the state has changed then the UI will be changed as well. Although this isn't always the case. Components don't just declare the UI that should be render, they also schedule any work that needs to be done after the UI has rendered, also know as effects.

A state update can result in the same UI being generated but schedule side effects to run after. These side effects usually go on to perform some asynchronous task which cause another state update that that actually results in a UI change e.g calling an api when the component is mounted and storing the response in state.

This first render is quite wasteful, the UI hadn't changed and it only resulted in a side effect being scheduled.

React with RXJS directly addresses this issue of wasteful renders. By declaring streams of data, instead of state. These streams of data can be triggered by the same callbacks that would trigger state updates but more importantly they can go on to perform asynchronous tasks that then rerender the component when complete. Avoiding the first wasteful render, and only rendering when state that actually affects the UI has changed.
