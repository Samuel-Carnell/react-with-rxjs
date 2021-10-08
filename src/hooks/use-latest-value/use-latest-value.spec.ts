import { act, Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import {
	asyncScheduler,
	BehaviorSubject,
	EMPTY,
	NEVER,
	Observable,
	of,
	scheduled,
	Subject,
	Subscription,
	throwError,
	ReplaySubject,
} from 'rxjs';
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

describe('useLatestValue', () => {
	it('initially returns undefined', () => {
		const { result } = renderUseLatestValue([new Observable()]);
		expect(result.current).toBeUndefined();
	});

	it('initially returns the current state of a behaviour subject if called with one', () => {
		const behaviorSubject = new BehaviorSubject('test');
		const { result } = renderUseLatestValue([behaviorSubject]);
		expect(result.current).toBe('test');
	});

	it('returns the value emitted by the given subject', () => {
		const subject = new Subject();
		const { result } = renderUseLatestValue([subject]);
		act(() => subject.next(1));
		expect(result.current).toBe(1);
	});

	it('returns the same object reference emitted by the given subject', () => {
		const object = {};
		const subject = new Subject();
		const { result } = renderUseLatestValue([subject]);
		act(() => subject.next(object));
		expect(result.current).toBe(object);
	});

	it('returns the latest value emitted by the given subject, when the hook is rendered multiple times', () => {
		const subject = new Subject();
		const { result, rerender } = renderUseLatestValue([subject]);
		act(() => subject.next(1));
		rerender();
		rerender();
		rerender();
		expect(result.current).toBe(1);
	});

	it('batches updates when the observable emits values synchronously', () => {
		const observable = of(1, 2, 3);
		const { result } = renderUseLatestValue([observable]);
		expect(result.all).toEqual([undefined, 3]);
	});

	it('does not batch updates when the observable emits values asynchronously', async () => {
		const observable = scheduled(of(1, 2, 3), asyncScheduler);
		const { result, waitForNextUpdate } = renderUseLatestValue([observable]);
		await waitForNextUpdate();
		expect(result.all).toEqual([undefined, 1, 2, 3]);
	});

	it('returns 1 when called with of(1), then called with an observable which never emits a value', () => {
		const { result, rerender } = renderUseLatestValue([of(1)]);
		rerender([NEVER]);
		expect(result.current).toBe(1);
	});

	it('returns the latest emitted value from the observable the hook was last called with', () => {
		const subject = new Subject();
		const { result, rerender } = renderUseLatestValue([subject]);
		act(() => subject.next(1));
		const subject2 = new Subject();
		rerender([subject2]);
		act(() => subject2.next(10));
		const subject3 = new Subject();
		rerender([subject3]);
		act(() => subject3.next(100));
		expect(result.current).toBe(100);
	});

	it("returns the latest emitted value from the subject the hook was initially called with, when it's rendered with another subject which does emit a value", () => {
		const subject = new Subject();
		const { result, rerender } = renderUseLatestValue([subject]);
		act(() => subject.next(1));
		const subject2 = new Subject();
		rerender([subject2]);
		expect(result.current).toBe(1);
	});

	it('returns undefined when called with an observable which immediately completes', () => {
		const { result } = renderUseLatestValue([EMPTY]);
		expect(result.current).toBeUndefined();
	});

	it('returns undefined when called with an observable which never completes', () => {
		const { result } = renderUseLatestValue([NEVER]);
		expect(result.current).toBeUndefined();
	});

	it('returns "test2" when called with of("test"), then called with new BehaviorSubject("test2")', () => {
		const { result, rerender } = renderUseLatestValue([of('test')]);
		rerender([new BehaviorSubject('test2')]);
		expect(result.current).toEqual('test2');
	});

	it('does not return values emitted from the first observable the hook was called with, when re-rendered with a different observable', async () => {
		const subject = new Subject();
		const { result, rerender } = renderUseLatestValue([subject]);
		act(() => subject.next(1));
		const subject2 = new Subject();
		rerender([subject2]);
		act(() => subject2.next(10));
		act(() => subject.next(2));
		act(() => subject.next(3));
		act(() => subject.next(4));
		expect(result.current).toBe(10);
	});

	it('unsubscribes from the observable when the component is unmounted', () => {
		const subscription = new Subscription();
		const unsubscribeSpy = jest.spyOn(subscription, 'unsubscribe');
		const subject = new Subject();
		jest.spyOn(subject, 'subscribe').mockReturnValue(subscription);

		const { unmount } = renderUseLatestValue([subject]);
		unmount();
		expect(unsubscribeSpy).toBeCalledTimes(1);
	});

	it('unsubscribes from the first observable when the hook is re-rendered with a different observable', () => {
		const subscription = new Subscription();
		const unsubscribeSpy = jest.spyOn(subscription, 'unsubscribe');
		const subject = new Subject();
		jest.spyOn(subject, 'subscribe').mockReturnValue(subscription);

		const { rerender } = renderUseLatestValue([subject]);
		rerender([new Observable()]);
		expect(unsubscribeSpy).toBeCalledTimes(1);
	});

	it('throws an error when called with an observable which throws an error', () => {
		const error = new Error();
		const observable = throwError(() => error);

		const { result } = renderUseLatestValue([observable]);
		expect(result.error).toBe(error);
	});

	it('does not throw an error when initially called with an observable which throws an error, and then is re-rendered with an observable which immediately completes', () => {
		const error = new Error();
		const observable = throwError(() => error);

		const { result, rerender } = renderUseLatestValue([observable]);
		rerender([EMPTY]);
		expect(result.error).toBeUndefined();
	});

	it('returns undefined when initially called with an observable which throws an error, and then is re-rendered with an observable which immediately completes', () => {
		const error = new Error();
		const observable = throwError(() => error);

		const { result, rerender } = renderUseLatestValue([observable]);
		rerender([EMPTY]);
		expect(result.current).toBeUndefined();
	});

	it('returns false when initially called with an observable which throws an error, and then is re-rendered with of(false)', async () => {
		const error = new Error();
		const observable = throwError(() => error);

		const { result, rerender, waitForNextUpdate } = renderUseLatestValue([observable]);
		rerender([scheduled(of(false), asyncScheduler)]);
		await waitForNextUpdate();
		expect(result.current).toBe(false);
	});

	it('does return values already emitted by the observable', () => {
		const subject = new Subject();
		act(() => subject.next(true));
		const { result } = renderUseLatestValue([subject]);
		expect(result.current).toBeUndefined();
	});

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

	it.each`
		observable
		${new Observable()}
		${new Subject()}
		${new BehaviorSubject(null)}
		${new ReplaySubject(0)}
	`('does not throw a TypeError when given $observable', ({ observable }) => {
		const { result } = renderUseLatestValue([observable]);
		expect(result.error).toBeUndefined();
	});
});
