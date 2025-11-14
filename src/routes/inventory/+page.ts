import { spareParts } from '$stores';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		parts: spareParts.getAll(),
		lowStockParts: spareParts.getLowStock(),
		categories: spareParts.getCategories()
	};
};
