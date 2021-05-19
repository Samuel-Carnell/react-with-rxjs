import { isObservable, Observable } from 'rxjs';
import { useFactory } from './helpers/use-factory';

/**
 * Uses the provided `observableFactory` to compute the returned observable. This observable persists across renders,
 * only being recomputed if any values in the `dependencies` array change.
 */
export function useObservable<TObservable extends Observable<unknown>>(
	observableFactory: () => TObservable,
	dependencies: unknown[] = []
): TObservable {
	if (!Array.isArray(dependencies)) {
		throw new TypeError(
			`${dependencies} is not an Array. For argument dependencies in useObservable`
		);
	}

	const observable: TObservable = useFactory(observableFactory, dependencies, 'useObservable');

	if (!isObservable(observable)) {
		throw new TypeError(
			`${observable} is not an Observable. For return value of argument observableFactory in useObservable`
		);
	}

	return observable;
}
