import { useEffect, useRef } from 'react';

function areInputsDifferent<TInput extends any[]>(
	prevInputs: TInput,
	nextInputs: TInput,
	hookName?: string
) {
	if (process.env.NODE_ENV === 'development') {
		// Don't bother comparing lengths in prod because these arrays should be
		// passed inline.
		if (nextInputs.length !== prevInputs.length) {
			console.error(
				'The final argument passed to %s changed size between renders. The ' +
					'order and size of this array must remain constant.\n\n' +
					'Previous: %s\n' +
					'Incoming: %s',
				hookName,
				`[${prevInputs.join(', ')}]`,
				`[${nextInputs.join(', ')}]`
			);
		}
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
	hookName?: string
): boolean {
	const inputRef = useRef<TInput>(input);
	const isInputDifferent = areInputsDifferent(inputRef.current, input, hookName);

	// Only update the inputRef once the render has been committed, this is required as react may call this hook without
	// committing the changes
	useEffect(() => {
		inputRef.current = input;
	});

	return isInputDifferent;
}
