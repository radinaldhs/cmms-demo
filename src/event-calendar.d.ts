declare module '@event-calendar/core' {
	import type { SvelteComponent } from 'svelte';

	export class Calendar extends SvelteComponent<{
		plugins: any[];
		options: any;
	}> {}

	export const DayGrid: any;
	export const TimeGrid: any;
	export const List: any;
	export const Interaction: any;
	export const ResourceTimeGrid: any;
	export const ResourceTimeline: any;
}
