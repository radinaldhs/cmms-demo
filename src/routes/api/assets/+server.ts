import { json } from '@sveltejs/kit';
import { assets } from '$stores';
import type { RequestHandler } from './$types';

// GET /api/assets - Get all assets or search/filter
export const GET: RequestHandler = async ({ url }) => {
	const search = url.searchParams.get('search');
	const category = url.searchParams.get('category');
	const status = url.searchParams.get('status');

	let results = assets.getAll();

	if (search) {
		results = assets.search(search);
	}

	if (category) {
		results = results.filter((a) => a.category === category);
	}

	if (status) {
		results = results.filter((a) => a.status === status);
	}

	return json(results);
};

// POST /api/assets - Create new asset
export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const newAsset = assets.create(data);
	return json(newAsset, { status: 201 });
};

// PUT /api/assets - Update asset
export const PUT: RequestHandler = async ({ request }) => {
	const { id, ...updates } = await request.json();
	const updated = assets.update(id, updates);

	if (!updated) {
		return json({ error: 'Asset not found' }, { status: 404 });
	}

	return json(updated);
};

// DELETE /api/assets - Delete asset
export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Asset ID required' }, { status: 400 });
	}

	const deleted = assets.delete(id);

	if (!deleted) {
		return json({ error: 'Asset not found' }, { status: 404 });
	}

	return json({ success: true });
};
