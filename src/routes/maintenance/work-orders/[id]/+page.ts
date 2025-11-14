import { workOrders, spareParts } from '$stores';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const workOrder = workOrders.getById(params.id);

	if (!workOrder) {
		throw error(404, 'Work order not found');
	}

	// Get spare parts details for this work order
	const partsDetails = workOrder.sparePartsUsed.map((usage) => {
		const part = spareParts.getById(usage.partId);
		return {
			...usage,
			currentStock: part?.currentStock || 0,
			warehouse: part?.warehouse || 'Unknown'
		};
	});

	return {
		workOrder,
		partsDetails
	};
};
