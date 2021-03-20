/**
 * Returns true if `value` is a function, otherwise false.
 * @param value The value to check
 */
export function isFunction(value: unknown): value is (...args: any[]) => any {
	return typeof value === 'function';
}
