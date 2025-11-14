<script lang="ts">
	import { Dialog, Button, Input, Label, Select, Textarea } from '$components/ui';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { AssetDocument, DocumentType } from '$types';
	import { invalidateAll } from '$app/navigation';
	import { Upload, FileText, X } from 'lucide-svelte';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		document?: AssetDocument | null;
		assetId: string;
		assetName: string;
	}

	let { open = $bindable(false), onClose, document = null, assetId, assetName }: Props = $props();

	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let fileInput: HTMLInputElement | undefined = $state();
	let selectedFile: File | null = $state(null);
	let filePreview: string | null = $state(null);

	// Form state
	let formData = $state({
		title: document?.title || '',
		description: document?.description || '',
		type: document?.type || 'Other' as DocumentType,
		uploadedBy: document?.uploadedBy || '',
		tags: document?.tags?.join(', ') || '',
		expiryDate: document?.expiryDate || '',
		version: document?.version || '',
		relatedWorkOrderId: document?.relatedWorkOrderId || '',
		assetConditionScore: document?.assetConditionScore?.toString() || '',
		capturedDate: document?.capturedDate || ''
	});

	// Document type options
	const documentTypes: Array<{ value: DocumentType; label: string }> = [
		{ value: 'Manual', label: 'Manual' },
		{ value: 'Certificate', label: 'Certificate' },
		{ value: 'Warranty', label: 'Warranty' },
		{ value: 'Drawing', label: 'Drawing' },
		{ value: 'Photo', label: 'Photo' },
		{ value: 'Condition Report', label: 'Condition Report' },
		{ value: 'Maintenance Record', label: 'Maintenance Record' },
		{ value: 'Other', label: 'Other' }
	];

	// Reset form when document changes
	$effect(() => {
		if (document) {
			formData = {
				title: document.title,
				description: document.description || '',
				type: document.type,
				uploadedBy: document.uploadedBy,
				tags: document.tags?.join(', ') || '',
				expiryDate: document.expiryDate || '',
				version: document.version || '',
				relatedWorkOrderId: document.relatedWorkOrderId || '',
				assetConditionScore: document.assetConditionScore?.toString() || '',
				capturedDate: document.capturedDate || ''
			};
			selectedFile = null;
			filePreview = null;
		} else {
			formData = {
				title: '',
				description: '',
				type: 'Other',
				uploadedBy: '',
				tags: '',
				expiryDate: '',
				version: '',
				relatedWorkOrderId: '',
				assetConditionScore: '',
				capturedDate: ''
			};
			selectedFile = null;
			filePreview = null;
		}
		errors = {};
	});

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;

		if (!files || files.length === 0) return;

		const file = files[0];
		selectedFile = file;

		// Create preview for images
		if (file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (event) => {
				filePreview = event.target?.result as string;
			};
			reader.readAsDataURL(file);
		} else {
			filePreview = null;
		}

		// Auto-fill title if empty
		if (!formData.title) {
			formData.title = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
		}
	}

	function removeFile() {
		selectedFile = null;
		filePreview = null;
		if (fileInput) {
			fileInput.value = '';
		}
	}

	const documentSchema = z.object({
		title: z.string().min(1, 'Title is required'),
		description: z.string().optional(),
		type: z.enum(['Manual', 'Certificate', 'Warranty', 'Drawing', 'Photo', 'Condition Report', 'Maintenance Record', 'Other']),
		uploadedBy: z.string().min(1, 'Uploader name is required'),
		tags: z.string().optional(),
		expiryDate: z.string().optional(),
		version: z.string().optional(),
		relatedWorkOrderId: z.string().optional(),
		assetConditionScore: z.string().optional(),
		capturedDate: z.string().optional()
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errors = {};
		isSubmitting = true;

		try {
			// Validate form data
			const validated = documentSchema.parse(formData);

			// Check if file is provided for new uploads
			if (!document && !selectedFile) {
				toast.error('Please select a file to upload');
				isSubmitting = false;
				return;
			}

			// Process file data
			let fileUrl = document?.fileUrl || '';
			let fileName = document?.fileName || '';
			let fileSize = document?.fileSize || 0;
			let mimeType = document?.mimeType || '';

			if (selectedFile) {
				// Convert file to base64 for demo purposes
				const reader = new FileReader();
				const fileData = await new Promise<string>((resolve, reject) => {
					reader.onload = (event) => resolve(event.target?.result as string);
					reader.onerror = reject;
					reader.readAsDataURL(selectedFile!);
				});

				fileUrl = fileData;
				fileName = selectedFile.name;
				fileSize = selectedFile.size;
				mimeType = selectedFile.type;
			}

			// Prepare data for API
			const payload = {
				...validated,
				assetId,
				assetName,
				fileUrl,
				fileName,
				fileSize,
				mimeType,
				tags: validated.tags ? validated.tags.split(',').map(t => t.trim()).filter(t => t) : [],
				assetConditionScore: validated.assetConditionScore ? parseInt(validated.assetConditionScore) : undefined,
				expiryDate: validated.expiryDate || undefined,
				version: validated.version || undefined,
				relatedWorkOrderId: validated.relatedWorkOrderId || undefined,
				capturedDate: validated.capturedDate || undefined,
				description: validated.description || undefined
			};

			// Call API
			if (document) {
				// Update existing document
				const response = await fetch(`/api/assets/${assetId}/documents`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: document.id, ...payload })
				});

				if (!response.ok) {
					throw new Error('Failed to update document');
				}

				toast.success('Document updated successfully');
			} else {
				// Create new document
				const response = await fetch(`/api/assets/${assetId}/documents`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});

				if (!response.ok) {
					throw new Error('Failed to upload document');
				}

				toast.success('Document uploaded successfully');
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
				console.error('Upload error:', err);
				toast.error(document ? 'Failed to update document' : 'Failed to upload document');
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

