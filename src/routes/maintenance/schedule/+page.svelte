<script lang="ts">
	import { Card, Badge, Button } from '$components/ui';
	import { Calendar as CalendarIcon, CalendarDays, List } from 'lucide-svelte';
	import { formatDate } from '$utils';
	import { workOrders } from '$stores';

	// Event Calendar imports
	import { Calendar, DayGrid, TimeGrid, List as ListPlugin } from '@event-calendar/core';

	const allWorkOrders = workOrders.getAll();

	let viewMode = $state<'calendar' | 'list'>('calendar');

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

	function getStatusColor(status: string) {
		const colors: Record<string, { bg: string; border: string }> = {
			Completed: { bg: '#10b981', border: '#059669' },
			'In Progress': { bg: '#f59e0b', border: '#d97706' },
			Planned: { bg: '#3b82f6', border: '#2563eb' },
			Overdue: { bg: '#ef4444', border: '#dc2626' }
		};
		return colors[status] || { bg: '#6b7280', border: '#4b5563' };
	}

	// Transform work orders into calendar events
	const calendarEvents = allWorkOrders.map((wo) => {
		const statusColor = getStatusColor(wo.status);
		return {
			id: wo.id,
			title: `${wo.title} - ${wo.assetName}`,
			start: wo.scheduledDate,
			end: wo.scheduledDate,
			backgroundColor: statusColor.bg,
			borderColor: statusColor.border,
			extendedProps: {
				workOrder: wo,
				priority: wo.priority,
				assignedTo: wo.assignedTo
			}
		};
	});

	// Calendar plugins and options
	let plugins = $state([DayGrid, TimeGrid, ListPlugin]);
	let options = $state({
		view: 'dayGridMonth',
		date: '2025-02-15', // Start at February 2025 where most work orders are
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'dayGridMonth,timeGridWeek,listWeek'
		},
		events: calendarEvents,
		eventClick: (info: any) => {
			const wo = info.event.extendedProps.workOrder;
			// You can add navigation or modal here if needed
			console.log('Work Order clicked:', wo);
		},
		height: 'auto',
		selectable: true
	});
</script>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Maintenance Schedule</h1>
			<p class="text-sm text-slate-600 sm:text-base">Calendar view of maintenance activities</p>
		</div>
		<div class="flex gap-2 w-full sm:w-auto">
			<div class="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
				<Button
					variant={viewMode === 'calendar' ? 'default' : 'ghost'}
					size="sm"
					class="h-8"
					onclick={() => (viewMode = 'calendar')}
				>
					<CalendarDays class="h-4 w-4 mr-1" />
					Calendar
				</Button>
				<Button
					variant={viewMode === 'list' ? 'default' : 'ghost'}
					size="sm"
					class="h-8"
					onclick={() => (viewMode = 'list')}
				>
					<List class="h-4 w-4 mr-1" />
					List
				</Button>
			</div>
		</div>
	</div>

	<!-- Summary Stats -->
	<div class="flex items-center gap-2">
		<CalendarIcon class="h-5 w-5 text-slate-400" />
		<span class="text-sm text-slate-600">
			{allWorkOrders.length} scheduled {allWorkOrders.length === 1 ? 'task' : 'tasks'}
		</span>
	</div>

	{#if viewMode === 'calendar'}
		<!-- Calendar View -->
		<Card class="p-4">
			{#if allWorkOrders.length > 0}
				<Calendar {plugins} {options} />
			{:else}
				<div class="p-12 text-center">
					<CalendarIcon class="mx-auto mb-4 h-12 w-12 text-slate-400" />
					<p class="text-slate-500">No scheduled maintenance found</p>
				</div>
			{/if}
		</Card>
	{:else}
		<!-- List View -->
		{#if months.length > 0}
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
		{:else}
			<Card class="p-12 text-center">
				<CalendarIcon class="mx-auto mb-4 h-12 w-12 text-slate-400" />
				<p class="text-slate-500">No scheduled maintenance found</p>
			</Card>
		{/if}
	{/if}
</div>
