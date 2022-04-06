import { useCallback, useEffect, useRef } from 'react';
import { Subscription } from 'rxjs';

function useRegisterSubscription(): (subscription: Subscription) => void {
	const subscriptionsRef = useRef<Subscription[]>([]);

	useEffect(() => {
		return () => {
			subscriptionsRef.current.forEach((x) => {
				if (!x.closed) {
					x.unsubscribe();
				}
			});
		};
	}, []);

	return useCallback((subscription: Subscription): void => {
		subscriptionsRef.current.push(subscription);
	}, []);
}

export { useRegisterSubscription };
