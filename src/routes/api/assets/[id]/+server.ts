import { json } from '@sveltejs/kit';
import { assets, workOrders } from '$stores';
import { calculateAssetFinancials } from '$utils';
import type { RequestHandler } from './$types';

// GET /api/assets/[id] - Get asset by ID with financials
export const GET: RequestHandler = async ({ params }) => {
	const asset = assets.getById(params.id);

	if (!asset) {
		return json({ error: 'Asset not found' }, { status: 404 });
	}

	// Get work orders for this asset
	const assetWorkOrders = workOrders.filterByAsset(params.id);

	// Calculate maintenance costs
	const maintenanceCostTotal = assetWorkOrders
		.filter((wo) => wo.status === 'Completed')
		.reduce((sum, wo) => sum + wo.cost, 0);

	const currentYear = new Date().getFullYear();
	const maintenanceCostYTD = assetWorkOrders
		.filter((wo) => {
			if (wo.status !== 'Completed' || !wo.completedDate) return false;
			return new Date(wo.completedDate).getFullYear() === currentYear;
		})
		.reduce((sum, wo) => sum + wo.cost, 0);

	// Calculate financials
	const financials = calculateAssetFinancials(asset, maintenanceCostTotal, maintenanceCostYTD);

	return json({
		asset,
		financials,
		workOrders: assetWorkOrders
	});
};
