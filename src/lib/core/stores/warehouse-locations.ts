import { writable } from 'svelte/store';
import type { WarehouseLocation } from '$types';

// In-memory warehouse locations storage
const initialWarehouseLocations: WarehouseLocation[] = [
	// Central Warehouses (Regional)
	{
		id: 'WHL001',
		code: 'CEN-ASIA',
		name: 'Asia Pacific Central Warehouse',
		type: 'CENTRAL',
		region: 'Asia Pacific',
		address: '123 Industrial Park, Sector 5',
		city: 'Singapore',
		country: 'Singapore',
		isActive: true,
		capacity: 50000,
		manager: 'David Chen',
		phone: '+65-6123-4567',
		createdAt: '2022-01-15T08:00:00Z',
		updatedAt: '2024-01-10T10:00:00Z'
	},
	{
		id: 'WHL002',
		code: 'CEN-EU',
		name: 'Europe Central Warehouse',
		type: 'CENTRAL',
		region: 'Europe',
		address: '456 Logistics Avenue',
		city: 'Rotterdam',
		country: 'Netherlands',
		isActive: true,
		capacity: 60000,
		manager: 'Hans Mueller',
		phone: '+31-10-234-5678',
		createdAt: '2022-01-20T08:00:00Z',
		updatedAt: '2024-01-12T09:00:00Z'
	},
	{
		id: 'WHL003',
		code: 'CEN-NA',
		name: 'North America Central Warehouse',
		type: 'CENTRAL',
		region: 'North America',
		address: '789 Distribution Center Blvd',
		city: 'Chicago',
		country: 'USA',
		isActive: true,
		capacity: 70000,
		manager: 'Sarah Johnson',
		phone: '+1-312-555-0123',
		createdAt: '2022-02-01T08:00:00Z',
		updatedAt: '2024-01-15T11:00:00Z'
	},
	// Site Warehouses (Factory Locations)
	{
		id: 'WHL004',
		code: 'SITE-JAK-01',
		name: 'Jakarta Factory Warehouse',
		type: 'SITE',
		factory: 'Jakarta Manufacturing Plant',
		address: '45 Jalan Industri Raya',
		city: 'Jakarta',
		country: 'Indonesia',
		isActive: true,
		capacity: 5000,
		manager: 'Budi Santoso',
		phone: '+62-21-1234-5678',
		createdAt: '2022-03-01T08:00:00Z',
		updatedAt: '2024-02-01T10:00:00Z'
	},
	{
		id: 'WHL005',
		code: 'SITE-SBY-01',
		name: 'Surabaya Factory Warehouse',
		type: 'SITE',
		factory: 'Surabaya Production Facility',
		address: '78 Kawasan Industri',
		city: 'Surabaya',
		country: 'Indonesia',
		isActive: true,
		capacity: 4000,
		manager: 'Rina Wijaya',
		phone: '+62-31-7654-3210',
		createdAt: '2022-03-15T08:00:00Z',
		updatedAt: '2024-02-05T09:00:00Z'
	},
	{
		id: 'WHL006',
		code: 'SITE-BKK-01',
		name: 'Bangkok Factory Warehouse',
		type: 'SITE',
		factory: 'Bangkok Assembly Plant',
		address: '123 Industrial Estate Road',
		city: 'Bangkok',
		country: 'Thailand',
		isActive: true,
		capacity: 6000,
		manager: 'Somchai Prasert',
		phone: '+66-2-123-4567',
		createdAt: '2022-04-01T08:00:00Z',
		updatedAt: '2024-02-08T10:00:00Z'
	},
	{
		id: 'WHL007',
		code: 'SITE-MNL-01',
		name: 'Manila Factory Warehouse',
		type: 'SITE',
		factory: 'Manila Production Center',
		address: '567 Industrial Zone',
		city: 'Manila',
		country: 'Philippines',
		isActive: true,
		capacity: 3500,
		manager: 'Maria Santos',
		phone: '+63-2-8765-4321',
		createdAt: '2022-04-15T08:00:00Z',
		updatedAt: '2024-02-10T11:00:00Z'
	},
	{
		id: 'WHL008',
		code: 'SITE-HCM-01',
		name: 'Ho Chi Minh Factory Warehouse',
		type: 'SITE',
		factory: 'Ho Chi Minh Manufacturing Hub',
		address: '234 Khu Cong Nghiep',
		city: 'Ho Chi Minh City',
		country: 'Vietnam',
		isActive: true,
		capacity: 4500,
		manager: 'Nguyen Van Minh',
		phone: '+84-28-9876-5432',
		createdAt: '2022-05-01T08:00:00Z',
		updatedAt: '2024-02-12T09:00:00Z'
	},
	{
		id: 'WHL009',
		code: 'SITE-SIN-01',
		name: 'Singapore Factory Warehouse',
		type: 'SITE',
		factory: 'Singapore Advanced Manufacturing',
		address: '890 Tuas South Avenue',
		city: 'Singapore',
		country: 'Singapore',
		isActive: true,
		capacity: 3000,
		manager: 'Tan Wei Ming',
		phone: '+65-6789-0123',
		createdAt: '2022-05-15T08:00:00Z',
		updatedAt: '2024-02-14T10:00:00Z'
	},
	{
		id: 'WHL010',
		code: 'SITE-KL-01',
		name: 'Kuala Lumpur Factory Warehouse',
		type: 'SITE',
		factory: 'Kuala Lumpur Production Plant',
		address: '456 Kawasan Perindustrian',
		city: 'Kuala Lumpur',
		country: 'Malaysia',
		isActive: true,
		capacity: 3800,
		manager: 'Ahmad Hassan',
		phone: '+60-3-1234-5678',
		createdAt: '2022-06-01T08:00:00Z',
		updatedAt: '2024-02-15T11:00:00Z'
	}
];

