import { json } from '@sveltejs/kit';
import { maintenancePolicies } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (id) {
		const policy = maintenancePolicies.getById(id);
		if (!policy) {
			return json({ error: 'Policy not found' }, { status: 404 });
		}
		return json(policy);
	}

	const policies = maintenancePolicies.getAll();
	return json(policies);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const newPolicy = maintenancePolicies.create(data);
	return json(newPolicy, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const { id, ...updates } = await request.json();

	if (!id) {
		return json({ error: 'Policy ID is required' }, { status: 400 });
	}

	const updated = maintenancePolicies.update(id, updates);

	if (!updated) {
		return json({ error: 'Policy not found' }, { status: 404 });
	}

	return json(updated);
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Policy ID is required' }, { status: 400 });
	}

	const deleted = maintenancePolicies.delete(id);

	if (!deleted) {
		return json({ error: 'Policy not found or cannot be deleted' }, { status: 404 });
	}

	return json({ success: true });
};
