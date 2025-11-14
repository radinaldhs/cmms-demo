import { writable, derived } from 'svelte/store';
import type { Asset } from '$types';

// In-memory asset storage
const initialAssets: Asset[] = [
	{
		id: 'AST001',
		code: 'PUMP-001',
		name: 'Centrifugal Pump A1',
		category: 'Pumps',
		location: 'Plant A - Section 1',
		status: 'Active',
		purchaseDate: '2020-03-15',
		purchaseCost: 45000,
		usefulLifeYears: 10,
		depreciationMethod: 'STRAIGHT_LINE',
		residualValue: 5000,
		tags: ['critical', 'water-system'],
		assignedTo: 'John Smith',
		isFleet: false,
		description: 'Primary water circulation pump',
		manufacturer: 'GrundFos',
		model: 'CR-150',
		serialNumber: 'GF2020-150-4521',
		warrantyExpiry: '2023-03-15',
		createdAt: '2020-03-15T10:00:00Z',
		updatedAt: '2024-01-10T14:30:00Z'
	},
	{
		id: 'AST002',
		code: 'COMP-001',
		name: 'Air Compressor Main',
		category: 'Compressors',
		location: 'Plant A - Utility Room',
		status: 'Active',
		purchaseDate: '2019-06-20',
		purchaseCost: 75000,
		usefulLifeYears: 15,
		depreciationMethod: 'STRAIGHT_LINE',
		residualValue: 10000,
		tags: ['critical', 'pneumatic'],
		assignedTo: 'Mike Johnson',
		isFleet: false,
		description: 'Main facility air compressor',
		manufacturer: 'Atlas Copco',
		model: 'GA-90',
		serialNumber: 'AC2019-GA90-1234',
		warrantyExpiry: '2022-06-20',
		createdAt: '2019-06-20T09:00:00Z',
		updatedAt: '2024-01-15T11:20:00Z'
	},
	{
		id: 'AST003',
		code: 'CONV-001',
		name: 'Conveyor Belt System 1',
		category: 'Conveyors',
		location: 'Plant B - Production Line 1',
		status: 'Active',
		purchaseDate: '2021-01-10',
		purchaseCost: 120000,
		usefulLifeYears: 12,
		depreciationMethod: 'STRAIGHT_LINE',
		residualValue: 15000,
		tags: ['production', 'automated'],
		isFleet: false,
		description: 'Automated conveyor system for production line',
		manufacturer: 'Siemens',
		model: 'SIMATIC-CB500',
		serialNumber: 'SIE-CB500-9988',
		createdAt: '2021-01-10T08:00:00Z',
		updatedAt: '2024-02-01T16:45:00Z'
	},
	{
		id: 'AST004',
		code: 'GEN-001',
		name: 'Backup Generator',
		category: 'Generators',
		location: 'Plant A - External',
		status: 'Active',
		purchaseDate: '2018-11-05',
		purchaseCost: 95000,
		usefulLifeYears: 20,
		depreciationMethod: 'STRAIGHT_LINE',
		residualValue: 15000,
		tags: ['backup', 'power'],
		isFleet: false,
		description: 'Emergency backup power generator',
		manufacturer: 'Caterpillar',
		model: 'CAT-500KVA',
		serialNumber: 'CAT-500-7766',
		createdAt: '2018-11-05T10:30:00Z',
		updatedAt: '2024-01-20T09:15:00Z'
	},
	{
		id: 'AST005',
		code: 'HVAC-001',
		name: 'HVAC System Building A',
		category: 'HVAC',
		location: 'Building A - Roof',
		status: 'Active',
		purchaseDate: '2020-08-12',
		purchaseCost: 85000,
		usefulLifeYears: 15,
		depreciationMethod: 'STRAIGHT_LINE',
		residualValue: 10000,
		tags: ['climate-control'],
		isFleet: false,
		description: 'Central HVAC system for office building',
		manufacturer: 'Carrier',
		model: 'AquaEdge-19DV',
		serialNumber: 'CAR-19DV-5544',
		createdAt: '2020-08-12T11:00:00Z',
		updatedAt: '2024-01-25T13:30:00Z'
	},
	{
		id: 'AST006',
		code: 'FORK-001',
		name: 'Forklift Toyota 3-Ton',
		category: 'Material Handling',
		location: 'Warehouse 1',
		status: 'Active',
		purchaseDate: '2022-03-20',
		purchaseCost: 35000,
		usefulLifeYears: 10,
		depreciationMethod: 'STRAIGHT_LINE',
		residualValue: 5000,
		tags: ['warehouse', 'logistics'],
		isFleet: false,
		description: 'Electric forklift for warehouse operations',
		manufacturer: 'Toyota',
		model: '8FBCHU25',
		serialNumber: 'TOY-8FB-3322',
		createdAt: '2022-03-20T14:00:00Z',
		updatedAt: '2024-02-05T10:00:00Z'
	},
	{
		id: 'AST007',
		code: 'BOIL-001',
		name: 'Industrial Boiler',
		category: 'Boilers',
		location: 'Plant A - Boiler Room',
		status: 'Maintenance',
		purchaseDate: '2017-05-30',
		purchaseCost: 150000,
		usefulLifeYears: 25,
		depreciationMethod: 'STRAIGHT_LINE',
		residualValue: 20000,
		tags: ['critical', 'steam'],
		assignedTo: 'David Wilson',
		isFleet: false,
		description: 'Main steam boiler for process heat',
		manufacturer: 'Cleaver-Brooks',
		model: 'CB-700-150',
		serialNumber: 'CB-700-1122',
		createdAt: '2017-05-30T09:00:00Z',
		updatedAt: '2024-02-10T08:20:00Z'
	},
	{
		id: 'AST008',
		code: 'CNC-001',
		name: 'CNC Milling Machine',
		category: 'Machine Tools',
		location: 'Plant B - Workshop',
		status: 'Active',
		purchaseDate: '2021-09-15',
		purchaseCost: 180000,
		usefulLifeYears: 15,
		depreciationMethod: 'STRAIGHT_LINE',
		residualValue: 30000,
		tags: ['precision', 'manufacturing'],
		isFleet: false,
		description: '5-axis CNC milling machine',
		manufacturer: 'Haas',
		model: 'VF-6/50',
		serialNumber: 'HAAS-VF6-8899',
		createdAt: '2021-09-15T10:30:00Z',
		updatedAt: '2024-01-30T15:00:00Z'
	},
	{
		id: 'AST009',
		code: 'COOL-001',
		name: 'Chiller Unit Primary',
		category: 'Cooling Systems',
		location: 'Plant A - Cooling Tower',
		status: 'Active',
		purchaseDate: '2019-12-01',
		purchaseCost: 110000,
		usefulLifeYears: 18,
		depreciationMethod: 'STRAIGHT_LINE',
		residualValue: 15000,
		tags: ['cooling', 'process'],
		isFleet: false,
		description: 'Primary process cooling chiller',
		manufacturer: 'Trane',
		model: 'CGAM-250',
		serialNumber: 'TRA-CGAM-6677',
		createdAt: '2019-12-01T11:00:00Z',
		updatedAt: '2024-02-08T12:30:00Z'
	},
	{
		id: 'AST010',
		code: 'WELD-001',
		name: 'Robotic Welding Station',
		category: 'Robotics',
		location: 'Plant B - Assembly Area',
		status: 'Active',
		purchaseDate: '2022-07-10',
		purchaseCost: 200000,
		usefulLifeYears: 12,
		depreciationMethod: 'STRAIGHT_LINE',
		residualValue: 30000,
		tags: ['automation', 'welding'],
		isFleet: false,
		description: 'Automated robotic welding system',
		manufacturer: 'ABB',
		model: 'IRB-6700',
		serialNumber: 'ABB-6700-4455',
		createdAt: '2022-07-10T09:30:00Z',
		updatedAt: '2024-02-12T14:00:00Z'
	}
];

