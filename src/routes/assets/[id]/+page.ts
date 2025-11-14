import { workOrders } from '$stores';
import { calculateAssetFinancials } from '$utils';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { asset } = await parent();

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
		financials,
		workOrders: assetWorkOrders
	};
};