// Create writable store
const warehouseLocationsStore = writable<WarehouseLocation[]>(initialWarehouseLocations);

// Helper functions for warehouse locations CRUD operations
export const warehouseLocations = {
	subscribe: warehouseLocationsStore.subscribe,

	getAll: (): WarehouseLocation[] => {
		let items: WarehouseLocation[] = [];
		warehouseLocationsStore.subscribe((value) => (items = value))();
		return items;
	},

	getById: (id: string): WarehouseLocation | undefined => {
		let items: WarehouseLocation[] = [];
		warehouseLocationsStore.subscribe((value) => (items = value))();
		return items.find((whl) => whl.id === id);
	},

	getByType: (type: 'CENTRAL' | 'SITE'): WarehouseLocation[] => {
		const items = warehouseLocations.getAll();
		return items.filter((whl) => whl.type === type && whl.isActive);
	},

	getCentralWarehouses: (): WarehouseLocation[] => {
		return warehouseLocations.getByType('CENTRAL');
	},

	getSiteWarehouses: (): WarehouseLocation[] => {
		return warehouseLocations.getByType('SITE');
	},

	getByRegion: (region: string): WarehouseLocation[] => {
		const items = warehouseLocations.getAll();
		return items.filter((whl) => whl.type === 'CENTRAL' && whl.region === region && whl.isActive);
	},

	getByFactory: (factory: string): WarehouseLocation[] => {
		const items = warehouseLocations.getAll();
		return items.filter((whl) => whl.type === 'SITE' && whl.factory === factory && whl.isActive);
	},

	getActive: (): WarehouseLocation[] => {
		const items = warehouseLocations.getAll();
		return items.filter((whl) => whl.isActive);
	},

	create: (
		location: Omit<WarehouseLocation, 'id' | 'createdAt' | 'updatedAt'>
	): WarehouseLocation => {
		const newLocation: WarehouseLocation = {
			...location,
			id: `WHL${String(Date.now()).slice(-6)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		warehouseLocationsStore.update((items) => [...items, newLocation]);
		return newLocation;
	},

	update: (id: string, updates: Partial<WarehouseLocation>): WarehouseLocation | undefined => {
		let updatedLocation: WarehouseLocation | undefined;

		warehouseLocationsStore.update((items) => {
			const index = items.findIndex((whl) => whl.id === id);
			if (index !== -1) {
				updatedLocation = {
					...items[index],
					...updates,
					updatedAt: new Date().toISOString()
				};
				items[index] = updatedLocation;
			}
			return items;
		});

		return updatedLocation;
	},

	delete: (id: string): boolean => {
		let deleted = false;

		warehouseLocationsStore.update((items) => {
			const initialLength = items.length;
			const filtered = items.filter((whl) => whl.id !== id);
			deleted = filtered.length < initialLength;
			return filtered;
		});

		return deleted;
	},

	getRegions: (): string[] => {
		const items = warehouseLocations.getCentralWarehouses();
		return [...new Set(items.map((whl) => whl.region).filter((r): r is string => !!r))].sort();
	},

	getFactories: (): string[] => {
		const items = warehouseLocations.getSiteWarehouses();
		return [...new Set(items.map((whl) => whl.factory).filter((f): f is string => !!f))].sort();
	}
};
