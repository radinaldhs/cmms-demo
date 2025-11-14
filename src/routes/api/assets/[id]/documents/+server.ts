import { json } from '@sveltejs/kit';
import { assetDocuments } from '$stores';
import type { RequestHandler } from './$types';

// GET - Fetch all documents for an asset
export const GET: RequestHandler = async ({ params, url }) => {
	const type = url.searchParams.get('type');
	const summary = url.searchParams.get('summary');
	const timeline = url.searchParams.get('timeline');
	const comparison = url.searchParams.get('comparison');
	const frequency = url.searchParams.get('frequency');

	// Return documentation summary with analytics
	if (summary === 'true') {
		const summaryData = assetDocuments.getSummary(params.id);
		return json(summaryData);
	}

	// Return condition timeline
	if (timeline === 'condition') {
		const timelineData = assetDocuments.getConditionTimeline(params.id);
		return json(timelineData);
	}

	// Return maintenance timeline
	if (timeline === 'maintenance') {
		const timelineData = assetDocuments.getMaintenanceTimeline(params.id);
		return json(timelineData);
	}

	// Return before/after comparison
	if (comparison === 'true') {
		const comparisonData = assetDocuments.getConditionComparison(params.id);
		return json(comparisonData);
	}

	// Return maintenance frequency
	if (frequency === 'true') {
		const frequencyData = assetDocuments.getMaintenanceFrequency(params.id);
		return json(frequencyData);
	}

	// Filter by document type if specified
	let documents = assetDocuments.getByAssetId(params.id);
	if (type) {
		documents = documents.filter((d) => d.type === type);
	}

	return json(documents);
};

// POST - Create new document
export const POST: RequestHandler = async ({ request, params }) => {
	const data = await request.json();
	const document = assetDocuments.create({
		...data,
		assetId: params.id
	});
	return json(document, { status: 201 });
};

// PUT - Update document
export const PUT: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const document = assetDocuments.update(data.id, data);

	if (!document) {
		return json({ error: 'Document not found' }, { status: 404 });
	}

	return json(document);
};

// DELETE - Delete document
export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) {
		return json({ error: 'Document ID required' }, { status: 400 });
	}

	const deleted = assetDocuments.delete(id);
	if (!deleted) {
		return json({ error: 'Document not found' }, { status: 404 });
	}

	return json({ success: true });
};
