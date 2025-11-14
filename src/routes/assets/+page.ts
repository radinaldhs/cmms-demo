import { assets } from '$stores';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const allAssets = assets.getAll();
	const categories = assets.getCategories();

	return {
		assets: allAssets,
		categories
	};
};
