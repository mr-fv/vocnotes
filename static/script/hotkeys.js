window.addEventListener('keydown', e => {
	if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
	if (e.code === 'Space') {
		e.preventDefault();
		if (!e.repeat) S.playing ? pause() : play();
	}
	if (e.code === 'ArrowLeft') { e.preventDefault(); seek(pos() - 2); }
	if (e.code === 'ArrowRight') { e.preventDefault(); seek(pos() + 2); }
	if (e.code === 'Escape') {
		const menu = document.getElementById('menu');
		if (menu) {
			menu.classList.remove('open');
			menu.removeAttribute('mode');
		}
	}
});
