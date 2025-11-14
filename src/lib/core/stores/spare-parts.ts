import { writable, derived } from 'svelte/store';
import type { SparePart, InventoryMovement } from '$types';

// In-memory spare parts storage
const initialSpareParts: SparePart[] = [
	{
		id: 'SP001',
		code: 'SEAL-001',
		description: 'Mechanical Seal 40mm',
		category: 'Seals',
		unit: 'pcs',
		currentStock: 12,
		minStock: 5,
		maxStock: 25,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL001',
		warehouseLocationName: 'Asia Pacific Central Warehouse',
		unitCost: 125,
		sapItemCode: 'SAP-SEAL-40',
		supplier: 'Industrial Parts Co.',
		leadTimeDays: 7,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-10T14:00:00Z'
	},
	{
		id: 'SP002',
		code: 'SEAL-002',
		description: 'O-Ring Set (Assorted)',
		category: 'Seals',
		unit: 'set',
		currentStock: 8,
		minStock: 3,
		maxStock: 15,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL004',
		warehouseLocationName: 'Jakarta Factory Warehouse',
		unitCost: 45,
		sapItemCode: 'SAP-ORING-AST',
		supplier: 'Industrial Parts Co.',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-12T09:00:00Z'
	},
	{
		id: 'SP003',
		code: 'LUBR-001',
		description: 'Synthetic Lubricant 5L',
		category: 'Lubricants',
		unit: 'bottle',
		currentStock: 25,
		minStock: 10,
		maxStock: 50,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL001',
		warehouseLocationName: 'Asia Pacific Central Warehouse',
		unitCost: 85,
		sapItemCode: 'SAP-LUB-SYN-5L',
		supplier: 'Lubricants Plus',
		leadTimeDays: 3,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-14T11:00:00Z'
	},
	{
		id: 'SP004',
		code: 'LUBR-002',
		description: 'High Temp Grease 1kg',
		category: 'Lubricants',
		unit: 'kg',
		currentStock: 18,
		minStock: 8,
		maxStock: 30,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL005',
		warehouseLocationName: 'Surabaya Factory Warehouse',
		unitCost: 55,
		sapItemCode: 'SAP-GRS-HT-1K',
		supplier: 'Lubricants Plus',
		leadTimeDays: 3,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-13T15:30:00Z'
	},
	{
		id: 'SP005',
		code: 'BELT-001',
		description: 'V-Belt A-60',
		category: 'Belts',
		unit: 'pcs',
		currentStock: 4,
		minStock: 6,
		maxStock: 15,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL006',
		warehouseLocationName: 'Bangkok Factory Warehouse',
		unitCost: 65,
		sapItemCode: 'SAP-VBELT-A60',
		supplier: 'Power Transmission Ltd',
		leadTimeDays: 10,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-08T10:00:00Z'
	},
	{
		id: 'SP006',
		code: 'BELT-002',
		description: 'Timing Belt HTD-120',
		category: 'Belts',
		unit: 'pcs',
		currentStock: 3,
		minStock: 5,
		maxStock: 12,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL004',
		warehouseLocationName: 'Jakarta Factory Warehouse',
		unitCost: 95,
		sapItemCode: 'SAP-TBELT-120',
		supplier: 'Power Transmission Ltd',
		leadTimeDays: 10,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-09T14:00:00Z'
	},
	{
		id: 'SP007',
		code: 'ELEC-001',
		description: 'Contactor 40A 3-Phase',
		category: 'Electrical',
		unit: 'pcs',
		currentStock: 6,
		minStock: 4,
		maxStock: 12,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL007',
		warehouseLocationName: 'Manila Factory Warehouse',
		unitCost: 145,
		sapItemCode: 'SAP-CONT-40A',
		supplier: 'Electrical Supply Inc',
		leadTimeDays: 7,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-11T09:30:00Z'
	},
	{
		id: 'SP008',
		code: 'ELEC-002',
		description: 'Motor Starter 15HP',
		category: 'Electrical',
		unit: 'pcs',
		currentStock: 2,
		minStock: 2,
		maxStock: 6,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL001',
		warehouseLocationName: 'Asia Pacific Central Warehouse',
		unitCost: 385,
		sapItemCode: 'SAP-MSTR-15HP',
		supplier: 'Electrical Supply Inc',
		leadTimeDays: 14,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-07T16:00:00Z'
	},
	{
		id: 'SP009',
		code: 'ELEC-003',
		description: 'Cable Gland PG21 (Pack of 10)',
		category: 'Electrical',
		unit: 'pack',
		currentStock: 15,
		minStock: 8,
		maxStock: 25,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL008',
		warehouseLocationName: 'Ho Chi Minh Factory Warehouse',
		unitCost: 35,
		sapItemCode: 'SAP-CGLAND-PG21',
		supplier: 'Electrical Supply Inc',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-13T11:00:00Z'
	},
	{
		id: 'SP010',
		code: 'FILT-002',
		description: 'Air Filter Element',
		category: 'Filters',
		unit: 'pcs',
		currentStock: 10,
		minStock: 6,
		maxStock: 20,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL009',
		warehouseLocationName: 'Singapore Factory Warehouse',
		unitCost: 85,
		sapItemCode: 'SAP-AFILT-STD',
		supplier: 'Filter Systems Co',
		leadTimeDays: 7,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-15T10:00:00Z'
	},
	{
		id: 'SP011',
		code: 'FILT-003',
		description: 'HVAC Filter 20x25',
		category: 'Filters',
		unit: 'pcs',
		currentStock: 24,
		minStock: 16,
		maxStock: 40,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL001',
		warehouseLocationName: 'Asia Pacific Central Warehouse',
		unitCost: 35,
		sapItemCode: 'SAP-HVAC-2025',
		supplier: 'Filter Systems Co',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-12T14:00:00Z'
	},
	{
		id: 'SP012',
		code: 'HYDR-001',
		description: 'Hydraulic Oil ISO 46 (20L)',
		category: 'Hydraulics',
		unit: 'drum',
		currentStock: 8,
		minStock: 5,
		maxStock: 15,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL010',
		warehouseLocationName: 'Kuala Lumpur Factory Warehouse',
		unitCost: 195,
		sapItemCode: 'SAP-HOIL-46-20L',
		supplier: 'Hydraulics Pro',
		leadTimeDays: 7,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-10T13:00:00Z'
	},
	{
		id: 'SP013',
		code: 'HYDR-002',
		description: 'Hydraulic Hose 1/2" (per meter)',
		category: 'Hydraulics',
		unit: 'meter',
		currentStock: 45,
		minStock: 20,
		maxStock: 100,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL004',
		warehouseLocationName: 'Jakarta Factory Warehouse',
		unitCost: 25,
		sapItemCode: 'SAP-HHOSE-12',
		supplier: 'Hydraulics Pro',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-14T09:00:00Z'
	},
	{
		id: 'SP014',
		code: 'HYDR-003',
		description: 'Hydraulic Fitting Kit',
		category: 'Hydraulics',
		unit: 'set',
		currentStock: 5,
		minStock: 3,
		maxStock: 10,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL005',
		warehouseLocationName: 'Surabaya Factory Warehouse',
		unitCost: 125,
		sapItemCode: 'SAP-HFIT-KIT',
		supplier: 'Hydraulics Pro',
		leadTimeDays: 7,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-11T11:00:00Z'
	},
	{
		id: 'SP015',
		code: 'BEAR-001',
		description: 'Ball Bearing 6205',
		category: 'Bearings',
		unit: 'pcs',
		currentStock: 20,
		minStock: 12,
		maxStock: 35,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL001',
		warehouseLocationName: 'Asia Pacific Central Warehouse',
		unitCost: 45,
		sapItemCode: 'SAP-BEAR-6205',
		supplier: 'Bearing World',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-15T14:00:00Z'
	},
	{
		id: 'SP016',
		code: 'BEAR-002',
		description: 'Roller Bearing 22210',
		category: 'Bearings',
		unit: 'pcs',
		currentStock: 8,
		minStock: 6,
		maxStock: 18,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL006',
		warehouseLocationName: 'Bangkok Factory Warehouse',
		unitCost: 125,
		sapItemCode: 'SAP-BEAR-22210',
		supplier: 'Bearing World',
		leadTimeDays: 7,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-13T10:00:00Z'
	},
	{
		id: 'SP017',
		code: 'SAFE-001',
		description: 'Safety Gloves (Pair)',
		category: 'Safety',
		unit: 'pair',
		currentStock: 45,
		minStock: 30,
		maxStock: 100,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL001',
		warehouseLocationName: 'Asia Pacific Central Warehouse',
		unitCost: 15,
		sapItemCode: 'SAP-SAFE-GLV',
		supplier: 'Safety First Ltd',
		leadTimeDays: 3,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-14T15:00:00Z'
	},
	{
		id: 'SP018',
		code: 'SAFE-002',
		description: 'Safety Goggles',
		category: 'Safety',
		unit: 'pcs',
		currentStock: 28,
		minStock: 20,
		maxStock: 50,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL007',
		warehouseLocationName: 'Manila Factory Warehouse',
		unitCost: 25,
		sapItemCode: 'SAP-SAFE-GOG',
		supplier: 'Safety First Ltd',
		leadTimeDays: 3,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-12T16:00:00Z'
	},
	{
		id: 'SP019',
		code: 'TOOL-001',
		description: 'Wrench Set (12 piece)',
		category: 'Tools',
		unit: 'set',
		currentStock: 5,
		minStock: 3,
		maxStock: 10,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL008',
		warehouseLocationName: 'Ho Chi Minh Factory Warehouse',
		unitCost: 185,
		sapItemCode: 'SAP-TOOL-WRN12',
		supplier: 'Tool Shop',
		leadTimeDays: 10,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-09T09:00:00Z'
	},
	{
		id: 'SP020',
		code: 'BEAR-003',
		description: 'Spindle Bearing Set',
		category: 'Bearings',
		unit: 'set',
		currentStock: 2,
		minStock: 2,
		maxStock: 6,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL001',
		warehouseLocationName: 'Asia Pacific Central Warehouse',
		unitCost: 850,
		sapItemCode: 'SAP-BEAR-SPIN',
		supplier: 'Bearing World',
		leadTimeDays: 14,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-14T11:00:00Z'
	},
	{
		id: 'SP021',
		code: 'CHEM-001',
		description: 'Industrial Cleaner 5L',
		category: 'Chemicals',
		unit: 'bottle',
		currentStock: 12,
		minStock: 8,
		maxStock: 25,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL009',
		warehouseLocationName: 'Singapore Factory Warehouse',
		unitCost: 45,
		sapItemCode: 'SAP-CLEAN-5L',
		supplier: 'Chemical Supplies',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-13T14:00:00Z'
	},
	{
		id: 'SP022',
		code: 'CHEM-002',
		description: 'Rust Remover 1L',
		category: 'Chemicals',
		unit: 'bottle',
		currentStock: 8,
		minStock: 5,
		maxStock: 15,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL010',
		warehouseLocationName: 'Kuala Lumpur Factory Warehouse',
		unitCost: 35,
		sapItemCode: 'SAP-RUST-1L',
		supplier: 'Chemical Supplies',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-11T13:00:00Z'
	},
	{
		id: 'SP023',
		code: 'FAST-001',
		description: 'Bolt & Nut Assortment',
		category: 'Fasteners',
		unit: 'box',
		currentStock: 10,
		minStock: 6,
		maxStock: 20,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL004',
		warehouseLocationName: 'Jakarta Factory Warehouse',
		unitCost: 65,
		sapItemCode: 'SAP-BOLT-AST',
		supplier: 'Fastener World',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-10T10:00:00Z'
	},
	{
		id: 'SP024',
		code: 'FAST-002',
		description: 'Washer Assortment',
		category: 'Fasteners',
		unit: 'box',
		currentStock: 12,
		minStock: 8,
		maxStock: 20,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL005',
		warehouseLocationName: 'Surabaya Factory Warehouse',
		unitCost: 35,
		sapItemCode: 'SAP-WASH-AST',
		supplier: 'Fastener World',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-12T11:00:00Z'
	},
	{
		id: 'SP025',
		code: 'OIL-001',
		description: 'Engine Oil 15W40 (20L)',
		category: 'Oils',
		unit: 'drum',
		currentStock: 15,
		minStock: 10,
		maxStock: 30,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL001',
		warehouseLocationName: 'Asia Pacific Central Warehouse',
		unitCost: 185,
		sapItemCode: 'SAP-OIL-15W40-20L',
		supplier: 'Lubricants Plus',
		leadTimeDays: 3,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-14T12:00:00Z'
	},
	{
		id: 'SP026',
		code: 'FILT-005',
		description: 'Oil Filter',
		category: 'Filters',
		unit: 'pcs',
		currentStock: 20,
		minStock: 12,
		maxStock: 40,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL006',
		warehouseLocationName: 'Bangkok Factory Warehouse',
		unitCost: 45,
		sapItemCode: 'SAP-OFILT-STD',
		supplier: 'Filter Systems Co',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-13T13:00:00Z'
	},
	{
		id: 'SP027',
		code: 'FILT-006',
		description: 'Air Filter (Vehicle)',
		category: 'Filters',
		unit: 'pcs',
		currentStock: 18,
		minStock: 10,
		maxStock: 30,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL007',
		warehouseLocationName: 'Manila Factory Warehouse',
		unitCost: 65,
		sapItemCode: 'SAP-AFILT-VEH',
		supplier: 'Filter Systems Co',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-12T12:00:00Z'
	},
	{
		id: 'SP028',
		code: 'COOL-001',
		description: 'Coolant Concentrate 5L',
		category: 'Coolants',
		unit: 'bottle',
		currentStock: 10,
		minStock: 8,
		maxStock: 20,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL008',
		warehouseLocationName: 'Ho Chi Minh Factory Warehouse',
		unitCost: 75,
		sapItemCode: 'SAP-COOL-5L',
		supplier: 'Lubricants Plus',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-11T14:00:00Z'
	},
	{
		id: 'SP029',
		code: 'WIPE-001',
		description: 'Industrial Wipes (Roll)',
		category: 'Consumables',
		unit: 'roll',
		currentStock: 35,
		minStock: 20,
		maxStock: 60,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL001',
		warehouseLocationName: 'Asia Pacific Central Warehouse',
		unitCost: 25,
		sapItemCode: 'SAP-WIPE-ROLL',
		supplier: 'Cleaning Supplies',
		leadTimeDays: 3,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-14T10:00:00Z'
	},
	{
		id: 'SP030',
		code: 'WELD-001',
		description: 'Welding Torch Tips (Set)',
		category: 'Welding',
		unit: 'set',
		currentStock: 6,
		minStock: 4,
		maxStock: 12,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL009',
		warehouseLocationName: 'Singapore Factory Warehouse',
		unitCost: 95,
		sapItemCode: 'SAP-WELD-TIP',
		supplier: 'Welding Supply Co',
		leadTimeDays: 7,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-12T15:00:00Z'
	},
	{
		id: 'SP031',
		code: 'BRAKE-001',
		description: 'Brake Pad Set Front',
		category: 'Brakes',
		unit: 'set',
		currentStock: 8,
		minStock: 6,
		maxStock: 18,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL010',
		warehouseLocationName: 'Kuala Lumpur Factory Warehouse',
		unitCost: 250,
		sapItemCode: 'SAP-BRAKE-FRONT',
		supplier: 'Auto Parts Inc',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-14T13:00:00Z'
	},
	{
		id: 'SP032',
		code: 'BRAKE-002',
		description: 'Brake Pad Set Rear',
		category: 'Brakes',
		unit: 'set',
		currentStock: 7,
		minStock: 6,
		maxStock: 18,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL004',
		warehouseLocationName: 'Jakarta Factory Warehouse',
		unitCost: 220,
		sapItemCode: 'SAP-BRAKE-REAR',
		supplier: 'Auto Parts Inc',
		leadTimeDays: 5,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-13T14:00:00Z'
	},
	{
		id: 'SP033',
		code: 'FLUID-001',
		description: 'Brake Fluid DOT 4 (1L)',
		category: 'Fluids',
		unit: 'bottle',
		currentStock: 18,
		minStock: 10,
		maxStock: 30,
		warehouse: 'Main Warehouse',
		warehouseLocationId: 'WHL001',
		warehouseLocationName: 'Asia Pacific Central Warehouse',
		unitCost: 35,
		sapItemCode: 'SAP-FLUID-DOT4',
		supplier: 'Auto Parts Inc',
		leadTimeDays: 3,
		createdAt: '2023-01-15T10:00:00Z',
		updatedAt: '2024-02-14T14:00:00Z'
	}
];

