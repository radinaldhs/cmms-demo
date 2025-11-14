<script lang="ts">
	import { Card, Button, Input, Badge } from '$components/ui';
	import { ArrowLeft, Download, Search } from 'lucide-svelte';
	import { formatCurrency, formatDate, exportToCSV } from '$utils';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedStatus = $state<string>('all');

	const filteredData = $derived(
		data.data.filter((item: any) => {
			const matchesSearch = searchQuery
				? item.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.type.toLowerCase().includes(searchQuery.toLowerCase())
				: true;

			const matchesStatus = selectedStatus === 'all' ? true : item.status === selectedStatus;

			return matchesSearch && matchesStatus;
		})
	);

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Available: 'success',
			Active: 'default',
			'In Workshop': 'warning',
			'Out of Service': 'destructive'
		};
		return variants[status] || 'default';
	}

	function exportReport() {
		const csvData = filteredData.map((vehicle: any) => ({
			'Plate Number': vehicle.plateNumber,
			Type: vehicle.type,
			Brand: vehicle.brand,
			Model: vehicle.model,
			Status: vehicle.status,
			Odometer: vehicle.odometer,
			'Avg Monthly Mileage': vehicle.avgMonthlyMileage.toFixed(0),
			'Last Location': vehicle.lastLocation,
			'Last GPS Update': vehicle.lastGpsTimestamp,
			'Maintenance Count': vehicle.maintenanceCount,
			'Total Maintenance Cost': vehicle.maintenanceCostTotal,
			'Cost per KM': vehicle.costPerKm.toFixed(4),
			'Fuel Type': vehicle.fuelType || 'N/A',
			'Insurance Expiry': vehicle.insuranceExpiry || 'N/A'
		}));

		exportToCSV(csvData, `fleet-tracking-report-${new Date().toISOString().split('T')[0]}.csv`);
		toast.success('Report exported successfully');
	}
</script>

<div class="space-y-6">
	<div>
		<a
			href="/reports"
			class="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
		>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Reports
		</a>
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold text-slate-900">Fleet Tracking Report</h1>
				<p class="text-slate-600">
					Analyze fleet performance, odometer readings, and maintenance costs
				</p>
			</div>
			<Button onclick={exportReport}>
				<Download class="mr-2 h-4 w-4" />
				Export CSV
			</Button>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-4">
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Total Vehicles</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">{data.summary.totalRecords}</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Total Odometer</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">
				{Math.round(data.summary.additionalMetrics?.totalOdometer || 0).toLocaleString()} km
			</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Active Vehicles</p>
			<p class="mt-2 text-3xl font-bold text-green-600">
				{data.summary.additionalMetrics?.activeCount || 0}
			</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">In Maintenance</p>
			<p class="mt-2 text-3xl font-bold text-orange-600">
				{data.summary.additionalMetrics?.maintenanceCount || 0}
			</p>
		</Card>
	</div>

	<Card class="p-6">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-semibold text-slate-900">Filter by Status</h3>
			<div class="flex gap-2">
				<button type="button" onclick={() => (selectedStatus = 'all')}>
					<Badge
						variant={selectedStatus === 'all' ? 'default' : 'outline'}
						class="cursor-pointer"
					>
						All
					</Badge>
				</button>
				<button type="button" onclick={() => (selectedStatus = 'Active')}>
					<Badge
						variant={selectedStatus === 'Active' ? 'default' : 'outline'}
						class="cursor-pointer"
					>
						Active
					</Badge>
				</button>
				<button type="button" onclick={() => (selectedStatus = 'Available')}>
					<Badge
						variant={selectedStatus === 'Available' ? 'success' : 'outline'}
						class="cursor-pointer"
					>
						Available
					</Badge>
				</button>
				<button type="button" onclick={() => (selectedStatus = 'In Workshop')}>
					<Badge
						variant={selectedStatus === 'In Workshop' ? 'warning' : 'outline'}
						class="cursor-pointer"
					>
						In Workshop
					</Badge>
				</button>
				<button type="button" onclick={() => (selectedStatus = 'Out of Service')}>
					<Badge
						variant={selectedStatus === 'Out of Service' ? 'destructive' : 'outline'}
						class="cursor-pointer"
					>
						Out of Service
					</Badge>
				</button>
			</div>
		</div>
	</Card>

	<Card class="p-4">
		<div class="relative">
			<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
			<Input
				type="text"
				placeholder="Search by plate number, brand, model, or type..."
				bind:value={searchQuery}
				class="pl-10"
			/>
		</div>
	</Card>

	<Card class="overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b border-slate-200 bg-slate-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Plate</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Vehicle</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Status</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">Odometer</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Location</th>
						<th class="px-6 py-3 text-center text-xs font-medium uppercase text-slate-600">Maint.</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">Cost/km</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Insurance</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredData as vehicle}
						<tr class="hover:bg-slate-50">
							<td class="px-6 py-4 text-sm font-medium text-slate-900">{vehicle.plateNumber}</td>
							<td class="px-6 py-4 text-sm text-slate-900">
								<a href="/fleet/{vehicle.vehicleId}" class="font-medium text-blue-600 hover:underline">
									{vehicle.brand} {vehicle.model}
								</a>
								<div class="text-xs text-slate-500">{vehicle.type}</div>
							</td>
							<td class="px-6 py-4 text-sm">
								<Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status}</Badge>
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium text-slate-900">
								{vehicle.odometer.toLocaleString()} km
								<div class="text-xs text-slate-500">
									~{Math.round(vehicle.avgMonthlyMileage)}/mo
								</div>
							</td>
							<td class="px-6 py-4 text-sm text-slate-600">
								<div class="max-w-xs truncate">{vehicle.lastLocation}</div>
								<div class="text-xs text-slate-500">{formatDate(vehicle.lastGpsTimestamp)}</div>
							</td>
							<td class="px-6 py-4 text-center text-sm text-slate-600">
								{vehicle.maintenanceCount}
								<div class="text-xs text-slate-500">
									{formatCurrency(vehicle.maintenanceCostTotal)}
								</div>
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium text-slate-900">
								{formatCurrency(vehicle.costPerKm)}
							</td>
							<td class="px-6 py-4 text-sm text-slate-600">
								{#if vehicle.insuranceExpiry}
									{formatDate(vehicle.insuranceExpiry)}
								{:else}
									<span class="text-slate-400">N/A</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if filteredData.length === 0}
				<div class="py-12 text-center text-slate-500">No vehicles found matching your criteria</div>
			{/if}
		</div>
	</Card>

	<div class="text-center text-sm text-slate-600">
		Showing {filteredData.length} of {data.data.length} vehicles
	</div>
</div>
