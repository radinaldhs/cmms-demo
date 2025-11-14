import { json } from '@sveltejs/kit';
import { fleet } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const vehicle = fleet.getById(params.id);

	if (!vehicle) {
		return json({ error: 'Vehicle not found' }, { status: 404 });
	}

	return json(vehicle);
};
