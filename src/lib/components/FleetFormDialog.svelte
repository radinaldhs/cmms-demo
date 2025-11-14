<script lang="ts">
	import { Dialog, Button, Input, Label, Select, Textarea } from '$components/ui';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { FleetVehicle } from '$types';
	import { invalidateAll } from '$app/navigation';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		vehicle?: FleetVehicle | null;
	}

	let { open = $bindable(false), onClose, vehicle = null }: Props = $props();

	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});

	// Form state
	let formData = $state({
		assetId: vehicle?.assetId || '',
		plateNumber: vehicle?.plateNumber || '',
		type: vehicle?.type || 'Truck',
		brand: vehicle?.brand || '',
		model: vehicle?.model || '',
		year: vehicle?.year || new Date().getFullYear(),
		odometer: vehicle?.odometer || 0,
		status: vehicle?.status || 'Available',
		fuelType: vehicle?.fuelType || 'Diesel',
		vinNumber: vehicle?.vinNumber || '',
		insuranceExpiry: vehicle?.insuranceExpiry || '',
		registrationExpiry: vehicle?.registrationExpiry || '',
		lastKnownLocation: {
			lat: vehicle?.lastKnownLocation?.lat || -6.2088,
			lng: vehicle?.lastKnownLocation?.lng || 106.8456,
			address: vehicle?.lastKnownLocation?.address || '',
			city: vehicle?.lastKnownLocation?.city || ''
		}
	});

	// Reset form when vehicle changes
	$effect(() => {
		if (vehicle) {
			formData = {
				assetId: vehicle.assetId,
				plateNumber: vehicle.plateNumber,
				type: vehicle.type,
				brand: vehicle.brand,
				model: vehicle.model,
				year: vehicle.year,
				odometer: vehicle.odometer,
				status: vehicle.status,
				fuelType: vehicle.fuelType || 'Diesel',
				vinNumber: vehicle.vinNumber || '',
				insuranceExpiry: vehicle.insuranceExpiry || '',
				registrationExpiry: vehicle.registrationExpiry || '',
				lastKnownLocation: {
					lat: vehicle.lastKnownLocation.lat,
					lng: vehicle.lastKnownLocation.lng,
					address: vehicle.lastKnownLocation.address || '',
					city: vehicle.lastKnownLocation.city || ''
				}
			};
		} else {
			formData = {
				assetId: '',
				plateNumber: '',
				type: 'Truck',
				brand: '',
				model: '',
				year: new Date().getFullYear(),
				odometer: 0,
				status: 'Available',
				fuelType: 'Diesel',
				vinNumber: '',
				insuranceExpiry: '',
				registrationExpiry: '',
				lastKnownLocation: {
					lat: -6.2088,
					lng: 106.8456,
					address: '',
					city: ''
				}
			};
		}
		errors = {};
	});

	const vehicleSchema = z.object({
		assetId: z.string().min(1, 'Asset ID is required'),
		plateNumber: z.string().min(1, 'Plate number is required'),
		type: z.string().min(1, 'Vehicle type is required'),
		brand: z.string().min(1, 'Brand is required'),
		model: z.string().min(1, 'Model is required'),
		year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
		odometer: z.number().min(0, 'Odometer must be positive'),
		status: z.enum(['Available', 'In Workshop', 'Active', 'Out of Service']),
		fuelType: z.string().optional(),
		vinNumber: z.string().optional(),
		insuranceExpiry: z.string().optional(),
		registrationExpiry: z.string().optional(),
		lastKnownLocation: z.object({
			lat: z.number(),
			lng: z.number(),
			address: z.string().optional(),
			city: z.string().optional()
		})
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errors = {};
		isSubmitting = true;

		try {
			// Validate form data
			const validated = vehicleSchema.parse({
				...formData,
				year: Number(formData.year),
				odometer: Number(formData.odometer),
				lastKnownLocation: {
					lat: Number(formData.lastKnownLocation.lat),
					lng: Number(formData.lastKnownLocation.lng),
					address: formData.lastKnownLocation.address,
					city: formData.lastKnownLocation.city
				}
			});

			// Prepare data for API
			const payload = {
				...validated,
				lastGpsTimestamp: vehicle?.lastGpsTimestamp || new Date().toISOString()
			};

			// Call API
			if (vehicle) {
				// Update existing vehicle
				const response = await fetch('/api/fleet', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: vehicle.id, ...payload })
				});

				if (!response.ok) {
					throw new Error('Failed to update vehicle');
				}

				toast.success('Vehicle updated successfully');
			} else {
				// Create new vehicle
				const response = await fetch('/api/fleet', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});

				if (!response.ok) {
					throw new Error('Failed to create vehicle');
				}

				toast.success('Vehicle created successfully');
			}

			// Invalidate data and close dialog
			await invalidateAll();
			handleClose();
		} catch (err) {
			if (err instanceof z.ZodError) {
				// Handle validation errors
				const fieldErrors: Record<string, string> = {};
				err.issues.forEach((issue) => {
					if (issue.path[0]) {
						fieldErrors[issue.path[0].toString()] = issue.message;
					}
				});
				errors = fieldErrors;
				toast.error('Please fix the form errors');
			} else {
				toast.error(vehicle ? 'Failed to update vehicle' : 'Failed to create vehicle');
			}
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		open = false;
		onClose?.();
	}
</script>

