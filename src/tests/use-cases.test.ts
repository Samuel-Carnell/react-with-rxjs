/* cSpell:disable */

import { bind } from '../bind';
import { BehaviorSubject, from, interval, Observable, Subject } from 'rxjs';
import {
	map,
	startWith,
	debounceTime,
	throttleTime,
	switchMap,
	concatMap,
	take,
} from 'rxjs/operators';
import { act, renderHook } from '@testing-library/react-hooks';

// Note - The purposes of these test is to test more complex
// scenarios.
describe('use case tests', () => {
	it('can act as a simple state hook', async () => {
		const hook = bind(() => {
			const subject = new BehaviorSubject<number | string>('initial value');
			return [
				subject.asObservable(),
				(val: number | string) => subject.next(val),
			];
		});

		const { result, waitForNextUpdate, rerender } = renderHook(() => hook());
		result.current[1]('new value');
		await waitForNextUpdate();
		act(() => result.current[1](100));
		await waitForNextUpdate();
		rerender();
		rerender();
		act(() => result.current[1]('no longer a number'));
		await waitForNextUpdate();
		const currentStateOnEachRender = result.all.map((x) => x[0]);
		expect(currentStateOnEachRender).toEqual([
			'initial value',
			'new value',
			100,
			100,
			100,
			'no longer a number',
		]);
	});

	it('can handle asynchronous debouncing', async () => {
		const hook = bind(() => {
			const search$ = new Subject<string>();
			const names = [
				'Tyrone',
				'Nathan',
				'Natalie',
				'Rebekah',
				'Rupert',
				'Clinton',
				'Eliza',
				'Mari',
				'Frankie',
				'Alex',
				'Tim',
				'Maxine',
			];

			return {
				names: search$.pipe(
					debounceTime(10),
					map((search) =>
						names.filter((name) => name.toLowerCase().startsWith(search))
					),
					startWith([])
				),
				search: (value: string) => search$.next(value),
			};
		});

		const { result, waitForNextUpdate, rerender } = renderHook(() => hook());
		function simulateInput(text: string) {
			let input = '';
			for (const char of text) {
				if (char === '-') {
					input = input.substring(0, input.length - 1);
				} else {
					input += char;
				}

				result.current.search(input);
			}
		}
		simulateInput('tyrone');
		await waitForNextUpdate();
		simulateInput('rebec-kah');
		await waitForNextUpdate();
		rerender();
		simulateInput('maxine-----');
		await waitForNextUpdate();
		simulateInput('na');
		await waitForNextUpdate();
		rerender();
		const currentNamesOnEachRender = result.all.map((x: any) => x.names);
		expect(currentNamesOnEachRender).toEqual([
			[],
			['Tyrone'],
			['Rebekah'],
			['Rebekah'],
			['Mari', 'Maxine'],
			['Nathan', 'Natalie'],
			['Nathan', 'Natalie'],
		]);
	});

	it('can throttle inputs given to it', async () => {
		const hook = bind((value$) => {
			return [value$.pipe(throttleTime(10))];
		});

		const { result, rerender } = renderHook((value) => hook(value), {
			initialProps: 1,
		});
		rerender(2);
		rerender(3);
		rerender(4);
		await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
		rerender(5);
		rerender(6);
		rerender(7);
		rerender(8);
		await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
		rerender(9);
		await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
		rerender(10);
		rerender(11);
		await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
		const currentValueOnEachRender = result.all.map(([x]: any) => x);
		expect(currentValueOnEachRender).toEqual([
			1, 1, 1, 1, 1, 5, 5, 5, 5, 9, 9, 10,
		]);
	});

	it('can handle multiple observables being returned ', async () => {
		const hook = bind((string$, number$) => {
			const numberSubject = new Subject<number>();
			const stringSubject = new Subject<string>();
			return {
				number: number$.pipe(
					switchMap((val) => numberSubject.asObservable().pipe(startWith(val)))
				),
				setNumber: (val: number) => numberSubject.next(val),
				string: string$.pipe(
					switchMap((val) => stringSubject.asObservable().pipe(startWith(val)))
				),
				setString: (val: string) => stringSubject.next(val),
			};
		});

		const { result, waitForNextUpdate, rerender } = renderHook(
			(params: [string, number]) => hook(...params),
			{
				initialProps: ['test', 50],
			}
		);

		act(() => result.current.setNumber(1));
		await waitForNextUpdate();
		act(() => result.current.setString('test 2'));
		act(() => result.current.setNumber(100));
		act(() => result.current.setNumber(2));
		await waitForNextUpdate();
		rerender(['test', 5]);
		rerender(['test test test', 3]);
		act(() => result.current.setString('a string'));
		act(() => result.current.setNumber(200));
		await waitForNextUpdate();
		act(() => result.current.setString('a test string'));
		await waitForNextUpdate();
		rerender(['test test test', 205]);
		act(() => {
			result.current.setNumber(0);
		});
		rerender(['test test', 205]);
		await waitForNextUpdate();
		expect(
			result.all.map(({ number, string }: any) => ({
				number,
				string,
			}))
		).toEqual([
			{ number: 50, string: 'test' },
			{ number: 1, string: 'test' },
			{ number: 2, string: 'test 2' },
			{ number: 2, string: 'test 2' },
			{ number: 5, string: 'test 2' },
			{ number: 200, string: 'a string' },
			{ number: 200, string: 'a test string' },
			{ number: 200, string: 'a test string' },
			{ number: 0, string: 'a test string' },
			{ number: 0, string: 'test test' },
		]);
	});

	it('can be used to make a simple API call', async () => {
		async function fakeApi(id: number) {
			return new Promise((resolve) => {
				const todos = [
					{
						userId: 1,
						id: 1,
						title: 'delectus aut autem',
						completed: false,
					},
					{
						userId: 1,
						id: 2,
						title: 'quis ut nam facilis et officia qui',
						completed: false,
					},
					{
						userId: 1,
						id: 3,
						title: 'fugiat veniam minus',
						completed: false,
					},
					{
						userId: 1,
						id: 4,
						title: 'et porro tempora',
						completed: true,
					},
					{
						userId: 1,
						id: 5,
						title:
							'laboriosam mollitia et enim quasi adipisci quia provident illum',
						completed: false,
					},
					{
						userId: 1,
						id: 6,
						title: 'qui ullam ratione quibusdam voluptatem quia omnis',
						completed: false,
					},
					{
						userId: 1,
						id: 7,
						title: 'illo expedita consequatur quia in',
						completed: false,
					},
					{
						userId: 1,
						id: 8,
						title: 'quo adipisci enim quam ut ab',
						completed: true,
					},
					{
						userId: 1,
						id: 9,
						title: 'molestiae perspiciatis ipsa',
						completed: false,
					},
					{
						userId: 1,
						id: 10,
						title: 'illo est ratione doloremque quia maiores aut',
						completed: true,
					},
				];
				setTimeout(() => {
					resolve(todos.find((x) => x.id === id));
				}, 30);
			});
		}
		const hook = bind((id$: Observable<number>) => {
			return {
				todo: id$.pipe(
					switchMap((id) => {
						return from(fakeApi(id)).pipe(
							map((response) => {
								if (response === undefined) {
									return {
										state: 'not-found',
									};
								}

								return {
									state: 'success',
									todo: response,
								};
							}),
							startWith({
								state: 'loading',
							})
						);
					})
				),
			};
		});

		const { result, waitForNextUpdate, rerender } = renderHook(
			(params: [number]) => hook(...params),
			{
				initialProps: [5],
			}
		);
		await waitForNextUpdate();
		rerender([2]);
		await waitForNextUpdate();
		rerender([20]);
		await waitForNextUpdate();
		rerender([20]);
		rerender([9]);
		rerender([8]);
		await waitForNextUpdate();
		rerender([8]);
		rerender([8]);
		rerender([8]);
		rerender([17]);
		await waitForNextUpdate();
		rerender([17]);
		rerender([2]);
		await waitForNextUpdate();
		expect(result.all).toEqual([
			{ todo: { state: 'loading' } },
			{
				todo: {
					state: 'success',
					todo: {
						userId: 1,
						id: 5,
						title:
							'laboriosam mollitia et enim quasi adipisci quia provident illum',
						completed: false,
					},
				},
			},
			{
				todo: {
					state: 'success',
					todo: {
						userId: 1,
						id: 5,
						title:
							'laboriosam mollitia et enim quasi adipisci quia provident illum',
						completed: false,
					},
				},
			},
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
			{ todo: { state: 'loading' } },
		]);
	});

	it('can handle rapid updates', async () => {
		const hook = bind((value$: Observable<number>) => {
			return [
				value$.pipe(
					concatMap((x) => {
						return interval(10).pipe(
							map((y) => x * (y + 1)),
							take(4)
						);
					})
				),
			];
		});
		const { result, waitForNextUpdate, rerender } = renderHook(
			(params: [number]) => hook(...params),
			{
				initialProps: [4],
			}
		);
		await waitForNextUpdate();
		await waitForNextUpdate();
		await waitForNextUpdate();
		await waitForNextUpdate();
		rerender([10]);
		await waitForNextUpdate();
		await waitForNextUpdate();
		rerender([5]);
		await waitForNextUpdate();
		await waitForNextUpdate();
		await waitForNextUpdate();
		await waitForNextUpdate();
		rerender([2]);
		rerender([1]);
		await waitForNextUpdate();
		await waitForNextUpdate();
		await waitForNextUpdate();
		await waitForNextUpdate();
		await waitForNextUpdate();
		await waitForNextUpdate();
		await waitForNextUpdate();
		await waitForNextUpdate();
		rerender([1]);
		await waitForNextUpdate();
		await waitForNextUpdate();
		rerender([1]);
		rerender([1]);
		rerender([1]);
		rerender([1]);
		rerender([10]);
		await waitForNextUpdate();
		await waitForNextUpdate();
		await waitForNextUpdate();
		await waitForNextUpdate();
		expect(result.all.map(([x]: any) => x)).toEqual([
			undefined,
			4,
			8,
			12,
			16,
			16,
			10,
			20,
			20,
			30,
			40,
			5,
			10,
			10,
			10,
			15,
			20,
			2,
			4,
			6,
			8,
			1,
			2,
			2,
			3,
			4,
			4,
			4,
			4,
			4,
			4,
			10,
			20,
			30,
			40,
		]);
	});
});
