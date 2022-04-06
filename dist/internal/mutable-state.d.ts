declare class MutableValue<T> {
    private _value;
    constructor(_value: T);
    setState(value: T): void;
    getCurrentState(): T;
}
export { MutableValue };
