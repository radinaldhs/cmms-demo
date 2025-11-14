import { json } from '@sveltejs/kit';
import { supportTickets } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const status = url.searchParams.get('status');
	const id = url.searchParams.get('id');

	if (id) {
		const ticket = supportTickets.getById(id);
		if (!ticket) {
			return json({ error: 'Ticket not found' }, { status: 404 });
		}
		return json(ticket);
	}

	let results = supportTickets.getAll();

	if (status) {
		results = supportTickets.filterByStatus(status);
	}

	return json(results);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const newTicket = supportTickets.create(data);
	return json(newTicket, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const { id, ...updates } = await request.json();
	const updated = supportTickets.update(id, updates);

	if (!updated) {
		return json({ error: 'Ticket not found' }, { status: 404 });
	}

	return json(updated);
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Ticket ID is required' }, { status: 400 });
	}

	const ticket = supportTickets.getById(id);

	if (!ticket) {
		return json({ error: 'Ticket not found' }, { status: 404 });
	}

	// For now, we'll just update status to Closed instead of deleting
	supportTickets.update(id, { status: 'Closed' });

	return json({ success: true });
};
