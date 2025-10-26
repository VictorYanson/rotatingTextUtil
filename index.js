 class RotatingWordEffect {
    /**
     * @param {string} selector - CSS selector of the container element (e.g., '#word-rotator').
     * @param {string[]} words - Array of words to cycle through.
     * @param {number} totalDuration - Total duration of one animation cycle in seconds. (e.g., 12)
     */
    constructor(selector, words, totalDuration = 12) {
        this.container = document.querySelector(selector);
        if (!this.container) {
            console.error(`RotatingWordEffect: Element not found for selector: ${selector}`);
            return;
        }
        this.words = words;
        this.wordCount = words.length;
        this.totalDuration = totalDuration;
        this.init();
    }

    /**
     * 1. Generates the inner HTML structure (wrapper, stack, words).
     * 2. Measures the single word height.
     * 3. Dynamically generates and injects the CSS keyframes.
     */
    init() {
        // --- 1. Setup HTML Structure ---
        const wordStackHTML = this.generateWordStack();
        this.container.innerHTML = `
            <span class="rotating-words-wrapper">
                <span class="word-stack">${wordStackHTML}</span>
            </span>
        `;
        
        // --- 2. Inject CSS Styles ---
        this.injectBaseStyles();
        this.generateAndInjectKeyframes();
    }

    /**
     * Generates the word elements, duplicating the list for a seamless loop.
     * @returns {string} HTML string of the word stack.
     */
    generateWordStack() {
        // Duplicate the words array to ensure the seamless loop
        const fullWords = [...this.words, ...this.words];
        const colors = ['#fde047', '#fb7185', '#4ade80', '#6366f1']; // Tailwind colors

        return fullWords.map((word, index) => {
            const colorIndex = index % this.wordCount; // Cycle through the word count, not the full list
            const color = colors[colorIndex % colors.length];

            return `<span class="word-item" style="color: ${color};">${word}</span>`;
        }).join('');
    }

    /**
     * Injects base CSS necessary for clipping and vertical stacking.
     */
    injectBaseStyles() {
        let style = document.getElementById(STYLE_ID + '-base');
        if (style) return; // Already injected

        style = document.createElement('style');
        style.id = STYLE_ID + '-base';
        style.textContent = `
            /* Styles applied dynamically by JS */
            .rotating-words-wrapper {
                display: inline-block;
                position: relative;
                vertical-align: bottom;
                overflow: hidden;
                line-height: 1.2;
                height: 1.25em; /* CRITICAL: Sets the clipping height */
                font-weight: 800;
            }
            .word-stack {
                display: block;
                /* The animation name is defined in generateAndInjectKeyframes */
                animation-timing-function: cubic-bezier(0.76, 0, 0.24, 1);
                animation-iteration-count: infinite;
            }
            .word-item {
                display: block;
                line-height: 1.2em;
                font-weight: 800;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Dynamically generates the @keyframes based on the number of words (N)
     * and the total duration (T).
     */
    generateAndInjectKeyframes() {
        const N = this.wordCount;
        const T = this.totalDuration;
        
        // Duration for each word cycle (hold + transition)
        const stepDuration = 100 / N; 
        // Hold time (e.g., 80% of step duration)
        const holdDuration = stepDuration * 0.8;
        // Transition time (e.g., 20% of step duration)
        const transitionDuration = stepDuration * 0.2;

        let keyframes = `@keyframes wordSlide-${N} { \n`;

        for (let i = 0; i < N; i++) {
            const translateY = -(i * 1.2); // Movement in em units
            const startPercent = i * stepDuration;
            const endPercent = startPercent + holdDuration;

            // Hold the current word in view
            keyframes += `    ${startPercent.toFixed(2)}%, ${endPercent.toFixed(2)}% { \n`;
            keyframes += `        transform: translateY(${translateY}em); \n`;
            keyframes += `    } \n\n`;
        }

        // Final step (100%): Seamless loop jump
        const finalTranslateY = -(N * 1.2); 
        keyframes += `    100% { \n`;
        keyframes += `        transform: translateY(${finalTranslateY}em); \n`;
        keyframes                += `    } \n`;
        keyframes += `} \n`;

        // --- Inject Keyframes and Apply Animation ---
        let style = document.getElementById(STYLE_ID + '-keyframes');
        if (style) style.remove();
        
        style = document.createElement('style');
        style.id = STYLE_ID + '-keyframes';
        style.textContent = keyframes;
        document.head.appendChild(style);

        // Apply the generated animation to the stack
        const stack = this.container.querySelector('.word-stack');
        if (stack) {
            stack.style.animationName = `wordSlide-${N}`;
            stack.style.animationDuration = `${T}s`;
        }
    }
}
