<script lang="ts">
	import { Card, Badge } from '$components/ui';
	import { Calendar } from 'lucide-svelte';
	import { formatDate } from '$utils';
	import { workOrders } from '$stores';

	const allWorkOrders = workOrders.getAll();

	// Group work orders by month
	const workOrdersByMonth = allWorkOrders.reduce(
		(acc, wo) => {
			const date = new Date(wo.scheduledDate);
			const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

			if (!acc[monthKey]) {
				acc[monthKey] = [];
			}
			acc[monthKey].push(wo);
			return acc;
		},
		{} as Record<string, typeof allWorkOrders>
	);

	const months = Object.keys(workOrdersByMonth).sort().reverse();

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
			<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Maintenance Schedule</h1>
			<p class="text-sm text-slate-600 sm:text-base">Calendar view of maintenance activities</p>
		</div>
		<div class="flex items-center gap-2">
			<Calendar class="h-5 w-5 text-slate-400" />
			<span class="text-sm text-slate-600">{months.length} months with activities</span>
		</div>
	</div>

	{#each months as month}
		{@const monthDate = new Date(month + '-01')}
		{@const monthName = monthDate.toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric'
		})}

		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">{monthName}</h3>

			<div class="space-y-3">
				{#each workOrdersByMonth[month] as wo}
					<div class="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0">
						<div class="flex-1">
							<p class="font-medium text-slate-900">{wo.title}</p>
							<p class="text-sm text-slate-600">{wo.assetName}</p>
							<div class="mt-1 flex items-center gap-2">
								<span class="text-xs text-slate-500">
									Scheduled: {formatDate(wo.scheduledDate)}
								</span>
								{#if wo.assignedTo}
									<span class="text-xs text-slate-500">• Assigned to: {wo.assignedTo}</span>
								{/if}
							</div>
						</div>
						<div class="flex flex-col items-end gap-1">
							<Badge variant={getStatusVariant(wo.status)}>{wo.status}</Badge>
							<Badge variant={getPriorityVariant(wo.priority)}>{wo.priority}</Badge>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-4 text-sm text-slate-600">
				{workOrdersByMonth[month].length} scheduled maintenance
				{workOrdersByMonth[month].length === 1 ? 'task' : 'tasks'}
			</div>
		</Card>
	{/each}

	{#if months.length === 0}
		<Card class="p-12 text-center">
			<Calendar class="mx-auto mb-4 h-12 w-12 text-slate-400" />
			<p class="text-slate-500">No scheduled maintenance found</p>
		</Card>
	{/if}
</div>
