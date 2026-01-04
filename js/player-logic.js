/**
 * DJ SMOKE STREAM - Player Logic (User Upload Version)
 * Implements: Dynamic Time Formatting, Repeat Modes, and Navigation
 */

class PlayerManager {
    constructor() {
        this.audio = document.getElementById('audioElement');
        this.currentTimeDisplay = document.querySelector('.current-time');
        this.totalDurationDisplay = document.querySelector('.total-duration');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        this.progressBar = document.getElementById('progressBar');
        
        // State management
        this.isShuffle = false;
        this.repeatMode = 0; // 0: No Repeat, 1: Repeat All, 2: Repeat One
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Update total duration once the user's file metadata is loaded
        this.audio.addEventListener('loadedmetadata', () => {
            this.totalDurationDisplay.textContent = this.formatTime(this.audio.duration);
        });

        // Dynamic Time Updates
        this.audio.addEventListener('timeupdate', () => {
            this.currentTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
        });

        // Repeat Mode Cycle (Gray -> Cyan -> Magenta)
        this.repeatBtn.addEventListener('click', () => {
            this.repeatMode = (this.repeatMode + 1) % 3;
            this.updateRepeatUI();
        });

        // Handle Track End based on Professional Repeat Modes
        this.audio.addEventListener('ended', () => {
            if (this.repeatMode === 1 || this.repeatMode === 2) {
                this.audio.currentTime = 0;
                this.audio.play();
            } else {
                // No Repeat: Stop and reset
                this.audio.pause();
                this.audio.currentTime = 0;
                document.getElementById('playPauseBtn').classList.remove('playing');
            }
        });

        // Shuffle Toggle (Visual Feedback only for single-track mode)
        this.shuffleBtn.addEventListener('click', () => {
            this.isShuffle = !this.isShuffle;
            this.shuffleBtn.style.color = this.isShuffle ? '#00d9ff' : '#fff';
        });

        // Keyboard Seek Shortcuts (5-second skips)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowRight') this.audio.currentTime += 5;
            if (e.code === 'ArrowLeft') this.audio.currentTime -= 5;
            if (e.code === 'ArrowUp') this.audio.volume = Math.min(1, this.audio.volume + 0.1);
            if (e.code === 'ArrowDown') this.audio.volume = Math.max(0, this.audio.volume - 0.1);
        });
    }

    /**
     * Updates the UI based on specific color-coded repeat modes:
     * 1. No Repeat (Gray)
     * 2. Repeat All (Cyan)
     * 3. Repeat One (Magenta)
     */
    updateRepeatUI() {
        const colors = ['#808080', '#00d9ff', '#ff006e'];
        const currentModeColor = colors[this.repeatMode];
        this.repeatBtn.style.color = currentModeColor;
    }

    /**
     * Converts seconds into MM:SS format
     */
    formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.playerManager = new PlayerManager();
});
