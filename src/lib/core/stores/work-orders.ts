import { writable, derived } from 'svelte/store';
import type { WorkOrder, WorkOrderStatus } from '$types';
import { isOverdue } from '$utils';

// In-memory work orders storage
const initialWorkOrders: WorkOrder[] = [
	{
		id: 'WO001',
		assetId: 'AST001',
		assetName: 'Centrifugal Pump A1',
		title: 'Quarterly Pump Maintenance',
		description: 'Routine quarterly maintenance including bearing inspection, seal replacement, and alignment check',
		priority: 'Medium',
		status: 'Completed',
		requestedBy: 'John Smith',
		assignedTo: 'Mike Johnson',
		scheduledDate: '2024-01-15',
		dueDate: '2024-01-15',
		completedDate: '2024-01-15',
		cost: 850,
		sparePartsUsed: [
			{ partId: 'SP001', partCode: 'SEAL-001', partName: 'Mechanical Seal', quantity: 2, unitCost: 125, totalCost: 250 },
			{ partId: 'SP015', partCode: 'BEAR-001', partName: 'Ball Bearing 6205', quantity: 4, unitCost: 45, totalCost: 180 }
		],
		laborHours: 4,
		notes: 'Completed successfully. All components within normal parameters.',
		createdAt: '2024-01-10T09:00:00Z',
		updatedAt: '2024-01-15T16:30:00Z'
	},
	{
		id: 'WO002',
		assetId: 'AST002',
		assetName: 'Air Compressor Main',
		title: 'Air Filter Replacement',
		description: 'Replace air intake filters and check oil levels',
		priority: 'Low',
		status: 'In Progress',
		requestedBy: 'David Wilson',
		assignedTo: 'Robert Brown',
		scheduledDate: '2024-02-15',
		dueDate: '2024-02-15',
		cost: 0,
		sparePartsUsed: [
			{ partId: 'SP010', partCode: 'FILT-002', partName: 'Air Filter Element', quantity: 1, unitCost: 85, totalCost: 85 }
		],
		laborHours: 1,
		createdAt: '2024-02-10T10:00:00Z',
		updatedAt: '2024-02-15T09:30:00Z'
	},
	{
		id: 'WO003',
		assetId: 'AST007',
		assetName: 'Industrial Boiler',
		title: 'Annual Boiler Inspection',
		description: 'Complete annual inspection including safety valve testing, pressure tests, and combustion analysis',
		priority: 'Critical',
		status: 'Planned',
		requestedBy: 'Safety Department',
		assignedTo: 'Expert Services Inc',
		scheduledDate: '2024-03-01',
		dueDate: '2024-03-01',
		cost: 0,
		sparePartsUsed: [],
		laborHours: 8,
		notes: 'Requires certified inspector. Schedule coordinated with production shutdown.',
		createdAt: '2024-01-20T11:00:00Z',
		updatedAt: '2024-01-20T11:00:00Z'
	},
	{
		id: 'WO004',
		assetId: 'AST003',
		assetName: 'Conveyor Belt System 1',
		title: 'Belt Tension Adjustment',
		description: 'Adjust belt tension and inspect rollers for wear',
		priority: 'High',
		status: 'Overdue',
		requestedBy: 'Production Manager',
		assignedTo: 'Mike Johnson',
		scheduledDate: '2024-02-05',
		dueDate: '2024-02-05',
		cost: 0,
		sparePartsUsed: [],
		laborHours: 2,
		notes: 'Belt showing signs of slipping. Needs immediate attention.',
		createdAt: '2024-02-01T08:00:00Z',
		updatedAt: '2024-02-05T10:00:00Z'
	},
	{
		id: 'WO005',
		assetId: 'AST004',
		assetName: 'Backup Generator',
		title: 'Monthly Load Bank Test',
		description: 'Perform monthly load bank test and record voltage/frequency readings',
		priority: 'Medium',
		status: 'Completed',
		requestedBy: 'Facilities Manager',
		assignedTo: 'David Wilson',
		scheduledDate: '2024-02-01',
		dueDate: '2024-02-01',
		completedDate: '2024-02-01',
		cost: 150,
		sparePartsUsed: [],
		laborHours: 2,
		notes: 'Generator performed within specifications. No issues found.',
		createdAt: '2024-01-25T09:00:00Z',
		updatedAt: '2024-02-01T14:00:00Z'
	},
	{
		id: 'WO006',
		assetId: 'AST005',
		assetName: 'HVAC System Building A',
		title: 'Filter Change and Coil Cleaning',
		description: 'Replace HVAC filters and clean evaporator coils',
		priority: 'Low',
		status: 'Planned',
		requestedBy: 'Building Manager',
		assignedTo: 'Robert Brown',
		scheduledDate: '2024-02-20',
		dueDate: '2024-02-20',
		cost: 0,
		sparePartsUsed: [
			{ partId: 'SP011', partCode: 'FILT-003', partName: 'HVAC Filter 20x25', quantity: 8, unitCost: 35, totalCost: 280 }
		],
		laborHours: 3,
		createdAt: '2024-02-12T10:00:00Z',
		updatedAt: '2024-02-12T10:00:00Z'
	},
	{
		id: 'WO007',
		assetId: 'AST008',
		assetName: 'CNC Milling Machine',
		title: 'Spindle Bearing Replacement',
		description: 'Replace worn spindle bearings causing vibration',
		priority: 'Critical',
		status: 'In Progress',
		requestedBy: 'Workshop Supervisor',
		assignedTo: 'Mike Johnson',
		scheduledDate: '2024-02-14',
		dueDate: '2024-02-16',
		cost: 0,
		sparePartsUsed: [
			{ partId: 'SP020', partCode: 'BEAR-003', partName: 'Spindle Bearing Set', quantity: 1, unitCost: 850, totalCost: 850 }
		],
		laborHours: 6,
		notes: 'Machine down. Priority repair to minimize production impact.',
		createdAt: '2024-02-13T14:00:00Z',
		updatedAt: '2024-02-14T11:00:00Z'
	},
	{
		id: 'WO008',
		assetId: 'AST006',
		assetName: 'Forklift Toyota 3-Ton',
		title: 'Battery Maintenance',
		description: 'Check battery water levels, clean terminals, and test charging system',
		priority: 'Low',
		status: 'Completed',
		requestedBy: 'Warehouse Manager',
		assignedTo: 'Robert Brown',
		scheduledDate: '2024-02-08',
		dueDate: '2024-02-08',
		completedDate: '2024-02-08',
		cost: 120,
		sparePartsUsed: [],
		laborHours: 1,
		notes: 'Battery in good condition. Added distilled water.',
		createdAt: '2024-02-05T09:00:00Z',
		updatedAt: '2024-02-08T11:30:00Z'
	},
	{
		id: 'WO009',
		assetId: 'FLT001',
		assetName: 'Isuzu Truck B 1234 XYZ',
		title: '10,000 KM Service',
		description: 'Routine 10,000 km service: oil change, filter replacement, brake check',
		priority: 'Medium',
		status: 'Planned',
		requestedBy: 'Fleet Manager',
		assignedTo: 'Service Center A',
		scheduledDate: '2024-02-18',
		dueDate: '2024-02-18',
		cost: 0,
		sparePartsUsed: [
			{ partId: 'SP025', partCode: 'OIL-001', partName: 'Engine Oil 15W40 (20L)', quantity: 1, unitCost: 185, totalCost: 185 },
			{ partId: 'SP026', partCode: 'FILT-005', partName: 'Oil Filter', quantity: 1, unitCost: 45, totalCost: 45 },
			{ partId: 'SP027', partCode: 'FILT-006', partName: 'Air Filter', quantity: 1, unitCost: 65, totalCost: 65 }
		],
		laborHours: 2,
		createdAt: '2024-02-10T13:00:00Z',
		updatedAt: '2024-02-10T13:00:00Z'
	},
	{
		id: 'WO010',
		assetId: 'AST009',
		assetName: 'Chiller Unit Primary',
		title: 'Refrigerant Level Check',
		description: 'Check refrigerant levels and look for leaks',
		priority: 'High',
		status: 'Overdue',
		requestedBy: 'Maintenance Supervisor',
		assignedTo: 'David Wilson',
		scheduledDate: '2024-02-10',
		dueDate: '2024-02-10',
		cost: 0,
		sparePartsUsed: [],
		laborHours: 2,
		notes: 'Chiller efficiency has decreased. Suspected refrigerant leak.',
		createdAt: '2024-02-05T10:00:00Z',
		updatedAt: '2024-02-10T09:00:00Z'
	},
	{
		id: 'WO011',
		assetId: 'AST010',
		assetName: 'Robotic Welding Station',
		title: 'Torch Tip Replacement',
		description: 'Replace welding torch tips and nozzles',
		priority: 'Low',
		status: 'Completed',
		requestedBy: 'Production Supervisor',
		assignedTo: 'Mike Johnson',
		scheduledDate: '2024-02-12',
		dueDate: '2024-02-12',
		completedDate: '2024-02-12',
		cost: 95,
		sparePartsUsed: [
			{ partId: 'SP030', partCode: 'WELD-001', partName: 'Welding Torch Tips (Set)', quantity: 1, unitCost: 95, totalCost: 95 }
		],
		laborHours: 1,
		notes: 'Tips replaced. Weld quality improved.',
		createdAt: '2024-02-10T11:00:00Z',
		updatedAt: '2024-02-12T15:00:00Z'
	},
	{
		id: 'WO012',
		assetId: 'FLT004',
		assetName: 'Hino Truck B 3456 GHI',
		title: 'Brake System Repair',
		description: 'Replace brake pads and check brake fluid',
		priority: 'Critical',
		status: 'In Progress',
		requestedBy: 'Driver Report',
		assignedTo: 'Service Center B',
		scheduledDate: '2024-02-14',
		dueDate: '2024-02-15',
		cost: 0,
		sparePartsUsed: [
			{ partId: 'SP031', partCode: 'BRAKE-001', partName: 'Brake Pad Set Front', quantity: 1, unitCost: 250, totalCost: 250 },
			{ partId: 'SP032', partCode: 'BRAKE-002', partName: 'Brake Pad Set Rear', quantity: 1, unitCost: 220, totalCost: 220 },
			{ partId: 'SP033', partCode: 'FLUID-001', partName: 'Brake Fluid DOT 4 (1L)', quantity: 2, unitCost: 35, totalCost: 70 }
		],
		laborHours: 4,
		notes: 'Driver reported soft brake pedal. Vehicle in workshop.',
		createdAt: '2024-02-13T16:00:00Z',
		updatedAt: '2024-02-14T10:00:00Z'
	}
];

