import { json } from '@sveltejs/kit';
import { workOrders } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const status = url.searchParams.get('status');
	const assetId = url.searchParams.get('assetId');
	const priority = url.searchParams.get('priority');

	let results = workOrders.getAll();

	if (status) {
		results = workOrders.filterByStatus(status as any);
	}

	if (assetId) {
		results = workOrders.filterByAsset(assetId);
	}

	if (priority) {
		results = workOrders.filterByPriority(priority);
	}

	return json(results);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const newWorkOrder = workOrders.create(data);
	return json(newWorkOrder, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const { id, ...updates } = await request.json();
	const updated = workOrders.update(id, updates);

	if (!updated) {
		return json({ error: 'Work order not found' }, { status: 404 });
	}

	return json(updated);
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Work order ID is required' }, { status: 400 });
	}

	const deleted = workOrders.delete(id);

	if (!deleted) {
		return json({ error: 'Work order not found' }, { status: 404 });
	}

	return json({ success: true });
};
