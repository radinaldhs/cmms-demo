import { json } from '@sveltejs/kit';
import { users } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');
	const status = url.searchParams.get('status');
	const roleId = url.searchParams.get('roleId');

	if (id) {
		const user = users.getById(id);
		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}
		return json(user);
	}

	let results = users.getAll();

	if (status) {
		results = users.filterByStatus(status);
	}

	if (roleId) {
		results = users.filterByRole(roleId);
	}

	return json(results);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	// Validate required fields
	if (!data.username || !data.email || !data.firstName || !data.lastName || !data.roleId) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	const newUser = users.create(data);
	return json(newUser, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const { id, ...updates } = await request.json();

	if (!id) {
		return json({ error: 'User ID is required' }, { status: 400 });
	}

	const updated = users.update(id, updates);

	if (!updated) {
		return json({ error: 'User not found' }, { status: 404 });
	}

	return json(updated);
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'User ID is required' }, { status: 400 });
	}

	const deleted = users.delete(id);

	if (!deleted) {
		return json({ error: 'User not found' }, { status: 404 });
	}

	return json({ success: true });
};
