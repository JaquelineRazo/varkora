// VARKORA — hero console: an illustrative product UI that walks one record
// per solution through its workflow, then rotates to the next solution.
// Visitors can pick a tab; hovering pauses the rotation. Static under
// prefers-reduced-motion.
(function () {
	var console_ = document.querySelector('[data-console]');
	if (!console_) { return; }

	var SOLUTIONS = {
		construction: {
			title: 'Riverside Medical Office',
			id: 'PRJ-1042',
			steps: [
				['Estimate approved', 'Client'],
				['Crew scheduled', 'Mon 7:00'],
				['Inspection passed', 'City'],
				['Invoice ready', '$48,200']
			],
			kpis: [['12', 'Active projects'], ['5', 'Open estimates'], ['3', 'Ready to bill']],
			toast: 'Client viewed progress report'
		},
		logistics: {
			title: 'PO-4821 · Rebar, 12 t',
			id: 'SHP-2207',
			steps: [
				['Order confirmed', 'Supplier'],
				['In transit', 'Laredo, TX'],
				['Customs cleared', 'MX → US'],
				['Delivered', 'Site 4']
			],
			kpis: [['38', 'Shipments in transit'], ['4', 'At customs'], ['96%', 'On-time this month']],
			toast: 'Restock suggested: demand rising in Monterrey'
		},
		realestate: {
			title: 'Building C · Roof assessment',
			id: 'AST-0318',
			steps: [
				['Assessment scheduled', 'Inspector'],
				['Findings uploaded', '24 photos'],
				['Capital plan updated', '2027–2031'],
				['Owner report shared', 'Portal']
			],
			kpis: [['146', 'Assets tracked'], ['9', 'Assessments due'], ['18', 'Reports shared']],
			toast: 'Owner viewed portfolio report'
		}
	};
	var ORDER = ['construction', 'logistics', 'realestate'];

	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var tabs = console_.querySelectorAll('[data-tab]');
	var flow = console_.querySelector('[data-flow]');
	var kpis = console_.querySelector('[data-kpis]');
	var title = console_.querySelector('[data-title]');
	var id = console_.querySelector('[data-id]');
	var toast = console_.querySelector('[data-toast]');
	var toastText = console_.querySelector('[data-toast-text]');

	var current = 0;
	var timers = [];
	var paused = false;

	function clearTimers() {
		timers.forEach(clearTimeout);
		timers = [];
	}

	function later(fn, ms) {
		timers.push(setTimeout(fn, ms));
	}

	function render(key) {
		var s = SOLUTIONS[key];
		title.textContent = s.title;
		id.textContent = s.id;
		flow.innerHTML = s.steps.map(function (step) {
			return '<li class="flow-step"><span class="flow-node" aria-hidden="true"></span>' +
				'<span class="flow-label">' + step[0] + '</span>' +
				'<span class="flow-meta">' + step[1] + '</span></li>';
		}).join('');
		kpis.innerHTML = s.kpis.map(function (k) {
			return '<div class="kpi"><span class="kpi-value">' + k[0] + '</span><span class="kpi-label">' + k[1] + '</span></div>';
		}).join('');
		toastText.textContent = s.toast;
		toast.classList.remove('is-visible');
		tabs.forEach(function (t) { t.setAttribute('aria-selected', t.getAttribute('data-tab') === key ? 'true' : 'false'); });
	}

	function play(index) {
		clearTimers();
		current = index;
		var key = ORDER[index];
		render(key);

		var steps = flow.querySelectorAll('.flow-step');
		if (reduced) {
			steps.forEach(function (s) { s.classList.add('is-done'); });
			toast.classList.add('is-visible');
			return;
		}

		console_.classList.remove('is-switching');
		void console_.offsetWidth; // restart the scan animation
		console_.classList.add('is-switching');

		steps.forEach(function (step, i) {
			later(function () {
				if (i > 0) { steps[i - 1].classList.remove('is-active'); steps[i - 1].classList.add('is-done'); }
				step.classList.add('is-active');
			}, 500 + i * 900);
		});
		later(function () {
			steps[steps.length - 1].classList.remove('is-active');
			steps[steps.length - 1].classList.add('is-done');
			toast.classList.add('is-visible');
		}, 500 + steps.length * 900);
		later(next, 500 + steps.length * 900 + 2600);
	}

	function next() {
		if (paused) { later(next, 1000); return; }
		play((current + 1) % ORDER.length);
	}

	tabs.forEach(function (tab) {
		tab.addEventListener('click', function () {
			play(ORDER.indexOf(tab.getAttribute('data-tab')));
		});
	});

	console_.addEventListener('mouseenter', function () { paused = true; });
	console_.addEventListener('mouseleave', function () { paused = false; });

	play(0);
})();
