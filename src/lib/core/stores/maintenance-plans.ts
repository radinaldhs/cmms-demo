import { writable, derived } from 'svelte/store';
import type { MaintenancePlan, MaintenanceType } from '$types';

// In-memory maintenance plans storage
const initialPlans: MaintenancePlan[] = [
	{
		id: 'PLAN001',
		assetId: 'AST001',
		assetName: 'Centrifugal Pump A1',
		type: 'TIME_BASED',
		intervalDays: 90,
		taskDescription: 'Quarterly pump maintenance - bearing inspection and seal replacement',
		nextDueDate: '2025-04-15',
		isActive: true,
		estimatedDuration: 4,
		requiredParts: ['SP001', 'SP015'],
		createdAt: '2025-01-01T08:00:00Z',
		updatedAt: '2025-01-01T08:00:00Z'
	},
	{
		id: 'PLAN002',
		assetId: 'AST002',
		assetName: 'Air Compressor Main',
		type: 'TIME_BASED',
		intervalDays: 30,
		taskDescription: 'Monthly air filter replacement and oil level check',
		nextDueDate: '2025-03-15',
		isActive: true,
		estimatedDuration: 1,
		requiredParts: ['SP010'],
		createdAt: '2025-01-01T08:00:00Z',
		updatedAt: '2025-01-01T08:00:00Z'
	},
	{
		id: 'PLAN003',
		assetId: 'FLT001',
		assetName: 'Isuzu Truck B 1234 XYZ',
		type: 'METER_BASED',
		intervalMeter: 10000,
		taskDescription: 'Oil change and general inspection',
		nextDueDate: '2025-03-20',
		isActive: true,
		estimatedDuration: 2,
		requiredParts: ['SP025', 'SP026', 'SP027'],
		createdAt: '2025-01-01T08:00:00Z',
		updatedAt: '2025-01-01T08:00:00Z'
	},
	{
		id: 'PLAN004',
		assetId: 'AST007',
		assetName: 'Industrial Boiler',
		type: 'TIME_BASED',
		intervalDays: 365,
		taskDescription: 'Annual boiler inspection and safety certification',
		nextDueDate: '2025-05-30',
		isActive: true,
		estimatedDuration: 8,
		requiredParts: [],
		createdAt: '2025-01-01T08:00:00Z',
		updatedAt: '2025-01-01T08:00:00Z'
	},
	{
		id: 'PLAN005',
		assetId: 'AST005',
		assetName: 'HVAC System Building A',
		type: 'TIME_BASED',
		intervalDays: 180,
		taskDescription: 'Semi-annual HVAC filter change and coil cleaning',
		nextDueDate: '2025-02-20',
		isActive: false,
		estimatedDuration: 3,
		requiredParts: ['SP011'],
		createdAt: '2025-01-01T08:00:00Z',
		updatedAt: '2025-01-01T08:00:00Z'
	}
];

// Create writable store
const maintenancePlansStore = writable<MaintenancePlan[]>(initialPlans);

// Helper functions for CRUD operations
export const maintenancePlans = {
	subscribe: maintenancePlansStore.subscribe,

	getAll: (): MaintenancePlan[] => {
		let items: MaintenancePlan[] = [];
		maintenancePlansStore.subscribe((value) => (items = value))();
		return items;
	},

	getById: (id: string): MaintenancePlan | undefined => {
		let items: MaintenancePlan[] = [];
		maintenancePlansStore.subscribe((value) => (items = value))();
		return items.find((plan) => plan.id === id);
	},

	create: (plan: Omit<MaintenancePlan, 'id' | 'createdAt' | 'updatedAt'>): MaintenancePlan => {
		const newPlan: MaintenancePlan = {
			...plan,
			id: `PLAN${String(Date.now()).slice(-6)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		maintenancePlansStore.update((items) => [...items, newPlan]);
		return newPlan;
	},

	update: (id: string, updates: Partial<MaintenancePlan>): MaintenancePlan | undefined => {
		let updatedPlan: MaintenancePlan | undefined;

		maintenancePlansStore.update((items) => {
			const index = items.findIndex((plan) => plan.id === id);
			if (index !== -1) {
				updatedPlan = {
					...items[index],
					...updates,
					updatedAt: new Date().toISOString()
				};
				items[index] = updatedPlan;
			}
			return items;
		});

		return updatedPlan;
	},

	delete: (id: string): boolean => {
		let deleted = false;

		maintenancePlansStore.update((items) => {
			const initialLength = items.length;
			const filtered = items.filter((plan) => plan.id !== id);
			deleted = filtered.length < initialLength;
			return filtered;
		});

		return deleted;
	},

	filterByAsset: (assetId: string): MaintenancePlan[] => {
		const items = maintenancePlans.getAll();
		return items.filter((plan) => plan.assetId === assetId);
	},

	filterByType: (type: MaintenanceType): MaintenancePlan[] => {
		const items = maintenancePlans.getAll();
		return items.filter((plan) => plan.type === type);
	},

	getActive: (): MaintenancePlan[] => {
		const items = maintenancePlans.getAll();
		return items.filter((plan) => plan.isActive);
	},

	getInactive: (): MaintenancePlan[] => {
		const items = maintenancePlans.getAll();
		return items.filter((plan) => !plan.isActive);
	},

	getUpcoming: (days: number = 30): MaintenancePlan[] => {
		const items = maintenancePlans.getAll();
		const now = new Date();
		const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

		return items.filter((plan) => {
			if (!plan.isActive) return false;
			const dueDate = new Date(plan.nextDueDate);
			return dueDate >= now && dueDate <= futureDate;
		});
	}
};

// Derived stores
export const activePlans = derived(maintenancePlansStore, ($plans) =>
	$plans.filter((plan) => plan.isActive)
);

export const upcomingPlans = derived(maintenancePlansStore, ($plans) => {
	const now = new Date();
	const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

	return $plans.filter((plan) => {
		if (!plan.isActive) return false;
		const dueDate = new Date(plan.nextDueDate);
		return dueDate >= now && dueDate <= futureDate;
	});
});
