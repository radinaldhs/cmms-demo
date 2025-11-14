import { json } from '@sveltejs/kit';
import { fleet } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const status = url.searchParams.get('status');
	const type = url.searchParams.get('type');

	let results = fleet.getAll();

	if (status) {
		results = fleet.filterByStatus(status);
	}

	if (type) {
		results = fleet.filterByType(type);
	}

	return json(results);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const newVehicle = fleet.create(data);
	return json(newVehicle, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const { id, ...updates } = await request.json();
	const updated = fleet.update(id, updates);

	if (!updated) {
		return json({ error: 'Vehicle not found' }, { status: 404 });
	}

	return json(updated);
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Vehicle ID is required' }, { status: 400 });
	}

	const deleted = fleet.delete(id);

	if (!deleted) {
		return json({ error: 'Vehicle not found' }, { status: 404 });
	}

	return json({ success: true });
};
