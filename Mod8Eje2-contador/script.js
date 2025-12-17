// ===============================================
// MÓDULO PRINCIPAL DEL CONTADOR
// ===============================================

const CounterApp = (() => {
    // ===== CONFIGURACIÓN Y CONSTANTES =====
    const CONFIG = {
        STORAGE_KEY: 'counterApp_v2',
        MAX_VALUE: 9999,
        MIN_VALUE: -9999,
        ANIMATION_DURATION: 300,
        CONFETTI_COUNT: 50,
        KEYBINDINGS: {
            INCREMENT: ['ArrowUp', '+', '='],
            DECREMENT: ['ArrowDown', '-', '_'],
            INCREMENT_FAST: ['ArrowRight', 'PageUp'],
            DECREMENT_FAST: ['ArrowLeft', 'PageDown'],
            RESET: ['r', 'R', '0', 'Escape'],
            RESET_STORAGE: ['Shift+R', 'Shift+r']
        }
    };

    // ===== ESTADO GLOBAL =====
    const state = {
        count: 0,
        maxReached: 0,
        minReached: 0,
        totalChanges: 0,
        lastOperation: null,
        history: [],
        isAnimating: false
    };

    // ===== REFERENCIAS AL DOM =====
    const DOM = {
        counter: null,
        counterDisplay: null,
        counterNumber: null,
        counterFeedback: null,
        messageElement: null,
        stats: {
            max: null,
            min: null,
            changes: null
        }
    };

    // ===== INICIALIZACIÓN =====
    function init() {
        try {
            loadDOMReferences();
            loadState();
            setupEventListeners();
            updateUI();
            setupAnimations();
            console.log('🚀 Contador Interactivo iniciado correctamente');
            console.log('🎮 Atajos:', CONFIG.KEYBINDINGS);
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            showErrorUI();
        }
    }

    // ===== MANEJO DEL DOM =====
    function loadDOMReferences() {
        DOM.counter = document.getElementById('contador');
        DOM.counterDisplay = document.querySelector('.counter-display');
        DOM.counterNumber = document.querySelector('.counter-number');
        DOM.counterFeedback = document.querySelector('.counter-visual-feedback');
        DOM.messageElement = document.getElementById('mensaje');
        
        // Referencias de estadísticas
        DOM.stats.max = document.getElementById('maximo');
        DOM.stats.min = document.getElementById('minimo');
        DOM.stats.changes = document.getElementById('totalCambios');
        
        if (!DOM.counter || !DOM.counterDisplay) {
            throw new Error('Elementos del DOM no encontrados');
        }
    }

    function showErrorUI() {
        if (DOM.messageElement) {
            DOM.messageElement.innerHTML = '<strong>Error:</strong> No se pudo cargar la aplicación';
            DOM.messageElement.style.color = 'var(--color-danger)';
        }
    }

    // ===== MANEJO DEL ESTADO =====
    function loadState() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.assign(state, parsed);
                console.log('📂 Estado cargado desde localStorage');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar el estado guardado:', error);
            resetState();
        }
    }

    function saveState() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar el estado:', error);
        }
    }

    function resetState() {
        state.count = 0;
        state.maxReached = 0;
        state.minReached = 0;
        state.totalChanges = 0;
        state.lastOperation = null;
        state.history = [];
        saveState();
    }

    // ===== OPERACIONES DEL CONTADOR =====
    function increment(value = 1) {
        if (state.isAnimating) return;
        
        const newValue = state.count + value;
        if (newValue > CONFIG.MAX_VALUE) {
            showNotification(`¡Máximo alcanzado! (${CONFIG.MAX_VALUE})`, 'warning');
            return;
        }
        
        performOperation('increment', value, newValue);
    }

    function decrement(value = 1) {
        if (state.isAnimating) return;
        
        const newValue = state.count - value;
        if (newValue < CONFIG.MIN_VALUE) {
            showNotification(`¡Mínimo alcanzado! (${CONFIG.MIN_VALUE})`, 'warning');
            return;
        }
        
        performOperation('decrement', value, newValue);
    }

    function reset() {
        if (state.count === 0) return;
        
        state.lastOperation = 'reset';
        state.count = 0;
        state.totalChanges++;
        addToHistory('reset', 0);
        updateUI();
        saveState();
        
        // Animación especial para reset
        playResetAnimation();
        showNotification('Contador reiniciado a cero', 'info');
    }

    function performOperation(type, value, newValue) {
        state.lastOperation = type;
        const oldValue = state.count;
        state.count = newValue;
        state.totalChanges++;
        
        // Actualizar estadísticas
        if (state.count > state.maxReached) state.maxReached = state.count;
        if (state.count < state.minReached) state.minReached = state.count;
        
        // Guardar en historial
        addToHistory(type, value);
        
        // Actualizar UI y guardar estado
        updateUI();
        saveState();
        
        // Efectos especiales
        playOperationAnimation(type, oldValue, newValue);
        playSoundEffect(type);
        
        // Confetti en hitos especiales
        if (state.count % 10 === 0 && state.count !== 0) {
            createConfetti();
            showNotification(`¡Hito alcanzado! (${state.count})`, 'success');
        }
    }

    // ===== HISTORIAL Y LOGS =====
    function addToHistory(operation, value) {
        const entry = {
            timestamp: new Date().toISOString(),
            operation,
            value,
            previous: state.count - (operation === 'increment' ? value : -value),
            current: state.count
        };
        
        state.history.unshift(entry);
        
        // Mantener historial limitado
        if (state.history.length > 20) {
            state.history = state.history.slice(0, 20);
        }
    }

    // ===== ANIMACIONES Y EFECTOS =====
    function setupAnimations() {
        // Pre-crear elementos de partículas
        if (DOM.counterFeedback) {
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: currentColor;
                    border-radius: 50%;
                    opacity: 0;
                    pointer-events: none;
                `;
                DOM.counterFeedback.appendChild(particle);
            }
        }
    }

    function playOperationAnimation(type, oldValue, newValue) {
        state.isAnimating = true;
        
        // Animación del número
        if (DOM.counterNumber) {
            DOM.counterNumber.style.transition = 'none';
            DOM.counterNumber.style.transform = type === 'increment' 
                ? 'translateY(-20px)' 
                : 'translateY(20px)';
            DOM.counterNumber.style.opacity = '0.5';
            
            setTimeout(() => {
                DOM.counterNumber.style.transition = `all ${CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                DOM.counterNumber.style.transform = 'translateY(0)';
                DOM.counterNumber.style.opacity = '1';
                state.isAnimating = false;
            }, 10);
        }
        
        // Partículas
        if (DOM.counterFeedback) {
            const particles = DOM.counterFeedback.querySelectorAll('.particle');
            const color = type === 'increment' 
                ? getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-success').trim() 
                : getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-danger').trim();
            
            particles.forEach((particle, index) => {
                const angle = (index / particles.length) * Math.PI * 2;
                const distance = 50 + Math.random() * 50;
                
                particle.style.background = color;
                particle.style.opacity = '0.8';
                particle.style.transform = 'translate(0, 0) scale(1)';
                
                // Animar
                setTimeout(() => {
                    particle.style.transition = `all ${CONFIG.ANIMATION_DURATION}ms ease-out`;
                    particle.style.transform = `
                        translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) 
                        scale(0.1)
                    `;
                    particle.style.opacity = '0';
                }, index * 20);
                
                // Reset
                setTimeout(() => {
                    particle.style.transition = 'none';
                    particle.style.transform = 'translate(0, 0) scale(1)';
                    particle.style.opacity = '0';
                }, CONFIG.ANIMATION_DURATION + index * 20);
            });
        }
    }

    function playResetAnimation() {
        if (DOM.counterDisplay) {
            DOM.counterDisplay.classList.add('active');
            setTimeout(() => {
                DOM.counterDisplay.classList.remove('active');
            }, CONFIG.ANIMATION_DURATION);
        }
    }

    function createConfetti() {
        const colors = [
            'var(--color-success)',
            'var(--color-info)',
            'var(--color-warning)',
            'var(--color-danger)',
            'var(--color-primary)'
        ];
        
        for (let i = 0; i < CONFIG.CONFETTI_COUNT; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Posición aleatoria
            const left = Math.random() * 100;
            const size = 5 + Math.random() * 10;
            
            // Estilos
            confetti.style.cssText = `
                position: fixed;
                left: ${left}%;
                top: -20px;
                width: ${size}px;
                height: ${size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                transform: rotate(${Math.random() * 360}deg);
                opacity: 0.9;
                z-index: 1000;
                pointer-events: none;
            `;
            
            document.body.appendChild(confetti);
            
            // Animación
            const animation = confetti.animate([
                { 
                    transform: `translateY(0) rotate(0deg)`,
                    opacity: 1 
                },
                { 
                    transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`,
                    opacity: 0 
                }
            ], {
                duration: 2000 + Math.random() * 2000,
                easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
            });
            
            // Limpiar después de la animación
            animation.onfinish = () => confetti.remove();
        }
    }

    function playSoundEffect(type) {
        try {
            // Sonidos simples usando Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Frecuencia según operación
            const baseFreq = type === 'increment' ? 800 : 400;
            oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
            oscillator.type = 'sine';
            
            // Envelope
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silencioso en caso de error
            console.debug('Audio no disponible');
        }
    }

    // ===== ACTUALIZACIÓN DE UI =====
    function updateUI() {
        updateCounterDisplay();
        updateStatsDisplay();
        updateMessage();
        updateVisualState();
    }

    function updateCounterDisplay() {
        if (DOM.counterNumber) {
            DOM.counterNumber.textContent = state.count;
            
            // Eliminar clases previas
            DOM.counterNumber.classList.remove('positive', 'negative', 'neutral');
            DOM.counterDisplay.classList.remove('positive-bg', 'negative-bg', 'neutral-bg');
            
            // Aplicar clases según valor
            if (state.count > 0) {
                DOM.counterNumber.classList.add('positive');
                DOM.counterDisplay.classList.add('positive-bg');
            } else if (state.count < 0) {
                DOM.counterNumber.classList.add('negative');
                DOM.counterDisplay.classList.add('negative-bg');
            } else {
                DOM.counterNumber.classList.add('neutral');
                DOM.counterDisplay.classList.add('neutral-bg');
            }
        }
    }

    function updateStatsDisplay() {
        if (DOM.stats.max) DOM.stats.max.textContent = state.maxReached;
        if (DOM.stats.min) DOM.stats.min.textContent = state.minReached;
        if (DOM.stats.changes) DOM.stats.changes.textContent = state.totalChanges;
    }

    function updateMessage() {
        if (!DOM.messageElement) return;
        
        let message = '';
        const absCount = Math.abs(state.count);
        
        if (state.count > 0) {
            message = `El contador está en <strong class="counter-state">positivo</strong> (+${state.count})`;
        } else if (state.count < 0) {
            message = `El contador está en <strong class="counter-state">negativo</strong> (${state.count})`;
        } else {
            message = `El contador está en <strong class="counter-state">cero</strong>`;
        }
        
        // Mensajes especiales para hitos
        if (absCount === 42) {
            message += ' 🎯 ¡La respuesta al universo!';
        } else if (absCount === 100) {
            message += ' 💯 ¡Centena alcanzada!';
        } else if (absCount === 69) {
            message += ' 😏 Número especial';
        }
        
        DOM.messageElement.innerHTML = message;
    }

    function updateVisualState() {
        // Actualizar estado de botones si es necesario
        const buttons = document.querySelectorAll('[data-action]');
        buttons.forEach(button => {
            const action = button.dataset.action;
            
            // Deshabilitar decrementar si estamos en mínimo
            if (action === 'decrement' || action === 'decrement-5') {
                button.disabled = state.count <= CONFIG.MIN_VALUE;
            }
            
            // Deshabilitar incrementar si estamos en máximo
            if (action === 'increment' || action === 'increment-5') {
                button.disabled = state.count >= CONFIG.MAX_VALUE;
            }
        });
    }

    function showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: var(--color-white);
            color: var(--color-text);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            transform: translateX(120%);
            transition: transform 0.3s ease-out;
            font-weight: 600;
            border-left: 4px solid var(--color-${type});
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Ocultar y remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ===== MANEJO DE EVENTOS =====
    function setupEventListeners() {
        // Event delegation para botones
        document.addEventListener('click', handleButtonClick);
        
        // Eventos de teclado
        document.addEventListener('keydown', handleKeyboard);
        
        // Eventos táctiles (para móviles)
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Evento de antes de cerrar la página
        window.addEventListener('beforeunload', () => {
            saveState();
        });
    }

    function handleButtonClick(event) {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        
        const action = button.dataset.action;
        
        switch (action) {
            case 'increment':
                increment(1);
                animateButton(button);
                break;
            case 'decrement':
                decrement(1);
                animateButton(button);
                break;
            case 'reset':
                reset();
                animateButton(button);
                break;
            case 'increment-5':
                increment(5);
                animateButton(button);
                break;
            case 'decrement-5':
                decrement(5);
                animateButton(button);
                break;
        }
    }

    function handleKeyboard(event) {
        // Ignorar si estamos en un campo de entrada
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const key = event.key;
        
        // Incremento normal
        if (CONFIG.KEYBINDINGS.INCREMENT.includes(key)) {
            event.preventDefault();
            increment(1);
        }
        // Decremento normal
        else if (CONFIG.KEYBINDINGS.DECREMENT.includes(key)) {
            event.preventDefault();
            decrement(1);
        }
        // Incremento rápido
        else if (CONFIG.KEYBINDINGS.INCREMENT_FAST.includes(key)) {
            event.preventDefault();
            increment(5);
        }
        // Decremento rápido
        else if (CONFIG.KEYBINDINGS.DECREMENT_FAST.includes(key)) {
            event.preventDefault();
            decrement(5);
        }
        // Reset
        else if (CONFIG.KEYBINDINGS.RESET.includes(key)) {
            event.preventDefault();
            reset();
        }
        // Reset completo (Shift + R)
        else if (CONFIG.KEYBINDINGS.RESET_STORAGE.includes(key)) {
            event.preventDefault();
            resetState();
            updateUI();
            showNotification('Estado completo reiniciado', 'info');
        }
    }

    let touchStartY = 0;
    function handleTouchStart(event) {
        touchStartY = event.touches[0].clientY;
    }

    function handleTouchEnd(event) {
        const touchEndY = event.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;
        
        // Deslizar hacia arriba = incrementar
        if (deltaY > 50) {
            increment(1);
        }
        // Deslizar hacia abajo = decrementar
        else if (deltaY < -50) {
            decrement(1);
        }
    }

    function animateButton(button) {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 200);
    }

    // ===== API PÚBLICA =====
    return {
        init,
        increment,
        decrement,
        reset,
        getState: () => ({ ...state }),
        getStats: () => ({
            count: state.count,
            maxReached: state.maxReached,
            minReached: state.minReached,
            totalChanges: state.totalChanges
        })
    };
})();

// ===============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // Iniciar la aplicación
    CounterApp.init();
    
    // Agregar estilos para notificaciones
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            font-family: var(--font-family);
        }
        .notification-success {
            border-left-color: var(--color-success) !important;
        }
        .notification-warning {
            border-left-color: var(--color-warning) !important;
        }
        .notification-info {
            border-left-color: var(--color-info) !important;
        }
        .notification-danger {
            border-left-color: var(--color-danger) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Mostrar mensaje de bienvenida
    console.log(`
        🎮 CONTADOR INTERACTIVO v2.0
        ==============================
        📊 Estadísticas disponibles
        🎨 Animaciones mejoradas
        ⌨️  Soporte para teclado
        📱 Soporte táctil
        💾 Persistencia automática
        🎉 Efectos especiales
    `);
});

// ===============================================
// MANEJO DE ERRORES GLOBALES
// ===============================================

window.addEventListener('error', (event) => {
    console.error('❌ Error global:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promesa rechazada no manejada:', event.reason);
});

// ===============================================
// SERVICEWORKER (OPCIONAL - PARA PWA)
// ===============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// ===============================================
// EXPORTACIÓN PARA DESARROLLO (solo en desarrollo)
// ===============================================

if (process.env.NODE_ENV === 'development') {
    window.CounterApp = CounterApp;
}
