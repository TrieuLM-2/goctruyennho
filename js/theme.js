/* ========================================
   THEME MANAGEMENT
   Handle theme switching and persistence
   ======================================== */

class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'light';
        this.init();
    }

    /**
     * Initialize theme system
     */
    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    /**
     * Get stored theme from localStorage
     * @returns {string|null} Stored theme
     */
    getStoredTheme() {
        try {
            return localStorage.getItem('theme');
        } catch (e) {
            console.warn('localStorage not available:', e);
            return null;
        }
    }

    /**
     * Save theme to localStorage
     * @param {string} theme - Theme name
     */
    saveTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('Could not save theme:', e);
        }
    }

    /**
     * Apply theme to document
     * @param {string} theme - Theme name (light, dark, sepia)
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.saveTheme(theme);
        this.updateThemeButtons();
    }

    /**
     * Toggle between themes
     * @param {string} theme - Theme to switch to
     */
    setTheme(theme) {
        if (['light', 'dark', 'sepia'].includes(theme)) {
            this.applyTheme(theme);
        }
    }

    /**
     * Get current theme
     * @returns {string} Current theme
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Update theme button states
     */
    updateThemeButtons() {
        const buttons = document.querySelectorAll('[data-theme-btn]');
        buttons.forEach(btn => {
            const btnTheme = btn.getAttribute('data-theme-btn');
            if (btnTheme === this.currentTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Setup event listeners for theme buttons
     */
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const themeBtn = e.target.closest('[data-theme-btn]');
            if (themeBtn) {
                const theme = themeBtn.getAttribute('data-theme-btn');
                this.setTheme(theme);
            }
        });
    }
}

// Initialize theme manager when DOM is ready
let themeManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        themeManager = new ThemeManager();
    });
} else {
    themeManager = new ThemeManager();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
