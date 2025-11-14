<script lang="ts">
	import { TrendingUp, TrendingDown, Minus } from 'lucide-svelte';

	interface Props {
		value: number;
		suffix?: string;
		showIcon?: boolean;
	}

	let { value, suffix = '%', showIcon = true }: Props = $props();

	const isPositive = $derived(value > 0);
	const isNeutral = $derived(value === 0);
	const displayValue = $derived(Math.abs(value).toFixed(1));
</script>

<div class="flex items-center gap-1">
	{#if showIcon}
		{#if isNeutral}
			<Minus class="h-3 w-3 text-slate-400" />
		{:else if isPositive}
			<TrendingUp class="h-3 w-3 text-green-600" />
		{:else}
			<TrendingDown class="h-3 w-3 text-red-600" />
		{/if}
	{/if}
	<span
		class:text-green-600={isPositive}
		class:text-red-600={!isPositive && !isNeutral}
		class:text-slate-400={isNeutral}
		class="text-sm font-medium"
	>
		{#if !isNeutral}{isPositive ? '+' : ''}{/if}{displayValue}{suffix}
	</span>
</div>
