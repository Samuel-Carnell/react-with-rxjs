import { isObservable, Observable } from 'rxjs';
import { useFactory } from './helpers/use-factory';

/**
 * Uses the provided `observableFactory` to compute the returned observable. This observable persists across renders,
 * only being recomputed if any of the dependencies change. This function is concurrent mode safe.
 * @typeParam TObservable The type of observable produced by the `observableFactory`.
 * @param observableFactory Function to use to re/compute the returned observable.
 * @param dependencies Optional. A list of dependencies used by the `observableFactory` function.
 * @returns An observable produced by the `observableFactory` function.
 */
export function useObservable<TObservable extends Observable<any>>(
	observableFactory: () => TObservable,
	dependencies: unknown[] = []
): TObservable {
	if (!Array.isArray(dependencies)) {
		throw new TypeError(`${dependencies} is an Array. For argument input in useObservable`);
	}

	const observable = useFactory(observableFactory, dependencies);

	if (!isObservable(observable)) {
		throw new TypeError(
			`${observable} is not an Observable. For return value of argument observableFactory in useObservable`
		);
	}

	return observable;
}
