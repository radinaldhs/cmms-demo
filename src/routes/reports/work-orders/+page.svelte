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

	// Filter states
	let dateFrom = $state(data.filters.dateFrom);
	let dateTo = $state(data.filters.dateTo);
	let selectedStatuses = $state<string[]>(data.filters.statuses);
	let selectedPriorities = $state<string[]>(data.filters.priorities);
	let selectedCategories = $state<string[]>(data.filters.categories);

	const statusOptions = ['Planned', 'In Progress', 'Completed', 'Overdue', 'Cancelled'];
	const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

	// Get unique categories from data
	const categoryOptions = $derived(
		Array.from(new Set(data.data.map((item: any) => item.assetCategory))).sort()
	);

	// Filter data based on search
	const filteredData = $derived(
		data.data.filter((item: any) => {
			if (!searchQuery) return true;
			const query = searchQuery.toLowerCase();
			return (
				item.title.toLowerCase().includes(query) ||
				item.id.toLowerCase().includes(query) ||
				item.assetName.toLowerCase().includes(query) ||
				item.assetCategory.toLowerCase().includes(query) ||
				item.assignedTo.toLowerCase().includes(query)
			);
		})
	);

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Completed: 'success',
			'In Progress': 'warning',
			Planned: 'default',
			Overdue: 'destructive',
			Cancelled: 'secondary'
		};
		return variants[status] || 'default';
	}

	function getPriorityVariant(priority: string) {
		const variants: Record<string, any> = {
			Critical: 'destructive',
			High: 'warning',
			Medium: 'default',
			Low: 'secondary'
		};
		return variants[priority] || 'default';
	}

	function toggleStatus(status: string) {
		if (selectedStatuses.includes(status)) {
			selectedStatuses = selectedStatuses.filter((s) => s !== status);
		} else {
			selectedStatuses = [...selectedStatuses, status];
		}
	}

	function togglePriority(priority: string) {
		if (selectedPriorities.includes(priority)) {
			selectedPriorities = selectedPriorities.filter((p) => p !== priority);
		} else {
			selectedPriorities = [...selectedPriorities, priority];
		}
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
		if (selectedStatuses.length > 0) params.set('statuses', selectedStatuses.join(','));
		if (selectedPriorities.length > 0) params.set('priorities', selectedPriorities.join(','));
		if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));

		goto(`/reports/work-orders?${params.toString()}`);
	}

	function clearFilters() {
		dateFrom = '';
		dateTo = '';
		selectedStatuses = [];
		selectedPriorities = [];
		selectedCategories = [];
		goto('/reports/work-orders');
	}

	function exportReport() {
		const csvData = filteredData.map((wo: any) => ({
			'Work Order ID': wo.id,
			Title: wo.title,
			'Asset Name': wo.assetName,
			'Asset Category': wo.assetCategory,
			Status: wo.status,
			Priority: wo.priority,
			'Assigned To': wo.assignedTo,
			'Scheduled Date': wo.scheduledDate,
			'Due Date': wo.dueDate,
			'Completed Date': wo.completedDate || '',
			'Total Cost': wo.cost,
			'Labor Hours': wo.laborHours,
			'Parts Count': wo.partsCount,
			'Parts Cost': wo.partsCost,
			'Days to Complete': wo.daysToComplete || ''
		}));

		exportToCSV(csvData, `work-orders-report-${new Date().toISOString().split('T')[0]}.csv`);
		toast.success('Report exported successfully');
	}

	const activeFiltersCount = $derived(
		(dateFrom ? 1 : 0) +
			(dateTo ? 1 : 0) +
			selectedStatuses.length +
			selectedPriorities.length +
			selectedCategories.length
	);
</script>

