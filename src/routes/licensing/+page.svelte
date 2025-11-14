<script lang="ts">
	import { Card, Badge, Button } from '$components/ui';
	import { Shield, Mail, Phone, Clock, ExternalLink } from 'lucide-svelte';
	import { formatDate } from '$utils';
	import TicketFormDialog from '$lib/components/TicketFormDialog.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showNewTicketDialog = $state(false);

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Open: 'default',
			'In Progress': 'warning',
			Resolved: 'success',
			Closed: 'secondary'
		};
		return variants[status] || 'default';
	}

	function handleContactSupport() {
		const subject = encodeURIComponent('Support Request - CMMS POC');
		const body = encodeURIComponent(
			`Hello Support Team,\n\n[Please describe your issue or inquiry here]\n\nLicense Key: ${data.license.licenseKey}\nCompany: ${data.license.companyName}\n\nThank you.`
		);
		window.location.href = `mailto:${data.license.supportEmail}?subject=${subject}&body=${body}`;
	}
</script>

<div class="space-y-4 sm:space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Licensing & Support</h1>
		<p class="text-sm text-slate-600 sm:text-base">License information and support tickets</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<Card class="p-6">
			<div class="mb-4 flex items-center gap-3">
				<div class="rounded-full bg-blue-100 p-3">
					<Shield class="h-6 w-6 text-blue-600" />
				</div>
				<h3 class="text-lg font-semibold text-slate-900">License Information</h3>
			</div>

			<dl class="space-y-3">
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">Company</dt>
					<dd class="text-sm font-medium text-slate-900">{data.license.companyName}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">License Key</dt>
					<dd class="text-sm font-mono text-slate-900">{data.license.licenseKey.substring(0, 20)}...</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">Status</dt>
					<dd><Badge variant="success">Active</Badge></dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">Max Users</dt>
					<dd class="text-sm font-medium text-slate-900">{data.license.maxUsers || 'Unlimited'}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">Expiry Date</dt>
					<dd class="text-sm font-medium text-slate-900">{formatDate(data.license.expiryDate)}</dd>
				</div>
			</dl>
		</Card>

		<Card class="p-6">
			<div class="mb-4 flex items-center gap-3">
				<div class="rounded-full bg-green-100 p-3">
					<Clock class="h-6 w-6 text-green-600" />
				</div>
				<h3 class="text-lg font-semibold text-slate-900">Support SLA</h3>
			</div>

			<dl class="space-y-3">
				<div class="flex items-start justify-between">
					<dt class="flex items-center gap-2 text-sm text-slate-600">
						<Mail class="h-4 w-4" />
						Email
					</dt>
					<dd class="text-sm font-medium text-slate-900">{data.license.supportEmail}</dd>
				</div>
				<div class="flex items-start justify-between">
					<dt class="flex items-center gap-2 text-sm text-slate-600">
						<Phone class="h-4 w-4" />
						Phone
					</dt>
					<dd class="text-sm font-medium text-slate-900">{data.license.supportPhone}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">Response Time</dt>
					<dd class="text-sm font-medium text-slate-900">{data.license.slaResponseTime}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-sm text-slate-600">Channels</dt>
					<dd class="text-sm font-medium text-slate-900">{data.license.supportChannel}</dd>
				</div>
			</dl>

			<Button class="mt-4 w-full" onclick={handleContactSupport}>
				<Mail class="mr-2 h-4 w-4" />
				Contact Support
			</Button>
		</Card>
	</div>

	<Card class="p-6">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-semibold text-slate-900">Support Tickets</h3>
			<Button size="sm" onclick={() => (showNewTicketDialog = true)}>New Ticket</Button>
		</div>

		<div class="space-y-3">
			{#each data.tickets as ticket}
				<a
					href="/licensing/tickets/{ticket.id}"
					class="flex items-start justify-between border-b border-slate-100 pb-3 transition-colors hover:bg-slate-50 last:border-0"
				>
					<div class="flex-1">
						<p class="font-medium text-slate-900">{ticket.subject}</p>
						<p class="text-sm text-slate-600">#{ticket.ticketNumber}</p>
						<p class="text-xs text-slate-500">Created {formatDate(ticket.createdAt)}</p>
					</div>
					<Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
				</a>
			{/each}

			{#if data.tickets.length === 0}
				<div class="py-12 text-center text-slate-500">
					<p>No support tickets yet</p>
				</div>
			{/if}
		</div>
	</Card>
</div>

<TicketFormDialog bind:open={showNewTicketDialog} />
