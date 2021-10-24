import {
	act,
	Renderer,
	renderHook,
	RenderHookResult,
	WrapperComponent,
} from '@testing-library/react-hooks';
import React, { Context, createContext, FunctionComponent, useState } from 'react';
import { useContextObservable } from './use-context-observable';

type useContextObservableParams = Parameters<typeof useContextObservable>;
type useContextObservableReturn = ReturnType<typeof useContextObservable>;

function createMockContextProvider<T>(
	context: Context<T>,
	initialValue: T
): [Function, FunctionComponent] {
	let updateState: Function = () => {};
	const component: FunctionComponent = ({ children }) => {
		const state = useState<T>(initialValue);
		updateState = state[1];

		return <context.Provider value={state[0]}>{children}</context.Provider>;
	};

	return [(value: T) => updateState(value), component];
}

function renderUseContextObservable(
	initialParams: useContextObservableParams,
	wrapper?: WrapperComponent<{}>
): RenderHookResult<
	useContextObservableParams,
	useContextObservableReturn,
	Renderer<useContextObservableParams>
> {
	return renderHook((params: useContextObservableParams) => useContextObservable(...params), {
		initialProps: initialParams,
		wrapper,
	});
}

describe('useContextObservable', () => {
	it('returns the same observable when re-rendered multiple times', () => {
		const mockContext = createContext<unknown>(false);
		const { result, rerender } = renderUseContextObservable([mockContext]);
		const firstObservable = result.current;
		rerender([mockContext]);
		rerender([mockContext]);
		rerender([mockContext]);
		const secondObservable = result.current;
		expect(firstObservable).toBe(secondObservable);
	});

	it('returns an observable which replays the default value of the given context', () => {
		const mockContext = createContext<unknown>('test');
		const { result } = renderUseContextObservable([mockContext]);
		const value$ = result.current;

		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledWith('test');
		subscription.unsubscribe();
	});

	it('returns an observable which replays the default object passed to the given context', () => {
		const object = {};
		const mockContext = createContext<unknown>(object);
		const { result } = renderUseContextObservable([mockContext]);
		const value$ = result.current;

		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		expect(mockNext.mock.calls[0][0]).toBe(object);

		subscription.unsubscribe();
	});

	it('returns an observable which replays the initial provided value for the given context', () => {
		const mockContext = createContext<unknown>('test');
		const [_, mockContextProvider] = createMockContextProvider(mockContext, 'test2');
		const { result } = renderUseContextObservable([mockContext], mockContextProvider);
		const value$ = result.current;

		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledWith('test2');

		subscription.unsubscribe();
	});

	it('returns an observable which replays the current provided value for the given context', async () => {
		const mockContext = createContext<unknown>('test');
		let [updateContextValue, mockContextProvider] = createMockContextProvider(mockContext, 'test2');
		const { result } = renderUseContextObservable([mockContext], mockContextProvider);
		const value$ = result.current;
		act(() => updateContextValue('test5'));

		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledWith('test5');

		subscription.unsubscribe();
	});

	it('returns an observable which emits the current provided value for the given context', () => {
		const mockContext = createContext<unknown>('test');
		const [updateContextValue, mockContextProvider] = createMockContextProvider(
			mockContext,
			'test2'
		);
		const { result } = renderUseContextObservable([mockContext], mockContextProvider);
		const value$ = result.current;

		act(() => updateContextValue(0));
		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		act(() => updateContextValue(true));
		expect(mockNext).toHaveBeenLastCalledWith(true);

		subscription.unsubscribe();
	});

	it('returns an observable which emits the current provided object for the given context', () => {
		const firstObject = {};
		const secondObject = {};
		const thirdObject = {};

		const mockContext = createContext<unknown>('test');
		const [updateContextValue, mockContextProvider] = createMockContextProvider(
			mockContext,
			firstObject
		);
		const { result } = renderUseContextObservable([mockContext], mockContextProvider);
		const value$ = result.current;

		act(() => updateContextValue(secondObject));
		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		act(() => updateContextValue(thirdObject));
		expect(mockNext.mock.calls[1][0]).toBe(thirdObject);

		subscription.unsubscribe();
	});

	it('returns an observable which only replays the initial provided value for the given context', () => {
		const mockContext = createContext<unknown>('test');
		const [_, mockContextProvider] = createMockContextProvider(mockContext, 'test2');
		const { result } = renderUseContextObservable([mockContext], mockContextProvider);
		const value$ = result.current;

		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which only replays the current provided value once for the given context if the hook is re-rendered with the same context', () => {
		const mockContext = createContext<unknown>('test');
		const [updateContextValue, mockContextProvider] = createMockContextProvider(
			mockContext,
			'test2'
		);
		const { result, rerender } = renderUseContextObservable([mockContext], mockContextProvider);
		const value$ = result.current;
		act(() => updateContextValue('test5'));
		rerender([mockContext]);
		rerender([mockContext]);
		rerender([mockContext]);
		rerender([mockContext]);
		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledTimes(1);

		subscription.unsubscribe();
	});

	it('returns an observable which emits the default value of the given context, when re-rendered with a new context', () => {
		const mockContext = createContext<unknown>('test');
		const [_, mockContextProvider] = createMockContextProvider(mockContext, 'test2');
		const { result, rerender } = renderUseContextObservable([mockContext], mockContextProvider);
		const value$ = result.current;

		const newContext = createContext<unknown>(10);
		rerender([newContext]);

		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		expect(mockNext).toHaveBeenCalledWith(10);

		subscription.unsubscribe();
	});

	it('returns an observable which emits each time the provided value for the given value is updated', () => {
		const mockContext = createContext<unknown>('test');
		const [updateContextValue, mockContextProvider] = createMockContextProvider(
			mockContext,
			'test1'
		);
		const { result } = renderUseContextObservable([mockContext], mockContextProvider);
		const value$ = result.current;
		const mockNext = jest.fn();
		const subscription = value$.subscribe({
			next: mockNext,
		});

		act(() => updateContextValue('test2'));
		act(() => updateContextValue('test3'));
		act(() => updateContextValue('test4'));
		expect(mockNext).toHaveBeenCalledTimes(4);

		subscription.unsubscribe();
	});
});
