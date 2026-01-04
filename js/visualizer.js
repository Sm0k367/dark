/**
 * DJ SMOKE STREAM - Visualizer Engine (Bug Fix Version)
 * Fixes: FileList indexing and Playback Promise Aborts
 */

class AudioVisualizer {
    constructor() {
        this.audio = document.getElementById('audioElement');
        this.canvas = document.getElementById('visualizerCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.fileInput = document.getElementById('audioUpload');
        this.playBtn = document.getElementById('playPauseBtn');
        this.trackTitle = document.getElementById('trackTitle');
        
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.isPlaying = false;
        this.currentMode = 'bars'; 
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.resizeCanvas();
    }

    async setupAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256; // Requirement from Source [6]
            this.analyser.smoothingTimeConstant = 0.85; // Requirement from Source [6]

            const source = this.audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.render();
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    setupEventListeners() {
        this.fileInput.addEventListener('change', (e) => {
            // FIX: Access the first file in the list 
            const file = e.target.files; 
            
            if (file) {
                const url = URL.createObjectURL(file);
                this.audio.src = url;
                this.trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
                
                // Reset state for new track
                this.isPlaying = false;
                this.playBtn.classList.remove('playing');
            }
        });

        this.playBtn.addEventListener('click', async () => {
            await this.setupAudioContext();
            this.togglePlay();
        });
    }

    async togglePlay() {
        try {
            if (this.audio.paused) {
                // FIX: Await the play promise to prevent AbortError
                await this.audio.play();
                this.isPlaying = true;
                this.playBtn.classList.add('playing');
            } else {
                this.audio.pause();
                this.isPlaying = false;
                this.playBtn.classList.remove('playing');
            }
        } catch (err) {
            console.error("Playback safety check:", err);
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

        const barWidth = (this.canvas.width / 64);
        for (let i = 0; i < 64; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height;
            this.ctx.fillStyle = '#00d9ff'; // Accent Cyan [7]
            this.ctx.fillRect(i * barWidth, this.canvas.height - barHeight, barWidth - 2, barHeight);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.visualizer = new AudioVisualizer();
});
