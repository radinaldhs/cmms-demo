<script lang="ts">
	import { Dialog, Button, Input, Label, Select, Textarea } from '$components/ui';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { MaintenancePlan } from '$types';
	import { invalidateAll } from '$app/navigation';
	import { assets, fleet } from '$stores';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		plan?: MaintenancePlan | null;
	}

	let { open = $bindable(false), onClose, plan = null }: Props = $props();

	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});

	// Get all assets and fleet for dropdown
	const allAssets = assets.getAll();
	const allFleet = fleet.getAll();
	const assetOptions = [
		...allAssets.map((asset) => ({
			value: asset.id,
			label: `${asset.name} (${asset.code})`
		})),
		...allFleet.map((vehicle) => ({
			value: vehicle.id,
			label: `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})`
		}))
	];

	// Form state
	let formData = $state({
		assetId: plan?.assetId || '',
		type: plan?.type || 'TIME_BASED',
		intervalDays: plan?.intervalDays || 30,
		intervalMeter: plan?.intervalMeter || 10000,
		taskDescription: plan?.taskDescription || '',
		isActive: plan?.isActive !== undefined ? (plan.isActive ? 'true' : 'false') : 'true',
		estimatedDuration: plan?.estimatedDuration || 1,
		nextDueDate: plan?.nextDueDate || new Date().toISOString().split('T')[0]
	});

	// Reset form when plan changes
	$effect(() => {
		if (plan) {
			formData = {
				assetId: plan.assetId,
				type: plan.type,
				intervalDays: plan.intervalDays || 30,
				intervalMeter: plan.intervalMeter || 10000,
				taskDescription: plan.taskDescription,
				isActive: plan.isActive ? 'true' : 'false',
				estimatedDuration: plan.estimatedDuration || 1,
				nextDueDate: plan.nextDueDate
			};
		} else {
			formData = {
				assetId: '',
				type: 'TIME_BASED',
				intervalDays: 30,
				intervalMeter: 10000,
				taskDescription: '',
				isActive: 'true',
				estimatedDuration: 1,
				nextDueDate: new Date().toISOString().split('T')[0]
			};
		}
		errors = {};
	});

	const planSchema = z.object({
		assetId: z.string().min(1, 'Asset is required'),
		type: z.enum(['TIME_BASED', 'METER_BASED']),
		intervalDays: z.number().optional(),
		intervalMeter: z.number().optional(),
		taskDescription: z.string().min(1, 'Task description is required'),
		isActive: z.boolean(),
		estimatedDuration: z.number().min(0, 'Duration must be positive'),
		nextDueDate: z.string().min(1, 'Next due date is required')
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errors = {};
		isSubmitting = true;

		try {
			// Validate form data
			const validated = planSchema.parse({
				...formData,
				intervalDays: formData.type === 'TIME_BASED' ? Number(formData.intervalDays) : undefined,
				intervalMeter: formData.type === 'METER_BASED' ? Number(formData.intervalMeter) : undefined,
				estimatedDuration: Number(formData.estimatedDuration),
				isActive: formData.isActive === 'true'
			});

			// Get asset name for denormalization
			const selectedAsset = allAssets.find((a) => a.id === validated.assetId);
			const selectedVehicle = allFleet.find((v) => v.id === validated.assetId);
			const assetName =
				selectedAsset?.name ||
				(selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : '');

			// Prepare data for API
			const payload = {
				...validated,
				assetName,
				requiredParts: []
			};

			// Call API
			if (plan) {
				// Update existing plan
				const response = await fetch('/api/maintenance/plans', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: plan.id, ...payload })
				});

				if (!response.ok) {
					throw new Error('Failed to update maintenance plan');
				}

				toast.success('Maintenance plan updated successfully');
			} else {
				// Create new plan
				const response = await fetch('/api/maintenance/plans', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});

				if (!response.ok) {
					throw new Error('Failed to create maintenance plan');
				}

				toast.success('Maintenance plan created successfully');
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
				toast.error(plan ? 'Failed to update maintenance plan' : 'Failed to create maintenance plan');
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

