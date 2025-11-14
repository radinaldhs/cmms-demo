import { writable } from 'svelte/store';
import type { FleetVehicle } from '$types';

// In-memory fleet vehicle storage
const initialFleetVehicles: FleetVehicle[] = [
	{
		id: 'FLT001',
		assetId: 'AST011',
		plateNumber: 'B 1234 XYZ',
		type: 'Truck',
		brand: 'Isuzu',
		model: 'Giga FRR 90',
		year: 2021,
		odometer: 45230,
		lastKnownLocation: {
			lat: -6.2088,
			lng: 106.8456,
			address: 'Jl. Sudirman No. 123',
			city: 'Jakarta'
		},
		lastGpsTimestamp: '2024-02-14T15:30:00Z',
		status: 'Active',
		fuelType: 'Diesel',
		vinNumber: 'JAAGR56S900123456',
		insuranceExpiry: '2025-03-15',
		registrationExpiry: '2025-06-20'
	},
	{
		id: 'FLT002',
		assetId: 'AST012',
		plateNumber: 'B 5678 ABC',
		type: 'Van',
		brand: 'Toyota',
		model: 'Hiace Commuter',
		year: 2022,
		odometer: 28500,
		lastKnownLocation: {
			lat: -6.1751,
			lng: 106.8650,
			address: 'Jl. Gatot Subroto',
			city: 'Jakarta'
		},
		lastGpsTimestamp: '2024-02-14T14:20:00Z',
		status: 'Available',
		fuelType: 'Diesel',
		vinNumber: 'MRHKH52L0M0456789',
		insuranceExpiry: '2025-08-10',
		registrationExpiry: '2025-09-15'
	},
	{
		id: 'FLT003',
		assetId: 'AST013',
		plateNumber: 'B 9012 DEF',
		type: 'Pickup',
		brand: 'Mitsubishi',
		model: 'Triton HDX',
		year: 2020,
		odometer: 67890,
		lastKnownLocation: {
			lat: -6.3020,
			lng: 106.8977,
			address: 'Kawasan Industri MM2100',
			city: 'Bekasi'
		},
		lastGpsTimestamp: '2024-02-14T16:10:00Z',
		status: 'Active',
		fuelType: 'Diesel',
		vinNumber: 'MMBJNKL40JJ000111',
		insuranceExpiry: '2025-01-20',
		registrationExpiry: '2025-04-10'
	},
	{
		id: 'FLT004',
		assetId: 'AST014',
		plateNumber: 'B 3456 GHI',
		type: 'Truck',
		brand: 'Hino',
		model: 'Ranger FM 260',
		year: 2019,
		odometer: 98340,
		lastKnownLocation: {
			lat: -6.4025,
			lng: 106.8194,
			address: 'Jl. Raya Bogor KM 28',
			city: 'Depok'
		},
		lastGpsTimestamp: '2024-02-14T13:45:00Z',
		status: 'In Workshop',
		fuelType: 'Diesel',
		vinNumber: 'MHHFM2EN0KK123456',
		insuranceExpiry: '2024-12-15',
		registrationExpiry: '2025-02-28'
	},
	{
		id: 'FLT005',
		assetId: 'AST015',
		plateNumber: 'B 7890 JKL',
		type: 'Car',
		brand: 'Toyota',
		model: 'Avanza 1.5G',
		year: 2023,
		odometer: 12450,
		lastKnownLocation: {
			lat: -6.2297,
			lng: 106.6890,
			address: 'Bintaro Jaya',
			city: 'Tangerang Selatan'
		},
		lastGpsTimestamp: '2024-02-14T17:00:00Z',
		status: 'Available',
		fuelType: 'Gasoline',
		vinNumber: 'MHFXW40G000789012',
		insuranceExpiry: '2026-02-10',
		registrationExpiry: '2026-03-15'
	},
	{
		id: 'FLT006',
		assetId: 'AST016',
		plateNumber: 'B 2345 MNO',
		type: 'Truck',
		brand: 'Fuso',
		model: 'Fighter FM 517',
		year: 2021,
		odometer: 54200,
		lastKnownLocation: {
			lat: -6.1615,
			lng: 106.9118,
			address: 'Kawasan Industri Pulogadung',
			city: 'Jakarta'
		},
		lastGpsTimestamp: '2024-02-14T15:55:00Z',
		status: 'Active',
		fuelType: 'Diesel',
		vinNumber: 'JLCFM10F000345678',
		insuranceExpiry: '2025-07-20',
		registrationExpiry: '2025-08-30'
	},
	{
		id: 'FLT007',
		assetId: 'AST017',
		plateNumber: 'B 6789 PQR',
		type: 'Van',
		brand: 'Daihatsu',
		model: 'Gran Max Blind Van',
		year: 2022,
		odometer: 31800,
		lastKnownLocation: {
			lat: -6.1867,
			lng: 106.7785,
			address: 'Kebon Jeruk',
			city: 'Jakarta'
		},
		lastGpsTimestamp: '2024-02-14T14:30:00Z',
		status: 'Available',
		fuelType: 'Gasoline',
		vinNumber: 'MHDS8F11000567890',
		insuranceExpiry: '2025-05-15',
		registrationExpiry: '2025-06-25'
	},
	{
		id: 'FLT008',
		assetId: 'AST018',
		plateNumber: 'B 0123 STU',
		type: 'Pickup',
		brand: 'Isuzu',
		model: 'D-Max 4x4',
		year: 2020,
		odometer: 72100,
		lastKnownLocation: {
			lat: -6.3380,
			lng: 106.7569,
			address: 'Serpong',
			city: 'Tangerang Selatan'
		},
		lastGpsTimestamp: '2024-02-14T16:40:00Z',
		status: 'Active',
		fuelType: 'Diesel',
		vinNumber: 'MPATFS83000901234',
		insuranceExpiry: '2025-04-30',
		registrationExpiry: '2025-05-20'
	}
];

