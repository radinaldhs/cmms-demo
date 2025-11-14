<script lang="ts">
	import { Card, Button, Input, Badge } from '$components/ui';
	import { ArrowLeft, Download, Filter, Search, X } from 'lucide-svelte';
	import { formatCurrency, formatDate, exportToCSV } from '$utils';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showFilters = $state(true);
	let searchQuery = $state('');

	let dateFrom = $state(data.filters.dateFrom);
	let dateTo = $state(data.filters.dateTo);
	let selectedCategories = $state<string[]>(data.filters.categories);

	const categoryOptions = $derived(
		Array.from(new Set(data.data.map((item: any) => item.category))).sort()
	);

	const filteredData = $derived(
		data.data.filter((item: any) => {
			if (!searchQuery) return true;
			const query = searchQuery.toLowerCase();
			return (
				item.assetCode.toLowerCase().includes(query) ||
				item.assetName.toLowerCase().includes(query) ||
				item.category.toLowerCase().includes(query) ||
				item.location.toLowerCase().includes(query)
			);
		})
	);

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Active: 'success',
			Maintenance: 'warning',
			Inactive: 'secondary',
			Retired: 'destructive'
		};
		return variants[status] || 'default';
	}

	function toggleCategory(category: string) {
		if (selectedCategories.includes(category)) {
			selectedCategories = selectedCategories.filter((c) => c !== category);
		} else {
			selectedCategories = [...selectedCategories, category];
		}
	}

	function applyFilters() {
		const params = new URLSearchParams();
		if (dateFrom) params.set('dateFrom', dateFrom);
		if (dateTo) params.set('dateTo', dateTo);
		if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
		goto(`/reports/assets?${params.toString()}`);
	}

	function clearFilters() {
		dateFrom = '';
		dateTo = '';
		selectedCategories = [];
		goto('/reports/assets');
	}

	function exportReport() {
		const csvData = filteredData.map((asset: any) => ({
			'Asset ID': asset.assetId,
			'Asset Code': asset.assetCode,
			'Asset Name': asset.assetName,
			Category: asset.category,
			Location: asset.location,
			Status: asset.status,
			'Purchase Date': asset.purchaseDate,
			'Purchase Cost': asset.purchaseCost,
			'Book Value': asset.bookValue,
			'Accumulated Depreciation': asset.accumulatedDepreciation,
			'Maintenance Count': asset.maintenanceCount,
			'Total Maintenance Cost': asset.maintenanceCostTotal,
			'YTD Maintenance Cost': asset.maintenanceCostYTD,
			'Avg Maintenance Cost': asset.avgMaintenanceCost,
			'Utilization Rate': `${(asset.utilizationRate * 100).toFixed(1)}%`,
			'Last Maintenance': asset.lastMaintenanceDate || 'N/A'
		}));

		exportToCSV(csvData, `asset-performance-report-${new Date().toISOString().split('T')[0]}.csv`);
		toast.success('Report exported successfully');
	}

	const activeFiltersCount = $derived(
		(dateFrom ? 1 : 0) + (dateTo ? 1 : 0) + selectedCategories.length
	);
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
				<h1 class="text-3xl font-bold text-slate-900">Asset Performance Report</h1>
				<p class="text-slate-600">
					Track asset depreciation, maintenance costs, and utilization rates
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
			<p class="text-sm font-medium text-slate-600">Total Assets</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">{data.summary.totalRecords}</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Total Book Value</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">
				{formatCurrency(filteredData.reduce((sum: number, a: any) => sum + a.bookValue, 0))}
			</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Total Maintenance Cost</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">
				{formatCurrency(data.summary.totalCost || 0)}
			</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Avg Utilization</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">
				{(
					(filteredData.reduce((sum: number, a: any) => sum + a.utilizationRate, 0) /
						filteredData.length) *
					100
				).toFixed(1)}%
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
						<label class="mb-2 block text-sm font-medium text-slate-700">Purchase Date From</label>
						<Input type="date" bind:value={dateFrom} />
					</div>
					<div>
						<label class="mb-2 block text-sm font-medium text-slate-700">Purchase Date To</label>
						<Input type="date" bind:value={dateTo} />
					</div>
				</div>

				<div>
					<label class="mb-2 block text-sm font-medium text-slate-700">Category</label>
					<div class="flex flex-wrap gap-2">
						{#each categoryOptions as category (category)}
							<button type="button" onclick={() => toggleCategory(category as string)}>
								<Badge
									variant={selectedCategories.includes(category as string) ? 'default' : 'outline'}
									class="cursor-pointer"
								>
									{category}
								</Badge>
							</button>
						{/each}
					</div>
				</div>

				<Button onclick={applyFilters} class="w-full">Apply Filters</Button>
			</div>
		{/if}
	</Card>

	<Card class="p-4">
		<div class="relative">
			<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
			<Input
				type="text"
				placeholder="Search by code, name, category, or location..."
				bind:value={searchQuery}
				class="pl-10"
			/>
		</div>
	</Card>

	<Card class="overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b border-slate-200 bg-slate-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Code</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Name</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Category</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Status</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">Book Value</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">Maint. Cost</th>
						<th class="px-6 py-3 text-center text-xs font-medium uppercase text-slate-600">Maint. Count</th>
						<th class="px-6 py-3 text-center text-xs font-medium uppercase text-slate-600">Utilization</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredData as asset}
						<tr class="hover:bg-slate-50">
							<td class="px-6 py-4 text-sm font-medium text-slate-900">{asset.assetCode}</td>
							<td class="px-6 py-4 text-sm text-slate-900">
								<a href="/assets/{asset.assetId}" class="font-medium text-blue-600 hover:underline">
									{asset.assetName}
								</a>
								<div class="text-xs text-slate-500">{asset.location}</div>
							</td>
							<td class="px-6 py-4 text-sm text-slate-600">{asset.category}</td>
							<td class="px-6 py-4 text-sm">
								<Badge variant={getStatusVariant(asset.status)}>{asset.status}</Badge>
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium text-slate-900">
								{formatCurrency(asset.bookValue)}
								<div class="text-xs text-slate-500">
									Deprec: {formatCurrency(asset.accumulatedDepreciation)}
								</div>
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium text-slate-900">
								{formatCurrency(asset.maintenanceCostTotal)}
								<div class="text-xs text-slate-500">
									YTD: {formatCurrency(asset.maintenanceCostYTD)}
								</div>
							</td>
							<td class="px-6 py-4 text-center text-sm text-slate-600">
								{asset.maintenanceCount}
								<div class="text-xs text-slate-500">
									Avg: {formatCurrency(asset.avgMaintenanceCost)}
								</div>
							</td>
							<td class="px-6 py-4 text-center text-sm font-medium text-slate-900">
								{(asset.utilizationRate * 100).toFixed(1)}%
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if filteredData.length === 0}
				<div class="py-12 text-center text-slate-500">
					No assets found matching your criteria
				</div>
			{/if}
		</div>
	</Card>

	<div class="text-center text-sm text-slate-600">
		Showing {filteredData.length} of {data.data.length} assets
	</div>
</div>
