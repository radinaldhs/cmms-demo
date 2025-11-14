<script lang="ts">
	import { Card, Badge, Button } from '$components/ui';
	import {
		ArrowLeft,
		FileText,
		Image,
		TrendingDown,
		TrendingUp,
		Minus,
		Calendar,
		Wrench,
		ArrowUpRight,
		ArrowDownRight,
		AlertCircle
	} from 'lucide-svelte';
	import { formatDate } from '$utils';
	import type { PageData } from './$types';
	import DocumentUploadDialog from '$components/DocumentUploadDialog.svelte';

	let { data }: { data: PageData } = $props();

	let activeTab = $state('overview');
	let showUploadDialog = $state(false);

	function getConditionTrendIcon(trend: string) {
		switch (trend) {
			case 'improving':
				return TrendingUp;
			case 'declining':
				return TrendingDown;
			default:
				return Minus;
		}
	}

	function getConditionTrendColor(trend: string) {
		switch (trend) {
			case 'improving':
				return 'text-green-600';
			case 'declining':
				return 'text-red-600';
			default:
				return 'text-slate-600';
		}
	}

	function getConditionScoreColor(score: number) {
		if (score >= 8) return 'text-green-600';
		if (score >= 5) return 'text-amber-600';
		return 'text-red-600';
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
				<h1 class="text-3xl font-bold text-slate-900">Documentation</h1>
				<p class="text-slate-600">{data.asset.name} - {data.asset.code}</p>
			</div>
			<Button onclick={() => showUploadDialog = true}>Upload Document</Button>
		</div>
	</div>

	<!-- Tabs -->
	<div class="border-b border-slate-200">
		<nav class="-mb-px flex space-x-8">
			<button
				onclick={() => (activeTab = 'overview')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'overview'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Overview
			</button>
			<button
				onclick={() => (activeTab = 'condition')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'condition'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Condition Timeline
			</button>
			<button
				onclick={() => (activeTab = 'maintenance')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'maintenance'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Maintenance History
			</button>
			<button
				onclick={() => (activeTab = 'all')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'all'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				All Documents
			</button>
		</nav>
	</div>

	{#if activeTab === 'overview'}
		<!-- Summary Cards -->
		{#if data.summary}
			<div class="grid gap-6 md:grid-cols-4">
				<Card class="p-6">
					<div class="flex items-center gap-3">
						<div class="rounded-full bg-blue-100 p-3">
							<FileText class="h-6 w-6 text-blue-600" />
						</div>
						<div>
							<p class="text-sm text-slate-600">Total Documents</p>
							<p class="text-2xl font-bold text-slate-900">{data.summary.totalDocuments}</p>
						</div>
					</div>
				</Card>

				<Card class="p-6">
					<div class="flex items-center gap-3">
						<div class="rounded-full bg-purple-100 p-3">
							<Wrench class="h-6 w-6 text-purple-600" />
						</div>
						<div>
							<p class="text-sm text-slate-600">Maintenances</p>
							<p class="text-2xl font-bold text-slate-900">{data.summary.totalMaintenanceRecords}</p>
						</div>
					</div>
				</Card>

				<Card class="p-6">
					<div class="flex items-center gap-3">
						<div class="rounded-full bg-green-100 p-3">
							<Image class="h-6 w-6 text-green-600" />
						</div>
						<div>
							<p class="text-sm text-slate-600">Photos</p>
							<p class="text-2xl font-bold text-slate-900">{data.summary.totalPhotos}</p>
						</div>
					</div>
				</Card>

				<Card class="p-6">
					{@const TrendIcon = getConditionTrendIcon(data.summary.conditionTrend)}
					<div class="flex items-center gap-3">
						<div
							class="rounded-full p-3 {data.summary.conditionTrend === 'improving'
								? 'bg-green-100'
								: data.summary.conditionTrend === 'declining'
									? 'bg-red-100'
									: 'bg-slate-100'}"
						>
							<TrendIcon
								class="h-6 w-6 {getConditionTrendColor(data.summary.conditionTrend)}"
							/>
						</div>
						<div>
							<p class="text-sm text-slate-600">Condition Trend</p>
							<p class="text-lg font-bold capitalize {getConditionTrendColor(data.summary.conditionTrend)}">
								{data.summary.conditionTrend}
							</p>
						</div>
					</div>
				</Card>
			</div>

			<!-- Before & After Comparison -->
			{#if data.comparison.first && data.comparison.last}
				<Card class="p-6">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="text-lg font-semibold text-slate-900">Condition Comparison</h3>
						{#if data.comparison.scoreDifference}
							{@const Icon = data.comparison.scoreDifference > 0 ? ArrowUpRight : ArrowDownRight}
							<Badge
								variant={data.comparison.scoreDifference > 0
									? 'success'
									: data.comparison.scoreDifference < 0
										? 'destructive'
										: 'default'}
							>
								<Icon class="mr-1 h-3 w-3" />
								{Math.abs(data.comparison.scoreDifference)} points
								{data.comparison.scoreDifference > 0 ? 'improvement' : 'decline'}
							</Badge>
						{/if}
					</div>

					<div class="grid gap-6 md:grid-cols-2">
						<!-- First Photo -->
						<div>
							<div class="mb-2 flex items-center justify-between">
								<p class="text-sm font-medium text-slate-700">Initial Condition</p>
								<Badge variant="secondary">{formatDate(data.comparison.first.capturedDate)}</Badge>
							</div>
							<div class="overflow-hidden rounded-lg border border-slate-200">
								<img
									src={data.comparison.first.fileUrl}
									alt={data.comparison.first.title}
									class="h-64 w-full object-cover"
								/>
							</div>
							<div class="mt-2 flex items-center justify-between">
								<p class="text-sm text-slate-600">{data.comparison.first.title}</p>
								<span
									class="text-lg font-bold {getConditionScoreColor(data.comparison.first.assetConditionScore || 0)}"
								>
									{data.comparison.first.assetConditionScore}/10
								</span>
							</div>
						</div>

						<!-- Last Photo -->
						<div>
							<div class="mb-2 flex items-center justify-between">
								<p class="text-sm font-medium text-slate-700">Current Condition</p>
								<Badge variant="secondary">{formatDate(data.comparison.last.capturedDate)}</Badge>
							</div>
							<div class="overflow-hidden rounded-lg border border-slate-200">
								<img
									src={data.comparison.last.fileUrl}
									alt={data.comparison.last.title}
									class="h-64 w-full object-cover"
								/>
							</div>
							<div class="mt-2 flex items-center justify-between">
								<p class="text-sm text-slate-600">{data.comparison.last.title}</p>
								<span
									class="text-lg font-bold {getConditionScoreColor(data.comparison.last.assetConditionScore || 0)}"
								>
									{data.comparison.last.assetConditionScore}/10
								</span>
							</div>
						</div>
					</div>
				</Card>
			{/if}

			<!-- Maintenance Frequency -->
			{#if data.frequency.totalMaintenances > 0}
				<Card class="p-6">
					<h3 class="mb-4 text-lg font-semibold text-slate-900">Maintenance Statistics</h3>
					<div class="grid gap-6 md:grid-cols-3">
						<div>
							<p class="text-sm text-slate-600">Total Maintenances</p>
							<p class="text-3xl font-bold text-slate-900">{data.frequency.totalMaintenances}</p>
						</div>
						{#if data.frequency.averageDaysBetween}
							<div>
								<p class="text-sm text-slate-600">Average Interval</p>
								<p class="text-3xl font-bold text-slate-900">{data.frequency.averageDaysBetween}</p>
								<p class="text-sm text-slate-500">days</p>
							</div>
						{/if}
						{#if data.summary.averageConditionScore}
							<div>
								<p class="text-sm text-slate-600">Average Condition Score</p>
								<p
									class="text-3xl font-bold {getConditionScoreColor(data.summary.averageConditionScore)}"
								>
									{data.summary.averageConditionScore}/10
								</p>
							</div>
						{/if}
					</div>
				</Card>
			{/if}
		{/if}

	{:else if activeTab === 'condition'}
		<!-- Condition Timeline -->
		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Condition Timeline</h3>
			{#if data.conditionTimeline.length === 0}
				<div class="py-12 text-center">
					<AlertCircle class="mx-auto mb-3 h-12 w-12 text-slate-400" />
					<p class="text-sm text-slate-600">No condition photos available</p>
				</div>
			{:else}
				<div class="space-y-6">
					{#each data.conditionTimeline as doc, index}
						<div class="flex gap-6">
							<!-- Timeline Line -->
							<div class="flex flex-col items-center">
								<div
									class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full {getConditionScoreColor(doc.assetConditionScore || 0)} bg-current bg-opacity-10"
								>
									<span class="text-sm font-bold {getConditionScoreColor(doc.assetConditionScore || 0)}">
										{doc.assetConditionScore}
									</span>
								</div>
								{#if index < data.conditionTimeline.length - 1}
									<div class="h-full w-0.5 bg-slate-200"></div>
								{/if}
							</div>

							<!-- Content -->
							<div class="flex-1 pb-6">
								<div class="mb-2 flex items-center gap-3">
									<p class="font-medium text-slate-900">{doc.title}</p>
									<Badge variant="secondary">{formatDate(doc.capturedDate)}</Badge>
								</div>
								<div class="overflow-hidden rounded-lg border border-slate-200">
									<img
										src={doc.fileUrl}
										alt={doc.title}
										class="h-48 w-full object-cover"
									/>
								</div>
								{#if doc.description}
									<p class="mt-2 text-sm text-slate-600">{doc.description}</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</Card>

	{:else if activeTab === 'maintenance'}
		<!-- Maintenance Timeline -->
		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Maintenance History</h3>
			{#if data.maintenanceTimeline.length === 0}
				<div class="py-12 text-center">
					<Wrench class="mx-auto mb-3 h-12 w-12 text-slate-400" />
					<p class="text-sm text-slate-600">No maintenance records available</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each data.maintenanceTimeline as doc}
						<div class="rounded-lg border border-slate-200 p-4">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="mb-1 flex items-center gap-3">
										<Wrench class="h-5 w-5 text-purple-600" />
										<p class="font-medium text-slate-900">{doc.title}</p>
									</div>
									<p class="text-sm text-slate-600">{doc.description}</p>
									<div class="mt-2 flex items-center gap-4 text-xs text-slate-500">
										<span>{formatDate(doc.capturedDate || doc.createdAt)}</span>
										{#if doc.relatedWorkOrderId}
											<a
												href="/maintenance/work-orders/{doc.relatedWorkOrderId}"
												class="text-blue-600 hover:text-blue-700"
											>
												Work Order #{doc.relatedWorkOrderId}
											</a>
										{/if}
									</div>
								</div>
								{#if doc.assetConditionScore}
									<div class="text-right">
										<p class="text-xs text-slate-500">Condition After</p>
										<p class="text-xl font-bold {getConditionScoreColor(doc.assetConditionScore)}">
											{doc.assetConditionScore}/10
										</p>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</Card>

	{:else if activeTab === 'all'}
		<!-- All Documents -->
		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">All Documents</h3>
			{#if data.documents.length === 0}
				<div class="py-12 text-center">
					<FileText class="mx-auto mb-3 h-12 w-12 text-slate-400" />
					<p class="text-sm text-slate-600">No documents available</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each data.documents as doc}
						<div class="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
							<div class="flex items-center gap-3">
								<FileText class="h-5 w-5 text-slate-400" />
								<div>
									<p class="font-medium text-slate-900">{doc.title}</p>
									<div class="flex items-center gap-3 text-sm text-slate-500">
										<Badge variant="secondary">{doc.type}</Badge>
										<span>{formatFileSize(doc.fileSize)}</span>
										<span>{formatDate(doc.createdAt)}</span>
									</div>
								</div>
							</div>
							<Button variant="ghost" size="sm">View</Button>
						</div>
					{/each}
				</div>
			{/if}
		</Card>
	{/if}
</div>

<!-- Document Upload Dialog -->
<DocumentUploadDialog
	bind:open={showUploadDialog}
	assetId={data.asset.id}
	assetName={data.asset.name}
/>
