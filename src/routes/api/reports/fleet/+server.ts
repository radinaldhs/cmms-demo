import { json } from '@sveltejs/kit';
import { reportsStore } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const reportData = reportsStore.generateFleetTrackingReport();
	const summary = reportsStore.generateReportSummary(reportData, {}, 'maintenanceCostTotal');

	// Calculate additional metrics
	const totalOdometer = reportData.reduce((sum, vehicle) => sum + vehicle.odometer, 0);
	const avgOdometer = reportData.length > 0 ? totalOdometer / reportData.length : 0;
	const activeCount = reportData.filter((vehicle) => vehicle.status === 'Active').length;
	const maintenanceCount = reportData.filter((vehicle) => vehicle.status === 'In Workshop').length;

	return json({
		data: reportData,
		summary: {
			...summary,
			additionalMetrics: {
				totalOdometer,
				avgOdometer,
				activeCount,
				maintenanceCount
			}
		}
	});
};
