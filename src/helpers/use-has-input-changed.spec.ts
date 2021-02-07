import { renderHook } from '@testing-library/react-hooks';
import { useHasInputChanged } from './use-has-input-changed';

describe('useHasInputChanged', () => {
	it.each`
		input
		${[]}
		${[1, 2]}
		${['test']}
		${[true, 1, {}, []]}
		${[null]}
	`('returns false when called with $input', ({ input }) => {
		const { result } = renderHook(useHasInputChanged, {
			initialProps: input,
		});
		expect(result.current).toBe(false);
	});

	it.each`
		firstInput              | secondInput         | expected
		${[]}                   | ${[]}               | ${false}
		${['test']}             | ${['test']}         | ${false}
		${[1, 2, '']}           | ${[1, 3, '']}       | ${true}
		${[{}]}                 | ${[{}]}             | ${true}
		${[[]]}                 | ${[[]]}             | ${true}
		${[1]}                  | ${[1, 2]}           | ${true}
		${[true]}               | ${[true]}           | ${false}
		${['test']}             | ${[]}               | ${true}
		${[null]}               | ${[undefined]}      | ${true}
		${[parseInt('blabla')]} | ${[Number.NaN]}     | ${false}
		${[Symbol('test')]}     | ${[Symbol('test')]} | ${true}
		${[() => {}]}           | ${[() => {}]}       | ${true}
		${[BigInt(1)]}          | ${[BigInt(1)]}      | ${false}
	`(
		'returns $expected when called with $firstInput, then re-rendered with $secondInput',
		({ firstInput, secondInput, expected }) => {
			const { result, rerender } = renderHook(useHasInputChanged, {
				initialProps: firstInput,
			});
			rerender(secondInput);
			expect(result.current).toBe(expected);
		}
	);

	it.each`
		firstInput            | secondInput     | thirdInput            | expected
		${['test']}           | ${['test']}     | ${['test']}           | ${false}
		${[1, 2, '']}         | ${[1, 3, '']}   | ${[1, 2, '']}         | ${true}
		${[1]}                | ${[1, 2]}       | ${[1, 2]}             | ${false}
		${[true]}             | ${[{}]}         | ${[1]}                | ${true}
		${['test']}           | ${[]}           | ${['test']}           | ${true}
		${[parseInt('asdf')]} | ${[Number.NaN]} | ${[parseInt('asdf')]} | ${false}
	`(
		'returns $expected when called with $firstInput, then re-rendered with $secondInput, then re-render with $thirdInput',
		({ firstInput, secondInput, thirdInput, expected }) => {
			const { result, rerender } = renderHook(useHasInputChanged, {
				initialProps: firstInput,
			});
			rerender(secondInput);
			rerender(thirdInput);
			expect(result.current).toBe(expected);
		}
	);

	it.each`
		input
		${''}
		${false}
		${Number.NaN}
		${{}}
		${1}
		${Symbol()}
		${BigInt(1)}
		${function* generator() {}}
	`('throws a type when called with $input', ({ input }) => {
		const { result } = renderHook(useHasInputChanged, { initialProps: input });
		expect(result.error).toBeInstanceOf(TypeError);
	});
});
