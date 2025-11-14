import { json } from '@sveltejs/kit';
import { reportsStore } from '$stores';
import type { RequestHandler } from './$types';
import type { ReportFilter } from '$types';

export const GET: RequestHandler = async ({ url }) => {
	// Parse filters from query params
	const filters: ReportFilter = {};

	const dateFrom = url.searchParams.get('dateFrom');
	const dateTo = url.searchParams.get('dateTo');
	const categories = url.searchParams.get('categories');

	if (dateFrom) filters.dateFrom = dateFrom;
	if (dateTo) filters.dateTo = dateTo;
	if (categories) filters.assetCategories = categories.split(',');

	const reportData = reportsStore.generateAssetPerformanceReport(filters);
	const summary = reportsStore.generateReportSummary(reportData, filters, 'maintenanceCostTotal');

	return json({
		data: reportData,
		summary
	});
};
