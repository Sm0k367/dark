/**
 * DJ SMOKE STREAM - Advanced Visualization Logic
 * Implements: Waveform and Radial Circle Visualizations
 * Specifications: 0.85 smoothing, Cyan/Magenta/Purple palette
 */

class VisualizerEnhancements {
    /**
     * Waveform Rendering: Real-time cyan line with glow.
     * Technical Specs: Uses time-domain data for smooth line drawing [1, 2].
     */
    static drawWaveform(visualizer) {
        const { ctx, canvas, analyser, dataArray } = visualizer;
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00d9ff'; // Accent Cyan [4]
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
     * Radial Visualization: 3 concentric circles [1].
     * Uses: Frequency-based radius and color-coded rings [1, 4].
     */
    static drawRadial(visualizer) {
        const { ctx, canvas, analyser, dataArray } = visualizer;
        analyser.getByteFrequencyData(dataArray);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Define the 3 rings using the source color palette [4]
        const rings = [
            { color: '#00d9ff', index: 10 }, // Inner: Cyan
            { color: '#ff006e', index: 35 }, // Middle: Magenta
            { color: '#b537f2', index: 70 }  // Outer: Purple
        ];

        rings.forEach((ring, i) => {
            const frequencyValue = dataArray[ring.index];
            // Radius mappings for immersive animations [5]
            const baseRadius = (canvas.height / 4) + (i * 30);
            const dynamicRadius = baseRadius + (frequencyValue / 2);

            ctx.beginPath();
            ctx.arc(centerX, centerY, dynamicRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = ring.color;
            ctx.lineWidth = 5;
            ctx.shadowBlur = 20;
            ctx.shadowColor = ring.color;
            ctx.stroke();
            
            // Subtle pulse fill
            ctx.globalAlpha = 0.05;
            ctx.fillStyle = ring.color;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
    }
}

/**
 * Global Mode Controller
 * Allows cycling through Bar, Waveform, and Radial via 'M' key [6, 7].
 */
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm') {
        const modes = ['bars', 'waveform', 'radial'];
        const v = window.visualizer;
        if (!v) return;

        const currentIdx = modes.indexOf(v.currentMode || 'bars');
        v.currentMode = modes[(currentIdx + 1) % modes.length];
        
        const indicator = document.getElementById('visualizerMode');
        if (indicator) {
            indicator.textContent = `MODE: ${v.currentMode.toUpperCase()}`;
        }
    }
});
🛠 Finishing the Integration
To make these modes display correctly, ensure your render() function in js/visualizer.js includes the following logic to switch between the methods:
render() {
    requestAnimationFrame(() => this.render());
    if (!this.isPlaying || !this.analyser) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.currentMode === 'waveform') {
        VisualizerEnhancements.drawWaveform(this);
    } else if (this.currentMode === 'radial') {
        VisualizerEnhancements.drawRadial(this);
    } else {
        // Default 64-Bar rendering [1]
        this.analyser.getByteFrequencyData(this.dataArray);
        const barWidth = (this.canvas.width / 64);
        let x = 0;
        for (let i = 0; i < 64; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height;
            this.ctx.fillStyle = '#00d9ff'; 
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
    }
}
