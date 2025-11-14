import { assets } from '$stores';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params }) => {
	const asset = assets.getById(params.id);

	if (!asset) {
		throw error(404, 'Asset not found');
	}

	return {
		asset
	};
};
