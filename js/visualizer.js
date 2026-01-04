/**
 * DJ SMOKE STREAM - Visualizer Engine (Production Fix)
 * Addresses: File selection index and AudioContext resumption
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
        
        // Metadata elements for the Orbitron/Space Mono titles
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
     * Resumes the AudioContext. Source [2] notes that 
     * user interaction is required for audio context to start.
     */
    async resumeAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256; // Spec from Source [4]
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
        this.fileInput.addEventListener('change', async (e) => {
            // FIX: Access the specific file  from the FileList
            const file = e.target.files; 
            
            if (file) {
                const url = URL.createObjectURL(file);
                
                // Reset and load the new blob
                this.audio.pause();
                this.audio.src = url;
                this.audio.load();

                // Update UI metadata (Source [5] Typography)
                this.trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
                this.artistName.textContent = "Local Upload";

                try {
                    await this.resumeAudioContext();
                    await this.audio.play();
                    this.isPlaying = true;
                } catch (err) {
                    console.error("Playback failed. Check browser console [1]:", err);
                }
            }
        });

        this.playBtn.addEventListener('click', async () => {
            await this.resumeAudioContext();
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
        } else {
            this.audio.pause();
            this.isPlaying = false;
        }
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
    }

    render() {
        requestAnimationFrame(() => this.render());
        if (!this.isPlaying || !this.analyser) return;

        // Implementation of the 64-bar frequency visualizer [4]
        this.analyser.getByteFrequencyData(this.dataArray);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const barWidth = (this.canvas.width / 64);
        let x = 0;

        for (let i = 0; i < 64; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height;
            // Neon Gradient using Accent Cyan and Accent Magenta [5]
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
            gradient.addColorStop(0, '#00d9ff'); 
            gradient.addColorStop(1, '#ff006e'); 

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.visualizer = new AudioVisualizer();
});
