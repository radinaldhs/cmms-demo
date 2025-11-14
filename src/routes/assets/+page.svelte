<script lang="ts">
	import { Card, Badge, Button, Input, Select } from '$components/ui';
	import DateRangeFilter, { type DateFilterOption } from '$lib/components/ui/DateRangeFilter.svelte';
	import { Search, Plus, Eye } from 'lucide-svelte';
	import { formatCurrency, formatDate } from '$utils';
	import { filterByDateRange } from '$lib/core/utils/dateFilters';
	import AssetFormDialog from '$lib/components/AssetFormDialog.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedCategory = $state('all');
	let selectedStatus = $state('all');
	let showAddDialog = $state(false);
	let dateFilter = $state<DateFilterOption>('all_time');
	let customDateFrom = $state('');
	let customDateTo = $state('');

	function handleDateFilterChange(filter: DateFilterOption, customFrom?: string, customTo?: string) {
		dateFilter = filter;
		if (filter === 'custom_range' && customFrom && customTo) {
			customDateFrom = customFrom;
			customDateTo = customTo;
		}
	}

	let filteredAssets = $derived(() => {
		let filtered = data.assets;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(a) =>
					a.name.toLowerCase().includes(query) ||
					a.code.toLowerCase().includes(query) ||
					a.location.toLowerCase().includes(query)
			);
		}

		if (selectedCategory !== 'all') {
			filtered = filtered.filter((a) => a.category === selectedCategory);
		}

		if (selectedStatus !== 'all') {
			filtered = filtered.filter((a) => a.status === selectedStatus);
		}

		// Apply date filter
		filtered = filtered.filter((a) => filterByDateRange(a.purchaseDate, dateFilter, customDateFrom, customDateTo));

		return filtered;
	});

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Active: 'success',
			Inactive: 'secondary',
			Maintenance: 'warning',
			Retired: 'destructive'
		};
		return variants[status] || 'default';
	}
</script>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Assets</h1>
			<p class="text-sm text-slate-600 sm:text-base">Manage your fixed assets and equipment</p>
		</div>
		<Button onclick={() => (showAddDialog = true)} class="w-full sm:w-auto">
			<Plus class="mr-2 h-4 w-4" />
			Add Asset
		</Button>
	</div>

	<Card class="p-6">
		<div class="mb-6 grid gap-4 md:grid-cols-4">
			<div class="relative">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
				<Input bind:value={searchQuery} placeholder="Search assets..." class="pl-9" />
			</div>

			<Select
				bind:value={selectedCategory}
				options={[
					{ value: 'all', label: 'All Categories' },
					...data.categories.map((c) => ({ value: c, label: c }))
				]}
			/>

			<Select
				bind:value={selectedStatus}
				options={[
					{ value: 'all', label: 'All Status' },
					{ value: 'Active', label: 'Active' },
					{ value: 'Inactive', label: 'Inactive' },
					{ value: 'Maintenance', label: 'Maintenance' },
					{ value: 'Retired', label: 'Retired' }
				]}
			/>

			<DateRangeFilter onFilterChange={handleDateFilterChange} defaultFilter="all_time" />
		</div>

		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b border-slate-200">
					<tr>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Code</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Name</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Category</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Location</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Status</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Purchase Cost</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Purchase Date</th>
						<th class="pb-3 text-right text-sm font-semibold text-slate-900">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredAssets() as asset}
						<tr class="hover:bg-slate-50">
							<td class="py-4 text-sm font-medium text-slate-900">{asset.code}</td>
							<td class="py-4 text-sm text-slate-900">{asset.name}</td>
							<td class="py-4 text-sm text-slate-600">{asset.category}</td>
							<td class="py-4 text-sm text-slate-600">{asset.location}</td>
							<td class="py-4">
								<Badge variant={getStatusVariant(asset.status)}>{asset.status}</Badge>
							</td>
							<td class="py-4 text-sm text-slate-900">{formatCurrency(asset.purchaseCost)}</td>
							<td class="py-4 text-sm text-slate-600">{formatDate(asset.purchaseDate)}</td>
							<td class="py-4 text-right">
								<a href="/assets/{asset.id}">
									<Button variant="ghost" size="sm">
										<Eye class="h-4 w-4" />
									</Button>
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			{#if filteredAssets().length === 0}
				<div class="py-12 text-center text-slate-500">No assets found</div>
			{/if}
		</div>

		<div class="mt-4 text-sm text-slate-600">
			Showing {filteredAssets().length} of {data.assets.length} assets
		</div>
	</Card>
</div>

<AssetFormDialog bind:open={showAddDialog} categories={data.categories} />
