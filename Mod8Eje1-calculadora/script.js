// ===== MODULO PRINCIPAL CALCULADORA =====
const Calculator = (() => {
    // ===== CONSTANTES Y CONFIGURACIONES =====
    const OPERATIONS = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '×': (a, b) => a * b,
        '÷': (a, b) => {
            if (b === 0) throw new Error('División por cero');
            return a / b;
        }
    };

    const MAX_HISTORY_ENTRIES = 15;
    const STORAGE_KEY = 'calculatorHistory_v2';
    const MAX_DISPLAY_LENGTH = 12;

    // ===== CLASE CALCULADORA =====
    class Calculator {
        constructor(previousOperandElement, currentOperandElement) {
            this.previousOperandElement = previousOperandElement;
            this.currentOperandElement = currentOperandElement;
            this.history = this.loadHistory();
            this.reset();
            this.init();
        }

        // ===== MÉTODOS DE INICIALIZACIÓN =====
        init() {
            this.updateDisplay();
            this.updateHistory();
        }

        reset() {
            this.currentOperand = '0';
            this.previousOperand = '';
            this.operation = null;
            this.isError = false;
        }

        loadHistory() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                return stored ? JSON.parse(stored) : [];
            } catch (error) {
                console.warn('Error al cargar historial:', error);
                return [];
            }
        }

        saveHistory() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
            } catch (error) {
                console.warn('Error al guardar historial:', error);
            }
        }

        // ===== OPERACIONES BÁSICAS =====
        clear() {
            this.reset();
            this.animateDisplay('clear');
        }

        delete() {
            if (this.isError || this.currentOperand === '0' || this.currentOperand === '') {
                return;
            }
            
            // Si es un solo carácter o el resultado de un cálculo, poner a 0
            if (this.currentOperand.length === 1) {
                this.currentOperand = '0';
            } else {
                this.currentOperand = this.currentOperand.slice(0, -1);
            }
            this.animateDisplay('delete');
        }

        appendNumber(number) {
            if (this.isError) {
                this.reset();
            }
            
            // Validar entrada de decimales
            if (number === '.' && this.currentOperand.includes('.')) {
                return;
            }
            
            // Si el display está en 0 o es un resultado reciente, reemplazar
            if (this.currentOperand === '0' && number !== '.') {
                this.currentOperand = number;
            } else if (this.currentOperand === '0' && number === '.') {
                this.currentOperand = '0.';
            } else {
                // Limitar longitud máxima
                if (this.currentOperand.length >= MAX_DISPLAY_LENGTH) {
                    return;
                }
                this.currentOperand += number;
            }
            
            this.animateDisplay('number');
        }

        chooseOperation(operation) {
            if (this.isError) return;
            
            // Si ya hay una operación pendiente, calcular primero
            if (this.operation && this.previousOperand && this.currentOperand !== '') {
                this.compute();
            }
            
            // Si no hay número actual, usar el último resultado
            if (this.currentOperand === '' || this.currentOperand === '0') {
                if (this.previousOperand) {
                    this.currentOperand = this.previousOperand;
                } else {
                    return;
                }
            }
            
            this.operation = operation;
            this.previousOperand = this.currentOperand;
            this.currentOperand = '';
            this.animateDisplay('operation');
        }

        // ===== CÁLCULO CORREGIDO =====
        compute() {
            if (this.isError || !this.operation || !this.previousOperand) {
                return;
            }
            
            // Si no hay número actual, usar 0
            const current = this.currentOperand === '' || this.currentOperand === '0' ? '0' : this.currentOperand;
            
            const prev = parseFloat(this.previousOperand);
            const curr = parseFloat(current);
            
            // Validar números
            if (isNaN(prev) || isNaN(curr)) {
                this.showError('Entrada inválida');
                return;
            }
            
            try {
                const operationFn = OPERATIONS[this.operation];
                if (!operationFn) {
                    this.showError('Operación no soportada');
                    return;
                }
                
                let computation = operationFn(prev, curr);
                
                // Manejar números muy grandes o pequeños
                if (!isFinite(computation)) {
                    this.showError('Resultado fuera de rango');
                    return;
                }
                
                // Redondear para evitar errores de punto flotante
                computation = Math.round(computation * 100000000) / 100000000;
                
                // Crear entrada de historial ANTES de actualizar el estado
                const historyEntry = {
                    expression: `${this.formatDisplayNumber(prev)} ${this.operation} ${this.formatDisplayNumber(curr)}`,
                    result: computation,
                    timestamp: new Date().toISOString()
                };
                
                // Actualizar historial
                this.addToHistory(historyEntry);
                
                // Actualizar estado - CORRECCIÓN IMPORTANTE
                this.currentOperand = computation.toString();
                this.previousOperand = '';
                this.operation = null;
                this.isError = false;
                
                this.animateDisplay('compute');
                
            } catch (error) {
                if (error.message === 'División por cero') {
                    this.showError('División por cero');
                } else {
                    this.showError('Error en cálculo');
                }
                console.error('Error en compute:', error);
            }
        }

        // ===== MANEJO DE HISTORIAL CORREGIDO =====
        addToHistory(entry) {
            this.history.unshift(entry);
            
            // Limitar tamaño del historial
            if (this.history.length > MAX_HISTORY_ENTRIES) {
                this.history = this.history.slice(0, MAX_HISTORY_ENTRIES);
            }
            
            this.saveHistory();
            this.updateHistory();
        }

        clearHistory() {
            this.history = [];
            this.saveHistory();
            this.updateHistory();
            
            // Animación de limpieza
            const historyList = document.querySelector('.history-list');
            if (historyList) {
                historyList.style.opacity = '0';
                setTimeout(() => {
                    historyList.style.opacity = '1';
                }, 300);
            }
        }

        updateHistory() {
            const historyList = document.querySelector('.history-list');
            if (!historyList) return;
            
            if (!this.history || this.history.length === 0) {
                historyList.innerHTML = `
                    <div class="history-item empty">
                        No hay operaciones recientes
                    </div>
                `;
                return;
            }
            
            historyList.innerHTML = this.history.map((item, index) => `
                <div class="history-item" data-index="${index}">
                    <div class="history-expression">${item.expression}</div>
                    <div class="history-result">= ${this.formatDisplayNumber(item.result)}</div>
                    <div class="history-time">${this.formatTime(item.timestamp)}</div>
                </div>
            `).join('');
        }

        // ===== FORMATO Y DISPLAY =====
        formatDisplayNumber(number) {
            const num = parseFloat(number);
            if (isNaN(num)) return '0';
            
            // Para el display, usar formato simple
            const str = num.toString();
            
            // Si es muy largo, usar notación científica
            if (str.length > MAX_DISPLAY_LENGTH) {
                return num.toExponential(6).slice(0, MAX_DISPLAY_LENGTH);
            }
            
            return str;
        }

        formatNumberForHistory(number) {
            const num = parseFloat(number);
            if (isNaN(num)) return '0';
            
            // Para historial, usar formato más legible
            return num.toLocaleString('es-ES', {
                maximumFractionDigits: 8,
                useGrouping: true
            });
        }

        formatTime(timestamp) {
            try {
                const date = new Date(timestamp);
                const now = new Date();
                const diffMs = now - date;
                
                // Mostrar tiempo relativo
                if (diffMs < 60000) return 'Hace unos segundos';
                if (diffMs < 3600000) return `Hace ${Math.floor(diffMs / 60000)} min`;
                if (diffMs < 86400000) return `Hace ${Math.floor(diffMs / 3600000)} h`;
                
                return date.toLocaleDateString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch {
                return 'Reciente';
            }
        }

        updateDisplay() {
            // Limpiar clases de error
            this.currentOperandElement.classList.remove('error');
            
            // Actualizar display actual
            const displayNumber = this.isError ? 
                this.currentOperand : 
                this.formatDisplayNumber(this.currentOperand);
            
            this.currentOperandElement.textContent = displayNumber;
            
            // Actualizar display anterior
            if (this.operation && this.previousOperand) {
                const previousDisplay = this.formatDisplayNumber(this.previousOperand);
                this.previousOperandElement.textContent = `${previousDisplay} ${this.operation}`;
                this.previousOperandElement.classList.add('active');
            } else {
                this.previousOperandElement.textContent = '';
                this.previousOperandElement.classList.remove('active');
            }
        }

        // ===== ANIMACIONES Y EFECTOS =====
        animateDisplay(action) {
            const display = this.currentOperandElement;
            
            // Remover clases de animación previas
            display.classList.remove('pulse', 'shake', 'highlight');
            
            // Pequeño delay para que se vea la animación
            setTimeout(() => {
                switch (action) {
                    case 'compute':
                        display.classList.add('pulse');
                        break;
                    case 'clear':
                        display.classList.add('highlight');
                        break;
                    case 'number':
                        // Efecto sutil para números
                        display.style.color = '#4caf50';
                        setTimeout(() => {
                            display.style.color = '';
                        }, 100);
                        break;
                }
                
                this.updateDisplay();
            }, 10);
        }

        showError(message) {
            this.isError = true;
            this.currentOperand = message;
            this.previousOperand = '';
            this.operation = null;
            
            // Efecto de error
            this.currentOperandElement.classList.add('shake', 'error');
            
            // Restaurar después de 2 segundos
            setTimeout(() => {
                this.reset();
                this.updateDisplay();
            }, 2000);
        }
    }

    return Calculator;
})();

