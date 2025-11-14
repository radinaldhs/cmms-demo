<script lang="ts">
	interface Props {
		value: number;
		max?: number;
		size?: number;
		strokeWidth?: number;
		color?: string;
		label?: string;
	}

	let { value, max = 100, size = 120, strokeWidth = 8, color = '#3b82f6', label }: Props = $props();

	const percentage = $derived((value / max) * 100);
	const radius = $derived((size - strokeWidth) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const offset = $derived(circumference - (percentage / 100) * circumference);
</script>

<div class="relative inline-flex items-center justify-center" style="width: {size}px; height: {size}px;">
	<svg width={size} height={size} class="transform -rotate-90">
		<!-- Background circle -->
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			stroke="#e5e7eb"
			stroke-width={strokeWidth}
			fill="none"
		/>
		<!-- Progress circle -->
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			stroke={color}
			stroke-width={strokeWidth}
			fill="none"
			stroke-dasharray={circumference}
			stroke-dashoffset={offset}
			stroke-linecap="round"
			class="transition-all duration-1000 ease-out"
		/>
	</svg>
	<div class="absolute inset-0 flex flex-col items-center justify-center">
		<span class="text-2xl font-bold text-slate-900">{percentage.toFixed(0)}%</span>
		{#if label}
			<span class="text-xs text-slate-600">{label}</span>
		{/if}
	</div>
</div>
