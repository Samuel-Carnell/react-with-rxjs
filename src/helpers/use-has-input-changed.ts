import { useRef } from 'react';

function areInputsDifferent<TInput extends any[]>(input1: TInput, input2: TInput) {
	const zippedInputs: Array<[any, any]> = Array.from(Array(Math.max(input1.length, input2.length)), (_, index) => [
		input1[index],
		input2[index],
	]);

	return zippedInputs.some(([value1, value2]) => value1 !== value2);
}

/**
 * Determines if the any of the values in the `input` have changed between re renders.
 * @param input The array of values to check.
 * @returns True if any of the values have been changed between re renders, otherwise false.
 * @internal
 */
export function useHasInputChanged<TInput extends any[]>(input: TInput): boolean {
	const inputRef = useRef<TInput>(input);
	const shouldCompute = areInputsDifferent(inputRef.current, input);
	if (shouldCompute) {
		inputRef.current = input;
	}
	return shouldCompute;
}
