![npm](https://img.shields.io/npm/v/react-with-rxjs?style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/samuel-carnell/react-with-rxjs/Publish%20Release?style=flat-square)
![npm bundle size](https://img.shields.io/bundlephobia/min/react-with-rxjs?style=flat-square)
![GitHub](https://img.shields.io/github/license/samuel-carnell/react-with-rxjs?style=flat-square)

# React with RxJS

> A single API for binding RXJS Observables to your React components.

## Install

```bash
npm install react-with-rxjs
```

## Usage

```tsx
const useTicks = bind(() => {
	return { tick: interval(100).pipe(take(1000)) };
});

function Ticks() {
	const { tick } = useTicks();
	return (
		<div style={{ textAlign: 'center' }}>
			<h2>Timer: {tick}</h2>
		</div>
	);
}
```

## Documentation

Full documentation can be found [here](https://samuel-carnell.github.io/react-with-rxjs-docs/)

## License

MIT License | Copyright (c) 2022 Samuel Carnell
