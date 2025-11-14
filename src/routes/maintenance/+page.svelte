<script lang="ts">
	import { Card, Button } from '$components/ui';
	import { Calendar, ClipboardList, Settings, Plus } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-4 sm:space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Maintenance</h1>
		<p class="text-sm text-slate-600 sm:text-base">Manage maintenance schedules and work orders</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<Card class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<div class="rounded-full bg-blue-100 p-3">
					<ClipboardList class="h-8 w-8 text-blue-600" />
				</div>
			</div>
			<h3 class="mb-2 text-lg font-semibold text-slate-900">Work Orders</h3>
			<p class="mb-4 text-sm text-slate-600">
				View and manage maintenance work orders and tasks
			</p>
			<Button onclick={() => goto('/maintenance/work-orders')} class="w-full">
				View Work Orders
			</Button>
		</Card>

		<Card class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<div class="rounded-full bg-green-100 p-3">
					<Calendar class="h-8 w-8 text-green-600" />
				</div>
			</div>
			<h3 class="mb-2 text-lg font-semibold text-slate-900">Schedule</h3>
			<p class="mb-4 text-sm text-slate-600">
				View maintenance calendar and upcoming tasks
			</p>
			<Button onclick={() => goto('/maintenance/schedule')} variant="outline" class="w-full">
				View Schedule
			</Button>
		</Card>

		<Card class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<div class="rounded-full bg-purple-100 p-3">
					<Settings class="h-8 w-8 text-purple-600" />
				</div>
			</div>
			<h3 class="mb-2 text-lg font-semibold text-slate-900">Maintenance Plans</h3>
			<p class="mb-4 text-sm text-slate-600">
				Configure recurring maintenance schedules
			</p>
			<Button onclick={() => goto('/maintenance/plans')} variant="outline" class="w-full">
				View Plans
			</Button>
		</Card>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h3>
			<div class="space-y-3">
				<Button onclick={() => goto('/maintenance/work-orders')} class="w-full justify-start">
					<Plus class="mr-2 h-4 w-4" />
					Create Work Order
				</Button>
				<Button
					onclick={() => goto('/maintenance/schedule')}
					variant="outline"
					class="w-full justify-start"
				>
					<Calendar class="mr-2 h-4 w-4" />
					Schedule Maintenance
				</Button>
			</div>
		</Card>

		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Maintenance Overview</h3>
			<dl class="space-y-3">
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">Total Work Orders</dt>
					<dd class="text-sm font-medium text-slate-900">{data.metrics.total}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">Planned</dt>
					<dd class="text-sm font-medium text-blue-600">{data.metrics.planned}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">In Progress</dt>
					<dd class="text-sm font-medium text-yellow-600">{data.metrics.inProgress}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">Overdue</dt>
					<dd class="text-sm font-medium text-red-600">{data.metrics.overdue}</dd>
				</div>
			</dl>
		</Card>
	</div>
</div>