<div class="space-y-6">
	<!-- Header -->
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
				<h1 class="text-3xl font-bold text-slate-900">Work Orders Report</h1>
				<p class="text-slate-600">
					Comprehensive analysis of work orders by status, priority, and date range
				</p>
			</div>
			<Button onclick={exportReport}>
				<Download class="mr-2 h-4 w-4" />
				Export CSV
			</Button>
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="grid gap-6 md:grid-cols-4">
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Total Work Orders</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">{data.summary.totalRecords}</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Total Cost</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">
				{formatCurrency(data.summary.totalCost || 0)}
			</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Average Cost</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">
				{formatCurrency(data.summary.avgCost || 0)}
			</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Date Range</p>
			<p class="mt-2 text-lg font-semibold text-slate-900">
				{formatDate(data.summary.dateRange.from)} - {formatDate(data.summary.dateRange.to)}
			</p>
		</Card>
	</div>

	<!-- Filters -->
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
				<Button
					variant="outline"
					size="sm"
					onclick={() => (showFilters = !showFilters)}
				>
					<Filter class="mr-2 h-4 w-4" />
					{showFilters ? 'Hide' : 'Show'} Filters
				</Button>
			</div>
		</div>

		{#if showFilters}
			<div class="space-y-4">
				<!-- Date Range -->
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

				<!-- Status Filter -->
				<div>
					<label class="mb-2 block text-sm font-medium text-slate-700">Status</label>
					<div class="flex flex-wrap gap-2">
						{#each statusOptions as status}
							<button type="button" onclick={() => toggleStatus(status)}>
								<Badge
									variant={selectedStatuses.includes(status) ? 'default' : 'outline'}
									class="cursor-pointer"
								>
									{status}
								</Badge>
							</button>
						{/each}
					</div>
				</div>

				<!-- Priority Filter -->
				<div>
					<label class="mb-2 block text-sm font-medium text-slate-700">Priority</label>
					<div class="flex flex-wrap gap-2">
						{#each priorityOptions as priority}
							<button type="button" onclick={() => togglePriority(priority)}>
								<Badge
									variant={selectedPriorities.includes(priority) ? 'default' : 'outline'}
									class="cursor-pointer"
								>
									{priority}
								</Badge>
							</button>
						{/each}
					</div>
				</div>

				<!-- Category Filter -->
				<div>
					<label class="mb-2 block text-sm font-medium text-slate-700">Asset Category</label>
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

	<!-- Search -->
	<Card class="p-4">
		<div class="relative">
			<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
			<Input
				type="text"
				placeholder="Search by ID, title, asset, category, or assignee..."
				bind:value={searchQuery}
				class="pl-10"
			/>
		</div>
	</Card>

	<!-- Data Table -->
	<Card class="overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b border-slate-200 bg-slate-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">ID</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Title</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Asset</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Status</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Priority</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Assigned To</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">Cost</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">Parts</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Due Date</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredData as wo}
						<tr class="hover:bg-slate-50">
							<td class="px-6 py-4 text-sm font-medium text-slate-900">{wo.id}</td>
							<td class="px-6 py-4 text-sm text-slate-900">
								<a
									href="/maintenance/work-orders/{wo.id}"
									class="font-medium text-blue-600 hover:underline"
								>
									{wo.title}
								</a>
							</td>
							<td class="px-6 py-4 text-sm text-slate-600">
								<div>{wo.assetName}</div>
								<div class="text-xs text-slate-500">{wo.assetCategory}</div>
							</td>
							<td class="px-6 py-4 text-sm">
								<Badge variant={getStatusVariant(wo.status)}>{wo.status}</Badge>
							</td>
							<td class="px-6 py-4 text-sm">
								<Badge variant={getPriorityVariant(wo.priority)}>{wo.priority}</Badge>
							</td>
							<td class="px-6 py-4 text-sm text-slate-600">{wo.assignedTo}</td>
							<td class="px-6 py-4 text-right text-sm font-medium text-slate-900">
								{formatCurrency(wo.cost)}
							</td>
							<td class="px-6 py-4 text-right text-sm text-slate-600">
								<div>{wo.partsCount} items</div>
								<div class="text-xs text-slate-500">{formatCurrency(wo.partsCost)}</div>
							</td>
							<td class="px-6 py-4 text-sm text-slate-600">{formatDate(wo.dueDate)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if filteredData.length === 0}
				<div class="py-12 text-center text-slate-500">
					No work orders found matching your criteria
				</div>
			{/if}
		</div>
	</Card>

	<!-- Showing results -->
	<div class="text-center text-sm text-slate-600">
		Showing {filteredData.length} of {data.data.length} work orders
	</div>
</div>
