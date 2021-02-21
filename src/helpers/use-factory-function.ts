import { useRef } from 'react';
import { useHasInputChanged } from './use-has-input-changed';

/**
 * Uses the provided `factoryFunction` to compute the returned value. This value persists across renders, only being recomputed if any of the dependencies change.
 * @typeParam TValue The type of value produced by the `factoryFunction`.
 * @param factoryFunction Function to use to re/compute the returned observable.
 * @param dependencies A list of dependencies used by the `factoryFunction` function.
 * @returns The value produced by the `factoryFunction`.
 */
export function useFactoryFunction<TValue>(factoryFunction: () => TValue, dependencies: unknown[]): TValue {
	if (!Array.isArray(dependencies)) {
		throw new TypeError(`${dependencies} is an Array. For argument dependencies in useFactoryFunction`);
	}

	const valueRef = useRef<TValue | undefined>(undefined);
	const hasDependenciesChanged = useHasInputChanged(dependencies);
	if (valueRef.current === undefined || hasDependenciesChanged) {
		const value = factoryFunction();
		valueRef.current = value;
	}

	return valueRef.current as TValue;
}
