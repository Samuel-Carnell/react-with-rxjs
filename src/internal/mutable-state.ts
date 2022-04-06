class MutableValue<T> {
	constructor(private _value: T) {}

	public setState(value: T): void {
		this._value = value;
	}

	public getCurrentState(): T {
		return this._value;
	}
}

export { MutableValue };
