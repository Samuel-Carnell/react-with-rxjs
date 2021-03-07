import { useEffect, useRef } from 'react';

export const IS_DEV = process?.env?.NODE_ENV === 'development';

function areInputsDifferent<TInput extends any[]>(
	prevInputs: TInput,
	nextInputs: TInput,
	rootHookName?: string
) {
	if (IS_DEV && nextInputs.length !== prevInputs.length) {
		console.error(
			'The final argument passed to %s changed size between renders. The ' +
				'order and size of this array must remain constant.\n\n' +
				'Previous: %s\n' +
				'Incoming: %s',
			rootHookName,
			`[${prevInputs.join(', ')}]`,
			`[${nextInputs.join(', ')}]`
		);
	}

	for (let i = 0; i < prevInputs.length && i < nextInputs.length; i++) {
		if (!Object.is(prevInputs[i], nextInputs[i])) {
			return false;
		}
	}
	return true;
}

/**
 * Determines if the any of the values in the `input` have changed between re-renders. This function is concurrent
 * mode safe.
 * @param input The array of values to check.
 * @returns True if any of the values have been changed between re renders, otherwise false.
 * @internal
 */
export function useHasInputChanged<TInput extends any[]>(
	input: TInput,
	rootHookName?: string
): boolean {
	const inputRef = useRef<TInput>(input);
	const isInputDifferent = areInputsDifferent(inputRef.current, input, rootHookName);

	// Only update the inputRef once the render has been committed, this is required as react may call this hook without
	// committing the changes
	useEffect(() => {
		inputRef.current = input;
	});

	return isInputDifferent;
}
