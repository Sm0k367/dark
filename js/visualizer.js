/**
 * DJ SMOKE STREAM - Visualizer Engine
 * Core Logic: Web Audio API, Canvas Rendering, & Media Controls
 */

class AudioVisualizer {
    constructor() {
        // Elements
        this.audio = document.getElementById('audioElement');
        this.canvas = document.getElementById('visualizerCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.playBtn = document.getElementById('playPauseBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.volumeSlider = document.getElementById('volumeSlider');
        
        // Audio Context Setup
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;
        
        // State
        this.isPlaying = false;
        this.currentMode = 'bars'; // modes: bars, waveform, radial
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupAudioContext() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        
        // Technical Specs from sources: FFT 256, 64 bars, 0.85 smoothing [1]
        this.analyser.fftSize = 256; 
        this.analyser.smoothingTimeConstant = 0.85;
        
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        const bufferLength = this.analyser.frequencyBinCount; // 128
        this.dataArray = new Uint8Array(bufferLength);
        
        this.render();
    }

    setupEventListeners() {
        // Play/Pause Toggle
        this.playBtn.addEventListener('click', () => this.togglePlay());

        // Progress Bar Seeking
        this.progressBar.addEventListener('click', (e) => {
            const rect = this.progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = pos * this.audio.duration;
        });

        // Volume Control
        this.volumeSlider.addEventListener('input', (e) => {
            this.audio.volume = e.target.value;
        });

        // Keyboard Shortcuts [4]
        window.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space': 
                    e.preventDefault();
                    this.togglePlay(); 
                    break;
                case 'ArrowRight': 
                    this.audio.currentTime += 5; 
                    break;
                case 'ArrowLeft': 
                    this.audio.currentTime -= 5; 
                    break;
                case 'ArrowUp': 
                    this.audio.volume = Math.min(1, this.audio.volume + 0.1);
                    this.volumeSlider.value = this.audio.volume;
                    break;
                case 'ArrowDown': 
                    this.audio.volume = Math.max(0, this.audio.volume - 0.1);
                    this.volumeSlider.value = this.audio.volume;
                    break;
            }
        });

        // Audio Events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
    }

    togglePlay() {
        if (!this.audioContext) this.setupAudioContext();

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

    updateProgress() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = `${percent}%`;
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
    }

    render() {
        requestAnimationFrame(() => this.render());
        
        if (!this.isPlaying) return;

        this.analyser.getByteFrequencyData(this.dataArray);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render 64-bar visualization [1, 3]
        const barWidth = (this.canvas.width / 64);
        let x = 0;

        for (let i = 0; i < 64; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height;
            
            // Neon gradient: Cyan to Magenta [5]
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
            gradient.addColorStop(0, '#00d9ff'); // Accent Cyan
            gradient.addColorStop(1, '#ff006e'); // Accent Magenta

            this.ctx.fillStyle = gradient;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00d9ff';
            
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new AudioVisualizer();
});
