import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const dateFrom = url.searchParams.get('dateFrom') || '';
	const dateTo = url.searchParams.get('dateTo') || '';
	const categories = url.searchParams.get('categories') || '';

	const params = new URLSearchParams();
	if (dateFrom) params.set('dateFrom', dateFrom);
	if (dateTo) params.set('dateTo', dateTo);
	if (categories) params.set('categories', categories);

	const queryString = params.toString();
	const response = await fetch(`/api/reports/assets${queryString ? `?${queryString}` : ''}`);
	const reportData = await response.json();

	return {
		...reportData,
		filters: {
			dateFrom,
			dateTo,
			categories: categories ? categories.split(',') : []
		}
	};
};
