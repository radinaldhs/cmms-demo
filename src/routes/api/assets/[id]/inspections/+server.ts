import { json } from '@sveltejs/kit';
import { assetInspections } from '$stores';
import type { RequestHandler } from './$types';

// GET - Fetch all inspections for an asset
export const GET: RequestHandler = async ({ params }) => {
	const inspections = assetInspections.getByAssetId(params.id);
	return json(inspections);
};

// POST - Create new inspection
export const POST: RequestHandler = async ({ request, params }) => {
	const data = await request.json();
	const inspection = assetInspections.create({
		...data,
		assetId: params.id
	});
	return json(inspection, { status: 201 });
};

// PUT - Update inspection
export const PUT: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const inspection = assetInspections.update(data.id, data);

	if (!inspection) {
		return json({ error: 'Inspection not found' }, { status: 404 });
	}

	return json(inspection);
};

// DELETE - Delete inspection
export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) {
		return json({ error: 'Inspection ID required' }, { status: 400 });
	}

	const deleted = assetInspections.delete(id);
	if (!deleted) {
		return json({ error: 'Inspection not found' }, { status: 404 });
	}

	return json({ success: true });
};
