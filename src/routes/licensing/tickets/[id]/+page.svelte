<script lang="ts">
	import { Card, Badge, Button, Dialog, Input, Label, Textarea } from '$components/ui';
	import { ArrowLeft, MessageSquare, Clock, User, AlertCircle } from 'lucide-svelte';
	import { formatDate } from '$utils';
	import { goto, invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab = $state('details');
	let showStatusDialog = $state(false);
	let showCommentDialog = $state(false);
	let isSubmitting = $state(false);
	let newComment = $state('');
	let selectedStatus = $state(data.ticket.status);

	function getStatusVariant(status: string) {
		const variants: Record<string, any> = {
			Open: 'default',
			'In Progress': 'warning',
			Resolved: 'success',
			Closed: 'secondary'
		};
		return variants[status] || 'default';
	}

	function getPriorityVariant(priority: string) {
		const variants: Record<string, any> = {
			Critical: 'destructive',
			High: 'warning',
			Medium: 'default',
			Low: 'secondary'
		};
		return variants[priority] || 'default';
	}

	async function handleStatusChange() {
		isSubmitting = true;
		try {
			const response = await fetch('/api/support-tickets', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: data.ticket.id,
					status: selectedStatus,
					...(selectedStatus === 'Resolved' && !data.ticket.resolvedAt
						? { resolvedAt: new Date().toISOString() }
						: {})
				})
			});

			if (!response.ok) {
				throw new Error('Failed to update ticket status');
			}

			toast.success('Ticket status updated successfully');
			showStatusDialog = false;
			await invalidateAll();
		} catch (error) {
			toast.error('Failed to update ticket status');
		} finally {
			isSubmitting = false;
		}
	}

	async function handleAddComment() {
		if (!newComment.trim()) {
			toast.error('Please enter a comment');
			return;
		}

		isSubmitting = true;
		try {
			const response = await fetch('/api/support-tickets/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ticketId: data.ticket.id,
					author: data.ticket.submittedBy, // In real app, this would be current user
					content: newComment,
					isInternal: false
				})
			});

			if (!response.ok) {
				throw new Error('Failed to add comment');
			}

			toast.success('Comment added successfully');
			newComment = '';
			showCommentDialog = false;
			await invalidateAll();
		} catch (error) {
			toast.error('Failed to add comment');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-6">
	<div>
		<a
			href="/licensing"
			class="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
		>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Licensing & Support
		</a>

		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold text-slate-900">{data.ticket.subject}</h1>
				<p class="text-slate-600">
					{data.ticket.ticketNumber} • Submitted by {data.ticket.submittedBy}
				</p>
			</div>
			<div class="flex gap-2">
				<Badge variant={getStatusVariant(data.ticket.status)}>{data.ticket.status}</Badge>
				<Badge variant={getPriorityVariant(data.ticket.priority)}>
					{data.ticket.priority} Priority
				</Badge>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	{#if data.ticket.status !== 'Closed'}
		<Card class="p-4">
			<div class="flex items-center gap-3">
				<span class="text-sm font-medium text-slate-700">Quick Actions:</span>
				{#if data.ticket.status === 'Open'}
					<Button
						size="sm"
						onclick={() => {
							selectedStatus = 'In Progress';
							showStatusDialog = true;
						}}
					>
						Start Working
					</Button>
				{/if}
				{#if data.ticket.status === 'In Progress'}
					<Button
						size="sm"
						onclick={() => {
							selectedStatus = 'Resolved';
							showStatusDialog = true;
						}}
					>
						Mark as Resolved
					</Button>
				{/if}
				{#if data.ticket.status === 'Resolved'}
					<Button
						size="sm"
						onclick={() => {
							selectedStatus = 'Closed';
							showStatusDialog = true;
						}}
					>
						Close Ticket
					</Button>
				{/if}
				<Button size="sm" variant="outline" onclick={() => (showCommentDialog = true)}>
					<MessageSquare class="mr-2 h-4 w-4" />
					Add Comment
				</Button>
				<Button
					size="sm"
					variant="outline"
					onclick={() => {
						showStatusDialog = true;
					}}
				>
					Change Status
				</Button>
			</div>
		</Card>
	{/if}

	<!-- Tabs -->
	<div class="border-b border-slate-200">
		<nav class="-mb-px flex space-x-8">
			<button
				onclick={() => (activeTab = 'details')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'details'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Details
			</button>
			<button
				onclick={() => (activeTab = 'comments')}
				class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'comments'
					? 'border-blue-600 text-blue-600'
					: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
			>
				Comments ({data.ticket.comments.length})
			</button>
		</nav>
	</div>

	{#if activeTab === 'details'}
		<div class="grid gap-6 md:grid-cols-2">
			<Card class="p-6">
				<h3 class="mb-4 text-lg font-semibold text-slate-900">Ticket Information</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Ticket Number</dt>
						<dd class="text-sm font-medium text-slate-900">{data.ticket.ticketNumber}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Category</dt>
						<dd class="text-sm font-medium text-slate-900">{data.ticket.category}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Priority</dt>
						<dd class="text-sm font-medium text-slate-900">
							<Badge variant={getPriorityVariant(data.ticket.priority)}>
								{data.ticket.priority}
							</Badge>
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Status</dt>
						<dd class="text-sm font-medium text-slate-900">
							<Badge variant={getStatusVariant(data.ticket.status)}>
								{data.ticket.status}
							</Badge>
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Submitted By</dt>
						<dd class="text-sm font-medium text-slate-900">{data.ticket.submittedBy}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Assigned To</dt>
						<dd class="text-sm font-medium text-slate-900">
							{data.ticket.assignedTo || 'Unassigned'}
						</dd>
					</div>
				</dl>
			</Card>

			<Card class="p-6">
				<h3 class="mb-4 text-lg font-semibold text-slate-900">Timeline</h3>
				<dl class="space-y-3">
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Created</dt>
						<dd class="text-sm font-medium text-slate-900">{formatDate(data.ticket.createdAt)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-sm text-slate-600">Last Updated</dt>
						<dd class="text-sm font-medium text-slate-900">{formatDate(data.ticket.updatedAt)}</dd>
					</div>
					{#if data.ticket.resolvedAt}
						<div class="flex justify-between">
							<dt class="text-sm text-slate-600">Resolved</dt>
							<dd class="text-sm font-medium text-green-600">
								{formatDate(data.ticket.resolvedAt)}
							</dd>
						</div>
					{/if}
				</dl>
			</Card>
		</div>

		<Card class="p-6">
			<h3 class="mb-2 text-lg font-semibold text-slate-900">Description</h3>
			<p class="text-sm text-slate-600">{data.ticket.description}</p>
		</Card>
	{:else if activeTab === 'comments'}
		<Card class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-900">
					Conversation ({data.ticket.comments.length})
				</h3>
				<Button size="sm" onclick={() => (showCommentDialog = true)}>
					<MessageSquare class="mr-2 h-4 w-4" />
					Add Comment
				</Button>
			</div>

			<div class="space-y-4">
				{#each data.ticket.comments as comment}
					<div class="border-b border-slate-100 pb-4 last:border-0">
						<div class="mb-2 flex items-start justify-between">
							<div class="flex items-center gap-2">
								<div class="rounded-full bg-blue-100 p-2">
									<User class="h-4 w-4 text-blue-600" />
								</div>
								<div>
									<p class="font-medium text-slate-900">{comment.author}</p>
									<p class="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
								</div>
							</div>
							{#if comment.isInternal}
								<Badge variant="warning">Internal Note</Badge>
							{/if}
						</div>
						<p class="ml-12 text-sm text-slate-600">{comment.content}</p>
					</div>
				{/each}

				{#if data.ticket.comments.length === 0}
					<div class="py-12 text-center text-slate-500">
						<MessageSquare class="mx-auto mb-2 h-12 w-12 text-slate-300" />
						<p>No comments yet</p>
					</div>
				{/if}
			</div>
		</Card>
	{/if}
</div>

<!-- Change Status Dialog -->
<Dialog bind:open={showStatusDialog} title="Change Ticket Status">
	<div class="space-y-4">
		<div>
			<Label for="status">New Status</Label>
			<select
				id="status"
				bind:value={selectedStatus}
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			>
				<option value="Open">Open</option>
				<option value="In Progress">In Progress</option>
				<option value="Resolved">Resolved</option>
				<option value="Closed">Closed</option>
			</select>
		</div>

		<div class="flex justify-end gap-2 pt-4">
			<Button variant="outline" onclick={() => (showStatusDialog = false)} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button onclick={handleStatusChange} disabled={isSubmitting}>
				{isSubmitting ? 'Updating...' : 'Update Status'}
			</Button>
		</div>
	</div>
</Dialog>

<!-- Add Comment Dialog -->
<Dialog bind:open={showCommentDialog} title="Add Comment">
	<div class="space-y-4">
		<div>
			<Label for="comment">Comment</Label>
			<Textarea
				id="comment"
				bind:value={newComment}
				placeholder="Enter your comment here..."
				rows={5}
				class="mt-1"
			/>
		</div>

		<div class="flex justify-end gap-2 pt-4">
			<Button variant="outline" onclick={() => (showCommentDialog = false)} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button onclick={handleAddComment} disabled={isSubmitting}>
				{isSubmitting ? 'Adding...' : 'Add Comment'}
			</Button>
		</div>
	</div>
</Dialog>
