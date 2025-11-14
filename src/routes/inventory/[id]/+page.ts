import { spareParts, inventoryMovements, warehouseLocations } from '$stores';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const part = spareParts.getById(params.id);

	if (!part) {
		throw error(404, 'Spare part not found');
	}

	const movements = inventoryMovements.getByPartId(params.id);

	// Calculate stock statistics
	const totalIn = movements
		.filter((m) => m.type === 'IN')
		.reduce((sum, m) => sum + m.quantity, 0);

	const totalOut = movements
		.filter((m) => m.type === 'OUT')
		.reduce((sum, m) => sum + m.quantity, 0);

	const totalValue = part.currentStock * part.unitCost;

	return {
		part,
		movements,
		stats: {
			totalIn,
			totalOut,
			totalValue,
			turnoverRate: totalOut > 0 ? (totalOut / (totalIn || 1)) * 100 : 0
		},
		warehouseLocations: warehouseLocations.getAll()
	};
};
