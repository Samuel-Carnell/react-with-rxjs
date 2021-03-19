import { isFunction } from './is-function';

describe('isFunction', () => {
	it.each`
		value                | expected
		${() => {}}          | ${true}
		${function () {}}    | ${true}
		${function* () {}}   | ${true}
		${new Function()}    | ${true}
		${isFunction}        | ${true}
		${{ a: () => {} }}   | ${false}
		${{ a: () => {} }.a} | ${true}
		${0}                 | ${false}
		${null}              | ${false}
		${100}               | ${false}
		${'test'}            | ${false}
		${Math.abs}          | ${true}
		${Number.NaN}        | ${false}
		${Boolean}           | ${true}
		${false}             | ${false}
		${true}              | ${false}
		${[]}                | ${false}
		${new String()}      | ${false}
		${undefined}         | ${false}
		${Function}          | ${true}
	`('returns $expected when given $value', ({ value, expected }) => {
		expect(isFunction(value)).toBe(expected);
	});
});
