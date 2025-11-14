<script lang="ts">
	import { Dialog, Button, Input, Label, Select, Textarea } from '$components/ui';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { SparePart, InventoryMovementType } from '$types';
	import { invalidateAll } from '$app/navigation';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		part: SparePart | null;
	}

	let { open = $bindable(false), onClose, part = null }: Props = $props();

	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});

	// Form state
	let formData = $state({
		type: 'IN' as InventoryMovementType,
		quantity: 0,
		performedBy: 'Warehouse Manager',
		notes: ''
	});

	// Reset form when dialog opens
	$effect(() => {
		if (open) {
			formData = {
				type: 'IN' as InventoryMovementType,
				quantity: 0,
				performedBy: 'Warehouse Manager',
				notes: ''
			};
			errors = {};
		}
	});

	const movementSchema = z.object({
		type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
		quantity: z.number().positive('Quantity must be greater than 0'),
		performedBy: z.string().min(1, 'Performed by is required'),
		notes: z.string().optional()
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!part) return;

		errors = {};
		isSubmitting = true;

		try {
			// Validate form data
			const validated = movementSchema.parse({
				...formData,
				quantity: Number(formData.quantity)
			});

			// Check if OUT operation will result in negative stock
			if (validated.type === 'OUT' && validated.quantity > part.currentStock) {
				errors.quantity = `Cannot remove ${validated.quantity} ${part.unit}. Only ${part.currentStock} ${part.unit} available.`;
				toast.error('Insufficient stock');
				isSubmitting = false;
				return;
			}

			// Prepare movement data
			const movement = {
				partId: part.id,
				partCode: part.code,
				partName: part.description,
				type: validated.type,
				quantity: validated.quantity,
				unitCost: part.unitCost,
				totalCost: part.unitCost * validated.quantity,
				warehouse: part.warehouse,
				performedBy: validated.performedBy,
				notes: validated.notes
			};

			// Call API
			const response = await fetch('/api/inventory', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'movement', movement })
			});

			if (!response.ok) {
				throw new Error('Failed to record stock movement');
			}

			const movementType = validated.type === 'IN' ? 'added to' : validated.type === 'OUT' ? 'removed from' : 'adjusted for';
			toast.success(`${validated.quantity} ${part.unit} ${movementType} stock`);

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
				toast.error('Failed to record stock movement');
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

<Dialog bind:open {onClose} title="Adjust Stock" class="max-w-md">
	{#if part}
		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="rounded-lg bg-slate-50 p-4">
				<h4 class="font-medium text-slate-900">{part.description}</h4>
				<p class="text-sm text-slate-600">Code: {part.code}</p>
				<p class="mt-2 text-sm">
					Current Stock: <span class="font-medium text-slate-900">{part.currentStock} {part.unit}</span>
				</p>
			</div>

			<!-- Movement Type -->
			<div>
				<Label for="type">Movement Type *</Label>
				<Select
					id="type"
					bind:value={formData.type}
					options={[
						{ value: 'IN', label: 'Stock In (Receive)' },
						{ value: 'OUT', label: 'Stock Out (Issue)' },
						{ value: 'ADJUSTMENT', label: 'Adjustment' }
					]}
					required
				/>
			</div>

			<!-- Quantity -->
			<div>
				<Label for="quantity">Quantity ({part.unit}) *</Label>
				<Input
					id="quantity"
					type="number"
					bind:value={formData.quantity}
					min="0"
					step="1"
					required
					class={errors.quantity ? 'border-red-500' : ''}
				/>
				{#if errors.quantity}
					<p class="mt-1 text-xs text-red-600">{errors.quantity}</p>
				{/if}
			</div>

			<!-- Performed By -->
			<div>
				<Label for="performedBy">Performed By *</Label>
				<Input
					id="performedBy"
					bind:value={formData.performedBy}
					placeholder="e.g., John Smith"
					required
					class={errors.performedBy ? 'border-red-500' : ''}
				/>
				{#if errors.performedBy}
					<p class="mt-1 text-xs text-red-600">{errors.performedBy}</p>
				{/if}
			</div>

			<!-- Notes -->
			<div>
				<Label for="notes">Notes</Label>
				<Textarea
					id="notes"
					bind:value={formData.notes}
					placeholder="Enter any additional notes..."
					rows={3}
				/>
			</div>

			<!-- Form Actions -->
			<div class="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onclick={handleClose} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Processing...' : 'Record Movement'}
				</Button>
			</div>
		</form>
	{/if}
</Dialog>
