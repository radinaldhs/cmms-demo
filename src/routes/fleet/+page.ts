import { fleet } from '$stores';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		vehicles: fleet.getAll()
	};
};
