/**
 * DJ SMOKE STREAM - Advanced Visualization Logic
 * Implements: Waveform Display and Radial Circle Visualization
 * Sources: [2], [1], [3]
 */

class VisualizerEnhancements {
    /**
     * Waveform Rendering: Real-time cyan line with glow [1]
     */
    static drawWaveform(visualizer) {
        const { ctx, canvas, analyser, dataArray } = visualizer;
        // Use time-domain data for real-time waveform rendering [3]
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00d9ff'; // Accent Cyan [2]
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00d9ff';
        
        ctx.beginPath();
        const sliceWidth = canvas.width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }

    /**
     * Radial Visualization: 3 concentric circles [1]
     * Uses: Cyan, Magenta, and Purple color-coded rings [2]
     */
    static drawRadial(visualizer) {
        const { ctx, canvas, analyser, dataArray } = visualizer;
        // Use frequency data for frequency-based radius [1]
        analyser.getByteFrequencyData(dataArray);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Define the 3 concentric rings from the Design System [2]
        const rings = [
            { color: '#00d9ff', index: 10 }, // Inner: Cyan
            { color: '#ff006e', index: 30 }, // Middle: Magenta
            { color: '#b537f2', index: 60 }  // Outer: Purple
        ];

        rings.forEach((ring, i) => {
            const frequencyValue = dataArray[ring.index];
            // Radius calculation: Base size + frequency intensity
            const radius = (canvas.height / 4) + (i * 25) + (frequencyValue / 4);

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = ring.color;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 20;
            ctx.shadowColor = ring.color;
            ctx.stroke();
        });
    }
}

/**
 * Integration: Logic to cycle through modes using the "M" key.
 */
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm') {
        const modes = ['bars', 'waveform', 'radial'];
        const v = window.visualizer;
        const currentIdx = modes.indexOf(v.currentMode);
        v.currentMode = modes[(currentIdx + 1) % modes.length];
        
        const indicator = document.getElementById('visualizerMode');
        if (indicator) indicator.textContent = `Mode: ${v.currentMode.toUpperCase()}`;
    }
});
🛠 Final Integration Steps
To make these modes appear, you must add one small check inside your js/visualizer.js file. Locate the render() function and update it to look like this:
render() {
    requestAnimationFrame(() => this.render());
    if (!this.isPlaying || !this.analyser) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dynamic Mode Selection based on the sources [1]
    if (this.currentMode === 'waveform') {
        VisualizerEnhancements.drawWaveform(this);
    } else if (this.currentMode === 'radial') {
        VisualizerEnhancements.drawRadial(this);
    } else {
        // Default: 64-Bar Visualization
        this.analyser.getByteFrequencyData(this.dataArray);
        const barWidth = (this.canvas.width / 64);
        let x = 0;
        for (let i = 0; i < 64; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height;
            this.ctx.fillStyle = '#00d9ff'; // Accent Cyan
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
    }
}
