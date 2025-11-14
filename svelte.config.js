import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			$lib: 'src/lib',
			$components: 'src/lib/components',
			$core: 'src/lib/core',
			$features: 'src/lib/features',
			$types: 'src/lib/core/types',
			$stores: 'src/lib/core/stores',
			$utils: 'src/lib/core/utils'
		}
	}
};

export default config;
