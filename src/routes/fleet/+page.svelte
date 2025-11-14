<script lang="ts">
	import { Card, Badge, Button, Input } from '$components/ui';
	import DateRangeFilter, { type DateFilterOption } from '$lib/components/ui/DateRangeFilter.svelte';
	import { filterByDateRange } from '$lib/core/utils/dateFilters';
	import { Truck, MapPin, Gauge, Plus, Pencil, Trash2, Search } from 'lucide-svelte';
	import { formatDate } from '$utils';
	import type { PageData } from './$types';
	import type { FleetVehicle } from '$types';
	import FleetFormDialog from '$lib/components/FleetFormDialog.svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let showFormDialog = $state(false);
	let selectedVehicle = $state<FleetVehicle | null>(null);
	let searchQuery = $state('');
	let statusFilter = $state('all');
	let typeFilter = $state('all');
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

	// Filtered vehicles
	let filteredVehicles = $derived.by(() => {
		let results = data.vehicles;

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			results = results.filter(
				(v) =>
					v.plateNumber.toLowerCase().includes(query) ||
					v.brand.toLowerCase().includes(query) ||
					v.model.toLowerCase().includes(query) ||
					v.type.toLowerCase().includes(query)
			);
		}

		// Status filter
		if (statusFilter !== 'all') {
			results = results.filter((v) => v.status === statusFilter);
		}

		// Type filter
		if (typeFilter !== 'all') {
			results = results.filter((v) => v.type === typeFilter);
		}

		// Date filter (using lastGpsTimestamp)
		results = results.filter((v) => filterByDateRange(v.lastGpsTimestamp, dateFilter, customDateFrom, customDateTo));

		return results;
	});

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Available: 'success',
			Active: 'default',
			'In Workshop': 'warning',
			'Out of Service': 'destructive'
		};
		return variants[status] || 'default';
	}

	function handleAddVehicle() {
		selectedVehicle = null;
		showFormDialog = true;
	}

	function handleEditVehicle(vehicle: FleetVehicle) {
		selectedVehicle = vehicle;
		showFormDialog = true;
	}

	async function handleDeleteVehicle(vehicle: FleetVehicle) {
		if (!confirm(`Are you sure you want to delete ${vehicle.plateNumber}?`)) {
			return;
		}

		try {
			const response = await fetch(`/api/fleet?id=${vehicle.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete vehicle');
			}

			toast.success('Vehicle deleted successfully');
			await invalidateAll();
		} catch (err) {
			toast.error('Failed to delete vehicle');
		}
	}

	function handleViewDetails(vehicleId: string) {
		window.location.href = `/fleet/${vehicleId}`;
	}

	function handleCloseDialog() {
		showFormDialog = false;
		selectedVehicle = null;
	}
</script>

<div class="space-y-4 sm:space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Fleet Management</h1>
			<p class="text-sm text-slate-600 sm:text-base">Track and manage your vehicle fleet</p>
		</div>
		<Button class="w-full sm:w-auto" onclick={handleAddVehicle}>
			<Plus class="mr-2 h-4 w-4" />
			Add Vehicle
		</Button>
	</div>

	<!-- Search and Filters -->
	<Card class="p-4">
		<div class="grid gap-4 md:grid-cols-4">
			<!-- Search -->
			<div class="relative">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
				<Input
					bind:value={searchQuery}
					placeholder="Search by plate, brand, model..."
					class="pl-10"
				/>
			</div>

			<!-- Status Filter -->
			<div>
				<select
					bind:value={statusFilter}
					class="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
				>
					<option value="all">All Statuses</option>
					<option value="Available">Available</option>
					<option value="Active">Active</option>
					<option value="In Workshop">In Workshop</option>
					<option value="Out of Service">Out of Service</option>
				</select>
			</div>

			<!-- Type Filter -->
			<div>
				<select
					bind:value={typeFilter}
					class="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
				>
					<option value="all">All Types</option>
					<option value="Truck">Truck</option>
					<option value="Van">Van</option>
					<option value="Car">Car</option>
					<option value="Pickup">Pickup</option>
				</select>
			</div>

			<!-- Date Filter -->
			<DateRangeFilter onFilterChange={handleDateFilterChange} defaultFilter="all_time" />
		</div>
	</Card>

	<!-- Results Summary -->
	<div class="text-sm text-slate-600">
		Showing {filteredVehicles.length} of {data.vehicles.length} vehicles
	</div>

	<!-- Vehicle Grid -->
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each filteredVehicles as vehicle}
			<Card class="p-6">
				<div class="mb-4 flex items-start justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-full bg-purple-100 p-3">
							<Truck class="h-6 w-6 text-purple-600" />
						</div>
						<div>
							<h3 class="font-semibold text-slate-900">{vehicle.plateNumber}</h3>
							<p class="text-sm text-slate-600">{vehicle.brand} {vehicle.model}</p>
						</div>
					</div>
					<Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status}</Badge>
				</div>

				<dl class="space-y-2">
					<div class="flex justify-between text-sm">
						<dt class="text-slate-600">Type</dt>
						<dd class="font-medium text-slate-900">{vehicle.type}</dd>
					</div>
					<div class="flex justify-between text-sm">
						<dt class="text-slate-600">Year</dt>
						<dd class="font-medium text-slate-900">{vehicle.year}</dd>
					</div>
					<div class="flex items-center justify-between text-sm">
						<dt class="flex items-center gap-1 text-slate-600">
							<Gauge class="h-4 w-4" />
							Odometer
						</dt>
						<dd class="font-medium text-slate-900">{vehicle.odometer.toLocaleString()} km</dd>
					</div>
					<div class="flex items-start justify-between text-sm">
						<dt class="flex items-center gap-1 text-slate-600">
							<MapPin class="h-4 w-4" />
							Location
						</dt>
						<dd class="text-right font-medium text-slate-900">
							{vehicle.lastKnownLocation.city || 'Unknown'}
						</dd>
					</div>
					<div class="flex justify-between text-sm">
						<dt class="text-slate-600">Last GPS Update</dt>
						<dd class="text-slate-600">{formatDate(vehicle.lastGpsTimestamp, 'MMM dd, HH:mm')}</dd>
					</div>
				</dl>

				<!-- Action Buttons -->
				<div class="mt-4 flex gap-2">
					<Button variant="outline" class="flex-1" onclick={() => handleViewDetails(vehicle.id)}>
						View Details
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onclick={() => handleEditVehicle(vehicle)}
						title="Edit vehicle"
					>
						<Pencil class="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onclick={() => handleDeleteVehicle(vehicle)}
						title="Delete vehicle"
						class="text-red-600 hover:bg-red-50 hover:text-red-700"
					>
						<Trash2 class="h-4 w-4" />
					</Button>
				</div>
			</Card>
		{/each}
	</div>

	<!-- Empty State -->
	{#if filteredVehicles.length === 0}
		<Card class="p-12">
			<div class="text-center">
				<Truck class="mx-auto h-12 w-12 text-slate-400" />
				<h3 class="mt-4 text-lg font-semibold text-slate-900">No vehicles found</h3>
				<p class="mt-2 text-slate-600">
					{searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
						? 'Try adjusting your filters'
						: 'Get started by adding your first vehicle'}
				</p>
				{#if !searchQuery && statusFilter === 'all' && typeFilter === 'all'}
					<Button onclick={handleAddVehicle} class="mt-4">
						<Plus class="mr-2 h-4 w-4" />
						Add Vehicle
					</Button>
				{/if}
			</div>
		</Card>
	{/if}
</div>

<!-- Fleet Form Dialog -->
<FleetFormDialog bind:open={showFormDialog} vehicle={selectedVehicle} onClose={handleCloseDialog} />
