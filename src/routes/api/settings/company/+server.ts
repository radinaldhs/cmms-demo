import { json } from '@sveltejs/kit';
import { companyProfile } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const profile = companyProfile.get();
	return json(profile);
};

export const PUT: RequestHandler = async ({ request }) => {
	const updates = await request.json();
	const updated = companyProfile.update(updates);
	return json(updated);
};
