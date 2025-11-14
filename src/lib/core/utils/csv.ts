/**
 * CSV Export utility functions
 */

/**
 * Convert an array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
	data: T[],
	headers?: string[]
): string {
	if (data.length === 0) return '';

	// Use provided headers or extract from first object
	const columnHeaders = headers || Object.keys(data[0]);

	// Create header row
	const headerRow = columnHeaders.map((h) => escapeCSVValue(h)).join(',');

	// Create data rows
	const dataRows = data.map((row) => {
		return columnHeaders
			.map((header) => {
				const value = row[header];
				return escapeCSVValue(value);
			})
			.join(',');
	});

	return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape a value for CSV format
 */
function escapeCSVValue(value: any): string {
	if (value === null || value === undefined) return '';

	const stringValue = String(value);

	// If value contains comma, newline, or quotes, wrap in quotes and escape quotes
	if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
		return `"${stringValue.replace(/"/g, '""')}"`;
	}

	return stringValue;
}

/**
 * Download CSV file in browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', filename);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * Export data as CSV with automatic download
 */
export function exportToCSV<T extends Record<string, any>>(
	data: T[],
	filename: string,
	headers?: string[]
): void {
	const csv = arrayToCSV(data, headers);
	downloadCSV(csv, filename);
}

/**
 * Parse CSV string to array of objects
 * Simple parser for POC - production should use a library like Papa Parse
 */
export function parseCSV(csvString: string): Record<string, string>[] {
	const lines = csvString.split('\n').filter((line) => line.trim());
	if (lines.length === 0) return [];

	const headers = parseCSVLine(lines[0]);
	const data: Record<string, string>[] = [];

	for (let i = 1; i < lines.length; i++) {
		const values = parseCSVLine(lines[i]);
		if (values.length !== headers.length) continue; // Skip invalid rows

		const row: Record<string, string> = {};
		headers.forEach((header, index) => {
			row[header] = values[index];
		});
		data.push(row);
	}

	return data;
}

/**
 * Parse a single CSV line
 */
function parseCSVLine(line: string): string[] {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		const nextChar = line[i + 1];

		if (char === '"') {
			if (inQuotes && nextChar === '"') {
				// Escaped quote
				current += '"';
				i++; // Skip next quote
			} else {
				// Toggle quote mode
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			// End of field
			result.push(current.trim());
			current = '';
		} else {
			current += char;
		}
	}

	// Add last field
	result.push(current.trim());

	return result;
}

/**
 * Validate CSV data against expected structure
 */
export function validateCSV(
	data: Record<string, string>[],
	requiredFields: string[]
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (data.length === 0) {
		errors.push('CSV file is empty');
		return { valid: false, errors };
	}

	// Check if all required fields are present
	const headers = Object.keys(data[0]);
	const missingFields = requiredFields.filter((field) => !headers.includes(field));

	if (missingFields.length > 0) {
		errors.push(`Missing required fields: ${missingFields.join(', ')}`);
	}

	return {
		valid: errors.length === 0,
		errors
	};
}
