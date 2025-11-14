import { json } from '@sveltejs/kit';
import { spareParts, inventoryMovements } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const category = url.searchParams.get('category');
	const lowStock = url.searchParams.get('lowStock');

	let results = spareParts.getAll();

	if (category) {
		results = spareParts.filterByCategory(category);
	}

	if (lowStock === 'true') {
		results = spareParts.getLowStock();
	}

	return json(results);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	if (data.type === 'movement') {
		// Create inventory movement
		const movement = inventoryMovements.create(data.movement);
		return json(movement, { status: 201 });
	} else {
		// Create spare part
		const newPart = spareParts.create(data);
		return json(newPart, { status: 201 });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	const { id, ...updates } = await request.json();
	const updated = spareParts.update(id, updates);

	if (!updated) {
		return json({ error: 'Spare part not found' }, { status: 404 });
	}

	return json(updated);
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Spare part ID required' }, { status: 400 });
	}

	const deleted = spareParts.delete(id);

	if (!deleted) {
		return json({ error: 'Spare part not found' }, { status: 404 });
	}

	return json({ success: true });
};
