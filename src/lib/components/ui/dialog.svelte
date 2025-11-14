<script lang="ts">
	import { cn } from '$utils';
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		title?: string;
		description?: string;
		children?: Snippet;
		class?: string;
	}

	let { open = $bindable(false), onClose, title, description, children, class: className }: Props = $props();

	function handleClose() {
		open = false;
		onClose?.();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div
			class={cn(
				'relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl',
				className
			)}
		>
			<button
				onclick={handleClose}
				class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
				aria-label="Close"
			>
				<X class="h-4 w-4" />
			</button>

			{#if title}
				<div class="mb-4">
					<h2 class="text-lg font-semibold text-slate-900">{title}</h2>
					{#if description}
						<p class="mt-1 text-sm text-slate-600">{description}</p>
					{/if}
				</div>
			{/if}

			<div class="mt-4">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
