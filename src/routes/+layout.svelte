<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { MainLayout } from '$lib/components/layout';
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>CMMS POC - Computerized Maintenance Management System</title>
</svelte:head>

<MainLayout>
	{@render children?.()}
</MainLayout>

<Toaster richColors position="top-right" />
