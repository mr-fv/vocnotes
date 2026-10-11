# VocNotes

**VocNotes** is a specialized web application for vocal analysis, intonation training, and real‑time voice monitoring. The tool is designed for vocalists, teachers, and sound engineers, providing in‑depth audio analytics directly in the browser without the need to install third‑party software.

## Key features

*   **Multi‑track analysis:** Supports simultaneous work with three sound sources: microphone (MIC), reference vocal track (REF), and background track (MUS).
* **Transport Panel:** Play, pause, timeline navigation and precise control of the current time and duration.
* **Pitch Visualization (Pitch Tracking):** Construction of detailed frequency graphs for visual comparison of the user's performance with the original.
* **Spectral Analyzer:** Built-in monitoring of the microphone frequency spectrum in the range from 60 Hz to 10 kHz.
* **Calculation of the vocal range:** Automatic detection and visualization of the vocal range (Vocal Range) based on spoken phrases, with the option to reset the statistics.

## Interface and metrics

The application provides a set of informative widgets for precise control of voice parameters:
*   **Current note and deviation:** Determination of the played note and the intonation accuracy in cents (scale from -50 to +50).
*   **Frequency (Hz):** Display of the exact value of the fundamental frequency.
*   **Signal level (dBFS):** Volume meter with peak value indication (scale from -60 to 0 dB).
*   **Independent mixer:** Precise volume controls for the фонограмма and the reference track.
*   **Hotkeys:** Support for hotkeys for quick interface control.

## Technical details

*   **Architecture:** A single-page client application based on pure Vanilla JavaScript (HTML/CSS/JS) without the use of heavy frameworks.
* **Audio processing:** Based on the **Web Audio API**. It uses fast Fourier transform (FFT) algorithms for spectral analysis and advanced autocorrelation techniques for pitch detection with minimal delay.
* **Privacy:** All audio routing, analysis, and visualization takes place locally on the user's device. Audio data is not sent to the server.
* **UI/UX:** Responsive design using Manrope typography and Font Awesome iconography. Support for customizing the displayed indicators.

## Use cases

* **Vocal training:** Comparing your own pitch curve with a professional performer’s part to work on pitch accuracy.
* **Self‑monitoring:** Real‑time monitoring of pitch accuracy and control over dynamics (volume).
* **Voice research:** Analysis of frequency characteristics, identification of resonant frequencies, and documentation of one’s own vocal range.
