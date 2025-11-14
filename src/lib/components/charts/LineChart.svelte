<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler } from 'chart.js';

	interface Props {
		data: any;
		options?: any;
	}

	let { data, options = {} }: Props = $props();
	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(() => {
		Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler);

		chart = new Chart(canvas, {
			type: 'line',
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
