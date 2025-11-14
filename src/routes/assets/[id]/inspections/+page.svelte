<script lang="ts">
	import { Card, Badge, Button } from '$components/ui';
	import { ArrowLeft, Calendar, User, CheckCircle2, XCircle, AlertTriangle, Image, QrCode } from 'lucide-svelte';
	import { formatDate } from '$utils';
	import QRCode from '$lib/components/QRCode.svelte';
	import InspectionFormDialog from '$lib/components/InspectionFormDialog.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showQRCode = $state<Record<string, boolean>>({});
	let isInspectionDialogOpen = $state(false);

	function toggleQRCode(inspectionId: string) {
		showQRCode[inspectionId] = !showQRCode[inspectionId];
	}

	function getInspectionURL(inspectionId: string) {
		// Generate a URL that could be used to view this inspection
		// In a real app, this would be the full domain URL
		const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
		return `${baseUrl}/assets/${data.asset.id}/inspections?inspection=${inspectionId}`;
	}

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Passed: 'success',
			Failed: 'destructive',
			'Needs Attention': 'warning',
			Pending: 'default'
		};
		return variants[status] || 'default';
	}

	function getChecklistStatusIcon(status: string) {
		switch (status) {
			case 'OK':
				return CheckCircle2;
			case 'Not OK':
				return XCircle;
			default:
				return AlertTriangle;
		}
	}

	function getChecklistStatusColor(status: string) {
		switch (status) {
			case 'OK':
				return 'text-green-600';
			case 'Not OK':
				return 'text-red-600';
			default:
				return 'text-slate-400';
		}
	}
</script>

<div class="space-y-6">
	<div>
		<a
			href="/assets/{data.asset.id}"
			class="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
		>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Asset Details
		</a>

		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold text-slate-900">Inspections</h1>
				<p class="text-slate-600">{data.asset.name} - {data.asset.code}</p>
			</div>
			<Button onclick={() => isInspectionDialogOpen = true}>Add Inspection</Button>
		</div>
	</div>

	{#if data.inspections.length === 0}
		<Card class="p-12 text-center">
			<div class="mx-auto max-w-md">
				<Calendar class="mx-auto mb-4 h-12 w-12 text-slate-400" />
				<h3 class="mb-2 text-lg font-semibold text-slate-900">No inspections yet</h3>
				<p class="mb-4 text-sm text-slate-600">
					Start documenting asset inspections to track condition over time.
				</p>
				<Button onclick={() => isInspectionDialogOpen = true}>Create First Inspection</Button>
			</div>
		</Card>
	{:else}
		<div class="space-y-6">
			{#each data.inspections as inspection}
				<Card class="p-6">
					<div class="mb-4 flex items-start justify-between">
						<div class="flex-1">
							<div class="mb-2 flex items-center gap-3">
								<h3 class="text-lg font-semibold text-slate-900">
									Inspection - {formatDate(inspection.inspectionDate)}
								</h3>
								<Badge variant={getStatusVariant(inspection.status)}>
									{inspection.status}
								</Badge>
							</div>
							<div class="flex items-center gap-4 text-sm text-slate-600">
								<span class="flex items-center gap-1">
									<User class="h-4 w-4" />
									{inspection.inspectedBy}
								</span>
								<span class="flex items-center gap-1">
									<Calendar class="h-4 w-4" />
									{formatDate(inspection.inspectionDate)}
								</span>
								{#if inspection.nextInspectionDate}
									<span class="text-blue-600">
										Next: {formatDate(inspection.nextInspectionDate)}
									</span>
								{/if}
							</div>
						</div>
						<div class="ml-4">
							<Button
								variant="outline"
								size="sm"
								onclick={() => toggleQRCode(inspection.id)}
							>
								<QrCode class="h-4 w-4 {showQRCode[inspection.id] ? 'mr-2' : ''}" />
								{showQRCode[inspection.id] ? 'Hide' : 'Show'} QR
							</Button>
						</div>
					</div>

					<!-- QR Code Section -->
					{#if showQRCode[inspection.id]}
						<div class="mb-4 flex justify-center border-b border-slate-200 pb-6">
							<QRCode
								value={getInspectionURL(inspection.id)}
								size={180}
								label="Scan to view inspection details"
							/>
						</div>
					{/if}

					<!-- Checklist Items -->
					{#if inspection.checklistItems.length > 0}
						<div class="mb-4">
							<h4 class="mb-3 font-medium text-slate-900">Checklist</h4>
							<div class="space-y-2">
								{#each inspection.checklistItems as item}
									{@const Icon = getChecklistStatusIcon(item.status)}
									<div class="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
										<Icon class="mt-0.5 h-5 w-5 flex-shrink-0 {getChecklistStatusColor(item.status)}" />
										<div class="flex-1">
											<p class="text-sm font-medium text-slate-900">{item.item}</p>
											{#if item.notes}
												<p class="mt-1 text-sm text-slate-600">{item.notes}</p>
											{/if}
										</div>
										<span
											class="text-xs font-medium {item.status === 'OK'
												? 'text-green-600'
												: item.status === 'Not OK'
													? 'text-red-600'
													: 'text-slate-500'}"
										>
											{item.status}
										</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Photos -->
					{#if inspection.photos.length > 0}
						<div class="mb-4">
							<h4 class="mb-3 flex items-center gap-2 font-medium text-slate-900">
								<Image class="h-5 w-5" />
								Photos ({inspection.photos.length})
							</h4>
							<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{#each inspection.photos as photo}
									<div class="overflow-hidden rounded-lg border border-slate-200">
										<img
											src={photo.url}
											alt={photo.caption || 'Inspection photo'}
											class="h-48 w-full object-cover"
										/>
										{#if photo.caption}
											<div class="bg-slate-50 p-2">
												<p class="text-sm text-slate-700">{photo.caption}</p>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Findings -->
					<div class="space-y-3 border-t border-slate-200 pt-4">
						<div>
							<h4 class="mb-2 text-sm font-medium text-slate-900">Findings</h4>
							<p class="text-sm text-slate-700">{inspection.findings}</p>
						</div>
						{#if inspection.recommendations}
							<div>
								<h4 class="mb-2 text-sm font-medium text-slate-900">Recommendations</h4>
								<p class="text-sm text-slate-700">{inspection.recommendations}</p>
							</div>
						{/if}
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<!-- Inspection Form Dialog -->
<InspectionFormDialog
	bind:open={isInspectionDialogOpen}
	assetId={data.asset.id}
	assetName={data.asset.name}
/>
