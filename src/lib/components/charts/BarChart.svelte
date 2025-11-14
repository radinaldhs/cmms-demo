<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

	interface Props {
		data: any;
		options?: any;
	}

	let { data, options = {} }: Props = $props();
	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(() => {
		Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

		chart = new Chart(canvas, {
			type: 'bar',
			data: data,
			options: options
		});

		return () => {
			chart?.destroy();
		};
	});

	$effect(() => {
		if (chart) {
			chart.data = data;
			chart.options = options;
			chart.update();
		}
	});
</script>

<canvas bind:this={canvas}></canvas>
