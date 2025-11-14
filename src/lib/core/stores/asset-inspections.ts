import { writable } from 'svelte/store';
import type { AssetInspection } from '$types';

// In-memory inspection storage with demo data
const initialInspections: AssetInspection[] = [
	{
		id: 'INSP001',
		assetId: 'AST001',
		assetName: 'Centrifugal Pump A1',
		inspectionDate: '2024-01-15',
		inspectedBy: 'John Smith',
		status: 'Passed',
		checklistItems: [
			{ id: 'CHK001', item: 'Visual inspection for leaks', status: 'OK' },
			{ id: 'CHK002', item: 'Check pressure gauge readings', status: 'OK' },
			{ id: 'CHK003', item: 'Inspect motor bearings', status: 'OK' },
			{ id: 'CHK004', item: 'Verify alignment', status: 'OK' }
		],
		photos: [
			{
				id: 'PHT001',
				url: 'https://picsum.photos/seed/pump1/800/600',
				caption: 'Overall condition',
				uploadedAt: '2024-01-15T10:30:00Z'
			},
			{
				id: 'PHT002',
				url: 'https://picsum.photos/seed/pump2/800/600',
				caption: 'Pressure gauge reading',
				uploadedAt: '2024-01-15T10:35:00Z'
			}
		],
		findings: 'Asset is in good working condition. All systems operating within normal parameters.',
		recommendations: 'Continue regular maintenance schedule.',
		nextInspectionDate: '2024-04-15',
		createdAt: '2024-01-15T10:00:00Z',
		updatedAt: '2024-01-15T11:00:00Z'
	},
	{
		id: 'INSP002',
		assetId: 'AST002',
		assetName: 'Air Compressor Main',
		inspectionDate: '2024-02-10',
		inspectedBy: 'Mike Johnson',
		status: 'Needs Attention',
		checklistItems: [
			{ id: 'CHK005', item: 'Check air filter condition', status: 'Not OK', notes: 'Filter needs replacement' },
			{ id: 'CHK006', item: 'Inspect oil level', status: 'OK' },
			{ id: 'CHK007', item: 'Check belt tension', status: 'OK' },
			{ id: 'CHK008', item: 'Verify safety valve operation', status: 'OK' }
		],
		photos: [
			{
				id: 'PHT003',
				url: 'https://picsum.photos/seed/comp1/800/600',
				caption: 'Dirty air filter',
				uploadedAt: '2024-02-10T09:15:00Z'
			}
		],
		findings: 'Air filter is clogged and requires immediate replacement. Other components in good condition.',
		recommendations: 'Replace air filter within 7 days. Schedule next inspection in 3 months.',
		nextInspectionDate: '2024-05-10',
		createdAt: '2024-02-10T09:00:00Z',
		updatedAt: '2024-02-10T10:00:00Z'
	},
	{
		id: 'INSP003',
		assetId: 'AST007',
		assetName: 'Industrial Boiler',
		inspectionDate: '2024-02-05',
		inspectedBy: 'David Wilson',
		status: 'Failed',
		checklistItems: [
			{ id: 'CHK009', item: 'Check pressure relief valve', status: 'Not OK', notes: 'Valve stuck' },
			{ id: 'CHK010', item: 'Inspect burner condition', status: 'OK' },
			{ id: 'CHK011', item: 'Check water level controls', status: 'Not OK', notes: 'Sensor malfunction' },
			{ id: 'CHK012', item: 'Verify safety interlocks', status: 'OK' }
		],
		photos: [
			{
				id: 'PHT004',
				url: 'https://picsum.photos/seed/boiler1/800/600',
				caption: 'Pressure relief valve',
				uploadedAt: '2024-02-05T08:30:00Z'
			},
			{
				id: 'PHT005',
				url: 'https://picsum.photos/seed/boiler2/800/600',
				caption: 'Water level sensor',
				uploadedAt: '2024-02-05T08:45:00Z'
			}
		],
		findings: 'Critical issues found: pressure relief valve is stuck and water level sensor is malfunctioning. Asset taken offline for repairs.',
		recommendations: 'Immediate repair required. Do not operate until repairs are completed and verified.',
		nextInspectionDate: '2024-02-20',
		createdAt: '2024-02-05T08:00:00Z',
		updatedAt: '2024-02-05T09:30:00Z'
	}
];

// Create writable store
const inspectionsStore = writable<AssetInspection[]>(initialInspections);

// Helper functions for CRUD operations
export const assetInspections = {
	subscribe: inspectionsStore.subscribe,

	getAll: (): AssetInspection[] => {
		let items: AssetInspection[] = [];
		inspectionsStore.subscribe((value) => (items = value))();
		return items;
	},

	getById: (id: string): AssetInspection | undefined => {
		let items: AssetInspection[] = [];
		inspectionsStore.subscribe((value) => (items = value))();
		return items.find((i) => i.id === id);
	},

	getByAssetId: (assetId: string): AssetInspection[] => {
		let items: AssetInspection[] = [];
		inspectionsStore.subscribe((value) => (items = value))();
		return items.filter((i) => i.assetId === assetId).sort((a, b) =>
			new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()
		);
	},

	create: (inspection: Omit<AssetInspection, 'id' | 'createdAt' | 'updatedAt'>): AssetInspection => {
		const newInspection: AssetInspection = {
			...inspection,
			id: `INSP${String(Date.now()).slice(-6)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		inspectionsStore.update((items) => [...items, newInspection]);
		return newInspection;
	},

	update: (id: string, updates: Partial<AssetInspection>): AssetInspection | undefined => {
		let updatedInspection: AssetInspection | undefined;

		inspectionsStore.update((items) => {
			const index = items.findIndex((i) => i.id === id);
			if (index !== -1) {
				updatedInspection = {
					...items[index],
					...updates,
					updatedAt: new Date().toISOString()
				};
				items[index] = updatedInspection;
			}
			return items;
		});

		return updatedInspection;
	},

	delete: (id: string): boolean => {
		let deleted = false;

		inspectionsStore.update((items) => {
			const initialLength = items.length;
			const filtered = items.filter((i) => i.id !== id);
			deleted = filtered.length < initialLength;
			return filtered;
		});

		return deleted;
	},

	search: (query: string): AssetInspection[] => {
		const items = assetInspections.getAll();
		const lowerQuery = query.toLowerCase();

		return items.filter(
			(inspection) =>
				inspection.assetName?.toLowerCase().includes(lowerQuery) ||
				inspection.inspectedBy.toLowerCase().includes(lowerQuery) ||
				inspection.findings.toLowerCase().includes(lowerQuery)
		);
	}
};
