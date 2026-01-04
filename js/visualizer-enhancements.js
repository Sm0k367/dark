/**
 * DJ SMOKE STREAM - Advanced Visualization Logic
 * Implements: Waveform and Radial modes as per Visualization System [6]
 */

class VisualizerEnhancements {
    static drawWaveform(visualizer) {
        const { ctx, canvas, analyser, dataArray } = visualizer;
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00d9ff'; // Cyan Glow [6]
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
        ctx.stroke();
    }

    static drawRadial(visualizer) {
        const { ctx, canvas, analyser, dataArray } = visualizer;
        analyser.getByteFrequencyData(dataArray);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const rings = [
            { color: '#00d9ff', index: 10 }, // Cyan
            { color: '#ff006e', index: 35 }, // Magenta
            { color: '#b537f2', index: 70 }  // Purple [7]
        ];

        rings.forEach((ring, i) => {
            const freq = dataArray[ring.index];
            const radius = (canvas.height / 4) + (i * 30) + (freq / 2);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = ring.color;
            ctx.lineWidth = 5;
            ctx.stroke();
        });
    }
}

// Mode Switcher Shortcut [8]
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm' && window.visualizer) {
        const modes = ['bars', 'waveform', 'radial'];
        const currentIdx = modes.indexOf(window.visualizer.currentMode || 'bars');
        window.visualizer.currentMode = modes[(currentIdx + 1) % modes.length];
        console.log("Mode changed to:", window.visualizer.currentMode);
    }
});
