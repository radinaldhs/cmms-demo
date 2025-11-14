<script lang="ts">
	import { Dialog, Button, Input, Label, Select, Textarea } from '$components/ui';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { SparePart } from '$types';
	import { invalidateAll } from '$app/navigation';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		part?: SparePart | null;
		categories: string[];
		warehouses: string[];
	}

	let { open = $bindable(false), onClose, part = null, categories, warehouses }: Props = $props();

	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});

	// Form state
	let formData = $state({
		code: part?.code || '',
		description: part?.description || '',
		category: part?.category || '',
		unit: part?.unit || 'pcs',
		currentStock: part?.currentStock || 0,
		minStock: part?.minStock || 0,
		maxStock: part?.maxStock || 0,
		warehouse: part?.warehouse || 'Main Warehouse',
		unitCost: part?.unitCost || 0,
		sapItemCode: part?.sapItemCode || '',
		supplier: part?.supplier || '',
		leadTimeDays: part?.leadTimeDays || 7
	});

	// Reset form when part changes
	$effect(() => {
		if (part) {
			formData = {
				code: part.code,
				description: part.description,
				category: part.category,
				unit: part.unit,
				currentStock: part.currentStock,
				minStock: part.minStock,
				maxStock: part.maxStock || 0,
				warehouse: part.warehouse,
				unitCost: part.unitCost,
				sapItemCode: part.sapItemCode || '',
				supplier: part.supplier || '',
				leadTimeDays: part.leadTimeDays || 7
			};
		} else {
			formData = {
				code: '',
				description: '',
				category: '',
				unit: 'pcs',
				currentStock: 0,
				minStock: 0,
				maxStock: 0,
				warehouse: 'Main Warehouse',
				unitCost: 0,
				sapItemCode: '',
				supplier: '',
				leadTimeDays: 7
			};
		}
		errors = {};
	});

	const sparePartSchema = z.object({
		code: z.string().min(1, 'Code is required'),
		description: z.string().min(1, 'Description is required'),
		category: z.string().min(1, 'Category is required'),
		unit: z.string().min(1, 'Unit is required'),
		currentStock: z.number().min(0, 'Stock cannot be negative'),
		minStock: z.number().min(0, 'Min stock cannot be negative'),
		maxStock: z.number().min(0, 'Max stock cannot be negative'),
		warehouse: z.string().min(1, 'Warehouse is required'),
		unitCost: z.number().min(0, 'Unit cost must be positive'),
		sapItemCode: z.string().optional(),
		supplier: z.string().optional(),
		leadTimeDays: z.number().min(0, 'Lead time cannot be negative')
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errors = {};
		isSubmitting = true;

		try {
			// Validate form data
			const validated = sparePartSchema.parse({
				...formData,
				currentStock: Number(formData.currentStock),
				minStock: Number(formData.minStock),
				maxStock: Number(formData.maxStock),
				unitCost: Number(formData.unitCost),
				leadTimeDays: Number(formData.leadTimeDays)
			});

			// Call API
			if (part) {
				// Update existing part
				const response = await fetch('/api/inventory', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: part.id, ...validated })
				});

				if (!response.ok) {
					throw new Error('Failed to update spare part');
				}

				toast.success('Spare part updated successfully');
			} else {
				// Create new part
				const response = await fetch('/api/inventory', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(validated)
				});

				if (!response.ok) {
					throw new Error('Failed to create spare part');
				}

				toast.success('Spare part created successfully');
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
				toast.error(part ? 'Failed to update spare part' : 'Failed to create spare part');
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

