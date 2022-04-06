import { useState } from 'react';
import { isObservable, Observable } from 'rxjs';
import { UseState } from 'types';
import {
	isObject,
	map,
	MutableValue,
	useAsObservables,
	useWatchObservable,
	WatchedState,
} from 'internal';

function bind<T extends {} | unknown[] | [], P extends Observable<unknown>[]>(
	getState: (...params: P) => T
): UseState<T, P> {
	function hook(...inputs: P) {
		const watchObservable = useWatchObservable();
		const input$s = useAsObservables(inputs);

		const [state] = useState(() => {
			const stateModel: T = getState(...(input$s as P));
			if (!(Array.isArray(stateModel) || isObject(stateModel))) {
				throw new Error(
					'Function getState must return either an object or array.'
				);
			}

			return map(
				stateModel,
				(value: unknown): MutableValue<WatchedState> | unknown => {
					return isObservable(value) ? watchObservable(value) : value;
				}
			);
		});

		return map(
			state,
			(value: MutableValue<WatchedState> | unknown): unknown => {
				if (!(value instanceof MutableValue)) {
					return value;
				}

				const state: WatchedState = value.getCurrentState();
				if (state.error !== undefined) {
					throw state.error;
				}

				return state.value;
			}
		);
	}

	return hook as UseState<T, P>;
}

export { bind };
