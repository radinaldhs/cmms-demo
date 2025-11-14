import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/api/reports/fleet');
	const reportData = await response.json();

	return reportData;
};
