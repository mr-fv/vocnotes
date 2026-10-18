class SettingsManager {
	constructor(key = 'app_settings') {
		this.storageKey = key;
		this.defaults = {
			version: CURRENT_VERSION,
			theme: 'dark',
			lyricsOpen: false,
			lyrAutoscroll: true,
			indNote: true,
			indHz: true,
			indDb: true,
			indRange: true,
			specPanel: true,
			music: true,
			ref: true,
			mic: true,
		};
		this.state = this.load();
	}

	load() {
		try {
			const storedData = localStorage.getItem(this.storageKey);
			if (!storedData) { return { ...this.defaults }; }
			const parsedData = JSON.parse(storedData);
			if (!parsedData.version || parsedData.version < CURRENT_VERSION) { return { ...this.defaults }; }
			return { ...this.defaults, ...parsedData };
		} catch (e) {
			console.error('Error reading settings:', e);
			return { ...this.defaults };
		}
	}

	save() {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.state));
			return true;
		} catch (e) {
			console.error('Error saving settings:', e);
			return false;
		}
	}


	set(field, value) {
		if (!(field in this.defaults)) {
			console.warn(`Поле "${field}" not defined in the default settings.`);
		}
		this.state[field] = value;
		this.save();
	}


	get(field) { return this.state[field]; }

	reset() {
		this.state = { ...this.defaults };
		this.save();
	}
}


// // 2. Чтение настройки при загрузке страницы
// document.documentElement.setAttribute('data-theme', settings.get('theme'));
// console.log('Текущая тема:', settings.get('theme'));

// // 3. Изменение настройки (например, по клику на кнопку переключения темы)
// function toggleTheme() {
// 	const currentTheme = settings.get('theme');
// 	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

// 	// Обновляем UI немедленно
// 	document.documentElement.setAttribute('data-theme', newTheme);

// 	// Сохраняем в localStorage
// 	settings.set('theme', newTheme);
// }

// // 4. Добавление обработчика события
// document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);