<script lang="ts">
	import { Dialog, Button, Input, Label, Select, Textarea } from '$components/ui';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { AssetInspection, InspectionPhoto } from '$types';
	import { invalidateAll } from '$app/navigation';
	import { Plus, Trash2, Upload, ImageIcon } from 'lucide-svelte';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		inspection?: AssetInspection | null;
		assetId: string;
		assetName: string;
	}

	let { open = $bindable(false), onClose, inspection = null, assetId, assetName }: Props = $props();

	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let fileInput: HTMLInputElement | undefined = $state();

	// Form state
	let formData = $state({
		inspectionDate: inspection?.inspectionDate || new Date().toISOString().split('T')[0],
		inspectedBy: inspection?.inspectedBy || '',
		status: inspection?.status || 'Pending',
		findings: inspection?.findings || '',
		recommendations: inspection?.recommendations || '',
		nextInspectionDate: inspection?.nextInspectionDate || ''
	});

	// Checklist items state
	let checklistItems = $state<Array<{ id: string; item: string; status: 'OK' | 'Not OK' | 'N/A'; notes: string }>>(
		inspection?.checklistItems?.map(item => ({ ...item, notes: item.notes || '' })) || [
			{ id: crypto.randomUUID(), item: '', status: 'N/A', notes: '' }
		]
	);

	// Photos state
	let photos = $state<Array<{ id: string; url: string; caption: string; uploadedAt: string }>>(
		inspection?.photos?.map(photo => ({ ...photo, caption: photo.caption || '' })) || []
	);

	// Reset form when inspection changes
	$effect(() => {
		if (inspection) {
			formData = {
				inspectionDate: inspection.inspectionDate,
				inspectedBy: inspection.inspectedBy,
				status: inspection.status,
				findings: inspection.findings,
				recommendations: inspection.recommendations || '',
				nextInspectionDate: inspection.nextInspectionDate || ''
			};
			checklistItems = inspection.checklistItems?.map(item => ({ ...item, notes: item.notes || '' })) || [
				{ id: crypto.randomUUID(), item: '', status: 'N/A', notes: '' }
			];
			photos = inspection.photos?.map(photo => ({ ...photo, caption: photo.caption || '' })) || [];
		} else {
			formData = {
				inspectionDate: new Date().toISOString().split('T')[0],
				inspectedBy: '',
				status: 'Pending',
				findings: '',
				recommendations: '',
				nextInspectionDate: ''
			};
			checklistItems = [
				{ id: crypto.randomUUID(), item: '', status: 'N/A', notes: '' }
			];
			photos = [];
		}
		errors = {};
	});

	function addChecklistItem() {
		checklistItems = [...checklistItems, { id: crypto.randomUUID(), item: '', status: 'N/A', notes: '' }];
	}

	function removeChecklistItem(id: string) {
		if (checklistItems.length > 1) {
			checklistItems = checklistItems.filter(item => item.id !== id);
		}
	}

	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;

		if (!files || files.length === 0) return;

		// Process each file
		Array.from(files).forEach((file) => {
			if (!file.type.startsWith('image/')) {
				toast.error(`${file.name} is not an image file`);
				return;
			}

			// For demo purposes, use a placeholder image URL
			// In a real app, you'd upload to a server or convert to base64
			const reader = new FileReader();
			reader.onload = (event) => {
				const url = event.target?.result as string;
				photos = [
					...photos,
					{
						id: crypto.randomUUID(),
						url: url, // base64 data URL
						caption: '',
						uploadedAt: new Date().toISOString()
					}
				];
			};
			reader.readAsDataURL(file);
		});

		// Reset file input
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function removePhoto(id: string) {
		photos = photos.filter(photo => photo.id !== id);
	}

	const inspectionSchema = z.object({
		inspectionDate: z.string().min(1, 'Inspection date is required'),
		inspectedBy: z.string().min(1, 'Inspector name is required'),
		status: z.enum(['Passed', 'Failed', 'Needs Attention', 'Pending']),
		findings: z.string().min(1, 'Findings are required'),
		recommendations: z.string().optional(),
		nextInspectionDate: z.string().optional()
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errors = {};
		isSubmitting = true;

		try {
			// Validate form data
			const validated = inspectionSchema.parse(formData);

			// Filter out empty checklist items
			const validChecklistItems = checklistItems
				.filter(item => item.item.trim() !== '')
				.map(({ notes, ...item }) => ({
					...item,
					notes: notes || undefined
				}));

			// Prepare photos data
			const validPhotos = photos.map(({ caption, ...photo }) => ({
				...photo,
				caption: caption || undefined
			}));

			// Prepare data for API
			const payload = {
				...validated,
				assetId,
				assetName,
				checklistItems: validChecklistItems,
				photos: validPhotos
			};

			// Call API
			if (inspection) {
				// Update existing inspection
				const response = await fetch(`/api/assets/${assetId}/inspections`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: inspection.id, ...payload })
				});

				if (!response.ok) {
					throw new Error('Failed to update inspection');
				}

				toast.success('Inspection updated successfully');
			} else {
				// Create new inspection
				const response = await fetch(`/api/assets/${assetId}/inspections`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});

				if (!response.ok) {
					throw new Error('Failed to create inspection');
				}

				toast.success('Inspection created successfully');
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
				toast.error(inspection ? 'Failed to update inspection' : 'Failed to create inspection');
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

