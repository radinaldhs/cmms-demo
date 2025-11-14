<script lang="ts">
	import { Dialog, Button, Input, Label, Textarea } from '$components/ui';
	import { toast } from 'svelte-sonner';
	import { invalidateAll, goto } from '$app/navigation';
	import type { SupportTicket } from '$types';

	interface Props {
		open?: boolean;
		ticket?: SupportTicket;
	}

	let { open = $bindable(false), ticket }: Props = $props();

	let isSubmitting = $state(false);
	let formData = $state({
		subject: ticket?.subject || '',
		description: ticket?.description || '',
		category: ticket?.category || 'General Inquiry',
		priority: ticket?.priority || 'Medium',
		submittedBy: ticket?.submittedBy || 'Admin User' // In real app, this would be current user
	});

	function resetForm() {
		formData = {
			subject: '',
			description: '',
			category: 'General Inquiry',
			priority: 'Medium',
			submittedBy: 'Admin User'
		};
	}

	async function handleSubmit() {
		// Validation
		if (!formData.subject.trim()) {
			toast.error('Please enter a subject');
			return;
		}

		if (!formData.description.trim()) {
			toast.error('Please enter a description');
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/support-tickets', {
				method: ticket ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(
					ticket
						? { id: ticket.id, ...formData }
						: {
								...formData,
								status: 'Open',
								comments: []
							}
				)
			});

			if (!response.ok) {
				throw new Error('Failed to submit ticket');
			}

			const result = await response.json();

			toast.success(ticket ? 'Ticket updated successfully' : 'Support ticket created successfully');
			open = false;
			resetForm();
			await invalidateAll();

			// Navigate to the newly created ticket
			if (!ticket) {
				await goto(`/licensing/tickets/${result.id}`);
			}
		} catch (error) {
			toast.error(ticket ? 'Failed to update ticket' : 'Failed to create ticket');
		} finally {
			isSubmitting = false;
		}
	}

	$effect(() => {
		if (open && ticket) {
			formData = {
				subject: ticket.subject,
				description: ticket.description,
				category: ticket.category,
				priority: ticket.priority,
				submittedBy: ticket.submittedBy
			};
		}
	});
</script>

<Dialog
	bind:open
	title={ticket ? 'Edit Support Ticket' : 'Create Support Ticket'}
	description={ticket
		? 'Update the support ticket details'
		: 'Submit a new support ticket to our team'}
	class="max-w-2xl"
>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
		class="space-y-4"
	>
		<div class="grid gap-4">
			<div>
				<Label for="subject">Subject *</Label>
				<Input
					id="subject"
					bind:value={formData.subject}
					placeholder="Brief description of your issue"
					class="mt-1"
					required
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<Label for="category">Category *</Label>
					<select
						id="category"
						bind:value={formData.category}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						required
					>
						<option value="General Inquiry">General Inquiry</option>
						<option value="Technical Issue">Technical Issue</option>
						<option value="Feature Request">Feature Request</option>
						<option value="Integration">Integration</option>
						<option value="Billing">Billing</option>
						<option value="Bug Report">Bug Report</option>
					</select>
				</div>

				<div>
					<Label for="priority">Priority *</Label>
					<select
						id="priority"
						bind:value={formData.priority}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						required
					>
						<option value="Low">Low</option>
						<option value="Medium">Medium</option>
						<option value="High">High</option>
						<option value="Critical">Critical</option>
					</select>
				</div>
			</div>

			<div>
				<Label for="description">Description *</Label>
				<Textarea
					id="description"
					bind:value={formData.description}
					placeholder="Detailed description of your issue or request"
					rows={6}
					class="mt-1"
					required
				/>
			</div>
		</div>

		<div class="flex justify-end gap-2 pt-4">
			<Button
				type="button"
				variant="outline"
				onclick={() => {
					open = false;
					resetForm();
				}}
				disabled={isSubmitting}
			>
				Cancel
			</Button>
			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting
					? ticket
						? 'Updating...'
						: 'Creating...'
					: ticket
						? 'Update Ticket'
						: 'Create Ticket'}
			</Button>
		</div>
	</form>
</Dialog>
