'use strict';

const CURRENT_VERSION = 3.6;

const fontFamily = 'Manrope';

/* ═══════════ theme palette (canvas) ═══════════ */

let colorOrange;
let colorAmber;
let colorAmber85;
let colorMint;
let colorMintLight;
let colorCoral;
let colorCoral00;
let colorCoral14;
let colorSpecFill;
let colorSpecStroke;
let colorSpecWhite;
let colorStrokeBrown;
let colorStroke13;
let colorStroke05;
let colorStripMint06;
let colorStripBlue5;
let colorStripAmber5;
let colorStripTick;
let colorStopsWhite;
let colorStopsBlack;
let glowTrack;
let glowCursor;

const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

function syncTheme() {
	colorOrange = cssVar('--cv-orange');
	colorAmber = cssVar('--cv-amber');
	colorAmber85 = cssVar('--cv-amber85');
	colorMint = cssVar('--cv-mint');
	colorMintLight = cssVar('--cv-mint-light');
	colorCoral = cssVar('--cv-coral');
	colorCoral00 = cssVar('--cv-coral00');
	colorCoral14 = cssVar('--cv-coral14');
	colorSpecFill = cssVar('--cv-spec-fill');
	colorSpecStroke = cssVar('--cv-spec-stroke');
	colorSpecWhite = cssVar('--cv-spec-white');
	colorStrokeBrown = cssVar('--cv-stroke-c');
	colorStroke13 = cssVar('--cv-stroke-white-key');
	colorStroke05 = cssVar('--cv-stroke-black-key');
	colorStripMint06 = cssVar('--cv-strip-played');
	colorStripBlue5 = cssVar('--cv-strip-mus');
	colorStripAmber5 = cssVar('--cv-strip-ref');
	colorStripTick = cssVar('--cv-strip-tick');
	colorStopsWhite = cssVar('--cv-key-white');
	colorStopsBlack = cssVar('--cv-key-black');
	glowTrack = parseFloat(cssVar('--cv-glow-track')) || 0;
	glowCursor = parseFloat(cssVar('--cv-glow-cursor')) || 0;
}

/* ═══════════ / ═══════════ */

const boxMain = $('main');
const btnLoadMus = $('#btnLoadMusic');
const btnLoadRef = $('#btnLoadRef');
const btnOpenPlaylist = $('#btnOpenPlaylist');
const boxLoadMusStatus = $('#btnLoadMusic .m-status');
const boxLoadRefStatus = $('#btnLoadRef .m-status');
const rngSeek = $('#seek');
const rngMusVol = $('#volM');
const rngRefVol = $('#volR');
const boxMusVolVal = $('#volMv');
const boxRefVolVal = $('#volRv');
const boxMenu = $('#menu');
const btnLyrics = $('#btnLyrics');
const btnMenuOpen = $('#btnMenuOpen');
const btnMenuClose = $('#btnMenuClose');
const inpFileMus = $('#fileMusic');
const inpFileRef = $('#fileRef');
const btnRangeReset = $('#btnRangeReset');
const btnPlay = $('#btnPlay');
const btnStart = $('#btnStart');
const btnRec = $('#btnRec');
const boxTimeDur = $('#timeDur');
const inpSpecPanel = $('#specPanel');
const boxRangeBar = $('#rangeBar');
const boxDiag = $('#diag');
const boxRangeTicks = $('#rangeTicks');
const boxRangeName = $('#rangeName');
const boxRangeZone = $('#rangeZone');
const boxRzHi = $('#rzHi');
const boxRzLo = $('#rzLo');
const boxRangeEmpty = $('#rangeEmpty');
const boxRangeInfo = $('#rangeInfo');
const boxTimeNow = $('#timeNow');
const boxNoteName = $('#noteName');
const boxNoteRef = $('#noteRef');
const boxHzVal = $('#hzVal');
const boxCentsVal = $('#centsVal');
const boxCentsMark = $('#centsMark');
const boxDBVal = $('#dbVal');
const boxDBFill = $('#dbFill');
const boxDBPeak = $('#dbPeak');
const boxPlaylist = $('#playlist');
const boxLyrics = $('.lyrics');
const textLyrics = $('#lyricsText');
const boxAppVersion = $('#appVersion');
const btnThemeToggle = $('#btnThemeToggle');
const inpLyrSize = $('#lyrSize');

const cvChart = $('#chart');
const cvStrip = $('#strip');
const cvSpec = $('#spec')
const gChart = cvChart.getContext('2d');
const gStrip = cvStrip.getContext('2d');
const gSpec = cvSpec.getContext('2d');

const lgMus = $('#lgMusic');
const lgRef = $('#lgRef');
const lgMic = $('#lgMic');
const chips = { music: lgMus, ref: lgRef, mic: lgMic };

/* ═══════════ test ═══════════ */

