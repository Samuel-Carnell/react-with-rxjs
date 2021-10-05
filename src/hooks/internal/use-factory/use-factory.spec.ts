import { useFactory } from './use-factory';
import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';

type useFactoryFunctionParams = Parameters<typeof useFactory>;
type useFactoryFunctionReturn = ReturnType<typeof useFactory>;

function renderUseFactoryFunctionHook(
	initialParams: useFactoryFunctionParams
): RenderHookResult<
	useFactoryFunctionParams,
	useFactoryFunctionReturn,
	Renderer<useFactoryFunctionParams>
> {
	return renderHook((params: useFactoryFunctionParams) => useFactory(...params), {
		initialProps: initialParams,
	});
}

describe('useFactory', () => {
	it('calls the factoryFunction', () => {
		const mockFactory = jest.fn();
		renderUseFactoryFunctionHook([mockFactory, []]);
		expect(mockFactory).toHaveBeenCalled();
	});

	it('returns the same value returned from the factoryFunction callback', () => {
		const mockValueFactory = jest.fn().mockReturnValue(1);
		const { result } = renderUseFactoryFunctionHook([mockValueFactory, []]);
		expect(result.current).toBe(1);
	});

	it('returns the object reference returned from the factoryFunction callback', () => {
		const object = {};
		const mockValueFactory = jest.fn().mockReturnValue(object);
		const { result } = renderUseFactoryFunctionHook([mockValueFactory, []]);
		expect(result.current).toBe(object);
	});

	it('calls the factoryFunction callback once when called with the same dependency array multiple times', () => {
		const dependencies = ['test'];
		const mockValueFactory = jest.fn().mockReturnValue(null);
		const { rerender } = renderUseFactoryFunctionHook([mockValueFactory, dependencies]);
		rerender([mockValueFactory, dependencies]);
		rerender([mockValueFactory, dependencies]);
		rerender([mockValueFactory, dependencies]);
		expect(mockValueFactory).toHaveBeenCalledTimes(1);
	});

	it('calls the factoryFunction callback once when called multiple times with a new dependency array containing the same object reference', () => {
		const object = {};
		const mockValueFactory = jest.fn().mockReturnValue(null);
		const { rerender } = renderUseFactoryFunctionHook([mockValueFactory, [object]]);
		rerender([mockValueFactory, [object]]);
		rerender([mockValueFactory, [object]]);
		rerender([mockValueFactory, [object]]);
		expect(mockValueFactory).toHaveBeenCalledTimes(1);
	});

	it('calls the factoryFunction callback once when called multiple times with a new dependency array containing the same value', () => {
		const mockValueFactory = jest.fn().mockReturnValue(null);
		const { rerender } = renderUseFactoryFunctionHook([mockValueFactory, [1]]);
		rerender([mockValueFactory, [1]]);
		rerender([mockValueFactory, [1]]);
		rerender([mockValueFactory, [1]]);
		expect(mockValueFactory).toHaveBeenCalledTimes(1);
	});

	it('returns the latest result returned from the factoryFunction callback when the dependencies have changed', () => {
		const { rerender, result } = renderUseFactoryFunctionHook([
			jest.fn().mockReturnValue('a'),
			[1],
		]);
		rerender([jest.fn().mockReturnValue('b'), [2]]);
		rerender([jest.fn().mockReturnValue('c'), [3]]);
		expect(result.current).toBe('c');
	});

	it('does not use loose equality when checking if the dependencies have changed', () => {
		const mockValueFactory = jest.fn().mockReturnValue(null);
		const { rerender } = renderUseFactoryFunctionHook([mockValueFactory, [1]]);
		rerender([mockValueFactory, ['1']]);
		expect(mockValueFactory).toHaveBeenCalledTimes(2);
	});

	it('recalls the factoryFunction when the dependencies change', () => {
		const mockFactoryFunction = jest.fn().mockReturnValue(1);
		const { rerender } = renderUseFactoryFunctionHook([mockFactoryFunction, ['a']]);
		rerender([mockFactoryFunction, ['b']]);
		expect(mockFactoryFunction).toHaveBeenCalledTimes(2);
	});

	it('calls the factoryFunction twice when called twice with [{ a: 1 }], then [{ a: 1 }]', () => {
		const mockValueFactory = jest.fn().mockReturnValue(null);
		const { rerender } = renderUseFactoryFunctionHook([mockValueFactory, [{ a: 1 }]]);
		rerender([mockValueFactory, [{ a: 1 }]]);
		expect(mockValueFactory).toHaveBeenCalledTimes(2);
	});

	it('calls the factoryFunction 4 times when called with [1], [2], [1], [2]', () => {
		const mockValueFactory = jest.fn().mockReturnValue(null);
		const { rerender } = renderUseFactoryFunctionHook([mockValueFactory, [1]]);
		rerender([mockValueFactory, [2]]);
		rerender([mockValueFactory, [1]]);
		rerender([mockValueFactory, [2]]);
		expect(mockValueFactory).toHaveBeenCalledTimes(4);
	});
});
