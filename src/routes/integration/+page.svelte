<script lang="ts">
	import { Card, Badge, Button } from '$components/ui';
	import { RefreshCw, Download, Upload, CheckCircle, AlertCircle, XCircle } from 'lucide-svelte';
	import { formatDateTime } from '$utils';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let syncing = $state(false);

	async function syncFromSAP() {
		syncing = true;
		toast.info('Starting sync from SAP...');
		try {
			const res = await fetch('/api/sap/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ direction: 'pull' })
			});
			const result = await res.json();
			toast.success(`Synced ${result.itemsSynced} items from SAP`);
			setTimeout(() => location.reload(), 1000);
		} catch (error) {
			toast.error('Sync failed');
		} finally {
			syncing = false;
		}
	}

	async function syncToSAP() {
		syncing = true;
		toast.info('Starting sync to SAP...');
		try {
			const res = await fetch('/api/sap/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ direction: 'push' })
			});
			const result = await res.json();
			toast.success(`Pushed ${result.itemsSynced} items to SAP`);
			setTimeout(() => location.reload(), 1000);
		} catch (error) {
			toast.error('Sync failed');
		} finally {
			syncing = false;
		}
	}

	function getStatusIcon(status: string) {
		if (status === 'Success') return CheckCircle;
		if (status === 'Warning') return AlertCircle;
		return XCircle;
	}

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Success: 'success',
			Warning: 'warning',
			Failed: 'destructive',
			Pending: 'default'
		};
		return variants[status] || 'default';
	}
</script>

<div class="space-y-4 sm:space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">SAP Business One Integration</h1>
		<p class="text-sm text-slate-600 sm:text-base">Manage inventory synchronization with SAP B1</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Integration Status</h3>
			<dl class="space-y-3">
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">Status</dt>
					<dd><Badge variant="success">Connected</Badge></dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">API URL</dt>
					<dd class="text-sm font-medium text-slate-900">{data.settings.apiUrl}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">Last Sync</dt>
					<dd class="text-sm font-medium text-slate-900">
						{data.settings.lastSyncTime ? formatDateTime(data.settings.lastSyncTime) : 'Never'}
					</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">Auto Sync</dt>
					<dd><Badge variant={data.settings.autoSyncEnabled ? 'success' : 'secondary'}>
						{data.settings.autoSyncEnabled ? 'Enabled' : 'Disabled'}
					</Badge></dd>
				</div>
			</dl>
		</Card>

		<Card class="p-6">
			<h3 class="mb-4 text-lg font-semibold text-slate-900">Sync Actions</h3>
			<div class="space-y-3">
				<Button class="w-full" onclick={syncFromSAP} disabled={syncing}>
					<Download class="mr-2 h-4 w-4" />
					{syncing ? 'Syncing...' : 'Sync from SAP'}
				</Button>
				<Button variant="outline" class="w-full" onclick={syncToSAP} disabled={syncing}>
					<Upload class="mr-2 h-4 w-4" />
					{syncing ? 'Syncing...' : 'Sync to SAP'}
				</Button>
				<p class="text-xs text-slate-500">
					Pull: Import items from SAP B1 to CMMS<br />
					Push: Export local changes to SAP B1
				</p>
			</div>
		</Card>
	</div>

	<Card class="p-6">
		<h3 class="mb-4 text-lg font-semibold text-slate-900">Recent Sync History</h3>
		<div class="space-y-3">
			{#each data.recentLogs as log}
				<div class="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0">
					<div class="flex items-start gap-3">
						<svelte:component this={getStatusIcon(log.status)}
							class="h-5 w-5 mt-0.5 {log.status === 'Success' ? 'text-green-600' : log.status === 'Warning' ? 'text-yellow-600' : 'text-red-600'}"
						/>
						<div>
							<p class="text-sm font-medium text-slate-900">
								{log.direction === 'PULL' ? 'Synced from SAP' : 'Synced to SAP'}
							</p>
							<p class="text-xs text-slate-600">
								{log.itemsSynced} items synced, {log.errors} errors
							</p>
							<p class="text-xs text-slate-500">{formatDateTime(log.completedAt)}</p>
						</div>
					</div>
					<Badge variant={getStatusVariant(log.status)}>{log.status}</Badge>
				</div>
			{/each}
		</div>
	</Card>
</div>