// In-memory inventory movements storage
const initialInventoryMovements: InventoryMovement[] = [
	{
		id: 'IM001',
		partId: 'SP001',
		partCode: 'SEAL-001',
		partName: 'Mechanical Seal 40mm',
		type: 'OUT',
		quantity: 2,
		unitCost: 125,
		totalCost: 250,
		referenceWorkOrderId: 'WO001',
		warehouse: 'Main Warehouse',
		performedBy: 'Mike Johnson',
		notes: 'Used in pump maintenance',
		createdAt: '2024-01-15T14:00:00Z'
	},
	{
		id: 'IM002',
		partId: 'SP015',
		partCode: 'BEAR-001',
		partName: 'Ball Bearing 6205',
		type: 'OUT',
		quantity: 4,
		unitCost: 45,
		totalCost: 180,
		referenceWorkOrderId: 'WO001',
		warehouse: 'Main Warehouse',
		performedBy: 'Mike Johnson',
		notes: 'Used in pump maintenance',
		createdAt: '2024-01-15T14:05:00Z'
	},
	{
		id: 'IM003',
		partId: 'SP010',
		partCode: 'FILT-002',
		partName: 'Air Filter Element',
		type: 'OUT',
		quantity: 1,
		unitCost: 85,
		totalCost: 85,
		referenceWorkOrderId: 'WO002',
		warehouse: 'Main Warehouse',
		performedBy: 'Robert Brown',
		createdAt: '2024-02-15T10:00:00Z'
	},
	{
		id: 'IM004',
		partId: 'SP001',
		partCode: 'SEAL-001',
		partName: 'Mechanical Seal 40mm',
		type: 'IN',
		quantity: 10,
		unitCost: 125,
		totalCost: 1250,
		warehouse: 'Main Warehouse',
		performedBy: 'Warehouse Manager',
		notes: 'Purchase order PO-2024-045',
		createdAt: '2024-02-10T09:00:00Z'
	},
	{
		id: 'IM005',
		partId: 'SP011',
		partCode: 'FILT-003',
		partName: 'HVAC Filter 20x25',
		type: 'OUT',
		quantity: 8,
		unitCost: 35,
		totalCost: 280,
		referenceWorkOrderId: 'WO006',
		warehouse: 'Main Warehouse',
		performedBy: 'Robert Brown',
		createdAt: '2024-02-12T11:00:00Z'
	}
];

