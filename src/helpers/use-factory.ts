import { useEffect, useRef } from 'react';
import { useHasInputChanged } from './use-has-input-changed';

/**
 * Uses the provided `factory` to compute the returned value. This value persists across renders, only being recomputed
 * if any of the dependencies change. This function is concurrent mode safe.
 * @typeParam TValue The type of value produced by the `factory`.
 * @param factory Function to use to re/compute the returned observable.
 * @param dependencies A list of dependencies used by the `factory` function.
 * @param rootHookName Optional. The name of the caller hook to use when logging errors. Defaults to `'useFactory'`
 * @returns The value produced by the `factory`.
 */
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
