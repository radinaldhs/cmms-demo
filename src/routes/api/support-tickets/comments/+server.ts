import { json } from '@sveltejs/kit';
import { supportTickets } from '$stores';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { ticketId, author, content, isInternal = false } = await request.json();

	if (!ticketId || !author || !content) {
		return json(
			{ error: 'ticketId, author, and content are required' },
			{ status: 400 }
		);
	}

	const success = supportTickets.addComment(ticketId, {
		author,
		content,
		isInternal
	});

	if (!success) {
		return json({ error: 'Ticket not found' }, { status: 404 });
	}

	const updatedTicket = supportTickets.getById(ticketId);

	return json(updatedTicket, { status: 201 });
};
