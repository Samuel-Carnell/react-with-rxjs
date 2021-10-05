import { act, Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { EMPTY, Observable, Subject, throwError, BehaviorSubject, ReplaySubject } from 'rxjs';
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

describe('useIsComplete', () => {
	it('initially returns false', () => {
		const { result } = renderUseIsComplete([new Observable()]);
		expect(result.current).toBe(false);
	});

	it('returns false when given a subject which emits a value', () => {
		const subject = new Subject();
		const { result } = renderUseIsComplete([subject]);
		act(() => subject.next('test'));
		expect(result.current).toEqual(false);
	});

	it('throws an error when called with an observable which throws an error', () => {
		const error = new Error();
		const observable = throwError(() => error);

		const { result } = renderUseIsComplete([observable]);
		expect(result.error).toBe(error);
	});

	it('returns true when called with an observable which immediately completes', () => {
		const observable = EMPTY;
		const { result } = renderUseIsComplete([observable]);

		expect(result.current).toBe(true);
	});

	it('returns true when called with a subject which completes', () => {
		const subject = new Subject();
		const { result } = renderUseIsComplete([subject]);
		act(() => subject.complete());

		expect(result.current).toBe(true);
	});

	it('returns true when called with a subject that has already completed', () => {
		const subject = new Subject();
		subject.complete();
		const { result } = renderUseIsComplete([subject]);

		expect(result.current).toBe(true);
	});

	it('returns false when called with a completed observable, then re-rendered with a uncompleted observable', () => {
		const observable = EMPTY;
		const { result, rerender } = renderUseIsComplete([observable]);
		rerender([new Observable()]);

		expect(result.current).toBe(false);
	});

	it('returns false when called with an observable which throws an error, then re-rendered with an incomplete observable', () => {
		const error = new Error();
		const observable = throwError(() => error);
		const { result, rerender } = renderUseIsComplete([observable]);
		rerender([new Observable()]);

		expect(result.current).toBe(false);
	});

	it('returns true when called with an incomplete observable, then re-rendered with a completed observable', () => {
		const { result, rerender } = renderUseIsComplete([new Observable()]);
		rerender([EMPTY]);

		expect(result.current).toBe(true);
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
		const { result } = renderUseIsComplete([notObservable]);
		expect(result.error).toBeInstanceOf(TypeError);
	});

	it.each`
		observable
		${new Observable()}
		${new Subject()}
		${new BehaviorSubject(null)}
		${new ReplaySubject(0)}
	`('does not throw a TypeError when given $observable', ({ observable }) => {
		const { result } = renderUseIsComplete([observable]);
		expect(result.error).toBeUndefined();
	});
});
