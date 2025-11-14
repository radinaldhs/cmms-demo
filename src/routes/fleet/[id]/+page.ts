import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
	// Fetch vehicle data
	const vehicleResponse = await fetch(`/api/fleet/${params.id}`);

	if (!vehicleResponse.ok) {
		throw error(404, 'Vehicle not found');
	}

	const vehicle = await vehicleResponse.json();

	// Fetch related asset data
	const assetResponse = await fetch(`/api/assets/${vehicle.assetId}`);
	const asset = assetResponse.ok ? await assetResponse.json() : null;

	// Fetch related work orders
	const workOrdersResponse = await fetch(`/api/work-orders?assetId=${vehicle.assetId}`);
	const workOrders = workOrdersResponse.ok ? await workOrdersResponse.json() : [];

	return {
		vehicle,
		asset,
		workOrders
	};
};
