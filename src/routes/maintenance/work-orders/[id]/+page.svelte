<script lang="ts">
	import { Card, Badge, Button, Dialog } from '$components/ui';
	import { ArrowLeft, Edit, Trash2, Clock, DollarSign, Wrench } from 'lucide-svelte';
	import { formatCurrency, formatDate } from '$utils';
	import WorkOrderFormDialog from '$lib/components/WorkOrderFormDialog.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab = $state('overview');
	let showEditDialog = $state(false);
	let showDeleteDialog = $state(false);
	let isDeleting = $state(false);

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

	async function handleDelete() {
		isDeleting = true;
		try {
			const response = await fetch(`/api/work-orders?id=${data.workOrder.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete work order');
			}

			toast.success('Work order deleted successfully');
			await goto('/maintenance/work-orders');
		} catch (error) {
			toast.error('Failed to delete work order');
		} finally {
			isDeleting = false;
			showDeleteDialog = false;
		}
	}

	async function handleStatusChange(newStatus: string) {
		try {
			const updates: any = { status: newStatus };

			if (newStatus === 'Completed') {
				updates.completedDate = new Date().toISOString();
			}

			const response = await fetch('/api/work-orders', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: data.workOrder.id, ...updates })
			});

			if (!response.ok) {
				throw new Error('Failed to update status');
			}

			toast.success('Status updated successfully');
			await invalidateAll();
		} catch (error) {
			toast.error('Failed to update status');
		}
	}
</script>

<div class="space-y-6">
	<div>
		<a
			href="/maintenance/work-orders"
			class="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
		>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Work Orders
		</a>

		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold text-slate-900">{data.workOrder.title}</h1>
				<p class="text-slate-600">{data.workOrder.id} • {data.workOrder.assetName}</p>
			</div>
			<div class="flex gap-2">
				<Badge variant={getStatusVariant(data.workOrder.status)}>{data.workOrder.status}</Badge>
				<Badge variant={getPriorityVariant(data.workOrder.priority)}>
					{data.workOrder.priority} Priority
				</Badge>
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

	<!-- Quick Actions -->
	{#if data.workOrder.status !== 'Completed' && data.workOrder.status !== 'Cancelled'}
		<Card class="p-4">
			<div class="flex items-center gap-3">
				<span class="text-sm font-medium text-slate-700">Quick Actions:</span>
				{#if data.workOrder.status === 'Planned'}
					<Button size="sm" onclick={() => handleStatusChange('In Progress')}>
						Start Work Order
					</Button>
				{/if}
				{#if data.workOrder.status === 'In Progress'}
					<Button size="sm" onclick={() => handleStatusChange('Completed')}>
						Mark as Completed
					</Button>
				{/if}
				<Button size="sm" variant="outline" onclick={() => handleStatusChange('Cancelled')}>
					Cancel Work Order
				</Button>
			</div>
		</Card>
	{/if}

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
				onclick={() => (activeTab = 'parts')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'parts'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Spare Parts
			</button>
			<button
				onclick={() => (activeTab = 'timeline')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'timeline'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Timeline
			</button>
		</nav>
	</div>

	{#if activeTab === 'overview'}
		<div class="grid gap-6 md:grid-cols-3">
			<Card class="p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-blue-100 p-3">
						<Clock class="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<p class="text-sm text-slate-600">Labor Hours</p>
						<p class="text-2xl font-bold text-slate-900">{data.workOrder.laborHours || 0}</p>
					</div>
				</div>
			</Card>

			<Card class="p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-green-100 p-3">
						<DollarSign class="h-6 w-6 text-green-600" />
					</div>
					<div>
						<p class="text-sm text-slate-600">Total Cost</p>
						<p class="text-2xl font-bold text-slate-900">{formatCurrency(data.workOrder.cost)}</p>
					</div>
				</div>
			</Card>

			<Card class="p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-purple-100 p-3">
						<Wrench class="h-6 w-6 text-purple-600" />
					</div>
					<div>
						<p class="text-sm text-slate-600">Parts Used</p>
						<p class="text-2xl font-bold text-slate-900">{data.workOrder.sparePartsUsed.length}</p>
					</div>
				</div>
			</Card>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<Card class="p-6">
				<h3 class="mb-4 text-lg font-semibold text-slate-900">Work Order Details</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Work Order ID</dt>
						<dd class="text-sm font-medium text-slate-900">{data.workOrder.id}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Asset</dt>
						<dd class="text-sm font-medium text-slate-900">
							<a href="/assets/{data.workOrder.assetId}" class="text-blue-600 hover:underline">
								{data.workOrder.assetName}
							</a>
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Priority</dt>
						<dd class="text-sm font-medium text-slate-900">
							<Badge variant={getPriorityVariant(data.workOrder.priority)}>
								{data.workOrder.priority}
							</Badge>
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Status</dt>
						<dd class="text-sm font-medium text-slate-900">
							<Badge variant={getStatusVariant(data.workOrder.status)}>
								{data.workOrder.status}
							</Badge>
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Requested By</dt>
						<dd class="text-sm font-medium text-slate-900">{data.workOrder.requestedBy}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Assigned To</dt>
						<dd class="text-sm font-medium text-slate-900">{data.workOrder.assignedTo || 'Unassigned'}</dd>
					</div>
				</dl>
			</Card>

			<Card class="p-6">
				<h3 class="mb-4 text-lg font-semibold text-slate-900">Schedule & Dates</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Scheduled Date</dt>
						<dd class="text-sm font-medium text-slate-900">{formatDate(data.workOrder.scheduledDate)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Due Date</dt>
						<dd class="text-sm font-medium text-slate-900">{formatDate(data.workOrder.dueDate)}</dd>
					</div>
					{#if data.workOrder.completedDate}
						<div class="flex justify-between">
							<dt class="text-sm text-slate-600">Completed Date</dt>
							<dd class="text-sm font-medium text-green-600">
								{formatDate(data.workOrder.completedDate)}
							</dd>
						</div>
					{/if}
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Created</dt>
						<dd class="text-sm font-medium text-slate-900">{formatDate(data.workOrder.createdAt)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Last Updated</dt>
						<dd class="text-sm font-medium text-slate-900">{formatDate(data.workOrder.updatedAt)}</dd>
					</div>
				</dl>
			</Card>
		</div>

		{#if data.workOrder.description}
			<Card class="p-6">
				<h3 class="mb-2 text-lg font-semibold text-slate-900">Description</h3>
				<p class="text-sm text-slate-600">{data.workOrder.description}</p>
			</Card>
		{/if}

		{#if data.workOrder.notes}
			<Card class="p-6">
				<h3 class="mb-2 text-lg font-semibold text-slate-900">Notes</h3>
				<p class="text-sm text-slate-600">{data.workOrder.notes}</p>
			</Card>
		{/if}
	{:else if activeTab === 'parts'}
		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Spare Parts Used</h3>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="border-b border-slate-200">
						<tr>
							<th class="pb-3 text-left text-sm font-semibold text-slate-900">Part Code</th>
							<th class="pb-3 text-left text-sm font-semibold text-slate-900">Part Name</th>
							<th class="pb-3 text-right text-sm font-semibold text-slate-900">Quantity</th>
							<th class="pb-3 text-right text-sm font-semibold text-slate-900">Unit Cost</th>
							<th class="pb-3 text-right text-sm font-semibold text-slate-900">Total Cost</th>
							<th class="pb-3 text-left text-sm font-semibold text-slate-900">Warehouse</th>
							<th class="pb-3 text-right text-sm font-semibold text-slate-900">Current Stock</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.partsDetails as part}
							<tr>
								<td class="py-3 text-sm font-medium text-slate-900">{part.partCode}</td>
								<td class="py-3 text-sm text-slate-900">{part.partName}</td>
								<td class="py-3 text-right text-sm text-slate-900">{part.quantity}</td>
								<td class="py-3 text-right text-sm text-slate-900">{formatCurrency(part.unitCost)}</td>
								<td class="py-3 text-right text-sm font-medium text-slate-900">
									{formatCurrency(part.totalCost)}
								</td>
								<td class="py-3 text-sm text-slate-600">{part.warehouse}</td>
								<td class="py-3 text-right text-sm text-slate-600">{part.currentStock}</td>
							</tr>
						{/each}
					</tbody>
					<tfoot class="border-t-2 border-slate-300">
						<tr>
							<td colspan="4" class="py-3 text-right text-sm font-semibold text-slate-900">
								Total Parts Cost:
							</td>
							<td class="py-3 text-right text-sm font-bold text-slate-900">
								{formatCurrency(
									data.partsDetails.reduce((sum, part) => sum + part.totalCost, 0)
								)}
							</td>
							<td colspan="2"></td>
						</tr>
					</tfoot>
				</table>
				{#if data.partsDetails.length === 0}
					<div class="py-12 text-center text-slate-500">No spare parts used</div>
				{/if}
			</div>
		</Card>
	{:else if activeTab === 'timeline'}
		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Work Order Timeline</h3>
			<div class="space-y-4">
				<div class="flex gap-4">
					<div class="flex flex-col items-center">
						<div class="rounded-full bg-blue-100 p-2">
							<Clock class="h-4 w-4 text-blue-600" />
						</div>
						<div class="h-full w-px bg-slate-200"></div>
					</div>
					<div class="flex-1 pb-4">
						<p class="text-sm font-medium text-slate-900">Work Order Created</p>
						<p class="text-xs text-slate-600">{formatDate(data.workOrder.createdAt)}</p>
						<p class="text-xs text-slate-500">Requested by {data.workOrder.requestedBy}</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="flex flex-col items-center">
						<div
							class="rounded-full p-2 {data.workOrder.status !== 'Planned'
								? 'bg-green-100'
								: 'bg-slate-100'}"
						>
							<Clock
								class="h-4 w-4 {data.workOrder.status !== 'Planned'
									? 'text-green-600'
									: 'text-slate-400'}"
							/>
						</div>
						{#if data.workOrder.completedDate}
							<div class="h-full w-px bg-slate-200"></div>
						{/if}
					</div>
					<div class="flex-1 pb-4">
						<p class="text-sm font-medium text-slate-900">Scheduled</p>
						<p class="text-xs text-slate-600">{formatDate(data.workOrder.scheduledDate)}</p>
						{#if data.workOrder.assignedTo}
							<p class="text-xs text-slate-500">Assigned to {data.workOrder.assignedTo}</p>
						{/if}
					</div>
				</div>

				{#if data.workOrder.completedDate}
					<div class="flex gap-4">
						<div class="flex flex-col items-center">
							<div class="rounded-full bg-green-100 p-2">
								<Clock class="h-4 w-4 text-green-600" />
							</div>
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium text-slate-900">Completed</p>
							<p class="text-xs text-slate-600">{formatDate(data.workOrder.completedDate)}</p>
							<p class="text-xs text-slate-500">
								Total cost: {formatCurrency(data.workOrder.cost)}
							</p>
						</div>
					</div>
				{/if}
			</div>
		</Card>
	{/if}
</div>

<WorkOrderFormDialog bind:open={showEditDialog} workOrder={data.workOrder} />

<Dialog
	bind:open={showDeleteDialog}
	title="Delete Work Order"
	description="Are you sure you want to delete this work order? This action cannot be undone."
>
	<div class="flex justify-end gap-2 pt-4">
		<Button variant="outline" onclick={() => (showDeleteDialog = false)} disabled={isDeleting}>
			Cancel
		</Button>
		<Button variant="destructive" onclick={handleDelete} disabled={isDeleting}>
			{isDeleting ? 'Deleting...' : 'Delete Work Order'}
		</Button>
	</div>
</Dialog>
