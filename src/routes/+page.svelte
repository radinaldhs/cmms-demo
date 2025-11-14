<script lang="ts">
	import { Card, Badge } from '$components/ui';
	import TrendIndicator from '$lib/components/ui/TrendIndicator.svelte';
	import CircularProgress from '$lib/components/ui/CircularProgress.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte';
	import LineChart from '$lib/components/charts/LineChart.svelte';
	import {
		Package,
		Truck,
		AlertCircle,
		CheckCircle,
		DollarSign,
		Clock,
		Activity,
		TrendingUp,
		Wrench,
		CalendarClock,
		MapPin,
		Target,
		Calendar,
		ChevronDown
	} from 'lucide-svelte';
	import { formatCurrency, formatDate } from '$utils';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Date filter state
	type DateFilterOption = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'last_month' | 'last_3_months' | 'last_6_months' | 'ytd' | 'custom_range' | 'all_time';

	const dateFilterOptions: { value: DateFilterOption; label: string }[] = [
		{ value: 'today', label: 'Today' },
		{ value: 'yesterday', label: 'Yesterday' },
		{ value: 'last_7_days', label: 'Last 7 Days' },
		{ value: 'last_30_days', label: 'Last 30 Days' },
		{ value: 'last_month', label: 'Last Month' },
		{ value: 'last_3_months', label: 'Last 3 Months' },
		{ value: 'last_6_months', label: 'Last 6 Months' },
		{ value: 'ytd', label: 'Year to Date' },
		{ value: 'custom_range', label: 'Custom Range' },
		{ value: 'all_time', label: 'All Time' }
	];

	let selectedFilter = $state<DateFilterOption>('last_30_days');
	let showFilterDropdown = $state(false);
	let customDateFrom = $state('');
	let customDateTo = $state('');
	let tempDateFrom = $state('');
	let tempDateTo = $state('');

	const selectedFilterLabel = $derived(() => {
		if (selectedFilter === 'custom_range' && customDateFrom && customDateTo) {
			return `${customDateFrom} to ${customDateTo}`;
		}
		return dateFilterOptions.find((opt) => opt.value === selectedFilter)?.label || 'Last 30 Days';
	});

	function selectFilter(value: DateFilterOption) {
		if (value !== 'custom_range') {
			selectedFilter = value;
			showFilterDropdown = false;
		} else {
			selectedFilter = value;
			// Don't close dropdown for custom range - show date inputs
		}
	}

	function applyCustomRange() {
		if (tempDateFrom && tempDateTo) {
			customDateFrom = tempDateFrom;
			customDateTo = tempDateTo;
			showFilterDropdown = false;
		}
	}

	function cancelCustomRange() {
		tempDateFrom = customDateFrom;
		tempDateTo = customDateTo;
		showFilterDropdown = false;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.date-filter-container')) {
			showFilterDropdown = false;
		}
	}

	$effect(() => {
		if (showFilterDropdown) {
			document.addEventListener('click', handleClickOutside);
		} else {
			document.removeEventListener('click', handleClickOutside);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	// Chart data configurations
	const workOrdersChartData = {
		labels: data.workOrdersByStatus.map((item) => item.status),
		datasets: [{
			label: 'Work Orders',
			data: data.workOrdersByStatus.map((item) => item.count),
			backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444']
		}]
	};

	const costsChartData = {
		labels: data.costByCategory.map((item) => item.category),
		datasets: [{
			label: 'Maintenance Cost',
			data: data.costByCategory.map((item) => item.cost),
			backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1']
		}]
	};

	const costTrendsChartData = {
		labels: data.costTrends.map((item) => item.month),
		datasets: [{
			label: 'Maintenance Cost',
			data: data.costTrends.map((item) => item.cost),
			borderColor: '#3b82f6',
			backgroundColor: 'rgba(59, 130, 246, 0.1)',
			fill: true,
			tension: 0.4
		}]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: { legend: { display: false } }
	};

	const doughnutOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: { legend: { position: 'bottom' as const } }
	};

	const lineChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: {
				callbacks: {
					label: (context: any) => formatCurrency(context.parsed.y)
				}
			}
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					callback: (value: any) => formatCurrency(value)
				}
			}
		}
	};

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = { Completed: 'success', 'In Progress': 'warning', Planned: 'default', Overdue: 'destructive' };
		return variants[status] || 'default';
	}

	function getPriorityVariant(priority: string) {
		const variants: Record<string, any> = { Critical: 'destructive', High: 'warning', Medium: 'default', Low: 'secondary' };
		return variants[priority] || 'default';
	}
</script>