<Dialog bind:open {onClose} title={document ? 'Edit Document' : 'Upload Document'} class="max-w-2xl max-h-[90vh] overflow-y-auto">
	<form onsubmit={handleSubmit} class="space-y-4">
		<!-- File Upload Section -->
		{#if !document}
			<div class="rounded-lg border-2 border-dashed border-slate-300 p-6 transition-colors hover:border-slate-400">
				{#if selectedFile}
					<!-- File Preview -->
					<div class="space-y-3">
						{#if filePreview}
							<div class="relative overflow-hidden rounded-lg">
								<img src={filePreview} alt="Preview" class="h-48 w-full object-cover" />
								<button
									type="button"
									onclick={removeFile}
									class="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
								>
									<X class="h-4 w-4" />
								</button>
							</div>
						{:else}
							<div class="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
								<FileText class="h-8 w-8 text-slate-400" />
								<div class="flex-1">
									<p class="font-medium text-slate-900">{selectedFile.name}</p>
									<p class="text-sm text-slate-500">
										{(selectedFile.size / 1024).toFixed(1)} KB
									</p>
								</div>
								<button
									type="button"
									onclick={removeFile}
									class="rounded-full p-1 text-red-500 hover:bg-red-50"
								>
									<X class="h-5 w-5" />
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<!-- Upload Prompt -->
					<div class="text-center">
						<Upload class="mx-auto h-12 w-12 text-slate-400" />
						<div class="mt-4">
							<Label for="file-upload" class="cursor-pointer">
								<span class="text-sm font-medium text-blue-600 hover:text-blue-700">
									Click to upload
								</span>
								<span class="text-sm text-slate-500"> or drag and drop</span>
							</Label>
							<p class="mt-1 text-xs text-slate-500">
								PDF, DOC, images up to 10MB
							</p>
						</div>
						<input
							id="file-upload"
							type="file"
							bind:this={fileInput}
							onchange={handleFileSelect}
							accept="*/*"
							class="sr-only"
						/>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Basic Information -->
		<div class="grid gap-4 md:grid-cols-2">
			<!-- Title -->
			<div class="md:col-span-2">
				<Label for="title">Document Title *</Label>
				<Input
					id="title"
					bind:value={formData.title}
					placeholder="e.g., Operation Manual"
					required
					class={errors.title ? 'border-red-500' : ''}
				/>
				{#if errors.title}
					<p class="mt-1 text-xs text-red-600">{errors.title}</p>
				{/if}
			</div>

			<!-- Document Type -->
			<div>
				<Label for="type">Document Type *</Label>
				<Select
					id="type"
					bind:value={formData.type}
					options={documentTypes}
					required
				/>
			</div>

			<!-- Uploaded By -->
			<div>
				<Label for="uploadedBy">Uploaded By *</Label>
				<Input
					id="uploadedBy"
					bind:value={formData.uploadedBy}
					placeholder="e.g., John Smith"
					required
					class={errors.uploadedBy ? 'border-red-500' : ''}
				/>
				{#if errors.uploadedBy}
					<p class="mt-1 text-xs text-red-600">{errors.uploadedBy}</p>
				{/if}
			</div>
		</div>

		<!-- Description -->
		<div>
			<Label for="description">Description</Label>
			<Textarea
				id="description"
				bind:value={formData.description}
				placeholder="Brief description of the document"
				rows={3}
			/>
		</div>

		<!-- Additional Fields -->
		<div class="grid gap-4 md:grid-cols-2">
			<!-- Tags -->
			<div>
				<Label for="tags">Tags (comma-separated)</Label>
				<Input
					id="tags"
					bind:value={formData.tags}
					placeholder="e.g., manual, operation, safety"
				/>
			</div>

			<!-- Version -->
			<div>
				<Label for="version">Version</Label>
				<Input
					id="version"
					bind:value={formData.version}
					placeholder="e.g., 1.0"
				/>
			</div>

			<!-- Expiry Date -->
			<div>
				<Label for="expiryDate">Expiry Date</Label>
				<Input
					id="expiryDate"
					type="date"
					bind:value={formData.expiryDate}
				/>
				<p class="mt-1 text-xs text-slate-500">For certificates and warranties</p>
			</div>

			<!-- Captured Date -->
			<div>
				<Label for="capturedDate">Captured Date</Label>
				<Input
					id="capturedDate"
					type="date"
					bind:value={formData.capturedDate}
				/>
				<p class="mt-1 text-xs text-slate-500">For photos and condition reports</p>
			</div>

			<!-- Related Work Order ID -->
			<div>
				<Label for="relatedWorkOrderId">Related Work Order ID</Label>
				<Input
					id="relatedWorkOrderId"
					bind:value={formData.relatedWorkOrderId}
					placeholder="e.g., WO001"
				/>
			</div>

			<!-- Asset Condition Score -->
			<div>
				<Label for="assetConditionScore">Asset Condition Score (1-10)</Label>
				<Input
					id="assetConditionScore"
					type="number"
					min="1"
					max="10"
					bind:value={formData.assetConditionScore}
					placeholder="1-10"
				/>
				<p class="mt-1 text-xs text-slate-500">For condition tracking</p>
			</div>
		</div>

		<!-- Form Actions -->
		<div class="flex justify-end gap-3 border-t border-slate-200 pt-4">
			<Button type="button" variant="outline" onclick={handleClose} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? 'Uploading...' : document ? 'Update Document' : 'Upload Document'}
			</Button>
		</div>
	</form>
</Dialog>
