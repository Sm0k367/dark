/**
 * DJ SMOKE STREAM - Advanced Visualization Logic
 * Implements: Waveform Display and Radial Circle Visualization
 */

const VisModes = {
    /**
     * Waveform Rendering: Real-time cyan line with glow [1]
     */
    drawWaveform(ctx, canvas, analyser, dataArray) {
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00d9ff'; // Accent Cyan
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
    },

    /**
     * Radial Visualization: 3 concentric circles with frequency-based radius [1]
     * Uses: Cyan, Magenta, and Purple rings from the Design System [2]
     */
    drawRadial(ctx, canvas, analyser, dataArray) {
        analyser.getByteFrequencyData(dataArray);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Define the 3 concentric rings [1]
        const rings = [
            { color: '#00d9ff', index: 10 }, // Inner: Cyan
            { color: '#ff006e', index: 40 }, // Middle: Magenta
            { color: '#b537f2', index: 80 }  // Outer: Purple
        ];

        rings.forEach((ring, i) => {
            const frequencyValue = dataArray[ring.index];
            const radius = (frequencyValue / 255) * (canvas.height / 3) + (i * 20);

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = ring.color;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 20;
            ctx.shadowColor = ring.color;
            ctx.stroke();
            
            // Add a subtle "synthetic soul" pulse effect [3]
            ctx.globalAlpha = 0.2;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
    }
};

// Integration Logic: Update the main render loop
function updateRenderMode(visualizerInstance) {
    const { ctx, canvas, analyser, dataArray, currentMode } = visualizerInstance;
    
    if (currentMode === 'waveform') {
        VisModes.drawWaveform(ctx, canvas, analyser, dataArray);
    } else if (currentMode === 'radial') {
        VisModes.drawRadial(ctx, canvas, analyser, dataArray);
    }
}
