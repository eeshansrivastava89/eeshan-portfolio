import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
	integrations: [react(), tailwind()],
	base: '/my-test-app',
	outDir: '../../dist/my-test-app',
	publicDir: 'public',
	build: {
		format: 'directory'
	}
})
