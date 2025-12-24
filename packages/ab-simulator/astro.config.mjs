// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import react from '@astrojs/react';

// Environment variables are loaded via symlinked .env file (points to ../../.env)
// This allows the package to access PUBLIC_* vars from the workspace root

// https://astro.build/config
export default defineConfig({
	base: '/ab-simulator',
	outDir: '../../dist/ab-simulator',
	build: {
		format: 'directory'
	},
	integrations: [
		react(),
		tailwind({
			applyBaseStyles: false
		}),
		icon({
			include: {
				lucide: ['*']  // Include all lucide icons for NotebookSummary
			}
		})
	]
});
