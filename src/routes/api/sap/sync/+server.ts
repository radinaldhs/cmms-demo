import { json } from '@sveltejs/kit';
import { sapItems, integrationSettings, syncLogs } from '$stores';
import type { RequestHandler} from './$types';

// GET /api/sap/sync - Get sync status and recent logs
export const GET: RequestHandler = async () => {
	const settings = integrationSettings.get();
	const recentLogs = syncLogs.getLatest(10);

	return json({
		settings,
		recentLogs
	});
};

// POST /api/sap/sync - Trigger sync (pull or push)
export const POST: RequestHandler = async ({ request }) => {
	const { direction } = await request.json();

	if (direction === 'pull') {
		// Simulate pulling from SAP
		const syncLog = await sapItems.pullFromSAP();
		return json(syncLog);
	} else if (direction === 'push') {
		// Simulate pushing to SAP
		const items = sapItems.getAll();
		const syncLog = await sapItems.pushToSAP(items);
		return json(syncLog);
	}

	return json({ error: 'Invalid direction' }, { status: 400 });
};
