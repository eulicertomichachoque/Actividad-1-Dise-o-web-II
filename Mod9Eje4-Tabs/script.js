// ===========================================================================
// CONSTANTES Y CONFIGURACIÓN
// ===========================================================================

const CONFIG = {
    STORAGE_KEY: 'tabs_system_active_tab',
    ANIMATION_DURATION: 250,
    KEYBOARD_SHORTCUTS: {
        PREVIOUS: ['ArrowLeft', 'Left', 'PageUp'],
        NEXT: ['ArrowRight', 'Right', 'PageDown'],
        HOME: ['Home', 'h'],
        END: ['End', 'e']
    },
    ACCESSIBILITY: {
        FOCUS_CLASS: 'focus-visible',
        LIVE_REGION_ID: 'tabs-live-region'
    }
};

// ===========================================================================
// CACHE DE ELEMENTOS DEL DOM
// ===========================================================================

const DOM = {
    tabButtons: null,
    tabContents: null,
    liveRegion: null,
    contactForm: null
};

// ===========================================================================
// ESTADO DE LA APLICACIÓN
// ===========================================================================

const State = {
    activeTabId: null,
    isAnimating: false,
    tabOrder: []
};

// ===========================================================================
// MÓDULO DE ACCESIBILIDAD
// ===========================================================================

const Accessibility = {
    /**
     * Inicializar región ARIA live para anuncios
     */
    initLiveRegion() {
        let liveRegion = document.getElementById(CONFIG.ACCESSIBILITY.LIVE_REGION_ID);
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = CONFIG.ACCESSIBILITY.LIVE_REGION_ID;
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
        
        DOM.liveRegion = liveRegion;
        return liveRegion;
    },
    
    /**
     * Anunciar cambio de tab para lectores de pantalla
     */
    announceTabChange(tabId, tabName) {
        if (!DOM.liveRegion) this.initLiveRegion();
        
        const message = `Cambiado a la pestaña: ${tabName}. ${this.getTabInstructions()}`;
        DOM.liveRegion.textContent = message;
        
        // Limpiar después de un tiempo para anuncios futuros
        setTimeout(() => {
            DOM.liveRegion.textContent = '';
        }, 3000);
    },
    
    /**
     * Obtener instrucciones de navegación para anuncios
     */
    getTabInstructions() {
        return 'Usa las flechas izquierda y derecha para navegar entre pestañas.';
    },
    
    /**
     * Manejar foco para accesibilidad
     */
    handleFocus(element) {
        element.classList.add(CONFIG.ACCESSIBILITY.FOCUS_CLASS);
    },
    
    /**
     * Manejar blur para accesibilidad
     */
    handleBlur(element) {
        element.classList.remove(CONFIG.ACCESSIBILITY.FOCUS_CLASS);
    },
    
    /**
     * Establecer orden de tabulación
     */
    setTabOrder() {
        const tabbableElements = Array.from(document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.disabled && el.offsetParent !== null);
        
        tabbableElements.forEach((el, index) => {
            el.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });
    }
};

// ===========================================================================
// MÓDULO DE ANIMACIONES
// ===========================================================================

const Animations = {
    /**
     * Animación de fade in para contenido
     */
    fadeIn(element) {
        return new Promise(resolve => {
            if (!element) {
                resolve();
                return;
            }
            
            element.style.opacity = '0';
            element.style.transform = 'translateY(10px)';
            element.hidden = false;
            
            requestAnimationFrame(() => {
                element.style.transition = `opacity ${CONFIG.ANIMATION_DURATION}ms ease, transform ${CONFIG.ANIMATION_DURATION}ms ease`;
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    
                    setTimeout(() => {
                        element.style.transition = '';
                        resolve();
                    }, CONFIG.ANIMATION_DURATION);
                });
            });
        });
    },
    
    /**
     * Animación de fade out para contenido
     */
    fadeOut(element) {
        return new Promise(resolve => {
            if (!element) {
                resolve();
                return;
            }
            
            element.style.transition = `opacity ${CONFIG.ANIMATION_DURATION}ms ease, transform ${CONFIG.ANIMATION_DURATION}ms ease`;
            element.style.opacity = '0';
            element.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                element.hidden = true;
                element.style.transition = '';
                resolve();
            }, CONFIG.ANIMATION_DURATION);
        });
    },
    
    /**
     * Indicador visual de tab activo
     */
    highlightTabButton(button) {
        if (!button) return;
        
        button.style.transform = 'scale(0.98)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
};