// Create writable stores
const sparePartsStore = writable<SparePart[]>(initialSpareParts);
const inventoryMovementsStore = writable<InventoryMovement[]>(initialInventoryMovements);

// Helper functions for spare parts CRUD operations
export const spareParts = {
	subscribe: sparePartsStore.subscribe,

	getAll: (): SparePart[] => {
		let items: SparePart[] = [];
		sparePartsStore.subscribe((value) => (items = value))();
		return items;
	},

	getById: (id: string): SparePart | undefined => {
		let items: SparePart[] = [];
		sparePartsStore.subscribe((value) => (items = value))();
		return items.find((sp) => sp.id === id);
	},

	create: (sparePart: Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'>): SparePart => {
		const newSparePart: SparePart = {
			...sparePart,
			id: `SP${String(Date.now()).slice(-6)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		sparePartsStore.update((items) => [...items, newSparePart]);
		return newSparePart;
	},

	update: (id: string, updates: Partial<SparePart>): SparePart | undefined => {
		let updatedPart: SparePart | undefined;

		sparePartsStore.update((items) => {
			const index = items.findIndex((sp) => sp.id === id);
			if (index !== -1) {
				updatedPart = {
					...items[index],
					...updates,
					updatedAt: new Date().toISOString()
				};
				items[index] = updatedPart;
			}
			return items;
		});

		return updatedPart;
	},

	adjustStock: (id: string, quantity: number, type: 'IN' | 'OUT' | 'ADJUSTMENT'): SparePart | undefined => {
		let updatedPart: SparePart | undefined;

		sparePartsStore.update((items) => {
			const index = items.findIndex((sp) => sp.id === id);
			if (index !== -1) {
				const currentStock = items[index].currentStock;
				const newStock = type === 'OUT' ? currentStock - quantity : currentStock + quantity;

				updatedPart = {
					...items[index],
					currentStock: Math.max(0, newStock),
					updatedAt: new Date().toISOString()
				};
				items[index] = updatedPart;
			}
			return items;
		});

		return updatedPart;
	},

	delete: (id: string): boolean => {
		let deleted = false;

		sparePartsStore.update((items) => {
			const initialLength = items.length;
			const filtered = items.filter((sp) => sp.id !== id);
			deleted = filtered.length < initialLength;
			return filtered;
		});

		return deleted;
	},

	getLowStock: (): SparePart[] => {
		const items = spareParts.getAll();
		return items.filter((sp) => sp.currentStock < sp.minStock);
	},

	filterByCategory: (category: string): SparePart[] => {
		const items = spareParts.getAll();
		return items.filter((sp) => sp.category === category);
	},

	search: (query: string): SparePart[] => {
		const items = spareParts.getAll();
		const lowerQuery = query.toLowerCase();

		return items.filter(
			(sp) =>
				sp.code.toLowerCase().includes(lowerQuery) ||
				sp.description.toLowerCase().includes(lowerQuery) ||
				sp.category.toLowerCase().includes(lowerQuery)
		);
	},

	getCategories: (): string[] => {
		const items = spareParts.getAll();
		return [...new Set(items.map((sp) => sp.category))].sort();
	}
};

// Helper functions for inventory movements
export const inventoryMovements = {
	subscribe: inventoryMovementsStore.subscribe,

	getAll: (): InventoryMovement[] => {
		let items: InventoryMovement[] = [];
		inventoryMovementsStore.subscribe((value) => (items = value))();
		return items;
	},

	getById: (id: string): InventoryMovement | undefined => {
		let items: InventoryMovement[] = [];
		inventoryMovementsStore.subscribe((value) => (items = value))();
		return items.find((im) => im.id === id);
	},

	getByPartId: (partId: string): InventoryMovement[] => {
		const items = inventoryMovements.getAll();
		return items.filter((im) => im.partId === partId);
	},

	getByWorkOrderId: (workOrderId: string): InventoryMovement[] => {
		const items = inventoryMovements.getAll();
		return items.filter((im) => im.referenceWorkOrderId === workOrderId);
	},

	create: (movement: Omit<InventoryMovement, 'id' | 'createdAt'>): InventoryMovement => {
		const newMovement: InventoryMovement = {
			...movement,
			id: `IM${String(Date.now()).slice(-6)}`,
			createdAt: new Date().toISOString()
		};

		inventoryMovementsStore.update((items) => [...items, newMovement]);

		// Update the spare part stock
		if (movement.type === 'OUT') {
			spareParts.adjustStock(movement.partId, movement.quantity, 'OUT');
		} else if (movement.type === 'IN') {
			spareParts.adjustStock(movement.partId, movement.quantity, 'IN');
		} else if (movement.type === 'ADJUSTMENT') {
			// For adjustment, quantity can be positive or negative
			const adjustmentType = movement.quantity >= 0 ? 'IN' : 'OUT';
			spareParts.adjustStock(movement.partId, Math.abs(movement.quantity), adjustmentType);
		}

		return newMovement;
	}
};

// Derived stores
export const lowStockParts = derived(sparePartsStore, ($spareParts) =>
	$spareParts.filter((sp) => sp.currentStock < sp.minStock)
);