<div class="space-y-6">
	<!-- Header with Title and Filters -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold text-slate-900">Dashboard</h1>
			<p class="mt-1 text-sm text-slate-600">Real-time overview of your maintenance operations</p>
		</div>
		<div class="flex items-center gap-3">
			<!-- Date Filter Dropdown -->
			<div class="relative date-filter-container">
				<button
					onclick={() => (showFilterDropdown = !showFilterDropdown)}
					class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<Calendar class="h-4 w-4 text-slate-500" />
					<span>{selectedFilterLabel()}</span>
					<span class="transition-transform" class:rotate-180={showFilterDropdown}>
						<ChevronDown class="h-4 w-4 text-slate-400" />
					</span>
				</button>

				{#if showFilterDropdown}
					<div class="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
						<div class="p-2">
							<div class="mb-2 px-2 py-1 text-xs font-semibold text-slate-500 uppercase">Quick Filters</div>
							{#each dateFilterOptions as option}
								<button
									onclick={() => selectFilter(option.value)}
									class="w-full rounded px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100"
									class:bg-blue-50={selectedFilter === option.value && option.value !== 'custom_range'}
									class:text-blue-700={selectedFilter === option.value && option.value !== 'custom_range'}
									class:font-medium={selectedFilter === option.value}
								>
									{option.label}
									{#if selectedFilter === option.value && option.value !== 'custom_range'}
										<CheckCircle class="float-right h-4 w-4 text-blue-600" />
									{/if}
								</button>
							{/each}

							<!-- Custom Range Date Inputs -->
							{#if selectedFilter === 'custom_range'}
								<div class="mt-3 border-t border-slate-200 pt-3 px-2">
									<div class="mb-3">
										<label class="mb-1 block text-xs font-medium text-slate-700">From Date</label>
										<input
											type="date"
											bind:value={tempDateFrom}
											class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div class="mb-3">
										<label class="mb-1 block text-xs font-medium text-slate-700">To Date</label>
										<input
											type="date"
											bind:value={tempDateTo}
											class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div class="flex gap-2">
										<button
											onclick={applyCustomRange}
											disabled={!tempDateFrom || !tempDateTo}
											class="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
										>
											Apply
										</button>
										<button
											onclick={cancelCustomRange}
											class="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
										>
											Cancel
										</button>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>

			<!-- Live Data Indicator -->
			<div class="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
				<Activity class="h-4 w-4 text-blue-600 animate-pulse" />
				<span class="text-sm font-medium text-blue-900">Live</span>
			</div>
		</div>
	</div>

	<!-- Filter Applied Banner (Mock) -->
	{#if selectedFilter !== 'all_time'}
		<div class="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
			<div class="flex items-center gap-2">
				<Calendar class="h-4 w-4 text-blue-600" />
				<span class="text-sm text-blue-900">
					Showing data for: <strong>{selectedFilterLabel()}</strong>
					{#if selectedFilter === 'custom_range' && (!customDateFrom || !customDateTo)}
						<span class="ml-1 text-xs text-orange-600">(Please select dates)</span>
					{/if}
				</span>
			</div>
			<button
				onclick={() => selectFilter('all_time')}
				class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
			>
				Clear Filter
			</button>
		</div>
	{/if}

	<!-- Enhanced KPI Cards with Trends -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
		<Card class="p-6 transition-all hover:shadow-lg">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-slate-600">Total Assets</p>
					<p class="mt-2 text-3xl font-bold text-slate-900">{data.metrics.totalAssets}</p>
					<div class="mt-2">
						<Badge variant="secondary" class="text-xs">Active</Badge>
					</div>
				</div>
				<div class="rounded-full bg-blue-100 p-3">
					<Package class="h-6 w-6 text-blue-600" />
				</div>
			</div>
		</Card>

		<Card class="p-6 transition-all hover:shadow-lg">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-slate-600">Fleet Vehicles</p>
					<p class="mt-2 text-3xl font-bold text-slate-900">{data.metrics.totalFleetVehicles}</p>
					<div class="mt-2">
						<Badge variant="secondary" class="text-xs">Tracked</Badge>
					</div>
				</div>
				<div class="rounded-full bg-purple-100 p-3">
					<Truck class="h-6 w-6 text-purple-600" />
				</div>
			</div>
		</Card>

		<Card class="p-6 transition-all hover:shadow-lg">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-slate-600">Open Work Orders</p>
					<p class="mt-2 text-3xl font-bold text-slate-900">{data.metrics.openWorkOrders}</p>
					<div class="mt-2">
						<TrendIndicator value={data.trends.openWorkOrdersTrend} />
					</div>
				</div>
				<div class="rounded-full bg-yellow-100 p-3">
					<Wrench class="h-6 w-6 text-yellow-600" />
				</div>
			</div>
		</Card>

		<Card class="p-6 transition-all hover:shadow-lg">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-slate-600">Overdue Tasks</p>
					<p class="mt-2 text-3xl font-bold text-red-600">{data.metrics.overdueWorkOrders}</p>
					<div class="mt-2">
						<TrendIndicator value={data.trends.overdueTrend} />
					</div>
				</div>
				<div class="rounded-full bg-red-100 p-3">
					<AlertCircle class="h-6 w-6 text-red-600" />
				</div>
			</div>
		</Card>

		<Card class="p-6 transition-all hover:shadow-lg">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-slate-600">Cost This Month</p>
					<p class="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(data.metrics.maintenanceCostCurrentMonth)}</p>
					<div class="mt-2">
						<TrendIndicator value={data.trends.costTrend} />
					</div>
				</div>
				<div class="rounded-full bg-green-100 p-3">
					<DollarSign class="h-6 w-6 text-green-600" />
				</div>
			</div>
		</Card>
	</div>

	<!-- Performance Metrics Row -->
	<div class="grid gap-6 lg:grid-cols-4">
		<Card class="p-6">
			<div class="flex flex-col items-center">
				<CircularProgress value={data.metrics.completionRate} max={100} color="#10b981" label="Completion" />
				<p class="mt-4 text-center text-sm font-medium text-slate-700">Work Order Completion Rate</p>
			</div>
		</Card>

		<Card class="p-6">
			<div class="flex flex-col items-center">
				<CircularProgress value={data.metrics.assetUtilization} max={100} color="#3b82f6" label="Utilization" />
				<p class="mt-4 text-center text-sm font-medium text-slate-700">Asset Utilization</p>
			</div>
		</Card>

		<Card class="p-6">
			<div class="flex items-center justify-between">
				<div>
					<div class="rounded-full bg-blue-100 p-3">
						<Clock class="h-8 w-8 text-blue-600" />
					</div>
				</div>
				<div class="text-right">
					<p class="text-3xl font-bold text-slate-900">{data.metrics.averageCompletionTime.toFixed(1)}</p>
					<p class="mt-1 text-sm text-slate-600">days avg</p>
				</div>
			</div>
			<p class="mt-4 text-sm font-medium text-slate-700">Avg. Completion Time</p>
		</Card>

		<Card class="p-6">
			<div class="flex items-center justify-between">
				<div>
					<div class="rounded-full bg-orange-100 p-3">
						<Target class="h-8 w-8 text-orange-600" />
					</div>
				</div>
				<div class="text-right">
					<p class="text-3xl font-bold text-slate-900">{data.metrics.assetsInMaintenance}</p>
					<p class="mt-1 text-sm text-slate-600">assets</p>
				</div>
			</div>
			<p class="mt-4 text-sm font-medium text-slate-700">Currently in Maintenance</p>
		</Card>
	</div>

	<!-- Charts Row -->
	<div class="grid gap-6 lg:grid-cols-3">
		<Card class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-900">Work Orders by Status</h3>
				<TrendingUp class="h-5 w-5 text-blue-600" />
			</div>
			<div class="h-64"><BarChart data={workOrdersChartData} options={chartOptions} /></div>
		</Card>

		<Card class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-900">Maintenance Cost by Category</h3>
				<DollarSign class="h-5 w-5 text-green-600" />
			</div>
			<div class="h-64"><DoughnutChart data={costsChartData} options={doughnutOptions} /></div>
		</Card>

		<Card class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-900">Cost Trends (6 Months)</h3>
				<Activity class="h-5 w-5 text-purple-600" />
			</div>
			<div class="h-64"><LineChart data={costTrendsChartData} options={lineChartOptions} /></div>
		</Card>
	</div>

	<!-- Activity Feed and Upcoming Maintenance -->
	<div class="grid gap-6 lg:grid-cols-2">
		<Card class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Activity class="h-5 w-5 text-blue-600" />
					<h3 class="text-lg font-semibold text-slate-900">Recent Activity</h3>
				</div>
				<span class="text-xs text-slate-500">Live Feed</span>
			</div>
			<div class="space-y-3 max-h-80 overflow-y-auto">
				{#each data.recentActivities as activity}
					<div class="flex items-start gap-3 border-l-2 border-slate-200 pl-4 pb-3">
						<div class="mt-1 rounded-full bg-{activity.color}-100 p-1.5">
							{#if activity.icon === 'check'}
								<CheckCircle class="h-4 w-4 text-{activity.color}-600" />
							{:else if activity.icon === 'wrench'}
								<Wrench class="h-4 w-4 text-{activity.color}-600" />
							{:else}
								<Package class="h-4 w-4 text-{activity.color}-600" />
							{/if}
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium text-slate-900">{activity.title}</p>
							<p class="text-xs text-slate-600">{activity.description}</p>
							<p class="mt-1 text-xs text-slate-500">{formatDate(activity.timestamp)}</p>
						</div>
					</div>
				{/each}
			</div>
		</Card>

		<Card class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<CalendarClock class="h-5 w-5 text-orange-600" />
					<h3 class="text-lg font-semibold text-slate-900">Upcoming Maintenance</h3>
				</div>
				<a href="/maintenance/work-orders" class="text-sm text-blue-600 hover:text-blue-800">View all</a>
			</div>
			<div class="space-y-3">
				{#if data.upcomingMaintenance.length > 0}
					{#each data.upcomingMaintenance as wo}
						<div class="flex items-start justify-between rounded-lg bg-orange-50 p-3 border border-orange-200">
							<div class="flex-1">
								<a href="/maintenance/work-orders/{wo.id}" class="font-medium text-slate-900 hover:text-blue-600">{wo.title}</a>
								<p class="text-sm text-slate-600">{wo.assetName}</p>
								<p class="mt-1 text-xs text-orange-600 font-medium">Due: {formatDate(wo.dueDate)}</p>
							</div>
							<Badge variant={getPriorityVariant(wo.priority)}>{wo.priority}</Badge>
						</div>
					{/each}
				{:else}
					<div class="flex items-center gap-2 text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
						<CheckCircle class="h-4 w-4 text-green-600" />
						<span>No upcoming maintenance in the next 30 days</span>
					</div>
				{/if}
			</div>
		</Card>
	</div>

	<!-- Recent Work Orders and Low Stock -->
	<div class="grid gap-6 lg:grid-cols-2">
		<Card class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-900">Recent Work Orders</h3>
				<a href="/maintenance/work-orders" class="text-sm text-blue-600 hover:text-blue-800">View all</a>
			</div>
			<div class="space-y-3">
				{#each data.recentWorkOrders as wo}
					<div class="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0">
						<div class="flex-1">
							<a href="/maintenance/work-orders/{wo.id}" class="font-medium text-slate-900 hover:text-blue-600">{wo.title}</a>
							<p class="text-sm text-slate-600">{wo.assetName}</p>
							<p class="text-xs text-slate-500">{formatDate(wo.createdAt)}</p>
						</div>
						<div class="flex flex-col items-end gap-1">
							<Badge variant={getStatusVariant(wo.status)}>{wo.status}</Badge>
							<Badge variant={getPriorityVariant(wo.priority)}>{wo.priority}</Badge>
						</div>
					</div>
				{/each}
			</div>
		</Card>

		<Card class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-900">Low Stock Alerts</h3>
				<a href="/inventory" class="text-sm text-blue-600 hover:text-blue-800">View all</a>
			</div>
			<div class="space-y-3">
				{#each data.lowStockItems as item}
					<div class="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
						<div class="flex-1">
							<p class="font-medium text-slate-900">{item.description}</p>
							<p class="text-sm text-slate-600">{item.code}</p>
						</div>
						<div class="text-right">
							<p class="text-sm font-medium text-red-600">{item.currentStock} / {item.minStock}</p>
							<p class="text-xs text-slate-500">{item.unit}</p>
						</div>
					</div>
				{/each}
				{#if data.lowStockItems.length === 0}
					<div class="flex items-center gap-2 text-sm text-slate-500">
						<CheckCircle class="h-4 w-4 text-green-600" />
						<span>All items are adequately stocked</span>
					</div>
				{/if}
			</div>
		</Card>
	</div>

	<!-- Fleet Location Preview -->
	{#if data.fleetLocations.length > 0}
		<Card class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<MapPin class="h-5 w-5 text-purple-600" />
					<h3 class="text-lg font-semibold text-slate-900">Fleet Locations</h3>
				</div>
				<a href="/fleet" class="text-sm text-blue-600 hover:text-blue-800">View map</a>
			</div>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each data.fleetLocations.slice(0, 4) as vehicle}
					<div class="rounded-lg border border-slate-200 p-4">
						<div class="flex items-center justify-between mb-2">
							<span class="font-medium text-slate-900">{vehicle.plateNumber}</span>
							<Badge variant={vehicle.status === 'Available' ? 'success' : 'secondary'} class="text-xs">{vehicle.status}</Badge>
						</div>
						<p class="text-sm text-slate-600">{vehicle.type}</p>
						{#if vehicle.location.city}
							<p class="mt-2 text-xs text-slate-500 flex items-center gap-1">
								<MapPin class="h-3 w-3" />
								{vehicle.location.city}
							</p>
						{/if}
					</div>
				{/each}
			</div>
		</Card>
	{/if}
</div>
