import { json } from '@sveltejs/kit';
import { reportsStore } from '$stores';
import type { RequestHandler } from './$types';
import type { ReportFilter } from '$types';

export const GET: RequestHandler = async ({ url }) => {
	// Parse filters from query params
	const filters: ReportFilter = {};

	const dateFrom = url.searchParams.get('dateFrom');
	const dateTo = url.searchParams.get('dateTo');

	if (dateFrom) filters.dateFrom = dateFrom;
	if (dateTo) filters.dateTo = dateTo;

	const reportData = reportsStore.generateMaintenanceCostsReport(filters);
	const summary = reportsStore.generateReportSummary(reportData, filters, 'totalCost');

	// Calculate additional metrics
	const totalWorkOrders = reportData.reduce((sum, item) => sum + item.workOrderCount, 0);
	const totalCompleted = reportData.reduce((sum, item) => sum + item.completedCount, 0);
	const totalPending = reportData.reduce((sum, item) => sum + item.pendingCount, 0);
	const totalOverdue = reportData.reduce((sum, item) => sum + item.overdueCount, 0);

	return json({
		data: reportData,
		summary: {
			...summary,
			additionalMetrics: {
				totalWorkOrders,
				totalCompleted,
				totalPending,
				totalOverdue
			}
		}
	});
};
