import { baseTheme, baseConfig } from '../shared/tailwind.base.js'

/** @type {import('tailwindcss').Config} */
const config = {
	...baseConfig,
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
		'./public/**/*.js',
		'../shared/src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'
	],
	theme: {
		container: baseTheme.container,
		extend: {
			colors: baseTheme.colors,
			borderRadius: baseTheme.borderRadius,
			fontFamily: baseTheme.fontFamily
		}
	}
}

export default config
