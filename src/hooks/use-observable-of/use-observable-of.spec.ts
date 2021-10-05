import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { useObservableOf } from './use-observable-of';

type useObservableOfParams = Parameters<typeof useObservableOf>;
type useObservableOfReturn = ReturnType<typeof useObservableOf>;

function renderUseObservableOfHook(
	initialParams: useObservableOfParams
): RenderHookResult<useObservableOfParams, useObservableOfReturn, Renderer<useObservableOfParams>> {
	return renderHook((params: useObservableOfParams) => useObservableOf(...params), {
		initialProps: initialParams,
	});
}

describe('useObservableOf', () => {
	it('returns the same observable when re-rendered multiple times', () => {
		const { result, rerender } = renderUseObservableOfHook(['test']);
		const firstObservable = result.current;
		rerender([2]);
		rerender([{}]);
		rerender([false]);
		const secondObservable = result.current;
		expect(firstObservable).toBe(secondObservable);
	});

	it('returns an observable which replays the value passed to the hook', () => {
		const { result } = renderUseObservableOfHook(['test']);
		const value$ = result.current;

		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledWith('test');

		subscription.unsubscribe();
	});

	it('returns an observable which replays the same object reference passed to the hook', () => {
		const object = {};
		const { result } = renderUseObservableOfHook([object]);
		const value$ = result.current;

		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		expect(mockNext.mock.calls[0][0]).toBe(object);

		subscription.unsubscribe();
	});

	it('returns an observable which replays the most recent value passed to the hook', () => {
		const { result, rerender } = renderUseObservableOfHook(['test']);
		rerender([0]);
		rerender([true]);
		const value$ = result.current;
		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenLastCalledWith(true);

		subscription.unsubscribe();
	});

	it('returns an observable which emits the most recent value passed to the hook', () => {
		const { result, rerender } = renderUseObservableOfHook(['test']);
		const value$ = result.current;

		rerender([0]);
		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		rerender([true]);
		expect(mockNext).toHaveBeenLastCalledWith(true);

		subscription.unsubscribe();
	});

	it('returns an observable which emits the most recent object reference passed to the hook', () => {
		const firstObject = {};
		const secondObject = {};
		const thirdObject = {};
		const { result, rerender } = renderUseObservableOfHook([firstObject]);
		const value$ = result.current;

		rerender([secondObject]);
		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		rerender([thirdObject]);
		expect(mockNext).toHaveBeenLastCalledWith(thirdObject);

		subscription.unsubscribe();
	});

	it('returns an observable which only replays the last value the hook was called with', () => {
		const firstObject = {};
		const secondObject = {};
		const thirdObject = {};
		const { result, rerender } = renderUseObservableOfHook([firstObject]);
		const value$ = result.current;

		rerender([secondObject]);
		rerender([thirdObject]);
		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which only emits once if the hook is re-rendered with the same value', () => {
		const { result, rerender } = renderUseObservableOfHook(['test']);
		const value$ = result.current;
		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		rerender(['test']);
		rerender(['test']);
		rerender(['test']);
		expect(mockNext).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which emits each time the hook is re-rendered with a different value', () => {
		const { result, rerender } = renderUseObservableOfHook(['test']);
		const value$ = result.current;
		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		rerender(['test2']);
		rerender(['test3']);
		rerender(['test4']);
		expect(mockNext).toHaveBeenCalledTimes(4);

		subscription.unsubscribe();
	});
});
