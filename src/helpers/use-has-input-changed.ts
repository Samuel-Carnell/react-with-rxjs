import { useEffect, useRef } from 'react';

function areInputsDifferent<TInput extends any[]>(input1: TInput, input2: TInput) {
	const zippedInputs: Array<[any, any]> = Array.from(
		Array(Math.max(input1.length, input2.length)),
		(_, index) => [input1[index], input2[index]]
	);

	// Using Object.is to stay consistent with how other hooks such as useMemo and useEffect compare dependencies
	return zippedInputs.some(([value1, value2]) => !Object.is(value1, value2));
}

/**
 * Determines if the any of the values in the `input` have changed between re-renders. This function is concurrent
 * mode safe.
 * @param input The array of values to check.
 * @returns True if any of the values have been changed between re renders, otherwise false.
 * @internal
 */
export function useHasInputChanged<TInput extends any[]>(input: TInput): boolean {
	const inputRef = useRef<TInput>(input);
	const isInputDifferent = areInputsDifferent(inputRef.current, input);

	// Only update the inputRef once the render has been committed, this is required as react may call this hook without
	// committing the changes
	useEffect(() => {
		inputRef.current = input;
	});

	return isInputDifferent;
}