/* self‑test of the musical scale: 12 notes + reference frequencies */
window.addEventListener('DOMContentLoaded', () => {
	const ok = (
		NOTES.length === 12
		&& midiName(60) === NOTES[0] + '4'
		&& midiName(59) === NOTES[11] + '3'
		&& midiName(56) === NOTES[8] + '3'
		&& midiName(58) === NOTES[10] + '3'
		&& Math.round(f2m(246.94)) === 59
		&& Math.round(f2m(233.08)) === 58
	);
	if (!ok) throw new Error('Note table error');
});

/* ═══════════ state ═══════════ */

const S = {
	playing: false,
	offset: 0,
	anchor: 0,
	musicBuf: null,
	refBuf: null,
	peaksM: null,
	peaksR: null,
	refPitch: null,
	refStep: 0,
	live: [],
	rangeNotes: [],
	lastMidi: 0,
	dispMidi: 0,
	show: {
		music: true,
		ref: true,
		mic: true
	},
	view: {
		win: 16,
		tLo: 48,
		tHi: 77,
		init: false
	},
	lyrics: {
		lyrAutoscroll: true,
	},
	dbfs: -99,
	freq: 0,
	cents: 0,
	voiced: false,
	micOn: false,
	t0: 0,
	t1: 16,
	geo: null,
};

let lyricTimes = [];
let lastLyricTime = 0;
let lastLyricItem = 0;
let badSamples = 0;
let srcM = null;
let srcR = null;
let micStream = null;
let analyser = null;
let tdBuf = null;
let fdBuf = null;
let hist = [];
let dragSeek = false;
let stripDrag = false;
let chartDrag = false;
let peakDb = -99;
let rangeTick = 0;
let peaksCap = new Float32Array(0);
let activeHandle = null;
let startX = 0;
let startWidth = 0;
let direction = 1;

/* ═══════════ canvases ═══════════ */

function fit(cv) {
	const w = cv.clientWidth;
	const h = cv.clientHeight;
	cv.width = Math.max(60, w * DPR);
	cv.height = Math.max(40, h * DPR);
	cv._w = w;
	cv._h = h;
}
[cvChart, cvStrip, cvSpec].forEach(cv => {
	fit(cv);
	new ResizeObserver(() => fit(cv)).observe(cv);
});


/* ═══════════ audio graph ═══════════ */

const duration = () => Math.max(S.musicBuf ? S.musicBuf.duration : 0, S.refBuf ? S.refBuf.duration : 0);
const pos = () => S.playing ? S.offset + (actx.currentTime - S.anchor) : S.offset;

function stopSources() {
	[srcM, srcR].forEach(s => {
		if (s) {
			try { s.stop() }
			catch (e) { }
		}
	});
	srcM = srcR = null;
}

function startSources() {
	if (S.musicBuf && S.offset < S.musicBuf.duration) {
		srcM = actx.createBufferSource();
		srcM.buffer = S.musicBuf;
		srcM.connect(gMusic);
		srcM.start(0, S.offset);
	}
	if (S.refBuf && S.offset < S.refBuf.duration) {
		srcR = actx.createBufferSource();
		srcR.buffer = S.refBuf;
		srcR.connect(gRef);
		srcR.start(0, S.offset);
	}
}

function play() {
	ensureAudio();
	if (S.playing) return;

	const d = duration();
	if (d > 0 && S.offset >= d - 0.02) S.offset = 0;

	const now = performance.now() / 1000;
	for (const q of S.live) { if (q.tr == null) { q.tr = S.offset - (now - q.wall); } }
	if (S.offset <= 0.001) { S.live.length = 0; }
	else { S.live = S.live.filter(q => q.tr < S.offset); }
	S.anchor = actx.currentTime;
	S.playing = true;
	startSources();
	updPlayBtn();
}

function pause() {
	if (!S.playing) return;
	S.offset = pos();
	stopSources();
	S.playing = false;
	updPlayBtn();
}

function seek(t) {
	t = Math.max(0, t);
	const d = duration();
	if (d > 0) t = Math.min(t, d);
	S.offset = t;
	S.live.length = 0;
	if (S.playing) {
		stopSources();
		S.anchor = actx.currentTime;
		startSources();
	}
	rngFill(rngSeek);
}

function updPlayBtn() {
	btnPlay.classList.add(S.playing ? 'fa-pause' : 'fa-play');
	btnPlay.classList.remove(S.playing ? 'fa-play' : 'fa-pause');
	btnPlay.classList.toggle('on', S.playing);
}

/* ═══════════ uploading files ═══════════ */

async function loadMp3AsFile(url, fileName = null) {
	const response = await fetch(url);
	if (!response.ok) throw new Error('Failed to load ' + url);
	const blob = await response.blob();
	if (fileName === null) {
		fileName = url.split('/').pop() || 'audio.mp3';
	}
	const file = new File([blob], fileName, { type: 'audio/mpeg' });
	return file;
}

