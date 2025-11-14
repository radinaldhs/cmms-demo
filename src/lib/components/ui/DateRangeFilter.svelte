<script lang="ts">
	import { Calendar, ChevronDown, CheckCircle } from 'lucide-svelte';

	interface Props {
		onFilterChange?: (filter: DateFilterOption, customFrom?: string, customTo?: string) => void;
		defaultFilter?: DateFilterOption;
	}

	let { onFilterChange, defaultFilter = 'last_30_days' }: Props = $props();

	export type DateFilterOption =
		| 'today'
		| 'yesterday'
		| 'last_7_days'
		| 'last_30_days'
		| 'last_month'
		| 'last_3_months'
		| 'last_6_months'
		| 'ytd'
		| 'custom_range'
		| 'all_time';

	const dateFilterOptions: { value: DateFilterOption; label: string }[] = [
		{ value: 'today', label: 'Today' },
		{ value: 'yesterday', label: 'Yesterday' },
		{ value: 'last_7_days', label: 'Last 7 Days' },
		{ value: 'last_30_days', label: 'Last 30 Days' },
		{ value: 'last_month', label: 'Last Month' },
		{ value: 'last_3_months', label: 'Last 3 Months' },
		{ value: 'last_6_months', label: 'Last 6 Months' },
		{ value: 'ytd', label: 'Year to Date' },
		{ value: 'custom_range', label: 'Custom Range' },
		{ value: 'all_time', label: 'All Time' }
	];

	let selectedFilter = $state<DateFilterOption>(defaultFilter);
	let showFilterDropdown = $state(false);
	let customDateFrom = $state('');
	let customDateTo = $state('');
	let tempDateFrom = $state('');
	let tempDateTo = $state('');

	const selectedFilterLabel = $derived(() => {
		if (selectedFilter === 'custom_range' && customDateFrom && customDateTo) {
			return `${customDateFrom} to ${customDateTo}`;
		}
		return dateFilterOptions.find((opt) => opt.value === selectedFilter)?.label || 'Last 30 Days';
	});

	function selectFilter(value: DateFilterOption) {
		if (value !== 'custom_range') {
			selectedFilter = value;
			showFilterDropdown = false;
			onFilterChange?.(value);
		} else {
			selectedFilter = value;
		}
	}

	function applyCustomRange() {
		if (tempDateFrom && tempDateTo) {
			customDateFrom = tempDateFrom;
			customDateTo = tempDateTo;
			showFilterDropdown = false;
			onFilterChange?.('custom_range', customDateFrom, customDateTo);
		}
	}

	function cancelCustomRange() {
		tempDateFrom = customDateFrom;
		tempDateTo = customDateTo;
		showFilterDropdown = false;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.date-filter-container')) {
			showFilterDropdown = false;
		}
	}

	$effect(() => {
		if (showFilterDropdown) {
			document.addEventListener('click', handleClickOutside);
		} else {
			document.removeEventListener('click', handleClickOutside);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="relative date-filter-container">
	<button
		onclick={() => (showFilterDropdown = !showFilterDropdown)}
		class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
	>
		<Calendar class="h-4 w-4 text-slate-500" />
		<span>{selectedFilterLabel()}</span>
		<span class="transition-transform" class:rotate-180={showFilterDropdown}>
			<ChevronDown class="h-4 w-4 text-slate-400" />
		</span>
	</button>

	{#if showFilterDropdown}
		<div
			class="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
		>
			<div class="p-2">
				<div class="mb-2 px-2 py-1 text-xs font-semibold uppercase text-slate-500">
					Quick Filters
				</div>
				{#each dateFilterOptions as option}
					<button
						onclick={() => selectFilter(option.value)}
						class="w-full rounded px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100"
						class:bg-blue-50={selectedFilter === option.value &&
							option.value !== 'custom_range'}
						class:text-blue-700={selectedFilter === option.value &&
							option.value !== 'custom_range'}
						class:font-medium={selectedFilter === option.value}
					>
						{option.label}
						{#if selectedFilter === option.value && option.value !== 'custom_range'}
							<CheckCircle class="float-right h-4 w-4 text-blue-600" />
						{/if}
					</button>
				{/each}

				<!-- Custom Range Date Inputs -->
				{#if selectedFilter === 'custom_range'}
					<div class="mt-3 border-t border-slate-200 px-2 pt-3">
						<div class="mb-3">
							<label class="mb-1 block text-xs font-medium text-slate-700">From Date</label>
							<input
								type="date"
								bind:value={tempDateFrom}
								class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div class="mb-3">
							<label class="mb-1 block text-xs font-medium text-slate-700">To Date</label>
							<input
								type="date"
								bind:value={tempDateTo}
								class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div class="flex gap-2">
							<button
								onclick={applyCustomRange}
								disabled={!tempDateFrom || !tempDateTo}
								class="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
							>
								Apply
							</button>
							<button
								onclick={cancelCustomRange}
								class="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
							>
								Cancel
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
