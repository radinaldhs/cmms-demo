import { maintenancePlans } from '$stores';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		plans: maintenancePlans.getAll()
	};
};
