/**
 * MÓDULO: Configuración y Constantes
 */
const PasswordGeneratorConfig = {
    MIN_LENGTH: 4,
    MAX_LENGTH: 32,
    DEFAULT_LENGTH: 12,
    MAX_HISTORY_ITEMS: 10,
    
    // Conjuntos de caracteres usando Unicode seguro
    CHARACTER_SETS: {
        UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
        NUMBERS: '0123456789',
        SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    },
    
    STRENGTH_LEVELS: [
        { min: 0, max: 39, label: 'Muy Débil', color: '#ff6b6b', class: 'very-weak' },
        { min: 40, max: 59, label: 'Débil', color: '#ff9800', class: 'weak' },
        { min: 60, max: 79, label: 'Medio', color: '#2196f3', class: 'medium' },
        { min: 80, max: 89, label: 'Fuerte', color: '#4caf50', class: 'strong' },
        { min: 90, max: 100, label: 'Muy Fuerte', color: '#2e7d32', class: 'very-strong' }
    ]
};

/**
 * MÓDULO: Elementos del DOM
 */
const DOM = {
    form: document.getElementById('generatorForm'),
    lengthInput: document.getElementById('length'),
    lengthValue: document.getElementById('lengthValue'),
    uppercaseCheck: document.getElementById('uppercase'),
    lowercaseCheck: document.getElementById('lowercase'),
    numbersCheck: document.getElementById('numbers'),
    symbolsCheck: document.getElementById('symbols'),
    passwordOutput: document.getElementById('passwordOutput'),
    copyBtn: document.getElementById('copyBtn'),
    strengthBar: document.getElementById('strengthBar'),
    strengthText: document.getElementById('strengthText'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    toast: document.getElementById('toast')
};

/**
 * MÓDULO: Estado de la aplicación
 */
const AppState = {
    history: [],
    currentPassword: '',
    
    init() {
        this.loadHistory();
        this.updateCopyButtonState();
    },
    
    loadHistory() {
        try {
            const stored = localStorage.getItem('passwordHistory');
            this.history = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error al cargar historial:', error);
            this.history = [];
        }
    },
    
    saveHistory() {
        try {
            localStorage.setItem('passwordHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('Error al guardar historial:', error);
        }
    },
    
    updateCopyButtonState() {
        const hasPassword = this.currentPassword && 
                          this.currentPassword !== 'Haz clic en "Generar Contraseña" para comenzar';
        DOM.copyBtn.disabled = !hasPassword;
    },
    
    setCurrentPassword(password) {
        this.currentPassword = password;
        this.updateCopyButtonState();
    }
};

/**
 * MÓDULO: Utilidades de seguridad y validación
 */
const SecurityUtils = {
    /**
     * Genera un número aleatorio criptográficamente seguro
     */
    getSecureRandom(max) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
    },
    
    /**
     * Sanitiza texto para prevenir XSS
     */
    sanitize(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Valida las opciones seleccionadas
     */
    validateOptions(options) {
        const { uppercase, lowercase, numbers, symbols } = options;
        
        if (!uppercase && !lowercase && !numbers && !symbols) {
            throw new Error('Debes seleccionar al menos un tipo de carácter');
        }
        
        return true;
    },
    
    /**
     * Valida longitud de contraseña
     */
    validateLength(length) {
        if (length < PasswordGeneratorConfig.MIN_LENGTH || 
            length > PasswordGeneratorConfig.MAX_LENGTH) {
            throw new Error(`La longitud debe estar entre ${PasswordGeneratorConfig.MIN_LENGTH} y ${PasswordGeneratorConfig.MAX_LENGTH}`);
        }
        
        return true;
    }
};

/**
 * MÓDULO: Generación de contraseñas
 */
const PasswordGenerator = {
    /**
     * Genera una contraseña segura usando el algoritmo especificado
     */
    generate(length, options) {
        try {
            // Validar entrada
            SecurityUtils.validateLength(length);
            SecurityUtils.validateOptions(options);
            
            // Construir conjunto de caracteres
            const charset = this.buildCharset(options);
            
            // Generar contraseña principal
            let password = this.generateMainPassword(length, charset);
            
            // Asegurar al menos un carácter de cada tipo seleccionado
            password = this.enforceCharacterTypes(password, options);
            
            // Mezclar la contraseña
            password = this.shufflePassword(password);
            
            return password;
        } catch (error) {
            throw error;
        }
    },
    
    /**
     * Construye el conjunto de caracteres basado en las opciones
     */
    buildCharset(options) {
        let charset = '';
        const { CHARACTER_SETS } = PasswordGeneratorConfig;
        
        if (options.uppercase) charset += CHARACTER_SETS.UPPERCASE;
        if (options.lowercase) charset += CHARACTER_SETS.LOWERCASE;
        if (options.numbers) charset += CHARACTER_SETS.NUMBERS;
        if (options.symbols) charset += CHARACTER_SETS.SYMBOLS;
        
        return charset;
    },
    
    /**
     * Genera la contraseña principal
     */
    generateMainPassword(length, charset) {
        let password = '';
        
        for (let i = 0; i < length; i++) {
            const randomIndex = SecurityUtils.getSecureRandom(charset.length);
            password += charset[randomIndex];
        }
        
        return password;
    },
    
    /**
     * Asegura que la contraseña contenga al menos un carácter de cada tipo seleccionado
     */
    enforceCharacterTypes(password, options) {
        const { CHARACTER_SETS } = PasswordGeneratorConfig;
        const passwordChars = password.split('');
        
        // Reemplazar caracteres aleatorios para asegurar tipos
        let replacements = 0;
        
        if (options.uppercase && !/[A-Z]/.test(password)) {
            const randomIndex = SecurityUtils.getSecureRandom(password.length);
            const randomChar = CHARACTER_SETS.UPPERCASE[SecurityUtils.getSecureRandom(CHARACTER_SETS.UPPERCASE.length)];
            passwordChars[randomIndex] = randomChar;
            replacements++;
        }
        
        if (options.lowercase && !/[a-z]/.test(password)) {
            const randomIndex = SecurityUtils.getSecureRandom(password.length);
            const randomChar = CHARACTER_SETS.LOWERCASE[SecurityUtils.getSecureRandom(CHARACTER_SETS.LOWERCASE.length)];
            passwordChars[randomIndex] = randomChar;
            replacements++;
        }
        
        if (options.numbers && !/[0-9]/.test(password)) {
            const randomIndex = SecurityUtils.getSecureRandom(password.length);
            const randomChar = CHARACTER_SETS.NUMBERS[SecurityUtils.getSecureRandom(CHARACTER_SETS.NUMBERS.length)];
            passwordChars[randomIndex] = randomChar;
            replacements++;
        }
        
        if (options.symbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
            const randomIndex = SecurityUtils.getSecureRandom(password.length);
            const randomChar = CHARACTER_SETS.SYMBOLS[SecurityUtils.getSecureRandom(CHARACTER_SETS.SYMBOLS.length)];
            passwordChars[randomIndex] = randomChar;
            replacements++;
        }
        
        // Si hicimos reemplazos, mantener la longitud original
        if (replacements > 0) {
            return passwordChars.join('');
        }
        
        return password;
    },
    
    /**
     * Mezcla los caracteres de la contraseña usando el algoritmo Fisher-Yates
     */
    shufflePassword(password) {
        const chars = password.split('');
        
        for (let i = chars.length - 1; i > 0; i--) {
            const j = SecurityUtils.getSecureRandom(i + 1);
            [chars[i], chars[j]] = [chars[j], chars[i]];
        }
        
        return chars.join('');
    }
};

/**
 * MÓDULO: Análisis de fortaleza
 */
const PasswordStrength = {
    /**
     * Calcula la fuerza de una contraseña (0-100)
     */
    calculate(password) {
        if (!password) return 0;
        
        let score = 0;
        
        // Puntos por longitud
        score += Math.min(password.length * 4, 50); // Máximo 50 puntos por longitud
        
        // Puntos por diversidad de caracteres
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^a-zA-Z0-9]/.test(password);
        
        const diversityCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols]
            .filter(Boolean).length;
        
        score += diversityCount * 10; // 0-40 puntos por diversidad
        
        // Puntos por patrones complejos
        if (password.length >= 8) {
            // Penalizar secuencias simples
            const hasSequence = /(.)\1{2,}/.test(password); // Caracteres repetidos
            const hasCommonPattern = /(123|abc|qwerty|password)/i.test(password);
            
            if (!hasSequence && !hasCommonPattern) {
                score += 10;
            } else {
                score -= 15;
            }
        }
        
        return Math.max(0, Math.min(score, 100));
    },
    
    /**
     * Obtiene el nivel de fuerza y su configuración
     */
    getLevel(score) {
        const { STRENGTH_LEVELS } = PasswordGeneratorConfig;
        
        return STRENGTH_LEVELS.find(level => 
            score >= level.min && score <= level.max
        ) || STRENGTH_LEVELS[0];
    }
};

