// ===== NAVBAR RESPONSIVE - JAVASCRIPT MEJORADO =====

class ResponsiveNavbar {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.menuOverlay = document.getElementById('menuOverlay');
        this.mobileClose = document.querySelector('.mobile-close');
        this.dropdowns = document.querySelectorAll('.nav-dropdown');
        this.navLinks = document.querySelectorAll('.nav-link, .mobile-link');
        this.themeToggle = document.querySelector('.theme-toggle');
        this.currentStatus = document.getElementById('currentStatus');
        
        this.isMobileMenuOpen = false;
        this.isScrolled = false;
        this.currentTheme = 'auto';
        
        this.init();
    }
    
    init() {
        // Inicializar eventos
        this.bindEvents();
        
        // Inicializar tema
        this.initTheme();
        
        // Actualizar estado inicial
        this.updateStatus();
        
        // Configurar Intersection Observer para animaciones
        this.setupObservers();
        
        console.log('✅ Navbar responsive inicializado');
    }
    
    bindEvents() {
        // Hamburger menu
        this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        this.mobileClose.addEventListener('click', () => this.closeMobileMenu());
        this.menuOverlay.addEventListener('click', () => this.closeMobileMenu());
        
        // Scroll events
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Dropdowns
        this.dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown(dropdown);
            });
            
            // Cerrar dropdown al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    this.closeDropdown(dropdown);
                }
            });
            
            // Navegación por teclado en dropdowns
            menu.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeDropdown(dropdown);
                    toggle.focus();
                }
            });
        });
        
        // Navegación
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
            
            // Navegación por teclado
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleNavClick(e);
                }
            });
        });
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Cerrar menú al redimensionar si se vuelve a desktop
        window.addEventListener('resize', () => this.handleResize());
        
        // Demos interactivas
        document.querySelectorAll('[data-demo]').forEach(button => {
            button.addEventListener('click', (e) => this.handleDemo(e));
        });
        
        // Navegación por teclado global
        document.addEventListener('keydown', (e) => this.handleGlobalKeys(e));
    }
    
    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        
        if (this.isMobileMenuOpen) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
        
        this.updateStatus();
    }
    
    openMobileMenu() {
        this.hamburger.setAttribute('aria-expanded', 'true');
        this.mobileMenu.setAttribute('aria-hidden', 'false');
        this.mobileMenu.hidden = false;
        this.menuOverlay.setAttribute('aria-hidden', 'false');
        this.menuOverlay.hidden = false;
        
        // Bloquear scroll del body
        document.body.style.overflow = 'hidden';
        
        // Enfocar primer elemento del menú móvil
        setTimeout(() => {
            const firstLink = this.mobileMenu.querySelector('.mobile-link');
            if (firstLink) firstLink.focus();
        }, 100);
        
        // Animación de entrada
        this.mobileMenu.style.transform = 'translateX(0)';
    }
    
    closeMobileMenu() {
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.mobileMenu.setAttribute('aria-hidden', 'true');
        this.menuOverlay.setAttribute('aria-hidden', 'true');
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        // Animación de salida
        this.mobileMenu.style.transform = 'translateX(100%)';
        
        // Ocultar después de la animación
        setTimeout(() => {
            this.mobileMenu.hidden = true;
            this.menuOverlay.hidden = true;
        }, 300);
        
        this.isMobileMenuOpen = false;
        this.updateStatus();
    }
    
    toggleDropdown(dropdown) {
        const isExpanded = dropdown.classList.contains('open');
        
        // Cerrar todos los dropdowns primero
        this.dropdowns.forEach(d => this.closeDropdown(d));
        
        if (!isExpanded) {
            this.openDropdown(dropdown);
        }
    }
    
    openDropdown(dropdown) {
        dropdown.classList.add('open');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        toggle.setAttribute('aria-expanded', 'true');
        
        // Enfocar primer elemento del dropdown
        setTimeout(() => {
            const firstItem = dropdown.querySelector('.dropdown-item');
            if (firstItem) firstItem.focus();
        }, 100);
    }
    
    closeDropdown(dropdown) {
        dropdown.classList.remove('open');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        toggle.setAttribute('aria-expanded', 'false');
    }
    
    handleScroll() {
        const scrollPosition = window.scrollY;
        const shouldBeScrolled = scrollPosition > 50;
        
        if (shouldBeScrolled !== this.isScrolled) {
            this.isScrolled = shouldBeScrolled;
            this.navbar.setAttribute('data-scrolled', shouldBeScrolled.toString());
        }
    }
    
    handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        // Si cambia de móvil a desktop, cerrar menú móvil
        if (!isMobile && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        this.updateStatus();
    }
    
    handleNavClick(e) {
        const link = e.currentTarget;
        const page = link.dataset.page;
        
        // Actualizar active state
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Cerrar menú móvil si está abierto
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Simular cambio de página (en un caso real, esto sería una navegación real)
        if (page) {
            this.showPage(page);
        }
        
        // Scroll suave para enlaces internos
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }
    
    showPage(page) {
        console.log(`📄 Navegando a: ${page}`);
        
        // Aquí iría la lógica para cambiar el contenido de la página
        // Por ahora solo mostramos un mensaje en el status
        this.updateStatus(`Página: ${page}`);
        
        // Simular carga de contenido
        setTimeout(() => {
            this.updateStatus();
        }, 1500);
    }
    
    initTheme() {
        // Verificar preferencia guardada
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            // Verificar preferencia del sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
        }
        
        this.applyTheme();
    }
    
    toggleTheme() {
        const themes = ['auto', 'light', 'dark'];
        const currentIndex = themes.indexOf(this.currentTheme);
        this.currentTheme = themes[(currentIndex + 1) % themes.length];
        
        this.applyTheme();
        this.saveTheme();
        this.updateStatus();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Actualizar ícono del tema
        const themeIcons = {
            auto: '🌓',
            light: '☀️',
            dark: '🌙'
        };
        
        this.themeToggle.querySelector('.theme-icon').textContent = themeIcons[this.currentTheme];
    }
    
    saveTheme() {
        localStorage.setItem('theme', this.currentTheme);
    }
    
    handleDemo(e) {
        const demoType = e.currentTarget.dataset.demo;
        
        switch(demoType) {
            case 'resize':
                this.demoResize();
                break;
            case 'keyboard':
                this.demoKeyboard();
                break;
            case 'animations':
                this.demoAnimations();
                break;
        }
    }
    
    demoResize() {
        // Simular cambio a tamaño móvil
        const originalWidth = window.innerWidth;
        const demoWidth = 480;
        
        // Guardar estado original
        const originalStyle = document.body.style.cssText;
        
        // Aplicar estilo de demo
        document.body.style.width = `${demoWidth}px`;
        document.body.style.margin = '0 auto';
        document.body.style.boxShadow = 'var(--shadow-xl)';
        document.body.style.minHeight = '100vh';
        document.body.style.overflowX = 'hidden';
        
        // Actualizar status
        this.updateStatus('Demo: Modo móvil activado');
        
        // Botón para restaurar
        const restoreBtn = document.createElement('button');
        restoreBtn.textContent = 'Restaurar tamaño';
        restoreBtn.className = 'btn btn-primary';
        restoreBtn.style.position = 'fixed';
        restoreBtn.style.top = '80px';
        restoreBtn.style.right = '20px';
        restoreBtn.style.zIndex = '10000';
        
        restoreBtn.onclick = () => {
            document.body.style.cssText = originalStyle;
            restoreBtn.remove();
            this.updateStatus();
        };
        
        document.body.appendChild(restoreBtn);
        
        // Auto-restaurar después de 10 segundos
        setTimeout(() => {
            if (restoreBtn.parentNode) {
                document.body.style.cssText = originalStyle;
                restoreBtn.remove();
                this.updateStatus();
            }
        }, 10000);
    }
    
    demoKeyboard() {
        // Mostrar instrucciones de teclado
        const instructions = `
            <div class="keyboard-instructions">
                <h3>Navegación por Teclado</h3>
                <ul>
                    <li><kbd>Tab</kbd> - Navegar hacia adelante</li>
                    <li><kbd>Shift + Tab</kbd> - Navegar hacia atrás</li>
                    <li><kbd>Enter</kbd> - Activar enlace/botón</li>
                    <li><kbd>Espacio</kbd> - Activar botón</li>
                    <li><kbd>Escape</kbd> - Cerrar menús</li>
                    <li><kbd>Flechas</kbd> - Navegar en menús</li>
                </ul>
                <p>¡Intenta navegar usando solo el teclado!</p>
            </div>
        `;
        
        // Crear overlay de instrucciones
        const overlay = document.createElement('div');
        overlay.className = 'demo-overlay';
        overlay.innerHTML = instructions;
        
        // Estilos
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--color-light);
            padding: var(--space-xl);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-2xl);
            z-index: 10000;
            max-width: 400px;
            width: 90%;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Cerrar';
        closeBtn.className = 'btn btn-primary';
        closeBtn.style.marginTop = 'var(--space-lg)';
        closeBtn.onclick = () => overlay.remove();
        
        overlay.querySelector('.keyboard-instructions').appendChild(closeBtn);
        document.body.appendChild(overlay);
        
        // Enfocar el botón de cerrar
        setTimeout(() => closeBtn.focus(), 100);
        
        // Auto-cerrar después de 15 segundos
        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
        }, 15000);
    }
    
    demoAnimations() {
        // Mostrar todas las animaciones
        this.navbar.style.animation = 'pulse 2s infinite';
        
        // Animación de logo
        const logo = document.querySelector('.logo-icon');
        logo.style.animation = 'float 1s ease-in-out infinite';
        
        // Animación de badges
        const badges = document.querySelectorAll('.nav-badge, .mobile-badge');
        badges.forEach(badge => {
            badge.style.animation = 'badgePulse 0.5s infinite';
        });
        
        // Actualizar status
        this.updateStatus('Demo: Animaciones activadas');
        
        // Restaurar después de 5 segundos
        setTimeout(() => {
            this.navbar.style.animation = '';
            logo.style.animation = 'float 3s ease-in-out infinite';
            badges.forEach(badge => {
                badge.style.animation = 'badgePulse 2s infinite';
            });
            this.updateStatus();
        }, 5000);
    }
    
    handleGlobalKeys(e) {
        // Navegación rápida con teclas de acceso
        if (e.altKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    document.querySelector('[data-page="inicio"]')?.focus();
                    break;
                case '2':
                    e.preventDefault();
                    document.querySelector('[data-page="servicios"]')?.focus();
                    break;
                case '3':
                    e.preventDefault();
                    document.querySelector('[data-page="portafolio"]')?.focus();
                    break;
                case '4':
                    e.preventDefault();
                    document.querySelector('[data-page="contacto"]')?.focus();
                    break;
                case 'm':
                    e.preventDefault();
                    this.toggleMobileMenu();
                    break;
                case 't':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
            }
        }
    }
    
    setupObservers() {
        // Observer para animaciones al scroll
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observar elementos para animaciones
        document.querySelectorAll('.demo-card, .instruction-step').forEach(el => {
            observer.observe(el);
        });
    }
    
    updateStatus(customMessage = null) {
        if (customMessage) {
            this.currentStatus.textContent = customMessage;
            return;
        }
        
        const device = window.innerWidth <= 480 ? 'Mobile' : 
                      window.innerWidth <= 768 ? 'Tablet' : 'Desktop';
        
        const menuStatus = this.isMobileMenuOpen ? 'Sí' : 'No';
        const themeStatus = this.currentTheme === 'auto' ? 'Auto' : 
                          this.currentTheme === 'light' ? 'Claro' : 'Oscuro';
        
        this.currentStatus.innerHTML = `
            <span class="status-device">${device}</span>
            <span class="status-menu">· Menú: ${menuStatus}</span>
            <span class="status-theme">· Tema: ${themeStatus}</span>
        `;
    }
    
    // Métodos públicos para control externo
    openMenu() {
        if (!this.isMobileMenuOpen) {
            this.openMobileMenu();
        }
    }
    
    closeMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }
    
    setTheme(theme) {
        if (['auto', 'light', 'dark'].includes(theme)) {
            this.currentTheme = theme;
            this.applyTheme();
            this.saveTheme();
            this.updateStatus();
        }
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Inicializar navbar
        window.navbar = new ResponsiveNavbar();
        
        // Añadir estilos para animaciones
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
            
            .animate-in {
                animation: slideUp 0.6s ease-out forwards;
                opacity: 0;
            }
            
            @keyframes slideUp {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .demo-card,
            .instruction-step {
                transform: translateY(30px);
            }
            
            kbd {
                background: var(--color-gray-200);
                padding: 2px 6px;
                border-radius: var(--radius-sm);
                font-family: monospace;
                font-size: 0.9em;
                color: var(--color-gray-800);
            }
            
            .keyboard-instructions h3 {
                margin-bottom: var(--space-md);
                color: var(--color-gray-900);
            }
            
            .keyboard-instructions ul {
                list-style: none;
                margin: var(--space-md) 0;
            }
            
            .keyboard-instructions li {
                margin-bottom: var(--space-xs);
                display: flex;
                align-items: center;
                gap: var(--space-sm);
            }
            
            .demo-overlay {
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -40%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
        `;
        document.head.appendChild(style);
        
        console.log('🚀 Aplicación de navbar cargada correctamente');
        
    } catch (error) {
        console.error('❌ Error al inicializar el navbar:', error);
        
        // Fallback básico
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
    }
});

// ===== POLYFILLS PARA COMPATIBILIDAD =====
// IntersectionObserver polyfill para navegadores antiguos
if (!('IntersectionObserver' in window)) {
    const script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
    document.head.appendChild(script);
}

// Closest polyfill para IE
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || 
                                Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        var el = this;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}
