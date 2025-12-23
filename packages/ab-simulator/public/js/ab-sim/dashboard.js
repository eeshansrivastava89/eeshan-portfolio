;(function initDashboard() {
	if (typeof Plotly === 'undefined') return setTimeout(initDashboard, 100)

	const colors = { variantA: '#F7CA45', variantB: '#4572F7' }
	const chartConfig = { responsive: true, displayModeBar: false }

	// Adaptive polling state
	let pollDelay = 3000 // Start at 3 seconds
	const minDelay = 3000
	const maxDelay = 60000
	let pollTimeout = null

	function getPlotlyTheme() {
		const isDark = document.documentElement.classList.contains('dark')
		return {
			font: { family: 'Inter, sans-serif', size: 12, color: isDark ? '#e5e7eb' : '#374151' },
			paper_bgcolor: 'rgba(0,0,0,0)',
			plot_bgcolor: 'rgba(0,0,0,0)',
			xaxis: {
				gridcolor: isDark ? '#1f2937' : '#f3f4f6',
				linecolor: isDark ? '#374151' : '#e5e7eb',
				zerolinecolor: isDark ? '#374151' : '#e5e7eb'
			},
			yaxis: {
				gridcolor: isDark ? '#1f2937' : '#f3f4f6',
				linecolor: isDark ? '#374151' : '#e5e7eb',
				zerolinecolor: isDark ? '#374151' : '#e5e7eb'
			}
		}
	}

	function getBaseLayout(title, theme) {
		return {
			title: { text: title, font: { size: 14 } },
			font: theme.font,
			paper_bgcolor: theme.paper_bgcolor,
			plot_bgcolor: theme.plot_bgcolor,
			height: 320,
			showlegend: true
		}
	}

	function renderComparison(c) {
		const diff = c.percentage_difference
		document.getElementById('variant-a-time').textContent = `${c.variant_a_avg}s`
		document.getElementById('variant-a-count').textContent = c.variant_a_completions
		document.getElementById('variant-b-time').textContent = `${c.variant_b_avg}s`
		document.getElementById('variant-b-count').textContent = c.variant_b_completions
		document.getElementById('comparison-diff').textContent = `${diff > 0 ? '+' : ''}${diff}%`
		const statusText = document.getElementById('comparison-status')
		if (diff > 0) statusText.textContent = '5-pineapples variant seems to be harder'
		else if (diff < 0) statusText.textContent = '4-pineapples variant seems to be harder'
		else statusText.textContent = 'Both variants are equal'
	}

	function renderAvgTimeChart(stats, theme) {
		if (!stats || stats.length < 2) return
		const layout = getBaseLayout('Average Completion Time', theme)
		layout.xaxis = { title: '', ...theme.xaxis }
		layout.yaxis = { title: 'Seconds', ...theme.yaxis }
		layout.margin = { l: 50, r: 50, t: 50, b: 40 }
		layout.showlegend = false
		Plotly.newPlot(
			'avg-time-chart',
			[
				{
					x: ['Variant A', 'Variant B'],
					y: [stats[0].avg_completion_time, stats[1].avg_completion_time],
					type: 'bar',
					marker: { color: [colors.variantA, colors.variantB] },
					text: [
						stats[0].avg_completion_time.toFixed(2) + 's',
						stats[1].avg_completion_time.toFixed(2) + 's'
					],
					textposition: 'auto'
				}
			],
			layout,
			chartConfig
		)
	}

	function computeKDE(data) {
		if (!data || data.length === 0) return { x: [], y: [] }
		const mean = data.reduce((a, b) => a + b) / data.length
		const std = Math.sqrt(data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length)
		const bw = std * Math.pow(data.length, -0.2)
		const min = Math.min(...data),
			max = Math.max(...data)
		const x = [],
			y = []
		for (let i = 0; i <= 150; i++) {
			const xi = min + ((max - min) * i) / 150
			x.push(xi)
			y.push(
				data.reduce((sum, d) => sum + Math.exp(-Math.pow((xi - d) / bw, 2) / 2), 0) /
					(data.length * bw * Math.sqrt(2 * Math.PI))
			)
		}
		return { x, y }
	}

	function renderDistributionChart(d, theme) {
		if (!d.variant_a_times || !d.variant_b_times) return
		const kdeA = computeKDE(d.variant_a_times)
		const kdeB = computeKDE(d.variant_b_times)
		const layout = getBaseLayout('Completion Time Distribution (KDE)', theme)
		layout.xaxis = { title: 'Completion Time (seconds)', ...theme.xaxis }
		layout.yaxis = { title: 'Density', ...theme.yaxis }
		layout.margin = { l: 50, r: 30, t: 50, b: 40 }
		Plotly.newPlot(
			'distribution-chart',
			[
				{
					x: kdeB.x,
					y: kdeB.y,
					type: 'scatter',
					mode: 'lines',
					name: 'Variant B',
					line: { color: colors.variantB, width: 2 },
					fill: 'tozeroy',
					fillcolor: `${colors.variantB}66`
				},
				{
					x: kdeA.x,
					y: kdeA.y,
					type: 'scatter',
					mode: 'lines',
					name: 'Variant A',
					line: { color: colors.variantA, width: 2 },
					fill: 'tozeroy',
					fillcolor: `${colors.variantA}66`
				}
			],
			layout,
			chartConfig
		)
	}

	function renderFunnelChart(funnel, theme) {
		const variantA = funnel
			.filter((f) => f.variant === 'A')
			.sort((a, b) => a.stage_order - b.stage_order)
		const variantB = funnel
			.filter((f) => f.variant === 'B')
			.sort((a, b) => a.stage_order - b.stage_order)
		const layout = getBaseLayout('Conversion Funnel', theme)
		layout.margin = { l: 100, r: 30, t: 50, b: 40 }
		Plotly.newPlot(
			'funnel-chart',
			[
				{
					type: 'funnel',
					y: variantA.map((f) => f.stage),
					x: variantA.map((f) => f.event_count),
					name: 'Variant A',
					marker: { color: colors.variantA },
					textposition: 'inside',
					textinfo: 'value+percent initial'
				},
				{
					type: 'funnel',
					y: variantB.map((f) => f.stage),
					x: variantB.map((f) => f.event_count),
					name: 'Variant B',
					marker: { color: colors.variantB },
					textposition: 'inside',
					textinfo: 'value+percent initial'
				}
			],
			layout,
			chartConfig
		)
	}

	// Cache previous completions to avoid unnecessary re-renders (preserves scroll position)
	let prevCompletionsHash = null

	function renderCompletionsTable(completions) {
		const container = document.getElementById('completions-table')
		if (!container) return

		const hasData = completions && completions.length > 0

		// Skip re-render if data unchanged (preserves scroll position)
		const newHash = JSON.stringify(completions)
		if (newHash === prevCompletionsHash) return
		prevCompletionsHash = newHash

		if (!hasData) {
			container.innerHTML = `
				<div class="flex h-20 items-center justify-center text-xs text-muted-foreground">
					No completions yet
				</div>
			`
			return
		}

		// Compact column headers
		const colLabels = {
			'Variant': 'V',
			'Username': 'Player',
			'Time to Complete': 'Time',
			'Total Guesses': 'Guesses',
			'When': 'When',
			'City': 'City',
			'Country': 'Country'
		}

		const columns = Object.keys(completions[0])

		container.innerHTML = `
			<div class="max-h-72 overflow-auto rounded-lg border border-border">
				<table class="w-full text-xs">
					<thead class="sticky top-0 bg-muted text-[10px] uppercase tracking-wide text-muted-foreground">
						<tr>
							${columns.map((col) => `<th class="whitespace-nowrap px-2 py-2 font-semibold">${colLabels[col] || col}</th>`).join('')}
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						${completions
							.map(
								(row, i) => `
							<tr class="${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'} hover:bg-muted/40 transition-colors">
								${columns
									.map((col) => {
										const val = row[col] ?? '—'
										// Variant badge
										if (col === 'Variant') {
											const color = val === 'A' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
											return `<td class="px-2 py-1.5 text-center"><span class="inline-flex h-5 w-5 items-center justify-center rounded font-bold text-[10px] ${color}">${val}</span></td>`
										}
										// Numeric - monospace
										if (col === 'Time to Complete') {
											return `<td class="whitespace-nowrap px-2 py-1.5 text-center font-mono tabular-nums">${val}s</td>`
										}
										if (col === 'Total Guesses') {
											return `<td class="px-2 py-1.5 text-center font-mono tabular-nums">${val}</td>`
										}
										// Truncate long usernames
										if (col === 'Username') {
											return `<td class="max-w-[100px] truncate px-2 py-1.5" title="${val}">${val}</td>`
										}
										return `<td class="whitespace-nowrap px-2 py-1.5 text-center">${val}</td>`
									})
									.join('')}
							</tr>
						`
							)
							.join('')}
					</tbody>
				</table>
			</div>
		`
	}

	// Store Leaflet map instance
	let leafletMap = null

	// Bind follow toggle to HTML checkbox
	function isFollowEnabled() {
		const checkbox = document.getElementById('follow-checkbox')
		return checkbox ? checkbox.checked : false
	}

	// Initialize follow toggle - zoom out to global when disabled
	function initFollowToggle() {
		const checkbox = document.getElementById('follow-checkbox')
		if (!checkbox) return

		checkbox.addEventListener('change', () => {
			if (!checkbox.checked && leafletMap) {
				// Zoom out to global view when follow is disabled
				leafletMap.flyTo([25, 0], 2)
			}
		})
	}

	function renderGeoMap(geoData) {
		const mapEl = document.getElementById('geo-map')
		if (!mapEl || typeof L === 'undefined') return

		const hasData = geoData && geoData.length > 0
		if (!hasData) {
			mapEl.innerHTML = '<div class="flex h-full items-center justify-center text-muted-foreground">No geo data yet</div>'
			return
		}

		// Initialize map once
		if (!leafletMap) {
			leafletMap = L.map('geo-map', { scrollWheelZoom: true }).setView([25, 0], 2)
			L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
				attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
				subdomains: 'abcd',
				maxZoom: 19
			}).addTo(leafletMap)

			// Reset zoom button (Leaflet control)
			L.Control.ResetView = L.Control.extend({
				onAdd: function() {
					const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control')
					btn.innerHTML = '🏠'
					btn.title = 'Reset to global view'
					btn.style.cssText = 'width:30px;height:30px;font-size:16px;cursor:pointer;background:#fff;border:none;'
					btn.onclick = (e) => { e.stopPropagation(); leafletMap.setView([25, 0], 2) }
					return btn
				}
			})
			new L.Control.ResetView({ position: 'topleft' }).addTo(leafletMap)

			// Initialize the HTML follow toggle
			initFollowToggle()
		} else {
			// Clear existing markers
			leafletMap.eachLayer(layer => {
				if (layer instanceof L.CircleMarker) leafletMap.removeLayer(layer)
			})
		}

		// Add markers (constant size)
		geoData.forEach(d => {
			const color = d.variant === 'A' ? colors.variantA : colors.variantB
			const borderColor = d.variant === 'A' ? '#b8860b' : '#2d4a9e'

			L.circleMarker([d.lat, d.lon], {
				radius: 8,
				fillColor: color,
				color: borderColor,
				weight: 2,
				opacity: 1,
				fillOpacity: 0.8
			})
			.bindPopup(`<strong>${d.city || 'Unknown City'}, ${d.country}</strong><br>Variant ${d.variant}<br>Completions: ${d.completions}<br>Avg Time: ${(d.avg_time_ms / 1000).toFixed(2)}s`)
			.addTo(leafletMap)
		})

		// Fly to most recent completion location (only if follow mode is enabled)
		if (isFollowEnabled()) {
			const mostRecent = geoData.reduce((a, b) =>
				new Date(a.last_completion_at) > new Date(b.last_completion_at) ? a : b
			)
			if (mostRecent && mostRecent.lat && mostRecent.lon) {
				leafletMap.flyTo([mostRecent.lat, mostRecent.lon], 8)
			}
		}
	}

	async function updateDashboard() {
		try {
			if (!window.supabaseApi) throw new Error('Supabase API not initialized')
			const [overview, funnel, completions, distribution, geoData] = await Promise.all([
				window.supabaseApi.variantOverview(),
				window.supabaseApi.funnel(),
				window.supabaseApi.recent(50),
				window.supabaseApi.distribution(),
				window.supabaseApi.geoCompletions()
			])
			const theme = getPlotlyTheme()
			if (!overview || !overview.comparison || !overview.stats) {
				throw new Error('Overview data missing')
			}
			renderComparison(overview.comparison)
			renderFunnelChart(funnel, theme)
			renderAvgTimeChart(overview.stats, theme)
			renderDistributionChart(distribution || {}, theme)
			renderCompletionsTable(completions)
			renderGeoMap(geoData || [])
			document.getElementById('last-updated').innerHTML =
				`Last updated: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
			document.getElementById('update-indicator').classList.remove('opacity-50')

			// Success: reset to minimum delay
			pollDelay = minDelay

			// Clear any existing error message
			const errorEl = document.getElementById('dashboard-error')
			if (errorEl) errorEl.remove()
		} catch (err) {
			console.error('Dashboard error:', err)

			// Error: exponential backoff
			pollDelay = Math.min(pollDelay * 2, maxDelay)
			console.warn(`Dashboard fetch failed, retrying in ${pollDelay / 1000}s`)

			const container = document.getElementById('dashboard-section')
			if (container && !document.getElementById('dashboard-error')) {
				const el = document.createElement('div')
				el.id = 'dashboard-error'
				el.innerHTML = `
          <div class="rounded-lg p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 mb-3">
            <div class="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">❌ Error Loading Dashboard</div>
            <div class="text-xs text-red-800 dark:text-red-200">${err.message}</div>
            <div class="text-xs text-red-700 dark:text-red-300 mt-2">Retrying in ${pollDelay / 1000}s... Check Supabase project URL and anon key in site env.</div>
          </div>
        `
				container.prepend(el)
			}
		}
	}

	// Schedule next poll with adaptive delay
	function scheduleNextPoll() {
		if (pollTimeout) clearTimeout(pollTimeout)
		pollTimeout = setTimeout(async () => {
			document.getElementById('update-indicator').classList.add('opacity-50')
			await updateDashboard()
			if (typeof updateLeaderboard === 'function') {
				updateLeaderboard()
			}
			scheduleNextPoll()
		}, pollDelay)
	}

	// Manual refresh function
	window.refreshDashboard = async function () {
		if (pollTimeout) clearTimeout(pollTimeout)
		document.getElementById('update-indicator').classList.add('opacity-50')
		await updateDashboard()
		if (typeof updateLeaderboard === 'function') {
			updateLeaderboard()
		}
		scheduleNextPoll()
	}

	// Initial load
	updateDashboard()
	scheduleNextPoll()

	const observer = new MutationObserver(() => {
		if (document.getElementById('avg-time-chart').hasChildNodes()) updateDashboard()
	})
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})()
