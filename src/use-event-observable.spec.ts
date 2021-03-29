import { useEventObservable } from './use-event-observable';
import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { Observable } from 'rxjs';

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
	it('returns an observable which does not initially emit anything when subscribed to', () => {
		const { result } = renderUseEventObservableHook([]);
		const [event$] = result.current;

		const mockNext = jest.fn();
		const subscription = event$.subscribe({
			next: mockNext,
		});

		expect(mockNext).not.toHaveBeenCalled();

		subscription.unsubscribe();
	});

	it.each`
		event
		${1}
		${undefined}
		${null}
		${new Date()}
		${Symbol()}
		${() => {}}
		${'test'}
		${[]}
		${{}}
	`(
		'returns an observable which does not replay, when emit is called with $event, then event$ is subscribed to',
		() => {
			const { result } = renderUseEventObservableHook([]);
			const [event$, emit] = result.current;

			emit('test');
			const mockNext = jest.fn();
			const subscription = event$.subscribe({
				next: mockNext,
			});

			expect(mockNext).not.toHaveBeenCalled();

			subscription.unsubscribe();
		}
	);

	it.each`
		event         | expected
		${0.1}        | ${0.1}
		${''}         | ${''}
		${jest.fn}    | ${jest.fn}
		${undefined}  | ${undefined}
		${null}       | ${null}
		${new Blob()} | ${new Blob()}
		${true}       | ${true}
		${{}}         | ${{}}
		${Math.abs}   | ${Math.abs}
		${Number.NaN} | ${Number.NaN}
		${Function}   | ${Function}
		${/aaa/}      | ${/aaa/}
	`(
		'returns an observable which emits $expected, when event$ is subscribed to, then emit is called with $event',
		() => {
			const { result } = renderUseEventObservableHook([]);
			const [event$, emit] = result.current;

			const mockNext = jest.fn();
			const subscription = event$.subscribe({
				next: mockNext,
			});
			emit('test');

			expect(mockNext).toHaveBeenNthCalledWith(1, 'test');

			subscription.unsubscribe();
		}
	);

	it('returns an observable which completes, then the returned observable is subscribed to, then the hook is unmounted', () => {
		const { result, unmount } = renderUseEventObservableHook([]);
		const [state$] = result.current;

		const mockComplete = jest.fn();
		const subscription = state$.subscribe({ complete: mockComplete });
		unmount();

		expect(mockComplete).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which is not complete then the returned observable is subscribed to', () => {
		const { result } = renderUseEventObservableHook([]);
		const [state$] = result.current;

		const mockComplete = jest.fn();
		const subscription = state$.subscribe({ complete: mockComplete });

		expect(mockComplete).not.toHaveBeenCalled();

		subscription.unsubscribe();
	});

	it('returns an observable which completes, then the hook is unmounted, then the returned observable is subscribed to, ', () => {
		const { result, unmount } = renderUseEventObservableHook([]);
		const [state$] = result.current;
		unmount();

		const mockComplete = jest.fn();
		const subscription = state$.subscribe({ complete: mockComplete });
		expect(mockComplete).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it.each`
		firstEvent  | secondEvent
		${0}        | ${1}
		${''}       | ${''}
		${[]}       | ${[]}
		${{}}       | ${{ a: true }}
		${false}    | ${new Date()}
		${true}     | ${'true'}
		${() => {}} | ${() => undefined}
		${null}     | ${undefined}
		${Function} | ${Math}
	`(
		'returns an observable which emits 2 times when emit is called with $firstEvent, then emit is called $secondEvent',
		({ firstEvent, secondEvent }) => {
			const { result } = renderUseEventObservableHook([]);
			const [state$, emit] = result.current;

			const mockNext = jest.fn();
			const subscription = state$.subscribe({ next: mockNext });
			emit(firstEvent);
			emit(secondEvent);
			expect(mockNext).toHaveBeenCalledTimes(2);

			subscription.unsubscribe();
		}
	);

	it.each`
		firstEvent          | secondEvent         | thirdEvent
		${undefined}        | ${1}                | ${2}
		${undefined}        | ${undefined}        | ${1}
		${0}                | ${0}                | ${0}
		${false}            | ${true}             | ${false}
		${false}            | ${1}                | ${'test'}
		${new Date()}       | ${new Date()}       | ${new Date()}
		${/test/}           | ${/test/}           | ${/test/}
		${new Observable()} | ${new Observable()} | ${new Observable()}
		${parseInt('asdf')} | ${parseInt('asdf')} | ${Number.NaN}
		${() => {}}         | ${() => {}}         | ${() => {}}
		${'test'}           | ${'test'}           | ${'test'}
	`(
		'returns an observable which emits 2 times emit is called with $firstEvent, then it is subscribed to, then emit is called with $secondEvent, then emit is called with $thirdEvent',
		({ firstEvent, secondEvent, thirdEvent }) => {
			const { result } = renderUseEventObservableHook([]);
			const [state$, emit] = result.current;

			emit(firstEvent);
			const mockNext = jest.fn();
			const subscription = state$.subscribe({ next: mockNext });
			emit(secondEvent);
			emit(thirdEvent);
			expect(mockNext).toHaveBeenCalledTimes(2);

			subscription.unsubscribe();
		}
	);
});
