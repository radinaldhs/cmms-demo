import { writable } from 'svelte/store';
import type { AssetDocument, AssetDocumentationSummary } from '$types';

// In-memory document storage with demo data
const initialDocuments: AssetDocument[] = [
	// AST001 - Centrifugal Pump A1 - Comprehensive documentation showing deterioration and maintenance
	{
		id: 'DOC001',
		assetId: 'AST001',
		assetName: 'Centrifugal Pump A1',
		title: 'Initial Installation Photo',
		description: 'Photo taken during initial installation - pristine condition',
		type: 'Photo',
		fileUrl: 'https://picsum.photos/seed/pump-new-001/1200/800',
		fileName: 'pump-installation-2020.jpg',
		fileSize: 1245184,
		mimeType: 'image/jpeg',
		uploadedBy: 'John Smith',
		tags: ['installation', 'baseline'],
		assetConditionScore: 10,
		capturedDate: '2020-03-15',
		createdAt: '2020-03-15T10:00:00Z',
		updatedAt: '2020-03-15T10:00:00Z'
	},
	{
		id: 'DOC002',
		assetId: 'AST001',
		assetName: 'Centrifugal Pump A1',
		title: 'First Year Condition Photo',
		description: 'Asset condition after 1 year of operation - minor wear visible',
		type: 'Condition Report',
		fileUrl: 'https://picsum.photos/seed/pump-year1-001/1200/800',
		fileName: 'pump-condition-2021.jpg',
		fileSize: 985632,
		mimeType: 'image/jpeg',
		uploadedBy: 'John Smith',
		tags: ['condition', 'annual-check'],
		assetConditionScore: 8,
		capturedDate: '2021-03-15',
		createdAt: '2021-03-15T14:30:00Z',
		updatedAt: '2021-03-15T14:30:00Z'
	},
	{
		id: 'DOC003',
		assetId: 'AST001',
		assetName: 'Centrifugal Pump A1',
		title: 'Maintenance Record - Bearing Replacement',
		description: 'Bearing replacement performed due to wear. Includes before/after photos and parts list.',
		type: 'Maintenance Record',
		fileUrl: 'https://picsum.photos/seed/pump-maint1-001/1200/800',
		fileName: 'maintenance-bearing-2022.pdf',
		fileSize: 2456789,
		mimeType: 'application/pdf',
		uploadedBy: 'Mike Johnson',
		tags: ['maintenance', 'bearing', 'repair'],
		relatedWorkOrderId: 'WO001',
		assetConditionScore: 9,
		capturedDate: '2022-05-10',
		createdAt: '2022-05-10T11:20:00Z',
		updatedAt: '2022-05-10T11:20:00Z'
	},
	{
		id: 'DOC004',
		assetId: 'AST001',
		assetName: 'Centrifugal Pump A1',
		title: 'Post-Maintenance Condition',
		description: 'Photo after bearing replacement - restored to near-new condition',
		type: 'Photo',
		fileUrl: 'https://picsum.photos/seed/pump-post-maint-001/1200/800',
		fileName: 'pump-post-maintenance-2022.jpg',
		fileSize: 1123456,
		mimeType: 'image/jpeg',
		uploadedBy: 'Mike Johnson',
		tags: ['condition', 'post-maintenance'],
		relatedWorkOrderId: 'WO001',
		assetConditionScore: 9,
		capturedDate: '2022-05-12',
		createdAt: '2022-05-12T09:00:00Z',
		updatedAt: '2022-05-12T09:00:00Z'
	},
	{
		id: 'DOC005',
		assetId: 'AST001',
		assetName: 'Centrifugal Pump A1',
		title: 'Current Condition - 2024',
		description: 'Latest condition assessment showing normal operational wear',
		type: 'Condition Report',
		fileUrl: 'https://picsum.photos/seed/pump-current-001/1200/800',
		fileName: 'pump-condition-2024.jpg',
		fileSize: 1034567,
		mimeType: 'image/jpeg',
		uploadedBy: 'John Smith',
		tags: ['condition', 'current'],
		assetConditionScore: 7,
		capturedDate: '2024-02-10',
		createdAt: '2024-02-10T13:45:00Z',
		updatedAt: '2024-02-10T13:45:00Z'
	},
	{
		id: 'DOC006',
		assetId: 'AST001',
		assetName: 'Centrifugal Pump A1',
		title: 'Operation Manual',
		description: 'Complete operation and maintenance manual for GrundFos CR-150',
		type: 'Manual',
		fileUrl: '/documents/pump-manual.pdf',
		fileName: 'grundfos-cr150-manual.pdf',
		fileSize: 2458624,
		mimeType: 'application/pdf',
		uploadedBy: 'Admin',
		tags: ['manual', 'operation'],
		version: '2.1',
		createdAt: '2020-03-15T10:00:00Z',
		updatedAt: '2020-03-15T10:00:00Z'
	},
	{
		id: 'DOC007',
		assetId: 'AST001',
		assetName: 'Centrifugal Pump A1',
		title: 'Warranty Certificate',
		description: '3-year warranty certificate from manufacturer',
		type: 'Warranty',
		fileUrl: '/documents/pump-warranty.pdf',
		fileName: 'warranty-certificate.pdf',
		fileSize: 524288,
		mimeType: 'application/pdf',
		uploadedBy: 'Admin',
		tags: ['warranty'],
		expiryDate: '2023-03-15',
		createdAt: '2020-03-15T10:30:00Z',
		updatedAt: '2020-03-15T10:30:00Z'
	},
	{
		id: 'DOC008',
		assetId: 'AST001',
		assetName: 'Centrifugal Pump A1',
		title: 'Maintenance Record - Seal Replacement',
		description: 'Routine seal replacement and system flush',
		type: 'Maintenance Record',
		fileUrl: 'https://picsum.photos/seed/pump-maint2-001/1200/800',
		fileName: 'maintenance-seal-2023.pdf',
		fileSize: 1567890,
		mimeType: 'application/pdf',
		uploadedBy: 'John Smith',
		tags: ['maintenance', 'seal', 'preventive'],
		relatedWorkOrderId: 'WO005',
		assetConditionScore: 8,
		capturedDate: '2023-08-15',
		createdAt: '2023-08-15T10:20:00Z',
		updatedAt: '2023-08-15T10:20:00Z'
	},

	// AST002 - Air Compressor - showing declining condition and multiple maintenances
	{
		id: 'DOC009',
		assetId: 'AST002',
		assetName: 'Air Compressor Main',
		title: 'Initial Condition - 2019',
		description: 'Brand new compressor at installation',
		type: 'Photo',
		fileUrl: 'https://picsum.photos/seed/compressor-new-002/1200/800',
		fileName: 'compressor-installation-2019.jpg',
		fileSize: 1356789,
		mimeType: 'image/jpeg',
		uploadedBy: 'Admin',
		tags: ['installation', 'baseline'],
		assetConditionScore: 10,
		capturedDate: '2019-06-20',
		createdAt: '2019-06-20T09:00:00Z',
		updatedAt: '2019-06-20T09:00:00Z'
	},
	{
		id: 'DOC010',
		assetId: 'AST002',
		assetName: 'Air Compressor Main',
		title: 'First Major Maintenance',
		description: 'Oil change and filter replacement at 2000 hours',
		type: 'Maintenance Record',
		fileUrl: 'https://picsum.photos/seed/comp-maint1-002/1200/800',
		fileName: 'maintenance-2020.pdf',
		fileSize: 1789456,
		mimeType: 'application/pdf',
		uploadedBy: 'Mike Johnson',
		tags: ['maintenance', 'oil-change', 'filter'],
		relatedWorkOrderId: 'WO002',
		assetConditionScore: 9,
		capturedDate: '2020-11-10',
		createdAt: '2020-11-10T14:00:00Z',
		updatedAt: '2020-11-10T14:00:00Z'
	},
	{
		id: 'DOC011',
		assetId: 'AST002',
		assetName: 'Air Compressor Main',
		title: 'Condition Assessment 2021',
		description: 'Annual inspection - minor oil leaks detected',
		type: 'Condition Report',
		fileUrl: 'https://picsum.photos/seed/comp-cond1-002/1200/800',
		fileName: 'condition-2021.jpg',
		fileSize: 987654,
		mimeType: 'image/jpeg',
		uploadedBy: 'Mike Johnson',
		tags: ['condition', 'inspection', 'leak'],
		assetConditionScore: 7,
		capturedDate: '2021-06-20',
		createdAt: '2021-06-20T10:30:00Z',
		updatedAt: '2021-06-20T10:30:00Z'
	},
	{
		id: 'DOC012',
		assetId: 'AST002',
		assetName: 'Air Compressor Main',
		title: 'Major Overhaul - 2022',
		description: 'Complete overhaul including valve replacement and seal renewal',
		type: 'Maintenance Record',
		fileUrl: 'https://picsum.photos/seed/comp-overhaul-002/1200/800',
		fileName: 'overhaul-2022.pdf',
		fileSize: 3456789,
		mimeType: 'application/pdf',
		uploadedBy: 'Mike Johnson',
		tags: ['maintenance', 'overhaul', 'major-repair'],
		relatedWorkOrderId: 'WO008',
		assetConditionScore: 9,
		capturedDate: '2022-03-15',
		createdAt: '2022-03-15T16:00:00Z',
		updatedAt: '2022-03-15T16:00:00Z'
	},
	{
		id: 'DOC013',
		assetId: 'AST002',
		assetName: 'Air Compressor Main',
		title: 'Declining Performance - 2023',
		description: 'Evidence of increased vibration and temperature',
		type: 'Condition Report',
		fileUrl: 'https://picsum.photos/seed/comp-decline-002/1200/800',
		fileName: 'condition-decline-2023.jpg',
		fileSize: 1123456,
		mimeType: 'image/jpeg',
		uploadedBy: 'Mike Johnson',
		tags: ['condition', 'vibration', 'temperature'],
		assetConditionScore: 6,
		capturedDate: '2023-09-10',
		createdAt: '2023-09-10T11:45:00Z',
		updatedAt: '2023-09-10T11:45:00Z'
	},
	{
		id: 'DOC014',
		assetId: 'AST002',
		assetName: 'Air Compressor Main',
		title: 'Current State - 2024',
		description: 'Recent photo showing wear on external components and rust formation',
		type: 'Photo',
		fileUrl: 'https://picsum.photos/seed/comp-current-002/1200/800',
		fileName: 'current-condition-2024.jpg',
		fileSize: 1234567,
		mimeType: 'image/jpeg',
		uploadedBy: 'Mike Johnson',
		tags: ['condition', 'current', 'wear'],
		assetConditionScore: 5,
		capturedDate: '2024-02-10',
		createdAt: '2024-02-10T09:30:00Z',
		updatedAt: '2024-02-10T09:30:00Z'
	},
	{
		id: 'DOC015',
		assetId: 'AST002',
		assetName: 'Air Compressor Main',
		title: 'Service Manual',
		description: 'Atlas Copco GA-90 service and maintenance manual',
		type: 'Manual',
		fileUrl: '/documents/compressor-manual.pdf',
		fileName: 'atlas-copco-ga90-service-manual.pdf',
		fileSize: 3145728,
		mimeType: 'application/pdf',
		uploadedBy: 'Admin',
		tags: ['manual', 'service'],
		version: '1.5',
		createdAt: '2019-06-20T09:00:00Z',
		updatedAt: '2019-06-20T09:00:00Z'
	},
	{
		id: 'DOC016',
		assetId: 'AST002',
		assetName: 'Air Compressor Main',
		title: 'Safety Certificate',
		description: 'Annual safety inspection certificate',
		type: 'Certificate',
		fileUrl: '/documents/compressor-safety-cert.pdf',
		fileName: 'safety-certificate-2024.pdf',
		fileSize: 204800,
		mimeType: 'application/pdf',
		uploadedBy: 'Mike Johnson',
		tags: ['certificate', 'safety'],
		expiryDate: '2025-01-15',
		createdAt: '2024-01-15T11:00:00Z',
		updatedAt: '2024-01-15T11:00:00Z'
	},

	// AST007 - Industrial Boiler
	{
		id: 'DOC017',
		assetId: 'AST007',
		assetName: 'Industrial Boiler',
		title: 'Boiler Inspection Report',
		description: 'Latest annual boiler inspection report',
		type: 'Certificate',
		fileUrl: '/documents/boiler-inspection.pdf',
		fileName: 'boiler-inspection-2024.pdf',
		fileSize: 819200,
		mimeType: 'application/pdf',
		uploadedBy: 'David Wilson',
		tags: ['inspection', 'certificate'],
		expiryDate: '2025-02-05',
		createdAt: '2024-02-05T10:00:00Z',
		updatedAt: '2024-02-05T10:00:00Z'
	},

	// AST008 - CNC Machine
	{
		id: 'DOC018',
		assetId: 'AST008',
		assetName: 'CNC Milling Machine',
		title: 'Programming Manual',
		description: 'Haas VF-6/50 programming and operation guide',
		type: 'Manual',
		fileUrl: '/documents/cnc-programming.pdf',
		fileName: 'haas-vf6-programming-manual.pdf',
		fileSize: 4194304,
		mimeType: 'application/pdf',
		uploadedBy: 'Admin',
		tags: ['manual', 'programming'],
		version: '3.0',
		createdAt: '2021-09-15T10:30:00Z',
		updatedAt: '2021-09-15T10:30:00Z'
	},
	{
		id: 'DOC019',
		assetId: 'AST008',
		assetName: 'CNC Milling Machine',
		title: 'Calibration Certificate',
		description: 'Latest calibration certificate',
		type: 'Certificate',
		fileUrl: '/documents/cnc-calibration.pdf',
		fileName: 'calibration-certificate-2024.pdf',
		fileSize: 307200,
		mimeType: 'application/pdf',
		uploadedBy: 'Quality Team',
		tags: ['calibration', 'certificate'],
		expiryDate: '2025-01-30',
		createdAt: '2024-01-30T09:00:00Z',
		updatedAt: '2024-01-30T09:00:00Z'
	}
];