/**
 * MÓDULO: Interfaz de usuario
 */
const UI = {
    /**
     * Actualiza el indicador de fuerza visualmente
     */
    updateStrengthIndicator(password) {
        const score = PasswordStrength.calculate(password);
        const level = PasswordStrength.getLevel(score);
        
        // Actualizar barra
        DOM.strengthBar.style.width = `${score}%`;
        DOM.strengthBar.style.background = level.color;
        DOM.strengthBar.className = `strength-bar ${level.class}`;
        
        // Actualizar texto
        DOM.strengthText.textContent = `Nivel: ${level.label}`;
        DOM.strengthText.style.color = level.color;
        
        // Actualizar etiqueta de accesibilidad
        const strengthLabel = document.querySelector('.strength-label');
        if (strengthLabel) {
            strengthLabel.textContent = `Fuerza de la contraseña: ${level.label} (${score}%)`;
        }
        
        // Actualizar ARIA para lectores de pantalla
        DOM.strengthBar.setAttribute('aria-valuenow', score);
        DOM.strengthBar.setAttribute('aria-valuetext', level.label);
    },
    
    /**
     * Muestra una notificación toast
     */
    showToast(message, type = 'success') {
        const toast = DOM.toast;
        const icon = type === 'success' ? '✓' : '⚠';
        
        toast.querySelector('.toast-icon').textContent = icon;
        toast.querySelector('.toast-message').textContent = message;
        
        // Actualizar color según tipo
        toast.style.background = type === 'success' ? 
            'var(--color-success)' : 'var(--color-warning)';
        
        // Mostrar toast
        toast.hidden = false;
        toast.classList.add('show');
        
        // Ocultar después de tiempo
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.hidden = true;
            }, 300);
        }, 2000);
    },
    
    /**
     * Renderiza el historial de contraseñas
     */
    renderHistory() {
        const { history } = AppState;
        
        if (history.length === 0) {
            DOM.historyList.innerHTML = `
                <p class="empty-history" role="status">
                    No hay contraseñas generadas aún
                </p>
            `;
            DOM.clearHistoryBtn.style.display = 'none';
            return;
        }
        
        DOM.clearHistoryBtn.style.display = 'block';
        
        // Usar createElement para evitar XSS
        DOM.historyList.innerHTML = '';
        
        history.forEach((password, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.setAttribute('role', 'listitem');
            
            const passwordSpan = document.createElement('span');
            passwordSpan.className = 'history-password';
            passwordSpan.textContent = password;
            
            const copyButton = document.createElement('button');
            copyButton.className = 'history-copy';
            copyButton.textContent = 'Copiar';
            copyButton.setAttribute('aria-label', `Copiar contraseña ${index + 1}`);
            copyButton.addEventListener('click', () => {
                Clipboard.copy(password);
            });
            
            item.appendChild(passwordSpan);
            item.appendChild(copyButton);
            DOM.historyList.appendChild(item);
        });
    },
    
    /**
     * Actualiza la contraseña en el display
     */
    updatePasswordDisplay(password) {
        DOM.passwordOutput.value = password;
        AppState.setCurrentPassword(password);
        
        // Animación sutil
        DOM.passwordOutput.style.transform = 'scale(1.05)';
        setTimeout(() => {
            DOM.passwordOutput.style.transform = 'scale(1)';
        }, 200);
        
        // Enfocar el campo para fácil selección
        DOM.passwordOutput.focus();
        DOM.passwordOutput.select();
    },
    
    /**
     * Muestra un error al usuario
     */
    showError(message) {
        this.showToast(message, 'error');
        
        // También podríamos mostrar un modal o alerta más elaborada
        console.warn('Error en generador:', message);
    }
};

