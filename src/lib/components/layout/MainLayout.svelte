<script lang="ts">
	import Sidebar from './Sidebar.svelte';
	import Topbar from './Topbar.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="min-h-screen bg-slate-50">
	<!-- Sidebar -->
	<Sidebar />

	<!-- Main content area -->
	<div class="pl-0 md:pl-64">
		<!-- Topbar -->
		<Topbar />

		<!-- Page content -->
		<main class="p-4 sm:p-6">
			{@render children?.()}
		</main>
	</div>
</div>
