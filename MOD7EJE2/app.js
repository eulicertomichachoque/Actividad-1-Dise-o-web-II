// =====================================
// THEME MANAGER - Sistema Modular de Temas
// =====================================
const ThemeManager = (() => {
    'use strict';
    
    // Configuración
    const CONFIG = {
        themeKey: 'theme-preference',
        configKey: 'theme-config',
        defaultTheme: 'light',
        themes: ['light', 'dark', 'blue', 'purple', 'emerald'],
        transitionDuration: 300,
        systemPreferenceKey: 'prefers-color-scheme',
        localStorageFallback: true,
        enableAnimations: true,
        debug: false
    };
    
    // Estado del tema
    const state = {
        currentTheme: CONFIG.defaultTheme,
        previousTheme: null,
        systemPreference: null,
        isTransitioning: false,
        config: {
            enableAnimations: true,
            saturation: 100,
            contrast: 100,
            brightness: 100
        }
    };
    
    // Variables CSS personalizables por tema
    const themeVariables = {
        light: {
            '--bg-body': '#f9fafb',
            '--bg-card': '#ffffff',
            '--text-primary': '#111827',
            '--text-secondary': '#6b7280',
            '--primary-color': '#3b82f6',
            '--secondary-color': '#8b5cf6'
        },
        dark: {
            '--bg-body': '#0f172a',
            '--bg-card': '#1e293b',
            '--text-primary': '#f1f5f9',
            '--text-secondary': '#cbd5e1',
            '--primary-color': '#60a5fa',
            '--secondary-color': '#a78bfa'
        },
        blue: {
            '--bg-body': 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
            '--bg-card': 'rgba(255, 255, 255, 0.1)',
            '--text-primary': '#e0f2fe',
            '--text-secondary': '#bae6fd',
            '--primary-color': '#38bdf8',
            '--secondary-color': '#818cf8'
        },
        purple: {
            '--bg-body': 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
            '--bg-card': 'rgba(255, 255, 255, 0.1)',
            '--text-primary': '#f5f3ff',
            '--text-secondary': '#ddd6fe',
            '--primary-color': '#c4b5fd',
            '--secondary-color': '#f0abfc'
        },
        emerald: {
            '--bg-body': 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
            '--bg-card': 'rgba(255, 255, 255, 0.1)',
            '--text-primary': '#d1fae5',
            '--text-secondary': '#a7f3d0',
            '--primary-color': '#34d399',
            '--secondary-color': '#5eead4'
        }
    };
    
    // =====================================
    // UTILIDADES
    // =====================================
    const Utils = {
        log(message, type = 'info') {
            if (!CONFIG.debug) return;
            const styles = {
                info: 'color: #3b82f6; font-weight: bold',
                success: 'color: #10b981; font-weight: bold',
                warning: 'color: #f59e0b; font-weight: bold',
                error: 'color: #ef4444; font-weight: bold'
            };
            console.log(`%c[ThemeManager] ${message}`, styles[type]);
        },
        
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },
        
        supportsLocalStorage() {
            try {
                const testKey = '__test__';
                localStorage.setItem(testKey, testKey);
                localStorage.removeItem(testKey);
                return true;
            } catch (e) {
                Utils.log('LocalStorage no disponible', 'warning');
                return false;
            }
        },
        
        isColorSchemeSupported() {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all';
        },
        
        applyCSSTransition() {
            if (!state.config.enableAnimations) return;
            
            const style = document.createElement('style');
            style.id = 'theme-transition-style';
            style.textContent = `
                * {
                    transition-duration: ${CONFIG.transitionDuration}ms !important;
                    transition-property: background-color, border-color, color, fill, stroke !important;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
            `;
            
            document.head.appendChild(style);
            
            setTimeout(() => {
                if (style.parentNode) {
                    style.remove();
                }
            }, CONFIG.transitionDuration + 100);
        }
    };
    
    // =====================================
    // DETECTOR DE PREFERENCIA DEL SISTEMA
    // =====================================
    const SystemDetector = {
        init() {
            if (!Utils.isColorSchemeSupported()) {
                Utils.log('Prefers-color-scheme no soportado', 'warning');
                return;
            }
            
            const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            state.systemPreference = darkModeMediaQuery.matches ? 'dark' : 'light';
            
            // Escuchar cambios en la preferencia del sistema
            darkModeMediaQuery.addEventListener('change', (e) => {
                state.systemPreference = e.matches ? 'dark' : 'light';
                Utils.log(`Preferencia del sistema cambiada a: ${state.systemPreference}`, 'info');
                
                // Si no hay preferencia guardada, seguir al sistema
                if (!StorageManager.hasThemePreference()) {
                    this.applySystemPreference();
                }
            });
            
            Utils.log(`Preferencia del sistema detectada: ${state.systemPreference}`, 'success');
        },
        
        applySystemPreference() {
            if (state.systemPreference && state.systemPreference !== state.currentTheme) {
                ThemeSwitcher.switchTheme(state.systemPreference, { fromSystem: true });
            }
        },
        
        getSystemPreference() {
            return state.systemPreference;
        }
    };
    
    // =====================================
    // GESTOR DE ALMACENAMIENTO
    // =====================================
    const StorageManager = {
        init() {
            if (!Utils.supportsLocalStorage()) {
                Utils.log('Usando fallback sin localStorage', 'warning');
                return;
            }
            
            this.loadTheme();
            this.loadConfig();
        },
        
        saveTheme(theme) {
            if (!Utils.supportsLocalStorage()) return;
            
            try {
                localStorage.setItem(CONFIG.themeKey, theme);
                Utils.log(`Tema guardado: ${theme}`, 'success');
            } catch (e) {
                Utils.log(`Error guardando tema: ${e.message}`, 'error');
            }
        },
        
        loadTheme() {
            if (!Utils.supportsLocalStorage()) return null;
            
            try {
                const savedTheme = localStorage.getItem(CONFIG.themeKey);
                if (savedTheme && CONFIG.themes.includes(savedTheme)) {
                    state.currentTheme = savedTheme;
                    Utils.log(`Tema cargado: ${savedTheme}`, 'success');
                    return savedTheme;
                }
            } catch (e) {
                Utils.log(`Error cargando tema: ${e.message}`, 'error');
            }
            
            return null;
        },
        
        saveConfig(config) {
            if (!Utils.supportsLocalStorage()) return;
            
            try {
                localStorage.setItem(CONFIG.configKey, JSON.stringify(config));
                Utils.log('Configuración guardada', 'success');
            } catch (e) {
                Utils.log(`Error guardando configuración: ${e.message}`, 'error');
            }
        },
        
        loadConfig() {
            if (!Utils.supportsLocalStorage()) return;
            
            try {
                const savedConfig = localStorage.getItem(CONFIG.configKey);
                if (savedConfig) {
                    state.config = { ...state.config, ...JSON.parse(savedConfig) };
                    Utils.log('Configuración cargada', 'success');
                }
            } catch (e) {
                Utils.log(`Error cargando configuración: ${e.message}`, 'error');
            }
        },
        
        hasThemePreference() {
            if (!Utils.supportsLocalStorage()) return false;
            return !!localStorage.getItem(CONFIG.themeKey);
        },
        
        clear() {
            if (!Utils.supportsLocalStorage()) return;
            
            try {
                localStorage.removeItem(CONFIG.themeKey);
                localStorage.removeItem(CONFIG.configKey);
                Utils.log('Almacenamiento limpiado', 'info');
            } catch (e) {
                Utils.log(`Error limpiando almacenamiento: ${e.message}`, 'error');
            }
        }
    };
    
    // =====================================
    // NUEVA FUNCIONALIDAD: SWITCHER AVANZADO
    // =====================================
    const ThemeSwitcher = {
        init() {
            this.setupThemeControls();
            this.setupKeyboardShortcuts();
            this.setupThemeCycling();
        },
        
        setupThemeControls() {
            // Selector principal de tema
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.checked = state.currentTheme === 'dark';
                themeToggle.addEventListener('change', (e) => {
                    const newTheme = e.target.checked ? 'dark' : 'light';
                    this.switchTheme(newTheme, { fromToggle: true });
                });
            }
            
            // Presets de tema
            document.querySelectorAll('.theme-preset-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const theme = btn.dataset.theme;
                    if (theme) {
                        this.switchTheme(theme, { fromPreset: true });
                        this.highlightPreset(theme);
                    }
                });
                
                // Marcar preset activo
                if (btn.dataset.theme === state.currentTheme) {
                    btn.classList.add('active');
                }
            });
            
            // Selector de tema personalizado
            const themeSelect = document.createElement('select');
            themeSelect.className = 'theme-select';
            themeSelect.innerHTML = CONFIG.themes.map(theme => 
                `<option value="${theme}">${this.capitalize(theme)}</option>`
            ).join('');
            themeSelect.value = state.currentTheme;
            themeSelect.addEventListener('change', (e) => {
                this.switchTheme(e.target.value, { fromSelect: true });
            });
            
            // Añadir al DOM si existe un contenedor
            const controlsContainer = document.querySelector('.theme-controls');
            if (controlsContainer) {
                controlsContainer.appendChild(themeSelect);
            }
        },
        
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + T: Cambiar tema
                if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                    e.preventDefault();
                    this.cycleTheme();
                }
                
                // Ctrl/Cmd + Shift + T: Alternar animaciones
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 't') {
                    e.preventDefault();
                    this.toggleAnimations();
                }
                
                // Ctrl/Cmd + 1-5: Cambiar a tema específico
                if ((e.ctrlKey || e.metaKey) && /^[1-5]$/.test(e.key)) {
                    e.preventDefault();
                    const index = parseInt(e.key) - 1;
                    if (CONFIG.themes[index]) {
                        this.switchTheme(CONFIG.themes[index], { fromShortcut: true });
                    }
                }
            });
        },
        
        setupThemeCycling() {
            // Botón de ciclo de temas
            const cycleBtn = document.createElement('button');
            cycleBtn.className = 'theme-cycle-btn';
            cycleBtn.innerHTML = '🎨';
            cycleBtn.title = 'Ciclar temas (Ctrl+T)';
            cycleBtn.addEventListener('click', () => this.cycleTheme());
            
            const controlsContainer = document.querySelector('.theme-controls');
            if (controlsContainer) {
                controlsContainer.appendChild(cycleBtn);
            }
        },
        
        switchTheme(newTheme, options = {}) {
            if (state.isTransitioning || !CONFIG.themes.includes(newTheme)) {
                return;
            }
            
            state.isTransitioning = true;
            state.previousTheme = state.currentTheme;
            state.currentTheme = newTheme;
            
            Utils.log(`Cambiando tema de ${state.previousTheme} a ${newTheme}`, 'info');
            
            // Aplicar transición CSS
            if (state.config.enableAnimations) {
                Utils.applyCSSTransition();
            }
            
            // Aplicar variables CSS del tema
            this.applyThemeVariables(newTheme);
            
            // Actualizar atributo data-theme
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Actualizar controles UI
            this.updateUIControls(newTheme);
            
            // Guardar preferencia
            StorageManager.saveTheme(newTheme);
            
            // Disparar evento personalizado
            this.dispatchThemeChangeEvent(newTheme, state.previousTheme, options);
            
            // NUEVA FUNCIONALIDAD: Aplicar efectos especiales
            if (options.fromPreset || options.fromShortcut) {
                this.applyThemeTransitionEffect(newTheme);
            }
            
            // Resetear estado de transición
            setTimeout(() => {
                state.isTransitioning = false;
            }, CONFIG.transitionDuration);
            
            return newTheme;
        },
        
        applyThemeVariables(theme) {
            const root = document.documentElement;
            const variables = themeVariables[theme];
            
            if (!variables) {
                Utils.log(`Variables CSS no definidas para tema: ${theme}`, 'warning');
                return;
            }
            
            Object.entries(variables).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
            
            // Aplicar ajustes de configuración
            this.applyThemeConfig();
        },
        
        applyThemeConfig() {
            const root = document.documentElement;
            
            // Ajustar saturación
            root.style.filter = `
                saturate(${state.config.saturation}%)
                contrast(${state.config.contrast}%)
                brightness(${state.config.brightness}%)
            `;
            
            // Controlar animaciones
            root.style.animationPlayState = state.config.enableAnimations ? 'running' : 'paused';
        },
        
        applyThemeTransitionEffect(theme) {
            // Crear overlay de transición
            const overlay = document.createElement('div');
            overlay.className = 'theme-transition-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: ${this.getThemeColor(theme, 'primary')};
                opacity: 0;
                z-index: 9999;
                pointer-events: none;
                animation: themeTransition 500ms ease;
            `;
            
            // Añadir keyframes dinámicamente
            const style = document.createElement('style');
            style.textContent = `
                @keyframes themeTransition {
                    0% { opacity: 0; }
                    50% { opacity: 0.1; }
                    100% { opacity: 0; }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(overlay);
            
            // Limpiar después de la animación
            setTimeout(() => {
                if (overlay.parentNode) overlay.remove();
                if (style.parentNode) style.remove();
            }, 500);
        },
        
        getThemeColor(theme, type) {
            const colors = {
                light: { primary: '#3b82f6', secondary: '#8b5cf6' },
                dark: { primary: '#60a5fa', secondary: '#a78bfa' },
                blue: { primary: '#38bdf8', secondary: '#818cf8' },
                purple: { primary: '#c4b5fd', secondary: '#f0abfc' },
                emerald: { primary: '#34d399', secondary: '#5eead4' }
            };
            
            return colors[theme]?.[type] || colors.light.primary;
        },
        
        updateUIControls(theme) {
            // Actualizar toggle switch
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.checked = theme === 'dark';
            }
            
            // Actualizar presets activos
            document.querySelectorAll('.theme-preset-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === theme);
            });
            
            // Actualizar selector
            const themeSelect = document.querySelector('.theme-select');
            if (themeSelect) {
                themeSelect.value = theme;
            }
            
            // Actualizar etiqueta
            const themeLabel = document.querySelector('.theme-label');
            if (themeLabel) {
                themeLabel.textContent = this.capitalize(theme);
            }
        },
        
        highlightPreset(theme) {
            document.querySelectorAll('.theme-preset-btn').forEach(btn => {
                if (btn.dataset.theme === theme) {
                    btn.animate([
                        { transform: 'scale(1)', opacity: 1 },
                        { transform: 'scale(1.2)', opacity: 0.8 },
                        { transform: 'scale(1)', opacity: 1 }
                    ], {
                        duration: 300,
                        easing: 'ease-out'
                    });
                }
            });
        },
        
        cycleTheme() {
            const currentIndex = CONFIG.themes.indexOf(state.currentTheme);
            const nextIndex = (currentIndex + 1) % CONFIG.themes.length;
            const nextTheme = CONFIG.themes[nextIndex];
            
            this.switchTheme(nextTheme, { fromCycle: true });
            
            // Mostrar notificación
            this.showNotification(`Tema cambiado a: ${this.capitalize(nextTheme)}`);
        },
        
        toggleAnimations() {
            state.config.enableAnimations = !state.config.enableAnimations;
            StorageManager.saveConfig(state.config);
            
            document.documentElement.style.animationPlayState = 
                state.config.enableAnimations ? 'running' : 'paused';
            
            this.showNotification(
                state.config.enableAnimations ? 
                'Animaciones activadas' : 
                'Animaciones desactivadas'
            );
            
            Utils.log(`Animaciones ${state.config.enableAnimations ? 'activadas' : 'desactivadas'}`, 'info');
        },
        
        showNotification(message) {
            // Eliminar notificación existente
            const existing = document.querySelector('.theme-notification');
            if (existing) existing.remove();
            
            // Crear nueva notificación
            const notification = document.createElement('div');
            notification.className = 'theme-notification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--bg-card);
                color: var(--text-primary);
                padding: 12px 24px;
                border-radius: 8px;
                box-shadow: var(--shadow-lg);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                border: 1px solid var(--border-color);
                backdrop-filter: blur(10px);
            `;
            
            document.body.appendChild(notification);
            
            // Auto-remover después de 2 segundos
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        },
        
        dispatchThemeChangeEvent(newTheme, oldTheme, options) {
            const event = new CustomEvent('themechange', {
                detail: {
                    theme: newTheme,
                    previousTheme: oldTheme,
                    timestamp: Date.now(),
                    source: this.getSourceFromOptions(options),
                    config: { ...state.config }
                }
            });
            
            document.documentElement.dispatchEvent(event);
            Utils.log(`Evento themechange disparado: ${oldTheme} → ${newTheme}`, 'info');
        },
        
        getSourceFromOptions(options) {
            if (options.fromSystem) return 'system';
            if (options.fromToggle) return 'toggle';
            if (options.fromPreset) return 'preset';
            if (options.fromSelect) return 'select';
            if (options.fromShortcut) return 'shortcut';
            if (options.fromCycle) return 'cycle';
            return 'unknown';
        },
        
        capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    };
    
    // =====================================
    // NUEVA FUNCIONALIDAD: SCREENSHOT THEME
    // =====================================
    const ThemeScreenshot = {
        async capture() {
            try {
                Utils.log('Capturando screenshot del tema...', 'info');
                
                // Crear overlay de captura
                const overlay = this.createCaptureOverlay();
                document.body.appendChild(overlay);
                
                // Esperar para la transición
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Usar html2canvas para capturar
                if (typeof html2canvas === 'function') {
                    const canvas = await html2canvas(document.documentElement, {
                        backgroundColor: null,
                        scale: 1,
                        useCORS: true,
                        logging: CONFIG.debug
                    });
                    
                    // Convertir a data URL
                    const dataUrl = canvas.toDataURL('image/png');
                    
                    // Limpiar
                    overlay.remove();
                    
                    return dataUrl;
                } else {
                    throw new Error('html2canvas no está disponible');
                }
            } catch (error) {
                Utils.log(`Error capturando screenshot: ${error.message}`, 'error');
                return null;
            }
        },
        
        createCaptureOverlay() {
            const overlay = document.createElement('div');
            overlay.className = 'theme-capture-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                z-index: 9998;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
            `;
            overlay.textContent = 'Capturando tema...';
            
            return overlay;
        },
        
        download(dataUrl, filename = `theme-${state.currentTheme}-${Date.now()}.png`) {
            if (!dataUrl) return;
            
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            Utils.log(`Screenshot descargado: ${filename}`, 'success');
        }
    };
    
    // =====================================
    // NUEVA FUNCIONALIDAD: THEME ANALYZER
    // =====================================
    const ThemeAnalyzer = {
        analyze() {
            const root = document.documentElement;
            const computedStyle = getComputedStyle(root);
            
            const analysis = {
                theme: state.currentTheme,
                timestamp: Date.now(),
                colors: {},
                accessibility: {},
                performance: {}
            };
            
            // Analizar colores
            analysis.colors = {
                background: computedStyle.getPropertyValue('--bg-body').trim(),
                textPrimary: computedStyle.getPropertyValue('--text-primary').trim(),
                textSecondary: computedStyle.getPropertyValue('--text-secondary').trim(),
                primary: computedStyle.getPropertyValue('--primary-color').trim(),
                secondary: computedStyle.getPropertyValue('--secondary-color').trim()
            };
            
            // Analizar accesibilidad (contraste)
            analysis.accessibility = this.calculateContrast(
                analysis.colors.background,
                analysis.colors.textPrimary
            );
            
            // Analizar rendimiento
            analysis.performance = {
                transitions: state.config.enableAnimations ? 'enabled' : 'disabled',
                filters: state.config.saturation !== 100 || 
                        state.config.contrast !== 100 || 
                        state.config.brightness !== 100
            };
            
            return analysis;
        },
        
        calculateContrast(background, foreground) {
            // Implementación simplificada de cálculo de contraste
            // En producción, usar una librería como color-contrast
            return {
                ratio: 4.5, // Placeholder
                score: 'AA',
                warning: background.includes('transparent') ? 
                    'Fondo con transparencia puede afectar contraste' : null
            };
        },
        
        generateReport() {
            const analysis = this.analyze();
            return JSON.stringify(analysis, null, 2);
        }
    };
    
    // =====================================
    // INICIALIZACIÓN Y API PÚBLICA
    // =====================================
    const init = () => {
        try {
            Utils.log('Inicializando Theme Manager...', 'info');
            
            // Inicializar módulos
            StorageManager.init();
            SystemDetector.init();
            ThemeSwitcher.init();
            
            // Aplicar tema inicial
            const initialTheme = StorageManager.loadTheme() || CONFIG.defaultTheme;
            ThemeSwitcher.switchTheme(initialTheme, { fromInit: true });
            
            // Escuchar eventos del sistema
            if (!StorageManager.hasThemePreference()) {
                SystemDetector.applySystemPreference();
            }
            
            // Disparar evento de inicialización
            document.dispatchEvent(new CustomEvent('thememanager:ready', {
                detail: {
                    version: '2.0.0',
                    themes: CONFIG.themes,
                    currentTheme: state.currentTheme,
                    config: state.config
                }
            }));
            
            Utils.log('Theme Manager inicializado correctamente', 'success');
            
        } catch (error) {
            Utils.log(`Error inicializando Theme Manager: ${error.message}`, 'error');
            this.applyFallback();
        }
    };
    
    const applyFallback = () => {
        // Fallback básico sin funcionalidades avanzadas
        const savedTheme = localStorage.getItem('theme');
        const theme = savedTheme || CONFIG.defaultTheme;
        document.documentElement.setAttribute('data-theme', theme);
        state.currentTheme = theme;
        
        Utils.log('Usando fallback básico', 'warning');
    };
    
    // API pública
    return {
        init,
        
        // Getters
        getCurrentTheme: () => state.currentTheme,
        getPreviousTheme: () => state.previousTheme,
        getAvailableThemes: () => [...CONFIG.themes],
        getConfig: () => ({ ...state.config }),
        getSystemPreference: SystemDetector.getSystemPreference,
        
        // Setters
        setTheme: (theme) => ThemeSwitcher.switchTheme(theme),
        setConfig: (config) => {
            state.config = { ...state.config, ...config };
            StorageManager.saveConfig(state.config);
            ThemeSwitcher.applyThemeConfig();
            return state.config;
        },
        
        // Acciones
        cycleTheme: () => ThemeSwitcher.cycleTheme(),
        toggleAnimations: () => ThemeSwitcher.toggleAnimations(),
        resetConfig: () => {
            state.config = {
                enableAnimations: true,
                saturation: 100,
                contrast: 100,
                brightness: 100
            };
            StorageManager.saveConfig(state.config);
            ThemeSwitcher.applyThemeConfig();
        },
        
        // Nuevas funcionalidades
        captureScreenshot: async () => await ThemeScreenshot.capture(),
        downloadScreenshot: async (filename) => {
            const dataUrl = await ThemeScreenshot.capture();
            if (dataUrl) ThemeScreenshot.download(dataUrl, filename);
        },
        analyzeTheme: () => ThemeAnalyzer.analyze(),
        generateReport: () => ThemeAnalyzer.generateReport(),
        
        // Utilidades
        clearStorage: () => StorageManager.clear(),
        enableDebug: () => CONFIG.debug = true,
        disableDebug: () => CONFIG.debug = false
    };
})();