function loadLyrics(lyrics) {
	textLyrics.innerHTML = '';
	lyricTimes = [];

	let i = 0;
	let prev = 0;
	let mode = null;

	function addSpan(cssclass, text = null) {
		const span = document.createElement('span');
		span.innerText = text !== null ? text : lyrics.slice(prev, i);
		span.classList.add(cssclass);
		textLyrics.appendChild(span);
		return span;
	}

	while (i < lyrics.length) {
		if (mode === null && lyrics[i] === '{' && lyrics[i + 1] === '$' && lyrics[i + 2] === 't' && lyrics[i + 3] === ':') {
			mode = 'time';
			addSpan('text');
			prev = i + 4;
			i += 3;
		} else if (mode === 'time' && lyrics[i] === '}') {
			mode = null;
			const timenumber = lyrics.slice(prev, i);
			const timespan = addSpan('time', timenumber);
			const timesec = (() => {
				if (!timenumber.includes(':')) { return Number(timenumber); }
				else {
					const sp = timenumber.split(':');
					return Number(sp[0]) * 60 + Number(sp[1]);
				}
			})();
			lyricTimes.push([Number(timesec), timespan]);
			prev = i + 1;
		} else if (mode === null && lyrics[i] === '[') {
			mode = 'sect';
			addSpan('text');
			prev = i + 1;
		} else if (mode === 'sect' && lyrics[i] === ']') {
			mode = null;
			addSpan('sect');
			prev = i + 1;
		}
		i += 1;
	}
	addSpan('text');
}

async function loadPlaylistTrack(key) {
	const data_url = "/static/playlist/" + key + ".json";
	const track = await fetch(data_url).then(response => response.json());
	const MUS_FILE = await loadMp3AsFile('/static/playlist/' + track.music, key + ' [music]');
	await loadAudio(C_MUS, MUS_FILE);
	const VOC_FILE = await loadMp3AsFile('/static/playlist/' + track.vocal, key + ' [vocals]');
	await loadAudio(C_REF, VOC_FILE);
	if (track.lyrics !== null) { loadLyrics(track.lyrics); }
}

function peaksOf(buf, n = 1400) {
	const d = buf.getChannelData(0);
	const p = new Float32Array(n);
	const sp = Math.floor(d.length / n) || 1;
	for (let i = 0; i < n; i++) {
		let m = 0;
		const a = i * sp;
		const b = Math.min(d.length, a + sp);
		const st = Math.max(1, sp >> 7);
		for (let j = a; j < b; j += st) {
			const v = Math.abs(d[j]);
			if (isFinite(v) && v > m) { m = v; }
		}
		p[i] = m;
	}
	return p;
}

function updateDur() {
	const d = duration();
	boxTimeDur.textContent = fmt(d);
	if (d > 0) { rngSeek.disabled = false; rngSeek.max = d; }
	else { rngSeek.disabled = true; }
}

async function loadAudio(which, file) {
	ensureAudio();

	const status_box = which === C_MUS ? boxLoadMusStatus : boxLoadRefStatus;
	const box = which === C_MUS ? btnLoadMus : btnLoadRef;

	setStatus(status_box, `Decoding...`);
	try {
		const buf = await actx.decodeAudioData(await file.arrayBuffer());
		if (which === C_MUS) {
			S.musicBuf = buf;
			S.peaksM = peaksOf(buf);
		} else {
			S.refBuf = buf;
			S.peaksR = peaksOf(buf);
			setStatus(status_box, 'The reference is loaded, height analysis...');
			await analyzeRef(buf);
		}
		updateDur();
	} catch (e) {
		setStatus(status_box, 'The file could not be decoded');
		box.classList.remove('loaded');
		throw Error(e);
	}
	setStatus(status_box, file.name);
	box.classList.add('loaded');
}

async function analyzeRef(buf) {
	S.refPitch = null;
	try {
		const RATE = 12000, W = 1024, HOP = 512;
		const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(buf.duration * RATE)), RATE);
		const src = off.createBufferSource();
		src.buffer = buf;
		src.connect(off.destination);
		src.start();
		const rend = await off.startRendering();
		const d = rend.getChannelData(0);
		const frames = Math.max(0, Math.floor((d.length - W) / HOP) + 1);
		const out = new Float32Array(frames); let i = 0;
		while (i < frames) {
			const end = Math.min(i + 300, frames);
			for (; i < end; i++) {
				const seg = d.subarray(i * HOP, i * HOP + W);
				for (let k = 0; k < seg.length; k++) { if (!isFinite(seg[k])) seg[k] = 0; }
				const r = pitchNSDF(seg, RATE, 0.004, 70, 1000, 0.4);
				out[i] = ((r.c || 0) > 0.45 && isFinite(r.f) && r.f > 0) ? r.f : 0;
			}
			setStatus(boxLoadRefStatus, 'Reference: analysis ' + Math.round(i / frames * 100) + '%');
			await new Promise(r => setTimeout(r, 0));
		}
		const sm = new Float32Array(frames);
		for (let k = 0; k < frames; k++) {
			const a = out[k - 1];
			const b = out[k];
			const c = out[k + 1];
			sm[k] = (b > 0 && a > 0 && c > 0) ? median([a, b, c]) : b;
		}
		S.refPitch = sm;
		S.refStep = HOP / RATE;
	} catch (e) {
		setStatus(boxLoadRefStatus, 'Reference analysis error');
	}
	setStatus(boxLoadRefStatus, 'reference is ready');
}

