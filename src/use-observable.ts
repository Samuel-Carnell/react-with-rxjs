import { isObservable, Observable } from 'rxjs';
import { useFactory } from './helpers/use-factory';

/**
 * Uses the provided `observableFactory` to compute the returned observable. This observable persists across renders,
 * only being recomputed if any of the dependencies change.
 *
 * @typeParam `TObservable` The type of observable produced by `observableFactory`.
 * @param observableFactory Function to use to re/compute the returned observable.
 * @param dependencies Optional. A list of dependencies used by `observableFactory` function.
 * @returns An observable produced by `observableFactory` function.
 */
export function useObservable<TObservable extends Observable<any>>(
	observableFactory: () => TObservable,
	dependencies: unknown[] = []
): TObservable {
	if (!Array.isArray(dependencies)) {
		throw new TypeError(`${dependencies} is an Array. For argument input in useObservable`);
	}

	const observable = useFactory(observableFactory, dependencies, 'useObservable');

	if (!isObservable(observable)) {
		throw new TypeError(
			`${observable} is not an Observable. For return value of argument observableFactory in useObservable`
		);
	}

	return observable;
}
