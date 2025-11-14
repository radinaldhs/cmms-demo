import { json } from '@sveltejs/kit';
import { notifications } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

	const results = unreadOnly ? notifications.getUnread() : notifications.getAll();

	return json(results);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const newNotification = notifications.create(data);
	return json(newNotification, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const { id, markAllAsRead } = await request.json();

	if (markAllAsRead) {
		notifications.markAllAsRead();
		return json({ success: true });
	}

	const updated = notifications.markAsRead(id);

	if (!updated) {
		return json({ error: 'Notification not found' }, { status: 404 });
	}

	return json(updated);
};
