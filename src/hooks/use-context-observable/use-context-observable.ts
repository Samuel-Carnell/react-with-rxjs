import { useObservableOf } from 'hooks';
import { useContext, Context } from 'react';
import { Observable } from 'rxjs';

const isContext = <T>(context: unknown): context is Context<T> => {
	return (
		typeof context === 'object' && context != null && 'Consumer' in context && 'Provider' in context
	);
};

/**
 * Returns an observable of the current value for the given context .
 */
export function useContextObservable<T>(context: Context<T>): Observable<T> {
	if (!isContext<T>(context)) {
		throw new TypeError(
			`${context} is not a React Context. For argument context in useContextObservable`
		);
	}

	const value: T = useContext(context);
	return useObservableOf(value);
}
