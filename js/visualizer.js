/**
 * DJ SMOKE STREAM - Visualizer Engine (User Upload Version)
 * Core Logic: File Handling, Web Audio API, & 64-Bar Rendering
 */

class AudioVisualizer {
    constructor() {
        // Core Elements
        this.audio = document.getElementById('audioElement');
        this.canvas = document.getElementById('visualizerCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.fileInput = document.getElementById('audioUpload');
        this.playBtn = document.getElementById('playPauseBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.volumeSlider = document.getElementById('volumeSlider');
        
        // Metadata Elements
        this.trackTitle = document.getElementById('trackTitle');
        this.artistName = document.getElementById('artistName');
        
        // Web Audio Context Setup
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;
        
        // State
        this.isPlaying = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Initializes the Web Audio API AnalyserNode.
     * Technical Specs: FFT 256, 64 bars, 0.85 smoothing [2].
     */
    setupAudioContext() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256; 
        this.analyser.smoothingTimeConstant = 0.85;
        
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.render();
    }

    setupEventListeners() {
        // Handle User File Upload
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files;
            if (file) {
                const url = URL.createObjectURL(file);
                this.audio.src = url;
                
                // Update UI metadata dynamically [3]
                this.trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
                this.artistName.textContent = "Local Track";
                
                // Auto-play upon upload
                this.audio.play();
                this.isPlaying = true;
                if (!this.audioContext) this.setupAudioContext();
            }
        });

        // Play/Pause with Keyboard Shortcut support [4]
        this.playBtn.addEventListener('click', () => this.togglePlay());

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
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
        if (!this.audioContext) this.setupAudioContext();

        if (this.audio.paused) {
            this.audio.play();
            this.isPlaying = true;
        } else {
            this.audio.pause();
            this.isPlaying = false;
        }
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
    }

    /**
     * Renders the 64-bar visualization using the primary neon palette [2, 5].
     */
    render() {
        requestAnimationFrame(() => this.render());
        if (!this.isPlaying) return;

        this.analyser.getByteFrequencyData(this.dataArray);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const barWidth = (this.canvas.width / 64);
        let x = 0;

        for (let i = 0; i < 64; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height;
            
            // Neon Gradient: Accent Cyan to Accent Magenta [5]
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
            gradient.addColorStop(0, '#00d9ff'); 
            gradient.addColorStop(1, '#ff006e'); 

            this.ctx.fillStyle = gradient;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#00d9ff';
            
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.visualizer = new AudioVisualizer();
});
