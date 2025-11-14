import { json } from '@sveltejs/kit';
import { maintenancePlans } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const assetId = url.searchParams.get('assetId');
	const type = url.searchParams.get('type');
	const active = url.searchParams.get('active');

	let results = maintenancePlans.getAll();

	if (assetId) {
		results = maintenancePlans.filterByAsset(assetId);
	}

	if (type) {
		results = maintenancePlans.filterByType(type as any);
	}

	if (active === 'true') {
		results = maintenancePlans.getActive();
	} else if (active === 'false') {
		results = maintenancePlans.getInactive();
	}

	return json(results);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const newPlan = maintenancePlans.create(data);
	return json(newPlan, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const { id, ...updates } = await request.json();
	const updated = maintenancePlans.update(id, updates);

	if (!updated) {
		return json({ error: 'Maintenance plan not found' }, { status: 404 });
	}

	return json(updated);
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Plan ID is required' }, { status: 400 });
	}

	const deleted = maintenancePlans.delete(id);

	if (!deleted) {
		return json({ error: 'Maintenance plan not found' }, { status: 404 });
	}

	return json({ success: true });
};
