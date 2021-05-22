import { act, Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { useSetRenderingError } from './use-set-rendering-error';

type useSetRenderingErrorReturn = ReturnType<typeof useSetRenderingError>;

function renderUseSetRenderingError(): RenderHookResult<
	[],
	useSetRenderingErrorReturn,
	Renderer<[]>
> {
	return renderHook(() => useSetRenderingError());
}

describe('useSetRenderingError', () => {
	it.each`
		error
		${''}
		${false}
		${new Error()}
		${new RangeError()}
		${Math.E}
		${123}
	`(
		'returns a function which re-renders the component throwing $error, when called with $error',
		(error) => {
			const { result } = renderUseSetRenderingError();
			const setRenderingError = result.current;
			act(() => setRenderingError(error));
			expect(result.error).toBe(error);
		}
	);
});
