import { useRef } from 'react';

function areInputsDifferent<TInput extends any[]>(input1: TInput, input2: TInput) {
	const zippedInputs: Array<[any, any]> = Array.from(Array(Math.max(input1.length, input2.length)), (_, index) => [
		input1[index],
		input2[index],
	]);

	return zippedInputs.some(([value1, value2]) => value1 !== value2);
}

export function useHasInputChanged<TInput extends any[]>(newInput: TInput) {
	const inputRef = useRef<TInput | undefined>(newInput);
	const shouldCompute = inputRef.current === undefined || areInputsDifferent(inputRef.current, newInput);
	if (shouldCompute) {
		inputRef.current = newInput;
	}
	return shouldCompute;
}
