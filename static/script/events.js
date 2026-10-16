btnPlay.addEventListener('click', () => S.playing ? pause() : play());
btnStart.addEventListener('click', () => seek(0));
rngSeek.addEventListener('input', e => seek(+e.target.value));
rngSeek.addEventListener('pointerdown', () => dragSeek = true);
window.addEventListener('pointerup', () => dragSeek = false);


rngMusVol.addEventListener('input', e => { changeVolume(C_MUS, e.target.value); });
rngRefVol.addEventListener('input', e => { changeVolume(C_REF, e.target.value); });

btnLyrics.addEventListener('click', e => { boxLyrics.classList.toggle('open'); btnLyrics.classList.toggle('open'); });
btnMenuOpen.addEventListener('click', e => { e.stopPropagation(); boxMenu.classList.add('open'); boxMenu.removeAttribute('mode'); });
btnMenuClose.addEventListener('click', e => {
	e.stopPropagation();
	if (boxMenu.getAttribute('mode') === null) {
		boxMenu.classList.remove('open');
	} else {
		boxMenu.removeAttribute('mode');
	}
});
document.addEventListener('click', e => { if (!boxMenu.contains(e.target)) boxMenu.classList.remove('open'); });

btnLoadMus.addEventListener('click', () => inpFileMus.click());
btnLoadRef.addEventListener('click', () => inpFileRef.click());
btnOpenPlaylist.addEventListener('click', () => { boxMenu.setAttribute('mode', 'playlist'); });
inpFileMus.addEventListener('change', e => {
	if (e.target.files[0]) loadAudio(C_MUS, e.target.files[0]);
	e.target.value = '';
});
inpFileRef.addEventListener('change', e => {
	if (e.target.files[0]) loadAudio(C_REF, e.target.files[0]);
	e.target.value = '';
});
document.querySelectorAll('[data-ind]').forEach(cb => cb.addEventListener('change', () => {
	document.getElementById(cb.dataset.ind).style.display = cb.checked ? '' : 'none';
}));

const chips = { music: lgMus, ref: lgRef, mic: lgMic };
document.querySelectorAll('[data-trk]').forEach(cb => cb.addEventListener('change', () => {
	S.show[cb.dataset.trk] = cb.checked;
	chips[cb.dataset.trk].classList.toggle('off', !cb.checked);
}));

btnRangeReset.addEventListener('click', () => { S.rangeNotes.length = 0; computeRange(); });

function chartSeekEv(e) {
	const r = cvChart.getBoundingClientRect(), g = S.geo; if (!g) return;
	const frac = clamp((e.clientX - r.left - g.x0) / g.pw, 0, 1);
	seek(S.t0 + frac * (S.t1 - S.t0));
}
cvChart.addEventListener('pointerdown', e => {
	chartDrag = true;
	cvChart.setPointerCapture(e.pointerId);
	chartSeekEv(e);
});
cvChart.addEventListener('pointermove', e => { if (chartDrag) chartSeekEv(e); });
cvChart.addEventListener('pointerup', () => chartDrag = false);
cvChart.parentElement.addEventListener('wheel', e => {
	e.preventDefault();
	S.view.win = clamp(S.view.win * (e.deltaY > 0 ? 1.25 : 0.8), 3, Math.max(60, duration() + 30));
}, { passive: false });

function stripSeekEv(e) {
	const D = duration(); if (!D) return;
	const r = cvStrip.getBoundingClientRect();
	seek(clamp((e.clientX - r.left) / r.width, 0, 1) * D);
}
cvStrip.addEventListener('pointerdown', e => {
	stripDrag = true;
	cvStrip.setPointerCapture(e.pointerId);
	stripSeekEv(e);
});
cvStrip.addEventListener('pointermove', e => { if (stripDrag) stripSeekEv(e); });
cvStrip.addEventListener('pointerup', () => stripDrag = false);

btnRec.addEventListener('click', async () => {
	if (!S.micOn) {
		if (!(await ensureMic())) return;
		btnRec.querySelector('b').textContent = 'Stop recording';
		btnRec.classList.add('on');
	} else {
		stopMic();
		btnRec.querySelector('b').textContent = 'Start recording';
		btnRec.classList.remove('on');
	}
});