import { integrationSettings, syncLogs } from '$stores';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		settings: integrationSettings.get(),
		recentLogs: syncLogs.getLatest(10)
	};
};
