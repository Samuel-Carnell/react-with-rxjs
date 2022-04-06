function mapObject(obj: {}, mapValue: (value: unknown) => unknown): {} {
	const keyValuePairs: Array<[string, unknown]> = Object.keys(obj).map(
		(key) => [key, obj[key]]
	);
	return keyValuePairs.reduce((acc, [key, value]) => {
		acc[key] = mapValue(value);
		return acc;
	}, {});
}

function mapArray(
	arr: unknown[],
	mapValue: (value: unknown) => unknown
): unknown[] {
	return arr.map(mapValue);
}

function map(
	mappable: unknown[] | {},
	mapValue: (value: unknown) => unknown
): unknown[] | {} {
	return Array.isArray(mappable)
		? mapArray(mappable, mapValue)
		: mapObject(mappable, mapValue);
}

export { map };