<Dialog bind:open {onClose} title={inspection ? 'Edit Inspection' : 'Add New Inspection'} class="max-w-3xl max-h-[90vh] overflow-y-auto">
	<form onsubmit={handleSubmit} class="space-y-4">
		<div class="grid gap-4 md:grid-cols-2">
			<!-- Inspection Date -->
			<div>
				<Label for="inspectionDate">Inspection Date *</Label>
				<Input
					id="inspectionDate"
					type="date"
					bind:value={formData.inspectionDate}
					required
					class={errors.inspectionDate ? 'border-red-500' : ''}
				/>
				{#if errors.inspectionDate}
					<p class="mt-1 text-xs text-red-600">{errors.inspectionDate}</p>
				{/if}
			</div>

			<!-- Inspected By -->
			<div>
				<Label for="inspectedBy">Inspected By *</Label>
				<Input
					id="inspectedBy"
					bind:value={formData.inspectedBy}
					placeholder="e.g., John Smith"
					required
					class={errors.inspectedBy ? 'border-red-500' : ''}
				/>
				{#if errors.inspectedBy}
					<p class="mt-1 text-xs text-red-600">{errors.inspectedBy}</p>
				{/if}
			</div>

			<!-- Status -->
			<div>
				<Label for="status">Status *</Label>
				<Select
					id="status"
					bind:value={formData.status}
					options={[
						{ value: 'Pending', label: 'Pending' },
						{ value: 'Passed', label: 'Passed' },
						{ value: 'Needs Attention', label: 'Needs Attention' },
						{ value: 'Failed', label: 'Failed' }
					]}
					required
				/>
			</div>

			<!-- Next Inspection Date -->
			<div>
				<Label for="nextInspectionDate">Next Inspection Date</Label>
				<Input
					id="nextInspectionDate"
					type="date"
					bind:value={formData.nextInspectionDate}
				/>
			</div>
		</div>

		<!-- Checklist Items -->
		<div>
			<div class="mb-2 flex items-center justify-between">
				<Label>Checklist Items</Label>
				<Button type="button" size="sm" variant="outline" onclick={addChecklistItem}>
					<Plus class="h-4 w-4 mr-1" />
					Add Item
				</Button>
			</div>
			<div class="space-y-3">
				{#each checklistItems as item (item.id)}
					<div class="rounded-lg border border-slate-200 p-3">
						<div class="grid gap-2 md:grid-cols-[1fr_120px_40px]">
							<div>
								<Input
									bind:value={item.item}
									placeholder="e.g., Check oil level"
									class="mb-2"
								/>
								<Input
									bind:value={item.notes}
									placeholder="Notes (optional)"
									class="text-sm"
								/>
							</div>
							<Select
								bind:value={item.status}
								options={[
									{ value: 'N/A', label: 'N/A' },
									{ value: 'OK', label: 'OK' },
									{ value: 'Not OK', label: 'Not OK' }
								]}
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onclick={() => removeChecklistItem(item.id)}
								disabled={checklistItems.length === 1}
								class="h-10"
							>
								<Trash2 class="h-4 w-4 text-red-600" />
							</Button>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Findings -->
		<div>
			<Label for="findings">Findings *</Label>
			<Textarea
				id="findings"
				bind:value={formData.findings}
				placeholder="Describe the inspection findings..."
				rows={3}
				required
				class={errors.findings ? 'border-red-500' : ''}
			/>
			{#if errors.findings}
				<p class="mt-1 text-xs text-red-600">{errors.findings}</p>
			{/if}
		</div>

		<!-- Recommendations -->
		<div>
			<Label for="recommendations">Recommendations</Label>
			<Textarea
				id="recommendations"
				bind:value={formData.recommendations}
				placeholder="Enter recommendations (optional)..."
				rows={2}
			/>
		</div>

		<!-- Photos Upload -->
		<div>
			<div class="mb-2 flex items-center justify-between">
				<Label>Inspection Photos</Label>
				<Button
					type="button"
					size="sm"
					variant="outline"
					onclick={() => fileInput?.click()}
				>
					<Upload class="h-4 w-4 mr-1" />
					Upload Photos
				</Button>
				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					multiple
					onchange={handleFileUpload}
					class="hidden"
				/>
			</div>

			{#if photos.length > 0}
				<div class="grid gap-3 sm:grid-cols-2">
					{#each photos as photo (photo.id)}
						<div class="rounded-lg border border-slate-200 overflow-hidden">
							<div class="relative">
								<img
									src={photo.url}
									alt={photo.caption || 'Inspection photo'}
									class="h-32 w-full object-cover"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onclick={() => removePhoto(photo.id)}
									class="absolute right-1 top-1 h-7 w-7 p-0 bg-red-600 text-white hover:bg-red-700"
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
							<div class="p-2">
								<Input
									bind:value={photo.caption}
									placeholder="Add caption (optional)"
									class="text-sm"
								/>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center">
					<ImageIcon class="mx-auto mb-2 h-8 w-8 text-slate-400" />
					<p class="text-sm text-slate-600">No photos uploaded yet</p>
					<p class="text-xs text-slate-500 mt-1">Click "Upload Photos" to add images</p>
				</div>
			{/if}
		</div>

		<!-- Asset Info Display -->
		<div class="rounded-lg bg-slate-50 p-3">
			<p class="text-sm text-slate-600">
				<span class="font-medium">Asset:</span> {assetName} (ID: {assetId})
			</p>
		</div>

		<!-- Form Actions -->
		<div class="flex justify-end gap-2 pt-4 border-t">
			<Button type="button" variant="outline" onclick={handleClose} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? 'Saving...' : inspection ? 'Update Inspection' : 'Create Inspection'}
			</Button>
		</div>
	</form>
</Dialog>
