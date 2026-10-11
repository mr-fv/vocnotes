'use strict';

const $ = s => document.querySelector(s);

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

const f2m = f => 69 + 12 * Math.log2(f / 440);

const m2f = m => 440 * Math.pow(2, (m - 69) / 12);

const median = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1] };

const fmt = t => { if (!isFinite(t) || t < 0) t = 0; const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1) };

const num = (v, d = 1) => isFinite(v) ? v.toFixed(d) : '—';

const drawLine = (g, x1, y1, x2, y2) => {
	g.beginPath();
	g.moveTo(x1, y1);
	g.lineTo(x2, y2);
	g.stroke();
};

const RLO = 36;
const RHI = 96;
const RSPAN = RHI - RLO;
const rPct = m => clamp((m - RLO) / RSPAN * 100, 0, 100);


let actx = null;
let gMusic = null;
let gRef = null;
function ensureAudio() {
	if (!actx) {
		actx = new (window.AudioContext || window.webkitAudioContext)();
		gMusic = actx.createGain();
		gRef = actx.createGain();
		gMusic.gain.value = $('#volM').value / 100;
		gRef.gain.value = $('#volR').value / 100;
		gMusic.connect(actx.destination);
		gRef.connect(actx.destination);
	}
	if (actx.state === 'suspended') actx.resume();
}