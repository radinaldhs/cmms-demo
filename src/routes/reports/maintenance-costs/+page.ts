import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const dateFrom = url.searchParams.get('dateFrom') || '';
	const dateTo = url.searchParams.get('dateTo') || '';

	const params = new URLSearchParams();
	if (dateFrom) params.set('dateFrom', dateFrom);
	if (dateTo) params.set('dateTo', dateTo);

	const queryString = params.toString();
	const response = await fetch(
		`/api/reports/maintenance-costs${queryString ? `?${queryString}` : ''}`
	);
	const reportData = await response.json();

	return {
		...reportData,
		filters: {
			dateFrom,
			dateTo
		}
	};
};
