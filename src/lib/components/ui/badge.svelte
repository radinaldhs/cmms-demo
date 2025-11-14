<script lang="ts">
	import { cn } from '$utils';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';
		class?: string;
		children?: Snippet;
	}

	let { variant = 'default', class: className, children }: Props = $props();

	const variants = {
		default: 'bg-slate-900 text-slate-50 hover:bg-slate-900/80',
		secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-200/80',
		destructive: 'bg-red-600 text-slate-50 hover:bg-red-600/80',
		success: 'bg-green-600 text-white hover:bg-green-600/80',
		warning: 'bg-yellow-500 text-white hover:bg-yellow-500/80',
		outline: 'border border-slate-300 text-slate-900'
	};
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
		variants[variant],
		className
	)}
>
	{@render children?.()}
</span>
