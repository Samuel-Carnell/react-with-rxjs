import { isObservable, Observable } from 'rxjs';
import { useFactory } from './helpers/use-factory';

/**
 * Uses the provided `observableFactory` to compute the returned observable. This observable persists across renders,
 * only being recomputed if any of the dependencies change.
 *
 * @typeParam `TValue` The type of the value emitted by `observable`.
 * @param observableFactory Function to use to re/compute the returned observable.
 * @param dependencies Optional. A list of dependencies used by `observableFactory` function.
 * @returns An observable produced by `observableFactory` function.
 */
export function useObservable<TValue>(
	observableFactory: () => Observable<TValue>,
	dependencies: unknown[] = []
): Observable<TValue> {
	if (!Array.isArray(dependencies)) {
		throw new TypeError(`${dependencies} is not an Array. For argument input in useObservable`);
	}

	const observable = useFactory(observableFactory, dependencies, 'useObservable');

	if (!isObservable(observable)) {
		throw new TypeError(
			`${observable} is not an Observable. For return value of argument observableFactory in useObservable`
		);
	}

	return observable;
}
