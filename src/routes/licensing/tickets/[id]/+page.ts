import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const response = await fetch(`/api/support-tickets?id=${params.id}`);

	if (!response.ok) {
		throw error(404, 'Ticket not found');
	}

	const ticket = await response.json();

	return {
		ticket
	};
};
