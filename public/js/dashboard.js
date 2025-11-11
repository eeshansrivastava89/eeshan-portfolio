// Dashboard initialization and rendering
(function initDashboard() {
	if (typeof Plotly === 'undefined') return setTimeout(initDashboard, 100);

	const host = window.location.hostname;
	const isLocal = host === 'localhost' || host === '127.0.0.1';
	const API_URL = isLocal ? 'http://localhost:8000' : 'https://soma-analytics.fly.dev';
	const colors = { variantA: '#e5e3e0ff', variantB: '#f5a656ff' };
	const chartConfig = { responsive: true, displayModeBar: false };

	function getPlotlyTheme() {
		const isDark = document.documentElement.classList.contains('dark');
		return {
			font: { family: 'Satoshi, sans-serif', size: 12, color: isDark ? '#e5e7eb' : '#374151' },
			paper_bgcolor: 'rgba(0,0,0,0)',
			plot_bgcolor: 'rgba(0,0,0,0)',
			xaxis: { gridcolor: isDark ? '#1f2937' : '#f3f4f6', linecolor: isDark ? '#374151' : '#e5e7eb', zerolinecolor: isDark ? '#374151' : '#e5e7eb' },
			yaxis: { gridcolor: isDark ? '#1f2937' : '#f3f4f6', linecolor: isDark ? '#374151' : '#e5e7eb', zerolinecolor: isDark ? '#374151' : '#e5e7eb' }
		};
	}

	function getBaseLayout(title, theme) {
		return {
			title: { text: title, font: { size: 14 } },
			font: theme.font,
			paper_bgcolor: theme.paper_bgcolor,
			plot_bgcolor: theme.plot_bgcolor,
			height: 320,
			showlegend: true
		};
	}

	function renderComparison(c) {
		const diff = c.percentage_difference;
		
		document.getElementById('variant-a-time').textContent = `${c.variant_a_avg}s`;
		document.getElementById('variant-a-count').textContent = c.variant_a_completions;
		document.getElementById('variant-b-time').textContent = `${c.variant_b_avg}s`;
		document.getElementById('variant-b-count').textContent = c.variant_b_completions;
		document.getElementById('comparison-diff').textContent = `${diff > 0 ? '+' : ''}${diff}%`;
		
		const statusText = document.getElementById('comparison-status');
		
		if (diff > 0) {
			// B is harder (takes longer)
			statusText.textContent = '5-pineapples variant seems to be harder';
		} else if (diff < 0) {
			// A is harder (takes longer)
			statusText.textContent = '4-pineapples variant seems to be harder';
		} else {
			statusText.textContent = 'Both variants are equal';
		}
	}

	function renderAvgTimeChart(stats, theme) {
		if (!stats || stats.length < 2) return;
		const layout = getBaseLayout('Average Completion Time', theme);
		layout.xaxis = { title: '', ...theme.xaxis };
		layout.yaxis = { title: 'Seconds', ...theme.yaxis };
		layout.margin = { l: 50, r: 50, t: 50, b: 40 };
		layout.showlegend = false;

		Plotly.newPlot('avg-time-chart', [{
			x: ['Variant A', 'Variant B'],
			y: [stats[0].avg_completion_time, stats[1].avg_completion_time],
			type: 'bar',
			marker: { color: [colors.variantA, colors.variantB] },
			text: [stats[0].avg_completion_time.toFixed(2) + 's', stats[1].avg_completion_time.toFixed(2) + 's'],
			textposition: 'auto'
		}], layout, chartConfig);
	}

	function computeKDE(data) {
		if (!data || data.length === 0) return { x: [], y: [] };
		const mean = data.reduce((a, b) => a + b) / data.length;
		const std = Math.sqrt(data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length);
		const bw = std * Math.pow(data.length, -0.2);
		const min = Math.min(...data), max = Math.max(...data);
		const x = [], y = [];
		for (let i = 0; i <= 150; i++) {
			const xi = min + (max - min) * i / 150;
			x.push(xi);
			y.push(data.reduce((sum, d) => sum + Math.exp(-Math.pow((xi - d) / bw, 2) / 2), 0) / (data.length * bw * Math.sqrt(2 * Math.PI)));
		}
		return { x, y };
	}

	function renderDistributionChart(d, theme) {
		if (!d.variant_a_times || !d.variant_b_times) return;
		const kdeA = computeKDE(d.variant_a_times);
		const kdeB = computeKDE(d.variant_b_times);
		const layout = getBaseLayout('Completion Time Distribution (KDE)', theme);
		layout.xaxis = { title: 'Completion Time (seconds)', ...theme.xaxis };
		layout.yaxis = { title: 'Density', ...theme.yaxis };
		layout.margin = { l: 50, r: 30, t: 50, b: 40 };

		Plotly.newPlot('distribution-chart', [
			{ x: kdeB.x, y: kdeB.y, type: 'scatter', mode: 'lines', name: 'Variant B', line: { color: colors.variantB, width: 2 }, fill: 'tozeroy', fillcolor: `${colors.variantB}66`  },
            { x: kdeA.x, y: kdeA.y, type: 'scatter', mode: 'lines', name: 'Variant A', line: { color: colors.variantA, width: 2 }, fill: 'tozeroy', fillcolor: `${colors.variantA}22` }
		], layout, chartConfig);
	}

	function renderFunnelChart(funnel, theme) {
		const variantA = funnel.filter(f => f.variant === 'A').sort((a, b) => a.stage_order - b.stage_order);
		const variantB = funnel.filter(f => f.variant === 'B').sort((a, b) => a.stage_order - b.stage_order);
		const layout = getBaseLayout('Conversion Funnel', theme);
		layout.margin = { l: 100, r: 30, t: 50, b: 40 };

		Plotly.newPlot('funnel-chart', [
			{ type: 'funnel', y: variantA.map(f => f.stage), x: variantA.map(f => f.event_count), name: 'Variant A', marker: { color: colors.variantA }, textposition: 'inside', textinfo: 'value+percent initial' },
			{ type: 'funnel', y: variantB.map(f => f.stage), x: variantB.map(f => f.event_count), name: 'Variant B', marker: { color: colors.variantB }, textposition: 'inside', textinfo: 'value+percent initial' }
		], layout, chartConfig);
	}

	function renderCompletionsTable(completions, theme) {
		const isDark = document.documentElement.classList.contains('dark');
		const hasData = completions && completions.length > 0;
		const columns = hasData ? Object.keys(completions[0]) : ['No Data'];
		
		Plotly.newPlot('completions-table', [{
			type: 'table',
			header: { 
				values: columns.map(col => `<b>${col.replace(/_/g, ' ').toUpperCase()}</b>`), 
				align: 'center', 
				fill: { color: isDark ? '#1f2937' : '#f3f4f6' }, 
				font: { color: theme.font.color, size: 12, family: 'Satoshi, monospace' }, 
				height: 28, 
				line: { color: isDark ? '#374151' : '#e5e7eb', width: 1 } 
			},
			cells: { 
				values: hasData ? columns.map(col => completions.map(row => row[col])) : [['No completions yet']], 
				align: 'center', 
				fill: { color: hasData ? [completions.map((c, i) => i % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0)')] : 'rgba(0,0,0,0)' }, 
				font: { color: hasData ? theme.font.color : '#9ca3af', size: 11, family: 'Satoshi, monospace' }, 
				height: 24, 
				line: { color: isDark ? '#374151' : '#e5e7eb', width: 1 } 
			}
		}], {
			margin: { l: 0, r: 0, t: 0, b: 0 },
			paper_bgcolor: 'transparent',
			plot_bgcolor: 'transparent',
			height: hasData ? 280 : 80
		}, { ...chartConfig, scrollZoom: false });
	}

	async function updateDashboard() {
		try {
			const [overview, funnel, completions, distribution] = await Promise.all([
				fetch(`${API_URL}/api/variant-overview`).then(r => r.json()),
				fetch(`${API_URL}/api/conversion-funnel`).then(r => r.json()),
				fetch(`${API_URL}/api/recent-completions?limit=50`).then(r => r.json()),
				fetch(`${API_URL}/api/time-distribution`).then(r => r.json())
			]);

			const theme = getPlotlyTheme();
			renderComparison(overview.comparison);
			renderFunnelChart(funnel, theme);
			renderAvgTimeChart(overview.stats, theme);
			renderDistributionChart(distribution, theme);
			renderCompletionsTable(completions, theme);

			document.getElementById('last-updated').innerHTML = `Last updated: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
			document.getElementById('update-indicator').classList.remove('opacity-50');
		} catch (err) {
			console.error('Dashboard error:', err);
			const container = document.getElementById('dashboard-section');
			if (container && !document.getElementById('dashboard-error')) {
				const el = document.createElement('div');
				el.id = 'dashboard-error';
				el.innerHTML = `
					<div class="rounded-lg p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 mb-3">
						<div class="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">❌ Error Loading Dashboard</div>
						<div class="text-xs text-red-800 dark:text-red-200">${err.message}</div>
						<div class="text-xs text-red-700 dark:text-red-300 mt-2">Check if soma-analytics API is reachable at ${API_URL}</div>
					</div>
				`;
				container.prepend(el);
			}
		}
	}

	updateDashboard();
	setInterval(() => {
		document.getElementById('update-indicator').classList.add('opacity-50');
		updateDashboard();
		// Also refresh leaderboard if updateLeaderboard function exists
		if (typeof updateLeaderboard === 'function') {
			updateLeaderboard();
		}
	}, 5000);

	const observer = new MutationObserver(() => {
		if (document.getElementById('avg-time-chart').hasChildNodes()) updateDashboard();
	});
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
