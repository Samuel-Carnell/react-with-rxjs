import { Observable } from 'rxjs';
import { UseState } from 'types';
declare function bind<T extends {} | unknown[] | [], P extends Observable<unknown>[]>(getState: (...params: P) => T): UseState<T, P>;
export { bind };
