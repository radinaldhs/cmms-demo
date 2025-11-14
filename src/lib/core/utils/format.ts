import { format, formatDistance, formatRelative, parseISO, differenceInDays } from 'date-fns';

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
	try {
		const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
		return format(date, formatStr);
	} catch (error) {
		return 'Invalid date';
	}
}

/**
 * Format a date string to include time
 */
export function formatDateTime(
	dateString: string | Date,
	formatStr: string = 'MMM dd, yyyy HH:mm'
): string {
	try {
		const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
		return format(date, formatStr);
	} catch (error) {
		return 'Invalid date';
	}
}

/**
 * Format date relative to now (e.g., "2 days ago")
 */
export function formatRelativeDate(dateString: string | Date): string {
	try {
		const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
		return formatDistance(date, new Date(), { addSuffix: true });
	} catch (error) {
		return 'Invalid date';
	}
}

/**
 * Format date as relative (e.g., "yesterday at 3:15 PM")
 */
export function formatRelativeFull(dateString: string | Date): string {
	try {
		const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
		return formatRelative(date, new Date());
	} catch (error) {
		return 'Invalid date';
	}
}

/**
 * Calculate days between two dates
 */
export function daysBetween(dateString1: string | Date, dateString2: string | Date): number {
	try {
		const date1 = typeof dateString1 === 'string' ? parseISO(dateString1) : dateString1;
		const date2 = typeof dateString2 === 'string' ? parseISO(dateString2) : dateString2;
		return differenceInDays(date2, date1);
	} catch (error) {
		return 0;
	}
}

/**
 * Check if a date is overdue
 */
export function isOverdue(dateString: string | Date): boolean {
	try {
		const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
		return date < new Date();
	} catch (error) {
		return false;
	}
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: currency
	}).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number, decimals: number = 0): string {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(num);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
	return `${formatNumber(value, decimals)}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
