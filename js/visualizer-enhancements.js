/**
 * DJ SMOKE STREAM - Advanced Visualization Logic (User Upload Version)
 * Implements: Waveform Display and Radial Circle Visualization
 */

class VisualizerEnhancements {
    /**
     * Waveform Rendering: Real-time cyan line with glow
     * Fulfills: "Cyan color with glow" and "Smooth line drawing" [3]
     */
    static drawWaveform(visualizer) {
        const { ctx, canvas, analyser, dataArray } = visualizer;
        // Get time-domain data for waveform rendering [4]
        analyser.getByteTimeDomainData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00d9ff'; // Accent Cyan [2]
        ctx.shadowBlur = 20;
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
     * Radial Visualization: 3 concentric circles based on frequency [3]
     * Uses: Cyan (#00d9ff), Magenta (#ff006e), and Purple (#b537f2) [2]
     */
    static drawRadial(visualizer) {
        const { ctx, canvas, analyser, dataArray } = visualizer;
        analyser.getByteFrequencyData(dataArray);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Define the 3 concentric rings as per the Visualization System [3]
        const rings = [
            { color: '#00d9ff', index: 15 }, // Inner: Cyan
            { color: '#ff006e', index: 45 }, // Middle: Magenta
            { color: '#b537f2', index: 85 }  // Outer: Purple
        ];

        rings.forEach((ring, i) => {
            const frequencyValue = dataArray[ring.index];
            // Dynamic radius mapping for "immersive animations" [1]
            const baseRadius = (canvas.height / 4) + (i * 30);
            const radius = baseRadius + (frequencyValue / 255) * 50;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = ring.color;
            ctx.lineWidth = 5;
            ctx.shadowBlur = 25;
            ctx.shadowColor = ring.color;
            ctx.stroke();
            
            // Subtle fill for "synthetic soul" aesthetic [5]
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = ring.color;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
    }
}

/**
 * Integration: Mode Switcher logic to be called by the main render loop.
 * Cycles between: 64-Bars (default), Waveform, and Radial.
 */
window.toggleVisualizationMode = function() {
    const modes = ['bars', 'waveform', 'radial'];
    const v = window.visualizer;
    const currentIdx = modes.indexOf(v.currentMode || 'bars');
    v.currentMode = modes[(currentIdx + 1) % modes.length];
    
    // Update the UI indicator added in index.html
    const indicator = document.getElementById('visualizerMode');
    if (indicator) {
        indicator.textContent = `Mode: ${v.currentMode.toUpperCase()}`;
    }
};

// Listen for 'M' key to change modes manually
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm') window.toggleVisualizationMode();
});