// ===========================================================================
// MÓDULO DE TABS
// ===========================================================================

const TabsManager = {
    /**
     * Inicializar sistema de tabs
     */
    async init() {
        this.cacheDOM();
        this.setupTabOrder();
        await this.loadInitialTab();
        this.bindEvents();
        this.setupKeyboardShortcuts();
        
        console.log('✅ Sistema de tabs inicializado correctamente');
        console.log('📋 Atajos de teclado disponibles:');
        console.log('   ← / → : Navegar entre tabs');
        console.log('   Home / End : Ir al primero/último tab');
        console.log('   H / E : Atajos para Home y End');
        console.log('   1-4 : Ir directamente a un tab específico');
    },
    
    /**
     * Cachear elementos DOM frecuentemente usados
     */
    cacheDOM() {
        DOM.tabButtons = document.querySelectorAll('.tab-btn');
        DOM.tabContents = document.querySelectorAll('.tab-content');
        DOM.contactForm = document.querySelector('.contact-form');
        
        State.tabOrder = Array.from(DOM.tabButtons).map(btn => btn.dataset.tab);
    },
    
    /**
     * Establecer orden de tabs para navegación
     */
    setupTabOrder() {
        DOM.tabButtons.forEach((button, index) => {
            button.dataset.tabIndex = index;
        });
    },
    
    /**
     * Cargar tab inicial desde localStorage o por defecto
     */
    async loadInitialTab() {
        const savedTabId = localStorage.getItem(CONFIG.STORAGE_KEY);
        const defaultTabId = 'tab1';
        const targetTabId = this.isValidTab(savedTabId) ? savedTabId : defaultTabId;
        
        await this.switchToTab(targetTabId, false);
    },
    
    /**
     * Verificar si un tab ID es válido
     */
    isValidTab(tabId) {
        return tabId && document.getElementById(tabId) && 
               document.querySelector(`[data-tab="${tabId}"]`);
    },
    
    /**
     * Cambiar a un tab específico
     */
    async switchToTab(targetTabId, animate = true) {
        // Validaciones
        if (!this.isValidTab(targetTabId)) {
            console.warn(`Tab no válido: ${targetTabId}`);
            return;
        }
        
        if (State.isAnimating || State.activeTabId === targetTabId) {
            return;
        }
        
        State.isAnimating = true;
        
        try {
            // Obtener elementos
            const targetButton = document.querySelector(`[data-tab="${targetTabId}"]`);
            const targetContent = document.getElementById(targetTabId);
            const currentContent = document.querySelector('.tab-content:not([hidden])');
            
            // Animar salida si hay contenido actual
            if (animate && currentContent && currentContent !== targetContent) {
                await Animations.fadeOut(currentContent);
            }
            
            // Actualizar UI
            this.updateTabButtons(targetTabId);
            await this.updateTabContent(targetContent, animate);
            
            // Actualizar estado
            State.activeTabId = targetTabId;
            this.saveActiveTab();
            
            // Enfocar el botón del tab activo
            targetButton.focus();
            
            // Anunciar cambio para accesibilidad
            const tabName = targetButton.querySelector('.tab-text')?.textContent || 
                           targetButton.textContent.trim();
            Accessibility.announceTabChange(targetTabId, tabName);
            
            // Efecto visual
            Animations.highlightTabButton(targetButton);
            
        } catch (error) {
            console.error('Error al cambiar de tab:', error);
        } finally {
            State.isAnimating = false;
        }
    },
    
    /**
     * Actualizar botones de tabs
     */
    updateTabButtons(activeTabId) {
        DOM.tabButtons.forEach(button => {
            const isActive = button.dataset.tab === activeTabId;
            
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive.toString());
            button.setAttribute('tabindex', isActive ? '0' : '-1');
            
            // Actualizar atributos ARIA
            if (isActive) {
                button.removeAttribute('hidden');
            }
        });
    },
    
    /**
     * Actualizar contenido del tab
     */
    async updateTabContent(contentElement, animate) {
        if (!contentElement) return;
        
        // Ocultar todos los contenidos primero
        DOM.tabContents.forEach(content => {
            content.classList.remove('active');
            content.hidden = true;
            content.setAttribute('aria-hidden', 'true');
        });
        
        // Mostrar contenido activo
        contentElement.classList.add('active');
        contentElement.setAttribute('aria-hidden', 'false');
        
        if (animate) {
            await Animations.fadeIn(contentElement);
        } else {
            contentElement.hidden = false;
            // Forzar reflow para animaciones futuras
            contentElement.offsetHeight;
        }
        
        // Asegurar que el contenido sea enfocable
        contentElement.setAttribute('tabindex', '0');
    },
    
    /**
     * Guardar tab activo en localStorage
     */
    saveActiveTab() {
        if (!State.activeTabId) return;
        
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, State.activeTabId);
        } catch (error) {
            console.warn('No se pudo guardar en localStorage:', error);
            // Fallback: usar sessionStorage o cookies si es necesario
        }
    },
    
    /**
     * Obtener índice del tab activo
     */
    getActiveTabIndex() {
        const activeButton = document.querySelector('.tab-btn.active');
        return activeButton ? parseInt(activeButton.dataset.tabIndex) : 0;
    },
    
    /**
     * Navegar al tab anterior
     */
    previousTab() {
        const currentIndex = this.getActiveTabIndex();
        const previousIndex = (currentIndex - 1 + DOM.tabButtons.length) % DOM.tabButtons.length;
        const previousTabId = State.tabOrder[previousIndex];
        
        this.switchToTab(previousTabId);
    },
    
    /**
     * Navegar al tab siguiente
     */
    nextTab() {
        const currentIndex = this.getActiveTabIndex();
        const nextIndex = (currentIndex + 1) % DOM.tabButtons.length;
        const nextTabId = State.tabOrder[nextIndex];
        
        this.switchToTab(nextTabId);
    },
    
    /**
     * Ir al primer tab
     */
    firstTab() {
        this.switchToTab(State.tabOrder[0]);
    },
    
    /**
     * Ir al último tab
     */
    lastTab() {
        this.switchToTab(State.tabOrder[State.tabOrder.length - 1]);
    },
    
    /**
     * Ir a un tab por índice numérico
     */
    goToTabByNumber(number) {
        const index = number - 1; // Los tabs comienzan en tab1
        if (index >= 0 && index < State.tabOrder.length) {
            this.switchToTab(State.tabOrder[index]);
        }
    },
    
    /**
     * Vincular eventos
     */
    bindEvents() {
        // Eventos para botones de tabs
        DOM.tabButtons.forEach(button => {
            // Click
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToTab(button.dataset.tab);
            });
            
            // Focus para accesibilidad
            button.addEventListener('focus', () => {
                Accessibility.handleFocus(button);
            });
            
            button.addEventListener('blur', () => {
                Accessibility.handleBlur(button);
            });
            
            // Enter y Space para accesibilidad
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.switchToTab(button.dataset.tab);
                }
            });
        });
        
        // Formulario de contacto
        if (DOM.contactForm) {
            DOM.contactForm.addEventListener('submit', this.handleContactFormSubmit);
        }
    },
    
    /**
     * Configurar atajos de teclado globales
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignorar si estamos en un campo de formulario
            if (this.isFormFieldActive()) return;
            
            // Ignorar si se está presionando Ctrl/Alt/Meta
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            
            const key = e.key;
            
            // Navegación básica
            if (CONFIG.KEYBOARD_SHORTCUTS.PREVIOUS.includes(key)) {
                e.preventDefault();
                this.previousTab();
            } else if (CONFIG.KEYBOARD_SHORTCUTS.NEXT.includes(key)) {
                e.preventDefault();
                this.nextTab();
            } else if (CONFIG.KEYBOARD_SHORTCUTS.HOME.includes(key)) {
                e.preventDefault();
                this.firstTab();
            } else if (CONFIG.KEYBOARD_SHORTCUTS.END.includes(key)) {
                e.preventDefault();
                this.lastTab();
            }
            
            // Atajos numéricos (1-9)
            if (/^[1-9]$/.test(key)) {
                const num = parseInt(key);
                if (num <= State.tabOrder.length) {
                    e.preventDefault();
                    this.goToTabByNumber(num);
                }
            }
        });
    },
    
    /**
     * Verificar si un campo de formulario está activo
     */
    isFormFieldActive() {
        const activeElement = document.activeElement;
        const formFields = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
        
        return formFields.includes(activeElement.tagName) && 
               activeElement.closest('form');
    },
    
    /**
     * Manejar envío del formulario de contacto
     */
    handleContactFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Validación básica
        if (!this.validateContactForm(formData)) {
            return;
        }
        
        // Simular envío
        this.showFormLoading(form);
        
        setTimeout(() => {
            this.showFormSuccess(form);
            form.reset();
            
            // Anunciar éxito para accesibilidad
            if (DOM.liveRegion) {
                DOM.liveRegion.textContent = 'Formulario enviado exitosamente.';
                setTimeout(() => {
                    DOM.liveRegion.textContent = '';
                }, 3000);
            }
        }, 1500);
    },
    
    /**
     * Validar formulario de contacto
     */
    validateContactForm(formData) {
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Limpiar errores previos
        this.clearFormErrors();
        
        let isValid = true;
        
        if (!name || name.trim().length < 2) {
            this.showFormError('name', 'Por favor ingresa tu nombre (mínimo 2 caracteres)');
            isValid = false;
        }
        
        if (!email || !this.isValidEmail(email)) {
            this.showFormError('email', 'Por favor ingresa un email válido');
            isValid = false;
        }
        
        if (!message || message.trim().length < 10) {
            this.showFormError('message', 'El mensaje debe tener al menos 10 caracteres');
            isValid = false;
        }
        
        return isValid;
    },
    
    /**
     * Validar formato de email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    /**
     * Mostrar error en formulario
     */
    showFormError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        const fieldElement = document.getElementById(fieldId);
        if (fieldElement) {
            fieldElement.classList.add('error');
            fieldElement.focus();
        }
    },
    
    /**
     * Limpiar errores del formulario
     */
    clearFormErrors() {
        document.querySelectorAll('.form-error').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        
        document.querySelectorAll('.form-input.error').forEach(el => {
            el.classList.remove('error');
        });
    },
    
    /**
     * Mostrar estado de carga del formulario
     */
    showFormLoading(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            const originalText = submitButton.textContent;
            submitButton.innerHTML = '<span class="loading-spinner"></span> Enviando...';
            submitButton.disabled = true;
            
            // Guardar texto original para restaurar después
            submitButton.dataset.originalText = originalText;
        }
    },
    
    /**
     * Mostrar éxito del formulario
     */
    showFormSuccess(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton && submitButton.dataset.originalText) {
            submitButton.textContent = '✓ Enviado';
            submitButton.disabled = false;
            
            // Restaurar texto original después de 2 segundos
            setTimeout(() => {
                submitButton.textContent = submitButton.dataset.originalText;
                delete submitButton.dataset.originalText;
            }, 2000);
        }
        
        // Mostrar mensaje de éxito
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.setAttribute('role', 'alert');
        successMessage.textContent = '¡Mensaje enviado exitosamente! Te contactaremos pronto.';
        form.insertBefore(successMessage, form.firstChild);
        
        // Remover mensaje después de 5 segundos
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }
};

// ===========================================================================
// INICIALIZACIÓN
// ===========================================================================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar región ARIA live
    Accessibility.initLiveRegion();
    
    // Inicializar sistema de tabs
    TabsManager.init();
    
    // Configurar orden de tabulación para accesibilidad
    Accessibility.setTabOrder();
    
    // Registrar el componente para acceso global (opcional)
    window.tabsSystem = TabsManager;
});

// ===========================================================================
// EXPORTACIÓN PARA MÓDULOS (si se usa ES6 modules)
// ===========================================================================

// Si se usa con type="module", exportar componentes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TabsManager,
        Accessibility,
        Animations,
        CONFIG
    };
}
