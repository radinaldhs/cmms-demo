<script lang="ts">
	import {
		LayoutDashboard,
		Package,
		Truck,
		Wrench,
		Archive,
		BarChart3,
		Bell,
		Settings,
		ShieldCheck,
		Cable,
		X
	} from 'lucide-svelte';
	import { page } from '$app/stores';
	import { mobileSidebarOpen } from '$stores';

	interface NavItem {
		label: string;
		href: string;
		icon: any;
	}

	const navItems: NavItem[] = [
		{ label: 'Dashboard', href: '/', icon: LayoutDashboard },
		{ label: 'Assets', href: '/assets', icon: Package },
		{ label: 'Fleet', href: '/fleet', icon: Truck },
		{ label: 'Maintenance', href: '/maintenance', icon: Wrench },
		{ label: 'Inventory', href: '/inventory', icon: Archive },
		{ label: 'Integration', href: '/integration', icon: Cable },
		{ label: 'Reports', href: '/reports', icon: BarChart3 },
		{ label: 'Notifications', href: '/notifications', icon: Bell },
		{ label: 'Licensing', href: '/licensing', icon: ShieldCheck },
		{ label: 'Settings', href: '/settings', icon: Settings }
	];

	function isActive(href: string): boolean {
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname.startsWith(href);
	}

	function handleLinkClick() {
		// Close mobile sidebar when a link is clicked
		mobileSidebarOpen.close();
	}
</script>

<!-- Mobile backdrop overlay -->
{#if $mobileSidebarOpen}
	<div
		class="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
		onclick={() => mobileSidebarOpen.close()}
		role="button"
		tabindex="-1"
		aria-label="Close menu"
	></div>
{/if}

<!-- Sidebar -->
<aside
	class="fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out {$mobileSidebarOpen
		? 'translate-x-0'
		: '-translate-x-full'} md:translate-x-0"
>
	<div class="flex h-full flex-col">
		<!-- Logo / Header -->
		<div class="flex items-center justify-between border-b border-slate-200 p-6">
			<div>
				<h1 class="text-xl font-bold text-slate-900">CMMS POC</h1>
				<p class="text-sm text-slate-500">Demo Company Ltd.</p>
			</div>
			<!-- Close button (mobile only) -->
			<button
				onclick={() => mobileSidebarOpen.close()}
				class="rounded-lg p-1 hover:bg-slate-100 md:hidden"
				aria-label="Close sidebar"
			>
				<X class="h-5 w-5 text-slate-700" />
			</button>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-1 overflow-y-auto p-4">
			{#each navItems as item}
				<a
					href={item.href}
					onclick={handleLinkClick}
					class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors {isActive(
						item.href
					)
						? 'bg-slate-900 text-white'
						: 'text-slate-700 hover:bg-slate-100'}"
				>
					<svelte:component this={item.icon} class="h-5 w-5" />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="border-t border-slate-200 p-4">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold"
				>
					AU
				</div>
				<div class="flex-1 min-w-0">
					<p class="truncate text-sm font-medium text-slate-900">Admin User</p>
					<p class="truncate text-xs text-slate-500">admin@demo.com</p>
				</div>
			</div>
		</div>
	</div>
</aside>
