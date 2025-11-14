import { json } from '@sveltejs/kit';
import { roles, permissions } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');
	const type = url.searchParams.get('type');

	// Get permissions
	if (type === 'permissions') {
		const allPermissions = permissions.getAll();
		return json(allPermissions);
	}

	// Get specific role
	if (id) {
		const role = roles.getById(id);
		if (!role) {
			return json({ error: 'Role not found' }, { status: 404 });
		}
		return json(role);
	}

	// Get all roles
	const allRoles = roles.getAll();
	return json(allRoles);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	// Validate required fields
	if (!data.name || !data.description || !data.permissions) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	const newRole = roles.create({
		...data,
		isSystemRole: false
	});

	return json(newRole, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const { id, ...updates } = await request.json();

	if (!id) {
		return json({ error: 'Role ID is required' }, { status: 400 });
	}

	// Check if it's a system role
	const existingRole = roles.getById(id);
	if (existingRole?.isSystemRole) {
		return json({ error: 'Cannot modify system roles' }, { status: 403 });
	}

	const updated = roles.update(id, updates);

	if (!updated) {
		return json({ error: 'Role not found' }, { status: 404 });
	}

	return json(updated);
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Role ID is required' }, { status: 400 });
	}

	const role = roles.getById(id);

	if (!role) {
		return json({ error: 'Role not found' }, { status: 404 });
	}

	if (role.isSystemRole) {
		return json({ error: 'Cannot delete system roles' }, { status: 403 });
	}

	if (role.userCount > 0) {
		return json(
			{ error: 'Cannot delete role with assigned users' },
			{ status: 400 }
		);
	}

	const deleted = roles.delete(id);

	if (!deleted) {
		return json({ error: 'Failed to delete role' }, { status: 500 });
	}

	return json({ success: true });
};
