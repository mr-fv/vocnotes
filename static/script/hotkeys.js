window.addEventListener('keydown', e => {
	if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
	if (e.code === 'Space') { e.preventDefault(); S.playing ? pause() : play(); }
	if (e.code === 'ArrowLeft') { e.preventDefault(); seek(pos() - 2); }
	if (e.code === 'ArrowRight') { e.preventDefault(); seek(pos() + 2); }
});