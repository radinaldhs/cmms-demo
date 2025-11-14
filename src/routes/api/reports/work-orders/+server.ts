import { json } from '@sveltejs/kit';
import { reportsStore } from '$stores';
import type { RequestHandler } from './$types';
import type { ReportFilter } from '$types';

export const GET: RequestHandler = async ({ url }) => {
	// Parse filters from query params
	const filters: ReportFilter = {};

	const dateFrom = url.searchParams.get('dateFrom');
	const dateTo = url.searchParams.get('dateTo');
	const statuses = url.searchParams.get('statuses');
	const priorities = url.searchParams.get('priorities');
	const assignedTo = url.searchParams.get('assignedTo');
	const categories = url.searchParams.get('categories');

	if (dateFrom) filters.dateFrom = dateFrom;
	if (dateTo) filters.dateTo = dateTo;
	if (statuses) filters.workOrderStatuses = statuses.split(',') as any[];
	if (priorities) filters.priority = priorities.split(',') as any[];
	if (assignedTo) filters.assignedTo = assignedTo.split(',');
	if (categories) filters.assetCategories = categories.split(',');

	const reportData = reportsStore.generateWorkOrdersReport(filters);
	const summary = reportsStore.generateReportSummary(reportData, filters, 'cost');

	return json({
		data: reportData,
		summary
	});
};