<Dialog bind:open {onClose} title={vehicle ? 'Edit Vehicle' : 'Add New Vehicle'} class="max-w-3xl">
	<form onsubmit={handleSubmit} class="space-y-4">
		<div class="grid gap-4 md:grid-cols-2">
			<!-- Asset ID -->
			<div>
				<Label for="assetId">Asset ID *</Label>
				<Input
					id="assetId"
					bind:value={formData.assetId}
					placeholder="e.g., AST011"
					required
					class={errors.assetId ? 'border-red-500' : ''}
				/>
				{#if errors.assetId}
					<p class="mt-1 text-xs text-red-600">{errors.assetId}</p>
				{/if}
			</div>

			<!-- Plate Number -->
			<div>
				<Label for="plateNumber">Plate Number *</Label>
				<Input
					id="plateNumber"
					bind:value={formData.plateNumber}
					placeholder="e.g., B 1234 XYZ"
					required
					class={errors.plateNumber ? 'border-red-500' : ''}
				/>
				{#if errors.plateNumber}
					<p class="mt-1 text-xs text-red-600">{errors.plateNumber}</p>
				{/if}
			</div>

			<!-- Type -->
			<div>
				<Label for="type">Vehicle Type *</Label>
				<Select
					id="type"
					bind:value={formData.type}
					options={[
						{ value: 'Truck', label: 'Truck' },
						{ value: 'Van', label: 'Van' },
						{ value: 'Car', label: 'Car' },
						{ value: 'Pickup', label: 'Pickup' }
					]}
					required
				/>
			</div>

			<!-- Brand -->
			<div>
				<Label for="brand">Brand *</Label>
				<Input
					id="brand"
					bind:value={formData.brand}
					placeholder="e.g., Toyota"
					required
					class={errors.brand ? 'border-red-500' : ''}
				/>
				{#if errors.brand}
					<p class="mt-1 text-xs text-red-600">{errors.brand}</p>
				{/if}
			</div>

			<!-- Model -->
			<div>
				<Label for="model">Model *</Label>
				<Input
					id="model"
					bind:value={formData.model}
					placeholder="e.g., Hiace Commuter"
					required
					class={errors.model ? 'border-red-500' : ''}
				/>
				{#if errors.model}
					<p class="mt-1 text-xs text-red-600">{errors.model}</p>
				{/if}
			</div>

			<!-- Year -->
			<div>
				<Label for="year">Year *</Label>
				<Input
					id="year"
					type="number"
					bind:value={formData.year}
					min="1900"
					max={new Date().getFullYear() + 1}
					required
					class={errors.year ? 'border-red-500' : ''}
				/>
				{#if errors.year}
					<p class="mt-1 text-xs text-red-600">{errors.year}</p>
				{/if}
			</div>

			<!-- Odometer -->
			<div>
				<Label for="odometer">Odometer (km) *</Label>
				<Input
					id="odometer"
					type="number"
					bind:value={formData.odometer}
					min="0"
					required
					class={errors.odometer ? 'border-red-500' : ''}
				/>
				{#if errors.odometer}
					<p class="mt-1 text-xs text-red-600">{errors.odometer}</p>
				{/if}
			</div>

			<!-- Status -->
			<div>
				<Label for="status">Status *</Label>
				<Select
					id="status"
					bind:value={formData.status}
					options={[
						{ value: 'Available', label: 'Available' },
						{ value: 'Active', label: 'Active' },
						{ value: 'In Workshop', label: 'In Workshop' },
						{ value: 'Out of Service', label: 'Out of Service' }
					]}
					required
				/>
			</div>

			<!-- Fuel Type -->
			<div>
				<Label for="fuelType">Fuel Type</Label>
				<Select
					id="fuelType"
					bind:value={formData.fuelType}
					options={[
						{ value: 'Diesel', label: 'Diesel' },
						{ value: 'Gasoline', label: 'Gasoline' },
						{ value: 'Electric', label: 'Electric' },
						{ value: 'Hybrid', label: 'Hybrid' }
					]}
				/>
			</div>

			<!-- VIN Number -->
			<div>
				<Label for="vinNumber">VIN Number</Label>
				<Input id="vinNumber" bind:value={formData.vinNumber} placeholder="e.g., JAAGR56S900123456" />
			</div>

			<!-- Insurance Expiry -->
			<div>
				<Label for="insuranceExpiry">Insurance Expiry</Label>
				<Input id="insuranceExpiry" type="date" bind:value={formData.insuranceExpiry} />
			</div>

			<!-- Registration Expiry -->
			<div>
				<Label for="registrationExpiry">Registration Expiry</Label>
				<Input id="registrationExpiry" type="date" bind:value={formData.registrationExpiry} />
			</div>
		</div>

		<!-- Location Section -->
		<div class="rounded-lg border border-slate-200 p-4">
			<h3 class="mb-3 text-sm font-medium text-slate-900">Last Known Location</h3>
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<Label for="city">City</Label>
					<Input
						id="city"
						bind:value={formData.lastKnownLocation.city}
						placeholder="e.g., Jakarta"
					/>
				</div>
				<div>
					<Label for="address">Address</Label>
					<Input
						id="address"
						bind:value={formData.lastKnownLocation.address}
						placeholder="e.g., Jl. Sudirman No. 123"
					/>
				</div>
				<div>
					<Label for="lat">Latitude</Label>
					<Input
						id="lat"
						type="number"
						step="0.000001"
						bind:value={formData.lastKnownLocation.lat}
						placeholder="e.g., -6.2088"
					/>
				</div>
				<div>
					<Label for="lng">Longitude</Label>
					<Input
						id="lng"
						type="number"
						step="0.000001"
						bind:value={formData.lastKnownLocation.lng}
						placeholder="e.g., 106.8456"
					/>
				</div>
			</div>
		</div>

		<!-- Form Actions -->
		<div class="flex justify-end gap-2 pt-4">
			<Button type="button" variant="outline" onclick={handleClose} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Create Vehicle'}
			</Button>
		</div>
	</form>
</Dialog>
