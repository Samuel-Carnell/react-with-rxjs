import { useCallback, useRef, useState } from 'react';
import { asapScheduler } from 'rxjs';

function useForceUpdate(): () => void {
	const [, dispatch] = useState<{}>(Object.create(null));

	const forceUpdate = useCallback((): void => {
		dispatch(Object.create(null));
	}, [dispatch]);
	return forceUpdate;
}

function useSmartUpdate(): [() => void, () => void] {
	const scheduledUpdateRef = useRef<undefined | (() => void)>();
	const forceUpdate = useForceUpdate();

	const scheduleUpdate = useCallback((): void => {
		if (scheduledUpdateRef.current !== undefined) {
			return;
		}

		scheduledUpdateRef.current = forceUpdate;
		asapScheduler.schedule(() => {
			if (scheduledUpdateRef.current !== undefined) {
				scheduledUpdateRef.current();
				scheduledUpdateRef.current = undefined;
			}
		});
	}, []);

	const descheduleUpdate = useCallback((): void => {
		scheduledUpdateRef.current = undefined;
	}, []);

	return [scheduleUpdate, descheduleUpdate];
}

export { useSmartUpdate };
