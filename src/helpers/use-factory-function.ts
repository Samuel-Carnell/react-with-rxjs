import { useRef } from 'react';
import { useHasInputChanged } from './use-has-input-changed';

export function useFactoryFunction<TValue>(factoryFunction: () => TValue, dependencies: unknown[]) {
	if (!Array.isArray(dependencies)) {
		throw new TypeError(`${dependencies} is an Array. For argument input in useFactoryFunction`);
	}

	const observableRef = useRef<TValue | undefined>(undefined);
	const hasDependenciesChanged = useHasInputChanged(dependencies);
	if (observableRef.current === undefined || hasDependenciesChanged) {
		const observable = factoryFunction();
		observableRef.current = observable;
	}

	return observableRef.current as TValue;
}
