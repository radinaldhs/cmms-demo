import { workOrders } from '$stores';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		workOrders: workOrders.getAll()
	};
};
