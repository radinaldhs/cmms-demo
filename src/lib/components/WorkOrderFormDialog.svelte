<script lang="ts">
	import { Dialog, Button, Input, Label, Select, Textarea } from '$components/ui';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { WorkOrder } from '$types';
	import { invalidateAll } from '$app/navigation';
	import { assets } from '$stores';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		workOrder?: WorkOrder | null;
	}

	let { open = $bindable(false), onClose, workOrder = null }: Props = $props();

	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});

	// Get all assets for dropdown
	const allAssets = assets.getAll();
	const assetOptions = allAssets.map((asset) => ({
		value: asset.id,
		label: `${asset.name} (${asset.code})`
	}));

	// Form state
	let formData = $state({
		assetId: workOrder?.assetId || '',
		title: workOrder?.title || '',
		description: workOrder?.description || '',
		priority: workOrder?.priority || 'Medium',
		status: workOrder?.status || 'Planned',
		requestedBy: workOrder?.requestedBy || '',
		assignedTo: workOrder?.assignedTo || '',
		scheduledDate: workOrder?.scheduledDate || new Date().toISOString().split('T')[0],
		dueDate: workOrder?.dueDate || new Date().toISOString().split('T')[0],
		laborHours: workOrder?.laborHours || 0,
		notes: workOrder?.notes || ''
	});

	// Reset form when work order changes
	$effect(() => {
		if (workOrder) {
			formData = {
				assetId: workOrder.assetId,
				title: workOrder.title,
				description: workOrder.description,
				priority: workOrder.priority,
				status: workOrder.status,
				requestedBy: workOrder.requestedBy,
				assignedTo: workOrder.assignedTo || '',
				scheduledDate: workOrder.scheduledDate,
				dueDate: workOrder.dueDate,
				laborHours: workOrder.laborHours || 0,
				notes: workOrder.notes || ''
			};
		} else {
			formData = {
				assetId: '',
				title: '',
				description: '',
				priority: 'Medium',
				status: 'Planned',
				requestedBy: '',
				assignedTo: '',
				scheduledDate: new Date().toISOString().split('T')[0],
				dueDate: new Date().toISOString().split('T')[0],
				laborHours: 0,
				notes: ''
			};
		}
		errors = {};
	});

	const workOrderSchema = z.object({
		assetId: z.string().min(1, 'Asset is required'),
		title: z.string().min(1, 'Title is required'),
		description: z.string().min(1, 'Description is required'),
		priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
		status: z.enum(['Planned', 'In Progress', 'Completed', 'Overdue', 'Cancelled']),
		requestedBy: z.string().min(1, 'Requested by is required'),
		assignedTo: z.string().optional(),
		scheduledDate: z.string().min(1, 'Scheduled date is required'),
		dueDate: z.string().min(1, 'Due date is required'),
		laborHours: z.number().min(0, 'Labor hours must be positive'),
		notes: z.string().optional()
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errors = {};
		isSubmitting = true;

		try {
			// Validate form data
			const validated = workOrderSchema.parse({
				...formData,
				laborHours: Number(formData.laborHours)
			});

			// Get asset name for denormalization
			const selectedAsset = allAssets.find((a) => a.id === validated.assetId);
			const assetName = selectedAsset?.name || '';

			// Prepare data for API
			const payload = {
				...validated,
				assetName,
				cost: 0,
				sparePartsUsed: []
			};

			// Call API
			if (workOrder) {
				// Update existing work order
				const response = await fetch('/api/work-orders', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: workOrder.id, ...payload })
				});

				if (!response.ok) {
					throw new Error('Failed to update work order');
				}

				toast.success('Work order updated successfully');
			} else {
				// Create new work order
				const response = await fetch('/api/work-orders', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});

				if (!response.ok) {
					throw new Error('Failed to create work order');
				}

				toast.success('Work order created successfully');
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
				toast.error(workOrder ? 'Failed to update work order' : 'Failed to create work order');
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
	title={workOrder ? 'Edit Work Order' : 'Create Work Order'}
	class="max-w-2xl"