/**
 * MÓDULO: Portapapeles
 */
const Clipboard = {
    /**
     * Copia texto al portapapeles usando la API moderna o fallback
     */
    async copy(text) {
        try {
            if (!text || typeof text !== 'string') {
                throw new Error('Texto no válido para copiar');
            }
            
            await navigator.clipboard.writeText(text);
            UI.showToast('✓ Contraseña copiada al portapapeles');
            return true;
        } catch (error) {
            console.warn('Error con API Clipboard:', error);
            return this.fallbackCopy(text);
        }
    },
    
    /**
     * Fallback para navegadores antiguos
     */
    fallbackCopy(text) {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (success) {
                UI.showToast('✓ Contraseña copiada al portapapeles');
                return true;
            } else {
                throw new Error('Fallback copy failed');
            }
        } catch (error) {
            console.error('Error en fallback copy:', error);
            UI.showToast('⚠ No se pudo copiar la contraseña', 'error');
            return false;
        }
    }
};

/**
 * MÓDULO: Historial
 */
const HistoryManager = {
    /**
     * Agrega una contraseña al historial
     */
    add(password) {
        try {
            const { history } = AppState;
            
            // Evitar duplicados consecutivos
            if (history[0] !== password) {
                history.unshift(password);
                
                // Limitar tamaño del historial
                if (history.length > PasswordGeneratorConfig.MAX_HISTORY_ITEMS) {
                    AppState.history = history.slice(0, PasswordGeneratorConfig.MAX_HISTORY_ITEMS);
                }
                
                AppState.saveHistory();
                UI.renderHistory();
            }
        } catch (error) {
            console.error('Error al guardar en historial:', error);
        }
    },
    
    /**
     * Limpia todo el historial
     */
    clear() {
        AppState.history = [];
        AppState.saveHistory();
        UI.renderHistory();
    }
};

