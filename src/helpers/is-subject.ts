import { isObservable, Subject } from 'rxjs';
/**
 * Returns true if `value` is a rxjs Subject, otherwise false.
 * @param value The value to check
 */

export function isSubject(value: unknown): value is Subject<unknown> {
	return isObservable(value) && value instanceof Subject;
}
