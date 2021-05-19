import { act, Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { interval, Observable, of, Subject, throwError } from 'rxjs';
import { useObservableState } from './use-observable-state';

type useObservableParams = Parameters<typeof useObservableState>;
type useObservableReturn = ReturnType<typeof useObservableState>;

function renderUseObservableStateHook(
	initialParams: useObservableParams
): RenderHookResult<useObservableParams, useObservableReturn, Renderer<useObservableParams>> {
	return renderHook((params: useObservableParams) => useObservableState(...params), {
		initialProps: initialParams,
	});
}

describe('useObservableState', () => {
	it.each`
		initialValue                    | expectedResult
		${'test'}                       | ${['test', undefined, false]}
		${{}}                           | ${[{}, undefined, false]}
		${Number.MIN_VALUE}             | ${[Number.MIN_VALUE, undefined, false]}
		${[]}                           | ${[[], undefined, false]}
		${undefined}                    | ${[undefined, undefined, false]}
		${null}                         | ${[null, undefined, false]}
		${new Date(2000, 4, 15, 9, 55)} | ${[new Date(2000, 4, 15, 9, 55), undefined, false]}
	`(
		'initially returns $expectedResult when given $initialValue',
		({ initialValue, expectedResult }) => {
			const observable = new Observable();
			const { result } = renderUseObservableStateHook([observable, initialValue]);
			expect(result.current).toEqual(expectedResult);
		}
	);

	it.each`
		value                           | expectedResult
		${'value2'}                     | ${['value2', undefined, false]}
		${{}}                           | ${[{}, undefined, false]}
		${Number.MIN_VALUE}             | ${[Number.MIN_VALUE, undefined, false]}
		${[]}                           | ${[[], undefined, false]}
		${undefined}                    | ${[undefined, undefined, false]}
		${null}                         | ${[null, undefined, false]}
		${new Date(2000, 4, 15, 9, 55)} | ${[new Date(2000, 4, 15, 9, 55), undefined, false]}
	`(
		'returns $expectedResult when given undefined and a subject which emits $value after the initial render',
		({ value, expectedResult }) => {
			const subject = new Subject();
			const { result } = renderUseObservableStateHook([subject, undefined]);
			act(() => subject.next(value));
			expect(result.current).toEqual(expectedResult);
		}
	);

	it.each`
		observable                | expectedResult
		${of(1, 2, 3)}            | ${[3, undefined, true]}
		${of(false)}              | ${[false, undefined, true]}
		${of('a', 'b', 'c', 'd')} | ${['d', undefined, true]}
		${throwError('error')}    | ${[undefined, 'error', false]}
	`(
		'returns $expectedResult when given $initialValue and $observable ',
		({ observable, expectedResult }) => {
			const { result } = renderUseObservableStateHook([observable, undefined]);
			expect(result.current).toEqual(expectedResult);
		}
	);

	it.each`
		observable      | expectedResult
		${interval(10)} | ${[2, undefined, false]}
	`(
		'returns $expectedResult when given $initialValue and $observable, then waited for three updates',
		async ({ observable, expectedResult }) => {
			const { result, waitForNextUpdate } = renderUseObservableStateHook([observable, undefined]);
			await waitForNextUpdate();
			await waitForNextUpdate();
			await waitForNextUpdate();
			expect(result.current).toEqual(expectedResult);
		}
	);

	it.each`
		observable                     | expectedResult
		${of(4)}                       | ${[4, undefined, true]}
		${of(false, true, false)}      | ${[false, undefined, true]}
		${of('a', 'b', 'c', 'd')}      | ${['d', undefined, true]}
		${throwError(new TypeError())} | ${[10, new TypeError(), false]}
		${throwError(true)}            | ${[10, true, false]}
		${throwError('error')}         | ${[10, 'error', false]}
	`(
		'returns $expectedResult when given 0 and observable of [1, 10], then re-rendered with $observable',
		({ observable, expectedResult }) => {
			const { result, rerender } = renderUseObservableStateHook([of(1, 10), 0]);
			rerender([observable, 0]);
			expect(result.current).toEqual(expectedResult);
		}
	);

	it.each`
		value                           | expectedResult
		${'secondValue'}                | ${['secondValue', undefined, false]}
		${[]}                           | ${[[], undefined, false]}
		${undefined}                    | ${[undefined, undefined, false]}
		${null}                         | ${[null, undefined, false]}
		${new Date(2000, 4, 15, 9, 55)} | ${[new Date(2000, 4, 15, 9, 55), undefined, false]}
	`(
		'returns $expectedResult when given "initialValue" and a subject which emits "firstValue", then emits $value after the initial render',
		({ value, expectedResult }) => {
			const subject = new Subject();
			const { result } = renderUseObservableStateHook([subject, 'initialValue']);
			act(() => {
				subject.next('firstValue');
				subject.next(value);
			});
			expect(result.current).toEqual(expectedResult);
		}
	);

	it.each`
		initialValue                    | expectedResult
		${42}                           | ${[42, undefined, false]}
		${undefined}                    | ${[undefined, undefined, false]}
		${{ a: 'test' }}                | ${[{ a: 'test' }, undefined, false]}
		${new Date(2000, 4, 15, 9, 55)} | ${[new Date(2000, 4, 15, 9, 55), undefined, false]}
		${[]}                           | ${[[], undefined, false]}
		${Number.NaN}                   | ${[Number.NaN, undefined, false]}
	`(
		'returns $expectedResult when given $initialValue, and subject which has already emitted "test"',
		({ initialValue, expectedResult }) => {
			const subject = new Subject();
			subject.next('test');
			const { result } = renderUseObservableStateHook([subject, initialValue]);
			expect(result.current).toEqual(expectedResult);
		}
	);

	it.each`
		value               | expectedResult
		${'secondValue'}    | ${['secondValue', undefined, false]}
		${2}                | ${[2, undefined, false]}
		${[]}               | ${[[], undefined, false]}
		${{}}               | ${[{}, undefined, false]}
		${Object.prototype} | ${[Object.prototype, undefined, false]}
	`(
		'returns $expectedResult when given "initialValue" and a subject which emits "firstValue", then re-render with a subject which emits value after the initial render',
		({ value, expectedResult }) => {
			const firstSubject = new Subject();
			const { result, rerender } = renderUseObservableStateHook([firstSubject, 'initialValue']);
			act(() => firstSubject.next('firstValue'));
			const secondSubject = new Subject();
			rerender([secondSubject, 'initialValue']);
			act(() => secondSubject.next(value));
			expect(result.current).toEqual(expectedResult);
		}
	);

	it.each`
		value                           | expectedResult
		${null}                         | ${[null, undefined, false]}
		${new Date(2000, 4, 15, 9, 55)} | ${[new Date(2000, 4, 15, 9, 55), undefined, false]}
		${/test/}                       | ${[/test/, undefined, false]}
	`(
		'returns $expectedResult when given undefined and a subject which emits $value then re-rendered with a subject which does not emit a value',
		({ value, expectedResult }) => {
			const firstSubject = new Subject();
			const { result, rerender } = renderUseObservableStateHook([firstSubject, undefined]);
			act(() => firstSubject.next(value));
			const secondSubject = new Subject();
			rerender([secondSubject, undefined]);
			expect(result.current).toEqual(expectedResult);
		}
	);

	it.each`
		value     | expectedResult
		${10}     | ${[10, undefined, false]}
		${'test'} | ${['test', undefined, false]}
		${false}  | ${[false, undefined, false]}
		${{}}     | ${[{}, undefined, false]}
		${true}   | ${[true, undefined, false]}
	`(
		'returns $expectedResult when given 0 and a subject which does not emit a value, then re-rendered with a subject which emits $value',
		({ value, expectedResult }) => {
			const firstSubject = new Subject();
			const { result, rerender } = renderUseObservableStateHook([firstSubject, 0]);
			const secondSubject = new Subject();
			rerender([secondSubject, 0]);
			act(() => secondSubject.next(value));
			expect(result.current).toEqual(expectedResult);
		}
	);

	it('returns [undefined, "error, false"] when given undefined and a subject which emits "error" after the initial render', () => {
		const subject = new Subject();
		const { result } = renderUseObservableStateHook([subject, undefined]);
		act(() => subject.error('error'));
		expect(result.current).toEqual([undefined, 'error', false]);
	});

	it('returns [7, undefined, false] when given 7, and a subject which has already emitted an error', () => {
		const subject = new Subject();
		subject.error('error');
		const { result } = renderUseObservableStateHook([subject, 7]);
		expect(result.current).toEqual([7, 'error', false]);
	});

	it.each`
		initialValue                    | expectedResult
		${false}                        | ${[false, 'error', false]}
		${'value'}                      | ${['value', 'error', false]}
		${1}                            | ${[1, 'error', false]}
		${['']}                         | ${[[''], 'error', false]}
		${[{}]}                         | ${[[{}], 'error', false]}
		${[null]}                       | ${[null, 'error', false]}
		${undefined}                    | ${[undefined, 'error', false]}
		${new Date(2000, 4, 15, 9, 55)} | ${[new Date(2000, 4, 15, 9, 55), 'error', false]}
	`(
		'returns $expectedResult when given $initialValue, and subject which has already emitted an error',
		() => {
			const initialValue = '';
			const expectedResult = ['', undefined, false];
			const subject = new Subject();
			subject.error(undefined);
			const { result } = renderUseObservableStateHook([subject, initialValue]);
			expect(result.current).toEqual(expectedResult);
		}
	);

	it('returns [false, undefined, true] when given false, and a subject which completes after the initial render', () => {
		const subject = new Subject();
		const { result } = renderUseObservableStateHook([subject, false]);
		act(() => subject.complete());
		expect(result.current).toEqual([false, undefined, true]);
	});

	it('returns [undefined, undefined, false] when given $initialValue, and a subject which completes after the initial render, then re-rendered with a subject which does emit a value', async () => {
		const firstSubject = new Subject();
		const { result, rerender } = renderUseObservableStateHook([firstSubject, undefined]);
		act(() => firstSubject.complete());
		const secondSubject = new Subject();
		rerender([secondSubject, undefined]);
		expect(result.current).toEqual([undefined, undefined, false]);
	});

	it('returns ["test", "error", false] when given undefined, and a subject which emits "test", then re-rendered with a subject which emits an error "error"', async () => {
		const firstSubject = new Subject();
		const { result, rerender } = renderUseObservableStateHook([firstSubject, undefined]);
		act(() => firstSubject.next('test'));
		const secondSubject = new Subject();
		act(() => secondSubject.error('error'));
		rerender([secondSubject, undefined]);
		expect(result.current).toEqual(['test', 'error', false]);
	});

	it.each`
		observable          | expectedResult
		${of([16])}         | ${[[16], undefined, true]}
		${of([[]])}         | ${[[[]], undefined, true]}
		${of(['a'])}        | ${[['a'], undefined, true]}
		${of(true)}         | ${[true, undefined, true]}
		${of([{}, 'c', 1])} | ${[[{}, 'c', 1], undefined, true]}
		${of([undefined])}  | ${[[undefined], undefined, true]}
		${of('test')}       | ${['test', undefined, true]}
	`(
		'returns $expectedResult when given a empty array and a subject which emits [10], then re-rendered with $observable ',
		({ observable, expectedResult }) => {
			const subject = new Subject();
			const { result, rerender } = renderUseObservableStateHook([subject, []]);
			act(() => subject.next([10]));
			rerender([observable, []]);
			expect(result.current).toEqual(expectedResult);
		}
	);

	it.each`
		notObservable
		${null}
		${new Date()}
		${721}
		${[]}
		${{}}
		${undefined}
		${Symbol()}
		${() => {}}
		${new Error()}
		${/a/}
	`('Throws a TypeError when given $notObservable, and null', ({ notObservable }) => {
		const { result } = renderUseObservableStateHook([notObservable, []]);
		expect(result.error).toBeInstanceOf(TypeError);
	});
});
