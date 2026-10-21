// VARKORA — landing interactions. Every effect is decorative: the page reads
// the same without JS, and prefers-reduced-motion gets the final states.
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hero console: an illustrative product UI that walks one record per solution
// through its workflow while the agent reports to the phone, then rotates to
// the next solution. Visitors can pick a tab; hovering pauses the rotation.
(function () {
	var hero = document.querySelector('[data-hero]');
	var console_ = document.querySelector('[data-console]');
	if (!console_) { return; }

	var SOLUTIONS = {
		construction: {
			module: 'Construction Operations Hub',
			title: 'Riverside Medical Office',
			id: 'PRJ-1042',
			nav: ['Overview', 'Projects', 'Estimates', 'Crews', 'Inspections', 'Billing', 'Agents'],
			navCurrent: 1,
			kpis: [['12', 'Active projects'], ['5', 'Open estimates'], ['3', 'Ready to bill'], ['1', 'Needs attention', true]],
			steps: [
				['Estimate approved', 'Client'],
				['Crew scheduled', 'Mon 7:00'],
				['Inspection passed', 'City'],
				['Invoice ready', '$48,200']
			],
			chartLabel: 'Progress by phase',
			chart: [92, 84, 71, 58, 34, 12],
			rows: [
				['Change order #14', 'Riverside · waiting on client', 'pill--warn', 'Approval'],
				['Lakeview Townhomes', 'Crew C awaiting materials', 'pill--risk', 'Blocked'],
				['Invoice #2231', '$48,200 · ready to send', 'pill--ok', 'Ready']
			],
			agent: [
				['Summary', '3 projects advanced today. Riverside is ahead of schedule.'],
				['Risk', 'Lakeview materials arrive Thursday. Crew C is idle for a day.', 'Reschedule'],
				['Draft ready', 'Client progress report for Riverside.', 'Review']
			],
			notifs: [
				['Crew check-in complete', 'Crew A · Riverside'],
				['Inspection passed', 'City inspector · Riverside'],
				['Invoice ready for approval', '$48,200 · Riverside']
			],
			float: ['Inspection passed', 'City inspector · just now']
		},
		logistics: {
			module: 'Logistics Control Center',
			title: 'PO-4821 · Rebar, 12 t',
			id: 'SHP-2207',
			nav: ['Overview', 'Orders', 'Shipments', 'Customs', 'Inventory', 'Finance', 'Agents'],
			navCurrent: 2,
			kpis: [['38', 'In transit'], ['4', 'At customs'], ['96%', 'On time'], ['3', 'Exceptions', true]],
			steps: [
				['Order confirmed', 'Supplier'],
				['In transit', 'Laredo, TX'],
				['Customs cleared', 'MX → US'],
				['Delivered', 'Site 4']
			],
			chartLabel: 'Demand · next 6 weeks',
			chart: [44, 52, 49, 63, 78, 86],
			rows: [
				['SHP-2211', 'Estimated delay of 18 h at Laredo', 'pill--warn', 'Delayed'],
				['SHP-2214', 'Missing commercial invoice', 'pill--risk', 'Docs'],
				['Rebar #4', 'Below reorder point · 6 days of cover', 'pill--risk', 'Reorder']
			],
			agent: [
				['Customs', 'SHP-2207 cleared customs, MX → US.'],
				['Risk', 'Estimated 18-hour delay at Laredo on SHP-2211.', 'Notify client'],
				['Suggestion', 'Demand is rising in Monterrey. Restock rebar #4?', 'Draft PO']
			],
			notifs: [
				['Shipment cleared customs', 'SHP-2207 · MX → US'],
				['Inventory below threshold', 'Rebar #4 · 6 days of cover'],
				['Demand spike detected in Monterrey', 'Restock suggested']
			],
			float: ['Customs cleared', 'SHP-2207 · MX → US']
		},
		realestate: {
			module: 'Asset Operations Console',
			title: 'Building C · Roof assessment',
			id: 'AST-0318',
			nav: ['Portfolio', 'Assets', 'Inspections', 'Capex', 'Documents', 'Owner portal', 'Agents'],
			navCurrent: 2,
			kpis: [['146', 'Assets tracked'], ['9', 'Assessments due'], ['18', 'Reports shared'], ['2', 'Docs missing', true]],
			steps: [
				['Assessment scheduled', 'Inspector'],
				['Findings uploaded', '24 photos'],
				['Capital plan updated', '2027–2031'],
				['Owner report shared', 'Portal']
			],
			chartLabel: 'Planned capex by year',
			chart: [35, 70, 52, 88, 44, 30],
			rows: [
				['Building C · Roof', 'Condition 41% · replace 2027', 'pill--warn', 'Plan'],
				['Building D · Elevators', 'Assessment due Q3', '', 'Due'],
				['Permits · Portfolio North', '7 of 9 on file', 'pill--risk', 'Missing']
			],
			agent: [
				['Classified', '24 photos linked to Building C, roof section.'],
				['Capex', 'Roof replacement moved to 2027 in the capital plan.'],
				['Draft ready', 'Owner report for Portfolio North.', 'Share']
			],
			notifs: [
				['Findings uploaded', '24 photos · Building C'],
				['Capital plan updated', '2027–2031'],
				['Owner viewed portfolio report', 'Portfolio North']
			],
			float: ['Findings uploaded', 'Building C · 24 photos']
		}
	};
	var ORDER = ['construction', 'logistics', 'realestate'];

	function $(sel) { return console_.querySelector(sel); }
	var tabs = console_.querySelectorAll('[data-tab]');
	var flow = $('[data-flow]');
	var stack = document.querySelector('[data-phone-stack]');
	var floatCard = document.querySelector('.float-card');
	var markIcon = '<span class="notif-app"><svg><use href="#vk-mark"/></svg>VARKORA</span>';

	var current = 0;
	var timers = [];
	var paused = false;

	function clearTimers() { timers.forEach(clearTimeout); timers = []; }
	function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

	function pushNotif(n, check) {
		if (!stack) { return; }
		var el = document.createElement('div');
		el.className = 'notif' + (check ? ' is-check' : '');
		el.innerHTML = markIcon + '<b>' + n[0] + '</b><small>' + n[1] + ' · now</small>';
		stack.insertBefore(el, stack.firstChild);
		while (stack.children.length > 3) { stack.removeChild(stack.lastChild); }
	}

	function render(key) {
		var s = SOLUTIONS[key];
		$('[data-module]').textContent = s.module;
		$('[data-title]').textContent = s.title;
		$('[data-id]').textContent = s.id;
		$('[data-nav]').innerHTML = s.nav.map(function (n, i) {
			return '<li' + (i === s.navCurrent ? ' class="is-current"' : '') + '>' + n + '</li>';
		}).join('');
		$('[data-kpis]').innerHTML = s.kpis.map(function (k) {
			return '<div class="kpi' + (k[2] ? ' is-alert' : '') + '"><span class="kpi-value">' + k[0] + '</span><span class="kpi-label">' + k[1] + '</span></div>';
		}).join('');
		flow.innerHTML = s.steps.map(function (step) {
			return '<li class="flow-step"><span class="flow-node" aria-hidden="true"></span>' +
				'<span class="flow-label">' + step[0] + '</span>' +
				'<span class="flow-meta">' + step[1] + '</span></li>';
		}).join('');
		$('[data-chart-label]').textContent = s.chartLabel;
		$('[data-chart]').innerHTML = s.chart.map(function (h, i) {
			return '<i style="--h:' + h + '%;--n:' + i + '"></i>';
		}).join('');
		$('[data-rows]').innerHTML = s.rows.map(function (r) {
			return '<div class="row"><span>' + r[0] + '<small>' + r[1] + '</small></span><span class="pill ' + r[2] + '">' + r[3] + '</span></div>';
		}).join('');
		$('[data-agent]').innerHTML = s.agent.map(function (a) {
			return '<div class="insight"><b>' + a[0] + '</b>' + a[1] + (a[2] ? '<br><span class="mbtn mbtn--primary">' + a[2] + '</span>' : '') + '</div>';
		}).join('');
		if (stack) { stack.innerHTML = ''; }
		if (floatCard) {
			floatCard.classList.add('is-swapping');
			setTimeout(function () {
				floatCard.querySelector('[data-float-title]').textContent = s.float[0];
				floatCard.querySelector('[data-float-meta]').textContent = s.float[1];
				floatCard.classList.remove('is-swapping');
			}, 400);
		}
		tabs.forEach(function (t) { t.setAttribute('aria-selected', t.getAttribute('data-tab') === key ? 'true' : 'false'); });
	}

	function play(index) {
		clearTimers();
		current = index;
		var key = ORDER[index];
		var s = SOLUTIONS[key];
		render(key);

		var steps = flow.querySelectorAll('.flow-step');
		if (REDUCED) {
			steps.forEach(function (st) { st.classList.add('is-done'); });
			s.notifs.forEach(function (n, i) { pushNotif(n, i === s.notifs.length - 1); });
			return;
		}

		console_.classList.remove('is-switching');
		void console_.offsetWidth; // restart the scan animation
		console_.classList.add('is-switching');

		steps.forEach(function (step, i) {
			later(function () {
				if (i > 0) { steps[i - 1].classList.remove('is-active'); steps[i - 1].classList.add('is-done'); }
				step.classList.add('is-active');
				if (i > 0) { pushNotif(s.notifs[i - 1], false); }
			}, 500 + i * 1100);
		});
		later(function () {
			steps[steps.length - 1].classList.remove('is-active');
			steps[steps.length - 1].classList.add('is-done');
			if (stack && stack.firstChild) { stack.firstChild.classList.add('is-check'); }
		}, 500 + steps.length * 1100);
		later(next, 500 + steps.length * 1100 + 3000);
	}

	function next() {
		if (paused) { later(next, 1000); return; }
		play((current + 1) % ORDER.length);
	}

	tabs.forEach(function (tab) {
		tab.addEventListener('click', function () { play(ORDER.indexOf(tab.getAttribute('data-tab'))); });
	});
	console_.addEventListener('mouseenter', function () { paused = true; });
	console_.addEventListener('mouseleave', function () { paused = false; });

	play(0);

	// Entrance: copy, then product; the portal chain lines up behind it.
	requestAnimationFrame(function () {
		hero.classList.add('is-ready');
		setTimeout(function () { hero.classList.add('is-aligned'); }, REDUCED ? 0 : 250);
	});
})();

