// =====================================
// MÓDULO PRINCIPAL - ANIMATION MANAGER
// =====================================
const AnimationManager = (() => {
    'use strict';
    
    // Configuración global
    const CONFIG = {
        observerThreshold: 0.2,
        observerRootMargin: '0px 0px -100px 0px',
        animationDuration: 800,
        rippleColor: 'rgba(255, 255, 255, 0.5)',
        keyboardSpeed: 300,
        debounceDelay: 100
    };
    
    // Estado de la aplicación
    const state = {
        isAnimating: false,
        lastAnimationTime: 0,
        observer: null,
        rippleElements: new Set(),
        animatedElements: new Set()
    };
    
    // =====================================
    // UTILIDADES
    // =====================================
    const Utils = {
        /**
         * Debounce para optimizar eventos
         */
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
        
        /**
         * Throttle para limitar ejecuciones
         */
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
        
        /**
         * Genera un ID único
         */
        generateId() {
            return 'anim-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        },
        
        /**
         * Verifica si un elemento está en viewport
         */
        isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
                rect.bottom >= 0 &&
                rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
                rect.right >= 0
            );
        },
        
        /**
         * Aplica prefijos de vendor para transform
         */
        applyVendorPrefix(element, property, value) {
            const prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'];
            prefixes.forEach(prefix => {
                element.style[prefix + property] = value;
            });
        }
    };
    
    // =====================================
    // NUEVA FUNCIONALIDAD: CONTROL POR TECLADO
    // =====================================
    const KeyboardController = {
        init() {
            this.setupKeyboardNavigation();
            this.setupAnimationControls();
        },
        
        setupKeyboardNavigation() {
            document.addEventListener('keydown', Utils.throttle((e) => {
                switch(e.key) {
                    case 'ArrowDown':
                    case ' ':
                        e.preventDefault();
                        this.scrollToNextSection();
                        break;
                        
                    case 'ArrowUp':
                        e.preventDefault();
                        this.scrollToPrevSection();
                        break;
                        
                    case 'Home':
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        break;
                        
                    case 'End':
                        window.scrollTo({ 
                            top: document.body.scrollHeight, 
                            behavior: 'smooth' 
                        });
                        break;
                }
            }, CONFIG.keyboardSpeed));
        },
        
        setupAnimationControls() {
            document.addEventListener('keydown', (e) => {
                // Ctrl + A: Activar/desactivar animaciones
                if (e.ctrlKey && e.key === 'a') {
                    e.preventDefault();
                    this.toggleAnimations();
                }
                
                // Ctrl + R: Replay animaciones visibles
                if (e.ctrlKey && e.key === 'r') {
                    e.preventDefault();
                    this.replayVisibleAnimations();
                }
            });
        },
        
        scrollToNextSection() {
            const sections = Array.from(document.querySelectorAll('.section'));
            const currentScroll = window.scrollY + 100;
            
            for (const section of sections) {
                if (section.offsetTop > currentScroll) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    this.highlightSection(section);
                    break;
                }
            }
        },
        
        scrollToPrevSection() {
            const sections = Array.from(document.querySelectorAll('.section')).reverse();
            const currentScroll = window.scrollY - 100;
            
            for (const section of sections) {
                if (section.offsetTop < currentScroll) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    this.highlightSection(section);
                    break;
                }
            }
        },
        
        highlightSection(section) {
            section.style.outline = '2px solid var(--primary-color)';
            section.style.outlineOffset = '10px';
            setTimeout(() => {
                section.style.outline = '';
                section.style.outlineOffset = '';
            }, 1000);
        },
        
        toggleAnimations() {
            const html = document.documentElement;
            const isPaused = html.style.animationPlayState === 'paused';
            
            html.style.animationPlayState = isPaused ? 'running' : 'paused';
            html.style.transition = 'all 0.3s ease';
            
            // Mostrar notificación
            this.showNotification(
                isPaused ? 'Animaciones activadas' : 'Animaciones pausadas',
                isPaused ? 'success' : 'warning'
            );
        },
        
        replayVisibleAnimations() {
            document.querySelectorAll('.animate-on-scroll.visible').forEach(el => {
                el.classList.remove('visible');
                void el.offsetWidth; // Trigger reflow
                setTimeout(() => el.classList.add('visible'), 50);
            });
            
            this.showNotification('Animaciones reiniciadas', 'info');
        },
        
        showNotification(message, type = 'info') {
            // Remover notificación existente
            const existing = document.querySelector('.keyboard-notification');
            if (existing) existing.remove();
            
            // Crear nueva notificación
            const notification = document.createElement('div');
            notification.className = `keyboard-notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#4CAF50' : 
                           type === 'warning' ? '#FF9800' : '#2196F3'};
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            
            document.body.appendChild(notification);
            
            // Auto-remover después de 3 segundos
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    };
    
    // =====================================
    // OBSERVER MEJORADO
    // =====================================
    const ScrollObserver = {
        init() {
            if (state.observer) return;
            
            state.observer = new IntersectionObserver(
                Utils.throttle(this.handleIntersection.bind(this), 50),
                {
                    threshold: CONFIG.observerThreshold,
                    rootMargin: CONFIG.observerRootMargin
                }
            );
            
            this.observeElements();
            this.setupScrollProgress();
        },
        
        handleIntersection(entries) {
            const now = Date.now();
            if (now - state.lastAnimationTime < 100) return;
            
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                } else if (entry.target.classList.contains('animate-on-scroll')) {
                    // Opcional: remover clase visible al salir del viewport
                    // entry.target.classList.remove('visible');
                }
            });
            
            state.lastAnimationTime = now;
        },
        
        animateElement(element) {
            if (state.animatedElements.has(element)) return;
            
            element.classList.add('visible');
            state.animatedElements.add(element);
            
            // Añadir ID único para tracking
            if (!element.id) {
                element.id = Utils.generateId();
            }
            
            // Disparar evento personalizado
            element.dispatchEvent(new CustomEvent('animationTriggered', {
                detail: { 
                    element,
                    timestamp: Date.now(),
                    type: element.className.match(/slide|fade|zoom/)?.[0] || 'scroll'
                }
            }));
        },
        
        observeElements() {
            try {
                document.querySelectorAll('.animate-on-scroll').forEach(el => {
                    state.observer.observe(el);
                });
            } catch (error) {
                console.error('Error observando elementos:', error);
            }
        },
        
        setupScrollProgress() {
            const progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
                width: 0%;
                z-index: 9999;
                transition: width 0.1s ease;
            `;
            
            document.body.appendChild(progressBar);
            
            window.addEventListener('scroll', Utils.debounce(() => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                progressBar.style.width = scrolled + "%";
            }, CONFIG.debounceDelay));
        }
    };
    
    // =====================================
    // RIPPLE EFFECT MEJORADO
    // =====================================
    const RippleEffect = {
        init() {
            this.setupEventDelegation();
            this.setupRippleStyles();
        },
        
        setupEventDelegation() {
            // Usar event delegation para mejor performance
            document.addEventListener('click', (e) => {
                const rippleBtn = e.target.closest('.btn-ripple');
                if (rippleBtn) {
                    this.createRipple(e, rippleBtn);
                }
            });
        },
        
        setupRippleStyles() {
            if (document.getElementById('ripple-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                .ripple-effect {
                    position: absolute;
                    border-radius: 50%;
                    background: ${CONFIG.rippleColor};
                    transform: scale(0);
                    animation: ripple-animation 0.6s linear;
                    pointer-events: none;
                }
                
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                
                .btn-ripple {
                    overflow: hidden;
                    position: relative;
                }
            `;
            
            document.head.appendChild(style);
        },
        
        createRipple(event, button) {
            if (state.rippleElements.size > 5) {
                // Limitar número de ripples simultáneos
                const firstRipple = state.rippleElements.values().next().value;
                if (firstRipple && firstRipple.parentNode === button) {
                    firstRipple.remove();
                    state.rippleElements.delete(firstRipple);
                }
            }
            
            const circle = document.createElement('span');
            circle.className = 'ripple-effect';
            
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            circle.style.width = circle.style.height = `${size}px`;
            circle.style.left = `${x}px`;
            circle.style.top = `${y}px`;
            
            button.appendChild(circle);
            state.rippleElements.add(circle);
            
            // Remover después de la animación
            setTimeout(() => {
                if (circle.parentNode) {
                    circle.remove();
                }
                state.rippleElements.delete(circle);
            }, 600);
            
            // Disparar evento personalizado
            button.dispatchEvent(new CustomEvent('rippleCreated', {
                detail: {
                    x: event.clientX,
                    y: event.clientY,
                    timestamp: Date.now()
                }
            }));
        }
    };
    
    // =====================================
    // ANIMACIONES DE CARDS MEJORADAS
    // =====================================
    const CardAnimations = {
        init() {
            this.setupCardInteractions();
            this.setupMorphingCards();
        },
        
        setupCardInteractions() {
            const cards = document.querySelectorAll('.card');
            
            cards.forEach(card => {
                // Hover con debounce para evitar flickering
                card.addEventListener('mouseenter', Utils.debounce(() => {
                    this.enhanceCard(card);
                }, 50));
                
                card.addEventListener('mouseleave', Utils.debounce(() => {
                    this.resetCard(card);
                }, 100));
                
                // Click para expandir
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('a, button')) {
                        this.toggleCardExpand(card);
                    }
                });
                
                // Keyboard navigation
                card.setAttribute('tabindex', '0');
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleCardExpand(card);
                    }
                });
            });
        },
        
        enhanceCard(card) {
            Utils.applyVendorPrefix(card, 'transform', 'translateY(-10px) scale(1.02)');
            card.style.zIndex = '10';
            
            // Añadir efecto de sombra dinámica
            card.style.boxShadow = `
                0 20px 40px rgba(0, 0, 0, 0.3),
                0 0 0 1px rgba(102, 126, 234, 0.3),
                0 0 30px rgba(102, 126, 234, 0.2)
            `;
        },
        
        resetCard(card) {
            Utils.applyVendorPrefix(card, 'transform', 'translateY(0) scale(1)');
            card.style.zIndex = '';
            card.style.boxShadow = '';
        },
        
        toggleCardExpand(card) {
            const isExpanded = card.classList.toggle('expanded');
            
            if (isExpanded) {
                card.style.zIndex = '100';
                card.style.transform = 'scale(1.1)';
                card.setAttribute('aria-expanded', 'true');
                
                // Asegurar que esté en viewport
                card.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center' 
                });
            } else {
                card.style.transform = '';
                card.style.zIndex = '';
                card.setAttribute('aria-expanded', 'false');
            }
        },
        
        setupMorphingCards() {
            const morphCards = document.querySelectorAll('.card-morph');
            
            morphCards.forEach(card => {
                const shape = card.querySelector('.morph-shape');
                if (!shape) return;
                
                // Añadir interactividad al morphing
                card.addEventListener('mouseenter', () => {
                    shape.style.animationDuration = '4s';
                    shape.style.filter = 'blur(5px) brightness(1.2)';
                });
                
                card.addEventListener('mouseleave', () => {
                    shape.style.animationDuration = '8s';
                    shape.style.filter = 'blur(10px)';
                });
            });
        }
    };
    
    // =====================================
    // INICIALIZACIÓN Y API PÚBLICA
    // =====================================
    const init = () => {
        try {
            // Verificar soporte de APIs necesarias
            if (!('IntersectionObserver' in window)) {
                console.warn('IntersectionObserver no soportado, usando fallback');
                this.setupFallbackAnimations();
                return;
            }
            
            // Inicializar módulos
            ScrollObserver.init();
            RippleEffect.init();
            CardAnimations.init();
            KeyboardController.init();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            // Disparar evento de inicialización
            document.dispatchEvent(new CustomEvent('animationManagerReady', {
                detail: { timestamp: Date.now(), modules: ['observer', 'ripple', 'cards', 'keyboard'] }
            }));
            
            console.log('Animation Manager inicializado correctamente');
            
        } catch (error) {
            console.error('Error inicializando Animation Manager:', error);
            this.setupFallbackAnimations();
        }
    };
    
    const setupGlobalEvents = () => {
        // Recargar observador cuando se añaden elementos dinámicamente
        const mutationObserver = new MutationObserver(Utils.debounce(() => {
            ScrollObserver.observeElements();
        }, 500));
        
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Performance optimization: Pausar animaciones cuando no está visible
        document.addEventListener('visibilitychange', () => {
            const html = document.documentElement;
            if (document.hidden) {
                html.style.animationPlayState = 'paused';
            } else {
                html.style.animationPlayState = 'running';
            }
        });
    };
    
    const setupFallbackAnimations = () => {
        // Fallback para navegadores sin IntersectionObserver
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            if (Utils.isInViewport(el)) {
                el.classList.add('visible');
            }
        });
        
        window.addEventListener('scroll', Utils.debounce(() => {
            document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(el => {
                if (Utils.isInViewport(el)) {
                    el.classList.add('visible');
                }
            });
        }, 100));
    };
    
    // API pública
    return {
        init,
        getState: () => ({ ...state }),
        replayAnimations: KeyboardController.replayVisibleAnimations.bind(KeyboardController),
        toggleAnimations: KeyboardController.toggleAnimations.bind(KeyboardController),
        addElementToObserver: (element) => {
            if (state.observer && element) {
                state.observer.observe(element);
            }
        },
        removeElementFromObserver: (element) => {
            if (state.observer && element) {
                state.observer.unobserve(element);
            }
        }
    };
})();

// =====================================
// INICIALIZACIÓN AL CARGAR EL DOCUMENTO
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar con retardo para priorizar renderizado crítico
    setTimeout(() => {
        AnimationManager.init();
    }, 100);
    
    // Añadir estilos CSS para las notificaciones del teclado
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .skip-link:focus {
            top: 10px;
        }
    `;
    document.head.appendChild(style);
});

// =====================================
// HANDLER DE ERRORES GLOBAL
// =====================================
window.addEventListener('error', (event) => {
    console.error('Error capturado:', event.error);
    // Podrías enviar esto a un servicio de logging aquí
});

// =====================================
// EXPORT PARA USO COMO MÓDULO (OPCIONAL)
// =====================================
// Si estás usando módulos ES6, descomenta:
// export { AnimationManager };
