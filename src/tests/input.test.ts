import { renderHook } from '@testing-library/react-hooks';
import { Observable } from 'rxjs';
import { bind } from '../bind';

describe('input tests', () => {
	it('passes an observable to the getState callback which replays the value passed to the hook', () => {
		const value = 'test';
		let observable: Observable<unknown>;
		const hook = bind((input) => {
			observable = input;
			return {};
		});

		const {} = renderHook(({ value }) => hook(value), {
			initialProps: { value },
		});

		const next = jest.fn();
		const subscription = observable!.subscribe({
			next,
		});
		subscription.unsubscribe();
		expect(next).toHaveBeenNthCalledWith(1, value);
	});

	it('passes an observable to the getState callback which replays the same object reference passed to the hook', () => {
		const obj = 'test';
		let observable: Observable<unknown>;
		const hook = bind((input) => {
			observable = input;
			return {};
		});

		renderHook(({ value }) => hook(value), {
			initialProps: { value: obj },
		});

		const next = jest.fn();
		const subscription = observable!.subscribe({
			next,
		});
		subscription.unsubscribe();

		expect(next).toHaveBeenNthCalledWith(1, obj);
	});

	it('passes an observable to the getState callback which replays the latest value passed to the hook', () => {
		const value = 'd';
		let observable: Observable<unknown>;
		const hook = bind((input) => {
			observable = input;
			return {};
		});

		const { rerender } = renderHook(({ value }) => hook(value), {
			initialProps: { value: 'a' },
		});

		rerender({ value: 'b' });
		rerender({ value: 'c' });
		rerender({ value: value });

		const next = jest.fn();
		const subscription = observable!.subscribe({
			next,
		});
		subscription.unsubscribe();

		expect(next).toHaveBeenNthCalledWith(1, value);
	});

	it('passes an observable to the getState callback which emits the latest value passed to the hook, when the value has changed between renders', () => {
		const value = 'd';
		let observable: Observable<unknown>;
		const hook = bind((input) => {
			observable = input;
			return {};
		});

		const { rerender } = renderHook(({ value }) => hook(value), {
			initialProps: { value: 'a' },
		});

		const next = jest.fn();
		const subscription = observable!.subscribe({
			next,
		});
		rerender({ value: 'b' });
		rerender({ value: 'c' });
		rerender({ value: value });
		subscription.unsubscribe();

		expect(next).toHaveBeenNthCalledWith(4, value);
	});

	it('passes an observable which emits a synchronous value at subscription time and returns that value on the initial render', () => {
		const hook = bind((input) => {
			return { value: input };
		});

		const { result } = renderHook(({ value }) => hook(value), {
			initialProps: { value: 'a' },
		});
		const { value } = result.current;
		expect(value).toBe('a');
	});
});
