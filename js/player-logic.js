/**
 * DJ SMOKE STREAM - Player State Manager
 * Implements: Playlist Logic, Repeat Modes, & Time Formatting
 */

class PlayerManager {
    constructor() {
        this.audio = document.getElementById('audioElement');
        this.currentTimeDisplay = document.querySelector('.current-time');
        this.totalDurationDisplay = document.querySelector('.total-duration');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        
        // State management
        this.isShuffle = false;
        this.repeatMode = 0; // 0: No Repeat, 1: Repeat All, 2: Repeat One [3]
        
        // Track data from sources [4]
        this.playlist = [
            {
                title: "AI Lounge: After Dark",
                artist: "DJ Smoke Stream",
                duration: "2:58",
                src: "audio/ai-lounge-after-dark.mp3"
            }
            // Additional tracks can be added here for full playlist support [5]
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Set initial duration from source metadata [4]
        this.totalDurationDisplay.textContent = this.playlist.duration;
    }

    setupEventListeners() {
        // Shuffle Toggle
        this.shuffleBtn.addEventListener('click', () => {
            this.isShuffle = !this.isShuffle;
            this.shuffleBtn.style.color = this.isShuffle ? '#00d9ff' : '#fff'; // Cyan for active
            this.shuffleBtn.classList.toggle('active', this.isShuffle);
        });

        // Repeat Mode Cycle [3]
        this.repeatBtn.addEventListener('click', () => {
            this.repeatMode = (this.repeatMode + 1) % 3;
            this.updateRepeatUI();
        });

        // Time Update Formatting [2]
        this.audio.addEventListener('timeupdate', () => {
            this.currentTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
        });

        // Handle Track End based on Repeat Mode [3]
        this.audio.addEventListener('ended', () => {
            if (this.repeatMode === 2) { // Repeat One (Magenta)
                this.audio.currentTime = 0;
                this.audio.play();
            } else if (this.repeatMode === 1) { // Repeat All (Cyan)
                // Logic for next track would go here
                this.audio.currentTime = 0;
                this.audio.play();
            }
        });
    }

    /**
     * Updates the UI based on the specific Repeat Modes defined in sources [3]:
     * 1. No Repeat (Gray)
     * 2. Repeat All (Cyan)
     * 3. Repeat One (Magenta)
     */
    updateRepeatUI() {
        const colors = ['#808080', '#00d9ff', '#ff006e'];
        const currentModeColor = colors[this.repeatMode];
        
        this.repeatBtn.style.color = currentModeColor;
        this.repeatBtn.style.filter = `drop-shadow(0 0 5px ${currentModeColor})`;
    }

    /**
     * Formats seconds into MM:SS for the professional time display [2]
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize Player Logic
document.addEventListener('DOMContentLoaded', () => {
    window.playerManager = new PlayerManager();
});
