class AudioVisualizer {
    constructor() {
        this.audio = document.getElementById('audioElement');
        this.fileInput = document.getElementById('audioUpload');
        this.playBtn = document.getElementById('playPauseBtn');
        this.trackTitle = document.getElementById('trackTitle');
        
        this.audioContext = null;
        this.analyser = null;
        this.source = null; // Store source to prevent re-connection errors
        this.isPlaying = false;

        this.init();
    }

    init() {
        // Handle File Selection
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files; // Access the specific file
            if (file) {
                const url = URL.createObjectURL(file);
                this.audio.src = url;
                this.audio.load(); // Force browser to recognize the new file
                this.trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
                this.isPlaying = false;
            }
        });

        // Handle Playback - Must be a direct user click
        this.playBtn.addEventListener('click', () => this.handlePlayback());
    }

    async handlePlayback() {
        // 1. Initialize Audio Engine on first click (Requirement: User Interaction)
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256; // Spec from source [4]
            
            // Connect Media Element to Visualizer [3]
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.startRendering(); // Start the visual loops
        }

        // 2. Resume Context (Required for Chrome/Safari) [2]
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        // 3. Toggle Play/Pause
        if (this.audio.paused) {
            try {
                await this.audio.play();
                this.isPlaying = true;
                this.playBtn.textContent = "⏸"; // Visual feedback [5]
            } catch (err) {
                console.error("Playback blocked:", err);
            }
        } else {
            this.audio.pause();
            this.isPlaying = false;
            this.playBtn.textContent = "▶";
        }
    }

    startRendering() {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const canvas = document.getElementById('visualizerCanvas');
        const ctx = canvas.getContext('2d');

        const render = () => {
            requestAnimationFrame(render);
            if (!this.isPlaying) return;

            this.analyser.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw 64-bar visualization [4]
            const barWidth = canvas.width / 64;
            for (let i = 0; i < 64; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                ctx.fillStyle = '#00d9ff'; // Accent Cyan [6]
                ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
            }
        };
        render();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AudioVisualizer();
});
