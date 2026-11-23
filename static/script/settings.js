class SettingsManager {
	constructor(key = 'app_settings') {
		this.storageKey = key;
		this.defaults = {
			version: CURRENT_VERSION,
			'data-theme': 'dark',
			lyricsOpen: false,
			lyrAutoscroll: true,
			lyrSize: 14,
			lyrWidth: 320,
			indNote: true,
			indHz: true,
			indDb: true,
			indRange: true,
			specPanel: true,
			music: true,
			ref: true,
			mic: true,
			volMUS: 100,
			volREF: 100,
		};
		this.state = this.load();
	}

	load() {
		try {
			const storedData = localStorage.getItem(this.storageKey);
			if (!storedData) { return { ...this.defaults }; }
			const parsedData = JSON.parse(storedData);
			// Reset only when the stored schema is NEWER than the code
			// (e.g. an older backup was restored). Otherwise merge over
			// the defaults so new options appear while user choices survive.
			if (!parsedData.version || parsedData.version > CURRENT_VERSION) { return { ...this.defaults }; }
			return { ...this.defaults, ...parsedData, version: CURRENT_VERSION };
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
			console.warn(`field "${field}" not defined in the default settings.`);
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