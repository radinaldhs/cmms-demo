<script lang="ts">
	import { Card, Badge, Button, Input, Select, Dialog } from '$components/ui';
	import DateRangeFilter, { type DateFilterOption } from '$lib/components/ui/DateRangeFilter.svelte';
	import { filterByDateRange } from '$lib/core/utils/dateFilters';
	import { Search, AlertTriangle, Plus, Eye, Edit, Trash2, PackagePlus } from 'lucide-svelte';
	import { formatCurrency } from '$utils';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import InventoryFormDialog from '$lib/components/InventoryFormDialog.svelte';
	import StockAdjustmentDialog from '$lib/components/StockAdjustmentDialog.svelte';
	import type { PageData } from './$types';
	import type { SparePart } from '$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedCategory = $state('all');
	let selectedLocationType = $state<'all' | 'CENTRAL' | 'SITE'>('all');
	let selectedWarehouseId = $state('all');
	let showLowStockOnly = $state(false);
	let showAddDialog = $state(false);
	let showEditDialog = $state(false);
	let showAdjustDialog = $state(false);
	let showDeleteDialog = $state(false);
	let selectedPart = $state<SparePart | null>(null);
	let isDeleting = $state(false);
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

	let filteredParts = $derived(() => {
		let filtered = data.parts;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.code.toLowerCase().includes(query) ||
					p.description.toLowerCase().includes(query) ||
					p.category.toLowerCase().includes(query) ||
					p.warehouse.toLowerCase().includes(query) ||
					(p.warehouseLocationName && p.warehouseLocationName.toLowerCase().includes(query))
			);
		}

		if (selectedCategory !== 'all') {
			filtered = filtered.filter((p) => p.category === selectedCategory);
		}

		// Filter by location type
		if (selectedLocationType !== 'all') {
			filtered = filtered.filter((p) => {
				const location = data.warehouseLocations.find((loc) => loc.id === p.warehouseLocationId);
				return location && location.type === selectedLocationType;
			});
		}

		// Filter by specific warehouse
		if (selectedWarehouseId !== 'all') {
			filtered = filtered.filter((p) => p.warehouseLocationId === selectedWarehouseId);
		}

		if (showLowStockOnly) {
			filtered = filtered.filter((p) => p.currentStock < p.minStock);
		}

		// Date filter (using updatedAt)
		filtered = filtered.filter((p) => filterByDateRange(p.updatedAt, dateFilter, customDateFrom, customDateTo));

		return filtered;
	});

	// Get available warehouses based on location type filter
	let availableWarehouses = $derived(() => {
		if (selectedLocationType === 'CENTRAL') {
			return data.centralWarehouses;
		} else if (selectedLocationType === 'SITE') {
			return data.siteWarehouses;
		}
		return data.warehouseLocations;
	});

	// Reset warehouse filter when location type changes
	$effect(() => {
		selectedLocationType; // Track dependency
		selectedWarehouseId = 'all';
	});

	function getStockStatus(part: SparePart): 'low' | 'good' | 'high' {
		if (part.currentStock < part.minStock) return 'low';
		if (part.maxStock && part.currentStock > part.maxStock) return 'high';
		return 'good';
	}

	function getWarehouseLocation(part: SparePart) {
		return data.warehouseLocations.find((loc) => loc.id === part.warehouseLocationId);
	}

	function openEditDialog(part: SparePart) {
		selectedPart = part;
		showEditDialog = true;
	}

	function openAdjustDialog(part: SparePart) {
		selectedPart = part;
		showAdjustDialog = true;
	}

	function openDeleteDialog(part: SparePart) {
		selectedPart = part;
		showDeleteDialog = true;
	}

	async function handleDelete() {
		if (!selectedPart) return;

		isDeleting = true;
		try {
			const response = await fetch(`/api/inventory?id=${selectedPart.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete spare part');
			}

			toast.success('Spare part deleted successfully');
			await invalidateAll();
			showDeleteDialog = false;
			selectedPart = null;
		} catch (error) {
			toast.error('Failed to delete spare part');
		} finally {
			isDeleting = false;
		}
	}
</script>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Inventory</h1>
			<p class="text-sm text-slate-600 sm:text-base">Manage spare parts and supplies</p>
		</div>
		<Button class="w-full sm:w-auto" onclick={() => (showAddDialog = true)}>
			<Plus class="mr-2 h-4 w-4" />
			Add Spare Part
		</Button>
	</div>

	{#if data.lowStockParts.length > 0}
		<Card class="border-yellow-200 bg-yellow-50 p-4">
			<div class="flex items-center gap-2 text-yellow-800">
				<AlertTriangle class="h-5 w-5" />
				<span class="font-medium">{data.lowStockParts.length} items below minimum stock</span>
				<button
					onclick={() => (showLowStockOnly = !showLowStockOnly)}
					class="ml-auto text-sm underline hover:no-underline"
				>
					{showLowStockOnly ? 'Show All' : 'View Low Stock Items'}
				</button>
			</div>
		</Card>
	{/if}

	<Card class="p-6">
		<div class="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
			<div class="relative">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
				<Input bind:value={searchQuery} placeholder="Search inventory..." class="pl-9" />
			</div>

			<Select
				bind:value={selectedCategory}
				options={[
					{ value: 'all', label: 'All Categories' },
					...data.categories.map((c) => ({ value: c, label: c }))
				]}
			/>

			<Select
				bind:value={selectedLocationType}
				options={[
					{ value: 'all', label: 'All Locations' },
					{ value: 'CENTRAL', label: 'Central Warehouses' },
					{ value: 'SITE', label: 'Site Warehouses' }
				]}
			/>

			<Select
				bind:value={selectedWarehouseId}
				options={[
					{ value: 'all', label: 'All Warehouses' },
					...availableWarehouses().map((w) => ({
						value: w.id,
						label: w.type === 'CENTRAL' ? `${w.name} (${w.region})` : `${w.name} (${w.factory})`
					}))
				]}
			/>

			<!-- Date Filter -->
			<DateRangeFilter onFilterChange={handleDateFilterChange} defaultFilter="all_time" />

			<div class="flex items-center gap-2 xl:col-span-1">
				<span class="text-sm text-slate-600">Total Value:</span>
				<span class="text-lg font-bold text-slate-900">
					{formatCurrency(filteredParts().reduce((sum, p) => sum + (p.currentStock * p.unitCost), 0))}
				</span>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b border-slate-200">
					<tr>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Code</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Description</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Category</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Stock</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Min Stock</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Unit Cost</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Location</th>
						<th class="pb-3 text-right text-sm font-semibold text-slate-900">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredParts() as part}
						{@const location = getWarehouseLocation(part)}
						<tr class="hover:bg-slate-50">
							<td class="py-4 text-sm font-medium text-slate-900">{part.code}</td>
							<td class="py-4 text-sm text-slate-900">{part.description}</td>
							<td class="py-4 text-sm text-slate-600">{part.category}</td>
							<td class="py-4">
								<div class="flex items-center gap-2">
									<span class="text-sm font-medium {getStockStatus(part) === 'low' ? 'text-red-600' : getStockStatus(part) === 'high' ? 'text-orange-600' : 'text-slate-900'}">
										{part.currentStock} {part.unit}
									</span>
									{#if getStockStatus(part) === 'low'}
										<Badge variant="destructive" class="text-xs">Low</Badge>
									{/if}
								</div>
							</td>
							<td class="py-4 text-sm text-slate-600">{part.minStock} {part.unit}</td>
							<td class="py-4 text-sm text-slate-900">{formatCurrency(part.unitCost)}</td>
							<td class="py-4">
								{#if location}
									<div class="flex flex-col gap-1">
										<div class="flex items-center gap-2">
											<span class="text-sm font-medium text-slate-900">{location.name}</span>
											<Badge variant={location.type === 'CENTRAL' ? 'default' : 'secondary'} class="text-xs">
												{location.type === 'CENTRAL' ? 'Central' : 'Site'}
											</Badge>
										</div>
										<span class="text-xs text-slate-500">
											{location.type === 'CENTRAL' ? location.region : location.factory}
										</span>
									</div>
								{:else}
									<span class="text-sm text-slate-600">{part.warehouse}</span>
								{/if}
							</td>
							<td class="py-4">
								<div class="flex items-center justify-end gap-1">
									<a href="/inventory/{part.id}">
										<Button variant="ghost" size="sm" title="View Details">
											<Eye class="h-4 w-4" />
										</Button>
									</a>
									<Button variant="ghost" size="sm" onclick={() => openAdjustDialog(part)} title="Adjust Stock">
										<PackagePlus class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="sm" onclick={() => openEditDialog(part)} title="Edit">
										<Edit class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="sm" onclick={() => openDeleteDialog(part)} title="Delete">
										<Trash2 class="h-4 w-4 text-red-600" />
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			{#if filteredParts().length === 0}
				<div class="py-12 text-center text-slate-500">No spare parts found</div>
			{/if}
		</div>

		<div class="mt-4 text-sm text-slate-600">
			Showing {filteredParts().length} of {data.parts.length} spare parts
		</div>
	</Card>
</div>

<InventoryFormDialog
	bind:open={showAddDialog}
	categories={data.categories}
	warehouseLocations={data.warehouseLocations}
/>

<InventoryFormDialog
	bind:open={showEditDialog}
	part={selectedPart}
	categories={data.categories}
	warehouseLocations={data.warehouseLocations}
/>

<StockAdjustmentDialog
	bind:open={showAdjustDialog}
	part={selectedPart}
/>

<Dialog bind:open={showDeleteDialog} title="Delete Spare Part" description="Are you sure you want to delete this spare part? This action cannot be undone.">
	<div class="flex justify-end gap-2 pt-4">
		<Button variant="outline" onclick={() => (showDeleteDialog = false)} disabled={isDeleting}>
			Cancel
		</Button>
		<Button variant="destructive" onclick={handleDelete} disabled={isDeleting}>
			{isDeleting ? 'Deleting...' : 'Delete Part'}
		</Button>
	</div>
</Dialog>
