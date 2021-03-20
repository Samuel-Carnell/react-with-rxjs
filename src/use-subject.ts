import { Subject } from 'rxjs';
import { isSubject } from './helpers/is-subject';
import { useFactory } from './helpers/use-factory';

/**
 * Uses the provided `subjectFactory` to compute the returned subject. This subject persists across renders,
 * only being recomputed if any of the dependencies change.
 *
 * @typeParam `TValue` The type of the value emitted and fed to the returned subject from `subjectFactory`.
 * @param subjectFactory Function to use to re/compute the returned subject.
 * @param dependencies Optional. A list of dependencies used by `subjectFactory` function.
 * @returns The subject produced by `subjectFactory` function.
 */
export function useSubject<TValue>(
	subjectFactory: () => Subject<TValue>,
	dependencies: unknown[] = []
): Subject<TValue> {
	if (!Array.isArray(dependencies)) {
		throw new TypeError(`${dependencies} is not an Array. For argument dependencies in useSubject`);
	}

	const subject = useFactory(subjectFactory, dependencies, 'useSubject');

	if (!isSubject(subject)) {
		throw new TypeError(
			`${subject} is not a Subject. For return value of argument subjectFactory in useSubject`
		);
	}

	return subject;
}
