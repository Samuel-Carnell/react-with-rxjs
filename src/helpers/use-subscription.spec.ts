import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { AsyncSubject, BehaviorSubject, from, Observable, Subject, Subscriber, Subscription } from 'rxjs';
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
		'calls the subscriptionFactory callback once when called with $dependencies dependencies multiple times',
		({ dependencies }) => {
			const mockSubscription = new Subscription();
			const mockSubscriptionFactory = jest.fn().mockReturnValue(mockSubscription);
			const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, dependencies]);
			rerender([mockSubscriptionFactory, dependencies]);
			rerender([mockSubscriptionFactory, dependencies]);
			rerender([mockSubscriptionFactory, dependencies]);
			expect(mockSubscriptionFactory).toHaveBeenCalledTimes(1);
		}
	);

	it.each`
		firstDependencies     | secondDependencies    | thirdDependencies     | expectedNumberOfTimesCalled
		${['test']}           | ${['test']}           | ${['test']}           | ${1}
		${[new Observable()]} | ${[new Observable()]} | ${[new Observable()]} | ${3}
		${[1]}                | ${[1, 2]}             | ${[1, 2]}             | ${2}
		${[true]}             | ${[{}]}               | ${[1]}                | ${3}
		${['test']}           | ${['test']}           | ${[]}                 | ${2}
		${[parseInt('asdf')]} | ${[Number.NaN]}       | ${[parseInt('asdf')]} | ${1}
		${[new Date()]}       | ${[new Date()]}       | ${[new Date()]}       | ${3}
		${[[]]}               | ${[[]]}               | ${[[]]}               | ${3}
		${[100]}              | ${[100]}              | ${[100]}              | ${1}
		${[() => {}]}         | ${[() => {}]}         | ${[() => {}]}         | ${3}
		${[from([1, 2, 3])]}  | ${[]}                 | ${[from([1, 2, 3])]}  | ${3}
	`(
		'calls the subscriptionFactory callback $expectedNumberOfTimesCalled times when called with $firstDependencies dependencies, then $secondDependencies dependencies, then $thirdDependencies dependencies',
		({ firstDependencies, secondDependencies, thirdDependencies, expectedNumberOfTimesCalled }) => {
			const mockSubscription = new Subscription();
			const mockSubscriptionFactory = jest.fn().mockReturnValue(mockSubscription);
			const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, firstDependencies]);
			rerender([mockSubscriptionFactory, secondDependencies]);
			rerender([mockSubscriptionFactory, thirdDependencies]);
			expect(mockSubscriptionFactory).toHaveBeenCalledTimes(expectedNumberOfTimesCalled);
		}
	);

	it.each`
		dependencies
		${'test'}
		${true}
		${parseInt('asdf')}
		${new Observable()}
		${new Date()}
		${() => {}}
		${{}}
		${1234}
	`('throws a types error when called with $dependencies dependencies', ({ dependencies }) => {
		const mockSubscription = new Subscription();
		const mockSubscriptionFactory = jest.fn().mockReturnValue(mockSubscription);
		const { result } = renderUseSubscriptionHook([mockSubscriptionFactory, dependencies]);
		expect(result.error).toBeInstanceOf(TypeError);
	});

	it.each`
		subscriptionFactoryReturnValue
		${'test'}
		${[]}
		${null}
		${undefined}
		${{ closed: false, unsubscribe: [] }}
		${{ closed: '', unsubscribe: () => {} }}
		${new Observable()}
		${12345}
		${true}
		${new Date()}
		${Number.POSITIVE_INFINITY}
		${Symbol()}
	`(
		'throws a types error when subscriptionFactory callback returns $subscriptionFactoryReturnValue',
		({ subscriptionFactoryReturnValue }) => {
			const mockSubscriptionFactory = jest.fn().mockReturnValue(subscriptionFactoryReturnValue);
			const { result } = renderUseSubscriptionHook([mockSubscriptionFactory, []]);
			expect(result.error).toBeInstanceOf(TypeError);
		}
	);

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

	it.each`
		dependecies
		${[new Date()]}
		${[() => {}]}
		${[new Observable()]}
		${[Object.getPrototypeOf(new Observable())]}
		${['test']}
		${[{ [Symbol.iterator]: () => 1 }]}
		${[undefined]}
	`(
		'does not call unsubscribe on the returned subscription when called with $dependencies dependencies multiple times',
		async ({ dependencies }) => {
			const mockUnsubscribe = jest.fn();
			const mockSubscription = {
				closed: true,
				unsubscribe: mockUnsubscribe,
			};
			const mockSubscriptionFactory = jest.fn().mockReturnValue(mockSubscription);
			const { waitFor } = renderUseSubscriptionHook([mockSubscriptionFactory, dependencies]);
			await waitFor(() => expect(mockUnsubscribe).not.toBeCalled());
		}
	);

	it.each`
		firstDependencies     | secondDependencies          | thirdDependencies     | expectedNumberOfTimesCalled
		${[1]}                | ${[1, 2]}                   | ${[1, 2]}             | ${1}
		${['test']}           | ${['test']}                 | ${['test']}           | ${0}
		${[new Observable()]} | ${[new Observable()]}       | ${[new Observable()]} | ${2}
		${[true]}             | ${[{}]}                     | ${[1]}                | ${2}
		${['test']}           | ${['test']}                 | ${[]}                 | ${1}
		${[parseInt('asdf')]} | ${[Number.NaN]}             | ${[parseInt('asdf')]} | ${0}
		${[new Date()]}       | ${[new Date()]}             | ${[new Date()]}       | ${2}
		${[{ a: 1 }]}         | ${[{ a: 1 }]}               | ${[{ a: 1 }]}         | ${2}
		${[]}                 | ${[]}                       | ${[]}                 | ${0}
		${[new Subject()]}    | ${[new BehaviorSubject(1)]} | ${[new Observable()]} | ${2}
		${[null]}             | ${[undefined]}              | ${[null]}             | ${2}
	`(
		'calls unsubscribe on the subscription $expectedNumberOfTimesCalled times when called the $firstDependencies dependencies, then $secondDependencies dependencies, then $thirdDependencies dependencies',
		async ({ firstDependencies, secondDependencies, thirdDependencies, expectedNumberOfTimesCalled }) => {
			const mockUnsubscribe = jest.fn();
			const mockSubscriptionFactory = jest.fn().mockImplementation(() => ({
				closed: false,
				unsubscribe: mockUnsubscribe,
			}));
			const { rerender } = renderUseSubscriptionHook([mockSubscriptionFactory, firstDependencies]);
			rerender([mockSubscriptionFactory, secondDependencies]);
			rerender([mockSubscriptionFactory, thirdDependencies]);
			expect(mockUnsubscribe).toHaveBeenCalledTimes(expectedNumberOfTimesCalled);
		}
	);
});
