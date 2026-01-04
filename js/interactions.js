/**
 * DJ SMOKE STREAM - Interactivity Engine
 * Implements: Mouse Parallax, Ripple Effects, and Scroll Animations
 */

class InteractionsManager {
    constructor() {
        this.orbs = document.querySelectorAll('.orb');
        this.buttons = document.querySelectorAll('.icon-btn, .play-btn');
        this.container = document.querySelector('.player-container');
        
        this.init();
    }

    init() {
        this.setupParallax();
        this.setupRipples();
        this.setupScrollObserver();
    }

    /**
     * Mouse Parallax Effects [2]
     * Moves background orbs slightly in opposition to mouse movement
     * for a depth-heavy "Midnight atmosphere" [5].
     */
    setupParallax() {
        window.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            this.orbs.forEach((orb, index) => {
                const speed = (index + 1) * 20;
                const x = (mouseX - 0.5) * speed;
                const y = (mouseY - 0.5) * speed;
                
                // Using CSS transforms for performance optimization [3]
                orb.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }

    /**
     * Ripple Animations on button clicks [2]
     * Provides tactile visual feedback for Professional Player Controls [6].
     */
    setupRipples() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const x = e.clientX - e.target.offsetLeft;
                const y = e.clientY - e.target.offsetTop;

                const ripple = document.createElement('span');
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.classList.add('ripple-effect');

                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    /**
     * Intersection Observer for Scroll Animations [2, 3]
     * Smoothly fades in the player container when it enters the viewport.
     */
    setupScrollObserver() {
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(20px)';
        this.container.style.transition = 'all 0.8s ease-out';
        
        observer.observe(this.container);
    }
}

// Add the CSS for ripples dynamically to keep style.css clean
const style = document.createElement('style');
style.textContent = `
    .ripple-effect {
        position: absolute;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        pointer-events: none;
        border-radius: 50%;
        animation: ripple 0.6s linear;
    }
    @keyframes ripple {
        from { width: 0; height: 0; opacity: 0.5; }
        to { width: 200px; height: 200px; opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize Interactions
document.addEventListener('DOMContentLoaded', () => {
    new InteractionsManager();
});
