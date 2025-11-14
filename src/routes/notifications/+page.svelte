<script lang="ts">
	import { Card, Badge, Button } from '$components/ui';
	import { Bell, Check } from 'lucide-svelte';
	import { formatRelativeDate } from '$utils';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	async function markAsRead(id: string) {
		try {
			await fetch('/api/notifications', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});
			toast.success('Notification marked as read');
			setTimeout(() => location.reload(), 500);
		} catch (error) {
			toast.error('Failed to mark as read');
		}
	}

	async function markAllAsRead() {
		try {
			await fetch('/api/notifications', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ markAllAsRead: true })
			});
			toast.success('All notifications marked as read');
			setTimeout(() => location.reload(), 500);
		} catch (error) {
			toast.error('Failed to mark all as read');
		}
	}

	function getSeverityVariant(severity: string) {
		const variants: Record<string, any> = {
			Info: 'default',
			Success: 'success',
			Warning: 'warning',
			Error: 'destructive'
		};
		return variants[severity] || 'default';
	}
</script>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">Notifications</h1>
			<p class="text-sm text-slate-600 sm:text-base">Stay updated on system activities</p>
		</div>
		<Button class="w-full sm:w-auto" variant="outline" onclick={markAllAsRead}>
			<Check class="mr-2 h-4 w-4" />
			Mark All as Read
		</Button>
	</div>

	<Card class="p-6">
		<div class="space-y-4">
			{#each data.notifications as notification}
				<div class="flex items-start justify-between border-b border-slate-100 pb-4 last:border-0 {notification.readAt ? 'opacity-50' : ''}">
					<div class="flex items-start gap-3">
						<div class="rounded-full bg-slate-100 p-2 mt-1">
							<Bell class="h-4 w-4 text-slate-600" />
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium text-slate-900">{notification.message}</p>
							<p class="text-xs text-slate-500">{formatRelativeDate(notification.createdAt)}</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<Badge variant={getSeverityVariant(notification.severity)}>{notification.severity}</Badge>
						{#if !notification.readAt}
							<Button variant="ghost" size="sm" onclick={() => markAsRead(notification.id)}>
								<Check class="h-4 w-4" />
							</Button>
						{/if}
					</div>
				</div>
			{/each}
			{#if data.notifications.length === 0}
				<p class="text-center text-sm text-slate-500">No notifications</p>
			{/if}
		</div>
	</Card>
</div>
