function isObject(value: unknown): value is {} {
	return (
		typeof value === 'object' &&
		value !== null &&
		Object.getPrototypeOf(value).constructor === Object
	);
}

export { isObject };
