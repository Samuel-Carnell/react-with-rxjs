import { useState } from 'react';

type SetRenderingError = (error: unknown) => void;

export function useSetRenderingError(): SetRenderingError {
	const [error, setError] = useState<unknown | undefined>(undefined);
	if (error !== undefined) {
		throw error;
	}
	return setError;
}
