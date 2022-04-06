import { useEffect, useState } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';

// In strict mode components are rendered twice. For this reason the input observables MUST
// emit any new values as an effect to ensure they're only emitted once.
function useAsObservables(inputs: unknown[]): Observable<unknown>[] {
	const [input$s] = useState(() => {
		return inputs.map((x) => new BehaviorSubject(x));
	});

	useEffect(() => {
		input$s.forEach(($, ind) => {
			const value = inputs[ind];
			if (!Object.is(value, $.getValue())) {
				$.next(value);
			}
		});
	});

	return input$s;
}

export { useAsObservables };
