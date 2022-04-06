import { bind } from '../bind';
import { act, renderHook } from '@testing-library/react-hooks';
import { Observable, Subject } from 'rxjs';

function timeout(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

describe('basic tests', () => {
	it('returns a copy of the object returned by the getState callback', () => {
		const stubReturnValue = {
			a: 'value',
			b: 2,
			c: () => {},
			obj: {},
			arr: [],
			bool: true,
			sym: Symbol(),
		};
		const hook = bind(() => stubReturnValue);
		const { result } = renderHook(() => hook());
		expect(result.current).toEqual(stubReturnValue);
	});

	it('returns a copy of the array returned by the getState callback', () => {
		const stubReturnValue = ['value', 2, () => {}, {}, [], true, Symbol()];
		const hook = bind(() => stubReturnValue);
		const { result } = renderHook(() => hook());
		expect(result.current).toEqual(stubReturnValue);
	});

	it('returns a copy of the object returned by the getState callback after multiple re renders', () => {
		const stubReturnValue = {
			a: 'value',
			b: 2,
			c: () => {},
			obj: {},
			arr: [],
			bool: true,
			sym: Symbol(),
		};
		const hook = bind(() => stubReturnValue);
		const { result, rerender } = renderHook(() => hook());
		rerender();
		rerender();
		rerender();
		rerender();
		expect(result.current).toEqual(stubReturnValue);
	});

	it('throws an error if the getState function throws an error', () => {
		const error = new Error();
		const hook = bind(() => {
			throw error;
		});
		const { result } = renderHook(() => hook());
		expect(result.error).toBe(error);
	});

	it('deschedules any rerenders if a render has occurred for some other reason', async () => {
		const subject = new Subject();
		const hook = bind(() => {
			return [subject.asObservable()];
		});
		const { waitForNextUpdate, rerender } = renderHook(() => hook());
		act(() => subject.next('test'));
		rerender();
		// check that the hook doesn't re rendered
		const value = await Promise.race([
			waitForNextUpdate().then(() => 'NOT_TIMED_OUT'),
			timeout(100).then(() => 'TIMED_OUT'),
		]);
		expect(value).toBe('TIMED_OUT');
	});

	it.each`
		returnValue
		${new Observable()}
		${'string'}
		${100}
		${new Date()}
		${() => {}}
		${function () {}}
	`('throws an error when getState returns $returnValue', ({ returnValue }) => {
		const hook = bind(() => {
			return returnValue;
		});
		const { result } = renderHook(() => hook());
		expect(result.error).toBeInstanceOf(Error);
	});
});