/* ═══════════ microphone ═══════════ */

async function ensureMic() {
	if (micStream) return true;
	ensureAudio();
	try {
		micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } });
		const s = actx.createMediaStreamSource(micStream);
		analyser = actx.createAnalyser();
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = 0.5;
		s.connect(analyser);
		tdBuf = new Float32Array(analyser.fftSize);
		fdBuf = new Uint8Array(analyser.frequencyBinCount);
		S.micOn = true;
		return true;
	} catch (e) {
		throw Error('No access to the microphone.');
		return false;
	}
}

function stopMic() {
	if (micStream) micStream.getTracks().forEach(t => t.stop());
	micStream = null;
	analyser = null;
	tdBuf = null;
	fdBuf = null;
	S.micOn = false;
	S.voiced = false;
	S.dbfs = -99;
}

function tickMic() {
	if (!analyser) return;
	if (analyser.getFloatTimeDomainData) {
		analyser.getFloatTimeDomainData(tdBuf);
	} else {
		const b = new Uint8Array(tdBuf.length);
		analyser.getByteTimeDomainData(b);
		for (let i = 0; i < b.length; i++) {
			tdBuf[i] = (b[i] - 128) / 128;
		}
	}

	for (let i = 0; i < tdBuf.length; i++) {
		const v = tdBuf[i];
		if (!isFinite(v)) {
			tdBuf[i] = 0;
			badSamples++;
		}
	}

	analyser.getByteFrequencyData(fdBuf);
	const r = pitchNSDF(tdBuf, actx.sampleRate, LIVE_MIN_RMS, 55, 1200, LIVE_CONF);
	S.dbfs = (isFinite(r.rms) && r.rms > 1e-6) ? 20 * Math.log10(r.rms) : -99;

	if (isFinite(r.f) && r.f >= 50 && r.f <= 1200) {
		const m = f2m(r.f);
		if (isFinite(m)) {
			hist.push(m);
			if (hist.length > 5) { hist.shift(); }

			const mm = median(hist);
			if (isFinite(mm) && Math.abs(mm - m) < 3) {
				S.voiced = true;
				S.freq = r.f;
				S.dispMidi = mm;
				S.cents = 1200 * Math.log2(r.f / m2f(Math.round(mm)));

				if (isFinite(S.cents) && (!S.lastMidi || Math.abs(mm - S.lastMidi) < 2)) {
					S.rangeNotes.push(mm);
					if (S.rangeNotes.length > 40000) { S.rangeNotes.splice(0, 10000); }
				}
				S.lastMidi = mm;
				S.live.push({ wall: performance.now() / 1000, tr: S.playing ? pos() : null, m: mm });
			} else {
				S.voiced = false;
			}
		} else {
			S.voiced = false;
		}
	} else {
		S.voiced = false;
		hist.length = 0;
		S.lastMidi = 0;
	}

	const nowW = performance.now() / 1000;
	while (S.live.length && (nowW - S.live[0].wall > 300 || S.live.length > 25000)) {
		S.live.shift();
	}
}

/* ═══════════ chart ═══════════ */

const liveT = (q, now) => q.tr != null ? q.tr : S.offset - (now - q.wall);

function drawPitchTrack(g, pts, color, width) {
	const n = pts.length; if (!n) return;
	const spike = new Uint8Array(n);

	for (let i = 1; i < n - 1; i++) {
		const a = pts[i - 1];
		const b = pts[i];
		const c = pts[i + 1];
		if (b.t - a.t > 0.2 || c.t - b.t > 0.2) continue;
		const d1 = Math.abs(b.m - a.m);
		const d2 = Math.abs(c.m - b.m);
		const d3 = Math.abs(c.m - a.m);
		if (d1 > 4 && d2 > 4 && d3 <= 4) { spike[i] = 1; }
	}
	g.strokeStyle = color;
	g.lineWidth = width;
	g.lineJoin = 'round';
	g.lineCap = 'round';
	g.shadowColor = color;
	g.shadowBlur = glowTrack;
	g.beginPath();
	let prev = null;

	for (let i = 0; i < n; i++) {
		if (spike[i]) { prev = null; continue; }
		const p = pts[i];
		const cont = prev && (p.t - prev.t) <= 0.2 && Math.abs(p.m - prev.m) <= 4;
		if (cont) { g.lineTo(p.x, p.y); }
		else { g.moveTo(p.x, p.y); }
		prev = p;
	}
	g.stroke();
	g.fillStyle = color;
	g.globalAlpha = .8;
	for (let i = 0; i < n; i++) {
		if (spike[i]) {
			g.beginPath();
			g.arc(pts[i].x, pts[i].y, 2.3, 0, 7);
			g.fill();
		}
	}
	g.globalAlpha = 1;
	g.shadowBlur = 0;
}

