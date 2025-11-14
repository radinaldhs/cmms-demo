import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch, parent }) => {
	const { asset } = await parent();

	// Fetch all data in parallel
	const [documentsRes, summaryRes, conditionTimelineRes, maintenanceTimelineRes, comparisonRes, frequencyRes] =
		await Promise.all([
			fetch(`/api/assets/${params.id}/documents`),
			fetch(`/api/assets/${params.id}/documents?summary=true`),
			fetch(`/api/assets/${params.id}/documents?timeline=condition`),
			fetch(`/api/assets/${params.id}/documents?timeline=maintenance`),
			fetch(`/api/assets/${params.id}/documents?comparison=true`),
			fetch(`/api/assets/${params.id}/documents?frequency=true`)
		]);

	const documents = await documentsRes.json();
	const summary = await summaryRes.json();
	const conditionTimeline = await conditionTimelineRes.json();
	const maintenanceTimeline = await maintenanceTimelineRes.json();
	const comparison = await comparisonRes.json();
	const frequency = await frequencyRes.json();

	return {
		asset,
		documents,
		summary,
		conditionTimeline,
		maintenanceTimeline,
		comparison,
		frequency
	};
};
