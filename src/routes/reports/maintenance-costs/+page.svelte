<script lang="ts">
	import { Card, Button, Input, Badge } from '$components/ui';
	import { ArrowLeft, Download, Filter, X } from 'lucide-svelte';
	import { formatCurrency, exportToCSV } from '$utils';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showFilters = $state(true);
	let dateFrom = $state(data.filters.dateFrom);
	let dateTo = $state(data.filters.dateTo);
	let selectedCategory = $state<string>('all');

	const categoryOptions = $derived(
		Array.from(new Set(data.data.map((item: any) => item.assetCategory))).sort()
	);

	const filteredData = $derived(
		selectedCategory === 'all'
			? data.data
			: data.data.filter((item: any) => item.assetCategory === selectedCategory)
	);

	function applyFilters() {
		const params = new URLSearchParams();
		if (dateFrom) params.set('dateFrom', dateFrom);
		if (dateTo) params.set('dateTo', dateTo);
		goto(`/reports/maintenance-costs?${params.toString()}`);
	}

	function clearFilters() {
		dateFrom = '';
		dateTo = '';
		goto('/reports/maintenance-costs');
	}

	function exportReport() {
		const csvData = filteredData.map((item: any) => ({
			Period: item.period,
			'Asset Category': item.assetCategory,
			'Work Order Count': item.workOrderCount,
			'Total Cost': item.totalCost,
			'Labor Cost': item.laborCost,
			'Parts Cost': item.partsCost,
			'Avg Cost per WO': item.avgCostPerWorkOrder,
			Completed: item.completedCount,
			Pending: item.pendingCount,
			Overdue: item.overdueCount
		}));

		exportToCSV(
			csvData,
			`maintenance-costs-report-${new Date().toISOString().split('T')[0]}.csv`
		);
		toast.success('Report exported successfully');
	}

	const activeFiltersCount = $derived((dateFrom ? 1 : 0) + (dateTo ? 1 : 0));
</script>

