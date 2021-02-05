import { useRef } from 'react';
import { Observable } from 'rxjs';
import { useHasInputChanged } from './helpers/use-has-input-changed';

export function useObservable<TValue>(
	observableFactory: () => Observable<TValue>,
	dependencies: unknown[]
): Observable<TValue> {
	const observableRef = useRef<Observable<TValue> | undefined>(undefined);
	const hasDependenciesChanged = useHasInputChanged(dependencies);
	if (observableRef.current === undefined || hasDependenciesChanged) {
		observableRef.current === observableFactory();
	}
	return observableRef.current as Observable<TValue>;
}
