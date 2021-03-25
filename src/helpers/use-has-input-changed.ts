import { useEffect, useRef } from 'react';

function logError(message: string, ...args: unknown[]) {
	const IS_DEV = process.env.NODE_ENV === 'development';
	if (IS_DEV) {
		console.error(message, args);
	}
}

function areInputsDifferent<TInput extends any[]>(
	prevInputs: TInput,
	nextInputs: TInput,
	rootHookName: string
) {
	if (nextInputs.length !== prevInputs.length) {
		logError(
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
			return true;
		}
	}
	return false;
}

/**
 * Determines if the any of the values in `input` have changed between re-renders.
 * @param input The array of values to check.
 * @param rootHookName Optional. The name of the caller hook to use when logging errors.
 * @returns True if any of the values have been changed between re renders, otherwise false.
 * @internal
 */
export function useHasInputChanged<TInput extends any[]>(
	input: TInput,
	rootHookName = 'useHasInputChanged'
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
