<script lang="ts">
	import { Card, Badge, Button, Dialog } from '$components/ui';
	import { ArrowLeft, Edit, Trash2, PackagePlus, Package, TrendingUp, DollarSign, AlertCircle } from 'lucide-svelte';
	import { formatCurrency, formatDateTime } from '$utils';
	import InventoryFormDialog from '$lib/components/InventoryFormDialog.svelte';
	import StockAdjustmentDialog from '$lib/components/StockAdjustmentDialog.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { spareParts } from '$stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab = $state('overview');
	let showEditDialog = $state(false);
	let showAdjustDialog = $state(false);
	let showDeleteDialog = $state(false);
	let isDeleting = $state(false);

	function getStockStatusVariant(): 'default' | 'destructive' | 'warning' | 'success' {
		if (data.part.currentStock < data.part.minStock) return 'destructive';
		if (data.part.maxStock && data.part.currentStock > data.part.maxStock) return 'warning';
		return 'success';
	}

	function getStockStatusLabel(): string {
		if (data.part.currentStock < data.part.minStock) return 'Low Stock';
		if (data.part.maxStock && data.part.currentStock > data.part.maxStock) return 'Overstock';
		return 'Normal';
	}

	function getMovementTypeVariant(type: string): 'default' | 'success' | 'destructive' {
		if (type === 'IN') return 'success';
		if (type === 'OUT') return 'destructive';
		return 'default';
	}

	async function handleDelete() {
		isDeleting = true;
		try {
			const response = await fetch(`/api/inventory?id=${data.part.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete spare part');
			}

			toast.success('Spare part deleted successfully');
			await goto('/inventory');
		} catch (error) {
			toast.error('Failed to delete spare part');
		} finally {
			isDeleting = false;
			showDeleteDialog = false;
		}
	}
</script>

<div class="space-y-6">
	<div>
		<a href="/inventory" class="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Inventory
		</a>

		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold text-slate-900">{data.part.description}</h1>
				<p class="text-slate-600">{data.part.code} • {data.part.category}</p>
			</div>
			<div class="flex gap-2">
				<Badge variant={getStockStatusVariant()}>{getStockStatusLabel()}</Badge>
				<Button variant="outline" onclick={() => (showAdjustDialog = true)}>
					<PackagePlus class="mr-2 h-4 w-4" />
					Adjust Stock
				</Button>
				<Button variant="outline" onclick={() => (showEditDialog = true)}>
					<Edit class="mr-2 h-4 w-4" />
					Edit
				</Button>
				<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>
					<Trash2 class="mr-2 h-4 w-4" />
					Delete
				</Button>
			</div>
		</div>
	</div>

	<!-- Tabs -->
	<div class="border-b border-slate-200">
		<nav class="-mb-px flex space-x-8">
			<button
				onclick={() => (activeTab = 'overview')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'overview'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Overview
			</button>
			<button
				onclick={() => (activeTab = 'movements')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'movements'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Stock Movements
			</button>
			<button
				onclick={() => (activeTab = 'statistics')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'statistics'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Statistics
			</button>
		</nav>
	</div>

	{#if activeTab === 'overview'}
		<div class="grid gap-6 md:grid-cols-2">
			<Card class="p-6">
				<h3 class="mb-4 text-lg font-semibold text-slate-900">Part Details</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Code</dt>
						<dd class="text-sm font-medium text-slate-900">{data.part.code}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Category</dt>
						<dd class="text-sm font-medium text-slate-900">{data.part.category}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Unit</dt>
						<dd class="text-sm font-medium text-slate-900">{data.part.unit}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Warehouse</dt>
						<dd class="text-sm font-medium text-slate-900">{data.part.warehouse}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Supplier</dt>
						<dd class="text-sm font-medium text-slate-900">{data.part.supplier || '-'}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Lead Time</dt>
						<dd class="text-sm font-medium text-slate-900">{data.part.leadTimeDays || 0} days</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">SAP Item Code</dt>
						<dd class="text-sm font-medium text-slate-900">{data.part.sapItemCode || '-'}</dd>
					</div>
				</dl>
			</Card>

			<Card class="p-6">
				<h3 class="mb-4 text-lg font-semibold text-slate-900">Stock Information</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Current Stock</dt>
						<dd class="text-sm font-medium {data.part.currentStock < data.part.minStock ? 'text-red-600' : 'text-slate-900'}">
							{data.part.currentStock} {data.part.unit}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Minimum Stock</dt>
						<dd class="text-sm font-medium text-slate-900">{data.part.minStock} {data.part.unit}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Maximum Stock</dt>
						<dd class="text-sm font-medium text-slate-900">{data.part.maxStock || 'Not set'} {data.part.maxStock ? data.part.unit : ''}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Unit Cost</dt>
						<dd class="text-sm font-medium text-slate-900">{formatCurrency(data.part.unitCost)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Total Value</dt>
						<dd class="text-sm font-medium text-green-600">{formatCurrency(data.stats.totalValue)}</dd>
					</div>
				</dl>
			</Card>
		</div>

		{#if data.part.currentStock < data.part.minStock}
			<Card class="border-red-200 bg-red-50 p-4">
				<div class="flex items-start gap-3">
					<AlertCircle class="h-5 w-5 text-red-600" />
					<div class="flex-1">
						<h4 class="font-medium text-red-900">Low Stock Alert</h4>
						<p class="mt-1 text-sm text-red-700">
							Current stock ({data.part.currentStock} {data.part.unit}) is below the minimum threshold ({data.part.minStock} {data.part.unit}).
							Consider reordering from {data.part.supplier || 'supplier'}.
						</p>
					</div>
					<Button variant="outline" size="sm" onclick={() => (showAdjustDialog = true)}>
						Restock
					</Button>
				</div>
			</Card>
		{/if}
	{:else if activeTab === 'movements'}
		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Stock Movement History</h3>
			<div class="space-y-4">
				{#each data.movements as movement}
					<div class="flex items-start justify-between border-b border-slate-100 pb-4 last:border-0">
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<Badge variant={getMovementTypeVariant(movement.type)}>
									{movement.type}
								</Badge>
								<span class="font-medium text-slate-900">
									{movement.type === 'IN' ? '+' : '-'}{movement.quantity} {data.part.unit}
								</span>
							</div>
							<p class="mt-1 text-sm text-slate-600">
								Performed by: {movement.performedBy}
							</p>
							{#if movement.notes}
								<p class="mt-1 text-sm text-slate-500">{movement.notes}</p>
							{/if}
							{#if movement.referenceWorkOrderId}
								<a
									href="/maintenance/work-orders/{movement.referenceWorkOrderId}"
									class="mt-1 inline-block text-sm text-blue-600 hover:underline"
								>
									Work Order: {movement.referenceWorkOrderId}
								</a>
							{/if}
							<p class="mt-1 text-xs text-slate-500">
								{formatDateTime(movement.createdAt)}
							</p>
						</div>
						<div class="text-right">
							<p class="text-sm font-medium text-slate-900">
								{formatCurrency(movement.totalCost)}
							</p>
							<p class="text-xs text-slate-500">
								@ {formatCurrency(movement.unitCost)}/{data.part.unit}
							</p>
						</div>
					</div>
				{/each}
				{#if data.movements.length === 0}
					<p class="text-center text-sm text-slate-500">No stock movements recorded</p>
				{/if}
			</div>
		</Card>
	{:else if activeTab === 'statistics'}
		<div class="grid gap-6 md:grid-cols-3">
			<Card class="p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-green-100 p-3">
						<TrendingUp class="h-6 w-6 text-green-600" />
					</div>
					<div>
						<p class="text-sm text-slate-600">Total Stock In</p>
						<p class="text-2xl font-bold text-slate-900">{data.stats.totalIn} {data.part.unit}</p>
					</div>
				</div>
			</Card>

			<Card class="p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-red-100 p-3">
						<Package class="h-6 w-6 text-red-600" />
					</div>
					<div>
						<p class="text-sm text-slate-600">Total Stock Out</p>
						<p class="text-2xl font-bold text-slate-900">{data.stats.totalOut} {data.part.unit}</p>
					</div>
				</div>
			</Card>

			<Card class="p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-blue-100 p-3">
						<DollarSign class="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<p class="text-sm text-slate-600">Current Value</p>
						<p class="text-2xl font-bold text-slate-900">{formatCurrency(data.stats.totalValue)}</p>
					</div>
				</div>
			</Card>
		</div>

		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Additional Statistics</h3>
			<dl class="grid gap-4 md:grid-cols-2">
				<div class="flex justify-between border-b border-slate-100 pb-3">
					<dt class="text-sm text-slate-600">Total Movements</dt>
					<dd class="text-sm font-medium text-slate-900">{data.movements.length}</dd>
				</div>
				<div class="flex justify-between border-b border-slate-100 pb-3">
					<dt class="text-sm text-slate-600">Turnover Rate</dt>
					<dd class="text-sm font-medium text-slate-900">{data.stats.turnoverRate.toFixed(1)}%</dd>
				</div>
				<div class="flex justify-between border-b border-slate-100 pb-3">
					<dt class="text-sm text-slate-600">Average Cost per Movement</dt>
					<dd class="text-sm font-medium text-slate-900">
						{formatCurrency(data.movements.length > 0 ? data.movements.reduce((sum, m) => sum + m.totalCost, 0) / data.movements.length : 0)}
					</dd>
				</div>
				<div class="flex justify-between border-b border-slate-100 pb-3">
					<dt class="text-sm text-slate-600">Stock Status</dt>
					<dd class="text-sm font-medium text-slate-900">{getStockStatusLabel()}</dd>
				</div>
			</dl>
		</Card>
	{/if}
</div>

<InventoryFormDialog
	bind:open={showEditDialog}
	part={data.part}
	categories={spareParts.getCategories()}
	warehouseLocations={data.warehouseLocations}
/>

<StockAdjustmentDialog
	bind:open={showAdjustDialog}
	part={data.part}
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
