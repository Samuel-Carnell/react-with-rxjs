import { useObservable } from './use-observable';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';

type useObservableParams = Parameters<typeof useObservable>;
type useObservableReturn = ReturnType<typeof useObservable>;

function renderUseObservableHook(
	initialParams: useObservableParams
): RenderHookResult<useObservableParams, useObservableReturn, Renderer<useObservableParams>> {
	return renderHook((params: useObservableParams) => useObservable(...params), {
		initialProps: initialParams,
	});
}

describe('useObservable', () => {
	it('calls the observableFactory', () => {
		const mockSubscriptionFactory = jest.fn().mockReturnValue(new Observable());
		renderUseObservableHook([mockSubscriptionFactory, []]);
		expect(mockSubscriptionFactory).toHaveBeenCalled();
	});

	it('returns the same observable returned from the observableFactory callback', () => {
		const observable = new Observable();
		const mockValueFactory = jest.fn().mockReturnValue(observable);
		const { result } = renderUseObservableHook([mockValueFactory, []]);
		expect(result.current).toBe(observable);
	});

	it('calls the observableFactory callback once when called with the same dependency array multiple times', () => {
		const dependencies = ['test'];
		const mockObservableFactory = jest.fn().mockReturnValue(new Observable());
		const { rerender } = renderUseObservableHook([mockObservableFactory, dependencies]);
		rerender([mockObservableFactory, dependencies]);
		rerender([mockObservableFactory, dependencies]);
		rerender([mockObservableFactory, dependencies]);
		expect(mockObservableFactory).toHaveBeenCalledTimes(1);
	});

	it('calls the observableFactory callback once when called multiple times with a new dependency array containing the same object reference', () => {
		const object = {};
		const mockObservableFactory = jest.fn().mockReturnValue(new Observable());
		const { rerender } = renderUseObservableHook([mockObservableFactory, [object]]);
		rerender([mockObservableFactory, [object]]);
		rerender([mockObservableFactory, [object]]);
		rerender([mockObservableFactory, [object]]);
		expect(mockObservableFactory).toHaveBeenCalledTimes(1);
	});

	it('calls the observableFactory callback once when called multiple times each a new dependency array containing the same value', () => {
		const mockObservableFactory = jest.fn().mockReturnValue(new Observable());
		const { rerender } = renderUseObservableHook([mockObservableFactory, [1]]);
		rerender([mockObservableFactory, [1]]);
		rerender([mockObservableFactory, [1]]);
		rerender([mockObservableFactory, [1]]);
		expect(mockObservableFactory).toHaveBeenCalledTimes(1);
	});

	it('returns the latest observable produced by the observableFactory callback when the dependencies have changed', () => {
		const firstObservable = new Observable();
		const secondObservable = new Observable();
		const thirdObservable = new Observable();
		const { rerender, result } = renderUseObservableHook([
			jest.fn().mockReturnValue(firstObservable),
			[1],
		]);
		rerender([jest.fn().mockReturnValue(secondObservable), [2]]);
		rerender([jest.fn().mockReturnValue(thirdObservable), [3]]);
		expect(result.current).toBe(thirdObservable);
	});

	it('does not use loose equality when checking if the dependencies have changed', () => {
		const mockObservableFactory = jest.fn().mockReturnValue(new Observable());
		const { rerender } = renderUseObservableHook([mockObservableFactory, [1]]);
		rerender([mockObservableFactory, ['1']]);
		expect(mockObservableFactory).toHaveBeenCalledTimes(2);
	});

	it('recalls the observableFactory when the dependencies change', () => {
		const mockObservableFactory = jest.fn().mockReturnValue(new Observable());
		const { rerender } = renderUseObservableHook([mockObservableFactory, ['a']]);
		rerender([mockObservableFactory, ['b']]);
		expect(mockObservableFactory).toHaveBeenCalledTimes(2);
	});

	it('calls the observableFactory twice when called twice with dependencies containing different objects with the same keys and values', () => {
		const mockObservableFactory = jest.fn().mockReturnValue(new Observable());
		const { rerender } = renderUseObservableHook([mockObservableFactory, [{ a: 1 }]]);
		rerender([mockObservableFactory, [{ a: 1 }]]);
		expect(mockObservableFactory).toHaveBeenCalledTimes(2);
	});

	it('calls the observableFactory 4 times when called 4 times with alternating values', () => {
		const mockObservableFactory = jest.fn().mockReturnValue(new Observable());
		const { rerender } = renderUseObservableHook([mockObservableFactory, [1]]);
		rerender([mockObservableFactory, [2]]);
		rerender([mockObservableFactory, [1]]);
		rerender([mockObservableFactory, [2]]);
		expect(mockObservableFactory).toHaveBeenCalledTimes(4);
	});

	it.each`
		observableFactoryReturnValue
		${'test'}
		${''}
		${null}
		${undefined}
		${{}}
		${new Event('')}
		${12345}
		${true}
		${/test/}
		${() => {}}
	`(
		'throws a types error when the observableFactory callback returns $observableFactoryReturnValue',
		({ observableFactoryReturnValue }) => {
			const observableFactory = jest.fn().mockReturnValue(observableFactoryReturnValue);
			const { result } = renderUseObservableHook([observableFactory]);
			expect(result.error).toBeInstanceOf(TypeError);
		}
	);

	it.each`
		observableFactoryReturnValue
		${new Observable()}
		${new Subject()}
		${new BehaviorSubject(null)}
		${new ReplaySubject()}
	`(
		'does not throw a type error when the observableFactory returns $observableFactoryReturnValue',
		({ observableFactoryReturnValue }) => {
			const observableFactory = jest.fn().mockReturnValue(observableFactoryReturnValue);
			const { result } = renderUseObservableHook([observableFactory]);
			expect(result.error).toBeUndefined();
		}
	);

	it.each`
		notAFunction
		${null}
		${undefined}
		${1}
		${false}
		${{}}
		${[]}
	`('throws a type error when given $notAFunction', ({ notAFunction }) => {
		const { result } = renderUseObservableHook([notAFunction]);
		expect(result.error).toBeInstanceOf(TypeError);
	});

	it('does not throw an error when called with a function', () => {
		const { result } = renderUseObservableHook([jest.fn().mockReturnValue(new Observable())]);
		expect(result.error).toBeUndefined();
	});

	it.each`
		notAnArray
		${null}
		${1}
		${false}
		${{}}
		${() => {}}
	`('throws a type error when called with $notAnArray', ({ notAnArray }) => {
		const { result } = renderUseObservableHook([
			jest.fn().mockReturnValue(new Observable()),
			notAnArray,
		]);
		expect(result.error).toBeInstanceOf(TypeError);
	});

	it('does not throw an error when called with an array', () => {
		const { result } = renderUseObservableHook([jest.fn().mockReturnValue(new Observable()), []]);
		expect(result.error).toBeUndefined();
	});
});
