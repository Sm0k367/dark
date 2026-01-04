/**
 * DJ SMOKE STREAM - Visualizer Engine (Bug Fix Version)
 * Fixes: FileList indexing and Playback Promise Aborts
 * Implements: FFT 256, 0.85 Smoothing [3]
 */

class AudioVisualizer {
    constructor() {
        this.audio = document.getElementById('audioElement');
        this.fileInput = document.getElementById('audioUpload');
        this.playBtn = document.getElementById('playPauseBtn');
        this.trackTitle = document.getElementById('trackTitle');
        
        this.audioContext = null;
        this.analyser = null;
        this.isPlaying = false;
        
        this.init();
    }

    init() {
        // Correcting the File Selection Error
        this.fileInput.addEventListener('change', (e) => {
            const selectedFile = e.target.files; // FIX: Access the specific file at index 0
            
            if (selectedFile) {
                // Ensure the URL is correctly generated from a single File object
                const url = URL.createObjectURL(selectedFile);
                this.audio.src = url;
                this.audio.load(); // Prepare the Media Element [1]
                
                // Update UI text using "Space Mono" or "Orbitron" styles [4]
                this.trackTitle.textContent = selectedFile.name.replace(/\.[^/.]+$/, "");
                this.isPlaying = false;
            }
        });

        // Handle the Playback Promise
        this.playBtn.addEventListener('click', () => this.handlePlayback());
    }

    async setupAudioEngine() {
        if (!this.audioContext) {
            // Source requirement: Chrome/Edge 14+, Firefox 25+, Safari 6+ [5]
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            
            // Visualization Specs from Source [3]
            this.analyser.fftSize = 256; 
            this.analyser.smoothingTimeConstant = 0.85;

            const source = this.audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        }
        
        // Browsers require interaction to resume AudioContext [6]
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    async handlePlayback() {
        try {
            await this.setupAudioEngine();

            if (this.audio.paused) {
                // FIX: Await the play() promise to prevent AbortError [1]
                await this.audio.play();
                this.isPlaying = true;
                this.playBtn.innerHTML = '⏸'; 
            } else {
                this.audio.pause();
                this.isPlaying = false;
                this.playBtn.innerHTML = '▶';
            }
        } catch (err) {
            // Troubleshooting: Check console for blocked autoplay [7]
            console.error("Playback failed:", err);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AudioVisualizer();
});