>
	<form onsubmit={handleSubmit} class="space-y-4">
		<div class="grid gap-4 md:grid-cols-2">
			<!-- Asset -->
			<div class="md:col-span-2">
				<Label for="assetId">Asset *</Label>
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

			<!-- Title -->
			<div class="md:col-span-2">
				<Label for="title">Title *</Label>
				<Input
					id="title"
					bind:value={formData.title}
					placeholder="e.g., Quarterly pump maintenance"
					required
					class={errors.title ? 'border-red-500' : ''}
				/>
				{#if errors.title}
					<p class="mt-1 text-xs text-red-600">{errors.title}</p>
				{/if}
			</div>

			<!-- Description -->
			<div class="md:col-span-2">
				<Label for="description">Description *</Label>
				<Textarea
					id="description"
					bind:value={formData.description}
					placeholder="Describe the maintenance work to be performed..."
					rows={3}
					required
					class={errors.description ? 'border-red-500' : ''}
				/>
				{#if errors.description}
					<p class="mt-1 text-xs text-red-600">{errors.description}</p>
				{/if}
			</div>

			<!-- Priority -->
			<div>
				<Label for="priority">Priority *</Label>
				<Select
					id="priority"
					bind:value={formData.priority}
					options={[
						{ value: 'Low', label: 'Low' },
						{ value: 'Medium', label: 'Medium' },
						{ value: 'High', label: 'High' },
						{ value: 'Critical', label: 'Critical' }
					]}
					required
				/>
			</div>

			<!-- Status -->
			<div>
				<Label for="status">Status *</Label>
				<Select
					id="status"
					bind:value={formData.status}
					options={[
						{ value: 'Planned', label: 'Planned' },
						{ value: 'In Progress', label: 'In Progress' },
						{ value: 'Completed', label: 'Completed' },
						{ value: 'Cancelled', label: 'Cancelled' }
					]}
					required
				/>
			</div>

			<!-- Requested By -->
			<div>
				<Label for="requestedBy">Requested By *</Label>
				<Input
					id="requestedBy"
					bind:value={formData.requestedBy}
					placeholder="e.g., John Smith"
					required
					class={errors.requestedBy ? 'border-red-500' : ''}
				/>
				{#if errors.requestedBy}
					<p class="mt-1 text-xs text-red-600">{errors.requestedBy}</p>
				{/if}
			</div>

			<!-- Assigned To -->
			<div>
				<Label for="assignedTo">Assigned To</Label>
				<Input
					id="assignedTo"
					bind:value={formData.assignedTo}
					placeholder="e.g., Mike Johnson"
				/>
			</div>

			<!-- Scheduled Date -->
			<div>
				<Label for="scheduledDate">Scheduled Date *</Label>
				<Input
					id="scheduledDate"
					type="date"
					bind:value={formData.scheduledDate}
					required
					class={errors.scheduledDate ? 'border-red-500' : ''}
				/>
				{#if errors.scheduledDate}
					<p class="mt-1 text-xs text-red-600">{errors.scheduledDate}</p>
				{/if}
			</div>

			<!-- Due Date -->
			<div>
				<Label for="dueDate">Due Date *</Label>
				<Input
					id="dueDate"
					type="date"
					bind:value={formData.dueDate}
					required
					class={errors.dueDate ? 'border-red-500' : ''}
				/>
				{#if errors.dueDate}
					<p class="mt-1 text-xs text-red-600">{errors.dueDate}</p>
				{/if}
			</div>

			<!-- Labor Hours -->
			<div>
				<Label for="laborHours">Estimated Labor Hours</Label>
				<Input
					id="laborHours"
					type="number"
					bind:value={formData.laborHours}
					min="0"
					step="0.5"
					placeholder="0"
					class={errors.laborHours ? 'border-red-500' : ''}
				/>
				{#if errors.laborHours}
					<p class="mt-1 text-xs text-red-600">{errors.laborHours}</p>
				{/if}
			</div>
		</div>

		<!-- Notes -->
		<div>
			<Label for="notes">Notes</Label>
			<Textarea
				id="notes"
				bind:value={formData.notes}
				placeholder="Additional notes or instructions..."
				rows={3}
			/>
		</div>

		<!-- Form Actions -->
		<div class="flex justify-end gap-2 pt-4">
			<Button type="button" variant="outline" onclick={handleClose} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? 'Saving...' : workOrder ? 'Update Work Order' : 'Create Work Order'}
			</Button>
		</div>
	</form>
</Dialog>