// ===== MÓDULO DE MANEJO DE EVENTOS CORREGIDO =====
const EventManager = (() => {
    let calculator = null;
    
    // ===== MAPA DE TECLADO =====
    const KEY_MAPPINGS = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        '.': '.', ',': '.',
        '+': '+', '-': '-',
        '*': '×', 'x': '×', 'X': '×',
        '/': '÷',
        'Enter': '=', '=': '=',
        'Backspace': 'DELETE',
        'Delete': 'CLEAR',
        'Escape': 'CLEAR',
        'c': 'CLEAR', 'C': 'CLEAR'
    };
    
    // ===== INICIALIZACIÓN =====
    function init(calcInstance) {
        calculator = calcInstance;
        setupButtonListeners();
        setupKeyboardListeners();
        setupHistoryClickListeners();
    }
    
    // ===== EVENTOS DE BOTONES =====
    function setupButtonListeners() {
        // Botones numéricos
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', (e) => {
                const number = e.currentTarget.dataset.number;
                calculator.appendNumber(number);
                animateButton(e.currentTarget);
            });
        });
        
        // Botones de operación
        document.querySelectorAll('[data-operation]').forEach(button => {
            button.addEventListener('click', (e) => {
                const operation = e.currentTarget.dataset.operation;
                calculator.chooseOperation(operation);
                animateButton(e.currentTarget);
            });
        });
        
        // Botones especiales
        const equalsBtn = document.querySelector('[data-action="equals"]');
        const clearBtn = document.querySelector('[data-action="clear"]');
        const deleteBtn = document.querySelector('[data-action="delete"]');
        const clearHistoryBtn = document.querySelector('[data-action="clear-history"]');
        
        if (equalsBtn) {
            equalsBtn.addEventListener('click', (e) => {
                calculator.compute();
                animateButton(e.currentTarget);
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                calculator.clear();
                animateButton(e.currentTarget);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                calculator.delete();
                animateButton(e.currentTarget);
            });
        }
        
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', (e) => {
                calculator.clearHistory();
                animateButton(e.currentTarget);
            });
        }
    }
    
    // ===== EVENTOS DE CLICK EN HISTORIAL =====
    function setupHistoryClickListeners() {
        // Usar event delegation para el historial
        document.addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item:not(.empty)');
            if (historyItem && calculator) {
                const index = parseInt(historyItem.dataset.index);
                const historyEntry = calculator.history[index];
                
                if (historyEntry) {
                    // Usar el resultado del historial
                    calculator.currentOperand = historyEntry.result.toString();
                    calculator.previousOperand = '';
                    calculator.operation = null;
                    calculator.isError = false;
                    calculator.updateDisplay();
                    
                    // Efecto visual de selección
                    historyItem.classList.add('selected');
                    setTimeout(() => {
                        historyItem.classList.remove('selected');
                    }, 500);
                }
            }
        });
    }
    
    // ===== EVENTOS DE TECLADO =====
    function setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            const mapping = KEY_MAPPINGS[key];
            
            if (!mapping || !calculator) return;
            
            e.preventDefault();
            
            // Encontrar el botón correspondiente para animación
            let button = null;
            
            switch (mapping) {
                case 'CLEAR':
                    calculator.clear();
                    button = document.querySelector('[data-action="clear"]');
                    break;
                case 'DELETE':
                    calculator.delete();
                    button = document.querySelector('[data-action="delete"]');
                    break;
                case '=':
                    calculator.compute();
                    button = document.querySelector('[data-action="equals"]');
                    break;
                case '+':
                case '-':
                case '×':
                case '÷':
                    calculator.chooseOperation(mapping);
                    button = document.querySelector(`[data-operation="${mapping}"]`);
                    break;
                default:
                    calculator.appendNumber(mapping);
                    button = document.querySelector(`[data-number="${mapping}"]`);
            }
            
            if (button) animateButton(button);
        });
    }
    
    // ===== ANIMACIONES DE BOTONES =====
    function animateButton(button) {
        if (!button) return;
        
        button.classList.add('clicked');
        
        // Remover la clase después de la animación
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 200);
        
        // Efecto de sonido sutil
        playClickSound();
    }
    
    function playClickSound() {
        try {
            // Crear un sonido de click simple usando el Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Fallback silencioso
            console.debug('Audio no disponible');
        }
    }
    
    return { init };
})();

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Elementos del DOM
        const previousOperandElement = document.querySelector('.previous-operand');
        const currentOperandElement = document.querySelector('.current-operand');
        
        if (!previousOperandElement || !currentOperandElement) {
            throw new Error('Elementos del display no encontrados');
        }
        
        // Crear instancia de la calculadora
        const calculator = new Calculator(previousOperandElement, currentOperandElement);
        
        // Inicializar manejador de eventos
        EventManager.init(calculator);
        
        // Efecto de carga inicial
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
        
        // Configurar tema automático
        setupTheme();
        
    } catch (error) {
        console.error('Error al inicializar la calculadora:', error);
        showFatalError();
    }
});

// ===== MANEJO DEL TEMA =====
function setupTheme() {
    // Detectar preferencia de tema oscuro
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (prefersDark) {
        document.body.classList.add('dark-mode');
    }
    
    // Escuchar cambios en el tema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (e.matches) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
}

// ===== MANEJO DE ERRORES GLOBALES =====
function showFatalError() {
    const display = document.querySelector('.current-operand');
    if (display) {
        display.textContent = 'Error :(';
        display.classList.add('error');
    }
    
    // Mostrar mensaje en consola
    console.error('La calculadora encontró un error fatal. Recarga la página.');
}

// ===== SOPORTE PARA OFFLINE =====
window.addEventListener('offline', () => {
    console.log('Modo offline activado');
});

window.addEventListener('online', () => {
    console.log('Modo online activado');
});

// Prevenir clic derecho en la calculadora (opcional)
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.calculator') || e.target.closest('.history')) {
        e.preventDefault();
    }
}, false);
