import { useEffect, useRef } from 'react';
import { useHasInputChanged } from './use-has-input-changed';

export function useFactory<TValue>(
	factory: () => TValue,
	dependencies: unknown[],
	rootHookName = 'useFactory'
): TValue {
	const valueRef = useRef<TValue | undefined>(undefined);
	const hasDependenciesChanged = useHasInputChanged(dependencies, rootHookName);
	const currentValue =
		valueRef.current === undefined || hasDependenciesChanged ? factory() : valueRef.current;

	// Only update the valueRef once the render has been committed, this is required as react may call this hook without
	// committing the changes
	useEffect(() => {
		valueRef.current = currentValue;
	});

	return currentValue;
}
