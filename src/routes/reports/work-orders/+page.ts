import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	// Get filter params from URL
	const dateFrom = url.searchParams.get('dateFrom') || '';
	const dateTo = url.searchParams.get('dateTo') || '';
	const statuses = url.searchParams.get('statuses') || '';
	const priorities = url.searchParams.get('priorities') || '';
	const assignedTo = url.searchParams.get('assignedTo') || '';
	const categories = url.searchParams.get('categories') || '';

	// Build query string
	const params = new URLSearchParams();
	if (dateFrom) params.set('dateFrom', dateFrom);
	if (dateTo) params.set('dateTo', dateTo);
	if (statuses) params.set('statuses', statuses);
	if (priorities) params.set('priorities', priorities);
	if (assignedTo) params.set('assignedTo', assignedTo);
	if (categories) params.set('categories', categories);

	const queryString = params.toString();
	const response = await fetch(`/api/reports/work-orders${queryString ? `?${queryString}` : ''}`);
	const reportData = await response.json();

	return {
		...reportData,
		filters: {
			dateFrom,
			dateTo,
			statuses: statuses ? statuses.split(',') : [],
			priorities: priorities ? priorities.split(',') : [],
			assignedTo: assignedTo ? assignedTo.split(',') : [],
			categories: categories ? categories.split(',') : []
		}
	};
};