// Hero wormhole: dotted rings flow out of a vanishing point behind the title,
// along a slightly bent axis (a shortcut through space-time). Starts with a
// short warp while the title emerges, then settles. One static frame under
// prefers-reduced-motion; paused when the hero is off screen.
(function () {
	var canvas = document.querySelector('[data-wormhole]');
	var hero = document.querySelector('[data-hero]');
	if (!canvas || !canvas.getContext) { return; }
	var ctx = canvas.getContext('2d');
	var title = hero.querySelector('h1');

	var RINGS = 18;
	var Z_MIN = 0.045;
	var TILT = -0.28; // same lean as the brand mark
	var W, H, dpr, vx, vy, unit;
	var rings = [];
	var streaks = [];
	var t0 = null;
	var last = 0;
	var running = false;
	var visible = true;

	for (var i = 0; i < RINGS; i++) {
		rings.push(Z_MIN * Math.pow(1 / Z_MIN, (i + 0.5) / RINGS));
	}
	for (var j = 0; j < 30; j++) {
		streaks.push({ a: Math.random() * Math.PI * 2, z: Z_MIN + Math.random() * (1 - Z_MIN), l: 0.03 + Math.random() * 0.05 });
	}

	function resize() {
		dpr = Math.min(window.devicePixelRatio || 1, 2);
		W = canvas.clientWidth;
		H = canvas.clientHeight;
		canvas.width = Math.round(W * dpr);
		canvas.height = Math.round(H * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		// Vanishing point: the center of the title.
		var c = canvas.getBoundingClientRect();
		var r = title.getBoundingClientRect();
		vx = r.left + r.width / 2 - c.left;
		vy = r.top + r.height / 2 - c.top;
		unit = Math.min(1, W / 1280) * 30;
	}

	// Project a point on the tunnel wall at depth z and angle a.
	function project(z, a, time) {
		var s = 1 / z;
		var bend = 0.55 * Math.sin(time * 0.00012);
		var cx = vx + (s - 1) * unit * (0.42 + bend * 0.25);
		var cy = vy + (s - 1) * unit * (0.16 - bend * 0.12);
		var rx = unit * s;
		var ry = rx * 0.58;
		return { cx: cx, cy: cy, rx: rx, ry: ry, x: cx + Math.cos(a) * rx * Math.cos(TILT) - Math.sin(a) * ry * Math.sin(TILT), y: cy + Math.cos(a) * rx * Math.sin(TILT) + Math.sin(a) * ry * Math.cos(TILT) };
	}

	function alphaFor(z, rx) {
		var far = Math.min(1, (1 - z) / 0.35);
		var near = Math.max(0, Math.min(1, (W * 0.48 - rx) / (W * 0.26)));
		return far * near;
	}

	function draw(time) {
		ctx.clearRect(0, 0, W, H);

		var glow = ctx.createRadialGradient(vx, vy, 0, vx, vy, unit * 9);
		glow.addColorStop(0, 'rgba(86, 180, 199, 0.22)');
		glow.addColorStop(1, 'rgba(86, 180, 199, 0)');
		ctx.fillStyle = glow;
		ctx.fillRect(0, 0, W, H);

		var spin = time * 0.00008;
		rings.slice().sort(function (a, b) { return b - a; }).forEach(function (z) {
			var p = project(z, 0, time);
			var a = alphaFor(z, p.rx);
			if (a <= 0.01) { return; }
			ctx.save();
			ctx.translate(p.cx, p.cy);
			ctx.rotate(TILT);
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(86, 180, 199, ' + (0.16 * a) + ')';
			ctx.beginPath();
			ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
			ctx.stroke();
			// Bright rim on one side, like light on the edge of a portal.
			ctx.lineWidth = Math.min(2.2, 0.6 + p.rx / 260);
			ctx.strokeStyle = 'rgba(233, 239, 242, ' + (0.38 * a) + ')';
			ctx.beginPath();
			ctx.ellipse(0, 0, p.rx, p.ry, 0, Math.PI * 0.85 + spin, Math.PI * 1.45 + spin);
			ctx.stroke();
			// Dotted mesh along the ring.
			var n = Math.min(180, 36 + Math.round(p.rx / 3));
			var dot = Math.min(1.6, 0.5 + p.rx / 400);
			ctx.fillStyle = 'rgba(86, 180, 199, ' + (0.4 * a) + ')';
			for (var k = 0; k < n; k += 1) {
				var ang = (k / n) * Math.PI * 2 + spin * 2;
				ctx.fillRect(Math.cos(ang) * p.rx - dot / 2, Math.sin(ang) * p.ry - dot / 2, dot, dot);
			}
			ctx.restore();
		});

		// Streaks travelling along the walls toward the viewer.
		ctx.lineCap = 'round';
		streaks.forEach(function (st) {
			var p1 = project(st.z, st.a, time);
			var p2 = project(Math.min(1, st.z * (1 + st.l * 4)), st.a, time);
			var a = alphaFor(st.z, p1.rx);
			if (a <= 0.01) { return; }
			ctx.strokeStyle = 'rgba(233, 239, 242, ' + (0.3 * a) + ')';
			ctx.lineWidth = Math.min(1.6, 0.4 + p1.rx / 500);
			ctx.beginPath();
			ctx.moveTo(p2.x, p2.y);
			ctx.lineTo(p1.x, p1.y);
			ctx.stroke();
		});
	}

	function step(dt, elapsed) {
		// Warp on entrance (fast flow while the title emerges), then a calm drift.
		var speed = 0.16 + 1.6 * Math.exp(-elapsed / 700);
		var k = Math.exp(-speed * dt / 1000);
		for (var i = 0; i < rings.length; i++) {
			rings[i] *= k;
			if (rings[i] < Z_MIN) { rings[i] *= 1 / Z_MIN; }
		}
		streaks.forEach(function (st) {
			st.z *= Math.exp(-speed * 1.4 * dt / 1000);
			if (st.z < Z_MIN) { st.z = 0.6 + Math.random() * 0.4; st.a = Math.random() * Math.PI * 2; }
		});
	}

	function frame(time) {
		if (!running) { return; }
		if (t0 === null) { t0 = time; last = time; }
		step(Math.min(64, time - last), time - t0);
		last = time;
		draw(time);
		requestAnimationFrame(frame);
	}

	function start() {
		if (running || REDUCED || !visible || document.hidden) { return; }
		running = true;
		last = performance.now();
		requestAnimationFrame(frame);
	}

	resize();
	window.addEventListener('resize', function () { resize(); if (!running) { draw(performance.now()); } });
	if (document.fonts && document.fonts.ready) { document.fonts.ready.then(resize); }

	if (REDUCED) { draw(0); return; }
	if ('IntersectionObserver' in window) {
		new IntersectionObserver(function (entries) {
			visible = entries[0].isIntersecting;
			if (visible) { start(); } else { running = false; }
		}).observe(canvas);
	}
	document.addEventListener('visibilitychange', function () {
		if (document.hidden) { running = false; } else { start(); }
	});
	start();
})();

// Parallax: hero layers move at different speeds (data-depth). Subtle, hero only.
(function () {
	var hero = document.querySelector('[data-hero]');
	if (!hero || REDUCED) { return; }
	var layers = Array.prototype.filter.call(hero.querySelectorAll('[data-depth]'), function (el) {
		return parseFloat(el.getAttribute('data-depth')) !== 0;
	});
	var ticking = false;
	function update() {
		ticking = false;
		var y = window.scrollY;
		if (y > hero.offsetHeight) { return; }
		var scale = window.innerWidth < 760 ? 0.5 : 1;
		layers.forEach(function (el) {
			el.style.transform = 'translate3d(0,' + (y * parseFloat(el.getAttribute('data-depth')) * scale).toFixed(1) + 'px,0)';
		});
	}
	window.addEventListener('scroll', function () {
		if (!ticking) { ticking = true; requestAnimationFrame(update); }
	}, { passive: true });
})();

// Shortcut diagram: six manual hops between Order and Invoice collapse into
// one straight path through the VARKORA portals as the figure scrolls by.
(function () {
	var fig = document.querySelector('[data-shortcut]');
	if (!fig) { return; }
	var NS = 'http://www.w3.org/2000/svg';
	var path = fig.querySelector('[data-shortcut-path]');
	var nodesG = fig.querySelector('[data-shortcut-nodes]');
	var portal = fig.querySelector('[data-shortcut-portal]');
	var legends = fig.querySelectorAll('[data-legend]');
	var HOPS = [['Email', 207, 40], ['Spreadsheet', 353, 222], ['Phone call', 500, 48], ['Re-entry', 647, 216], ['Approval by email', 793, 44]];
	var nodes = HOPS.map(function (h) {
		var g = document.createElementNS(NS, 'g');
		g.setAttribute('class', 'sc-node');
		g.innerHTML = '<circle r="7"/><text y="' + (h[2] < 130 ? -16 : 28) + '">' + h[0] + '</text>';
		nodesG.appendChild(g);
		return g;
	});

	function draw(p) {
		var e = p * p * (3 - 2 * p); // smoothstep
		var pts = [[60, 130]];
		HOPS.forEach(function (h, i) {
			var y = h[2] + (130 - h[2]) * e;
			pts.push([h[1], y]);
			nodes[i].setAttribute('transform', 'translate(' + h[1] + ' ' + y.toFixed(1) + ')');
			nodes[i].style.opacity = (1 - e).toFixed(2);
		});
		pts.push([940, 130]);
		path.setAttribute('d', 'M' + pts.map(function (q) { return q[0] + ' ' + q[1].toFixed(1); }).join('L'));
		portal.style.opacity = e.toFixed(2);
		legends[0].classList.toggle('is-on', e < 0.5);
		legends[1].classList.toggle('is-on', e >= 0.5);
	}

	if (REDUCED) { draw(1); return; }
	var ticking = false;
	function update() {
		ticking = false;
		var r = fig.getBoundingClientRect();
		var vh = window.innerHeight;
		var center = r.top + r.height / 2;
		// 0 when the figure's center enters at 90% of the viewport, 1 at 45%.
		var p = Math.min(1, Math.max(0, (vh * 0.9 - center) / (vh * 0.45)));
		draw(p);
	}
	window.addEventListener('scroll', function () {
		if (!ticking) { ticking = true; requestAnimationFrame(update); }
	}, { passive: true });
	update();
})();

// Mobile section: agent messages arrive one by one, then the suggested
// reorder gets approved. Loops while the phone is on screen.
(function () {
	var chat = document.querySelector('[data-chat]');
	if (!chat || REDUCED || !('IntersectionObserver' in window)) { return; }
	var msgs = chat.querySelectorAll('.msg');
	var action = chat.querySelector('.msg--action');
	var timers = [];
	var running = false;
	chat.classList.add('is-live');

	function run() {
		timers.forEach(clearTimeout);
		timers = [];
		msgs.forEach(function (m) { m.classList.remove('is-in'); });
		action.classList.remove('is-done');
		msgs.forEach(function (m, i) {
			timers.push(setTimeout(function () { m.classList.add('is-in'); }, 400 + i * 1300));
		});
		var actionAt = 400 + Array.prototype.indexOf.call(msgs, action) * 1300;
		timers.push(setTimeout(function () { action.classList.add('is-done'); }, actionAt + 2200));
		timers.push(setTimeout(function () { if (running) { run(); } }, 400 + msgs.length * 1300 + 5000));
	}

	new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting && !running) { running = true; run(); }
			if (!entry.isIntersecting && running) {
				running = false;
				timers.forEach(clearTimeout);
				msgs.forEach(function (m) { m.classList.add('is-in'); });
			}
		});
	}, { threshold: 0.35 }).observe(chat);
})();