// Create writable store
const workOrdersStore = writable<WorkOrder[]>(initialWorkOrders);

// Helper functions for CRUD operations
export const workOrders = {
	subscribe: workOrdersStore.subscribe,

	getAll: (): WorkOrder[] => {
		let items: WorkOrder[] = [];
		workOrdersStore.subscribe((value) => (items = value))();
		return items;
	},

	getById: (id: string): WorkOrder | undefined => {
		let items: WorkOrder[] = [];
		workOrdersStore.subscribe((value) => (items = value))();
		return items.find((wo) => wo.id === id);
	},

	create: (workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): WorkOrder => {
		const newWorkOrder: WorkOrder = {
			...workOrder,
			id: `WO${String(Date.now()).slice(-6)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		workOrdersStore.update((items) => [...items, newWorkOrder]);
		return newWorkOrder;
	},

	update: (id: string, updates: Partial<WorkOrder>): WorkOrder | undefined => {
		let updatedWorkOrder: WorkOrder | undefined;

		workOrdersStore.update((items) => {
			const index = items.findIndex((wo) => wo.id === id);
			if (index !== -1) {
				updatedWorkOrder = {
					...items[index],
					...updates,
					updatedAt: new Date().toISOString()
				};
				items[index] = updatedWorkOrder;
			}
			return items;
		});

		return updatedWorkOrder;
	},

	updateStatus: (id: string, status: WorkOrderStatus): WorkOrder | undefined => {
		const updates: Partial<WorkOrder> = { status };

		if (status === 'Completed') {
			updates.completedDate = new Date().toISOString();
		}

		return workOrders.update(id, updates);
	},

	delete: (id: string): boolean => {
		let deleted = false;

		workOrdersStore.update((items) => {
			const initialLength = items.length;
			const filtered = items.filter((wo) => wo.id !== id);
			deleted = filtered.length < initialLength;
			return filtered;
		});

		return deleted;
	},

	filterByStatus: (status: WorkOrderStatus): WorkOrder[] => {
		const items = workOrders.getAll();
		return items.filter((wo) => wo.status === status);
	},

	filterByAsset: (assetId: string): WorkOrder[] => {
		const items = workOrders.getAll();
		return items.filter((wo) => wo.assetId === assetId);
	},

	filterByPriority: (priority: string): WorkOrder[] => {
		const items = workOrders.getAll();
		return items.filter((wo) => wo.priority === priority);
	},

	filterByAssignee: (assignedTo: string): WorkOrder[] => {
		const items = workOrders.getAll();
		return items.filter((wo) => wo.assignedTo === assignedTo);
	},

	getOverdue: (): WorkOrder[] => {
		const items = workOrders.getAll();
		return items.filter(
			(wo) => wo.status !== 'Completed' && wo.status !== 'Cancelled' && isOverdue(wo.dueDate)
		);
	},

	getUpcoming: (days: number = 7): WorkOrder[] => {
		const items = workOrders.getAll();
		const now = new Date();
		const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

		return items.filter((wo) => {
			if (wo.status === 'Completed' || wo.status === 'Cancelled') return false;
			const dueDate = new Date(wo.dueDate);
			return dueDate >= now && dueDate <= futureDate;
		});
	},

	getTotalCost: (workOrderIds?: string[]): number => {
		let items = workOrders.getAll();

		if (workOrderIds) {
			items = items.filter((wo) => workOrderIds.includes(wo.id));
		}

		return items.reduce((sum, wo) => sum + wo.cost, 0);
	}
};

// Derived stores
export const openWorkOrders = derived(workOrdersStore, ($workOrders) =>
	$workOrders.filter((wo) => wo.status !== 'Completed' && wo.status !== 'Cancelled')
);

export const overdueWorkOrders = derived(workOrdersStore, ($workOrders) =>
	$workOrders.filter(
		(wo) => wo.status !== 'Completed' && wo.status !== 'Cancelled' && isOverdue(wo.dueDate)
	)
);

export const completedWorkOrders = derived(workOrdersStore, ($workOrders) =>
	$workOrders.filter((wo) => wo.status === 'Completed')
);
