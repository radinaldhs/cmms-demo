<script lang="ts">
	import { Dialog, Button, Input, Label, Select, Textarea } from '$components/ui';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { Asset } from '$types';
	import { goto, invalidateAll } from '$app/navigation';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		asset?: Asset | null;
		categories: string[];
	}

	let { open = $bindable(false), onClose, asset = null, categories }: Props = $props();

	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});

	// Form state
	let formData = $state({
		code: asset?.code || '',
		name: asset?.name || '',
		category: asset?.category || '',
		location: asset?.location || '',
		status: asset?.status || 'Active',
		purchaseDate: asset?.purchaseDate || new Date().toISOString().split('T')[0],
		purchaseCost: asset?.purchaseCost || 0,
		usefulLifeYears: asset?.usefulLifeYears || 10,
		residualValue: asset?.residualValue || 0,
		description: asset?.description || '',
		manufacturer: asset?.manufacturer || '',
		model: asset?.model || '',
		serialNumber: asset?.serialNumber || '',
		warrantyExpiry: asset?.warrantyExpiry || '',
		assignedTo: asset?.assignedTo || '',
		tags: asset?.tags?.join(', ') || ''
	});

	// Reset form when asset changes
	$effect(() => {
		if (asset) {
			formData = {
				code: asset.code,
				name: asset.name,
				category: asset.category,
				location: asset.location,
				status: asset.status,
				purchaseDate: asset.purchaseDate,
				purchaseCost: asset.purchaseCost,
				usefulLifeYears: asset.usefulLifeYears,
				residualValue: asset.residualValue,
				description: asset.description || '',
				manufacturer: asset.manufacturer || '',
				model: asset.model || '',
				serialNumber: asset.serialNumber || '',
				warrantyExpiry: asset.warrantyExpiry || '',
				assignedTo: asset.assignedTo || '',
				tags: asset.tags?.join(', ') || ''
			};
		} else {
			formData = {
				code: '',
				name: '',
				category: '',
				location: '',
				status: 'Active',
				purchaseDate: new Date().toISOString().split('T')[0],
				purchaseCost: 0,
				usefulLifeYears: 10,
				residualValue: 0,
				description: '',
				manufacturer: '',
				model: '',
				serialNumber: '',
				warrantyExpiry: '',
				assignedTo: '',
				tags: ''
			};
		}
		errors = {};
	});

	const assetSchema = z.object({
		code: z.string().min(1, 'Code is required'),
		name: z.string().min(1, 'Name is required'),
		category: z.string().min(1, 'Category is required'),
		location: z.string().min(1, 'Location is required'),
		status: z.enum(['Active', 'Inactive', 'Maintenance', 'Retired']),
		purchaseDate: z.string().min(1, 'Purchase date is required'),
		purchaseCost: z.number().min(0, 'Purchase cost must be positive'),
		usefulLifeYears: z.number().min(1, 'Useful life must be at least 1 year'),
		residualValue: z.number().min(0, 'Residual value must be positive'),
		description: z.string().optional(),
		manufacturer: z.string().optional(),
		model: z.string().optional(),
		serialNumber: z.string().optional(),
		warrantyExpiry: z.string().optional(),
		assignedTo: z.string().optional(),
		tags: z.string().optional()
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errors = {};
		isSubmitting = true;

		try {
			// Validate form data
			const validated = assetSchema.parse({
				...formData,
				purchaseCost: Number(formData.purchaseCost),
				usefulLifeYears: Number(formData.usefulLifeYears),
				residualValue: Number(formData.residualValue)
			});

			// Prepare data for API
			const payload = {
				...validated,
				tags: validated.tags ? validated.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
				isFleet: false,
				depreciationMethod: 'STRAIGHT_LINE' as const
			};

			// Call API
			if (asset) {
				// Update existing asset
				const response = await fetch('/api/assets', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: asset.id, ...payload })
				});

				if (!response.ok) {
					throw new Error('Failed to update asset');
				}

				toast.success('Asset updated successfully');
			} else {
				// Create new asset
				const response = await fetch('/api/assets', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});

				if (!response.ok) {
					throw new Error('Failed to create asset');
				}

				toast.success('Asset created successfully');
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
				toast.error(asset ? 'Failed to update asset' : 'Failed to create asset');
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

