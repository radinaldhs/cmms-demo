<script lang="ts">
	import { Bell, Menu } from 'lucide-svelte';
	import { unreadCount, mobileSidebarOpen } from '$stores';
	import { Badge } from '$components/ui';
	import { page } from '$app/stores';

	// Generate breadcrumbs from current path
	let breadcrumbs = $derived(() => {
		const segments = $page.url.pathname.split('/').filter(Boolean);
		if (segments.length === 0) return [{ label: 'Dashboard', href: '/' }];

		return segments.map((segment, index) => {
			const href = '/' + segments.slice(0, index + 1).join('/');
			const label = segment
				.split('-')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ');
			return { label, href };
		});
	});
</script>

<header class="sticky top-0 z-30 border-b border-slate-200 bg-white">
	<div class="flex h-16 items-center justify-between px-4 sm:px-6">
		<!-- Mobile menu button -->
		<button
			onclick={() => mobileSidebarOpen.toggle()}
			class="mr-2 rounded-lg p-2 hover:bg-slate-100 md:hidden"
			aria-label="Toggle menu"
		>
			<Menu class="h-6 w-6 text-slate-700" />
		</button>

		<!-- Breadcrumbs -->
		<nav class="flex flex-1 items-center space-x-2 overflow-hidden text-sm">
			<a href="/" class="hidden text-slate-500 hover:text-slate-900 sm:inline">Home</a>
			{#each breadcrumbs() as crumb, i}
				{#if i > 0 || breadcrumbs().length === 1}
					<span class="hidden text-slate-400 sm:inline">/</span>
					{#if i === breadcrumbs().length - 1}
						<span class="truncate font-medium text-slate-900">{crumb.label}</span>
					{:else}
						<a href={crumb.href} class="hidden truncate text-slate-500 hover:text-slate-900 sm:inline">{crumb.label}</a>
					{/if}
				{/if}
			{/each}
		</nav>

		<!-- Right side actions -->
		<div class="flex items-center gap-4">
			<!-- Notifications -->
			<a
				href="/notifications"
				class="relative rounded-lg p-2 hover:bg-slate-100"
				aria-label="Notifications"
			>
				<Bell class="h-5 w-5 text-slate-700" />
				{#if $unreadCount > 0}
					<Badge
						variant="destructive"
						class="absolute -right-1 -top-1 h-5 min-w-[20px] rounded-full px-1 text-xs"
					>
						{$unreadCount > 9 ? '9+' : $unreadCount}
					</Badge>
				{/if}
			</a>
		</div>
	</div>
</header>
