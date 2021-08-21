import { act, Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import {
	asyncScheduler,
	AsyncSubject,
	BehaviorSubject,
	ConnectableObservable,
	EMPTY,
	NEVER,
	noop,
	Observable,
	of,
	range,
	ReplaySubject,
	scheduled,
	Subject,
	throwError,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { useLatestValue } from './use-latest-value';

type useLatestValueParams = Parameters<typeof useLatestValue>;
type useLatestValueReturn = ReturnType<typeof useLatestValue>;

function renderUseLatestValue(
	initialParams: useLatestValueParams
): RenderHookResult<useLatestValueParams, useLatestValueReturn, Renderer<useLatestValueParams>> {
	return renderHook((params: useLatestValueParams) => useLatestValue(...params), {
		initialProps: initialParams,
	});
}

describe.only('useLatestValue', () => {
	it.each`
		observable
		${new Observable()}
		${new ConnectableObservable(new Observable(), () => new Subject())}
		${new Subject()}
		${new ReplaySubject(0)}
		${new AsyncSubject()}
	`('initially returns undefined when given $observable', ({ observable }) => {
		const { result } = renderUseLatestValue([observable]);
		expect(result.current).toBe(undefined);
	});

	it.each`
		value
		${() => {}}
		${function* () {}}
		${new Function()}
		${{ a: 'test' }}
		${0}
		${null}
		${100}
		${'test'}
		${Math.abs}
		${Number.NaN}
		${Boolean}
		${false}
		${true}
		${[]}
		${new String()}
		${undefined}
		${Function}
		${EMPTY}
	`(
		'initially returns $value when given an behavior subject with an initial value of $value',
		({ value }) => {
			const behaviorSubject = new BehaviorSubject(value);
			const { result } = renderUseLatestValue([behaviorSubject]);
			expect(result.current).toBe(value);
		}
	);

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
			const { result } = renderUseLatestValue([subject]);
			act(() => subject.next(value));
			expect(result.current).toBe(value);
		}
	);

	it.each`
		observable                     | expected
		${of(1, 2, 3)}                 | ${[undefined, 3]}
		${of(false)}                   | ${[undefined, false]}
		${of('a', 'b', 'c', 'd')}      | ${[undefined, 'd']}
		${EMPTY}                       | ${[undefined]}
		${NEVER}                       | ${[undefined]}
		${throwError(new TypeError())} | ${[undefined, new TypeError()]}
		${throwError('error')}         | ${[undefined, 'error']}
		${new BehaviorSubject('test')} | ${['test']}
		${range(1, 1000)}              | ${[undefined, 1000]}
	`('returns $expected when given $initialValue and $observable ', ({ observable, expected }) => {
		const { result } = renderUseLatestValue([observable]);
		expect(result.all).toEqual(expected);
	});

	it.each`
		observable                      | expected
		${of(1, 2, 3)}                  | ${[undefined, 'test', 'test', 3]}
		${of(false)}                    | ${[undefined, 'test', 'test', false]}
		${of('a', 'b', 'c', 'd')}       | ${[undefined, 'test', 'test', 'd']}
		${of('a', 'b', 'c', 'test')}    | ${[undefined, 'test', 'test', 'test']}
		${of('a', 'a', 'a', 'a', 'a')}  | ${[undefined, 'test', 'test', 'a']}
		${EMPTY}                        | ${[undefined, 'test', 'test']}
		${EMPTY.pipe(map(noop))}        | ${[undefined, 'test', 'test']}
		${NEVER}                        | ${[undefined, 'test', 'test']}
		${NEVER.pipe(map(noop))}        | ${[undefined, 'test', 'test']}
		${throwError(new TypeError())}  | ${[undefined, 'test', 'test', new TypeError()]}
		${throwError('error')}          | ${[undefined, 'test', 'test', 'error']}
		${new BehaviorSubject('test')}  | ${[undefined, 'test', 'test']}
		${new BehaviorSubject('test2')} | ${[undefined, 'test', 'test', 'test2']}
		${range(1, 1000)}               | ${[undefined, 'test', 'test', 1000]}
	`(
		'returns $expected when given an observable of "test", then re-rendered with $observable',
		({ observable, expected }) => {
			const { result, rerender } = renderUseLatestValue([of('test')]);
			rerender([observable]);
			expect(result.all).toEqual(expected);
		}
	);

	it.each`
		observable                                                 | expected
		${scheduled(of('e', 'f', 'g'), asyncScheduler)}            | ${[undefined, 'test', 'test', 'e', 'f', 'g']}
		${scheduled(of(1, 2, 3), asyncScheduler)}                  | ${[undefined, 'test', 'test', 1, 2, 3]}
		${scheduled(of(false), asyncScheduler)}                    | ${[undefined, 'test', 'test', false]}
		${scheduled(new BehaviorSubject('test2'), asyncScheduler)} | ${[undefined, 'test', 'test', 'test2']}
		${scheduled(range(1, 5), asyncScheduler)}                  | ${[undefined, 'test', 'test', 1, 2, 3, 4, 5]}
		${throwError(new Error(), asyncScheduler)}                 | ${[undefined, 'test', 'test', new Error()]}
	`(
		'returns $expected when given an observable of "test, then re-rendered with $observable',
		async ({ observable, expected }) => {
			const { result, rerender, waitForNextUpdate } = renderUseLatestValue([of('test')]);
			rerender([observable]);
			await waitForNextUpdate();
			expect(result.all).toEqual(expected);
		}
	);

	it.each`
		observable                      | expected
		${of(1, 2, 3)}                  | ${[undefined, undefined, 3]}
		${of(false)}                    | ${[undefined, undefined, false]}
		${of('a', 'b', 'c', 'd')}       | ${[undefined, undefined, 'd']}
		${of('a', 'b', 'c', 'test')}    | ${[undefined, undefined, 'test']}
		${EMPTY}                        | ${[undefined, undefined]}
		${EMPTY.pipe(map(noop))}        | ${[undefined, undefined]}
		${NEVER}                        | ${[undefined, undefined]}
		${NEVER.pipe(map(noop))}        | ${[undefined, undefined]}
		${throwError(new TypeError())}  | ${[undefined, undefined, new TypeError()]}
		${throwError('error')}          | ${[undefined, undefined, 'error']}
		${new BehaviorSubject('test')}  | ${[undefined, undefined, 'test']}
		${new BehaviorSubject('test2')} | ${[undefined, undefined, 'test2']}
		${range(1, 1000)}               | ${[undefined, undefined, 1000]}
	`(
		"returns $expected when given an observable which doesn't complete, then re-rendered with $observable",
		({ observable, expected }) => {
			const { result, rerender } = renderUseLatestValue([NEVER]);
			rerender([observable]);
			expect(result.all).toEqual(expected);
		}
	);

	it.each`
		observable                                                 | expected
		${scheduled(of('e', 'f', 'g'), asyncScheduler)}            | ${[undefined, undefined, 'e', 'f', 'g']}
		${scheduled(of(1, 2, 3), asyncScheduler)}                  | ${[undefined, undefined, 1, 2, 3]}
		${scheduled(of(false), asyncScheduler)}                    | ${[undefined, undefined, false]}
		${scheduled(of('a', 'a', 'a', 'a', 'a'), asyncScheduler)}  | ${[undefined, undefined, 'a', 'a']}
		${scheduled(new BehaviorSubject('test2'), asyncScheduler)} | ${[undefined, undefined, 'test2']}
		${scheduled(range(1, 5), asyncScheduler)}                  | ${[undefined, undefined, 1, 2, 3, 4, 5]}
		${throwError(new Error(), asyncScheduler)}                 | ${[undefined, undefined, new Error()]}
	`(
		"returns $expected when given an observable which doesn't complete, then re-rendered with $observable",
		async ({ observable, expected }) => {
			const { result, rerender, waitForNextUpdate } = renderUseLatestValue([NEVER]);
			rerender([observable]);
			await waitForNextUpdate();
			expect(result.all).toEqual(expected);
		}
	);

	it.each`
		observable                                                 | expected
		${scheduled(of('e', 'f', 'g'), asyncScheduler)}            | ${[undefined, 'e', 'f', 'g', 'g']}
		${scheduled(of(1, 2, 3), asyncScheduler)}                  | ${[undefined, 1, 2, 3, 3]}
		${scheduled(of(false), asyncScheduler)}                    | ${[undefined, false, false]}
		${scheduled(of('a', 'a', 'a', 'a', 'a'), asyncScheduler)}  | ${[undefined, 'a', 'a', 'a']}
		${scheduled(new BehaviorSubject('test2'), asyncScheduler)} | ${[undefined, 'test2', 'test2']}
		${scheduled(range(1, 5), asyncScheduler)}                  | ${[undefined, 1, 2, 3, 4, 5, 5]}
		${throwError(new Error(), asyncScheduler)}                 | ${[undefined, new Error(), undefined]}
	`(
		'returns $expected when given $observable, then re-rendered with the same observable',
		async ({ observable, expected }) => {
			const { result, rerender, waitForNextUpdate } = renderUseLatestValue([observable]);
			await waitForNextUpdate();
			rerender([observable]);
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
		const { result } = renderUseLatestValue([notObservable]);
		expect(result.error).toBeInstanceOf(TypeError);
	});

	it('re throws errors thrown by the given observable', () => {
		const error = new Error();
		const { result } = renderUseLatestValue([throwError(() => error)]);
		expect(result.error).toEqual(error);
	});

	it.each`
		observable                      | expected
		${of(1, 2, 3)}                  | ${[undefined, new Error(), undefined, 3]}
		${of(false)}                    | ${[undefined, new Error(), undefined, false]}
		${of('a', 'b', 'c', 'd')}       | ${[undefined, new Error(), undefined, 'd']}
		${EMPTY}                        | ${[undefined, new Error(), undefined]}
		${NEVER}                        | ${[undefined, new Error(), undefined]}
		${NEVER.pipe(map(noop))}        | ${[undefined, new Error(), undefined]}
		${of('a', 'a', 'a', 'a', 'a')}  | ${[undefined, new Error(), undefined, 'a']}
		${new BehaviorSubject('test2')} | ${[undefined, new Error(), 'test2']}
		${range(1, 5)}                  | ${[undefined, new Error(), undefined, 5]}
		${throwError(new TypeError())}  | ${[undefined, new Error(), undefined, new TypeError()]}
		${throwError('error')}          | ${[undefined, new Error(), undefined, 'error']}
	`(
		'returns $expected when given an observable which throws an error, then re-rendered with $observable',
		({ observable, expected }) => {
			const { result, rerender } = renderUseLatestValue([throwError(() => new Error())]);
			rerender([observable]);
			expect(result.all).toEqual(expected);
		}
	);

	it.each`
		observable                                                 | expected
		${scheduled(of('e', 'f', 'g'), asyncScheduler)}            | ${[undefined, new Error(), undefined, 'e', 'f', 'g']}
		${scheduled(of(1, 2, 3), asyncScheduler)}                  | ${[undefined, new Error(), undefined, 1, 2, 3]}
		${scheduled(of(false), asyncScheduler)}                    | ${[undefined, new Error(), undefined, false]}
		${scheduled(new BehaviorSubject('test2'), asyncScheduler)} | ${[undefined, new Error(), undefined, 'test2']}
		${scheduled(range(1, 5), asyncScheduler)}                  | ${[undefined, new Error(), undefined, 1, 2, 3, 4, 5]}
		${throwError(new Error(), asyncScheduler)}                 | ${[undefined, new Error(), undefined, new Error()]}
	`(
		'returns $expected when given an observable which throws an error, then re-rendered with $observable',
		async ({ observable, expected }) => {
			const { result, rerender, waitForNextUpdate } = renderUseLatestValue([
				throwError(() => new Error()),
			]);
			rerender([observable]);
			await waitForNextUpdate();
			expect(result.all).toEqual(expected);
		}
	);
});
