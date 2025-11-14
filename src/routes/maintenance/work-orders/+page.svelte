<script lang="ts">
	import { Card, Badge, Button, Input, Select } from '$components/ui';
	import DateRangeFilter, { type DateFilterOption } from '$lib/components/ui/DateRangeFilter.svelte';
	import { filterByDateRange } from '$lib/core/utils/dateFilters';
	import { Search, Plus, Eye } from 'lucide-svelte';
	import { formatCurrency, formatDate } from '$utils';
	import WorkOrderFormDialog from '$lib/components/WorkOrderFormDialog.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedStatus = $state('all');
	let showCreateDialog = $state(false);
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

	let filteredWorkOrders = $derived(() => {
		let filtered = data.workOrders;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(wo) =>
					wo.title.toLowerCase().includes(query) ||
					wo.assetName?.toLowerCase().includes(query)
			);
		}

		if (selectedStatus !== 'all') {
			filtered = filtered.filter((wo) => wo.status === selectedStatus);
		}

		// Date filter (using createdAt)
		filtered = filtered.filter((wo) => filterByDateRange(wo.createdAt, dateFilter, customDateFrom, customDateTo));

		return filtered;
	});

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Completed: 'success',
			'In Progress': 'warning',
			Planned: 'default',
			Overdue: 'destructive'
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
</script>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Work Orders</h1>
			<p class="text-sm text-slate-600 sm:text-base">Manage maintenance work orders and tasks</p>
		</div>
		<Button class="w-full sm:w-auto" onclick={() => (showCreateDialog = true)}>
			<Plus class="mr-2 h-4 w-4" />
			New Work Order
		</Button>
	</div>

	<Card class="p-6">
		<div class="mb-6 grid gap-4 md:grid-cols-3">
			<div class="relative">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
				<Input bind:value={searchQuery} placeholder="Search work orders..." class="pl-9" />
			</div>

			<Select
				bind:value={selectedStatus}
				options={[
					{ value: 'all', label: 'All Status' },
					{ value: 'Planned', label: 'Planned' },
					{ value: 'In Progress', label: 'In Progress' },
					{ value: 'Completed', label: 'Completed' },
					{ value: 'Overdue', label: 'Overdue' }
				]}
			/>

			<!-- Date Filter -->
			<DateRangeFilter onFilterChange={handleDateFilterChange} defaultFilter="all_time" />
		</div>

		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b border-slate-200">
					<tr>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Title</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Asset</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Priority</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Status</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Assigned To</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Due Date</th>
						<th class="pb-3 text-left text-sm font-semibold text-slate-900">Cost</th>
						<th class="pb-3 text-right text-sm font-semibold text-slate-900">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredWorkOrders() as wo}
						<tr class="hover:bg-slate-50">
							<td class="py-4 text-sm font-medium text-slate-900">{wo.title}</td>
							<td class="py-4 text-sm text-slate-600">{wo.assetName}</td>
							<td class="py-4">
								<Badge variant={getPriorityVariant(wo.priority)}>{wo.priority}</Badge>
							</td>
							<td class="py-4">
								<Badge variant={getStatusVariant(wo.status)}>{wo.status}</Badge>
							</td>
							<td class="py-4 text-sm text-slate-600">{wo.assignedTo || '-'}</td>
							<td class="py-4 text-sm text-slate-600">{formatDate(wo.dueDate)}</td>
							<td class="py-4 text-sm text-slate-900">{formatCurrency(wo.cost)}</td>
							<td class="py-4 text-right">
								<a href="/maintenance/work-orders/{wo.id}">
									<Button variant="ghost" size="sm">
										<Eye class="h-4 w-4" />
									</Button>
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			{#if filteredWorkOrders().length === 0}
				<div class="py-12 text-center text-slate-500">No work orders found</div>
			{/if}
		</div>

		<div class="mt-4 text-sm text-slate-600">
			Showing {filteredWorkOrders().length} of {data.workOrders.length} work orders
		</div>
	</Card>
</div>

<WorkOrderFormDialog bind:open={showCreateDialog} />
