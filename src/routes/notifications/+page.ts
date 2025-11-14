import { notifications } from '$stores';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		notifications: notifications.getAll()
	};
};
