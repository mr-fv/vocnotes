btnPlay.addEventListener('click', () => S.playing ? pause() : play());
btnStart.addEventListener('click', () => seek(0));
rngSeek.addEventListener('input', e => seek(+e.target.value));
rngSeek.addEventListener('pointerdown', () => dragSeek = true);
window.addEventListener('pointerup', () => dragSeek = false);

rngMusVol.addEventListener('input', e => { changeVolume(C_MUS, e.target.value); });
rngRefVol.addEventListener('input', e => { changeVolume(C_REF, e.target.value); });

rngMusVol.addEventListener('wheel', e => { changeVolume(C_MUS, e.target.value - Math.trunc(e.deltaY / 100)); });
rngRefVol.addEventListener('wheel', e => { changeVolume(C_REF, e.target.value - Math.trunc(e.deltaY / 100)); });

btnLyrics.addEventListener('click', e => { toggleLyrics(!boxLyrics.classList.contains('open')); });
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
	toggleInd(cb.dataset.ind, cb.checked);
}));


document.querySelectorAll('[data-trk]').forEach(cb => cb.addEventListener('change', () => {
	toggleTrk(cb.dataset.trk, cb.checked);
}));

document.querySelectorAll('[data-lyr]').forEach(cb => cb.addEventListener('change', () => {
	toggleLyr(cb.dataset.lyr, cb.checked);
}));

inpLyrSize.addEventListener('change', e => { changeLyrSize(e.target.value); });

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

textLyrics.addEventListener('keydown', e => {
	e.stopPropagation();
})

btnThemeToggle.addEventListener('click', e => {
	applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
});

boxMain.addEventListener("pointerdown", (e) => {
	const handle = e.target.closest(".resizer");
	if (!handle || !boxLyrics.contains(handle)) { return; }
	e.preventDefault();
	activeHandle = handle;
	handle.setPointerCapture(e.pointerId);
	handle.classList.add("is-active");
	document.body.classList.add("is-resizing");
	startX = e.clientX;
	startWidth = boxLyrics.getBoundingClientRect().width;
	direction = handle.classList.contains("resizer-right") ? 1 : -1;
});

boxMain.addEventListener("pointermove", (e) => {
	if (!activeHandle) { return; }
	const min = 100;
	const max = Math.max(min, Math.floor(boxMain.clientWidth * 0.8));
	const nextWidth = Math.min(max, Math.max(min, startWidth + (e.clientX - startX) * direction));
	setLyrWidth(nextWidth);
});

const stopResize = (e) => {
	if (!activeHandle) { return; }
	activeHandle.releasePointerCapture?.(e.pointerId);
	activeHandle.classList.remove("is-active");
	activeHandle = null;
	document.body.classList.remove("is-resizing");
};

boxMain.addEventListener("pointerup", stopResize);
boxMain.addEventListener("pointercancel", stopResize);