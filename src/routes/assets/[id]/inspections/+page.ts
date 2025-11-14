import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch, parent }) => {
	const { asset } = await parent();

	const response = await fetch(`/api/assets/${params.id}/inspections`);
	const inspections = await response.json();

	return {
		asset,
		inspections
	};
};
