import { json } from '@sveltejs/kit';
import { reportsStore } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const reportData = reportsStore.generateInventoryStatusReport();
	const summary = reportsStore.generateReportSummary(reportData, {}, 'totalValue');

	// Calculate additional metrics
	const criticalCount = reportData.filter((item) => item.stockStatus === 'CRITICAL').length;
	const lowCount = reportData.filter((item) => item.stockStatus === 'LOW').length;
	const reorderCount = reportData.filter((item) => item.reorderNeeded).length;
	const totalValue = reportData.reduce((sum, item) => sum + item.totalValue, 0);

	return json({
		data: reportData,
		summary: {
			...summary,
			additionalMetrics: {
				criticalCount,
				lowCount,
				reorderCount,
				totalValue
			}
		}
	});
};