<div class="space-y-6">
	<div>
		<a
			href="/reports"
			class="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
		>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Reports
		</a>
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold text-slate-900">Maintenance Cost Analysis</h1>
				<p class="text-slate-600">
					Review maintenance costs by category, period, and cost breakdown
				</p>
			</div>
			<Button onclick={exportReport}>
				<Download class="mr-2 h-4 w-4" />
				Export CSV
			</Button>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-4">
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Total Work Orders</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">
				{data.summary.additionalMetrics?.totalWorkOrders || 0}
			</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Total Cost</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">
				{formatCurrency(data.summary.totalCost || 0)}
			</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Completed</p>
			<p class="mt-2 text-3xl font-bold text-green-600">
				{data.summary.additionalMetrics?.totalCompleted || 0}
			</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Overdue</p>
			<p class="mt-2 text-3xl font-bold text-red-600">
				{data.summary.additionalMetrics?.totalOverdue || 0}
			</p>
		</Card>
	</div>

	<Card class="p-6">
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<h3 class="text-lg font-semibold text-slate-900">Filters</h3>
				{#if activeFiltersCount > 0}
					<Badge variant="secondary">{activeFiltersCount} active</Badge>
				{/if}
			</div>
			<div class="flex gap-2">
				{#if activeFiltersCount > 0}
					<Button variant="outline" size="sm" onclick={clearFilters}>
						<X class="mr-2 h-4 w-4" />
						Clear Filters
					</Button>
				{/if}
				<Button variant="outline" size="sm" onclick={() => (showFilters = !showFilters)}>
					<Filter class="mr-2 h-4 w-4" />
					{showFilters ? 'Hide' : 'Show'} Filters
				</Button>
			</div>
		</div>

		{#if showFilters}
			<div class="space-y-4">
				<div class="grid gap-4 md:grid-cols-2">
					<div>
						<label class="mb-2 block text-sm font-medium text-slate-700">Date From</label>
						<Input type="date" bind:value={dateFrom} />
					</div>
					<div>
						<label class="mb-2 block text-sm font-medium text-slate-700">Date To</label>
						<Input type="date" bind:value={dateTo} />
					</div>
				</div>
				<Button onclick={applyFilters} class="w-full">Apply Filters</Button>
			</div>
		{/if}
	</Card>

	<Card class="p-6">
		<div class="mb-4">
			<h3 class="text-lg font-semibold text-slate-900">Filter by Category</h3>
		</div>
		<div class="flex flex-wrap gap-2">
			<button type="button" onclick={() => (selectedCategory = 'all')}>
				<Badge
					variant={selectedCategory === 'all' ? 'default' : 'outline'}
					class="cursor-pointer"
				>
					All Categories
				</Badge>
			</button>
			{#each categoryOptions as category (category)}
				<button type="button" onclick={() => (selectedCategory = category as string)}>
					<Badge
						variant={selectedCategory === (category as string) ? 'default' : 'outline'}
						class="cursor-pointer"
					>
						{category}
					</Badge>
				</button>
			{/each}
		</div>
	</Card>

	<Card class="overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b border-slate-200 bg-slate-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Period</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Category</th>
						<th class="px-6 py-3 text-center text-xs font-medium uppercase text-slate-600">WO Count</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">Total Cost</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">Labor</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">Parts</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">Avg/WO</th>
						<th class="px-6 py-3 text-center text-xs font-medium uppercase text-slate-600">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredData as item}
						<tr class="hover:bg-slate-50">
							<td class="px-6 py-4 text-sm font-medium text-slate-900">{item.period}</td>
							<td class="px-6 py-4 text-sm text-slate-900">{item.assetCategory}</td>
							<td class="px-6 py-4 text-center text-sm font-medium text-slate-900">
								{item.workOrderCount}
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium text-slate-900">
								{formatCurrency(item.totalCost)}
							</td>
							<td class="px-6 py-4 text-right text-sm text-slate-600">
								{formatCurrency(item.laborCost)}
							</td>
							<td class="px-6 py-4 text-right text-sm text-slate-600">
								{formatCurrency(item.partsCost)}
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium text-slate-900">
								{formatCurrency(item.avgCostPerWorkOrder)}
							</td>
							<td class="px-6 py-4 text-sm">
								<div class="flex flex-col gap-1 text-center text-xs">
									<div class="text-green-600">{item.completedCount} done</div>
									<div class="text-orange-600">{item.pendingCount} pending</div>
									{#if item.overdueCount > 0}
										<div class="text-red-600">{item.overdueCount} overdue</div>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
				<tfoot class="border-t-2 border-slate-300 bg-slate-50">
					<tr>
						<td colspan="2" class="px-6 py-4 text-sm font-semibold text-slate-900">Totals</td>
						<td class="px-6 py-4 text-center text-sm font-bold text-slate-900">
							{filteredData.reduce((sum: number, item: any) => sum + item.workOrderCount, 0)}
						</td>
						<td class="px-6 py-4 text-right text-sm font-bold text-slate-900">
							{formatCurrency(
								filteredData.reduce((sum: number, item: any) => sum + item.totalCost, 0)
							)}
						</td>
						<td class="px-6 py-4 text-right text-sm font-semibold text-slate-900">
							{formatCurrency(
								filteredData.reduce((sum: number, item: any) => sum + item.laborCost, 0)
							)}
						</td>
						<td class="px-6 py-4 text-right text-sm font-semibold text-slate-900">
							{formatCurrency(
								filteredData.reduce((sum: number, item: any) => sum + item.partsCost, 0)
							)}
						</td>
						<td colspan="2"></td>
					</tr>
				</tfoot>
			</table>
			{#if filteredData.length === 0}
				<div class="py-12 text-center text-slate-500">No data found matching your criteria</div>
			{/if}
		</div>
	</Card>

	<div class="text-center text-sm text-slate-600">
		Showing {filteredData.length} of {data.data.length} records
	</div>
</div>