<Dialog bind:open {onClose} title={part ? 'Edit Spare Part' : 'Add New Spare Part'} class="max-w-2xl">
	<form onsubmit={handleSubmit} class="space-y-4">
		<div class="grid gap-4 md:grid-cols-2">
			<!-- Code -->
			<div>
				<Label for="code">Part Code *</Label>
				<Input
					id="code"
					bind:value={formData.code}
					placeholder="e.g., SEAL-001"
					required
					class={errors.code ? 'border-red-500' : ''}
				/>
				{#if errors.code}
					<p class="mt-1 text-xs text-red-600">{errors.code}</p>
				{/if}
			</div>

			<!-- Category -->
			<div>
				<Label for="category">Category *</Label>
				<Input
					id="category"
					bind:value={formData.category}
					placeholder="e.g., Seals"
					list="categories"
					required
					class={errors.category ? 'border-red-500' : ''}
				/>
				<datalist id="categories">
					{#each categories as cat}
						<option value={cat}></option>
					{/each}
				</datalist>
				{#if errors.category}
					<p class="mt-1 text-xs text-red-600">{errors.category}</p>
				{/if}
			</div>

			<!-- Unit -->
			<div>
				<Label for="unit">Unit *</Label>
				<Select
					id="unit"
					bind:value={formData.unit}
					options={[
						{ value: 'pcs', label: 'Pieces' },
						{ value: 'box', label: 'Box' },
						{ value: 'set', label: 'Set' },
						{ value: 'kg', label: 'Kilogram' },
						{ value: 'liter', label: 'Liter' },
						{ value: 'meter', label: 'Meter' },
						{ value: 'drum', label: 'Drum' },
						{ value: 'bottle', label: 'Bottle' },
						{ value: 'roll', label: 'Roll' },
						{ value: 'pack', label: 'Pack' },
						{ value: 'pair', label: 'Pair' }
					]}
					required
				/>
			</div>

			<!-- Warehouse -->
			<div>
				<Label for="warehouse">Warehouse *</Label>
				<Input
					id="warehouse"
					bind:value={formData.warehouse}
					placeholder="e.g., Main Warehouse"
					list="warehouses"
					required
					class={errors.warehouse ? 'border-red-500' : ''}
				/>
				<datalist id="warehouses">
					{#each warehouses as wh}
						<option value={wh}></option>
					{/each}
				</datalist>
				{#if errors.warehouse}
					<p class="mt-1 text-xs text-red-600">{errors.warehouse}</p>
				{/if}
			</div>

			<!-- Current Stock -->
			<div>
				<Label for="currentStock">Current Stock *</Label>
				<Input
					id="currentStock"
					type="number"
					bind:value={formData.currentStock}
					min="0"
					step="1"
					required
					class={errors.currentStock ? 'border-red-500' : ''}
				/>
				{#if errors.currentStock}
					<p class="mt-1 text-xs text-red-600">{errors.currentStock}</p>
				{/if}
			</div>

			<!-- Min Stock -->
			<div>
				<Label for="minStock">Minimum Stock *</Label>
				<Input
					id="minStock"
					type="number"
					bind:value={formData.minStock}
					min="0"
					step="1"
					required
					class={errors.minStock ? 'border-red-500' : ''}
				/>
				{#if errors.minStock}
					<p class="mt-1 text-xs text-red-600">{errors.minStock}</p>
				{/if}
			</div>

			<!-- Max Stock -->
			<div>
				<Label for="maxStock">Maximum Stock</Label>
				<Input
					id="maxStock"
					type="number"
					bind:value={formData.maxStock}
					min="0"
					step="1"
					class={errors.maxStock ? 'border-red-500' : ''}
				/>
				{#if errors.maxStock}
					<p class="mt-1 text-xs text-red-600">{errors.maxStock}</p>
				{/if}
			</div>

			<!-- Unit Cost -->
			<div>
				<Label for="unitCost">Unit Cost ($) *</Label>
				<Input
					id="unitCost"
					type="number"
					bind:value={formData.unitCost}
					min="0"
					step="0.01"
					required
					class={errors.unitCost ? 'border-red-500' : ''}
				/>
				{#if errors.unitCost}
					<p class="mt-1 text-xs text-red-600">{errors.unitCost}</p>
				{/if}
			</div>

			<!-- Supplier -->
			<div>
				<Label for="supplier">Supplier</Label>
				<Input
					id="supplier"
					bind:value={formData.supplier}
					placeholder="e.g., Industrial Parts Co."
				/>
			</div>

			<!-- Lead Time Days -->
			<div>
				<Label for="leadTimeDays">Lead Time (Days)</Label>
				<Input
					id="leadTimeDays"
					type="number"
					bind:value={formData.leadTimeDays}
					min="0"
					step="1"
				/>
			</div>

			<!-- SAP Item Code -->
			<div>
				<Label for="sapItemCode">SAP Item Code</Label>
				<Input
					id="sapItemCode"
					bind:value={formData.sapItemCode}
					placeholder="e.g., SAP-SEAL-40"
				/>
			</div>
		</div>

		<!-- Description -->
		<div>
			<Label for="description">Description *</Label>
			<Textarea
				id="description"
				bind:value={formData.description}
				placeholder="Enter part description..."
				rows={3}
				required
				class={errors.description ? 'border-red-500' : ''}
			/>
			{#if errors.description}
				<p class="mt-1 text-xs text-red-600">{errors.description}</p>
			{/if}
		</div>

		<!-- Form Actions -->
		<div class="flex justify-end gap-2 pt-4">
			<Button type="button" variant="outline" onclick={handleClose} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? 'Saving...' : part ? 'Update Part' : 'Create Part'}
			</Button>
		</div>
	</form>
</Dialog>
