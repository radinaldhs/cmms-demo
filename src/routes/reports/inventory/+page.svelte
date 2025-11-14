<script lang="ts">
	import { Card, Button, Input, Badge } from '$components/ui';
	import { ArrowLeft, Download, Search, AlertTriangle } from 'lucide-svelte';
	import { formatCurrency, exportToCSV } from '$utils';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedStatus = $state<string>('all');

	const filteredData = $derived(
		data.data.filter((item: any) => {
			const matchesSearch = searchQuery
				? item.partCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.category.toLowerCase().includes(searchQuery.toLowerCase())
				: true;

			const matchesStatus =
				selectedStatus === 'all' ? true : item.stockStatus === selectedStatus;

			return matchesSearch && matchesStatus;
		})
	);

	function getStockStatusVariant(status: string) {
		const variants: Record<string, any> = {
			CRITICAL: 'destructive',
			LOW: 'warning',
			ADEQUATE: 'success',
			OVERSTOCKED: 'secondary'
		};
		return variants[status] || 'default';
	}

	function exportReport() {
		const csvData = filteredData.map((part: any) => ({
			'Part Code': part.partCode,
			Description: part.description,
			Category: part.category,
			'Current Stock': part.currentStock,
			'Min Stock': part.minStock,
			'Max Stock': part.maxStock,
			'Stock Status': part.stockStatus,
			Warehouse: part.warehouse,
			'Unit Cost': part.unitCost,
			'Total Value': part.totalValue,
			Supplier: part.supplier || 'N/A',
			'Lead Time (Days)': part.leadTimeDays || 'N/A',
			'Reorder Needed': part.reorderNeeded ? 'Yes' : 'No',
			'Reorder Quantity': part.reorderQuantity
		}));

		exportToCSV(csvData, `inventory-status-report-${new Date().toISOString().split('T')[0]}.csv`);
		toast.success('Report exported successfully');
	}

	const criticalCount = $derived(
		data.data.filter((item: any) => item.stockStatus === 'CRITICAL').length
	);
	const lowCount = $derived(data.data.filter((item: any) => item.stockStatus === 'LOW').length);
	const reorderCount = $derived(data.data.filter((item: any) => item.reorderNeeded).length);
</script>

<div class="space-y-6">
	<div>
		<a
			href="/reports"
			class="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
		>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Reports
		</a>
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold text-slate-900">Inventory Status Report</h1>
				<p class="text-slate-600">Monitor stock levels, reorder points, and inventory valuation</p>
			</div>
			<Button onclick={exportReport}>
				<Download class="mr-2 h-4 w-4" />
				Export CSV
			</Button>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-4">
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Total Parts</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">{data.summary.totalRecords}</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Total Value</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">
				{formatCurrency(data.summary.additionalMetrics?.totalValue || 0)}
			</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Critical/Low Stock</p>
			<p class="mt-2 text-3xl font-bold text-red-600">{criticalCount + lowCount}</p>
		</Card>
		<Card class="p-6">
			<p class="text-sm font-medium text-slate-600">Reorder Needed</p>
			<p class="mt-2 text-3xl font-bold text-orange-600">{reorderCount}</p>
		</Card>
	</div>

	{#if criticalCount > 0 || lowCount > 0}
		<Card class="border-red-200 bg-red-50 p-4">
			<div class="flex items-center gap-3">
				<AlertTriangle class="h-6 w-6 text-red-600" />
				<div>
					<h3 class="font-semibold text-red-900">Stock Alert</h3>
					<p class="text-sm text-red-700">
						{criticalCount > 0 && `${criticalCount} items are critically low. `}
						{lowCount > 0 && `${lowCount} items are below minimum stock level.`}
					</p>
				</div>
			</div>
		</Card>
	{/if}

	<Card class="p-6">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-semibold text-slate-900">Filter by Stock Status</h3>
			<div class="flex gap-2">
				<button type="button" onclick={() => (selectedStatus = 'all')}>
					<Badge
						variant={selectedStatus === 'all' ? 'default' : 'outline'}
						class="cursor-pointer"
					>
						All
					</Badge>
				</button>
				<button type="button" onclick={() => (selectedStatus = 'CRITICAL')}>
					<Badge
						variant={selectedStatus === 'CRITICAL' ? 'destructive' : 'outline'}
						class="cursor-pointer"
					>
						Critical
					</Badge>
				</button>
				<button type="button" onclick={() => (selectedStatus = 'LOW')}>
					<Badge
						variant={selectedStatus === 'LOW' ? 'warning' : 'outline'}
						class="cursor-pointer"
					>
						Low
					</Badge>
				</button>
				<button type="button" onclick={() => (selectedStatus = 'ADEQUATE')}>
					<Badge
						variant={selectedStatus === 'ADEQUATE' ? 'success' : 'outline'}
						class="cursor-pointer"
					>
						Adequate
					</Badge>
				</button>
				<button type="button" onclick={() => (selectedStatus = 'OVERSTOCKED')}>
					<Badge
						variant={selectedStatus === 'OVERSTOCKED' ? 'secondary' : 'outline'}
						class="cursor-pointer"
					>
						Overstocked
					</Badge>
				</button>
			</div>
		</div>
	</Card>

	<Card class="p-4">
		<div class="relative">
			<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
			<Input
				type="text"
				placeholder="Search by part code, description, or category..."
				bind:value={searchQuery}
				class="pl-10"
			/>
		</div>
	</Card>

	<Card class="overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b border-slate-200 bg-slate-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Part Code</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Description</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-slate-600">Category</th>
						<th class="px-6 py-3 text-center text-xs font-medium uppercase text-slate-600">Stock</th>
						<th class="px-6 py-3 text-center text-xs font-medium uppercase text-slate-600">Status</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">Unit Cost</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase text-slate-600">Total Value</th>
						<th class="px-6 py-3 text-center text-xs font-medium uppercase text-slate-600">Reorder</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredData as part}
						<tr class="hover:bg-slate-50">
							<td class="px-6 py-4 text-sm font-medium text-slate-900">{part.partCode}</td>
							<td class="px-6 py-4 text-sm text-slate-900">
								<a href="/inventory/{part.partId}" class="font-medium text-blue-600 hover:underline">
									{part.description}
								</a>
								<div class="text-xs text-slate-500">{part.warehouse}</div>
							</td>
							<td class="px-6 py-4 text-sm text-slate-600">{part.category}</td>
							<td class="px-6 py-4 text-center text-sm">
								<div class="font-medium text-slate-900">{part.currentStock}</div>
								<div class="text-xs text-slate-500">
									Min: {part.minStock} / Max: {part.maxStock}
								</div>
							</td>
							<td class="px-6 py-4 text-center text-sm">
								<Badge variant={getStockStatusVariant(part.stockStatus)}>
									{part.stockStatus}
								</Badge>
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium text-slate-900">
								{formatCurrency(part.unitCost)}
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium text-slate-900">
								{formatCurrency(part.totalValue)}
							</td>
							<td class="px-6 py-4 text-center text-sm">
								{#if part.reorderNeeded}
									<div class="font-medium text-orange-600">{part.reorderQuantity}</div>
									<div class="text-xs text-slate-500">{part.leadTimeDays || 0} days</div>
								{:else}
									<span class="text-slate-400">-</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if filteredData.length === 0}
				<div class="py-12 text-center text-slate-500">
					No inventory items found matching your criteria
				</div>
			{/if}
		</div>
	</Card>

	<div class="text-center text-sm text-slate-600">
		Showing {filteredData.length} of {data.data.length} inventory items
	</div>
</div>