function drawChart() {
	const g = gChart;
	const W = cvChart._w;
	const H = cvChart._h;
	g.setTransform(DPR, 0, 0, DPR, 0, 0);
	g.clearRect(0, 0, W, H);
	const p = pos();
	const win = S.view.win;
	const d = duration();
	const nowW = performance.now() / 1000;
	let t1 = S.playing ? p + win * 0.35 : p + win * 0.5;
	let t0 = t1 - win;

	if (S.playing && d > 0 && t1 > d + win * 0.15) {
		t1 = d + win * 0.15;
		t0 = t1 - win
	}
	S.t0 = t0;
	S.t1 = t1;

	if (!isFinite(S.view.tLo) || !isFinite(S.view.tHi)) { S.view.tLo = 48; S.view.tHi = 77; }

	let lo = Infinity, hi = -Infinity;
	if (S.show.ref && S.refPitch) {
		const i0 = Math.max(0, Math.floor(t0 / S.refStep));
		const i1 = Math.min(S.refPitch.length - 1, Math.ceil(t1 / S.refStep));
		for (let i = i0; i <= i1; i++) {
			const f = S.refPitch[i];
			if (f > 0) {
				const m = f2m(f);
				if (isFinite(m)) {
					if (m < lo) lo = m;
					if (m > hi) hi = m
				}
			}
		}
	}
	if (S.show.mic) for (const q of S.live) {
		if (!isFinite(q.m)) continue;
		const t = liveT(q, nowW);
		if (t >= t0 && t <= t1) {
			if (q.m < lo) lo = q.m;
			if (q.m > hi) hi = q.m;
		}
	}

	let TL = 48;
	let TH = 77;
	if (isFinite(lo) && isFinite(hi)) {
		TL = lo - 2.5;
		TH = hi + 2.5;
		if (TH - TL < 14) {
			const c = (TL + TH) / 2;
			TL = c - 7;
			TH = c + 7;
		}
	}
	if (!S.view.init) {
		S.view.tLo = TL;
		S.view.tHi = TH;
		S.view.init = true;
	}
	S.view.tLo += (TL - S.view.tLo) * 0.06;
	S.view.tHi += (TH - S.view.tHi) * 0.06;

	const PADL = 46;
	const x0 = PADL;
	const pw = W - PADL - 8;
	S.geo = { x0, pw };
	const x = t => x0 + (t - t0) / (t1 - t0) * pw;
	const y = m => H - 8 - (m - S.view.tLo) / (S.view.tHi - S.view.tLo) * (H - 16);

	const whites = [0, 2, 4, 5, 7, 9, 11];
	g.textAlign = 'right';
	g.textBaseline = 'middle';

	for (let m = Math.floor(S.view.tLo); m <= Math.ceil(S.view.tHi); m++) {
		const pc = ((m % 12) + 12) % 12;
		const Y = y(m);
		if (!isFinite(Y)) continue;
		const isC = pc === 0;
		g.strokeStyle = isC ? colorStrokeBrown : whites.includes(pc) ? colorStroke13 : colorStroke05;
		g.lineWidth = isC ? 1.4 : 1;
		drawLine(g, x0, Y, W - 8, Y);
		if (isC) {
			g.fillStyle = colorAmber85;
			g.font = getFont(10, 600);
			g.fillText(NOTES[0] + (Math.floor(m / 12) - 1), x0 - 6, Y);
		}
	}

	if (S.show.ref && S.refPitch) {
		const pts = [];
		const i0 = Math.max(0, Math.floor(t0 / S.refStep));
		const i1 = Math.min(S.refPitch.length - 1, Math.ceil(t1 / S.refStep));
		for (let i = i0; i <= i1; i++) {
			const f = S.refPitch[i];
			if (f > 0) {
				const m = f2m(f); if (isFinite(m)) {
					const t = i * S.refStep;
					pts.push({ t, m, x: x(t), y: y(m) });
				}
			}
		}
		drawPitchTrack(g, pts, colorAmber, 2.2);
	}

	if (S.show.mic && S.live.length) {
		const pts = [];
		for (const q of S.live) {
			if (!isFinite(q.m)) continue;
			const t = liveT(q, nowW);
			if (t < t0 - 1 || t > t1 + 1) continue;
			pts.push({ t, m: q.m, x: x(t), y: y(q.m) });
		}
		drawPitchTrack(g, pts, colorMint, 2.6);
		if (S.voiced && isFinite(S.dispMidi)) {
			const cx = x(p);
			if (isFinite(cx) && cx >= x0) {
				g.fillStyle = colorMintLight;
				g.shadowColor = colorMint;
				g.shadowBlur = glowTrack ? 16 : 0;
				g.beginPath();
				g.arc(cx, y(S.dispMidi), 4.5, 0, 7);
				g.fill();
				g.shadowBlur = 0;
			}
		}
	}
	const px = x(p);
	if (isFinite(px) && px >= x0) {
		const gr = g.createLinearGradient(px - 14, 0, px, 0);
		gr.addColorStop(0, colorCoral00);
		gr.addColorStop(1, colorCoral14);
		g.fillStyle = gr;
		g.fillRect(px - 14, 0, 14, H);
		g.strokeStyle = colorCoral;
		g.lineWidth = 1.6;
		g.shadowColor = colorCoral;
		g.shadowBlur = glowCursor;
		drawLine(g, px, 0, px, H);
		g.shadowBlur = 0;
		g.fillStyle = colorCoral;
		g.beginPath();
		g.moveTo(px - 5, 0);
		g.lineTo(px + 5, 0);
		g.lineTo(px, 7);
		g.closePath();
		g.fill();
	}
}

