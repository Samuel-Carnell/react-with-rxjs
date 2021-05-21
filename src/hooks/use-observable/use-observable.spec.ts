import { useObservable } from './use-observable';
import {
	AsyncSubject,
	BehaviorSubject,
	ConnectableObservable,
	GroupedObservable,
	Observable,
	ReplaySubject,
	Subject,
} from 'rxjs';
import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import React from 'react';

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
	it.each`
		observable
		${new Observable()}
		${new ConnectableObservable(new Observable(), () => new Subject())}
		${new GroupedObservable('', new Subject())}
		${new Subject()}
		${new BehaviorSubject('')}
		${new ReplaySubject(0)}
		${new AsyncSubject()}
	`('returns the $observable produced by the observableFactory callback', ({ observable }) => {
		const mockObservableFactory = jest.fn().mockReturnValue(observable);
		const { result } = renderUseObservableHook([mockObservableFactory]);
		expect(result.current).toBe(observable);
	});

	it('calls the observableFactory callback once when called with no dependencies', () => {
		const mockObservable = new Observable();
		const mockObservableFactory = jest.fn().mockReturnValue(mockObservable);
		const { rerender } = renderUseObservableHook([mockObservableFactory]);
		rerender([mockObservableFactory]);
		rerender([mockObservableFactory]);
		rerender([mockObservableFactory]);
		expect(mockObservableFactory).toHaveBeenCalledTimes(1);
	});

	it.each`
		dependencies
		${[]}
		${[new Observable()]}
		${[new BehaviorSubject(1)]}
		${[[]]}
		${[Number.POSITIVE_INFINITY]}
		${['test']}
		${[{}]}
		${[() => {}]}
	`(
		'calls the observableFactory callback once when called with $dependencies dependencies multiple times',
		({ dependencies }) => {
			const mockObservable = new Observable();
			const mockObservableFactory = jest.fn().mockReturnValue(mockObservable);
			const { rerender } = renderUseObservableHook([mockObservableFactory, dependencies]);
			rerender([mockObservableFactory, dependencies]);
			rerender([mockObservableFactory, dependencies]);
			rerender([mockObservableFactory, dependencies]);
			expect(mockObservableFactory).toHaveBeenCalledTimes(1);
		}
	);

	it.each`
		firstDependencies     | secondDependencies    | thirdDependencies     | expectedNumberOfTimesCalled
		${['test']}           | ${['test']}           | ${['test']}           | ${1}
		${[1, 2, '']}         | ${[1, 3, '']}         | ${[1, 2, '']}         | ${3}
		${[1]}                | ${[1, 2]}             | ${[1, 2]}             | ${1}
		${[true]}             | ${[{}]}               | ${[1]}                | ${3}
		${['test']}           | ${['test']}           | ${[]}                 | ${1}
		${[parseInt('asdf')]} | ${[Number.NaN]}       | ${[parseInt('asdf')]} | ${1}
		${[new Observable()]} | ${[new Observable()]} | ${[new Observable()]} | ${3}
		${[[]]}               | ${[[]]}               | ${[[]]}               | ${3}
		${[100]}              | ${[100]}              | ${[100]}              | ${1}
		${[() => {}]}         | ${[() => {}]}         | ${[() => {}]}         | ${3}
	`(
		'calls the observableFactory callback $expectedNumberOfTimesCalled times when called with $firstDependencies dependencies, then $secondDependencies dependencies, then $thirdDependencies dependencies',
		({ firstDependencies, secondDependencies, thirdDependencies, expectedNumberOfTimesCalled }) => {
			const mockObservable = new Observable();
			const mockObservableFactory = jest.fn().mockReturnValue(mockObservable);
			const { rerender } = renderUseObservableHook([mockObservableFactory, firstDependencies]);
			rerender([mockObservableFactory, secondDependencies]);
			rerender([mockObservableFactory, thirdDependencies]);
			expect(mockObservableFactory).toHaveBeenCalledTimes(expectedNumberOfTimesCalled);
		}
	);

	it.each`
		dependencies
		${''}
		${true}
		${parseInt('asdf')}
		${Symbol()}
		${BigInt(1)}
		${() => {}}
		${React.createElement('div')}
	`('throws a types error when called with $dependencies dependencies', ({ dependencies }) => {
		const mockObservable = new Observable();
		const mockObservableFactory = jest.fn().mockReturnValue(mockObservable);
		const { result } = renderUseObservableHook([mockObservableFactory, dependencies]);
		expect(result.error).toBeInstanceOf(TypeError);
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
	`(
		'throws a types error when observableFactory callback returns $observableFactoryReturnValue',
		({ observableFactoryReturnValue }) => {
			const mockObservableFactory = jest.fn().mockReturnValue(observableFactoryReturnValue);
			const { result } = renderUseObservableHook([mockObservableFactory]);
			expect(result.error).toBeInstanceOf(TypeError);
		}
	);
});
