/**
 * UI state store
 * Manages UI-related state like mobile menu visibility
 */

import { writable } from 'svelte/store';

// Mobile sidebar state
const createMobileSidebarStore = () => {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		open: () => set(true),
		close: () => set(false),
		toggle: () => update((value) => !value)
	};
};

export const mobileSidebarOpen = createMobileSidebarStore();
