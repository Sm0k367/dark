/**
 * DJ SMOKE STREAM - Visualizer Engine (Playback Fix)
 * Ensures AudioContext resumes on user interaction and handles Blobs correctly.
 */

class AudioVisualizer {
    constructor() {
        this.audio = document.getElementById('audioElement');
        this.canvas = document.getElementById('visualizerCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.fileInput = document.getElementById('audioUpload');
        this.playBtn = document.getElementById('playPauseBtn');
        this.progressFill = document.getElementById('progressFill');
        this.volumeSlider = document.getElementById('volumeSlider');
        
        this.trackTitle = document.getElementById('trackTitle');
        this.artistName = document.getElementById('artistName');
        
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;
        this.isPlaying = false;
        this.currentMode = 'bars'; 
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Resumes or starts the AudioContext. 
     * Browsers require this inside a user-initiated event. [2]
     */
    async startAudioEngine() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256; // Technical spec from sources [3]
            this.analyser.smoothingTimeConstant = 0.85;

            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.render();
        }

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    setupEventListeners() {
        // Updated File Upload Logic
        this.fileInput.addEventListener('change', async (e) => {
            const file = e.target.files;
            if (file) {
                // Create a local URL for the file
                const url = URL.createObjectURL(file);
                
                // Reset audio state for new track
                this.audio.pause();
                this.audio.src = url;
                this.audio.load(); // Forces the browser to load the new blob [1]

                // Update UI metadata [4]
                this.trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
                this.artistName.textContent = "Local Upload";

                // Ensure engine starts and track plays
                try {
                    await this.startAudioEngine();
                    await this.audio.play();
                    this.isPlaying = true;
                    this.playBtn.classList.add('playing');
                } catch (err) {
                    console.error("Playback failed:", err);
                }
            }
        });

        this.playBtn.addEventListener('click', async () => {
            await this.startAudioEngine();
            this.togglePlay();
        });

        this.audio.addEventListener('timeupdate', () => {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressFill.style.width = `${percent}%`;
        });

        this.volumeSlider.addEventListener('input', (e) => {
            this.audio.volume = e.target.value;
        });
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play();
            this.isPlaying = true;
            this.playBtn.classList.add('playing');
        } else {
            this.audio.pause();
            this.isPlaying = false;
            this.playBtn.classList.remove('playing');
        }
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
    }

    render() {
        requestAnimationFrame(() => this.render());
        if (!this.isPlaying || !this.analyser) return;

        this.analyser.getByteFrequencyData(this.dataArray);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Standard 64-bar visualization logic [3]
        const barWidth = (this.canvas.width / 64);
        let x = 0;

        for (let i = 0; i < 64; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height;
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
            gradient.addColorStop(0, '#00d9ff'); // Accent Cyan [5]
            gradient.addColorStop(1, '#ff006e'); // Accent Magenta [5]

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.visualizer = new AudioVisualizer();
});
