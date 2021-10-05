import { useStateObservable } from './use-state-observable';
import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';

type useStateObservableParams = Parameters<typeof useStateObservable>;
type useStateObservableReturn = ReturnType<typeof useStateObservable>;

function renderUseStateObservableHook(
	initialParams: useStateObservableParams
): RenderHookResult<
	useStateObservableParams,
	useStateObservableReturn,
	Renderer<useStateObservableParams>
> {
	return renderHook((params: useStateObservableParams) => useStateObservable(...params), {
		initialProps: initialParams,
	});
}

describe('useStateObservable', () => {
	it('returns the same state$ observable when render multiple times', () => {
		const { result, rerender } = renderUseStateObservableHook(['test']);
		const [firstObservable] = result.current;
		rerender();
		rerender();
		rerender();
		const [secondObservable] = result.current;
		expect(firstObservable).toBe(secondObservable);
	});

	it('returns the same setState function when rendered multiple times', () => {
		const { result, rerender } = renderUseStateObservableHook(['test']);
		const [, firstFunction] = result.current;
		rerender();
		rerender();
		rerender();
		const [, secondFunction] = result.current;
		expect(firstFunction).toBe(secondFunction);
	});

	it('returns an observable which emits the value passed to the setState function that was returned from a different render', () => {
		const { result, rerender } = renderUseStateObservableHook(['test']);
		const [state$] = result.current;
		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});

		rerender();
		const [, setState] = result.current;
		setState('test');

		expect(mockNext).toHaveBeenCalledTimes(1);
		subscription.unsubscribe();
	});

	it('returns an observable which replays undefined when called with no arguments', () => {
		const { result } = renderUseStateObservableHook([] as any);
		const [state$] = result.current;
		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledWith(undefined);

		subscription.unsubscribe();
	});

	it('returns an observable which replays the initial value passed to the hook', () => {
		const { result } = renderUseStateObservableHook([10]);
		const [state$] = result.current;

		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledWith(10);

		subscription.unsubscribe();
	});

	it('returns an observable which replays the same object that was passed to the hook', () => {
		const object = {};
		const { result } = renderUseStateObservableHook([object]);
		const [state$] = result.current;

		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});

		expect(mockNext.mock.calls[0][0]).toBe(object);

		subscription.unsubscribe();
	});

	it('returns an observable which emits the result of the function passed to the hook', () => {
		const { result } = renderUseStateObservableHook([() => 100]);
		const [state$] = result.current;

		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledWith(100);

		subscription.unsubscribe();
	});

	it('returns an observable which emits the latest value the setState function was called with', () => {
		const { result } = renderUseStateObservableHook(['test']);
		const [state$, setState] = result.current;

		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});

		setState('test2');

		expect(mockNext).toHaveBeenLastCalledWith('test2');

		subscription.unsubscribe();
	});

	it('returns an observable which replays the latest value the setState function was called with', () => {
		const { result } = renderUseStateObservableHook(['test']);
		const [state$, setState] = result.current;
		setState('test2');

		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenLastCalledWith('test2');

		subscription.unsubscribe();
	});

	it('returns an observable which replays the same object the setState function was called with', () => {
		const { result } = renderUseStateObservableHook(['test']);
		const [state$, setState] = result.current;
		const object = {};
		setState(object);

		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});

		expect(mockNext.mock.calls[0][0]).toBe(object);

		subscription.unsubscribe();
	});

	it('returns an observable which only replays the last value the setState function was called with', () => {
		const { result } = renderUseStateObservableHook(['test']);
		const [state$, setState] = result.current;
		setState('test2');
		setState('test3');
		setState('test4');

		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which emits each time the setState function is called', () => {
		const { result } = renderUseStateObservableHook(['test']);
		const [state$, setState] = result.current;
		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});

		setState('test2');
		setState('test3');
		setState('test4');

		expect(mockNext).toHaveBeenCalledTimes(4);

		subscription.unsubscribe();
	});

	it('returns an observable which only emits once if the setState function is called with the same value which the hook was initially called with', () => {
		const { result } = renderUseStateObservableHook([1]);
		const [state$, setState] = result.current;
		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});
		setState(1);

		expect(mockNext).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which only emits once if the setState function is called multiple times with the same value', () => {
		const { result } = renderUseStateObservableHook([1]);
		const [state$, setState] = result.current;
		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});
		setState(1);
		setState(1);
		setState(1);
		setState(1);
		setState(1);

		expect(mockNext).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('does not use loose equality when checking if the setState function was called with same value', () => {
		const { result } = renderUseStateObservableHook(['1']);
		const [state$, setState] = result.current;
		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});
		setState(1);
		setState('1');
		expect(mockNext).toHaveBeenCalledTimes(3);

		subscription.unsubscribe();
	});

	it('returns an observable which emits the result of the accumulator function passed the setState function', () => {
		const { result } = renderUseStateObservableHook([1]);
		const [state$, setState] = result.current;
		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});
		setState((x: number) => x + 2);
		setState((x: number) => x + 2);
		expect(mockNext).toHaveBeenLastCalledWith(5);

		subscription.unsubscribe();
	});

	it('returns an observable which replays the current accumulated value', () => {
		const { result } = renderUseStateObservableHook([1]);
		const [state$, setState] = result.current;
		setState((x: number) => x + 2);
		setState((x: number) => x + 2);
		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});
		expect(mockNext).toHaveBeenLastCalledWith(5);

		subscription.unsubscribe();
	});

	it('returns an observable which only emits once if the accumulator function passed to the setState function returns the same value as the current accumulated value', () => {
		const { result } = renderUseStateObservableHook([1]);
		const [state$, setState] = result.current;
		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});
		setState((x: number) => x);
		expect(mockNext).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which emits each time the setState function is called with an accumulator function which returns a different result', () => {
		const { result } = renderUseStateObservableHook([1]);
		const [state$, setState] = result.current;
		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});
		setState((x: number) => x + 2);
		setState((x: number) => x + 2);
		setState((x: number) => x + 2);
		setState((x: number) => x + 2);
		setState((x: number) => x + 2);
		expect(mockNext).toHaveBeenCalledTimes(6);

		subscription.unsubscribe();
	});

	it('returns an observable which does not remit the same value, when rendered with null, then setState is called with null, then the returned observable is subscribed to', () => {
		const { result } = renderUseStateObservableHook([null]);
		const [state$, setState] = result.current;

		setState(null);
		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which completes when the hook is unmounted', () => {
		const { result, unmount } = renderUseStateObservableHook([null]);
		const [state$] = result.current;
		const mockComplete = jest.fn();
		const subscription = state$.subscribe({
			complete: mockComplete,
		});

		unmount();
		expect(mockComplete).toHaveBeenCalled();

		subscription.unsubscribe();
	});

	it('returns an observable which completes when the hook is already unmounted', () => {
		const { result, unmount } = renderUseStateObservableHook([null]);
		const [state$] = result.current;
		unmount();

		const mockComplete = jest.fn();
		const subscription = state$.subscribe({
			complete: mockComplete,
		});
		expect(mockComplete).toHaveBeenCalled();

		subscription.unsubscribe();
	});

	it('returns an observable which does not complete when its subscribed to', () => {
		const { result } = renderUseStateObservableHook([undefined]);
		const [state$] = result.current;

		const mockComplete = jest.fn();
		const subscription = state$.subscribe({ complete: mockComplete });

		expect(mockComplete).not.toHaveBeenCalled();

		subscription.unsubscribe();
	});

	it('returns an observable which replays the last value the setState function was called with before the hook was unmounted', () => {
		const { result, unmount } = renderUseStateObservableHook([null]);
		const [state$, setState] = result.current;
		setState(100);
		unmount();

		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});
		expect(mockNext).toHaveBeenCalledWith(100);

		subscription.unsubscribe();
	});

	it('returns an observable which replays the accumulated value before the hook was unmounted', () => {
		const { result, unmount } = renderUseStateObservableHook([1]);
		const [state$, setState] = result.current;
		setState((x: number) => x + 2);
		setState((x: number) => x + 2);
		setState((x: number) => x + 2);
		setState((x: number) => x + 2);
		setState((x: number) => x + 2);
		unmount();

		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});
		expect(mockNext).toHaveBeenCalledWith(11);

		subscription.unsubscribe();
	});

	it('returns an observable which completes once when the hook is unmounted multiple times', () => {
		const { result, unmount } = renderUseStateObservableHook([null]);
		const [state$] = result.current;
		unmount();
		unmount();
		unmount();
		unmount();
		unmount();

		const mockComplete = jest.fn();
		const subscription = state$.subscribe({
			complete: mockComplete,
		});
		expect(mockComplete).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which does not emit values from subsequent re-renders', () => {
		const { result, rerender } = renderUseStateObservableHook(['test']);
		const [state$] = result.current;
		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});

		rerender(['test2']);
		rerender(['test3']);
		rerender(['test4']);

		expect(mockNext).toBeCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which only replays the initial value from the first render', () => {
		const { result, rerender } = renderUseStateObservableHook(['test']);
		const [state$] = result.current;
		rerender(['test2']);
		rerender(['test3']);
		rerender(['test4']);

		const mockNext = jest.fn();
		const subscription = state$.subscribe({
			next: mockNext,
		});
		expect(mockNext).toBeCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which shares the argument passed to the setState function amongst subscribers', () => {
		const { result } = renderUseStateObservableHook([null]);
		const [state$, setState] = result.current;

		const mockNext = jest.fn();
		const subscription = state$.subscribe({ next: mockNext });
		const mockNext2 = jest.fn();
		const subscription2 = state$.subscribe({ next: mockNext2 });

		const object = {};
		setState(object);

		expect(mockNext.mock.calls[1][0]).toBe(object);
		expect(mockNext.mock.calls[1][0]).toBe(object);

		subscription.unsubscribe();
		subscription2.unsubscribe();
	});
});
