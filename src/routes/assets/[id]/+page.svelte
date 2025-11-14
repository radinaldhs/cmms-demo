<script lang="ts">
	import { Card, Badge, Button, Dialog } from '$components/ui';
	import { ArrowLeft, Edit, TrendingDown, DollarSign, Trash2 } from 'lucide-svelte';
	import { formatCurrency, formatDate } from '$utils';
	import AssetFormDialog from '$lib/components/AssetFormDialog.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { assets } from '$stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab = $state('overview');
	let showEditDialog = $state(false);
	let showDeleteDialog = $state(false);
	let isDeleting = $state(false);

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Active: 'success',
			Inactive: 'secondary',
			Maintenance: 'warning',
			Retired: 'destructive',
			Completed: 'success',
			'In Progress': 'warning',
			Planned: 'default',
			Overdue: 'destructive'
		};
		return variants[status] || 'default';
	}

	async function handleDelete() {
		isDeleting = true;
		try {
			const response = await fetch(`/api/assets?id=${data.asset.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete asset');
			}

			toast.success('Asset deleted successfully');
			await goto('/assets');
		} catch (error) {
			toast.error('Failed to delete asset');
		} finally {
			isDeleting = false;
			showDeleteDialog = false;
		}
	}
</script>

<div class="space-y-6">
	<div>
		<a href="/assets" class="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Assets
		</a>

		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold text-slate-900">{data.asset.name}</h1>
				<p class="text-slate-600">{data.asset.code} • {data.asset.category}</p>
			</div>
			<div class="flex gap-2">
				<Badge variant={getStatusVariant(data.asset.status)}>{data.asset.status}</Badge>
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
				onclick={() => (activeTab = 'maintenance')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'maintenance'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Maintenance History
			</button>
			<button
				onclick={() => (activeTab = 'financials')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'financials'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Cost & Depreciation
			</button>
			<a
				href="/assets/{data.asset.id}/inspections"
				class="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700"
			>
				Inspections
			</a>
			<a
				href="/assets/{data.asset.id}/documents"
				class="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700"
			>
				Documentation
			</a>
		</nav>
	</div>

	{#if activeTab === 'overview'}
		<div class="grid gap-6 md:grid-cols-2">
			<Card class="p-6">
				<h3 class="mb-4 text-lg font-semibold text-slate-900">Asset Details</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Code</dt>
						<dd class="text-sm font-medium text-slate-900">{data.asset.code}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Category</dt>
						<dd class="text-sm font-medium text-slate-900">{data.asset.category}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Location</dt>
						<dd class="text-sm font-medium text-slate-900">{data.asset.location}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Manufacturer</dt>
						<dd class="text-sm font-medium text-slate-900">{data.asset.manufacturer || '-'}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Model</dt>
						<dd class="text-sm font-medium text-slate-900">{data.asset.model || '-'}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Serial Number</dt>
						<dd class="text-sm font-medium text-slate-900">{data.asset.serialNumber || '-'}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Assigned To</dt>
						<dd class="text-sm font-medium text-slate-900">{data.asset.assignedTo || 'Unassigned'}</dd>
					</div>
				</dl>
			</Card>

			<Card class="p-6">
				<h3 class="mb-4 text-lg font-semibold text-slate-900">Financial Summary</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Purchase Cost</dt>
						<dd class="text-sm font-medium text-slate-900">{formatCurrency(data.asset.purchaseCost)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Purchase Date</dt>
						<dd class="text-sm font-medium text-slate-900">{formatDate(data.asset.purchaseDate)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Useful Life</dt>
						<dd class="text-sm font-medium text-slate-900">{data.asset.usefulLifeYears} years</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Current Book Value</dt>
						<dd class="text-sm font-medium text-green-600">{formatCurrency(data.financials.bookValue)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Accumulated Depreciation</dt>
						<dd class="text-sm font-medium text-red-600">{formatCurrency(data.financials.accumulatedDepreciation)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Maintenance Cost (Total)</dt>
						<dd class="text-sm font-medium text-slate-900">{formatCurrency(data.financials.maintenanceCostTotal)}</dd>
					</div>
				</dl>
			</Card>
		</div>

		{#if data.asset.description}
			<Card class="p-6">
				<h3 class="mb-2 text-lg font-semibold text-slate-900">Description</h3>
				<p class="text-sm text-slate-600">{data.asset.description}</p>
			</Card>
		{/if}
	{:else if activeTab === 'maintenance'}
		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Work Order History</h3>
			<div class="space-y-4">
				{#each data.workOrders as wo}
					<div class="flex items-start justify-between border-b border-slate-100 pb-4 last:border-0">
						<div class="flex-1">
							<a href="/maintenance/work-orders/{wo.id}" class="font-medium text-slate-900 hover:text-blue-600">
								{wo.title}
							</a>
							<p class="text-sm text-slate-600">{wo.description}</p>
							<div class="mt-1 flex items-center gap-4 text-xs text-slate-500">
								<span>Scheduled: {formatDate(wo.scheduledDate)}</span>
								{#if wo.completedDate}
									<span>Completed: {formatDate(wo.completedDate)}</span>
								{/if}
								<span>Cost: {formatCurrency(wo.cost)}</span>
							</div>
						</div>
						<Badge variant={getStatusVariant(wo.status)}>{wo.status}</Badge>
					</div>
				{/each}
				{#if data.workOrders.length === 0}
					<p class="text-center text-sm text-slate-500">No maintenance history</p>
				{/if}
			</div>
		</Card>
	{:else if activeTab === 'financials'}
		<div class="grid gap-6 md:grid-cols-3">
			<Card class="p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-blue-100 p-3">
						<DollarSign class="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<p class="text-sm text-slate-600">Book Value</p>
						<p class="text-2xl font-bold text-slate-900">{formatCurrency(data.financials.bookValue)}</p>
					</div>
				</div>
			</Card>

			<Card class="p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-red-100 p-3">
						<TrendingDown class="h-6 w-6 text-red-600" />
					</div>
					<div>
						<p class="text-sm text-slate-600">Accumulated Depreciation</p>
						<p class="text-2xl font-bold text-slate-900">{formatCurrency(data.financials.accumulatedDepreciation)}</p>
					</div>
				</div>
			</Card>

			<Card class="p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-green-100 p-3">
						<DollarSign class="h-6 w-6 text-green-600" />
					</div>
					<div>
						<p class="text-sm text-slate-600">Maintenance Cost YTD</p>
						<p class="text-2xl font-bold text-slate-900">{formatCurrency(data.financials.maintenanceCostYTD)}</p>
					</div>
				</div>
			</Card>
		</div>

		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Depreciation Schedule</h3>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="border-b border-slate-200">
						<tr>
							<th class="pb-3 text-left text-sm font-semibold text-slate-900">Year</th>
							<th class="pb-3 text-right text-sm font-semibold text-slate-900">Starting Value</th>
							<th class="pb-3 text-right text-sm font-semibold text-slate-900">Depreciation</th>
							<th class="pb-3 text-right text-sm font-semibold text-slate-900">Ending Value</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.financials.depreciationSchedule as row}
							<tr>
								<td class="py-3 text-sm text-slate-900">{row.year}</td>
								<td class="py-3 text-right text-sm text-slate-900">{formatCurrency(row.startingValue)}</td>
								<td class="py-3 text-right text-sm text-red-600">{formatCurrency(row.depreciation)}</td>
								<td class="py-3 text-right text-sm font-medium text-slate-900">{formatCurrency(row.endingValue)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card>
	{/if}
</div>

<AssetFormDialog
	bind:open={showEditDialog}
	asset={data.asset}
	categories={assets.getCategories()}
/>

<Dialog bind:open={showDeleteDialog} title="Delete Asset" description="Are you sure you want to delete this asset? This action cannot be undone.">
	<div class="flex justify-end gap-2 pt-4">
		<Button variant="outline" onclick={() => (showDeleteDialog = false)} disabled={isDeleting}>
			Cancel
		</Button>
		<Button variant="destructive" onclick={handleDelete} disabled={isDeleting}>
			{isDeleting ? 'Deleting...' : 'Delete Asset'}
		</Button>
	</div>
</Dialog>
