import { assets, workOrders } from '$stores';
import { calculateAssetFinancials } from '$utils';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const asset = assets.getById(params.id);

	if (!asset) {
		throw error(404, 'Asset not found');
	}

	const assetWorkOrders = workOrders.filterByAsset(params.id);

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

	const financials = calculateAssetFinancials(asset, maintenanceCostTotal, maintenanceCostYTD);

	return {
		asset,
		financials,
		workOrders: assetWorkOrders
	};
};
