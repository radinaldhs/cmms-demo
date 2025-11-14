<script lang="ts">
	import { onMount } from 'svelte';
	import QRCodeLib from 'qrcode';
	import { Button } from '$components/ui';
	import { Download } from 'lucide-svelte';

	interface Props {
		value: string;
		size?: number;
		showDownload?: boolean;
		label?: string;
	}

	let { value, size = 200, showDownload = true, label }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let error: string | undefined = $state();

	async function generateQRCode() {
		if (!canvas) return;

		try {
			await QRCodeLib.toCanvas(canvas, value, {
				width: size,
				margin: 2,
				color: {
					dark: '#0F172A', // slate-900
					light: '#FFFFFF'
				}
			});
			error = undefined;
		} catch (err) {
			error = 'Failed to generate QR code';
			console.error('QR Code generation error:', err);
		}
	}

	function downloadQRCode() {
		if (!canvas) return;

		const url = canvas.toDataURL('image/png');
		const link = document.createElement('a');
		link.download = `qr-code-${Date.now()}.png`;
		link.href = url;
		link.click();
	}

	onMount(() => {
		generateQRCode();
	});

	$effect(() => {
		// Regenerate when value or size changes
		if (value) {
			generateQRCode();
		}
	});
</script>

<div class="flex flex-col items-center gap-3">
	{#if label}
		<p class="text-sm font-medium text-slate-700">{label}</p>
	{/if}

	<div class="rounded-lg border border-slate-200 bg-white p-4">
		{#if error}
			<div class="flex h-[{size}px] w-[{size}px] items-center justify-center">
				<p class="text-sm text-red-600">{error}</p>
			</div>
		{:else}
			<canvas bind:this={canvas} class="block"></canvas>
		{/if}
	</div>

	{#if showDownload && canvas && !error}
		<Button variant="outline" size="sm" onclick={downloadQRCode}>
			<Download class="mr-2 h-4 w-4" />
			Download QR Code
		</Button>
	{/if}
</div>
