import { assets, fleet, workOrders, spareParts } from '$stores';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const allAssets = assets.getAll();
	const allFleet = fleet.getAll();
	const allWorkOrders = workOrders.getAll();
	const allSpareParts = spareParts.getAll();

	const now = new Date();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();
	const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
	const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

	// Calculate current month metrics
	const totalAssets = allAssets.length;
	const totalFleetVehicles = allFleet.length;

	const openWorkOrders = allWorkOrders.filter(
		(wo) => wo.status !== 'Completed' && wo.status !== 'Cancelled'
	).length;

	const overdueWorkOrders = workOrders.getOverdue().length;

	const maintenanceCostCurrentMonth = allWorkOrders
		.filter((wo) => {
			if (wo.status !== 'Completed' || !wo.completedDate) return false;
			const date = new Date(wo.completedDate);
			return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
		})
		.reduce((sum, wo) => sum + wo.cost, 0);

	// Calculate previous month metrics for trend comparison
	const maintenanceCostLastMonth = allWorkOrders
		.filter((wo) => {
			if (wo.status !== 'Completed' || !wo.completedDate) return false;
			const date = new Date(wo.completedDate);
			return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
		})
		.reduce((sum, wo) => sum + wo.cost, 0);

	const openWorkOrdersLastMonth = allWorkOrders.filter((wo) => {
		const date = new Date(wo.createdAt);
		return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear &&
			wo.status !== 'Completed' && wo.status !== 'Cancelled';
	}).length;

	const overdueLastMonth = allWorkOrders.filter((wo) => {
		const date = new Date(wo.createdAt);
		return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear &&
			wo.status === 'Overdue';
	}).length;

	// Calculate trends (percentage change)
	const costTrend = maintenanceCostLastMonth > 0
		? ((maintenanceCostCurrentMonth - maintenanceCostLastMonth) / maintenanceCostLastMonth) * 100
		: 0;

	const openWorkOrdersTrend = openWorkOrdersLastMonth > 0
		? ((openWorkOrders - openWorkOrdersLastMonth) / openWorkOrdersLastMonth) * 100
		: 0;

	const overdueTrend = overdueLastMonth > 0
		? ((overdueWorkOrders - overdueLastMonth) / overdueLastMonth) * 100
		: 0;

	// Calculate performance metrics
	const completedWorkOrders = allWorkOrders.filter((wo) => wo.status === 'Completed');
	const totalWorkOrders = allWorkOrders.length;
	const completionRate = totalWorkOrders > 0 ? (completedWorkOrders.length / totalWorkOrders) * 100 : 0;

	const averageCompletionTime = completedWorkOrders.length > 0
		? completedWorkOrders.reduce((sum, wo) => {
			if (!wo.completedDate) return sum;
			const start = new Date(wo.scheduledDate).getTime();
			const end = new Date(wo.completedDate).getTime();
			return sum + (end - start) / (1000 * 60 * 60 * 24); // days
		}, 0) / completedWorkOrders.length
		: 0;

	const assetsInMaintenance = allAssets.filter((a) => a.status === 'Maintenance').length;
	const assetUtilization = totalAssets > 0
		? ((totalAssets - assetsInMaintenance - allAssets.filter(a => a.status === 'Retired').length) / totalAssets) * 100
		: 0;

	// Work orders by status
	const workOrdersByStatus = [
		{
			status: 'Planned',
			count: allWorkOrders.filter((wo) => wo.status === 'Planned').length
		},
		{
			status: 'In Progress',
			count: allWorkOrders.filter((wo) => wo.status === 'In Progress').length
		},
		{
			status: 'Completed',
			count: allWorkOrders.filter((wo) => wo.status === 'Completed').length
		},
		{
			status: 'Overdue',
			count: allWorkOrders.filter((wo) => wo.status === 'Overdue').length
		}
	];

	// Costs by asset category
	const costsByCategory = allAssets.reduce(
		(acc, asset) => {
			const assetWOs = allWorkOrders.filter(
				(wo) => wo.assetId === asset.id && wo.status === 'Completed'
			);
			const cost = assetWOs.reduce((sum, wo) => sum + wo.cost, 0);

			if (!acc[asset.category]) {
				acc[asset.category] = 0;
			}
			acc[asset.category] += cost;

			return acc;
		},
		{} as Record<string, number>
	);

	const costByCategory = Object.entries(costsByCategory).map(([category, cost]) => ({
		category,
		cost
	}));

	// Cost trends over last 6 months
	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const costTrends = Array.from({ length: 6 }, (_, i) => {
		const monthOffset = 5 - i;
		const targetMonth = (currentMonth - monthOffset + 12) % 12;
		const targetYear = currentMonth - monthOffset < 0 ? currentYear - 1 : currentYear;

		const monthCost = allWorkOrders
			.filter((wo) => {
				if (wo.status !== 'Completed' || !wo.completedDate) return false;
				const date = new Date(wo.completedDate);
				return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
			})
			.reduce((sum, wo) => sum + wo.cost, 0);

		return {
			month: monthNames[targetMonth],
			cost: monthCost
		};
	});

	// Recent activity timeline
	const recentActivities = [
		...allWorkOrders.slice(-10).map((wo) => ({
			id: wo.id,
			type: 'work_order',
			title: wo.status === 'Completed' ? 'Work Order Completed' : 'Work Order Created',
			description: wo.title,
			timestamp: wo.status === 'Completed' && wo.completedDate ? wo.completedDate : wo.createdAt,
			icon: wo.status === 'Completed' ? 'check' : 'wrench',
			color: wo.status === 'Completed' ? 'green' : 'blue'
		})),
		...allAssets.slice(-5).map((asset) => ({
			id: asset.id,
			type: 'asset',
			title: 'New Asset Added',
			description: asset.name,
			timestamp: asset.createdAt,
			icon: 'package',
			color: 'purple'
		}))
	]
		.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
		.slice(0, 8);

	// Recent work orders
	const recentWorkOrders = allWorkOrders
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 5);

	// Low stock items
	const lowStockItems = spareParts.getLowStock().slice(0, 5);

	// Upcoming maintenance (next 30 days)
	const upcomingMaintenance = allWorkOrders
		.filter((wo) => {
			if (wo.status === 'Completed' || wo.status === 'Cancelled') return false;
			const dueDate = new Date(wo.dueDate);
			const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
			return dueDate >= now && dueDate <= thirtyDaysFromNow;
		})
		.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
		.slice(0, 5);

	// Fleet locations for map
	const fleetLocations = allFleet.map((vehicle) => ({
		id: vehicle.id,
		plateNumber: vehicle.plateNumber,
		type: vehicle.type,
		status: vehicle.status,
		location: vehicle.lastKnownLocation
	}));

	return {
		metrics: {
			totalAssets,
			totalFleetVehicles,
			openWorkOrders,
			overdueWorkOrders,
			maintenanceCostCurrentMonth,
			completionRate,
			averageCompletionTime,
			assetsInMaintenance,
			assetUtilization
		},
		trends: {
			costTrend,
			openWorkOrdersTrend,
			overdueTrend
		},
		workOrdersByStatus,
		costByCategory,
		costTrends,
		recentWorkOrders,
		lowStockItems,
		recentActivities,
		upcomingMaintenance,
		fleetLocations
	};
};