// Reveal-on-scroll (.reveal, step rail) and count-up for UI metrics.
(function () {
	var items = document.querySelectorAll('.reveal, [data-steps]');
	if (REDUCED) {
		document.querySelectorAll('[data-dots]').forEach(function (g) { g.parentNode.removeChild(g); });
		document.querySelectorAll('.mobile-flow .flow-dot').forEach(function (c) { c.parentNode.removeChild(c); });
	}
	if (!('IntersectionObserver' in window)) {
		items.forEach(function (el) { el.classList.add('is-in'); });
		return;
	}

	function countUp(el) {
		var target = parseFloat(el.getAttribute('data-count'));
		var prefix = el.getAttribute('data-prefix') || '';
		var suffix = el.getAttribute('data-suffix') || '';
		if (REDUCED) { return; }
		var start = null;
		function frame(t) {
			if (!start) { start = t; }
			var k = Math.min(1, (t - start) / 1100);
			var eased = 1 - Math.pow(1 - k, 3);
			el.textContent = prefix + Math.round(target * eased) + suffix;
			if (k < 1) { requestAnimationFrame(frame); }
		}
		requestAnimationFrame(frame);
	}

	var io = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (!entry.isIntersecting) { return; }
			entry.target.classList.add('is-in');
			entry.target.querySelectorAll('[data-count]').forEach(countUp);
			io.unobserve(entry.target);
		});
	}, { rootMargin: '0px 0px -10% 0px' });
	items.forEach(function (el) { io.observe(el); });
})();

