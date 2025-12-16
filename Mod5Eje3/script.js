// ===== NAVBAR MODULE =====
const Navbar = (() => {
    // Cache de elementos
    let hamburger, navLinks, navLinksItems;
    
    // Estado
    let isMenuOpen = false;
    
    // Método para inicializar elementos
    const initElements = () => {
        hamburger = document.querySelector('button.hamburger'); // CORRECCIÓN: selector específico
        navLinks = document.querySelector('.nav-links');
        navLinksItems = document.querySelectorAll('.nav-links a');
        
        // Validación
        if (!hamburger || !navLinks) {
            console.error('Elementos del navbar no encontrados');
            return false;
        }
        return true;
    };
    
    // Toggle del menú
    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        
        // Actualizar clases
        hamburger.classList.toggle('active', isMenuOpen);
        navLinks.classList.toggle('active', isMenuOpen);
        
        // Actualizar atributos ARIA
        hamburger.setAttribute('aria-expanded', isMenuOpen);
        
        // Bloquear scroll del body
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        
        // Enfocar primer enlace si se abre
        if (isMenuOpen && navLinksItems.length > 0) {
            setTimeout(() => navLinksItems[0].focus(), 300);
        }
    };
    
    // Cerrar menú
    const closeMenu = () => {
        if (!isMenuOpen) return;
        
        isMenuOpen = false;
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };
    
    // Manejar tecla Escape
    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
            hamburger.focus();
        }
    };
    
    // Manejar clics fuera del menú
    const handleOutsideClick = (e) => {
        if (!isMenuOpen) return;
        
        const isClickInsideMenu = navLinks.contains(e.target);
        const isClickOnHamburger = hamburger.contains(e.target);
        
        if (!isClickInsideMenu && !isClickOnHamburger) {
            closeMenu();
        }
    };
    
    // Manejar resize de ventana
    const handleResize = () => {
        if (window.innerWidth > 768 && isMenuOpen) {
            closeMenu();
        }
    };
    
    // Inicializar event listeners
    const initEventListeners = () => {
        // Toggle menú
        hamburger.addEventListener('click', toggleMenu);
        
        // Cerrar menú al hacer clic en enlaces (solo en móvil)
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    closeMenu();
                }
            });
        });
        
        // Eventos globales
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('click', handleOutsideClick);
        window.addEventListener('resize', handleResize);
    };
    
    // Inicialización
    const init = () => {
        if (!initElements()) return;
        
        console.log('Navbar inicializado');
        initEventListeners();
    };
    
    // API pública
    return {
        init,
        toggleMenu,
        closeMenu,
        getState: () => ({ isMenuOpen })
    };
})();

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    Navbar.init();
});

// ===== POLYFILL PARA classList.toggle =====
// Para soporte en navegadores antiguos
if (!DOMTokenList.prototype.toggle || typeof DOMTokenList.prototype.toggle !== 'function') {
    DOMTokenList.prototype.toggle = function(token, force) {
        if (force !== undefined) {
            if (force) {
                this.add(token);
                return true;
            } else {
                this.remove(token);
                return false;
            }
        }
        
        if (this.contains(token)) {
            this.remove(token);
            return false;
        } else {
            this.add(token);
            return true;
        }
    };
}