/* ═══════════ a strip of tracks ═══════════ */

function drawPeaks(g, pk, W, H, color) {
	g.fillStyle = color;
	const n = pk.length;
	for (let i = 0; i < n; i++) {
		const h = pk[i] * H * 0.85;
		g.fillRect(i * W / n, (H - h) / 2, Math.max(1, W / n - 0.6), h);
	}
}

function niceStep(raw) {
	for (const o of [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120]) { if (o >= raw) { return o; } }
	return 300;
}

function drawStrip() {
	const g = gStrip;
	const W = cvStrip._w;
	const H = cvStrip._h;
	g.setTransform(DPR, 0, 0, DPR, 0, 0);
	g.clearRect(0, 0, W, H);
	const D = duration();
	if (!D) {
		g.fillStyle = colorSpecFill;
		g.font = getFont(11);
		g.textAlign = 'center';
		g.fillText('', W / 2, H / 2);
		return;
	}

	const x = t => t / D * W;
	g.fillStyle = colorStripMint06;
	g.fillRect(0, 0, clamp(x(pos()), 0, W), H);
	if (S.show.music && S.peaksM) drawPeaks(g, S.peaksM, W, H, colorStripBlue5);
	if (S.show.ref && S.peaksR) drawPeaks(g, S.peaksR, W, H, colorStripAmber5);

	const step = niceStep(D / 8);
	g.font = getFont(9);
	for (let t = 0, i = 0; t <= D; t += step, i++) {
		const X = x(t);
		g.fillStyle = colorStripTick;
		g.fillRect(X, H - 10, 1, 10);
		if (i % 2 === 0) {
			g.fillStyle = colorSpecFill;
			g.textAlign = 'left';
			g.fillText(fmt(t).split('.')[0], X + 3, 10);
		}
	}
	g.fillStyle = colorCoral;
	g.fillRect(clamp(x(pos()) - 1, 0, W - 2), 0, 2, H);
}

/* ═══════════ spectrum ═══════════ */

function getFont(size, weight = null) {
	const w = weight === null ? '' : weight + ' ';
	const s = size + 'px';
	return w + s + ' ' + fontFamily;
}

function drawSpec() {
	if (inpSpecPanel.style.display === 'none') return;
	const g = gSpec;
	const W = cvSpec._w;
	const H = cvSpec._h;
	g.setTransform(DPR, 0, 0, DPR, 0, 0);
	g.clearRect(0, 0, W, H);
	const fmin = 60;
	const fmax = 10000;
	const fx = f => Math.log(f / fmin) / Math.log(fmax / fmin) * W;
	g.font = getFont(9);
	g.textAlign = 'center';

	for (const f of [100, 250, 500, 1000, 2000, 4000, 8000]) {
		const X = fx(f);
		g.strokeStyle = colorSpecStroke;
		drawLine(g, X, 0, X, H - 12);
		g.fillStyle = colorSpecFill;
		g.fillText(f >= 1000 ? (f / 1000) + 'к' : f + '', X, H - 3);
	}

	if (!analyser) {
		g.fillStyle = colorSpecFill;
		g.font = getFont(12);
		g.fillText('', W / 2, H / 2 - 6);
		return;
	}

	const bins = 90;
	const bw = W / bins;
	const nyq = actx.sampleRate / 2;

	if (peaksCap.length !== bins) { peaksCap = new Float32Array(bins); }
	for (let i = 0; i < bins; i++) {
		const f = fmin * Math.pow(fmax / fmin, (i + 0.5) / bins);
		const v = (fdBuf[Math.min(fdBuf.length - 1, Math.floor(f / nyq * fdBuf.length))] || 0) / 255;
		const h = Math.pow(v, 1.35) * (H - 16);

		g.fillStyle = v > 0.75 ? colorOrange : v > 0.45 ? colorAmber : colorMint;
		g.globalAlpha = .9;
		g.fillRect(i * bw + 1, H - 12 - h, bw - 2, h);
		g.globalAlpha = 1;

		if (h > peaksCap[i]) { peaksCap[i] = h; }
		else { peaksCap[i] = Math.max(0, peaksCap[i] - 0.7); }

		g.fillStyle = colorSpecWhite;
		g.fillRect(i * bw + 1, H - 12 - peaksCap[i] - 2, bw - 2, 2);
	}
}

/* ═══════════ right panel ═══════════ */

