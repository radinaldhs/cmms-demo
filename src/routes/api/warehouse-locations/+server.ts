import { json } from '@sveltejs/kit';
import { warehouseLocations } from '$stores';
import type { RequestHandler } from './$types';

// GET - Fetch all warehouse locations or filter by type
export const GET: RequestHandler = async ({ url }) => {
	const type = url.searchParams.get('type'); // 'CENTRAL' or 'SITE'
	const region = url.searchParams.get('region');
	const factory = url.searchParams.get('factory');
	const active = url.searchParams.get('active');

	let locations = warehouseLocations.getAll();

	// Filter by type
	if (type === 'CENTRAL' || type === 'SITE') {
		locations = warehouseLocations.getByType(type);
	}

	// Filter by region (for central warehouses)
	if (region) {
		locations = locations.filter((loc) => loc.region === region);
	}

	// Filter by factory (for site warehouses)
	if (factory) {
		locations = locations.filter((loc) => loc.factory === factory);
	}

	// Filter by active status
	if (active === 'true') {
		locations = locations.filter((loc) => loc.isActive);
	}

	return json(locations);
};

// POST - Create new warehouse location
export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	const newLocation = warehouseLocations.create(data);

	return json(newLocation, { status: 201 });
};

// PUT - Update existing warehouse location
export const PUT: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const { id, ...updates } = data;

	const updatedLocation = warehouseLocations.update(id, updates);

	if (!updatedLocation) {
		return json({ error: 'Warehouse location not found' }, { status: 404 });
	}

	return json(updatedLocation);
};

// DELETE - Remove warehouse location
export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'ID is required' }, { status: 400 });
	}

	const deleted = warehouseLocations.delete(id);

	if (!deleted) {
		return json({ error: 'Warehouse location not found' }, { status: 404 });
	}

	return json({ success: true });
};