// Create writable store
const assetsStore = writable<Asset[]>(initialAssets);

// Helper functions for CRUD operations
export const assets = {
	subscribe: assetsStore.subscribe,

	getAll: (): Asset[] => {
		let items: Asset[] = [];
		assetsStore.subscribe((value) => (items = value))();
		return items;
	},

	getById: (id: string): Asset | undefined => {
		let items: Asset[] = [];
		assetsStore.subscribe((value) => (items = value))();
		return items.find((a) => a.id === id);
	},

	getByCode: (code: string): Asset | undefined => {
		let items: Asset[] = [];
		assetsStore.subscribe((value) => (items = value))();
		return items.find((a) => a.code === code);
	},

	create: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Asset => {
		const newAsset: Asset = {
			...asset,
			id: `AST${String(Date.now()).slice(-6)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		assetsStore.update((items) => [...items, newAsset]);
		return newAsset;
	},

	update: (id: string, updates: Partial<Asset>): Asset | undefined => {
		let updatedAsset: Asset | undefined;

		assetsStore.update((items) => {
			const index = items.findIndex((a) => a.id === id);
			if (index !== -1) {
				updatedAsset = {
					...items[index],
					...updates,
					updatedAt: new Date().toISOString()
				};
				items[index] = updatedAsset;
			}
			return items;
		});

		return updatedAsset;
	},

	delete: (id: string): boolean => {
		let deleted = false;

		assetsStore.update((items) => {
			const initialLength = items.length;
			const filtered = items.filter((a) => a.id !== id);
			deleted = filtered.length < initialLength;
			return filtered;
		});

		return deleted;
	},

	search: (query: string): Asset[] => {
		const items = assets.getAll();
		const lowerQuery = query.toLowerCase();

		return items.filter(
			(asset) =>
				asset.name.toLowerCase().includes(lowerQuery) ||
				asset.code.toLowerCase().includes(lowerQuery) ||
				asset.category.toLowerCase().includes(lowerQuery) ||
				asset.location.toLowerCase().includes(lowerQuery)
		);
	},

	filterByCategory: (category: string): Asset[] => {
		const items = assets.getAll();
		return items.filter((asset) => asset.category === category);
	},

	filterByStatus: (status: string): Asset[] => {
		const items = assets.getAll();
		return items.filter((asset) => asset.status === status);
	},

	getCategories: (): string[] => {
		const items = assets.getAll();
		return [...new Set(items.map((a) => a.category))];
	}
};

// Derived store for fleet assets
export const fleetAssets = derived(assetsStore, ($assets) => $assets.filter((a) => a.isFleet));

// Derived store for active assets
export const activeAssets = derived(assetsStore, ($assets) =>
	$assets.filter((a) => a.status === 'Active')
);