function renderRangeBar() {
	const whites = [0, 2, 4, 5, 7, 9, 11];
	const stops = [];
	for (let m = RLO; m < RHI; m++) {
		const a = ((m - RLO) / RSPAN * 100).toFixed(2);
		const b = ((m + 1 - RLO) / RSPAN * 100).toFixed(2);
		stops.push((whites.includes(m % 12) ? colorStopsWhite : colorStopsBlack) + ' ' + a + '% ' + b + '%');
	}
	boxRangeBar.style.backgroundImage = 'linear-gradient(90deg,' + stops.join(',') + ')';
}

(function () {
	for (let m = 48; m <= RHI; m += 12) {
		const p = ((m - RLO) / RSPAN * 100);
		const i = document.createElement('i');
		i.style.left = p + '%';
		boxRangeTicks.appendChild(i);
		const s = document.createElement('span');
		s.textContent = NOTES[0] + (m / 12 - 1);
		s.style.left = p + '%';
		if (m === RHI) { s.style.transform = 'translateX(-100%)'; }
		boxRangeTicks.appendChild(s);
	}
})();

function computeRange() {
	const A = S.rangeNotes.filter(isFinite);
	if (A.length < 40) {
		boxRangeName.textContent = 'little data';
		boxRangeZone.style.display = 'none';
		boxRzLo.style.display = 'none';
		boxRzHi.style.display = 'none';
		boxRangeEmpty.style.display = 'flex';
		boxRangeEmpty.textContent = 'notes collected: ' + A.length + ' / 40';
		boxRangeInfo.textContent = '';
		return;
	}

	const s = [...A].sort((a, b) => a - b);
	const lo = Math.round(s[Math.floor(0.05 * s.length)]);
	const hi = Math.round(s[Math.floor(0.95 * s.length)]);
	let best = '—';
	let bs = -1;
	for (const [name, l, h] of VOICES) {
		const o = Math.max(0, Math.min(hi, h) - Math.max(lo, l));
		const u = Math.max(hi, h) - Math.min(lo, l);
		if (u > 0 && o / u > bs) { bs = o / u; best = name; }
	}

	boxRangeName.textContent = '≈ ' + best;
	const loP = rPct(lo);
	const hiP = rPct(hi);
	boxRangeEmpty.style.display = 'none';
	boxRangeZone.style.display = 'block';
	boxRangeZone.style.left = loP + '%';
	boxRangeZone.style.width = Math.max(1.5, hiP - loP) + '%';
	boxRzLo.style.display = 'block';
	boxRzHi.style.display = 'block';
	boxRzLo.style.left = loP + '%';
	boxRzHi.style.left = hiP + '%';
	boxRzLo.textContent = midiName(lo);
	boxRzHi.textContent = midiName(hi);
	boxRangeInfo.textContent = 'notes in the measure: ' + A.length + ' · the estimate is approximate';
}

function scrollLyrics(pos) {
	if (pos === lastLyricTime || lyricTimes.length === 0) { return; }
	let i = pos > lastLyricTime ? lastLyricItem : 0;
	let last = i;
	for (i; i < lyricTimes.length; i++) {
		if (pos >= lyricTimes[i][0]) { last = i; }
		else { break; }
	}
	lastLyricTime = pos;
	lastLyricItem = last;
	const rect = lyricTimes[last][1].getBoundingClientRect();
	const cr = textLyrics.getBoundingClientRect();
	const d = rect.top - cr.top;
	const p = textLyrics.scrollTop + d - (textLyrics.clientHeight * 0.25);
	textLyrics.scrollTo({
		top: p,
		behavior: 'smooth'
	});
}

function updUI() {
	const p = pos();

	boxTimeNow.textContent = fmt(p);
	if (!dragSeek) {
		rngSeek.value = Math.min(p, rngSeek.max || 0);
		rngFill(rngSeek);
	}
	if (S.voiced && isFinite(S.dispMidi) && isFinite(S.freq)) {
		boxNoteName.textContent = midiName(S.dispMidi);
		const refHz = m2f(Math.round(S.dispMidi));
		boxNoteRef.textContent = (isFinite(refHz) ? refHz.toFixed(0) : '—') + ' Hz';
		boxHzVal.textContent = num(S.freq, 1);
		if (isFinite(S.cents)) {
			boxCentsVal.textContent = (S.cents > 0 ? '+' : '') + S.cents.toFixed(1);
			boxCentsVal.className = (Math.abs(S.cents) <= 10 ? 'good' : Math.abs(S.cents) <= 25 ? 'mid' : 'bad');
			boxCentsMark.style.left = clamp(50 + S.cents, 1, 99) + '%';
		} else {
			boxCentsVal.textContent = '—';
		}
	} else {
		boxNoteName.textContent = '—';
		boxNoteRef.textContent = '';
		boxHzVal.textContent = '—';
		boxCentsVal.textContent = '—';
	}

	const db = isFinite(S.dbfs) && S.micOn ? S.dbfs : -99;
	boxDBVal.textContent = db < -60 ? '−∞' : num(db, 1);
	boxDBFill.style.width = clamp((db + 60) / 60 * 100, 0, 100) + '%';
	peakDb = Math.max(peakDb - 0.25, db);
	boxDBPeak.style.left = clamp((peakDb + 60) / 60 * 100, 0, 100) + '%';
	if (++rangeTick % 30 === 0) computeRange();
	if (S.lyrics.lyrAutoscroll) scrollLyrics(p);

	// const dg = boxDiag;
	// if (dg) {
	// 	let t = 'sr ' + (actx ? actx.sampleRate : 0);
	// 	t += S.micOn ? (' · input: ' + (S.voiced ? 'f=' + num(S.freq, 1) + ' Hz · ' + num(db, 0) + ' dB · note=' + midiName(S.dispMidi) : 'silence')) : ' · input off';
	// 	if (badSamples > 0) t += ' · bad samples: ' + badSamples;
	// 	dg.textContent = t;
	// }
}

