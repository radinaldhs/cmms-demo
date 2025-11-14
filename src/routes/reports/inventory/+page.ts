import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/api/reports/inventory');
	const reportData = await response.json();

	return reportData;
};
