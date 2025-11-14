import { writable } from 'svelte/store';
import type { IntegrationSettings, SyncLog, SAPItem } from '$types';

// Initial SAP integration settings
const initialSettings: IntegrationSettings = {
	apiUrl: 'https://api-sap-demo.example.com/v1',
	apiToken: 'demo_token_xxxxxxxxxxxxx',
	isEnabled: true,
	lastSyncTime: '2024-02-14T10:30:00Z',
	autoSyncEnabled: false,
	syncIntervalMinutes: 60
};

// Initial sync logs
const initialSyncLogs: SyncLog[] = [
	{
		id: 'SYNC001',
		direction: 'PULL',
		status: 'Success',
		itemsSynced: 45,
		errors: 0,
		startedAt: '2024-02-14T10:30:00Z',
		completedAt: '2024-02-14T10:32:15Z'
	},
	{
		id: 'SYNC002',
		direction: 'PULL',
		status: 'Success',
		itemsSynced: 43,
		errors: 0,
		startedAt: '2024-02-13T09:15:00Z',
		completedAt: '2024-02-13T09:17:05Z'
	},
	{
		id: 'SYNC003',
		direction: 'PUSH',
		status: 'Warning',
		itemsSynced: 8,
		errors: 2,
		startedAt: '2024-02-12T14:00:00Z',
		completedAt: '2024-02-12T14:01:30Z',
		errorDetails: ['Item SEAL-001: Price mismatch', 'Item BELT-002: Not found in SAP']
	},
	{
		id: 'SYNC004',
		direction: 'PULL',
		status: 'Success',
		itemsSynced: 42,
		errors: 0,
		startedAt: '2024-02-11T10:30:00Z',
		completedAt: '2024-02-11T10:32:00Z'
	}
];

// Mock SAP items (simulating what would come from SAP B1)
const mockSAPItems: SAPItem[] = [
	{
		itemCode: 'SAP-SEAL-40',
		itemName: 'Mechanical Seal 40mm',
		itemGroup: 'Seals & Gaskets',
		unitPrice: 125,
		onHand: 120,
		warehouse: 'WH01',
		lastUpdated: '2024-02-14T10:30:00Z'
	},
	{
		itemCode: 'SAP-ORING-AST',
		itemName: 'O-Ring Set Assorted',
		itemGroup: 'Seals & Gaskets',
		unitPrice: 45,
		onHand: 85,
		warehouse: 'WH01',
		lastUpdated: '2024-02-14T10:30:00Z'
	},
	{
		itemCode: 'SAP-LUB-SYN-5L',
		itemName: 'Synthetic Lubricant 5L',
		itemGroup: 'Lubricants',
		unitPrice: 85,
		onHand: 250,
		warehouse: 'WH01',
		lastUpdated: '2024-02-14T10:30:00Z'
	}
	// Add more as needed for demo
];

// Create writable stores
const integrationSettingsStore = writable<IntegrationSettings>(initialSettings);
const syncLogsStore = writable<SyncLog[]>(initialSyncLogs);
const sapItemsStore = writable<SAPItem[]>(mockSAPItems);

// Helper functions for integration settings
export const integrationSettings = {
	subscribe: integrationSettingsStore.subscribe,

	get: (): IntegrationSettings => {
		let settings: IntegrationSettings = initialSettings;
		integrationSettingsStore.subscribe((value) => (settings = value))();
		return settings;
	},

	update: (updates: Partial<IntegrationSettings>): IntegrationSettings => {
		let updatedSettings: IntegrationSettings = initialSettings;

		integrationSettingsStore.update((current) => {
			updatedSettings = { ...current, ...updates };
			return updatedSettings;
		});

		return updatedSettings;
	}
};

// Helper functions for sync logs
export const syncLogs = {
	subscribe: syncLogsStore.subscribe,

	getAll: (): SyncLog[] => {
		let logs: SyncLog[] = [];
		syncLogsStore.subscribe((value) => (logs = value))();
		return logs;
	},

	getLatest: (count: number = 5): SyncLog[] => {
		const logs = syncLogs.getAll();
		return logs.slice(0, count);
	},

	create: (log: Omit<SyncLog, 'id'>): SyncLog => {
		const newLog: SyncLog = {
			...log,
			id: `SYNC${String(Date.now()).slice(-6)}`
		};

		syncLogsStore.update((logs) => [newLog, ...logs]);

		// Update last sync time in settings
		integrationSettings.update({ lastSyncTime: newLog.completedAt });

		return newLog;
	}
};

// Helper functions for SAP items
export const sapItems = {
	subscribe: sapItemsStore.subscribe,

	getAll: (): SAPItem[] => {
		let items: SAPItem[] = [];
		sapItemsStore.subscribe((value) => (items = value))();
		return items;
	},

	// Simulate pulling data from SAP
	pullFromSAP: async (): Promise<SyncLog> => {
		const startTime = new Date().toISOString();

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Mock response - in real implementation, this would be an actual API call
		const pulledItems: SAPItem[] = [
			...mockSAPItems,
			{
				itemCode: 'SAP-NEW-001',
				itemName: 'New Item from SAP',
				itemGroup: 'Test Group',
				unitPrice: 100,
				onHand: 50,
				warehouse: 'WH01',
				lastUpdated: new Date().toISOString()
			}
		];

		// Update local items
		sapItemsStore.set(pulledItems);

		// Create sync log
		const syncLog = syncLogs.create({
			direction: 'PULL',
			status: 'Success',
			itemsSynced: pulledItems.length,
			errors: 0,
			startedAt: startTime,
			completedAt: new Date().toISOString()
		});

		return syncLog;
	},

	// Simulate pushing data to SAP
	pushToSAP: async (items: SAPItem[]): Promise<SyncLog> => {
		const startTime = new Date().toISOString();

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// Mock response - simulate some warnings
		const errors = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
		const errorDetails =
			errors > 0
				? Array.from({ length: errors }, (_, i) => `Item ${i + 1}: Simulated error`)
				: undefined;

		// Create sync log
		const syncLog = syncLogs.create({
			direction: 'PUSH',
			status: errors > 0 ? 'Warning' : 'Success',
			itemsSynced: items.length - errors,
			errors: errors,
			startedAt: startTime,
			completedAt: new Date().toISOString(),
			errorDetails
		});

		return syncLog;
	}
};