function changeVolume(which, val) {
	if (val > 100) { val = 100; } else if (val < 0) { val = 0; }
	const rng = which === C_MUS ? rngMusVol : rngRefVol;
	const el = which === C_MUS ? boxMusVolVal : boxRefVolVal;
	if (which === C_MUS) { if (gMusic) gMusic.gain.value = val / 100; }
	else { if (gRef) gRef.gain.value = val / 100; }
	el.textContent = val + '%';
	rngFill(rng, val);
	const settingName = which === C_MUS ? 'volMUS' : 'volREF';
	settings.set(settingName, val);
}

function toggleLyrics(state = false) {
	if (state === null || state === undefined) {
		return;
	} else if (state) {
		boxLyrics.classList.add('open');
		btnLyrics.classList.add('open');
	} else {
		boxLyrics.classList.remove('open');
		btnLyrics.classList.remove('open');
	}
	settings.set('lyricsOpen', boxLyrics.classList.contains('open'));
}

function toggleInd(id, state = false) {
	const el = $('[data-ind=' + id + ']');
	el.checked = state;
	document.getElementById(id).style.display = state ? '' : 'none';
	settings.set(id, state);
}

function toggleTrk(id, state = false) {
	const el = $('[data-trk=' + id + ']');
	el.checked = state;
	S.show[id] = state;
	chips[id].classList.toggle('off', !state);
	settings.set(id, state);
}

function toggleLyr(id, state = false) {
	const el = $('[data-lyr=' + id + ']');
	el.checked = state;
	S.lyrics[id] = state;
	settings.set(id, state);
}

function applyTheme(theme) {
	theme = (theme === 'light') ? 'light' : 'dark';
	document.documentElement.setAttribute('data-theme', theme);
	settings.set('data-theme', theme);
	syncTheme();
	renderRangeBar();
	if (btnThemeToggle) btnThemeToggle.classList.toggle('on', theme === 'light');
}

function changeLyrSize(val) {
	if (val < 1) { val = 1; }
	textLyrics.style.fontSize = val + 'pt';
	inpLyrSize.value = val;
	settings.set('lyrSize', val);
}

function setLyrWidth(val) {
	boxLyrics.style.setProperty("--w", val + 'px');
	settings.set('lyrWidth', val);
}

/* ═══════════ load settings ═══════════ */

const settings = new SettingsManager();

applyTheme(settings.get('data-theme'));
toggleLyrics(settings.get('lyricsOpen'));

const inds = ['indNote', 'indHz', 'indDb', 'indRange', 'specPanel'];
for (const ind of inds) { toggleInd(ind, settings.get(ind)); }

const trks = ['music', 'ref', 'mic'];
for (const trk of trks) { toggleTrk(trk, settings.get(trk)); }

const lyrs = ['lyrAutoscroll'];
for (const lyr of lyrs) { toggleLyr(lyr, settings.get(lyr)); }

/* ═══════════ main cycle ═══════════ */

boxAppVersion.innerHTML = 'v' + CURRENT_VERSION;

function frame() {
	try {
		tickMic();
		const d = duration();
		if (S.playing && d > 0 && pos() >= d) { S.offset = d; pause(); }
		drawChart(); drawStrip(); drawSpec(); updUI();
	} catch (err) {
		if (boxDiag) boxDiag.textContent = 'error: ' + err.message;
		if (window.console) console.error('[VOCNOTES]', err);
	}
	requestAnimationFrame(frame);
}
requestAnimationFrame(frame);


rngFill(rngSeek);
changeVolume(C_MUS, settings.get('volMUS'));
changeVolume(C_REF, settings.get('volREF'));
changeLyrSize(settings.get('lyrSize'));
setLyrWidth(settings.get('lyrWidth'));


for (const track of PLAYLIST) {
	const btn = document.createElement("button");
	btn.classList.add('mbtn', 'psong');
	btn.innerHTML = track;
	boxPlaylist.appendChild(btn);
	btn.addEventListener('click', () => {
		boxMenu.removeAttribute('mode');
		loadPlaylistTrack(track);
	});
}
