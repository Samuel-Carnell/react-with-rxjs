import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { useHasInputChanged } from './use-has-input-changed';

type useHasInputChangedParams = Parameters<typeof useHasInputChanged>;
type useHasInputChangedReturn = ReturnType<typeof useHasInputChanged>;

function renderUseHasInputChangedHook(
	initialParams: useHasInputChangedParams
): RenderHookResult<
	useHasInputChangedParams,
	useHasInputChangedReturn,
	Renderer<useHasInputChangedParams>
> {
	return renderHook((params: useHasInputChangedParams) => useHasInputChanged(...params), {
		initialProps: initialParams,
	});
}

describe('useHasInputChanged', () => {
	it('returns false when called on the first render', () => {
		const { result } = renderUseHasInputChangedHook([[]]);
		expect(result.current).toBe(false);
	});

	it('returns false when called twice with an array containing the same value', () => {
		const { result, rerender } = renderUseHasInputChangedHook([['test']]);
		rerender([['test']]);
		rerender([['test']]);
		rerender([['test']]);
		expect(result.current).toBe(false);
	});

	it('returns false when called multiple times with arrays containing the same object reference', () => {
		const object = {};
		const { result, rerender } = renderUseHasInputChangedHook([[object]]);
		rerender([[object]]);
		rerender([[object]]);
		rerender([[object]]);
		expect(result.current).toBe(false);
	});

	it('returns true when called twice with arrays containing different values', () => {
		const { result, rerender } = renderUseHasInputChangedHook([['a']]);
		rerender([['b']]);
		expect(result.current).toBe(true);
	});

	it('returns true when called twice with arrays containing different objects with the same keys and values ', () => {
		const { result, rerender } = renderUseHasInputChangedHook([[{ a: 'test' }]]);
		rerender([[{ a: 'test' }]]);
		expect(result.current).toBe(true);
	});

	it('does not use loose equality when checking if the input has changed', () => {
		const { result, rerender } = renderUseHasInputChangedHook([[1]]);
		rerender([['1']]);
		expect(result.current).toBe(true);
	});

	it('returns false when called with an array containing "a", then twice with an array containing "b"', () => {
		const { result, rerender } = renderUseHasInputChangedHook([['a']]);
		rerender([['b']]);
		rerender([['b']]);
		expect(result.current).toBe(false);
	});

	it('returns true when called 4 times with alternating values', () => {
		const { rerender, result } = renderUseHasInputChangedHook([[1]]);
		rerender([[2]]);
		rerender([[1]]);
		rerender([[2]]);
		expect(result.current).toBe(true);
	});

	it('calls console.error when called with arrays of different lengths, and the app is in development mode', () => {
		const originalNodeEnv = process?.env?.NODE_ENV;
		process.env.NODE_ENV = 'development';

		// Using jest.fn rather than jest.spyOn to prevent the actual console.error method from being called
		console.error = jest.fn();
		const { rerender } = renderUseHasInputChangedHook([['test']]);
		rerender([[]]);

		expect(console.error).toHaveBeenCalled();

		process.env.NODE_ENV = originalNodeEnv;
	});

	it('does not call console.error when called with arrays of the same length, and the app is in development mode', () => {
		const originalNodeEnv = process?.env?.NODE_ENV;
		process.env.NODE_ENV = 'development';

		// Using jest.fn rather than jest.spyOn to prevent the actual console.error method from being called
		console.error = jest.fn();
		const { rerender } = renderUseHasInputChangedHook([['test']]);
		rerender([['test2']]);

		expect(console.error).not.toHaveBeenCalled();

		process.env.NODE_ENV = originalNodeEnv;
	});

	it('does not call console.error when called with arrays of different lengths, but the app is in production mode', () => {
		const originalNodeEnv = process?.env?.NODE_ENV;
		process.env.NODE_ENV = 'production';

		// Using jest.fn rather than jest.spyOn to prevent the actual console.error method from being called
		console.error = jest.fn();
		const { rerender } = renderUseHasInputChangedHook([['test']]);
		rerender([[]]);

		expect(console.error).not.toHaveBeenCalled();

		process.env.NODE_ENV = originalNodeEnv;
	});
});
