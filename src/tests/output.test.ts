import { bind } from '../bind';
import { act, renderHook } from '@testing-library/react-hooks';
import { Observable, Subject } from 'rxjs';

describe('output tests', () => {
	it('returns the synchronous value that the observables emits at the point of subscription on the initial render', () => {
		const observable = new Observable((observer) => {
			observer.next('test');
		});
		const hook = bind(() => {
			return { value: observable };
		});
		const { result } = renderHook(() => hook());
		const { value } = result.current;
		expect(value).toBe('test');
	});

	it('returns the last synchronous value that the observables emits at the point of subscription on the initial render', () => {
		const observable = new Observable((observer) => {
			observer.next(1);
			observer.next(10);
			observer.next(100);
		});
		const hook = bind(() => {
			return { value: observable };
		});
		const { result } = renderHook(() => hook());
		const { value } = result.current;
		expect(value).toBe(100);
	});

	it('rerenders the component and returns the last synchronous value that the observables emits when it starts emitting values synchronously after an asynchronous period of time', async () => {
		const observable = new Observable((observer) => {
			setTimeout(() => {
				observer.next(1);
				observer.next(10);
				observer.next(100);
			}, 0);
		});
		const hook = bind(() => {
			return { value: observable };
		});
		const { result, waitForNextUpdate } = renderHook(() => hook());
		await waitForNextUpdate();
		const { value } = result.current;
		expect(value).toBe(100);
	});

	it('calls the cleanup function on any observables returned by the getState function when the component unmounts', () => {
		const cleanup = jest.fn();
		const observable = new Observable(() => cleanup);
		const hook = bind(() => {
			return [observable];
		});
		const { unmount } = renderHook(() => hook());
		unmount();
		expect(cleanup).toBeCalled();
	});

	it('returns undefined when the observables does emit a value at the point of subscription', () => {
		const subject = new Subject();
		const hook = bind(() => {
			return { value: subject };
		});
		const { result } = renderHook(() => hook());
		const { value } = result.current;
		expect(value).toBe(undefined);
	});

	it('rerenders the component and returns the observables current value, after the observable has emitted a new value', async () => {
		const subject = new Subject();
		const hook = bind(() => {
			return { value: subject };
		});
		const { result, waitForNextUpdate } = renderHook(() => hook());
		act(() => subject.next(1));
		await waitForNextUpdate();
		const { value } = result.current;
		expect(value).toBe(1);
	});

	it('rerenders the component and returns the same object reference emitted by the observable, after the observable has emitted a new object', async () => {
		const obj = {};
		const subject = new Subject();
		const hook = bind(() => {
			return { value: subject };
		});
		const { result, waitForNextUpdate } = renderHook(() => hook());
		act(() => subject.next(obj));
		await waitForNextUpdate();
		const { value } = result.current;
		expect(value).toBe(obj);
	});

	it('returns the observables current value when the hook is re rendered multiple times', async () => {
		const subject = new Subject();
		const hook = bind(() => {
			return { value: subject };
		});
		const { result, waitForNextUpdate, rerender } = renderHook(() => hook());
		act(() => subject.next(1));
		await waitForNextUpdate();
		rerender();
		rerender();
		rerender();
		rerender();
		rerender();
		const { value } = result.current;
		expect(value).toBe(1);
	});

	it('throws a component error when the observables emits an error', async () => {
		const err = new Error();
		const subject = new Subject();
		const hook = bind(() => {
			return { value: subject };
		});
		const { result, waitForNextUpdate } = renderHook(() => hook());
		act(() => subject.error(err));
		await waitForNextUpdate();
		expect(result.error).toBe(err);
	});
});
