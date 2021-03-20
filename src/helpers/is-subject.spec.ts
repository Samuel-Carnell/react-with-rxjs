import { AsyncSubject, BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { isSubject } from './is-subject';

describe('isSubject', () => {
	it.each`
		value                      | expected
		${new Observable()}        | ${false}
		${new Subject()}           | ${true}
		${new BehaviorSubject('')} | ${true}
		${new ReplaySubject(0)}    | ${true}
		${new AsyncSubject()}      | ${true}
		${() => {}}                | ${false}
		${{}}                      | ${false}
		${0}                       | ${false}
		${null}                    | ${false}
		${100}                     | ${false}
		${'test'}                  | ${false}
		${Math}                    | ${false}
		${Number.NaN}              | ${false}
		${Boolean}                 | ${false}
		${false}                   | ${false}
		${true}                    | ${false}
		${[]}                      | ${false}
		${new String()}            | ${false}
		${undefined}               | ${false}
	`('returns $expected when given $value', ({ value, expected }) => {
		expect(isSubject(value)).toBe(expected);
	});
});