// Create writable store
const fleetStore = writable<FleetVehicle[]>(initialFleetVehicles);

// Helper functions for CRUD operations
export const fleet = {
	subscribe: fleetStore.subscribe,

	getAll: (): FleetVehicle[] => {
		let items: FleetVehicle[] = [];
		fleetStore.subscribe((value) => (items = value))();
		return items;
	},

	getById: (id: string): FleetVehicle | undefined => {
		let items: FleetVehicle[] = [];
		fleetStore.subscribe((value) => (items = value))();
		return items.find((v) => v.id === id);
	},

	getByAssetId: (assetId: string): FleetVehicle | undefined => {
		let items: FleetVehicle[] = [];
		fleetStore.subscribe((value) => (items = value))();
		return items.find((v) => v.assetId === assetId);
	},

	getByPlateNumber: (plateNumber: string): FleetVehicle | undefined => {
		let items: FleetVehicle[] = [];
		fleetStore.subscribe((value) => (items = value))();
		return items.find((v) => v.plateNumber === plateNumber);
	},

	create: (vehicle: Omit<FleetVehicle, 'id'>): FleetVehicle => {
		const newVehicle: FleetVehicle = {
			...vehicle,
			id: `FLT${String(Date.now()).slice(-6)}`
		};

		fleetStore.update((items) => [...items, newVehicle]);
		return newVehicle;
	},

	update: (id: string, updates: Partial<FleetVehicle>): FleetVehicle | undefined => {
		let updatedVehicle: FleetVehicle | undefined;

		fleetStore.update((items) => {
			const index = items.findIndex((v) => v.id === id);
			if (index !== -1) {
				updatedVehicle = {
					...items[index],
					...updates
				};
				items[index] = updatedVehicle;
			}
			return items;
		});

		return updatedVehicle;
	},

	updateOdometer: (id: string, newOdometer: number): FleetVehicle | undefined => {
		return fleet.update(id, { odometer: newOdometer });
	},

	updateLocation: (
		id: string,
		location: FleetVehicle['lastKnownLocation'],
		timestamp?: string
	): FleetVehicle | undefined => {
		return fleet.update(id, {
			lastKnownLocation: location,
			lastGpsTimestamp: timestamp || new Date().toISOString()
		});
	},

	delete: (id: string): boolean => {
		let deleted = false;

		fleetStore.update((items) => {
			const initialLength = items.length;
			const filtered = items.filter((v) => v.id !== id);
			deleted = filtered.length < initialLength;
			return filtered;
		});

		return deleted;
	},

	filterByStatus: (status: string): FleetVehicle[] => {
		const items = fleet.getAll();
		return items.filter((vehicle) => vehicle.status === status);
	},

	filterByType: (type: string): FleetVehicle[] => {
		const items = fleet.getAll();
		return items.filter((vehicle) => vehicle.type === type);
	},

	search: (query: string): FleetVehicle[] => {
		const items = fleet.getAll();
		const lowerQuery = query.toLowerCase();

		return items.filter(
			(vehicle) =>
				vehicle.plateNumber.toLowerCase().includes(lowerQuery) ||
				vehicle.brand.toLowerCase().includes(lowerQuery) ||
				vehicle.model.toLowerCase().includes(lowerQuery) ||
				vehicle.type.toLowerCase().includes(lowerQuery)
		);
	}
};
