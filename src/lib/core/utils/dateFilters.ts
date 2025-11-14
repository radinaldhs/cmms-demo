import type { DateFilterOption } from '$lib/components/ui/DateRangeFilter.svelte';

export function filterByDateRange(
	dateStr: string,
	filter: DateFilterOption,
	customFrom?: string,
	customTo?: string
): boolean {
	if (filter === 'all_time') return true;

	const itemDate = new Date(dateStr);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	switch (filter) {
		case 'today':
			return itemDate >= today;
		case 'yesterday': {
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			return itemDate >= yesterday && itemDate < today;
		}
		case 'last_7_days': {
			const weekAgo = new Date(today);
			weekAgo.setDate(weekAgo.getDate() - 7);
			return itemDate >= weekAgo;
		}
		case 'last_30_days': {
			const monthAgo = new Date(today);
			monthAgo.setDate(monthAgo.getDate() - 30);
			return itemDate >= monthAgo;
		}
		case 'last_month': {
			const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
			const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
			return itemDate >= lastMonthStart && itemDate <= lastMonthEnd;
		}
		case 'last_3_months': {
			const threeMonthsAgo = new Date(today);
			threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
			return itemDate >= threeMonthsAgo;
		}
		case 'last_6_months': {
			const sixMonthsAgo = new Date(today);
			sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
			return itemDate >= sixMonthsAgo;
		}
		case 'ytd': {
			const yearStart = new Date(now.getFullYear(), 0, 1);
			return itemDate >= yearStart;
		}
		case 'custom_range': {
			if (!customFrom || !customTo) return true;
			const fromDate = new Date(customFrom);
			const toDate = new Date(customTo);
			return itemDate >= fromDate && itemDate <= toDate;
		}
		default:
			return true;
	}
}
