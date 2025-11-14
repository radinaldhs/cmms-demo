<script lang="ts">
	import { Card, Badge, Button, Input, Select } from '$components/ui';
	import DateRangeFilter, { type DateFilterOption } from '$lib/components/ui/DateRangeFilter.svelte';
	import { filterByDateRange } from '$lib/core/utils/dateFilters';
	import { Plus, Calendar as CalendarIcon, Gauge, Edit, Search, List, CalendarDays } from 'lucide-svelte';
	import { formatDate } from '$utils';
	import MaintenancePlanFormDialog from '$lib/components/MaintenancePlanFormDialog.svelte';
	import type { PageData } from './$types';
	import type { MaintenancePlan } from '$types';

	// Event Calendar imports
	import { Calendar, DayGrid, TimeGrid, List as ListPlugin } from '@event-calendar/core';

	let { data }: { data: PageData } = $props();

	let showCreateDialog = $state(false);
	let showEditDialog = $state(false);
	let selectedPlan = $state<MaintenancePlan | null>(null);
	let searchQuery = $state('');
	let statusFilter = $state('all');
	let dateFilter = $state<DateFilterOption>('all_time');
	let customDateFrom = $state('');
	let customDateTo = $state('');
	let viewMode = $state<'calendar' | 'list'>('calendar');

	function handleDateFilterChange(filter: DateFilterOption, customFrom?: string, customTo?: string) {
		dateFilter = filter;
		if (filter === 'custom_range' && customFrom && customTo) {
			customDateFrom = customFrom;
			customDateTo = customTo;
		}
	}

	let filteredPlans = $derived(() => {
		let filtered = data.plans;

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.assetName?.toLowerCase().includes(query) ||
					p.taskDescription.toLowerCase().includes(query)
			);
		}

		// Status filter
		if (statusFilter === 'active') {
			filtered = filtered.filter((p) => p.isActive);
		} else if (statusFilter === 'inactive') {
			filtered = filtered.filter((p) => !p.isActive);
		}

		// Date filter (using nextDueDate)
		filtered = filtered.filter((p) => filterByDateRange(p.nextDueDate, dateFilter, customDateFrom, customDateTo));

		return filtered;
	});

	// Transform maintenance plans into calendar events
	let calendarEvents = $derived.by(() => {
		return filteredPlans().map((plan) => ({
			id: plan.id,
			title: plan.assetName || 'Maintenance',
			start: plan.nextDueDate,
			end: plan.nextDueDate,
			backgroundColor: plan.isActive ? '#3b82f6' : '#94a3b8',
			borderColor: plan.isActive ? '#2563eb' : '#64748b',
			extendedProps: {
				plan: plan
			}
		}));
	});

	// Calendar plugins and options
	let plugins = $state([DayGrid, TimeGrid, ListPlugin]);
	let options = $state({
		view: 'dayGridMonth',
		date: '2025-04-15', // Start at April 2025 where maintenance plans are
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'dayGridMonth,timeGridWeek,listWeek'
		},
		events: calendarEvents,
		eventClick: (info: any) => {
			const plan = info.event.extendedProps.plan;
			handleEdit(plan);
		},
		height: 'auto',
		selectable: true,
		eventColor: '#3b82f6'
	});

	// Update events when filtered plans change
	$effect(() => {
		options.events = calendarEvents;
	});

	function handleEdit(plan: MaintenancePlan) {
		selectedPlan = plan;
		showEditDialog = true;
	}

	function handleCloseEdit() {
		selectedPlan = null;
		showEditDialog = false;
	}

	function getTypeIcon(type: string) {
		return type === 'TIME_BASED' ? CalendarIcon : Gauge;
	}

	function getTypeLabel(type: string, intervalDays?: number, intervalMeter?: number) {
		if (type === 'TIME_BASED' && intervalDays) {
			return `Every ${intervalDays} days`;
		}
		if (type === 'METER_BASED' && intervalMeter) {
			return `Every ${intervalMeter.toLocaleString()} km`;
		}
		return type;
	}
</script>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Maintenance Plans</h1>
			<p class="text-sm text-slate-600 sm:text-base">Configure recurring maintenance schedules</p>
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
			<Button class="flex-1 sm:flex-none" onclick={() => (showCreateDialog = true)}>
				<Plus class="mr-2 h-4 w-4" />
				New Plan
			</Button>
		</div>
	</div>

	<!-- Filters -->
	<Card class="p-4">
		<div class="grid gap-4 md:grid-cols-3">
			<div class="relative">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
				<Input bind:value={searchQuery} placeholder="Search plans..." class="pl-9" />
			</div>

			<Select
				bind:value={statusFilter}
				options={[
					{ value: 'all', label: 'All Status' },
					{ value: 'active', label: 'Active' },
					{ value: 'inactive', label: 'Inactive' }
				]}
			/>

			<!-- Date Filter -->
			<DateRangeFilter onFilterChange={handleDateFilterChange} defaultFilter="all_time" />
		</div>
	</Card>

	<!-- Results Summary -->
	<div class="text-sm text-slate-600">
		Showing {filteredPlans().length} of {data.plans.length} maintenance {filteredPlans().length === 1 ? 'plan' : 'plans'}
	</div>

	{#if viewMode === 'calendar'}
		<!-- Calendar View -->
		<Card class="p-4">
			<Calendar {plugins} {options} />
		</Card>
	{:else}
		<!-- List View -->
		<div class="grid gap-4">
			{#each filteredPlans() as plan}
				<Card class="p-6">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="mb-2 flex items-center gap-3">
								<div class="rounded-full bg-blue-100 p-2">
									{#if plan.type === 'TIME_BASED'}
										<CalendarIcon class="h-5 w-5 text-blue-600" />
									{:else}
										<Gauge class="h-5 w-5 text-blue-600" />
									{/if}
								</div>
								<div>
									<h3 class="font-semibold text-slate-900">{plan.assetName}</h3>
									<p class="text-sm text-slate-600">
										{getTypeLabel(plan.type, plan.intervalDays, plan.intervalMeter)}
									</p>
								</div>
							</div>

							<p class="mb-3 text-sm text-slate-700">{plan.taskDescription}</p>

							<div class="flex items-center gap-4 text-sm">
								<div>
									<span class="text-slate-600">Next Due:</span>
									<span class="ml-2 font-medium text-slate-900">{formatDate(plan.nextDueDate)}</span>
								</div>
								<div>
									<Badge variant={plan.isActive ? 'success' : 'secondary'}>
										{plan.isActive ? 'Active' : 'Inactive'}
									</Badge>
								</div>
							</div>
						</div>

						<div class="flex gap-2">
							<Button variant="ghost" size="sm" onclick={() => handleEdit(plan)}>
								<Edit class="mr-1 h-3 w-3" />
								Edit
							</Button>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<MaintenancePlanFormDialog bind:open={showCreateDialog} />
<MaintenancePlanFormDialog bind:open={showEditDialog} plan={selectedPlan} onClose={handleCloseEdit} />
