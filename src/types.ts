import { Observable } from 'rxjs';

type UseStateParams<T> = {
	[P in keyof T]: T[P] extends Observable<infer R> ? R : never;
};

type UseStateReturn<T> = {
	[P in keyof T]: T[P] extends Observable<infer R> ? R : T[P];
};

export type UseState<T, P extends any[]> = (
	...params: UseStateParams<P>
) => UseStateReturn<T>;
