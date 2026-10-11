'use strict';

const C_MUS = 'MUSIC';
const C_REF = 'REF';
const C_MIC = 'MIC';
const LIVE_MIN_RMS = 0.001;
const LIVE_CONF = 0.25;
const DPR = window.devicePixelRatio || 1;
const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

const VOICES = [
	['Bass', 40, 64],
	['Baritone', 43, 67],
	['Tenor', 48, 72],
	['Contralto', 53, 77],
	['Mezzo-soprano', 57, 81],
	['Soprano', 60, 84]
];

function midiName(m) {
	if (!isFinite(m) || NOTES.length !== 12) return '—';
	const r = Math.round(m);
	const name = NOTES[((r % 12) + 12) % 12];
	const oct = Math.floor(r / 12) - 1;
	if (typeof name !== 'string' || !isFinite(oct)) return '—';
	return name + oct;
}

const setStatus = (e, t) => { e.textContent = t; };

function rngFill(el, val = null) {
	const p = val === null ? (el.value - el.min) / (el.max - el.min) * 100 : val;
	if (val !== null) { el.value = val; }
	el.style.setProperty('--p', p + '%');
}

/* ═══════════ pitch detector (normalized cross‑correlation, NSDF) ═══════════ */
function pitchNSDF(td, sr, minRms, fLo, fHi, minConf) {
	const n = td.length; let e = 0;
	for (let i = 0; i < n; i++) { const v = td[i]; e += v * v }
	const rms = Math.sqrt(e / n);
	if (!(rms >= minRms)) return { f: 0, rms: 0 };
	const lagMin = Math.max(2, Math.floor(sr / fHi)), lagMax = Math.min(n - 2, Math.floor(sr / fLo));
	if (lagMax <= lagMin) return { f: 0, rms };
	const ns = new Float32Array(lagMax + 1); let gmax = 0;
	for (let L = lagMin; L <= lagMax; L++) {
		let ac = 0, m = 0;
		for (let i = 0, j = L; j < n; i++, j++) { const a = td[i], b = td[j]; ac += a * b; m += a * a + b * b }
		const v = m > 0 ? 2 * ac / m : 0; ns[L] = v; if (v > gmax) gmax = v;
	}
	if (!(gmax >= minConf)) return { f: 0, rms };
	let L = lagMin; while (L <= lagMax && ns[L] <= 0) L++;
	let pick = -1;
	while (L <= lagMax && pick < 0) {
		let sm = -1, sl = L;
		while (L <= lagMax && ns[L] > 0) { if (ns[L] > sm) { sm = ns[L]; sl = L } L++ }
		if (sm >= 0.85 * gmax) pick = sl;
		while (L <= lagMax && ns[L] <= 0) L++;
	}
	if (pick < 0) return { f: 0, rms };
	const a = pick > lagMin ? ns[pick - 1] : ns[pick], b = ns[pick], c = pick < lagMax ? ns[pick + 1] : ns[pick];
	const den = a + c - 2 * b; let sh = den ? 0.5 * (a - c) / den : 0; sh = clamp(sh, -1, 1);
	const f = sr / (pick + sh);
	if (!(isFinite(f) && f >= 30 && f <= 2500)) return { f: 0, rms };
	return { f, rms, c: gmax };
}

