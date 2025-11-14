import { json } from '@sveltejs/kit';
import { assets } from '$stores';
import type { RequestHandler } from './$types';
import type { Asset, CSVImportResult, CSVImportError } from '$types';

export const POST: RequestHandler = async ({ request }) => {
	const { csvData, action } = await request.json();

	if (!csvData) {
		return json({ error: 'CSV data is required' }, { status: 400 });
	}

	// Parse CSV data
	const lines = csvData.trim().split('\n');

	if (lines.length === 0) {
		return json({ error: 'CSV data is empty' }, { status: 400 });
	}

	// Check if first line is header
	const firstLine = lines[0].toLowerCase();
	const hasHeader =
		firstLine.includes('code') ||
		firstLine.includes('name') ||
		firstLine.includes('category');

	const dataLines = hasHeader ? lines.slice(1) : lines;

	if (dataLines.length === 0) {
		return json({ error: 'No data rows found in CSV' }, { status: 400 });
	}

	// Expected columns: code, name, category, location, purchaseCost, purchaseDate
	const errors: CSVImportError[] = [];
	const validAssets: Asset[] = [];

	for (let i = 0; i < dataLines.length; i++) {
		const line = dataLines[i].trim();
		if (!line) continue;

		const rowNumber = i + (hasHeader ? 2 : 1);
		const columns = line.split(',').map((col: string) => col.trim());

		if (columns.length < 6) {
			errors.push({
				row: rowNumber,
				field: 'all',
				message: `Expected at least 6 columns, got ${columns.length}`
			});
			continue;
		}

		const [code, name, category, location, purchaseCostStr, purchaseDateStr] = columns;

		// Validation
		if (!code) {
			errors.push({ row: rowNumber, field: 'code', message: 'Code is required' });
			continue;
		}

		if (!name) {
			errors.push({ row: rowNumber, field: 'name', message: 'Name is required' });
			continue;
		}

		if (!category) {
			errors.push({ row: rowNumber, field: 'category', message: 'Category is required' });
			continue;
		}

		if (!location) {
			errors.push({ row: rowNumber, field: 'location', message: 'Location is required' });
			continue;
		}

		const purchaseCost = parseFloat(purchaseCostStr);
		if (isNaN(purchaseCost) || purchaseCost < 0) {
			errors.push({
				row: rowNumber,
				field: 'purchaseCost',
				message: 'Invalid purchase cost'
			});
			continue;
		}

		// Validate and parse date (expected format: YYYY-MM-DD)
		const dateMatch = purchaseDateStr.match(/^\d{4}-\d{2}-\d{2}$/);
		if (!dateMatch) {
			errors.push({
				row: rowNumber,
				field: 'purchaseDate',
				message: 'Invalid date format (expected YYYY-MM-DD)'
			});
			continue;
		}

		// If validation passes, create asset object
		const newAsset: Asset = {
			id: `IMP${String(Date.now() + i).slice(-6)}`,
			code,
			name,
			category,
			location,
			status: 'Active',
			purchaseDate: purchaseDateStr,
			purchaseCost,
			usefulLifeYears: 10, // Default
			depreciationMethod: 'STRAIGHT_LINE',
			residualValue: purchaseCost * 0.1, // 10% default
			tags: ['imported'],
			isFleet: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		validAssets.push(newAsset);
	}

	const result: CSVImportResult = {
		success: errors.length === 0,
		imported: validAssets.length,
		failed: errors.length,
		errors: errors
	};

	// If action is 'validate', just return validation results
	if (action === 'validate') {
		return json(result);
	}

	// If action is 'import', actually create the assets
	if (action === 'import' && validAssets.length > 0) {
		for (const asset of validAssets) {
			assets.create(asset);
		}
		result.data = validAssets;
	}

	return json(result);
};
