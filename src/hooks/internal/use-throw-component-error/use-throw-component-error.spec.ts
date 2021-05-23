import { act, Renderer, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { useThrowComponentError } from './use-throw-component-error';

type useThrowComponentErrorReturn = ReturnType<typeof useThrowComponentError>;

function renderUseThrowComponentError(): RenderHookResult<
	[],
	useThrowComponentErrorReturn,
	Renderer<[]>
> {
	return renderHook(() => useThrowComponentError());
}

describe('useThrowComponentError', () => {
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
			const { result } = renderUseThrowComponentError();
			const throwComponentError = result.current;
			act(() => throwComponentError(error));
			expect(result.error).toBe(error);
		}
	);
});