// Contact form: solution preset from the solution cards, first-touch source
// for the session, background submit to the razzo-forms worker.
(function () {
	var form = document.getElementById('contact-form');
	if (!form) { return; }
	var select = form.querySelector('select[name="solution"]');
	var status = form.querySelector('.form-status');
	var button = form.querySelector('button[type="submit"]');

	document.querySelectorAll('[data-solution]').forEach(function (link) {
		link.addEventListener('click', function () { select.value = link.getAttribute('data-solution'); });
	});

	var params = new URLSearchParams(location.search);
	var source = params.get('utm_source') || params.get('ref');
	try {
		if (source && !sessionStorage.getItem('varkora_source')) { sessionStorage.setItem('varkora_source', source); }
		source = sessionStorage.getItem('varkora_source') || source;
	} catch (e) {}
	form.querySelector('input[name="source"]').value = source || (document.referrer && document.referrer.indexOf(location.host) === -1 ? 'referral' : 'direct');

	function fail(message) {
		form.classList.remove('is-sending');
		button.disabled = false;
		button.textContent = 'Send message';
		status.classList.add('is-error');
		status.innerHTML = message;
	}

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		var missing = false;
		form.querySelectorAll('[required]').forEach(function (field) {
			var bad = !field.value.trim() || (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim()));
			field.closest('.field').classList.toggle('is-invalid', bad);
			if (bad) { missing = true; }
		});
		if (missing) { fail('Please add your name, a valid work email and a short message.'); return; }

		var data = {};
		new FormData(form).forEach(function (value, key) { data[key] = value; });
		form.classList.add('is-sending');
		button.disabled = true;
		button.textContent = 'Sending…';
		status.classList.remove('is-error');
		status.textContent = '';

		var controller = window.AbortController ? new AbortController() : null;
		var timer = setTimeout(function () { if (controller) { controller.abort(); } }, 10000);
		fetch(form.action, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
			body: JSON.stringify(data),
			signal: controller ? controller.signal : undefined
		}).then(function (r) { return r.json(); }).then(function (res) {
			clearTimeout(timer);
			if (!res || res.success !== true) { throw new Error(res && res.error); }
			if (window.umami && typeof window.umami.track === 'function') {
				window.umami.track('form-submit', { brand: 'varkora', solution: data.solution, source: data.source });
			}
			form.classList.remove('is-sending');
			form.classList.add('is-sent');
			status.textContent = 'Thank you. We read every message and usually reply within two business days.';
		}).catch(function () {
			clearTimeout(timer);
			fail('We couldn’t send your message. Please email <a href="mailto:varkora@razzobusiness.com">varkora@razzobusiness.com</a>.');
		});
	});
})();
