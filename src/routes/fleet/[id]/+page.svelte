<script lang="ts">
	import { Card, Badge, Button, Input, Label } from '$components/ui';
	import {
		Truck,
		MapPin,
		Gauge,
		Calendar,
		FileText,
		ArrowLeft,
		Pencil,
		AlertTriangle,
		CheckCircle,
		Clock
	} from 'lucide-svelte';
	import { formatDate, formatCurrency } from '$utils';
	import type { PageData } from './$types';
	import FleetFormDialog from '$lib/components/FleetFormDialog.svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { differenceInDays, parseISO } from 'date-fns';

	let { data }: { data: PageData } = $props();

	let showEditDialog = $state(false);
	let activeTab = $state<'overview' | 'gps' | 'maintenance' | 'documents'>('overview');
	let showOdometerDialog = $state(false);
	let newOdometer = $state(data.vehicle.odometer);

	// Calculate expiry status
	function getExpiryStatus(expiryDate: string | undefined) {
		if (!expiryDate) return { status: 'unknown', days: 0, message: 'Not set' };

		const days = differenceInDays(parseISO(expiryDate), new Date());

		if (days < 0) {
			return { status: 'expired', days, message: `Expired ${Math.abs(days)} days ago` };
		} else if (days <= 30) {
			return { status: 'warning', days, message: `Expires in ${days} days` };
		} else {
			return { status: 'valid', days, message: `Valid for ${days} days` };
		}
	}

	let insuranceStatus = $derived(getExpiryStatus(data.vehicle.insuranceExpiry));
	let registrationStatus = $derived(getExpiryStatus(data.vehicle.registrationExpiry));

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Available: 'success',
			Active: 'default',
			'In Workshop': 'warning',
			'Out of Service': 'destructive'
		};
		return variants[status] || 'default';
	}

	function getWorkOrderStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Planned: 'secondary',
			'In Progress': 'default',
			Completed: 'success',
			Overdue: 'destructive',
			Cancelled: 'outline'
		};
		return variants[status] || 'default';
	}

	function handleEdit() {
		showEditDialog = true;
	}

	function handleBack() {
		window.location.href = '/fleet';
	}

	async function handleUpdateOdometer() {
		try {
			const response = await fetch('/api/fleet', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: data.vehicle.id,
					odometer: newOdometer
				})
			});

			if (!response.ok) {
				throw new Error('Failed to update odometer');
			}

			toast.success('Odometer updated successfully');
			showOdometerDialog = false;
			await invalidateAll();
		} catch (err) {
			toast.error('Failed to update odometer');
		}
	}

	function handleViewWorkOrder(workOrderId: string) {
		window.location.href = `/maintenance/${workOrderId}`;
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="icon" onclick={handleBack}>
				<ArrowLeft class="h-5 w-5" />
			</Button>
			<div>
				<div class="flex items-center gap-3">
					<h1 class="text-3xl font-bold text-slate-900">{data.vehicle.plateNumber}</h1>
					<Badge variant={getStatusVariant(data.vehicle.status)}>{data.vehicle.status}</Badge>
				</div>
				<p class="text-slate-600">
					{data.vehicle.brand}
					{data.vehicle.model} ({data.vehicle.year})
				</p>
			</div>
		</div>
		<Button onclick={handleEdit}>
			<Pencil class="mr-2 h-4 w-4" />
			Edit Vehicle
		</Button>
	</div>

	<!-- Status Alerts -->
	{#if insuranceStatus.status === 'expired' || registrationStatus.status === 'expired' || insuranceStatus.status === 'warning' || registrationStatus.status === 'warning'}
		<div class="space-y-2">
			{#if insuranceStatus.status === 'expired'}
				<div class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
					<AlertTriangle class="h-5 w-5 text-red-600" />
					<div class="flex-1">
						<p class="font-medium text-red-900">Insurance Expired</p>
						<p class="text-sm text-red-700">{insuranceStatus.message}</p>
					</div>
				</div>
			{:else if insuranceStatus.status === 'warning'}
				<div class="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
					<Clock class="h-5 w-5 text-yellow-600" />
					<div class="flex-1">
						<p class="font-medium text-yellow-900">Insurance Expiring Soon</p>
						<p class="text-sm text-yellow-700">{insuranceStatus.message}</p>
					</div>
				</div>
			{/if}

			{#if registrationStatus.status === 'expired'}
				<div class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
					<AlertTriangle class="h-5 w-5 text-red-600" />
					<div class="flex-1">
						<p class="font-medium text-red-900">Registration Expired</p>
						<p class="text-sm text-red-700">{registrationStatus.message}</p>
					</div>
				</div>
			{:else if registrationStatus.status === 'warning'}
				<div class="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
					<Clock class="h-5 w-5 text-yellow-600" />
					<div class="flex-1">
						<p class="font-medium text-yellow-900">Registration Expiring Soon</p>
						<p class="text-sm text-yellow-700">{registrationStatus.message}</p>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Tabs -->
	<div class="border-b border-slate-200">
		<nav class="-mb-px flex gap-6">
			<button
				onclick={() => (activeTab = 'overview')}
				class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'overview'
					? 'border-slate-900 text-slate-900'
					: 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'}"
			>
				Overview
			</button>
			<button
				onclick={() => (activeTab = 'gps')}
				class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'gps'
					? 'border-slate-900 text-slate-900'
					: 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'}"
			>
				GPS Tracking
			</button>
			<button
				onclick={() => (activeTab = 'maintenance')}
				class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab ===
				'maintenance'
					? 'border-slate-900 text-slate-900'
					: 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'}"
			>
				Maintenance History
			</button>
			<button
				onclick={() => (activeTab = 'documents')}
				class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'documents'
					? 'border-slate-900 text-slate-900'
					: 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'}"
			>
				Documents
			</button>
		</nav>
	</div>

	<!-- Tab Content -->
	{#if activeTab === 'overview'}
		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Vehicle Information -->
			<Card class="p-6">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
					<Truck class="h-5 w-5" />
					Vehicle Information
				</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Asset ID</dt>
						<dd class="text-sm font-medium text-slate-900">
							<a href="/assets/{data.vehicle.assetId}" class="text-blue-600 hover:underline">
								{data.vehicle.assetId}
							</a>
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Vehicle Type</dt>
						<dd class="text-sm font-medium text-slate-900">{data.vehicle.type}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Brand</dt>
						<dd class="text-sm font-medium text-slate-900">{data.vehicle.brand}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Model</dt>
						<dd class="text-sm font-medium text-slate-900">{data.vehicle.model}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Year</dt>
						<dd class="text-sm font-medium text-slate-900">{data.vehicle.year}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Fuel Type</dt>
						<dd class="text-sm font-medium text-slate-900">{data.vehicle.fuelType || 'N/A'}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">VIN Number</dt>
						<dd class="text-sm font-medium text-slate-900">{data.vehicle.vinNumber || 'N/A'}</dd>
					</div>
				</dl>
			</Card>

			<!-- Odometer -->
			<Card class="p-6">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="flex items-center gap-2 text-lg font-semibold text-slate-900">
						<Gauge class="h-5 w-5" />
						Odometer Reading
					</h3>
					<Button variant="outline" size="sm" onclick={() => (showOdometerDialog = true)}>
						Update
					</Button>
				</div>
				<div class="text-center">
					<p class="text-4xl font-bold text-slate-900">{data.vehicle.odometer.toLocaleString()}</p>
					<p class="mt-1 text-sm text-slate-600">kilometers</p>
				</div>
			</Card>

			<!-- Location -->
			<Card class="p-6">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
					<MapPin class="h-5 w-5" />
					Last Known Location
				</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">City</dt>
						<dd class="text-sm font-medium text-slate-900">
							{data.vehicle.lastKnownLocation.city || 'Unknown'}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Address</dt>
						<dd class="text-sm font-medium text-slate-900">
							{data.vehicle.lastKnownLocation.address || 'Unknown'}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Coordinates</dt>
						<dd class="text-sm font-medium text-slate-900">
							{data.vehicle.lastKnownLocation.lat.toFixed(6)}, {data.vehicle.lastKnownLocation.lng.toFixed(
								6
							)}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Last Update</dt>
						<dd class="text-sm font-medium text-slate-900">
							{formatDate(data.vehicle.lastGpsTimestamp, 'MMM dd, yyyy HH:mm')}
						</dd>
					</div>
				</dl>
			</Card>

			<!-- Linked Asset -->
			{#if data.asset}
				<Card class="p-6">
					<h3 class="mb-4 text-lg font-semibold text-slate-900">Linked Asset</h3>
					<dl class="space-y-3">
						<div class="flex justify-between">
							<dt class="text-sm text-slate-600">Asset Code</dt>
							<dd class="text-sm font-medium text-slate-900">{data.asset.code}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-slate-600">Asset Name</dt>
							<dd class="text-sm font-medium text-slate-900">{data.asset.name}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-slate-600">Category</dt>
							<dd class="text-sm font-medium text-slate-900">{data.asset.category}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-slate-600">Purchase Cost</dt>
							<dd class="text-sm font-medium text-slate-900">
								{formatCurrency(data.asset.purchaseCost)}
							</dd>
						</div>
					</dl>
					<Button
						variant="outline"
						class="mt-4 w-full"
						onclick={() => (window.location.href = `/assets/${data.asset.id}`)}
					>
						View Asset Details
					</Button>
				</Card>
			{/if}
		</div>
	{:else if activeTab === 'gps'}
		<Card class="p-6">
			<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
				<MapPin class="h-5 w-5" />
				GPS Tracking
			</h3>

			<!-- Map Placeholder -->
			<div class="mb-6 aspect-video overflow-hidden rounded-lg bg-slate-100">
				<div class="flex h-full items-center justify-center text-slate-400">
					<div class="text-center">
						<MapPin class="mx-auto mb-2 h-12 w-12" />
						<p class="text-sm">
							Map integration available with Google Maps or Mapbox API
						</p>
						<p class="mt-1 text-xs">
							Current Location: {data.vehicle.lastKnownLocation.lat.toFixed(6)}, {data.vehicle.lastKnownLocation.lng.toFixed(
								6
							)}
						</p>
					</div>
				</div>
			</div>

			<!-- Location Details -->
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<Label>City</Label>
					<Input value={data.vehicle.lastKnownLocation.city || 'Unknown'} readonly />
				</div>
				<div>
					<Label>Address</Label>
					<Input value={data.vehicle.lastKnownLocation.address || 'Unknown'} readonly />
				</div>
				<div>
					<Label>Latitude</Label>
					<Input value={data.vehicle.lastKnownLocation.lat} readonly />
				</div>
				<div>
					<Label>Longitude</Label>
					<Input value={data.vehicle.lastKnownLocation.lng} readonly />
				</div>
			</div>
		</Card>
	{:else if activeTab === 'maintenance'}
		<div class="space-y-4">
			<Card class="p-6">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
					<FileText class="h-5 w-5" />
					Maintenance History
				</h3>

				{#if data.workOrders && data.workOrders.length > 0}
					<div class="space-y-4">
						{#each data.workOrders as workOrder}
							<div class="flex items-start justify-between rounded-lg border border-slate-200 p-4">
								<div class="flex-1">
									<div class="mb-2 flex items-center gap-2">
										<h4 class="font-semibold text-slate-900">{workOrder.title}</h4>
										<Badge variant={getWorkOrderStatusVariant(workOrder.status)}>
											{workOrder.status}
										</Badge>
									</div>
									<p class="mb-2 text-sm text-slate-600">{workOrder.description}</p>
									<div class="flex flex-wrap gap-4 text-xs text-slate-500">
										<span class="flex items-center gap-1">
											<Calendar class="h-3 w-3" />
											Scheduled: {formatDate(workOrder.scheduledDate, 'MMM dd, yyyy')}
										</span>
										{#if workOrder.completedDate}
											<span class="flex items-center gap-1">
												<CheckCircle class="h-3 w-3" />
												Completed: {formatDate(workOrder.completedDate, 'MMM dd, yyyy')}
											</span>
										{/if}
										<span>Cost: {formatCurrency(workOrder.cost)}</span>
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									onclick={() => handleViewWorkOrder(workOrder.id)}
								>
									View Details
								</Button>
							</div>
						{/each}
					</div>
				{:else}
					<div class="py-12 text-center text-slate-500">
						<FileText class="mx-auto mb-2 h-12 w-12 text-slate-300" />
						<p>No maintenance history found</p>
					</div>
				{/if}
			</Card>
		</div>
	{:else if activeTab === 'documents'}
		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Insurance -->
			<Card class="p-6">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
					<FileText class="h-5 w-5" />
					Insurance
				</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Expiry Date</dt>
						<dd class="text-sm font-medium text-slate-900">
							{data.vehicle.insuranceExpiry
								? formatDate(data.vehicle.insuranceExpiry, 'MMM dd, yyyy')
								: 'Not set'}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Status</dt>
						<dd class="text-sm font-medium">
							{#if insuranceStatus.status === 'expired'}
								<span class="text-red-600">Expired</span>
							{:else if insuranceStatus.status === 'warning'}
								<span class="text-yellow-600">Expiring Soon</span>
							{:else if insuranceStatus.status === 'valid'}
								<span class="text-green-600">Valid</span>
							{:else}
								<span class="text-slate-600">Unknown</span>
							{/if}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Days Remaining</dt>
						<dd class="text-sm font-medium text-slate-900">
							{insuranceStatus.status !== 'unknown' ? insuranceStatus.days : 'N/A'}
						</dd>
					</div>
				</dl>
			</Card>

			<!-- Registration -->
			<Card class="p-6">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
					<FileText class="h-5 w-5" />
					Registration
				</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Expiry Date</dt>
						<dd class="text-sm font-medium text-slate-900">
							{data.vehicle.registrationExpiry
								? formatDate(data.vehicle.registrationExpiry, 'MMM dd, yyyy')
								: 'Not set'}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Status</dt>
						<dd class="text-sm font-medium">
							{#if registrationStatus.status === 'expired'}
								<span class="text-red-600">Expired</span>
							{:else if registrationStatus.status === 'warning'}
								<span class="text-yellow-600">Expiring Soon</span>
							{:else if registrationStatus.status === 'valid'}
								<span class="text-green-600">Valid</span>
							{:else}
								<span class="text-slate-600">Unknown</span>
							{/if}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Days Remaining</dt>
						<dd class="text-sm font-medium text-slate-900">
							{registrationStatus.status !== 'unknown' ? registrationStatus.days : 'N/A'}
						</dd>
					</div>
				</dl>
			</Card>
		</div>
	{/if}
</div>

<!-- Edit Dialog -->
<FleetFormDialog
	bind:open={showEditDialog}
	vehicle={data.vehicle}
	onClose={() => (showEditDialog = false)}
/>

<!-- Odometer Update Dialog -->
{#if showOdometerDialog}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<Card class="w-full max-w-md p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Update Odometer</h3>
			<div class="space-y-4">
				<div>
					<Label for="newOdometer">New Odometer Reading (km)</Label>
					<Input
						id="newOdometer"
						type="number"
						bind:value={newOdometer}
						min={data.vehicle.odometer}
					/>
					<p class="mt-1 text-xs text-slate-500">
						Current reading: {data.vehicle.odometer.toLocaleString()} km
					</p>
				</div>
				<div class="flex justify-end gap-2">
					<Button variant="outline" onclick={() => (showOdometerDialog = false)}>Cancel</Button>
					<Button onclick={handleUpdateOdometer}>Update</Button>
				</div>
			</div>
		</Card>
	</div>
{/if}
