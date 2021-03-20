import { useSubject } from './use-subject';
import { AsyncSubject, BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import React from 'react';

type useSubjectParams = Parameters<typeof useSubject>;
type useSubjectReturn = ReturnType<typeof useSubject>;

function renderUseSubjectHook(
	initialParams: useSubjectParams
): RenderHookResult<useSubjectParams, useSubjectReturn, Renderer<useSubjectParams>> {
	return renderHook((params: useSubjectParams) => useSubject(...params), {
		initialProps: initialParams,
	});
}

describe('useObservable', () => {
	it.each`
		subject
		${new Subject()}
		${new BehaviorSubject('')}
		${new ReplaySubject(0)}
		${new AsyncSubject()}
	`('returns the $subject produced by the subjectFactory callback', ({ subject }) => {
		const mockSubjectFactory = jest.fn().mockReturnValue(subject);
		const { result } = renderUseSubjectHook([mockSubjectFactory]);
		expect(result.current).toBe(subject);
	});

	it('calls the subjectFactory callback once when called with no dependencies', () => {
		const mockSubject = new Subject();
		const mockSubjectFactory = jest.fn().mockReturnValue(mockSubject);
		const { rerender } = renderUseSubjectHook([mockSubjectFactory]);
		rerender([mockSubjectFactory]);
		rerender([mockSubjectFactory]);
		rerender([mockSubjectFactory]);
		expect(mockSubjectFactory).toHaveBeenCalledTimes(1);
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
		'calls the subjectFactory callback once when called with $dependencies dependencies multiple times',
		({ dependencies }) => {
			const mockSubject = new Subject();
			const mockSubjectFactory = jest.fn().mockReturnValue(mockSubject);
			const { rerender } = renderUseSubjectHook([mockSubjectFactory, dependencies]);
			rerender([mockSubjectFactory, dependencies]);
			rerender([mockSubjectFactory, dependencies]);
			rerender([mockSubjectFactory, dependencies]);
			expect(mockSubjectFactory).toHaveBeenCalledTimes(1);
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
		'calls the subject callback $expectedNumberOfTimesCalled times when called with $firstDependencies dependencies, then $secondDependencies dependencies, then $thirdDependencies dependencies',
		({ firstDependencies, secondDependencies, thirdDependencies, expectedNumberOfTimesCalled }) => {
			const mockSubject = new Subject();
			const mockSubjectFactory = jest.fn().mockReturnValue(mockSubject);
			const { rerender } = renderUseSubjectHook([mockSubjectFactory, firstDependencies]);
			rerender([mockSubjectFactory, secondDependencies]);
			rerender([mockSubjectFactory, thirdDependencies]);
			expect(mockSubjectFactory).toHaveBeenCalledTimes(expectedNumberOfTimesCalled);
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
		const mockSubject = new Subject();
		const mockSubjectFactory = jest.fn().mockReturnValue(mockSubject);
		const { result } = renderUseSubjectHook([mockSubjectFactory, dependencies]);
		expect(result.error).toBeInstanceOf(TypeError);
	});

	it.each`
		subjectFactoryReturnValue
		${'test'}
		${''}
		${null}
		${undefined}
		${{}}
		${new Event('')}
		${12345}
		${true}
	`(
		'throws a types error when subjectFactory callback returns $subjectFactoryReturnValue',
		({ subjectFactoryReturnValue }) => {
			const mockSubjectFactory = jest.fn().mockReturnValue(subjectFactoryReturnValue);
			const { result } = renderUseSubjectHook([mockSubjectFactory]);
			expect(result.error).toBeInstanceOf(TypeError);
		}
	);
});
