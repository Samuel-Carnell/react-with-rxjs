import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { useValueObservable } from './use-value-observable';

type useValueObservableParams = Parameters<typeof useValueObservable>;
type useValueObservableReturn = ReturnType<typeof useValueObservable>;

function renderUseValueObservableHook(
	initialParams: useValueObservableParams
): RenderHookResult<
	useValueObservableParams,
	useValueObservableReturn,
	Renderer<useValueObservableParams>
> {
	return renderHook((params: useValueObservableParams) => useValueObservable(...params), {
		initialProps: initialParams,
	});
}

describe('useValueObservable', () => {
	it.each`
		value               | expected
		${1}                | ${1}
		${null}             | ${null}
		${undefined}        | ${undefined}
		${Number.MIN_VALUE} | ${Number.MIN_VALUE}
		${false}            | ${false}
		${'test'}           | ${'test'}
	`(
		'returns an observable which replays $expected, when called with $value, then the returned observable is subscribed to',
		({ value, expected }) => {
			const { result } = renderUseValueObservableHook([value]);
			const value$ = result.current;

			const mockNext = jest.fn();
			const subscription = value$.subscribe({
				next: mockNext,
			});

			expect(mockNext).toHaveBeenNthCalledWith(1, expected);

			subscription.unsubscribe();
		}
	);

	it.each`
		value               | expected
		${1}                | ${1}
		${null}             | ${null}
		${undefined}        | ${undefined}
		${Number.MIN_VALUE} | ${Number.MIN_VALUE}
		${false}            | ${false}
		${'test'}           | ${'test'}
	`(
		'returns an observable which replays $expected, when called with undefined, then re-rendered with $value, then the returned observable is subscribed to',
		({ value, expected }) => {
			const { result, rerender } = renderUseValueObservableHook([undefined]);
			const value$ = result.current;

			rerender([value]);
			const mockNext = jest.fn();
			const subscription = value$.subscribe({
				next: mockNext,
			});

			expect(mockNext).toHaveBeenNthCalledWith(1, expected);

			subscription.unsubscribe();
		}
	);

	it.each`
		value               | expected
		${1}                | ${1}
		${null}             | ${null}
		${Number.MIN_VALUE} | ${Number.MIN_VALUE}
		${false}            | ${false}
		${'test'}           | ${'test'}
	`(
		'returns an observable which emits $expected, when called with undefined, then the returned observable is subscribed to, then re-rendered with $value',
		({ value, expected }) => {
			const { result, rerender } = renderUseValueObservableHook([undefined]);
			const value$ = result.current;

			const mockNext = jest.fn();
			const subscription = value$.subscribe({
				next: mockNext,
			});
			rerender([value]);

			expect(mockNext).toHaveBeenNthCalledWith(2, expected);

			subscription.unsubscribe();
		}
	);

	it('returns an observable which completes, when called with undefined, then the returned observable is subscribed to, then the hook is unmounted', () => {
		const { result, unmount } = renderUseValueObservableHook([undefined]);
		const state$ = result.current;

		const mockComplete = jest.fn();
		const subscription = state$.subscribe({ complete: mockComplete });
		unmount();

		expect(mockComplete).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which is not complete, when called with undefined, then the returned observable is subscribed to', () => {
		const { result } = renderUseValueObservableHook([undefined]);
		const state$ = result.current;

		const mockComplete = jest.fn();
		const subscription = state$.subscribe({ complete: mockComplete });

		expect(mockComplete).not.toHaveBeenCalled();

		subscription.unsubscribe();
	});

	it('returns an observable which completes, when called with undefined, then the hook is unmounted, then the returned observable is subscribed to, ', () => {
		const { result, unmount } = renderUseValueObservableHook([undefined]);
		const state$ = result.current;
		unmount();

		const mockComplete = jest.fn();
		const subscription = state$.subscribe({ complete: mockComplete });
		expect(mockComplete).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it.each`
		initialValue  | firstValue    | secondValue   | thirdValue    | expectedNumberOfTimes
		${undefined}  | ${1}          | ${2}          | ${3}          | ${4}
		${undefined}  | ${undefined}  | ${1}          | ${2}          | ${3}
		${0}          | ${0}          | ${0}          | ${0}          | ${1}
		${false}      | ${true}       | ${false}      | ${false}      | ${3}
		${false}      | ${1}          | ${'test'}     | ${undefined}  | ${4}
		${new Date()} | ${new Date()} | ${new Date()} | ${new Date()} | ${4}
	`(
		'returns an observable which emits $expectedNumberOfTimes times, when called with $initialValue, then the returned observable is subscribed to, then re-rendered with $firstValue, then re-rendered with $secondValue, then re-rendered with $thirdValue',
		({ initialValue, firstValue, secondValue, thirdValue, expectedNumberOfTimes }) => {
			const { result, rerender } = renderUseValueObservableHook([initialValue]);
			const value$ = result.current;

			const mockNext = jest.fn();
			const subscription = value$.subscribe({
				next: mockNext,
			});
			rerender([firstValue]);
			rerender([secondValue]);
			rerender([thirdValue]);

			expect(mockNext).toBeCalledTimes(expectedNumberOfTimes);

			subscription.unsubscribe();
		}
	);

	it.each`
		initialValue | firstValue   | secondValue | thirdValue   | expected
		${undefined} | ${1}         | ${2}        | ${3}         | ${3}
		${undefined} | ${undefined} | ${1}        | ${2}         | ${2}
		${0}         | ${0}         | ${0}        | ${0}         | ${0}
		${'test'}    | ${'test2'}   | ${'test2'}  | ${'test2'}   | ${'test2'}
		${false}     | ${true}      | ${false}    | ${false}     | ${false}
		${false}     | ${1}         | ${'test'}   | ${undefined} | ${undefined}
	`(
		'returns an observable which emits $initialValue, when called with $initialValue, then the returned observable is subscribed to, then re-render with $firstValue, then re-rendered with $secondValue, then re-rendered with $thirdValue',
		({ initialValue, firstValue, secondValue, thirdValue, expected }) => {
			const { result, rerender } = renderUseValueObservableHook([initialValue]);
			const state$ = result.current;

			const mockNext = jest.fn();
			const subscription = state$.subscribe({
				next: mockNext,
			});
			rerender([firstValue]);
			rerender([secondValue]);
			rerender([thirdValue]);

			expect(mockNext).toHaveBeenLastCalledWith(expected);

			subscription.unsubscribe();
		}
	);
});
