import { useRef } from 'react';
import { Observable } from 'rxjs';
import { useHasInputChanged } from './helpers/use-has-input-changed';

/**
 * Uses the provided `observableFactory` to compute the returned observable. This observable persists across renders, only being recomputed if any of the dependencies change.
 * @typeParam TObservable The type of observable produced by the `observableFactory`.
 * @param observableFactory Function to use to re/compute the returned observable.
 * @param dependencies Optional. A list of dependencies used by the `observableFactory` function.
 * @returns An observable produced by the `observableFactory` function.
 */
export function useObservable<TObservable extends Observable<any>>(
	observableFactory: () => TObservable,
	dependencies: unknown[] = []
): TObservable {
	const observableRef = useRef<TObservable | undefined>(undefined);
	const hasDependenciesChanged = useHasInputChanged(dependencies);
	if (observableRef.current === undefined || hasDependenciesChanged) {
		observableRef.current === observableFactory();
	}
	return observableRef.current as TObservable;
}
