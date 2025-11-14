<script lang="ts">
	import { Card, Button } from '$components/ui';
	import {
		FileText,
		BarChart3,
		Package,
		Truck,
		DollarSign,
		ChevronRight
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';

	const reportTypes = [
		{
			id: 'work-orders',
			title: 'Work Orders Report',
			description: 'View and analyze work orders by status, priority, and date range',
			icon: FileText,
			color: 'blue',
			path: '/reports/work-orders'
		},
		{
			id: 'assets',
			title: 'Asset Performance',
			description: 'Track asset depreciation, maintenance costs, and utilization rates',
			icon: BarChart3,
			color: 'green',
			path: '/reports/assets'
		},
		{
			id: 'inventory',
			title: 'Inventory Status',
			description: 'Monitor stock levels, reorder points, and inventory valuation',
			icon: Package,
			color: 'purple',
			path: '/reports/inventory'
		},
		{
			id: 'fleet',
			title: 'Fleet Tracking',
			description: 'Analyze fleet performance, odometer readings, and maintenance costs',
			icon: Truck,
			color: 'orange',
			path: '/reports/fleet'
		},
		{
			id: 'maintenance-costs',
			title: 'Maintenance Cost Analysis',
			description: 'Review maintenance costs by category, period, and cost breakdown',
			icon: DollarSign,
			color: 'red',
			path: '/reports/maintenance-costs'
		}
	];

	function getColorClasses(color: string) {
		const colors: Record<string, { bg: string; text: string }> = {
			blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
			green: { bg: 'bg-green-100', text: 'text-green-600' },
			purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
			orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
			red: { bg: 'bg-red-100', text: 'text-red-600' }
		};
		return colors[color] || colors.blue;
	}
</script>

<div class="space-y-4 sm:space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Reports & Analytics</h1>
		<p class="text-sm text-slate-600 sm:text-base">
			Generate comprehensive reports and analyze maintenance data across all modules
		</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each reportTypes as report}
			{@const colors = getColorClasses(report.color)}
			<button onclick={() => goto(report.path)} class="text-left">
				<Card class="group cursor-pointer transition-all hover:shadow-lg">
					<div class="p-6">
					<div class="flex items-start justify-between">
						<div class="rounded-full {colors.bg} p-3">
							<svelte:component this={report.icon} class="h-6 w-6 {colors.text}" />
						</div>
						<ChevronRight class="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
					</div>
					<h3 class="mt-4 text-lg font-semibold text-slate-900">{report.title}</h3>
					<p class="mt-2 text-sm text-slate-600">{report.description}</p>
					<Button variant="outline" size="sm" class="mt-4 w-full">
						View Report
					</Button>
					</div>
				</Card>
			</button>
		{/each}
	</div>

	<!-- Quick Stats -->
	<div class="grid gap-6 md:grid-cols-4">
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Total Reports</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">{reportTypes.length}</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Last Generated</p>
			<p class="mt-2 text-lg font-semibold text-slate-900">Today</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Export Formats</p>
			<p class="mt-2 text-lg font-semibold text-slate-900">CSV, PDF</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Data Sources</p>
			<p class="mt-2 text-lg font-semibold text-slate-900">All Modules</p>
		</Card>
	</div>

	<!-- Recent Reports Info -->
	<Card class="p-6">
		<h3 class="mb-4 text-lg font-semibold text-slate-900">Report Features</h3>
		<div class="grid gap-4 md:grid-cols-2">
			<div class="flex items-start gap-3">
				<div class="rounded-full bg-blue-50 p-2">
					<FileText class="h-4 w-4 text-blue-600" />
				</div>
				<div>
					<h4 class="text-sm font-medium text-slate-900">Advanced Filtering</h4>
					<p class="text-xs text-slate-600">Filter by date range, status, category, and more</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div class="rounded-full bg-green-50 p-2">
					<FileText class="h-4 w-4 text-green-600" />
				</div>
				<div>
					<h4 class="text-sm font-medium text-slate-900">Export Options</h4>
					<p class="text-xs text-slate-600">Download reports in CSV or PDF format</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div class="rounded-full bg-purple-50 p-2">
					<FileText class="h-4 w-4 text-purple-600" />
				</div>
				<div>
					<h4 class="text-sm font-medium text-slate-900">Real-time Data</h4>
					<p class="text-xs text-slate-600">Reports generated from live system data</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div class="rounded-full bg-orange-50 p-2">
					<FileText class="h-4 w-4 text-orange-600" />
				</div>
				<div>
					<h4 class="text-sm font-medium text-slate-900">Detailed Analytics</h4>
					<p class="text-xs text-slate-600">Comprehensive analysis with charts and summaries</p>
				</div>
			</div>
		</div>
	</Card>
</div>