/**
 * MÓDULO: Controladores de eventos
 */
const EventHandlers = {
    /**
     * Configura todos los event listeners
     */
    init() {
        this.setupForm();
        this.setupSlider();
        this.setupCopyButton();
        this.setupClearHistory();
        this.setupKeyboardShortcuts();
    },
    
    /**
     * Configura el formulario de generación
     */
    setupForm() {
        DOM.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const length = parseInt(DOM.lengthInput.value);
                const options = {
                    uppercase: DOM.uppercaseCheck.checked,
                    lowercase: DOM.lowercaseCheck.checked,
                    numbers: DOM.numbersCheck.checked,
                    symbols: DOM.symbolsCheck.checked
                };
                
                const password = PasswordGenerator.generate(length, options);
                
                UI.updatePasswordDisplay(password);
                UI.updateStrengthIndicator(password);
                HistoryManager.add(password);
                
            } catch (error) {
                UI.showError(error.message);
            }
        });
    },
    
    /**
     * Configura el slider de longitud
     */
    setupSlider() {
        DOM.lengthInput.addEventListener('input', () => {
            const value = DOM.lengthInput.value;
            DOM.lengthValue.textContent = value;
            
            // Actualizar ARIA
            DOM.lengthInput.setAttribute('aria-valuenow', value);
            DOM.lengthInput.setAttribute('aria-valuetext', `${value} caracteres`);
        });
    },
    
    /**
     * Configura el botón de copiar
     */
    setupCopyButton() {
        DOM.copyBtn.addEventListener('click', async () => {
            const password = DOM.passwordOutput.value;
            
            if (!password || password === 'Haz clic en "Generar Contraseña" para comenzar') {
                UI.showError('Primero genera una contraseña');
                return;
            }
            
            await Clipboard.copy(password);
        });
    },
    
    /**
     * Configura el botón de limpiar historial
     */
    setupClearHistory() {
        DOM.clearHistoryBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas eliminar todo el historial de contraseñas?')) {
                HistoryManager.clear();
                UI.showToast('Historial eliminado');
            }
        });
    },
    
    /**
     * Configura atajos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+G o Cmd+G para generar
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                e.preventDefault();
                DOM.form.dispatchEvent(new Event('submit'));
            }
            
            // Ctrl+C para copiar si el campo de contraseña está enfocado
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && 
                document.activeElement === DOM.passwordOutput) {
                e.preventDefault();
                DOM.copyBtn.click();
            }
            
            // Espacio para generar (si no hay campo de entrada enfocado)
            if (e.key === ' ' && 
                document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'BUTTON') {
                e.preventDefault();
                DOM.form.dispatchEvent(new Event('submit'));
            }
        });
    }
};

/**
 * INICIALIZACIÓN DE LA APLICACIÓN
 */
class PasswordGeneratorApp {
    static init() {
        try {
            // Inicializar estado
            AppState.init();
            
            // Configurar eventos
            EventHandlers.init();
            
            // Renderizar historial inicial
            UI.renderHistory();
            
            // Generar contraseña inicial
            this.generateInitialPassword();
            
            // Log de inicialización
            console.log('🔐 Generador de Contraseñas Seguro - Inicializado');
            console.log(`⚙️ Configuración: ${PasswordGeneratorConfig.MIN_LENGTH}-${PasswordGeneratorConfig.MAX_LENGTH} caracteres`);
            
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            UI.showError('Error al inicializar el generador');
        }
    }
    
    static generateInitialPassword() {
        try {
            const defaultLength = PasswordGeneratorConfig.DEFAULT_LENGTH;
            const defaultOptions = {
                uppercase: true,
                lowercase: true,
                numbers: true,
                symbols: false
            };
            
            const initialPassword = PasswordGenerator.generate(defaultLength, defaultOptions);
            
            UI.updatePasswordDisplay(initialPassword);
            UI.updateStrengthIndicator(initialPassword);
            HistoryManager.add(initialPassword);
            
        } catch (error) {
            // Si hay error en generación inicial, mostrar estado vacío
            console.warn('No se pudo generar contraseña inicial:', error.message);
        }
    }
}

/**
 * POLYFILL para navegadores antiguos
 */
if (!window.crypto || !window.crypto.getRandomValues) {
    console.warn('Crypto API no disponible, usando Math.random()');
    window.crypto = {
        getRandomValues: function(array) {
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * Math.pow(2, 32));
            }
            return array;
        }
    };
}

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PasswordGeneratorApp.init());
} else {
    PasswordGeneratorApp.init();
}

// Exportar para testing (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PasswordGenerator,
        PasswordStrength,
        SecurityUtils
    };
}
