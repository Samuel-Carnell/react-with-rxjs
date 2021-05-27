import { act, Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import {
	asyncScheduler,
	AsyncSubject,
	BehaviorSubject,
	ConnectableObservable,
	EMPTY,
	GroupedObservable,
	NEVER,
	noop,
	Observable,
	of,
	ReplaySubject,
	scheduled,
	Subject,
	throwError,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { useIsComplete } from './use-is-complete';

type useIsCompleteParams = Parameters<typeof useIsComplete>;
type useIsCompleteReturn = ReturnType<typeof useIsComplete>;

function renderUseIsComplete(
	initialParams: useIsCompleteParams
): RenderHookResult<useIsCompleteParams, useIsCompleteReturn, Renderer<useIsCompleteParams>> {
	return renderHook((params: useIsCompleteParams) => useIsComplete(...params), {
		initialProps: initialParams,
	});
}

describe.only('useObservableState', () => {
	it.each`
		observable
		${new Observable()}
		${new ConnectableObservable(new Observable(), () => new Subject())}
		${new GroupedObservable('', new Subject())}
		${new Subject()}
		${new BehaviorSubject('')}
		${new ReplaySubject(0)}
		${new AsyncSubject()}
	`('initially returns false when given $observable', ({ observable }) => {
		const { result } = renderUseIsComplete([observable]);
		expect(result.current).toBe(false);
	});

	it.each`
		value
		${'value2'}
		${{}}
		${Number.MIN_VALUE}
		${[]}
		${undefined}
		${null}
		${new Date(2000, 4, 15, 9, 55)}
	`(
		'returns false when given a subject which emits $value after the initial render',
		({ value }) => {
			const subject = new Subject();
			const { result } = renderUseIsComplete([subject]);
			act(() => subject.next(value));
			expect(result.current).toEqual(false);
		}
	);

	it.each`
		observable                     | expected
		${of(1, 2, 3)}                 | ${[false, true]}
		${of(false)}                   | ${[false, true]}
		${of('a', 'b', 'c', 'd')}      | ${[false, true]}
		${EMPTY}                       | ${[false, true]}
		${NEVER}                       | ${[false]}
		${throwError(new TypeError())} | ${[false, new TypeError()]}
		${throwError('error')}         | ${[false, 'error']}
	`('returns $expected when given $initialValue and $observable ', ({ observable, expected }) => {
		const { result } = renderUseIsComplete([observable]);
		expect(result.all).toEqual(expected);
	});

	it.each`
		observable                     | expected
		${of(1, 2, 3)}                 | ${[false, true, true, true]}
		${of(false)}                   | ${[false, true, true, true]}
		${of('a', 'b', 'c', 'd')}      | ${[false, true, true, true]}
		${EMPTY}                       | ${[false, true, true]}
		${EMPTY.pipe(map(noop))}       | ${[false, true, true, true]}
		${NEVER}                       | ${[false, true, true, false]}
		${throwError(new TypeError())} | ${[false, true, true, new TypeError()]}
		${throwError('error')}         | ${[false, true, true, 'error']}
	`(
		'returns $expected when given an empty observable, then re-rendered with $observable',
		({ observable, expected }) => {
			const { result, rerender } = renderUseIsComplete([EMPTY]);
			rerender([observable]);
			expect(result.all).toEqual(expected);
		}
	);

	it.each`
		observable                                      | expected
		${scheduled(of('e', 'f', 'g'), asyncScheduler)} | ${[false, true, true, false, true]}
		${throwError(new Error(), asyncScheduler)}      | ${[false, true, true, false, new Error()]}
	`(
		'returns $expected when given an empty observable, then re-rendered with $observable',
		async ({ observable, expected }) => {
			const { result, rerender, waitForNextUpdate } = renderUseIsComplete([EMPTY]);
			rerender([observable]);
			await waitForNextUpdate();
			expect(result.all).toEqual(expected);
		}
	);

	it.each`
		observable                     | expected
		${of(1, 2, 3)}                 | ${[false, false, true]}
		${of(false)}                   | ${[false, false, true]}
		${of('a', 'b', 'c', 'd')}      | ${[false, false, true]}
		${EMPTY}                       | ${[false, false, true]}
		${NEVER}                       | ${[false, false]}
		${NEVER.pipe(map(noop))}       | ${[false, false]}
		${throwError(new TypeError())} | ${[false, false, new TypeError()]}
		${throwError('error')}         | ${[false, false, 'error']}
	`(
		"returns $expected when given an observable which doesn't complete, then re-rendered with $observable",
		({ observable, expected }) => {
			const { result, rerender } = renderUseIsComplete([NEVER]);
			rerender([observable]);
			expect(result.all).toEqual(expected);
		}
	);

	it.each`
		observable                                      | expected
		${scheduled(of('e', 'f', 'g'), asyncScheduler)} | ${[false, false, true]}
		${throwError(new Error(), asyncScheduler)}      | ${[false, false, new Error()]}
	`(
		"returns $expected when given an observable which doesn't complete, then re-rendered with $observable",
		async ({ observable, expected }) => {
			const { result, rerender, waitForNextUpdate } = renderUseIsComplete([NEVER]);
			rerender([observable]);
			await waitForNextUpdate();
			expect(result.all).toEqual(expected);
		}
	);

	it.each`
		notObservable
		${null}
		${new Date()}
		${721}
		${[]}
		${{}}
		${undefined}
		${Symbol()}
		${() => {}}
		${new Error()}
		${/a/}
	`('throws a TypeError when given $notObservable', ({ notObservable }) => {
		const { result } = renderUseIsComplete([notObservable]);
		expect(result.error).toBeInstanceOf(TypeError);
	});
});
