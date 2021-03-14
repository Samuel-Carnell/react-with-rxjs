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
	it.each`
		value
		${1}
		${'test'}
		${{}}
		${[9999999]}
		${Symbol('test')}
		${function* generator() {}}
		${new Date()}
	`('returns the $value produced by the factoryFunction callback', ({ value }) => {
		const mockValueFactory = jest.fn().mockReturnValue(value);
		const { result } = renderUseFactoryFunctionHook([mockValueFactory, []]);
		expect(result.current).toBe(value);
	});

	it('calls the factoryFunction callback once when called with no dependencies', () => {
		const value = 'test';
		const mockValueFactory = jest.fn().mockReturnValue(value);
		const { rerender } = renderUseFactoryFunctionHook([mockValueFactory, []]);
		rerender([mockValueFactory, []]);
		rerender([mockValueFactory, []]);
		rerender([mockValueFactory, []]);
		expect(mockValueFactory).toHaveBeenCalledTimes(1);
	});

	it.each`
		dependencies
		${[]}
		${[1]}
		${[() => {}]}
		${[[]]}
		${[Number.POSITIVE_INFINITY]}
		${['test']}
		${[{}]}
	`(
		'calls the factoryFunction callback once when called with $dependencies dependencies multiple times',
		({ dependencies }) => {
			const value = 'test';
			const mockValueFactory = jest.fn().mockReturnValue(value);
			const { rerender } = renderUseFactoryFunctionHook([mockValueFactory, dependencies]);
			rerender([mockValueFactory, dependencies]);
			rerender([mockValueFactory, dependencies]);
			rerender([mockValueFactory, dependencies]);
			expect(mockValueFactory).toHaveBeenCalledTimes(1);
		}
	);

	it.each`
		firstDependencies        | secondDependencies       | thirdDependencies        | expectedNumberOfTimesCalled
		${['test']}              | ${['test']}              | ${['test']}              | ${1}
		${[1, 2, '']}            | ${[1, 3, '']}            | ${[1, 2, '']}            | ${3}
		${[1]}                   | ${[1, 2]}                | ${[1, 2]}                | ${1}
		${[true]}                | ${[{}]}                  | ${[1]}                   | ${3}
		${['test']}              | ${['test']}              | ${[]}                    | ${1}
		${[parseInt('asdf')]}    | ${[Number.NaN]}          | ${[parseInt('asdf')]}    | ${1}
		${[new Date()]}          | ${[new Date()]}          | ${[new Date()]}          | ${3}
		${[[]]}                  | ${[[]]}                  | ${[[]]}                  | ${3}
		${[100]}                 | ${[100]}                 | ${[100]}                 | ${1}
		${[() => {}]}            | ${[() => {}]}            | ${[() => {}]}            | ${3}
		${['a']}                 | ${[]}                    | ${['a']}                 | ${1}
		${[{ a: 1, b: 'test' }]} | ${[{ a: 1, b: 'test' }]} | ${[{ a: 1, b: 'test' }]} | ${3}
		${[{ a: 1, b: 'test' }]} | ${[{ a: 'test', b: 2 }]} | ${[{ a: 1, b: 'test' }]} | ${3}
		${[undefined]}           | ${[undefined]}           | ${[undefined]}           | ${1}
		${[null]}                | ${[null]}                | ${[undefined]}           | ${2}
	`(
		'calls the factoryFunction callback $expectedNumberOfTimesCalled times when called with $firstDependencies dependencies, then $secondDependencies dependencies, then $thirdDependencies dependencies',
		({ firstDependencies, secondDependencies, thirdDependencies, expectedNumberOfTimesCalled }) => {
			const value = 'test';
			const mockValueFactory = jest.fn().mockReturnValue(value);
			const { rerender } = renderUseFactoryFunctionHook([mockValueFactory, firstDependencies]);
			rerender([mockValueFactory, secondDependencies]);
			rerender([mockValueFactory, thirdDependencies]);
			expect(mockValueFactory).toHaveBeenCalledTimes(expectedNumberOfTimesCalled);
		}
	);
});
