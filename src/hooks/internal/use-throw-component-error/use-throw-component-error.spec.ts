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
	it('does not throw an error on the initial error', () => {
		const { result } = renderUseThrowComponentError();
		expect(result.error).toBeUndefined();
	});

	it('returns a function which when called with an error throws the error on the next render', () => {
		const error = new Error();
		const { result } = renderUseThrowComponentError();
		const throwComponentError = result.current;
		act(() => throwComponentError(error));
		expect(result.error).toBe(error);
	});

	it('returns a function which when called with undefined does not throw an error on the next render', () => {
		const { result } = renderUseThrowComponentError();
		const throwComponentError = result.current;
		act(() => throwComponentError(undefined));
		expect(result.error).toBeUndefined();
	});
});