<Dialog
	bind:open
	{onClose}
	title={plan ? 'Edit Maintenance Plan' : 'Create Maintenance Plan'}
	class="max-w-2xl"
>
	<form onsubmit={handleSubmit} class="space-y-4">
		<div class="grid gap-4 md:grid-cols-2">
			<!-- Asset -->
			<div class="md:col-span-2">
				<Label for="assetId">Asset/Vehicle *</Label>
				<Select
					id="assetId"
					bind:value={formData.assetId}
					options={assetOptions}
					required
					class={errors.assetId ? 'border-red-500' : ''}
				/>
				{#if errors.assetId}
					<p class="mt-1 text-xs text-red-600">{errors.assetId}</p>
				{/if}
			</div>

			<!-- Type -->
			<div>
				<Label for="type">Maintenance Type *</Label>
				<Select
					id="type"
					bind:value={formData.type}
					options={[
						{ value: 'TIME_BASED', label: 'Time-Based (Days)' },
						{ value: 'METER_BASED', label: 'Meter-Based (KM)' }
					]}
					required
				/>
			</div>

			<!-- Status -->
			<div>
				<Label for="isActive">Status *</Label>
				<Select
					id="isActive"
					bind:value={formData.isActive}
					options={[
						{ value: 'true', label: 'Active' },
						{ value: 'false', label: 'Inactive' }
					]}
					required
				/>
			</div>

			<!-- Interval Days (TIME_BASED) -->
			{#if formData.type === 'TIME_BASED'}
				<div>
					<Label for="intervalDays">Interval (Days) *</Label>
					<Input
						id="intervalDays"
						type="number"
						bind:value={formData.intervalDays}
						min="1"
						placeholder="30"
						required
						class={errors.intervalDays ? 'border-red-500' : ''}
					/>
					{#if errors.intervalDays}
						<p class="mt-1 text-xs text-red-600">{errors.intervalDays}</p>
					{/if}
				</div>
			{/if}

			<!-- Interval Meter (METER_BASED) -->
			{#if formData.type === 'METER_BASED'}
				<div>
					<Label for="intervalMeter">Interval (KM) *</Label>
					<Input
						id="intervalMeter"
						type="number"
						bind:value={formData.intervalMeter}
						min="1"
						placeholder="10000"
						required
						class={errors.intervalMeter ? 'border-red-500' : ''}
					/>
					{#if errors.intervalMeter}
						<p class="mt-1 text-xs text-red-600">{errors.intervalMeter}</p>
					{/if}
				</div>
			{/if}

			<!-- Estimated Duration -->
			<div>
				<Label for="estimatedDuration">Estimated Duration (Hours)</Label>
				<Input
					id="estimatedDuration"
					type="number"
					bind:value={formData.estimatedDuration}
					min="0"
					step="0.5"
					placeholder="1"
					class={errors.estimatedDuration ? 'border-red-500' : ''}
				/>
				{#if errors.estimatedDuration}
					<p class="mt-1 text-xs text-red-600">{errors.estimatedDuration}</p>
				{/if}
			</div>

			<!-- Next Due Date -->
			<div>
				<Label for="nextDueDate">Next Due Date *</Label>
				<Input
					id="nextDueDate"
					type="date"
					bind:value={formData.nextDueDate}
					required
					class={errors.nextDueDate ? 'border-red-500' : ''}
				/>
				{#if errors.nextDueDate}
					<p class="mt-1 text-xs text-red-600">{errors.nextDueDate}</p>
				{/if}
			</div>

			<!-- Task Description -->
			<div class="md:col-span-2">
				<Label for="taskDescription">Task Description *</Label>
				<Textarea
					id="taskDescription"
					bind:value={formData.taskDescription}
					placeholder="Describe the maintenance tasks to be performed..."
					rows={4}
					required
					class={errors.taskDescription ? 'border-red-500' : ''}
				/>
				{#if errors.taskDescription}
					<p class="mt-1 text-xs text-red-600">{errors.taskDescription}</p>
				{/if}
			</div>
		</div>

		<!-- Form Actions -->
		<div class="flex justify-end gap-2 pt-4">
			<Button type="button" variant="outline" onclick={handleClose} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
			</Button>
		</div>
	</form>
</Dialog>
