import { useCallback, useLayoutEffect } from 'react';
import { Observable } from 'rxjs';
import { MutableValue as MutableState } from './mutable-state';
import { useRegisterSubscription } from './use-register-subscription';
import { useSmartUpdate } from './use-smart-update';

type WatchObservable<T> = (observable: Observable<T>) => MutableState<T>;

type WatchedState = {
	error?: unknown;
	value?: unknown;
};

function useWatchObservable(): WatchObservable<unknown> {
	const registerSubscription = useRegisterSubscription();
	const [scheduleUpdate, descheduleUpdate] = useSmartUpdate();

	useLayoutEffect(() => {
		// Updates are only scheduled because an observable has emitted a new value
		// that needs to be read. However if a re render occurs for any other reason
		// the new value will be read during that render anyway, negating the need
		// for the scheduled update. Thus it can be descheduled.
		// This also ensures that any updates will be descheduled if the component were to
		// unmount.
		return descheduleUpdate;
	});

	return useCallback(($) => {
		let isSync = true;
		const mutableValue = new MutableState<WatchedState>({});

		registerSubscription(
			$.subscribe({
				error(error) {
					mutableValue.setState({ error });
					if (!isSync) {
						scheduleUpdate();
					}
				},
				next(value) {
					mutableValue.setState({
						value,
					});
					if (!isSync) {
						scheduleUpdate();
					}
				},
			})
		);

		isSync = false;
		return mutableValue;
	}, []);
}

export { useWatchObservable };
export type { WatchedState };