// =====================================
// INICIALIZACIÓN AL CARGAR EL DOCUMENTO
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar con retardo para no bloquear render
    setTimeout(() => {
        ThemeManager.init();
    }, 100);
    
    // Añadir estilos para componentes dinámicos
    const styles = document.createElement('style');
    styles.textContent = `
        .theme-select {
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            background: var(--bg-card);
            color: var(--text-primary);
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .theme-select:hover {
            border-color: var(--primary-color);
        }
        
        .theme-select:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
        }
        
        .theme-cycle-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: var(--bg-card);
            color: var(--text-primary);
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            border: 1px solid var(--border-color);
        }
        
        .theme-cycle-btn:hover {
            background: var(--primary-color);
            color: var(--text-inverted);
            transform: rotate(15deg);
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(styles);
});

// =====================================
// HANDLER DE ERRORES GLOBAL
// =====================================
window.addEventListener('error', (event) => {
    console.error('[ThemeManager] Error global:', event.error);
});

// =====================================
// COMPATIBILIDAD CON CÓDIGO ANTERIOR
// =====================================
// Mantener compatibilidad con el código original
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
if (toggleSwitch) {
    toggleSwitch.addEventListener('change', function(e) {
        const theme = e.target.checked ? 'dark' : 'light';
        ThemeManager.setTheme(theme);
    });
}

// =====================================
// EXPORT PARA USO COMO MÓDULO
// =====================================
// Descomentar si usas módulos ES6:
// export { ThemeManager };
