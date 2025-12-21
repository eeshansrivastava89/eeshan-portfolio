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

	function renderCompletionsTable(completions, theme) {
		const isDark = document.documentElement.classList.contains('dark')
		const hasData = completions && completions.length > 0
		const columns = hasData ? Object.keys(completions[0]) : ['No Data']
		Plotly.newPlot(
			'completions-table',
			[
				{
					type: 'table',
					header: {
						values: columns.map((col) => `<b>${col.replace(/_/g, ' ').toUpperCase()}</b>`),
						align: 'center',
						fill: { color: isDark ? '#1f2937' : '#f3f4f6' },
						font: { color: theme.font.color, size: 12, family: 'Inter, monospace' },
						height: 28,
						line: { color: isDark ? '#374151' : '#e5e7eb', width: 1 }
					},
					cells: {
						values: hasData
							? columns.map((col) => completions.map((row) => row[col]))
							: [['No completions yet']],
						align: 'center',
						fill: {
							color: hasData
								? [completions.map((c, i) => (i % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0)'))]
								: 'rgba(0,0,0,0)'
						},
						font: {
							color: hasData ? theme.font.color : '#9ca3af',
							size: 11,
							family: 'Inter, monospace'
						},
						height: 24,
						line: { color: isDark ? '#374151' : '#e5e7eb', width: 1 }
					}
				}
			],
			{
				margin: { l: 0, r: 0, t: 0, b: 0 },
				paper_bgcolor: 'transparent',
				plot_bgcolor: 'transparent',
				height: hasData ? 280 : 80
			},
			{ ...chartConfig, scrollZoom: false }
		)
	}

	// Store Leaflet map instance for reuse
	let leafletMap = null

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
					btn.title = 'Reset view'
					btn.style.cssText = 'width:30px;height:30px;font-size:16px;cursor:pointer;background:#fff;border:none;'
					btn.onclick = (e) => { e.stopPropagation(); leafletMap.setView([25, 0], 2) }
					return btn
				}
			})
			new L.Control.ResetView({ position: 'topleft' }).addTo(leafletMap)
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
				radius: 12,
				fillColor: color,
				color: borderColor,
				weight: 2,
				opacity: 1,
				fillOpacity: 0.8
			})
			.bindPopup(`<strong>${d.city || 'Unknown City'}, ${d.country}</strong><br>Variant ${d.variant}<br>Completions: ${d.completions}<br>Avg Time: ${(d.avg_time_ms / 1000).toFixed(2)}s`)
			.addTo(leafletMap)
		})

		// Fly to most recent completion location
		const mostRecent = geoData.reduce((a, b) =>
			new Date(a.last_completion_at) > new Date(b.last_completion_at) ? a : b
		)
		if (mostRecent && mostRecent.lat && mostRecent.lon) {
			leafletMap.flyTo([mostRecent.lat, mostRecent.lon], 8)
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
			renderCompletionsTable(completions, theme)
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
