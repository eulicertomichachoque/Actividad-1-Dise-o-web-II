// ===============================================
// MÓDULO AVANZADO DE GESTIÓN DE TEMAS
// ===============================================

const ThemeManager = (() => {
    // ===== CONFIGURACIÓN Y CONSTANTES =====
    const CONFIG = {
        STORAGE_KEY: 'theme-preferences-v2',
        ANIMATION_DURATION: 500,
        DEFAULT_THEME: 'auto',
        THEMES: {
            LIGHT: 'light',
            DARK: 'dark',
            AUTO: 'auto'
        },
        KEYBINDINGS: {
            TOGGLE: ['d', 'D', 't', 'T'],
            NEXT: ['ArrowRight', 'ArrowDown'],
            PREV: ['ArrowLeft', 'ArrowUp'],
            LIGHT: ['l', 'L'],
            DARK: ['k', 'K'],
            AUTO: ['a', 'A']
        }
    };

    // ===== ESTADO GLOBAL =====
    const state = {
        currentTheme: CONFIG.DEFAULT_THEME,
        systemPreference: null,
        themeChanges: 0,
        lastChange: null,
        isAnimating: false,
        subscriptions: []
    };

    // ===== REFERENCIAS AL DOM =====
    const DOM = {
        html: document.documentElement,
        body: document.body,
        themeToggle: null,
        themeSelector: null,
        themeOptions: null,
        notifications: null,
        stats: {
            currentTheme: null,
            themeChanges: null,
            themePreference: null,
            compatibility: null
        },
        colors: {
            primary: null,
            bg: null,
            text: null,
            accent: null
        }
    };

    // ===== INICIALIZACIÓN =====
    function init() {
        try {
            loadDOMReferences();
            loadPreferences();
            detectSystemPreference();
            setupEventListeners();
            applyTheme();
            updateUI();
            setupNotifications();
            
            console.log('🎨 Theme Manager iniciado correctamente');
            console.log('🎯 Temas soportados:', CONFIG.THEMES);
            
            // Notificación de bienvenida
            showNotification('Theme Manager listo', 'info');
            
        } catch (error) {
            console.error('❌ Error al inicializar Theme Manager:', error);
            showErrorUI();
        }
    }

    // ===== MANEJO DEL DOM =====
    function loadDOMReferences() {
        DOM.themeToggle = document.getElementById('themeToggle');
        DOM.themeSelector = document.querySelector('.theme-selector');
        DOM.themeOptions = document.querySelectorAll('.theme-option');
        DOM.notifications = document.querySelector('.notifications');
        
        // Referencias de estadísticas
        DOM.stats.currentTheme = document.getElementById('current-theme');
        DOM.stats.themeChanges = document.getElementById('theme-changes');
        DOM.stats.themePreference = document.getElementById('theme-preference');
        DOM.stats.compatibility = document.getElementById('theme-compatibility');
        
        // Referencias de colores
        DOM.colors.primary = document.getElementById('primary-color-value');
        DOM.colors.bg = document.getElementById('bg-color-value');
        DOM.colors.text = document.getElementById('text-color-value');
        DOM.colors.accent = document.getElementById('accent-color-value');
        
        if (!DOM.html || !DOM.body) {
            throw new Error('Elementos del DOM no encontrados');
        }
    }

    function showErrorUI() {
        if (DOM.notifications) {
            createNotificationElement('Error al cargar Theme Manager', 'danger');
        }
    }

    // ===== MANEJO DE PREFERENCIAS =====
    function loadPreferences() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (saved) {
                const preferences = JSON.parse(saved);
                state.currentTheme = preferences.currentTheme || CONFIG.DEFAULT_THEME;
                state.themeChanges = preferences.themeChanges || 0;
                state.lastChange = preferences.lastChange;
                console.log('📂 Preferencias cargadas:', preferences);
            }
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar las preferencias:', error);
            resetPreferences();
        }
    }

    function savePreferences() {
        const preferences = {
            currentTheme: state.currentTheme,
            themeChanges: state.themeChanges,
            lastChange: new Date().toISOString(),
            version: '2.0'
        };
        
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(preferences));
        } catch (error) {
            console.warn('⚠️ No se pudieron guardar las preferencias:', error);
        }
    }

    function resetPreferences() {
        state.currentTheme = CONFIG.DEFAULT_THEME;
        state.themeChanges = 0;
        state.lastChange = null;
        savePreferences();
        applyTheme();
        updateUI();
        
        showNotification('Preferencias reiniciadas', 'info');
    }

    // ===== DETECCIÓN DEL SISTEMA =====
    function detectSystemPreference() {
        if (window.matchMedia) {
            const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            state.systemPreference = darkModeMediaQuery.matches ? 
                CONFIG.THEMES.DARK : CONFIG.THEMES.LIGHT;
            
            // Escuchar cambios en la preferencia del sistema
            darkModeMediaQuery.addEventListener('change', handleSystemThemeChange);
            
            console.log('🖥️ Preferencia del sistema:', state.systemPreference);
        }
    }

    function handleSystemThemeChange(event) {
        state.systemPreference = event.matches ? 
            CONFIG.THEMES.DARK : CONFIG.THEMES.LIGHT;
        
        // Si el tema actual es AUTO, aplicar el cambio
        if (state.currentTheme === CONFIG.THEMES.AUTO) {
            applyTheme();
            updateUI();
            showNotification('Tema del sistema actualizado', 'info');
        }
    }

    // ===== GESTIÓN DE TEMAS =====
    function setTheme(theme) {
        if (state.isAnimating) return;
        if (!Object.values(CONFIG.THEMES).includes(theme)) {
            console.warn(`⚠️ Tema no válido: ${theme}`);
            return;
        }
        
        const oldTheme = state.currentTheme;
        state.currentTheme = theme;
        state.themeChanges++;
        state.lastChange = new Date().toISOString();
        
        // Animación de transición
        playThemeTransition(oldTheme, theme);
        
        // Aplicar tema y guardar preferencias
        applyTheme();
        savePreferences();
        updateUI();
        
        // Notificar a suscriptores
        notifySubscribers(oldTheme, theme);
        
        // Feedback al usuario
        const themeNames = {
            [CONFIG.THEMES.LIGHT]: 'Claro ☀️',
            [CONFIG.THEMES.DARK]: 'Oscuro 🌙',
            [CONFIG.THEMES.AUTO]: `Auto (${state.systemPreference === CONFIG.THEMES.DARK ? '🌙' : '☀️'})`
        };
        
        showNotification(`Tema cambiado a: ${themeNames[theme]}`, 'success');
        console.log(`🔄 Tema cambiado de ${oldTheme} a ${theme}`);
    }

    function toggleTheme() {
        if (state.currentTheme === CONFIG.THEMES.DARK) {
            setTheme(CONFIG.THEMES.LIGHT);
        } else if (state.currentTheme === CONFIG.THEMES.LIGHT) {
            setTheme(CONFIG.THEMES.AUTO);
        } else {
            setTheme(CONFIG.THEMES.DARK);
        }
    }

    function applyTheme() {
        let themeToApply = state.currentTheme;
        
        // Si es AUTO, usar la preferencia del sistema
        if (themeToApply === CONFIG.THEMES.AUTO) {
            themeToApply = state.systemPreference || CONFIG.THEMES.LIGHT;
        }
        
        // Aplicar tema al elemento HTML
        DOM.html.setAttribute('data-theme', themeToApply);
        
        // Actualizar meta theme-color para PWA
        updateThemeColorMeta(themeToApply);
        
        // Actualizar botones de selección
        updateThemeButtons();
    }

    function updateThemeColorMeta(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const colors = {
            [CONFIG.THEMES.LIGHT]: getComputedStyle(DOM.html)
                .getPropertyValue('--color-primary').trim(),
            [CONFIG.THEMES.DARK]: getComputedStyle(DOM.html)
                .getPropertyValue('--color-primary-dark').trim()
        };
        
        metaThemeColor.content = colors[theme] || colors[CONFIG.THEMES.LIGHT];
    }

    // ===== ANIMACIONES Y TRANSICIONES =====
    function playThemeTransition(oldTheme, newTheme) {
        state.isAnimating = true;
        
        // Agregar clase de animación
        DOM.body.classList.add('theme-transitioning');
        
        // Efecto de partículas
        createThemeParticles(oldTheme, newTheme);
        
        // Sonido de transición
        playTransitionSound();
        
        // Remover clase después de la animación
        setTimeout(() => {
            DOM.body.classList.remove('theme-transitioning');
            state.isAnimating = false;
        }, CONFIG.ANIMATION_DURATION);
    }

    function createThemeParticles(oldTheme, newTheme) {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'theme-particles';
        particlesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: ${CONFIG.zIndex?.NOTIFICATION || 9999};
        `;
        
        document.body.appendChild(particlesContainer);
        
        // Crear partículas
        const particleCount = 30;
        const colors = {
            [CONFIG.THEMES.LIGHT]: getComputedStyle(DOM.html)
                .getPropertyValue('--color-primary').trim(),
            [CONFIG.THEMES.DARK]: getComputedStyle(DOM.html)
                .getPropertyValue('--color-secondary').trim()
        };
        
        const fromColor = colors[oldTheme] || '#667eea';
        const toColor = colors[newTheme] || '#764ba2';
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const size = 5 + Math.random() * 10;
            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight;
            
            particle.style.cssText = `
                position: fixed;
                left: ${startX}px;
                top: ${startY}px;
                width: ${size}px;
                height: ${size}px;
                background: ${fromColor};
                border-radius: 50%;
                opacity: 0.8;
                pointer-events: none;
                transform: scale(0);
            `;
            
            particlesContainer.appendChild(particle);
            
            // Animar partícula
            particle.animate([
                { 
                    transform: 'scale(0)',
                    background: fromColor,
                    opacity: 0.8
                },
                { 
                    transform: 'scale(1)',
                    background: toColor,
                    opacity: 0.4
                },
                { 
                    transform: 'scale(0)',
                    background: toColor,
                    opacity: 0
                }
            ], {
                duration: CONFIG.ANIMATION_DURATION,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                delay: i * 20
            }).onfinish = () => particle.remove();
        }
        
        // Limpiar contenedor después de la animación
        setTimeout(() => {
            particlesContainer.remove();
        }, CONFIG.ANIMATION_DURATION + particleCount * 20);
    }

    function playTransitionSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Sonido más agudo para light, más grave para dark
            const baseFreq = state.currentTheme === CONFIG.THEMES.DARK ? 400 : 800;
            oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.debug('🔇 Audio no disponible');
        }
    }

    // ===== INTERFAZ DE USUARIO =====
    function updateUI() {
        updateStatsDisplay();
        updateColorDisplay();
        updateThemeButtons();
        updateCodeTabs();
    }

    function updateStatsDisplay() {
        if (DOM.stats.currentTheme) {
            const themeNames = {
                [CONFIG.THEMES.LIGHT]: 'Claro ☀️',
                [CONFIG.THEMES.DARK]: 'Oscuro 🌙',
                [CONFIG.THEMES.AUTO]: `Auto (${state.systemPreference === CONFIG.THEMES.DARK ? '🌙' : '☀️'})`
            };
            DOM.stats.currentTheme.textContent = themeNames[state.currentTheme] || 'Claro';
        }
        
        if (DOM.stats.themeChanges) {
            DOM.stats.themeChanges.textContent = state.themeChanges;
        }
        
        if (DOM.stats.themePreference) {
            const preference = state.systemPreference === CONFIG.THEMES.DARK ? 
                'Oscuro 🌙' : 'Claro ☀️';
            DOM.stats.themePreference.textContent = state.currentTheme === CONFIG.THEMES.AUTO ? 
                `Auto (${preference})` : preference;
        }
        
        if (DOM.stats.compatibility) {
            DOM.stats.compatibility.textContent = '100%';
        }
    }

    function updateColorDisplay() {
        const computedStyle = getComputedStyle(DOM.html);
        
        if (DOM.colors.primary) {
            DOM.colors.primary.textContent = computedStyle
                .getPropertyValue('--color-primary').trim();
        }
        
        if (DOM.colors.bg) {
            DOM.colors.bg.textContent = computedStyle
                .getPropertyValue('--color-bg').trim();
        }
        
        if (DOM.colors.text) {
            DOM.colors.text.textContent = computedStyle
                .getPropertyValue('--color-text').trim();
        }
        
        if (DOM.colors.accent) {
            DOM.colors.accent.textContent = computedStyle
                .getPropertyValue('--color-accent').trim() || '#10b981';
        }
    }

    function updateThemeButtons() {
        // Actualizar toggle clásico
        if (DOM.themeToggle) {
            const isDark = state.currentTheme === CONFIG.THEMES.DARK || 
                (state.currentTheme === CONFIG.THEMES.AUTO && 
                 state.systemPreference === CONFIG.THEMES.DARK);
            
            DOM.themeToggle.setAttribute('aria-pressed', isDark);
            
            // Animación del thumb
            const thumb = DOM.themeToggle.querySelector('.toggle-thumb');
            if (thumb) {
                thumb.style.transition = 'transform 0.3s ease';
                thumb.style.transform = isDark ? 'translateX(32px)' : 'translateX(0)';
            }
        }
        
        // Actualizar selector avanzado
        DOM.themeOptions?.forEach(option => {
            const theme = option.dataset.theme;
            const isActive = theme === state.currentTheme;
            
            option.setAttribute('aria-pressed', isActive);
            option.classList.toggle('active', isActive);
        });
    }

    function updateCodeTabs() {
        const codeTabs = document.querySelectorAll('.code-tab');
        const codeBlocks = document.querySelectorAll('.code-block');
        
        codeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                // Actualizar tabs activos
                codeTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                
                // Mostrar bloque correspondiente
                codeBlocks.forEach(block => {
                    block.hidden = block.dataset.tab !== tabName;
                });
            });
        });
    }

    // ===== NOTIFICACIONES =====
    function setupNotifications() {
        if (!DOM.notifications) {
            DOM.notifications = document.createElement('div');
            DOM.notifications.className = 'notifications';
            DOM.notifications.setAttribute('aria-live', 'polite');
            document.body.appendChild(DOM.notifications);
        }
    }

    function showNotification(message, type = 'info') {
        const notification = createNotificationElement(message, type);
        
        // Mostrar
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Ocultar y remover después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    function createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            danger: '❌'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        DOM.notifications.appendChild(notification);
        return notification;
    }

    // ===== MANEJO DE EVENTOS =====
    function setupEventListeners() {
        // Toggle clásico
        if (DOM.themeToggle) {
            DOM.themeToggle.addEventListener('click', () => {
                toggleTheme();
                animateButton(DOM.themeToggle);
            });
        }
        
        // Selector avanzado
        DOM.themeOptions?.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                setTheme(theme);
                animateButton(option);
            });
        });
        
        // Botones de acción
        document.getElementById('resetTheme')?.addEventListener('click', () => {
            resetPreferences();
            animateButton(this);
        });
        
        document.getElementById('copyTheme')?.addEventListener('click', () => {
            copyThemeConfig();
            animateButton(this);
        });
        
        // Teclado
        document.addEventListener('keydown', handleKeyboard);
        
        // Tabs de código
        updateCodeTabs();
    }

    function handleKeyboard(event) {
        // Ignorar si estamos en un campo de entrada
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const key = event.key;
        
        if (CONFIG.KEYBINDINGS.TOGGLE.includes(key)) {
            event.preventDefault();
            toggleTheme();
        }
        else if (CONFIG.KEYBINDINGS.LIGHT.includes(key)) {
            event.preventDefault();
            setTheme(CONFIG.THEMES.LIGHT);
        }
        else if (CONFIG.KEYBINDINGS.DARK.includes(key)) {
            event.preventDefault();
            setTheme(CONFIG.THEMES.DARK);
        }
        else if (CONFIG.KEYBINDINGS.AUTO.includes(key)) {
            event.preventDefault();
            setTheme(CONFIG.THEMES.AUTO);
        }
        else if (CONFIG.KEYBINDINGS.NEXT.includes(key)) {
            event.preventDefault();
            cycleThemes(1);
        }
        else if (CONFIG.KEYBINDINGS.PREV.includes(key)) {
            event.preventDefault();
            cycleThemes(-1);
        }
    }

    function cycleThemes(direction) {
        const themes = Object.values(CONFIG.THEMES);
        const currentIndex = themes.indexOf(state.currentTheme);
        const nextIndex = (currentIndex + direction + themes.length) % themes.length;
        setTheme(themes[nextIndex]);
    }

    function copyThemeConfig() {
        const config = {
            currentTheme: state.currentTheme,
            systemPreference: state.systemPreference,
            themeChanges: state.themeChanges,
            colors: {
                primary: getComputedStyle(DOM.html).getPropertyValue('--color-primary').trim(),
                bg: getComputedStyle(DOM.html).getPropertyValue('--color-bg').trim(),
                text: getComputedStyle(DOM.html).getPropertyValue('--color-text').trim()
            }
        };
        
        navigator.clipboard.writeText(JSON.stringify(config, null, 2))
            .then(() => {
                showNotification('Configuración copiada al portapapeles', 'success');
            })
            .catch(() => {
                showNotification('No se pudo copiar la configuración', 'danger');
            });
    }

    function animateButton(button) {
        if (!button) return;
        
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 200);
    }

    // ===== SUSCRIPCIONES Y EVENTOS =====
    function subscribe(callback) {
        state.subscriptions.push(callback);
        return () => {
            state.subscriptions = state.subscriptions.filter(cb => cb !== callback);
        };
    }

    function notifySubscribers(oldTheme, newTheme) {
        state.subscriptions.forEach(callback => {
            try {
                callback(oldTheme, newTheme);
            } catch (error) {
                console.error('Error en callback de tema:', error);
            }
        });
    }

    // ===== API PÚBLICA =====
    return {
        init,
        setTheme,
        toggleTheme,
        getCurrentTheme: () => state.currentTheme,
        getStats: () => ({
            currentTheme: state.currentTheme,
            themeChanges: state.themeChanges,
            systemPreference: state.systemPreference,
            lastChange: state.lastChange
        }),
        resetPreferences,
        subscribe,
        
        // Para testing/debugging
        _state: state,
        _config: CONFIG
    };
})();

// ===============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // Iniciar Theme Manager
    ThemeManager.init();
    
    // Agregar estilos CSS para transiciones
    const transitionStyles = document.createElement('style');
    transitionStyles.textContent = `
        .theme-transitioning * {
            transition-duration: 0.5s !important;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .theme-transitioning * {
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(transitionStyles);
    
    // Mensaje de bienvenida en consola
    console.log(`
        🌓 TEMA DINÁMICO v2.0
        ========================
        🎯 3 modos: Claro, Oscuro, Auto
        💾 Persistencia inteligente
        🎨 Transiciones suaves
        ⌨️  Atajos de teclado
        📊 Estadísticas en tiempo real
        🚀 Alto rendimiento
    `);
});

// ===============================================
// MANEJO DE ERRORES GLOBALES
// ===============================================

window.addEventListener('error', (event) => {
    console.error('❌ Error global en Theme Manager:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promesa rechazada no manejada:', event.reason);
});

// ===============================================
// SERVICEWORKER (OPCIONAL - PARA PWA)
// ===============================================

if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// ===============================================
// EXPORTACIÓN PARA DESARROLLO
// ===============================================

if (process.env.NODE_ENV === 'development') {
    window.ThemeManager = ThemeManager;
}

// ===============================================
// POLYFILLS (opcional, para navegadores antiguos)
// ===============================================

if (!window.matchMedia) {
    console.warn('⚠️ matchMedia no soportado, tema AUTO no disponible');
    
    // Polyfill básico
    window.matchMedia = () => ({
        matches: false,
        addListener: () => {},
        removeListener: () => {}
    });
}

if (!localStorage) {
    console.warn('⚠️ localStorage no disponible, persistencia desactivada');
    
    // Fallback a objeto en memoria
    window.localStorage = {
        _data: {},
        setItem: function(key, value) {
            this._data[key] = value;
        },
        getItem: function(key) {
            return this._data[key] || null;
        },
        removeItem: function(key) {
            delete this._data[key];
        }
    };
}
