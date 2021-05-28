import { Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { BehaviorSubject, from, Observable, Subject, Subscription } from 'rxjs';
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
		${[/test/]}           | ${[/test/]}           | ${[/test/]}           | ${3}
		${[new Observable()]} | ${[new Observable()]} | ${[new Observable()]} | ${3}
		${[1, 3]}             | ${[1, 2]}             | ${[1, 2]}             | ${2}
		${[true]}             | ${[{}]}               | ${[1]}                | ${3}
		${['test']}           | ${['test']}           | ${['test']}           | ${1}
		${[parseInt('asdf')]} | ${[Number.NaN]}       | ${[parseInt('asdf')]} | ${1}
		${[new Date()]}       | ${[new Date()]}       | ${[new Date()]}       | ${3}
		${[100]}              | ${[100]}              | ${[10]}               | ${2}
		${[() => {}]}         | ${[() => {}]}         | ${[() => {}]}         | ${3}
		${[from([1, 2, 3])]}  | ${[from([1, 2, 3])]}  | ${[from([1, 2, 3])]}  | ${3}
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
		${[1, 3]}             | ${[1, 2]}                   | ${[1, 2]}             | ${1}
		${['test']}           | ${['test']}                 | ${['test']}           | ${0}
		${[new Observable()]} | ${[new Observable()]}       | ${[new Observable()]} | ${2}
		${[true]}             | ${[{}]}                     | ${[1]}                | ${2}
		${['test1']}          | ${['test2']}                | ${['test3']}          | ${2}
		${[parseInt('asdf')]} | ${[Number.NaN]}             | ${[parseInt('asdf')]} | ${0}
		${[new Date()]}       | ${[new Date()]}             | ${[new Date()]}       | ${2}
		${[{ a: 1 }]}         | ${[{ a: 1 }]}               | ${[{ a: 1 }]}         | ${2}
		${[]}                 | ${[]}                       | ${[]}                 | ${0}
		${[new Subject()]}    | ${[new BehaviorSubject(1)]} | ${[new Observable()]} | ${2}
		${[null]}             | ${[undefined]}              | ${[null]}             | ${2}
	`(
		'calls unsubscribe on the subscription $expectedNumberOfTimesCalled times when called the $firstDependencies dependencies, then $secondDependencies dependencies, then $thirdDependencies dependencies',
		async ({
			firstDependencies,
			secondDependencies,
			thirdDependencies,
			expectedNumberOfTimesCalled,
		}) => {
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
