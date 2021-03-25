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
		${() => {}}         | ${undefined}
		${true}             | ${true}
		${['a']}            | ${['a']}
		${Math}             | ${Math}
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
		${() => /test/}     | ${/test/}
		${Number.MIN_VALUE} | ${Number.MIN_VALUE}
		${false}            | ${false}
		${'test'}           | ${'test'}
		${() => []}         | ${[]}
		${() => 'test'}     | ${'test'}
		${new Date()}       | ${new Date()}
		${new Error()}      | ${new Error()}
		${(x) => !!x}       | ${false}
		${(x) => !x}        | ${true}
		${() => jest.fn}    | ${jest.fn}
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
		initialState     | secondInitialState  | expected
		${0}             | ${0.1}              | ${0}
		${() => 100}     | ${77}               | ${100}
		${''}            | ${'test'}           | ${''}
		${() => jest.fn} | ${() => {}}         | ${jest.fn}
		${undefined}     | ${null}             | ${undefined}
		${null}          | ${undefined}        | ${null}
		${new Blob()}    | ${() => new Blob()} | ${new Blob()}
		${false}         | ${() => true}       | ${false}
		${{}}            | ${{}}               | ${{}}
	`(
		'returns an observable which emits $expected, when called with $initialState, then the returned observable is subscribed to, then is re-render $secondInitialState',
		({ initialState, secondInitialState, expected }) => {
			const { result, rerender } = renderUseStateObservableHook([initialState]);
			const [state$] = result.current;

			const mockNext = jest.fn();
			const subscription = state$.subscribe({
				next: mockNext,
			});
			rerender(secondInitialState);

			expect(mockNext).toHaveBeenNthCalledWith(1, expected);

			subscription.unsubscribe();
		}
	);

	it.each`
		state               | expected
		${0.1}              | ${0.1}
		${null}             | ${null}
		${undefined}        | ${undefined}
		${(x) => !!x}       | ${false}
		${(x) => !x}        | ${true}
		${Boolean}          | ${false}
		${() => [9999999]}  | ${[9999999]}
		${() => ''}         | ${''}
		${{}}               | ${{}}
		${/test/}           | ${/test/}
		${() => new Blob()} | ${new Blob()}
		${true}             | ${true}
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

	it.each`
		state           | expectedNumberOfTimes
		${1}            | ${2}
		${0}            | ${1}
		${undefined}    | ${2}
		${null}         | ${2}
		${'0'}          | ${2}
		${0.0}          | ${1}
		${() => 0}      | ${1}
		${(x) => x + 1} | ${2}
		${(x) => x * 1} | ${1}
	`(
		'returns an observable which emits $expectedNumberOfTimes times, when rendered with 0, then the returned observable is subscribed to, then setState is called with $state,',
		({ state, expectedNumberOfTimes }) => {
			const { result } = renderUseStateObservableHook([0]);
			const [state$, setState] = result.current;

			const mockNext = jest.fn();
			const subscription = state$.subscribe({
				next: mockNext,
			});
			setState(state);

			expect(mockNext).toHaveBeenCalledTimes(expectedNumberOfTimes);

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
		initialState        | firstState            | secondState           | thirdState       | expectedNumberOfTimes
		${undefined}        | ${1}                  | ${2}                  | ${3}             | ${4}
		${undefined}        | ${undefined}          | ${1}                  | ${2}             | ${3}
		${0}                | ${0}                  | ${0}                  | ${0}             | ${1}
		${'test'}           | ${'test2'}            | ${'test2'}            | ${'test2'}       | ${2}
		${0}                | ${(x) => x + 1}       | ${1}                  | ${(x) => x + 1}  | ${3}
		${() => null}       | ${() => null}         | ${() => null}         | ${'test'}        | ${2}
		${{}}               | ${{}}                 | ${{}}                 | ${{}}            | ${4}
		${'test'}           | ${(x) => x}           | ${(x) => x}           | ${(x) => x}      | ${1}
		${[]}               | ${[]}                 | ${[]}                 | ${() => []}      | ${4}
		${() => 1}          | ${(x) => x - 1}       | ${(x) => x + 1}       | ${(x) => x - 1}  | ${4}
		${() => 'test'}     | ${'test'}             | ${(x) => x + 'test'}  | ${'test'}        | ${3}
		${false}            | ${true}               | ${false}              | ${false}         | ${3}
		${false}            | ${1}                  | ${'test'}             | ${undefined}     | ${4}
		${() => new Date()} | ${new Date()}         | ${new Date()}         | ${new Date()}    | ${4}
		${() => false}      | ${(x) => !x}          | ${true}               | ${true}          | ${2}
		${() => 'test'}     | ${false}              | ${[true]}             | ${'test'}        | ${4}
		${() => 1}          | ${(x) => x / 0}       | ${(x) => x / 0}       | ${(x) => x / 0}  | ${2}
		${() => ['a']}      | ${(x) => [...x, 'b']} | ${(x) => [...x, 'c']} | ${(x) => [...x]} | ${4}
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
		initialState                              | firstState            | secondState           | thirdState                 | expected
		${undefined}                              | ${1}                  | ${2}                  | ${3}                       | ${3}
		${undefined}                              | ${undefined}          | ${1}                  | ${2}                       | ${2}
		${0}                                      | ${0}                  | ${0}                  | ${0}                       | ${0}
		${'test'}                                 | ${'test2'}            | ${'test2'}            | ${'test2'}                 | ${'test2'}
		${0}                                      | ${(x) => x + 1}       | ${1}                  | ${(x) => x + 1}            | ${2}
		${() => null}                             | ${() => null}         | ${() => null}         | ${'test'}                  | ${'test'}
		${'test'}                                 | ${(x) => x}           | ${(x) => x}           | ${(x) => x}                | ${'test'}
		${() => 1}                                | ${(x) => x - 1}       | ${(x) => x + 1}       | ${(x) => x - 1}            | ${0}
		${() => 'test'}                           | ${'test'}             | ${(x) => x + 'test'}  | ${'test'}                  | ${'test'}
		${false}                                  | ${true}               | ${false}              | ${false}                   | ${false}
		${false}                                  | ${1}                  | ${'test'}             | ${undefined}               | ${undefined}
		${() => false}                            | ${(x) => !x}          | ${true}               | ${true}                    | ${true}
		${() => 'test'}                           | ${false}              | ${[true]}             | ${'test'}                  | ${'test'}
		${() => 1}                                | ${(x) => x / 0}       | ${(x) => x / 0}       | ${(x) => x / 0}            | ${Number.POSITIVE_INFINITY}
		${() => ['a']}                            | ${(x) => [...x, 'b']} | ${(x) => [...x, 'c']} | ${(x) => [...x]}           | ${['a', 'b', 'c']}
		${() => new Date('2000-01-01T00:00:00Z')} | ${(x) => x}           | ${(x) => x}           | ${(x) => x.toISOString()}  | ${'2000-01-01T00:00:00.000Z'}
		${''}                                     | ${{}}                 | ${(x) => x}           | ${(x) => ({ ...x, a: 1 })} | ${{ a: 1 }}
		${Boolean}                                | ${(x) => x}           | ${(x) => new x()}     | ${(x) => x.valueOf()}      | ${false}
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

	it.each`
		initialState        | firstState            | secondState           | thirdState       | expectedNumberOfTimes
		${0}                | ${(x) => x + 1}       | ${1}                  | ${(x) => x + 1}  | ${2}
		${() => null}       | ${() => null}         | ${() => null}         | ${'test'}        | ${2}
		${undefined}        | ${1}                  | ${2}                  | ${3}             | ${3}
		${undefined}        | ${undefined}          | ${1}                  | ${2}             | ${3}
		${0}                | ${0}                  | ${0}                  | ${0}             | ${1}
		${'test'}           | ${'test2'}            | ${'test2'}            | ${'test2'}       | ${1}
		${{}}               | ${{}}                 | ${{}}                 | ${{}}            | ${3}
		${'test'}           | ${(x) => x}           | ${(x) => x}           | ${(x) => x}      | ${1}
		${[]}               | ${[]}                 | ${[]}                 | ${() => []}      | ${3}
		${() => 1}          | ${(x) => x - 1}       | ${(x) => x + 1}       | ${(x) => x - 1}  | ${3}
		${() => 'test'}     | ${'test'}             | ${(x) => x + 'test'}  | ${'test'}        | ${3}
		${false}            | ${true}               | ${false}              | ${false}         | ${2}
		${false}            | ${1}                  | ${'test'}             | ${undefined}     | ${3}
		${() => new Date()} | ${new Date()}         | ${() => new Date()}   | ${(x) => x}      | ${2}
		${() => false}      | ${(x) => !x}          | ${true}               | ${true}          | ${1}
		${() => 'test'}     | ${false}              | ${[true]}             | ${'test'}        | ${3}
		${() => 1}          | ${(x) => x / 0}       | ${(x) => x / 0}       | ${(x) => x / 0}  | ${1}
		${() => ['a']}      | ${(x) => [...x, 'b']} | ${(x) => [...x, 'c']} | ${(x) => [...x]} | ${3}
	`(
		'returns an observable which emits $expectedNumberOfTimes times, when called with $initialState, then setState is called with $firstState, then the returned observable is subscribed to, then setState is called with $secondState, then setState is called with $thirdState',
		({ initialState, firstState, secondState, thirdState, expectedNumberOfTimes }) => {
			const { result } = renderUseStateObservableHook([initialState]);
			const [state$, setState] = result.current;

			setState(firstState);
			const mockNext = jest.fn();
			const subscription = state$.subscribe({
				next: mockNext,
			});
			setState(secondState);
			setState(thirdState);

			expect(mockNext).toBeCalledTimes(expectedNumberOfTimes);

			subscription.unsubscribe();
		}
	);

	it('only calls initialState once, when re-rendered twice', () => {
		const mockInitialState = jest.fn().mockReturnValue(undefined);
		const { rerender } = renderUseStateObservableHook([mockInitialState]);
		rerender([mockInitialState]);
		rerender([mockInitialState]);

		expect(mockInitialState).toHaveBeenCalledTimes(1);
	});
});
