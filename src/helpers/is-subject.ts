import { isObservable, Subject } from 'rxjs';

export function isSubject(value: unknown): value is Subject<unknown> {
	return isObservable(value) && value instanceof Subject;
}
