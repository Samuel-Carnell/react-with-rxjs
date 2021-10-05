import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { Subscription } from 'rxjs';
import { useSubscription } from './use-subscription';

type useSubscriptionParams = Parameters<typeof useSubscription>;
type useSubscriptionReturn = ReturnType<typeof useSubscription>;

function renderUseSubscriptionHook(
	initialParams: useSubscriptionParams
): RenderHookResult<useSubscriptionParams, useSubscriptionReturn, Renderer<useSubscriptionParams>> {
	return renderHook((params: useSubscriptionParams) => useSubscription(...params), {
		initialProps: initialParams,
	});
}

describe('useSubscription', () => {
	it('calls the subscriptionFactory', () => {
		const mockSubscriptionFactory = jest.fn().mockReturnValue(new Subscription());
		renderUseSubscriptionHook([mockSubscriptionFactory, []]);
		expect(mockSubscriptionFactory).toHaveBeenCalled();
	});

	it('calls the subscriptionFactory callback once when called with the same dependency array multiple times', () => {
		const dependencies = ['test'];
		const mockSubscriptionFactory = jest.fn().mockReturnValue(new Subscription());
		const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, dependencies]);
		rerender([mockSubscriptionFactory, dependencies]);
		rerender([mockSubscriptionFactory, dependencies]);
		rerender([mockSubscriptionFactory, dependencies]);
		expect(mockSubscriptionFactory).toHaveBeenCalledTimes(1);
	});

	it('does not call unsubscribe on the returned subscription when the hook is called with the same dependency array multiple times', () => {
		const dependencies = ['test'];
		const mockUnsubscribe = jest.fn();
		const mockSubscription = {
			closed: false,
			unsubscribe: mockUnsubscribe,
		};
		const mockSubscriptionFactory = jest.fn().mockReturnValue(mockSubscription);
		const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, dependencies]);
		rerender([mockSubscriptionFactory, dependencies]);
		rerender([mockSubscriptionFactory, dependencies]);
		rerender([mockSubscriptionFactory, dependencies]);
		expect(mockUnsubscribe).not.toHaveBeenCalled();
	});

	it('calls the subscriptionFactory callback once when called multiple times with a new dependency array containing the same object reference', () => {
		const object = {};
		const mockSubscriptionFactory = jest.fn().mockReturnValue(new Subscription());
		const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, [object]]);
		rerender([mockSubscriptionFactory, [object]]);
		rerender([mockSubscriptionFactory, [object]]);
		rerender([mockSubscriptionFactory, [object]]);
		expect(mockSubscriptionFactory).toHaveBeenCalledTimes(1);
	});

	it('does not call unsubscribe on the returned subscription when the hook is called multiple times with a new dependency array containing the same object reference', () => {
		const object = {};
		const mockUnsubscribe = jest.fn();
		const mockSubscription = {
			closed: false,
			unsubscribe: mockUnsubscribe,
		};
		const mockSubscriptionFactory = jest.fn().mockReturnValue(mockSubscription);
		const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, [object]]);
		rerender([mockSubscriptionFactory, [object]]);
		rerender([mockSubscriptionFactory, [object]]);
		rerender([mockSubscriptionFactory, [object]]);
		expect(mockUnsubscribe).not.toHaveBeenCalled();
	});

	it('calls the subscriptionFactory callback once when called multiple times with a new dependency array containing the same value', () => {
		const mockSubscriptionFactory = jest.fn().mockReturnValue(new Subscription());
		const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, [1]]);
		rerender([mockSubscriptionFactory, [1]]);
		rerender([mockSubscriptionFactory, [1]]);
		rerender([mockSubscriptionFactory, [1]]);
		expect(mockSubscriptionFactory).toHaveBeenCalledTimes(1);
	});

	it('does not call unsubscribe on the returned subscription when the hook is called multiple times with a new dependency array containing the same value', () => {
		const mockUnsubscribe = jest.fn();
		const mockSubscription = {
			closed: false,
			unsubscribe: mockUnsubscribe,
		};
		const mockSubscriptionFactory = jest.fn().mockReturnValue(mockSubscription);
		const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, [1]]);
		rerender([mockSubscriptionFactory, [1]]);
		rerender([mockSubscriptionFactory, [1]]);
		rerender([mockSubscriptionFactory, [1]]);
		expect(mockUnsubscribe).not.toHaveBeenCalled();
	});

	it('does not use loose equality when checking if the dependencies have changed', () => {
		const mockSubscriptionFactory = jest.fn().mockReturnValue(new Subscription());
		const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, [1]]);
		rerender([mockSubscriptionFactory, ['1']]);
		expect(mockSubscriptionFactory).toHaveBeenCalledTimes(2);
	});

	it('recalls the subscriptionFactory when the dependencies change', () => {
		const mockSubscriptionFactory = jest.fn().mockReturnValue(new Subscription());
		const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, ['a']]);
		rerender([mockSubscriptionFactory, ['b']]);
		expect(mockSubscriptionFactory).toHaveBeenCalledTimes(2);
	});

	it('calls unsubscribe on the previous subscription when the dependencies change', () => {
		const mockUnsubscribe = jest.fn();
		const firstSubscription = {
			closed: false,
			unsubscribe: mockUnsubscribe,
		};
		const { rerender } = renderUseSubscriptionHook([
			jest.fn().mockReturnValue(firstSubscription),
			['a'],
		]);
		rerender([jest.fn().mockReturnValue(new Subscription()), ['b']]);
		expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
	});

	it('calls the subscriptionFactory twice when called twice with [{ a: 1 }], then [{ a: 1 }]', () => {
		const mockSubscriptionFactory = jest.fn().mockReturnValue(new Subscription());
		const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, [{ a: 1 }]]);
		rerender([mockSubscriptionFactory, [{ a: 1 }]]);
		expect(mockSubscriptionFactory).toHaveBeenCalledTimes(2);
	});

	it('calls the subscriptionFactory 4 times when called with [1], [2], [1], [2]', () => {
		const mockSubscriptionFactory = jest
			.fn()
			.mockReturnValue(jest.fn().mockReturnValue(new Subscription()));
		const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, [1]]);
		rerender([mockSubscriptionFactory, [2]]);
		rerender([mockSubscriptionFactory, [1]]);
		rerender([mockSubscriptionFactory, [2]]);
		expect(mockSubscriptionFactory).toHaveBeenCalledTimes(4);
	});

	it('calls unsubscribe on each of the previous subscriptions when the hook is called with [1], [2], [1], [2]', () => {
		const mockUnsubscribe = jest.fn();
		const mockSubscription = {
			closed: false,
			unsubscribe: mockUnsubscribe,
		};
		const mockSubscriptionFactory = jest.fn().mockReturnValue(mockSubscription);
		const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, [1]]);
		rerender([mockSubscriptionFactory, [2]]);
		rerender([mockSubscriptionFactory, [1]]);
		rerender([mockSubscriptionFactory, [2]]);
		expect(mockUnsubscribe).toHaveBeenCalledTimes(3);
	});

	it('calls unsubscribe on the returned subscription when the hook is unmounted', async () => {
		const mockUnsubscribe = jest.fn();
		const mockSubscription = {
			closed: false,
			unsubscribe: mockUnsubscribe,
		};
		const mockSubscriptionFactory = jest.fn().mockReturnValue(mockSubscription);
		const { unmount, waitFor } = renderUseSubscriptionHook([mockSubscriptionFactory, []]);
		unmount();
		await waitFor(() => expect(mockUnsubscribe).toBeCalled());
	});

	it('does not call unsubscribe on the returned subscription when the hook is unmounted, if the subscription is already closed', async () => {
		const mockUnsubscribe = jest.fn();
		const mockSubscription = {
			closed: true,
			unsubscribe: mockUnsubscribe,
		};
		const mockSubscriptionFactory = jest.fn().mockReturnValue(mockSubscription);
		const { unmount, waitFor } = renderUseSubscriptionHook([mockSubscriptionFactory, []]);
		unmount();
		await waitFor(() => expect(mockUnsubscribe).not.toBeCalled());
	});
});
