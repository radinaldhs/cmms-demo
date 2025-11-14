import type {
	ReportFilter,
	WorkOrderReportData,
	AssetPerformanceReportData,
	InventoryStatusReportData,
	FleetTrackingReportData,
	MaintenanceCostReportData,
	ReportSummary
} from '$types';
import { workOrders } from './work-orders';
import { assets } from './assets';
import { spareParts } from './spare-parts';
import { fleet } from './fleet';
import {
	calculateAccumulatedDepreciation,
	calculateBookValue
} from '$utils';

/**
 * Reports Store
 * Generates various reports from stored data
 */

// Helper function to filter by date range
function isInDateRange(date: string, dateFrom?: string, dateTo?: string): boolean {
	if (!dateFrom && !dateTo) return true;

	const checkDate = new Date(date);
	if (dateFrom && checkDate < new Date(dateFrom)) return false;
	if (dateTo && checkDate > new Date(dateTo)) return false;

	return true;
}

// Helper function to calculate days between dates
function daysBetween(date1: string, date2: string): number {
	const d1 = new Date(date1);
	const d2 = new Date(date2);
	const diff = Math.abs(d2.getTime() - d1.getTime());
	return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const reportsStore = {
	/**
	 * Generate Work Orders Report
	 */
	generateWorkOrdersReport: (filters: ReportFilter = {}): WorkOrderReportData[] => {
		let data = workOrders.getAll();

		// Apply status filter
		if (filters.workOrderStatuses && filters.workOrderStatuses.length > 0) {
			data = data.filter((wo) => filters.workOrderStatuses!.includes(wo.status));
		}

		// Apply priority filter
		if (filters.priority && filters.priority.length > 0) {
			data = data.filter((wo) => filters.priority!.includes(wo.priority));
		}

		// Apply assignee filter
		if (filters.assignedTo && filters.assignedTo.length > 0) {
			data = data.filter((wo) => wo.assignedTo && filters.assignedTo!.includes(wo.assignedTo));
		}

		// Apply date range filter
		if (filters.dateFrom || filters.dateTo) {
			data = data.filter((wo) => isInDateRange(wo.createdAt, filters.dateFrom, filters.dateTo));
		}

		// Get asset information
		const allAssets = assets.getAll();
		const assetMap = new Map(allAssets.map((a) => [a.id, a]));

		// Apply asset category filter
		if (filters.assetCategories && filters.assetCategories.length > 0) {
			data = data.filter((wo) => {
				const asset = assetMap.get(wo.assetId);
				return asset && filters.assetCategories!.includes(asset.category);
			});
		}

		// Transform to report data
		return data.map((wo) => {
			const asset = assetMap.get(wo.assetId);
			const partsCost = wo.sparePartsUsed.reduce((sum, part) => sum + part.totalCost, 0);
			const daysToComplete = wo.completedDate
				? daysBetween(wo.scheduledDate, wo.completedDate)
				: undefined;

			return {
				id: wo.id,
				title: wo.title,
				assetId: wo.assetId,
				assetName: wo.assetName || 'Unknown',
				assetCategory: asset?.category || 'Unknown',
				status: wo.status,
				priority: wo.priority,
				assignedTo: wo.assignedTo || 'Unassigned',
				scheduledDate: wo.scheduledDate,
				dueDate: wo.dueDate,
				completedDate: wo.completedDate,
				cost: wo.cost,
				laborHours: wo.laborHours || 0,
				partsCount: wo.sparePartsUsed.length,
				partsCost,
				daysToComplete
			};
		});
	},

	/**
	 * Generate Asset Performance Report
	 */
	generateAssetPerformanceReport: (filters: ReportFilter = {}): AssetPerformanceReportData[] => {
		let data = assets.getAll();

		// Apply category filter
		if (filters.assetCategories && filters.assetCategories.length > 0) {
			data = data.filter((asset) => filters.assetCategories!.includes(asset.category));
		}

		// Apply date range filter (based on purchase date)
		if (filters.dateFrom || filters.dateTo) {
			data = data.filter((asset) =>
				isInDateRange(asset.purchaseDate, filters.dateFrom, filters.dateTo)
			);
		}

		const allWorkOrders = workOrders.getAll();

		return data.map((asset) => {
			// Calculate depreciation
			const accumulatedDepreciation = calculateAccumulatedDepreciation(
				asset.purchaseDate,
				asset.purchaseCost,
				asset.residualValue,
				asset.usefulLifeYears
			);
			const bookValue = calculateBookValue(
				asset.purchaseDate,
				asset.purchaseCost,
				asset.residualValue,
				asset.usefulLifeYears
			);

			// Get maintenance data for this asset
			const assetWorkOrders = allWorkOrders.filter((wo) => wo.assetId === asset.id);
			const maintenanceCount = assetWorkOrders.length;
			const maintenanceCostTotal = assetWorkOrders.reduce((sum, wo) => sum + wo.cost, 0);

			// Calculate YTD maintenance cost
			const currentYear = new Date().getFullYear();
			const ytdWorkOrders = assetWorkOrders.filter(
				(wo) => new Date(wo.createdAt).getFullYear() === currentYear
			);
			const maintenanceCostYTD = ytdWorkOrders.reduce((sum, wo) => sum + wo.cost, 0);

			// Find last maintenance date
			const completedWorkOrders = assetWorkOrders.filter((wo) => wo.completedDate);
			const lastMaintenanceDate =
				completedWorkOrders.length > 0
					? completedWorkOrders.sort(
							(a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime()
						)[0].completedDate
					: undefined;

			// Calculate average maintenance cost
			const avgMaintenanceCost = maintenanceCount > 0 ? maintenanceCostTotal / maintenanceCount : 0;

			// Calculate utilization rate (simplified - based on status)
			const utilizationRate = asset.status === 'Active' ? 0.85 : asset.status === 'Maintenance' ? 0.5 : 0;

			return {
				assetId: asset.id,
				assetCode: asset.code,
				assetName: asset.name,
				category: asset.category,
				location: asset.location,
				status: asset.status,
				purchaseDate: asset.purchaseDate,
				purchaseCost: asset.purchaseCost,
				bookValue,
				accumulatedDepreciation,
				maintenanceCount,
				maintenanceCostTotal,
				maintenanceCostYTD,
				lastMaintenanceDate,
				avgMaintenanceCost,
				utilizationRate
			};
		});
	},

	/**
	 * Generate Inventory Status Report
	 */
	generateInventoryStatusReport: (filters: ReportFilter = {}): InventoryStatusReportData[] => {
		let data = spareParts.getAll();

		// Apply date range would typically filter by last movement, but we'll skip for now
		// since we don't have inventory movements stored yet

		return data.map((part) => {
			// Determine stock status
			let stockStatus: 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'OVERSTOCKED';
			if (part.currentStock === 0) {
				stockStatus = 'CRITICAL';
			} else if (part.currentStock < part.minStock) {
				stockStatus = 'LOW';
			} else if (part.maxStock && part.currentStock > part.maxStock) {
				stockStatus = 'OVERSTOCKED';
			} else {
				stockStatus = 'ADEQUATE';
			}

			// Calculate reorder quantity
			const reorderNeeded = part.currentStock < part.minStock;
			const reorderQuantity = reorderNeeded
				? (part.maxStock || part.minStock * 2) - part.currentStock
				: 0;

			// Calculate total value
			const totalValue = part.currentStock * part.unitCost;

			return {
				partId: part.id,
				partCode: part.code,
				description: part.description,
				category: part.category,
				currentStock: part.currentStock,
				minStock: part.minStock,
				maxStock: part.maxStock || 0,
				stockStatus,
				warehouse: part.warehouse,
				unitCost: part.unitCost,
				totalValue,
				lastMovementDate: undefined, // Would need inventory movements
				movementsCount: 0, // Would need inventory movements
				supplier: part.supplier,
				leadTimeDays: part.leadTimeDays,
				reorderNeeded,
				reorderQuantity
			};
		});
	},

	/**
	 * Generate Fleet Tracking Report
	 */
	generateFleetTrackingReport: (filters: ReportFilter = {}): FleetTrackingReportData[] => {
		const fleetData = fleet.getAll();
		const allAssets = assets.getAll();
		const allWorkOrders = workOrders.getAll();

		return fleetData.map((vehicle) => {
			// Get work orders for this vehicle
			const vehicleWorkOrders = allWorkOrders.filter((wo) => wo.assetId === vehicle.assetId);
			const maintenanceCount = vehicleWorkOrders.length;
			const maintenanceCostTotal = vehicleWorkOrders.reduce((sum, wo) => sum + wo.cost, 0);

			// Calculate cost per km
			const costPerKm = vehicle.odometer > 0 ? maintenanceCostTotal / vehicle.odometer : 0;

			// Calculate average monthly mileage (simplified)
			const asset = allAssets.find((a) => a.id === vehicle.assetId);
			const monthsSincePurchase = asset
				? Math.max(
						1,
						Math.floor(
							(new Date().getTime() - new Date(asset.purchaseDate).getTime()) /
								(1000 * 60 * 60 * 24 * 30)
						)
					)
				: 1;
			const avgMonthlyMileage = vehicle.odometer / monthsSincePurchase;

			// Get location string
			const lastLocation =
				vehicle.lastKnownLocation.address ||
				vehicle.lastKnownLocation.city ||
				`${vehicle.lastKnownLocation.lat}, ${vehicle.lastKnownLocation.lng}`;

			return {
				vehicleId: vehicle.id,
				assetId: vehicle.assetId,
				plateNumber: vehicle.plateNumber,
				type: vehicle.type,
				brand: vehicle.brand,
				model: vehicle.model,
				status: vehicle.status,
				odometer: vehicle.odometer,
				lastLocation,
				lastGpsTimestamp: vehicle.lastGpsTimestamp,
				maintenanceCount,
				maintenanceCostTotal,
				fuelType: vehicle.fuelType,
				insuranceExpiry: vehicle.insuranceExpiry,
				nextServiceDue: undefined, // Would calculate from maintenance plans
				avgMonthlyMileage,
				costPerKm
			};
		});
	},

	/**
	 * Generate Maintenance Costs Report
	 */
	generateMaintenanceCostsReport: (filters: ReportFilter = {}): MaintenanceCostReportData[] => {
		let data = workOrders.getAll();

		// Apply date range filter
		if (filters.dateFrom || filters.dateTo) {
			data = data.filter((wo) => isInDateRange(wo.createdAt, filters.dateFrom, filters.dateTo));
		}

		// Get assets for category grouping
		const allAssets = assets.getAll();
		const assetMap = new Map(allAssets.map((a) => [a.id, a]));

		// Group by asset category and period (month)
		const grouped = new Map<string, WorkOrderReportData[]>();

		data.forEach((wo) => {
			const asset = assetMap.get(wo.assetId);
			const category = asset?.category || 'Unknown';
			const date = new Date(wo.createdAt);
			const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			const key = `${period}|${category}`;

			if (!grouped.has(key)) {
				grouped.set(key, []);
			}

			const partsCost = wo.sparePartsUsed.reduce((sum, part) => sum + part.totalCost, 0);
			grouped.get(key)!.push({
				id: wo.id,
				title: wo.title,
				assetId: wo.assetId,
				assetName: wo.assetName || '',
				assetCategory: category,
				status: wo.status,
				priority: wo.priority,
				assignedTo: wo.assignedTo || '',
				scheduledDate: wo.scheduledDate,
				dueDate: wo.dueDate,
				completedDate: wo.completedDate,
				cost: wo.cost,
				laborHours: wo.laborHours || 0,
				partsCount: wo.sparePartsUsed.length,
				partsCost,
				daysToComplete: undefined
			});
		});

		// Transform to report data
		const reportData: MaintenanceCostReportData[] = [];

		grouped.forEach((workOrders, key) => {
			const [period, assetCategory] = key.split('|');
			const workOrderCount = workOrders.length;
			const totalCost = workOrders.reduce((sum, wo) => sum + wo.cost, 0);
			const partsCost = workOrders.reduce((sum, wo) => sum + wo.partsCost, 0);
			const laborCost = totalCost - partsCost;
			const avgCostPerWorkOrder = totalCost / workOrderCount;
			const completedCount = workOrders.filter((wo) => wo.status === 'Completed').length;
			const pendingCount = workOrders.filter(
				(wo) => wo.status === 'Planned' || wo.status === 'In Progress'
			).length;
			const overdueCount = workOrders.filter((wo) => wo.status === 'Overdue').length;

			reportData.push({
				period,
				assetCategory,
				workOrderCount,
				totalCost,
				laborCost,
				partsCost,
				avgCostPerWorkOrder,
				completedCount,
				pendingCount,
				overdueCount
			});
		});

		// Sort by period and category
		return reportData.sort((a, b) => {
			if (a.period !== b.period) return b.period.localeCompare(a.period);
			return a.assetCategory.localeCompare(b.assetCategory);
		});
	},

	/**
	 * Generate report summary
	 */
	generateReportSummary: (
		reportData: any[],
		filters: ReportFilter = {},
		costField?: string
	): ReportSummary => {
		const now = new Date();
		const defaultFrom = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
		const defaultTo = now.toISOString().split('T')[0];

		let totalCost: number | undefined;
		let avgCost: number | undefined;

		if (costField && reportData.length > 0) {
			const cost = reportData.reduce((sum, item) => sum + (item[costField] || 0), 0);
			totalCost = cost;
			avgCost = cost / reportData.length;
		}

		return {
			totalRecords: reportData.length,
			dateRange: {
				from: filters.dateFrom || defaultFrom,
				to: filters.dateTo || defaultTo
			},
			totalCost,
			avgCost
		};
	}
};