// Create writable store
const documentsStore = writable<AssetDocument[]>(initialDocuments);

// Helper functions for CRUD operations
export const assetDocuments = {
	subscribe: documentsStore.subscribe,

	getAll: (): AssetDocument[] => {
		let items: AssetDocument[] = [];
		documentsStore.subscribe((value) => (items = value))();
		return items;
	},

	getById: (id: string): AssetDocument | undefined => {
		let items: AssetDocument[] = [];
		documentsStore.subscribe((value) => (items = value))();
		return items.find((d) => d.id === id);
	},

	getByAssetId: (assetId: string): AssetDocument[] => {
		let items: AssetDocument[] = [];
		documentsStore.subscribe((value) => (items = value))();
		return items.filter((d) => d.assetId === assetId).sort((a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);
	},

	create: (document: Omit<AssetDocument, 'id' | 'createdAt' | 'updatedAt'>): AssetDocument => {
		const newDocument: AssetDocument = {
			...document,
			id: `DOC${String(Date.now()).slice(-6)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		documentsStore.update((items) => [...items, newDocument]);
		return newDocument;
	},

	update: (id: string, updates: Partial<AssetDocument>): AssetDocument | undefined => {
		let updatedDocument: AssetDocument | undefined;

		documentsStore.update((items) => {
			const index = items.findIndex((d) => d.id === id);
			if (index !== -1) {
				updatedDocument = {
					...items[index],
					...updates,
					updatedAt: new Date().toISOString()
				};
				items[index] = updatedDocument;
			}
			return items;
		});

		return updatedDocument;
	},

	delete: (id: string): boolean => {
		let deleted = false;

		documentsStore.update((items) => {
			const initialLength = items.length;
			const filtered = items.filter((d) => d.id !== id);
			deleted = filtered.length < initialLength;
			return filtered;
		});

		return deleted;
	},

	search: (query: string): AssetDocument[] => {
		const items = assetDocuments.getAll();
		const lowerQuery = query.toLowerCase();

		return items.filter(
			(doc) =>
				doc.title.toLowerCase().includes(lowerQuery) ||
				doc.description?.toLowerCase().includes(lowerQuery) ||
				doc.fileName.toLowerCase().includes(lowerQuery) ||
				doc.assetName?.toLowerCase().includes(lowerQuery)
		);
	},

	filterByType: (type: string): AssetDocument[] => {
		const items = assetDocuments.getAll();
		return items.filter((doc) => doc.type === type);
	},

	// Get documentation summary for an asset with business analytics
	getSummary: (assetId: string): AssetDocumentationSummary | null => {
		const docs = assetDocuments.getByAssetId(assetId);
		if (docs.length === 0) return null;

		const maintenanceRecords = docs.filter((d) => d.type === 'Maintenance Record');
		const photos = docs.filter((d) => d.type === 'Photo' || d.type === 'Condition Report');

		// Calculate document counts by type
		const documentsByType = docs.reduce(
			(acc, doc) => {
				acc[doc.type] = (acc[doc.type] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		// Calculate condition trend based on condition scores over time
		const docsWithScores = docs
			.filter((d) => d.assetConditionScore && d.capturedDate)
			.sort((a, b) => new Date(a.capturedDate!).getTime() - new Date(b.capturedDate!).getTime());

		let conditionTrend: 'improving' | 'stable' | 'declining' = 'stable';
		if (docsWithScores.length >= 2) {
			const firstScore = docsWithScores[0].assetConditionScore!;
			const lastScore = docsWithScores[docsWithScores.length - 1].assetConditionScore!;
			const diff = lastScore - firstScore;

			if (diff >= 1) conditionTrend = 'improving';
			else if (diff <= -1) conditionTrend = 'declining';
		}

		// Calculate average condition score
		const avgConditionScore =
			docsWithScores.length > 0
				? docsWithScores.reduce((sum, doc) => sum + (doc.assetConditionScore || 0), 0) /
					docsWithScores.length
				: undefined;

		const sortedByDate = docs.sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		);

		return {
			assetId,
			totalDocuments: docs.length,
			totalMaintenanceRecords: maintenanceRecords.length,
			totalPhotos: photos.length,
			conditionTrend,
			firstDocumentDate: sortedByDate[0].createdAt,
			lastDocumentDate: sortedByDate[sortedByDate.length - 1].createdAt,
			averageConditionScore: avgConditionScore ? Math.round(avgConditionScore * 10) / 10 : undefined,
			documentsByType: documentsByType as Record<
				'Manual' | 'Certificate' | 'Warranty' | 'Drawing' | 'Photo' | 'Condition Report' | 'Maintenance Record' | 'Other',
				number
			>
		};
	},

	// Get condition timeline (photos/condition reports sorted by date)
	getConditionTimeline: (assetId: string): AssetDocument[] => {
		const docs = assetDocuments.getByAssetId(assetId);
		return docs
			.filter((d) =>
				(d.type === 'Photo' || d.type === 'Condition Report') &&
				d.capturedDate &&
				d.assetConditionScore
			)
			.sort((a, b) => new Date(a.capturedDate!).getTime() - new Date(b.capturedDate!).getTime());
	},

	// Get maintenance timeline
	getMaintenanceTimeline: (assetId: string): AssetDocument[] => {
		const docs = assetDocuments.getByAssetId(assetId);
		return docs
			.filter((d) => d.type === 'Maintenance Record')
			.sort((a, b) => new Date(a.capturedDate || a.createdAt).getTime() - new Date(b.capturedDate || b.createdAt).getTime());
	},

	// Compare first and last condition (for before/after visualization)
	getConditionComparison: (assetId: string): { first: AssetDocument | null; last: AssetDocument | null; scoreDifference: number | null } => {
		const timeline = assetDocuments.getConditionTimeline(assetId);

		if (timeline.length === 0) {
			return { first: null, last: null, scoreDifference: null };
		}

		const first = timeline[0];
		const last = timeline[timeline.length - 1];
		const scoreDifference = (last.assetConditionScore || 0) - (first.assetConditionScore || 0);

		return { first, last, scoreDifference };
	},

	// Get documents expiring soon (certificates, warranties)
	getExpiringDocuments: (daysThreshold: number = 90): AssetDocument[] => {
		const items = assetDocuments.getAll();
		const now = new Date();
		const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

		return items
			.filter((doc) => {
				if (!doc.expiryDate) return false;
				const expiryDate = new Date(doc.expiryDate);
				return expiryDate > now && expiryDate <= thresholdDate;
			})
			.sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
	},

	// Get maintenance frequency for an asset
	getMaintenanceFrequency: (assetId: string): { totalMaintenances: number; averageDaysBetween: number | null } => {
		const maintenances = assetDocuments.getMaintenanceTimeline(assetId);

		if (maintenances.length < 2) {
			return { totalMaintenances: maintenances.length, averageDaysBetween: null };
		}

		const dates = maintenances.map((m) => new Date(m.capturedDate || m.createdAt).getTime());
		const intervals: number[] = [];

		for (let i = 1; i < dates.length; i++) {
			intervals.push(dates[i] - dates[i - 1]);
		}

		const avgMilliseconds = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
		const avgDays = Math.round(avgMilliseconds / (1000 * 60 * 60 * 24));

		return { totalMaintenances: maintenances.length, averageDaysBetween: avgDays };
	}
};
