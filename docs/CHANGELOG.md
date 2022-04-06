# Changelog

## 2.0.0 (2022-04-06)

### ⚠ BREAKING CHANGES

* Removes the existing hooks and adds a new bind API.  This new bind API will, 
given a callback function, convert the arguments the hook was called with into observable, call the
callback with those observables and bind any observables returned from the callback to the
components state. The hook will then resolve and return the latest emitted from those observables.

### Features

* replaces hooks with bind api ([e176941](https://github.com/Samuel-Carnell/react-with-rxjs/commit/e176941440f6f4fffe07995d851bbc490fb8f824))

## 1.2.1 (2021-11-20)

## 1.2.0 (2021-10-24)

### Features

* adds a useContextObservable ([de4bedb](https://github.com/Samuel-Carnell/react-with-rxjs/commit/de4bedbdfb2d6499855d145f9ab646d1eeea1604))
* **useEventObservable:** adds a shorthand alias ([b1f76f7](https://github.com/Samuel-Carnell/react-with-rxjs/commit/b1f76f717c8bf3ecde4551bc67e8cab101c49cb0))


### Bug Fixes

* export useLatestValue ([455747f](https://github.com/Samuel-Carnell/react-with-rxjs/commit/455747ff9970abe707b170a6560b73968c9a90c4))

## 1.1.1 (2021-10-05)

### Bug Fixes

* **useObservable:** add run time checking to arguments ([4cda516](https://github.com/Samuel-Carnell/react-with-rxjs/commit/4cda51629d576c9151e894342541d25b080b5000))
* **useSubscription:** add run time type checking to arguments ([1fab7f4](https://github.com/Samuel-Carnell/react-with-rxjs/commit/1fab7f4b55763bd209043bc7542c634d2792ca87))
