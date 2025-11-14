import { license, supportTickets } from '$stores';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		license: license.get(),
		tickets: supportTickets.getAll()
	};
};