<Dialog bind:open {onClose} title={asset ? 'Edit Asset' : 'Add New Asset'} class="max-w-2xl">
	<form onsubmit={handleSubmit} class="space-y-4">
		<div class="grid gap-4 md:grid-cols-2">
			<!-- Code -->
			<div>
				<Label for="code">Asset Code *</Label>
				<Input
					id="code"
					bind:value={formData.code}
					placeholder="e.g., PUMP-001"
					required
					class={errors.code ? 'border-red-500' : ''}
				/>
				{#if errors.code}
					<p class="mt-1 text-xs text-red-600">{errors.code}</p>
				{/if}
			</div>

			<!-- Name -->
			<div>
				<Label for="name">Asset Name *</Label>
				<Input
					id="name"
					bind:value={formData.name}
					placeholder="e.g., Centrifugal Pump A1"
					required
					class={errors.name ? 'border-red-500' : ''}
				/>
				{#if errors.name}
					<p class="mt-1 text-xs text-red-600">{errors.name}</p>
				{/if}
			</div>

			<!-- Category -->
			<div>
				<Label for="category">Category *</Label>
				<Input
					id="category"
					bind:value={formData.category}
					placeholder="e.g., Pumps"
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

			<!-- Location -->
			<div>
				<Label for="location">Location *</Label>
				<Input
					id="location"
					bind:value={formData.location}
					placeholder="e.g., Plant A - Section 1"
					required
					class={errors.location ? 'border-red-500' : ''}
				/>
				{#if errors.location}
					<p class="mt-1 text-xs text-red-600">{errors.location}</p>
				{/if}
			</div>

			<!-- Status -->
			<div>
				<Label for="status">Status *</Label>
				<Select
					id="status"
					bind:value={formData.status}
					options={[
						{ value: 'Active', label: 'Active' },
						{ value: 'Inactive', label: 'Inactive' },
						{ value: 'Maintenance', label: 'Maintenance' },
						{ value: 'Retired', label: 'Retired' }
					]}
					required
				/>
			</div>

			<!-- Assigned To -->
			<div>
				<Label for="assignedTo">Assigned To</Label>
				<Input
					id="assignedTo"
					bind:value={formData.assignedTo}
					placeholder="e.g., John Smith"
				/>
			</div>

			<!-- Purchase Date -->
			<div>
				<Label for="purchaseDate">Purchase Date *</Label>
				<Input
					id="purchaseDate"
					type="date"
					bind:value={formData.purchaseDate}
					required
					class={errors.purchaseDate ? 'border-red-500' : ''}
				/>
				{#if errors.purchaseDate}
					<p class="mt-1 text-xs text-red-600">{errors.purchaseDate}</p>
				{/if}
			</div>

			<!-- Purchase Cost -->
			<div>
				<Label for="purchaseCost">Purchase Cost ($) *</Label>
				<Input
					id="purchaseCost"
					type="number"
					bind:value={formData.purchaseCost}
					min="0"
					step="0.01"
					required
					class={errors.purchaseCost ? 'border-red-500' : ''}
				/>
				{#if errors.purchaseCost}
					<p class="mt-1 text-xs text-red-600">{errors.purchaseCost}</p>
				{/if}
			</div>

			<!-- Useful Life Years -->
			<div>
				<Label for="usefulLifeYears">Useful Life (Years) *</Label>
				<Input
					id="usefulLifeYears"
					type="number"
					bind:value={formData.usefulLifeYears}
					min="1"
					required
					class={errors.usefulLifeYears ? 'border-red-500' : ''}
				/>
				{#if errors.usefulLifeYears}
					<p class="mt-1 text-xs text-red-600">{errors.usefulLifeYears}</p>
				{/if}
			</div>

			<!-- Residual Value -->
			<div>
				<Label for="residualValue">Residual Value ($) *</Label>
				<Input
					id="residualValue"
					type="number"
					bind:value={formData.residualValue}
					min="0"
					step="0.01"
					required
					class={errors.residualValue ? 'border-red-500' : ''}
				/>
				{#if errors.residualValue}
					<p class="mt-1 text-xs text-red-600">{errors.residualValue}</p>
				{/if}
			</div>

			<!-- Manufacturer -->
			<div>
				<Label for="manufacturer">Manufacturer</Label>
				<Input
					id="manufacturer"
					bind:value={formData.manufacturer}
					placeholder="e.g., GrundFos"
				/>
			</div>

			<!-- Model -->
			<div>
				<Label for="model">Model</Label>
				<Input
					id="model"
					bind:value={formData.model}
					placeholder="e.g., CR-150"
				/>
			</div>

			<!-- Serial Number -->
			<div>
				<Label for="serialNumber">Serial Number</Label>
				<Input
					id="serialNumber"
					bind:value={formData.serialNumber}
					placeholder="e.g., GF2020-150-4521"
				/>
			</div>

			<!-- Warranty Expiry -->
			<div>
				<Label for="warrantyExpiry">Warranty Expiry</Label>
				<Input
					id="warrantyExpiry"
					type="date"
					bind:value={formData.warrantyExpiry}
				/>
			</div>
		</div>

		<!-- Description -->
		<div>
			<Label for="description">Description</Label>
			<Textarea
				id="description"
				bind:value={formData.description}
				placeholder="Enter asset description..."
				rows={3}
			/>
		</div>

		<!-- Tags -->
		<div>
			<Label for="tags">Tags (comma separated)</Label>
			<Input
				id="tags"
				bind:value={formData.tags}
				placeholder="e.g., critical, water-system"
			/>
		</div>

		<!-- Form Actions -->
		<div class="flex justify-end gap-2 pt-4">
			<Button type="button" variant="outline" onclick={handleClose} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? 'Saving...' : asset ? 'Update Asset' : 'Create Asset'}
			</Button>
		</div>
	</form>
</Dialog>
