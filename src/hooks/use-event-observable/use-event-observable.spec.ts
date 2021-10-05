import { useEventObservable } from './use-event-observable';
import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';

type useEventObservableParams = Parameters<typeof useEventObservable>;
type useEventObservableReturn = ReturnType<typeof useEventObservable>;

function renderUseEventObservableHook(
	initialParams: useEventObservableParams
): RenderHookResult<
	useEventObservableParams,
	useEventObservableReturn,
	Renderer<useEventObservableParams>
> {
	return renderHook((params: useEventObservableParams) => useEventObservable(...params), {
		initialProps: initialParams,
	});
}

describe('useEventObservable', () => {
	it('returns the same event$ observable when rendered multiple times', () => {
		const { result, rerender } = renderUseEventObservableHook([]);
		const [firstObservable] = result.current;
		rerender();
		rerender();
		rerender();
		const [secondObservable] = result.current;
		expect(firstObservable).toBe(secondObservable);
	});

	it('returns the same emit function when rendered multiple times', () => {
		const { result, rerender } = renderUseEventObservableHook([]);
		const [, firstFunction] = result.current;
		rerender();
		rerender();
		rerender();
		const [, secondFunction] = result.current;
		expect(firstFunction).toBe(secondFunction);
	});

	it('returns an event$ observable which emits the value passed to the emit function that was returned from a different render', () => {
		const { result, rerender } = renderUseEventObservableHook([]);
		const [event$] = result.current;
		const mockNext = jest.fn();
		const subscription = event$.subscribe({
			next: mockNext,
		});

		expect(mockNext).not.toHaveBeenCalled();

		rerender();
		rerender();
		const [, emit] = result.current;
		emit('test');

		expect(mockNext).toHaveBeenCalledTimes(1);
		subscription.unsubscribe();
	});

	it('returns an event$ observable which does not initially emit anything', () => {
		const { result } = renderUseEventObservableHook([]);
		const [event$] = result.current;

		const mockNext = jest.fn();
		const subscription = event$.subscribe({
			next: mockNext,
		});

		expect(mockNext).not.toHaveBeenCalled();

		subscription.unsubscribe();
	});

	it('returns an event$ observable which does not replay any values, when the returned emit function is called before the event$ observable is subscribed to', () => {
		const { result } = renderUseEventObservableHook([]);
		const [event$, emit] = result.current;

		emit('test');
		const mockNext = jest.fn();
		const subscription = event$.subscribe({
			next: mockNext,
		});

		expect(mockNext).not.toHaveBeenCalled();

		subscription.unsubscribe();
	});

	it('returns an event$ observable which emits the argument passed to the latest emit function called', () => {
		const { result } = renderUseEventObservableHook([]);
		const [event$, emit] = result.current;

		const mockNext = jest.fn();
		const subscription = event$.subscribe({
			next: mockNext,
		});
		emit('test');

		expect(mockNext).toHaveBeenCalledWith('test');

		subscription.unsubscribe();
	});

	it('returns an event$ observable which completes when the hook is unmounted', () => {
		const { result, unmount } = renderUseEventObservableHook([]);
		const [event$] = result.current;

		const mockComplete = jest.fn();
		const subscription = event$.subscribe({ complete: mockComplete });
		unmount();

		expect(mockComplete).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it("returns an event$ observable which does not complete when it's subscribed to", () => {
		const { result } = renderUseEventObservableHook([]);
		const [event$] = result.current;

		const mockComplete = jest.fn();
		const subscription = event$.subscribe({ complete: mockComplete });

		expect(mockComplete).not.toHaveBeenCalled();

		subscription.unsubscribe();
	});

	it('returns an event$ observable which completes when the hook is already unmounted', () => {
		const { result, unmount } = renderUseEventObservableHook([]);
		const [event$] = result.current;
		unmount();

		const mockComplete = jest.fn();
		const subscription = event$.subscribe({ complete: mockComplete });
		expect(mockComplete).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which completes once when the hook is unmounted multiple times', () => {
		const { result, unmount } = renderUseEventObservableHook([]);
		const [event$] = result.current;
		unmount();
		unmount();
		unmount();
		unmount();
		unmount();

		const mockComplete = jest.fn();
		const subscription = event$.subscribe({
			complete: mockComplete,
		});
		expect(mockComplete).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an event$ observable which emits each time the returned emit function is called', () => {
		const { result } = renderUseEventObservableHook([]);
		const [event$, emit] = result.current;

		const mockNext = jest.fn();
		const subscription = event$.subscribe({ next: mockNext });
		emit(false);
		emit(false);
		emit(false);
		expect(mockNext).toHaveBeenCalledTimes(3);

		subscription.unsubscribe();
	});

	it("returns an observable which emits 100, when it's subscribed to, then emit is called with 1, then called with 2, then called with 100", () => {
		const { result } = renderUseEventObservableHook([]);
		const [event$, emit] = result.current;

		const mockNext = jest.fn();
		const subscription = event$.subscribe({ next: mockNext });
		emit(1);
		emit(10);
		emit(100);
		expect(mockNext).toHaveBeenLastCalledWith(100);

		subscription.unsubscribe();
	});

	it('returns an observable which emits once with null, when emit is called with 100, then the observable is subscribed to, then emit is called with null', () => {
		const { result } = renderUseEventObservableHook([]);
		const [event$, emit] = result.current;

		const mockNext = jest.fn();
		emit(100);
		const subscription = event$.subscribe({ next: mockNext });
		emit(null);
		expect(mockNext).toHaveBeenLastCalledWith(null);

		subscription.unsubscribe();
	});

	it('returns an observable which shares the argument passed to the emit function amongst subscribers', () => {
		const { result } = renderUseEventObservableHook([]);
		const [event$, emit] = result.current;

		const mockNext = jest.fn();
		const subscription = event$.subscribe({ next: mockNext });
		const mockNext2 = jest.fn();
		const subscription2 = event$.subscribe({ next: mockNext2 });

		const object = {};
		emit(object);

		expect(mockNext.mock.calls[0][0]).toBe(object);
		expect(mockNext.mock.calls[0][0]).toBe(object);

		subscription.unsubscribe();
		subscription2.unsubscribe();
	});
});
