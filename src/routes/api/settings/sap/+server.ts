import { json } from '@sveltejs/kit';
import { integrationSettings } from '$stores';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const settings = integrationSettings.get();
	return json(settings);
};

export const PUT: RequestHandler = async ({ request }) => {
	const updates = await request.json();
	const updated = integrationSettings.update(updates);
	return json(updated);
};

export const POST: RequestHandler = async ({ request }) => {
	const { action } = await request.json();

	if (action === 'test') {
		// Simulate testing the connection
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// Mock test result - 80% success rate for demo
		const isSuccess = Math.random() > 0.2;

		if (isSuccess) {
			return json({
				success: true,
				message: 'Connection successful! SAP B1 API is reachable.',
				responseTime: Math.floor(Math.random() * 500) + 200
			});
		} else {
			return json(
				{
					success: false,
					message: 'Connection failed. Please check your API URL and token.',
					error: 'ERR_CONNECTION_TIMEOUT'
				},
				{ status: 400 }
			);
		}
	}

	return json({ error: 'Invalid action' }, { status: 400 });
};
