import { Observable } from 'rxjs';
declare type UseStateParams<T> = {
    [P in keyof T]: T[P] extends Observable<infer R> ? R : never;
};
declare type UseStateReturn<T> = {
    [P in keyof T]: T[P] extends Observable<infer R> ? R : T[P];
};
export declare type UseState<T, P extends any[]> = (...params: UseStateParams<P>) => UseStateReturn<T>;
export {};
