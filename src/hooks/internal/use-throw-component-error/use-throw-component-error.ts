import { useState } from 'react';

type ThrowComponentError = (error: unknown) => void;

export function useThrowComponentError(): ThrowComponentError {
	const [error, setError] = useState<unknown | undefined>(undefined);
	if (error !== undefined) {
		throw error;
	}
	return setError;
}
