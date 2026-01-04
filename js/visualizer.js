/**
 * DJ SMOKE STREAM - Visualizer Engine
 * Uses Media Element API for standard playback and Web Audio API for visuals.
 * Fulfills: 64-bar visualization, smooth transitions (0.85), and FFT 256 [5].
 */

class AudioVisualizer {
    constructor() {
        this.audio = document.getElementById('audioElement');
        this.canvas = document.getElementById('visualizerCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.fileInput = document.getElementById('audioUpload');
        this.playBtn = document.getElementById('playPauseBtn');
        this.progressFill = document.getElementById('progressFill');
        
        this.trackTitle = document.getElementById('trackTitle');
        this.artistName = document.getElementById('artistName');
        
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.isPlaying = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Required for "Million Dollar Production Quality" visuals [4].
     * Initializes the analyzer with FFT 256 and 0.85 smoothing [5].
     */
    setupWebAudio() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256; 
        this.analyser.smoothingTimeConstant = 0.85;

        // Connect the audio element to the visualizer and then to your speakers
        const source = this.audioContext.createMediaElementSource(this.audio);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.render();
    }

    setupEventListeners() {
        // Handle local file selection
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files; // Select the first file picked
            if (file) {
                // Creates a local URL for the file (no external API needed)
                const url = URL.createObjectURL(file);
                this.audio.src = url;
                
                // Update UI text using "Space Mono" or "Orbitron" styles [6]
                this.trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
                this.artistName.textContent = "Local Track";
                
                // Reset player state
                this.isPlaying = false;
                this.playBtn.innerHTML = '▶'; 
            }
        });

        // Toggle Play/Pause - This interaction is required by browsers [3]
        this.playBtn.addEventListener('click', () => {
            this.togglePlay();
        });

        // Keyboard Shortcut: Space for Play/Pause [7]
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
        });
    }

    async togglePlay() {
        // Resume AudioContext if it's suspended (Browser security requirement)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        } else {
            this.setupWebAudio();
        }

        if (this.audio.paused) {
            this.audio.play();
            this.isPlaying = true;
            this.playBtn.innerHTML = '⏸'; // Update to pause icon
        } else {
            this.audio.pause();
            this.isPlaying = false;
            this.playBtn.innerHTML = '▶'; // Update to play icon
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

        // Render the 64 frequency bars [5]
        const barWidth = (this.canvas.width / 64);
        let x = 0;

        for (let i = 0; i < 64; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height;
            // Uses Accent Cyan and Accent Magenta from the Design System [6]
            this.ctx.fillStyle = i % 2 === 0 ? '#00d9ff' : '#ff006e';
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.visualizer = new AudioVisualizer();
});
