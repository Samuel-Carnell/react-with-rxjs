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
	it.each`
		initialState        | expected
		${1}                | ${1}
		${null}             | ${null}
		${undefined}        | ${undefined}
		${Number.MIN_VALUE} | ${Number.MIN_VALUE}
		${false}            | ${false}
		${'test'}           | ${'test'}
	`(
		'returns an observable which replays $expected, when called with $initialState, then the returned observable is subscribed to',
		({ initialState, expected }) => {
			const { result } = renderUseStateObservableHook([initialState]);
			const [state$] = result.current;

			const mockNext = jest.fn();
			const subscription = state$.subscribe({
				next: mockNext,
			});

			expect(mockNext).toHaveBeenNthCalledWith(1, expected);

			subscription.unsubscribe();
		}
	);

	it.each`
		state               | expected
		${1}                | ${1}
		${null}             | ${null}
		${Number.MIN_VALUE} | ${Number.MIN_VALUE}
		${false}            | ${false}
		${'test'}           | ${'test'}
	`(
		'returns an observable which emits $expected, when called with undefined, then the returned observable is subscribed to, then setState is called with $state',
		({ state, expected }) => {
			const { result } = renderUseStateObservableHook([undefined]);
			const [state$, setState] = result.current;

			const mockNext = jest.fn();
			const subscription = state$.subscribe({
				next: mockNext,
			});
			setState(state);

			expect(mockNext).toHaveBeenNthCalledWith(2, expected);

			subscription.unsubscribe();
		}
	);

	it.each`
		state               | expected
		${1}                | ${1}
		${null}             | ${null}
		${undefined}        | ${undefined}
		${Number.MIN_VALUE} | ${Number.MIN_VALUE}
		${false}            | ${false}
		${'test'}           | ${'test'}
	`(
		'returns an observable which replays $expected, when called with undefined, then setState is called with $state, then the returned observable is subscribed to',
		({ state, expected }) => {
			const { result } = renderUseStateObservableHook([undefined]);
			const [state$, setState] = result.current;

			setState(state);
			const mockNext = jest.fn();
			const subscription = state$.subscribe({
				next: mockNext,
			});

			expect(mockNext).toHaveBeenNthCalledWith(1, expected);

			subscription.unsubscribe();
		}
	);

	it('returns an observable which completes, when called with undefined, then the returned observable is subscribed to, then the hook is unmounted', () => {
		const { result, unmount } = renderUseStateObservableHook([undefined]);
		const [state$] = result.current;

		const mockComplete = jest.fn();
		const subscription = state$.subscribe({ complete: mockComplete });
		unmount();

		expect(mockComplete).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which is not complete, when called with undefined, then the returned observable is subscribed to', () => {
		const { result } = renderUseStateObservableHook([undefined]);
		const [state$] = result.current;

		const mockComplete = jest.fn();
		const subscription = state$.subscribe({ complete: mockComplete });

		expect(mockComplete).not.toHaveBeenCalled();

		subscription.unsubscribe();
	});

	it('returns an observable which completes, when called with undefined, then the hook is unmounted, then the returned observable is subscribed to, ', () => {
		const { result, unmount } = renderUseStateObservableHook([undefined]);
		const [state$] = result.current;
		unmount();

		const mockComplete = jest.fn();
		const subscription = state$.subscribe({ complete: mockComplete });
		expect(mockComplete).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it.each`
		initialState        | firstState      | secondState          | thirdState      | expectedNumberOfTimes
		${undefined}        | ${1}            | ${2}                 | ${3}            | ${4}
		${undefined}        | ${undefined}    | ${1}                 | ${2}            | ${3}
		${0}                | ${0}            | ${0}                 | ${0}            | ${1}
		${'test'}           | ${'test2'}      | ${'test2'}           | ${'test2'}      | ${2}
		${0}                | ${(x) => x + 1} | ${1}                 | ${(x) => x + 1} | ${3}
		${() => null}       | ${() => null}   | ${() => null}        | ${'test'}       | ${2}
		${{}}               | ${{}}           | ${{}}                | ${{}}           | ${4}
		${'test'}           | ${(x) => x}     | ${(x) => x}          | ${(x) => x}     | ${1}
		${[]}               | ${[]}           | ${[]}                | ${() => []}     | ${4}
		${() => 1}          | ${(x) => x - 1} | ${(x) => x + 1}      | ${(x) => x - 1} | ${4}
		${() => 'test'}     | ${'test'}       | ${(x) => x + 'test'} | ${'test'}       | ${3}
		${false}            | ${true}         | ${false}             | ${false}        | ${3}
		${false}            | ${1}            | ${'test'}            | ${undefined}    | ${4}
		${() => new Date()} | ${new Date()}   | ${new Date()}        | ${new Date()}   | ${4}
		${() => false}      | ${(x) => !x}    | ${true}              | ${true}         | ${2}
		${() => 'test'}     | ${false}        | ${[true]}            | ${'test'}       | ${4}
		${() => 1}          | ${(x) => x / 0} | ${(x) => x / 0}      | ${(x) => x / 0} | ${2}
	`(
		'returns an observable which emits $expectedNumberOfTimes times, when called with $initialState, then the returned observable is subscribed to, then setState is called with $firstState, then setState is called with $secondState, then setState is called with $thirdState',
		({ initialState, firstState, secondState, thirdState, expectedNumberOfTimes }) => {
			const { result } = renderUseStateObservableHook([initialState]);
			const [state$, setState] = result.current;

			const mockNext = jest.fn();
			const subscription = state$.subscribe({
				next: mockNext,
			});
			setState(firstState);
			setState(secondState);
			setState(thirdState);

			expect(mockNext).toBeCalledTimes(expectedNumberOfTimes);

			subscription.unsubscribe();
		}
	);

	it.each`
		initialState    | firstState      | secondState          | thirdState      | expected
		${undefined}    | ${1}            | ${2}                 | ${3}            | ${3}
		${undefined}    | ${undefined}    | ${1}                 | ${2}            | ${2}
		${0}            | ${0}            | ${0}                 | ${0}            | ${0}
		${'test'}       | ${'test2'}      | ${'test2'}           | ${'test2'}      | ${'test2'}
		${0}            | ${(x) => x + 1} | ${1}                 | ${(x) => x + 1} | ${2}
		${() => null}   | ${() => null}   | ${() => null}        | ${'test'}       | ${'test'}
		${'test'}       | ${(x) => x}     | ${(x) => x}          | ${(x) => x}     | ${'test'}
		${() => 1}      | ${(x) => x - 1} | ${(x) => x + 1}      | ${(x) => x - 1} | ${0}
		${() => 'test'} | ${'test'}       | ${(x) => x + 'test'} | ${'test'}       | ${'test'}
		${false}        | ${true}         | ${false}             | ${false}        | ${false}
		${false}        | ${1}            | ${'test'}            | ${undefined}    | ${undefined}
		${() => false}  | ${(x) => !x}    | ${true}              | ${true}         | ${true}
		${() => 'test'} | ${false}        | ${[true]}            | ${'test'}       | ${'test'}
		${() => 1}      | ${(x) => x / 0} | ${(x) => x / 0}      | ${(x) => x / 0} | ${Number.POSITIVE_INFINITY}
	`(
		'returns an observable which emits $expected, when called with $initialState, then the returned observable is subscribed to, then setState is called with $firstState, then setState is called with $secondState, then setState is called with $thirdState',
		({ initialState, firstState, secondState, thirdState, expected }) => {
			const { result } = renderUseStateObservableHook([initialState]);
			const [state$, setState] = result.current;

			const mockNext = jest.fn();
			const subscription = state$.subscribe({
				next: mockNext,
			});
			setState(firstState);
			setState(secondState);
			setState(thirdState);

			expect(mockNext).toHaveBeenLastCalledWith(expected);

			subscription.unsubscribe();
		}
	);

	it('only calls initialState once, when re-rendered twice', () => {
		const mockInitialState = jest.fn().mockReturnValue(undefined);
		// Need to wrap this in a real function as a jest mock function is not an instance of Function
		const initialState = () => {
			mockInitialState();
		};
		const { rerender } = renderUseStateObservableHook([initialState]);
		rerender([mockInitialState]);
		rerender([mockInitialState]);

		expect(mockInitialState).toHaveBeenCalledTimes(1);
	});
});
