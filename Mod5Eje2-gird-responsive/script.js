// ===========================================
// CONFIGURACIÓN Y CONSTANTES
// ===========================================

const CONFIG = {
    gallery: {
        minColumns: 1,
        maxColumns: 4,
        defaultColumns: 'auto',
        animationDuration: 300,
        shuffleDuration: 500
    },
    modal: {
        animationDuration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    filters: {
        animationDuration: 400
    }
};

// ===========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ===========================================

const AppState = {
    currentView: 'grid',
    currentColumns: CONFIG.gallery.defaultColumns,
    activeFilter: 'all',
    likedImages: new Set(),
    currentModalImage: null,
    isShuffling: false
};

// ===========================================
// SELECTORES DEL DOM
// ===========================================

const DOM = {
    // Contenedores principales
    galleryContainer: document.querySelector('.gallery-container'),
    modal: document.querySelector('.modal'),
    
    // Controles
    viewButtons: document.querySelectorAll('[data-view]'),
    columnButtons: document.querySelectorAll('[data-columns]'),
    filterButtons: document.querySelectorAll('[data-filter]'),
    shuffleButton: document.querySelector('.shuffle-btn'),
    
    // Elementos de galería
    galleryItems: document.querySelectorAll('.gallery-item'),
    likeButtons: document.querySelectorAll('.like-btn'),
    zoomButtons: document.querySelectorAll('.zoom-btn'),
    
    // Modal
    modalClose: document.querySelector('.modal-close'),
    modalImage: document.querySelector('.modal-image'),
    modalTitle: document.querySelector('.modal-title'),
    modalDescription: document.querySelector('.modal-description'),
    modalMeta: document.querySelector('.modal-meta'),
    
    // Footer
    footerButtons: document.querySelectorAll('.footer-btn'),
    currentYear: document.getElementById('currentYear'),
    imageCount: document.getElementById('image-count'),
    
    // Otros
    headerStats: document.querySelector('.header-stats')
};

// ===========================================
// UTILIDADES
// ===========================================

const Utils = {
    /**
     * Debounce para optimizar eventos frecuentes
     */
    debounce: (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    /**
     * Genera un número aleatorio entre min y max
     */
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    /**
     * Shuffle array usando algoritmo Fisher-Yates
     */
    shuffleArray: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Animación de fade in
     */
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.transition = `opacity ${duration}ms`;
            element.style.opacity = '1';
        }, 10);
    },

    /**
     * Animación de fade out
     */
    fadeOut: (element, duration = 300) => {
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    },

    /**
     * Obtiene la categoría de un elemento
     */
    getImageCategory: (element) => {
        return element.getAttribute('data-category') || 'all';
    },

    /**
     * Formatea número con separador de miles
     */
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
};

// ===========================================
// SISTEMA DE GESTIÓN DE VISTA
// ===========================================

const ViewManager = {
    /**
     * Inicializa los controles de vista
     */
    init: () => {
        DOM.viewButtons.forEach(button => {
            button.addEventListener('click', ViewManager.handleViewChange);
        });
    },

    /**
     * Maneja el cambio de vista
     */
    handleViewChange: (event) => {
        const button = event.currentTarget;
        const viewType = button.getAttribute('data-view');
        
        // Actualizar estado
        AppState.currentView = viewType;
        
        // Actualizar UI
        ViewManager.updateViewButtons(button);
        
        // Aplicar cambios
        ViewManager.applyView(viewType);
    },

    /**
     * Actualiza los botones de vista activos
     */
    updateViewButtons: (activeButton) => {
        DOM.viewButtons.forEach(button => {
            const isActive = button === activeButton;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive);
        });
    },

    /**
     * Aplica la vista seleccionada
     */
    applyView: (viewType) => {
        const gallery = DOM.galleryContainer;
        
        // Remover clases anteriores
        gallery.classList.remove('grid-view', 'masonry-view');
        
        // Añadir nueva clase
        gallery.classList.add(`${viewType}-view`);
        
        // Disparar evento personalizado
        gallery.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { view: viewType }
        }));
    }
};

// ===========================================
// SISTEMA DE GESTIÓN DE COLUMNAS
// ===========================================

const ColumnManager = {
    /**
     * Inicializa los controles de columnas
     */
    init: () => {
        DOM.columnButtons.forEach(button => {
            button.addEventListener('click', ColumnManager.handleColumnChange);
        });
    },

    /**
     * Maneja el cambio de columnas
     */
    handleColumnChange: (event) => {
        const button = event.currentTarget;
        const columns = button.getAttribute('data-columns');
        
        // Actualizar estado
        AppState.currentColumns = columns;
        
        // Actualizar UI
        ColumnManager.updateColumnButtons(button);
        
        // Aplicar cambios
        ColumnManager.applyColumns(columns);
    },

    /**
     * Actualiza los botones de columnas activos
     */
    updateColumnButtons: (activeButton) => {
        DOM.columnButtons.forEach(button => {
            const isActive = button === activeButton;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive);
        });
    },

    /**
     * Aplica el número de columnas seleccionado
     */
    applyColumns: (columns) => {
        const gallery = DOM.galleryContainer;
        
        if (columns === 'auto') {
            // Usar auto-fit
            gallery.style.gridTemplateColumns = '';
            gallery.removeAttribute('data-columns');
        } else {
            // Usar número fijo
            gallery.style.gridTemplateColumns = `repeat(${columns}, minmax(250px, 1fr))`;
            gallery.setAttribute('data-columns', columns);
        }
        
        // Actualizar estadísticas
        ColumnManager.updateColumnStats(columns);
        
        // Disparar evento personalizado
        gallery.dispatchEvent(new CustomEvent('columnsChanged', {
            detail: { columns }
        }));
    },

    /**
     * Actualiza las estadísticas de columnas
     */
    updateColumnStats: (columns) => {
        const columnStat = DOM.headerStats?.querySelector('.stat:last-child .stat-number');
        if (columnStat) {
            columnStat.textContent = columns === 'auto' ? 'auto' : columns;
        }
    }
};

// ===========================================
// SISTEMA DE FILTRADO
// ===========================================

const FilterManager = {
    /**
     * Inicializa los filtros
     */
    init: () => {
        DOM.filterButtons.forEach(button => {
            button.addEventListener('click', FilterManager.handleFilterChange);
        });
    },

    /**
     * Maneja el cambio de filtro
     */
    handleFilterChange: (event) => {
        const button = event.currentTarget;
        const filter = button.getAttribute('data-filter');
        
        // Actualizar estado
        AppState.activeFilter = filter;
        
        // Actualizar UI
        FilterManager.updateFilterButtons(button);
        
        // Aplicar filtro
        FilterManager.applyFilter(filter);
    },

    /**
     * Actualiza los botones de filtro activos
     */
    updateFilterButtons: (activeButton) => {
        DOM.filterButtons.forEach(button => {
            const isActive = button === activeButton;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-label', 
                isActive ? `Filtro activo: ${button.textContent}` : `Aplicar filtro: ${button.textContent}`
            );
        });
    },

    /**
     * Aplica el filtro seleccionado
     */
    applyFilter: (filter) => {
        const items = DOM.galleryItems;
        
        items.forEach(item => {
            const categories = item.getAttribute('data-category');
            const isVisible = filter === 'all' || categories.includes(filter);
            
            // Animación de transición
            if (!isVisible) {
                item.classList.add('filtered-out');
                item.classList.remove('filtered-in');
            } else {
                item.classList.remove('filtered-out');
                item.classList.add('filtered-in');
            }
            
            // Actualizar accesibilidad
            item.setAttribute('aria-hidden', !isVisible);
        });
        
        // Actualizar contador
        FilterManager.updateFilterStats(filter);
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('filterChanged', {
            detail: { filter }
        }));
    },

    /**
     * Actualiza las estadísticas del filtro
     */
    updateFilterStats: (filter) => {
        const visibleItems = filter === 'all' 
            ? DOM.galleryItems.length 
            : Array.from(DOM.galleryItems).filter(item => {
                const categories = item.getAttribute('data-category');
                return categories.includes(filter);
            }).length;
        
        // Actualizar contador en el header
        if (DOM.imageCount) {
            DOM.imageCount.textContent = visibleItems;
        }
        
        // Actualizar contadores en sidebar
        FilterManager.updateCategoryCounts();
    },

    /**
     * Actualiza los contadores de categorías
     */
    updateCategoryCounts: () => {
        const categories = ['nature', 'urban', 'water', 'tech'];
        
        categories.forEach(category => {
            const count = Array.from(DOM.galleryItems).filter(item => {
                const categories = item.getAttribute('data-category');
                return categories.includes(category);
            }).length;
            
            const countElement = document.querySelector(`.category[data-category="${category}"] .category-count`);
            if (countElement) {
                countElement.textContent = `${count} imagen${count !== 1 ? 'es' : ''}`;
            }
        });
    }
};

// ===========================================
// SISTEMA DE SHUFFLE (ALEATORIZAR)
// ===========================================

const ShuffleManager = {
    /**
     * Inicializa el botón de shuffle
     */
    init: () => {
        if (DOM.shuffleButton) {
            DOM.shuffleButton.addEventListener('click', ShuffleManager.handleShuffle);
        }
    },

    /**
     * Maneja el shuffle de imágenes
     */
    handleShuffle: () => {
        if (AppState.isShuffling) return;
        
        AppState.isShuffling = true;
        const gallery = DOM.galleryContainer;
        const items = Array.from(DOM.galleryItems);
        
        // Añadir clase de animación
        gallery.classList.add('shuffling');
        
        // Animación de shuffle
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 50}ms`;
        });
        
        // Mezclar y reordenar
        setTimeout(() => {
            const shuffledItems = Utils.shuffleArray(items);
            
            // Reordenar en el DOM
            shuffledItems.forEach(item => {
                gallery.appendChild(item);
            });
            
            // Remover clase de animación
            setTimeout(() => {
                gallery.classList.remove('shuffling');
                AppState.isShuffling = false;
                
                // Disparar evento personalizado
                gallery.dispatchEvent(new CustomEvent('shuffled'));
            }, CONFIG.gallery.shuffleDuration);
            
        }, CONFIG.gallery.shuffleDuration / 2);
    }
};

// ===========================================
// SISTEMA DE LIKES
// ===========================================

const LikeManager = {
    /**
     * Inicializa los botones de like
     */
    init: () => {
        DOM.likeButtons.forEach(button => {
            button.addEventListener('click', LikeManager.handleLike);
        });
        
        // Cargar likes del localStorage
        LikeManager.loadLikes();
    },

    /**
     * Maneja el like de una imagen
     */
    handleLike: (event) => {
        event.stopPropagation();
        const button = event.currentTarget;
        const item = button.closest('.gallery-item');
        const imageId = item.getAttribute('data-id') || item.querySelector('img').src;
        
        // Alternar like
        if (AppState.likedImages.has(imageId)) {
            LikeManager.unlikeImage(button, imageId);
        } else {
            LikeManager.likeImage(button, imageId);
        }
    },

    /**
     * Da like a una imagen
     */
    likeImage: (button, imageId) => {
        AppState.likedImages.add(imageId);
        
        // Actualizar UI
        button.classList.add('liked');
        button.innerHTML = '<span class="action-icon" aria-hidden="true">❤️</span><span class="action-count">' + 
                          (parseInt(button.querySelector('.action-count').textContent) + 1) + '</span>';
        
        // Guardar en localStorage
        LikeManager.saveLikes();
        
        // Disparar evento personalizado
        button.dispatchEvent(new CustomEvent('imageLiked', {
            detail: { imageId }
        }));
    },

    /**
     * Quita like a una imagen
     */
    unlikeImage: (button, imageId) => {
        AppState.likedImages.delete(imageId);
        
        // Actualizar UI
        button.classList.remove('liked');
        button.innerHTML = '<span class="action-icon" aria-hidden="true">🤍</span><span class="action-count">' + 
                          (parseInt(button.querySelector('.action-count').textContent) - 1) + '</span>';
        
        // Guardar en localStorage
        LikeManager.saveLikes();
        
        // Disparar evento personalizado
        button.dispatchEvent(new CustomEvent('imageUnliked', {
            detail: { imageId }
        }));
    },

    /**
     * Guarda los likes en localStorage
     */
    saveLikes: () => {
        try {
            const likesArray = Array.from(AppState.likedImages);
            localStorage.setItem('galleryLikes', JSON.stringify(likesArray));
        } catch (error) {
            console.error('Error al guardar likes:', error);
        }
    },

    /**
     * Carga los likes desde localStorage
     */
    loadLikes: () => {
        try {
            const savedLikes = localStorage.getItem('galleryLikes');
            if (savedLikes) {
                const likesArray = JSON.parse(savedLikes);
                AppState.likedImages = new Set(likesArray);
                
                // Actualizar UI con los likes cargados
                LikeManager.updateLikesUI();
            }
        } catch (error) {
            console.error('Error al cargar likes:', error);
        }
    },

    /**
     * Actualiza la UI con los likes cargados
     */
    updateLikesUI: () => {
        DOM.galleryItems.forEach(item => {
            const imageId = item.getAttribute('data-id') || item.querySelector('img').src;
            const likeButton = item.querySelector('.like-btn');
            
            if (AppState.likedImages.has(imageId) && likeButton) {
                likeButton.classList.add('liked');
                likeButton.innerHTML = '<span class="action-icon" aria-hidden="true">❤️</span><span class="action-count">' + 
                                      (parseInt(likeButton.querySelector('.action-count').textContent) + 1) + '</span>';
            }
        });
    }
};

// ===========================================
// SISTEMA DE MODAL (ZOOM)
// ===========================================

const ModalManager = {
    /**
     * Inicializa el sistema de modal
     */
    init: () => {
        // Botones de zoom
        DOM.zoomButtons.forEach(button => {
            button.addEventListener('click', ModalManager.handleZoom);
        });
        
        // Cerrar modal
        DOM.modalClose.addEventListener('click', ModalManager.closeModal);
        
        // Cerrar con Escape
        document.addEventListener('keydown', ModalManager.handleKeydown);
        
        // Cerrar haciendo clic fuera
        DOM.modal.addEventListener('click', ModalManager.handleOutsideClick);
    },

    /**
     * Maneja el zoom de una imagen
     */
    handleZoom: (event) => {
        event.stopPropagation();
        const button = event.currentTarget;
        const item = button.closest('.gallery-item');
        
        ModalManager.openModal(item);
    },

    /**
     * Abre el modal con la imagen
     */
    openModal: (item) => {
        const image = item.querySelector('.gallery-image');
        const title = item.querySelector('.image-title');
        const description = item.querySelector('.image-description');
        const meta = item.querySelector('.image-meta');
        
        // Guardar imagen actual
        AppState.currentModalImage = item;
        
        // Configurar modal
        DOM.modalImage.src = image.src;
        DOM.modalImage.alt = image.alt;
        DOM.modalTitle.textContent = title?.textContent || '';
        DOM.modalDescription.textContent = description?.textContent || '';
        DOM.modalMeta.innerHTML = meta?.innerHTML || '';
        
        // Mostrar modal
        DOM.modal.removeAttribute('hidden');
        DOM.modal.classList.add('active');
        
        // Añadir clase al body para evitar scroll
        document.body.style.overflow = 'hidden';
        
        // Enfocar el botón de cerrar para accesibilidad
        setTimeout(() => {
            DOM.modalClose.focus();
        }, 100);
        
        // Disparar evento personalizado
        DOM.modal.dispatchEvent(new CustomEvent('modalOpened', {
            detail: { image: image.src }
        }));
    },

    /**
     * Cierra el modal
     */
    closeModal: () => {
        DOM.modal.classList.remove('active');
        
        setTimeout(() => {
            DOM.modal.setAttribute('hidden', 'true');
            document.body.style.overflow = '';
            
            // Disparar evento personalizado
            DOM.modal.dispatchEvent(new CustomEvent('modalClosed'));
        }, CONFIG.modal.animationDuration);
    },

    /**
     * Maneja teclas del teclado
     */
    handleKeydown: (event) => {
        if (event.key === 'Escape' && DOM.modal.classList.contains('active')) {
            ModalManager.closeModal();
        }
        
        // Navegación entre imágenes con flechas
        if (DOM.modal.classList.contains('active')) {
            if (event.key === 'ArrowRight') {
                ModalManager.navigateModal(1);
            } else if (event.key === 'ArrowLeft') {
                ModalManager.navigateModal(-1);
            }
        }
    },

    /**
     * Maneja clic fuera del modal
     */
    handleOutsideClick: (event) => {
        if (event.target === DOM.modal) {
            ModalManager.closeModal();
        }
    },

    /**
     * Navega entre imágenes en el modal
     */
    navigateModal: (direction) => {
        const items = Array.from(DOM.galleryItems).filter(item => {
            const categories = item.getAttribute('data-category');
            return AppState.activeFilter === 'all' || categories.includes(AppState.activeFilter);
        });
        
        const currentIndex = items.findIndex(item => item === AppState.currentModalImage);
        const nextIndex = (currentIndex + direction + items.length) % items.length;
        
        ModalManager.openModal(items[nextIndex]);
    }
};

// ===========================================
// SISTEMA DE FOOTER
// ===========================================

const FooterManager = {
    /**
     * Inicializa los botones del footer
     */
    init: () => {
        DOM.footerButtons.forEach(button => {
            const action = button.querySelector('.btn-text').textContent.toLowerCase();
            button.addEventListener('click', () => FooterManager.handleAction(action));
        });
        
        // Actualizar año actual
        FooterManager.updateCurrentYear();
    },

    /**
     * Maneja las acciones del footer
     */
    handleAction: (action) => {
        switch (action) {
            case 'recargar':
                FooterManager.reloadGallery();
                break;
            case 'código':
                FooterManager.downloadCode();
                break;
            case 'compartir':
                FooterManager.shareGallery();
                break;
        }
    },

    /**
     * Recarga la galería
     */
    reloadGallery: () => {
        // Animación de recarga
        DOM.galleryContainer.classList.add('loading');
        
        setTimeout(() => {
            // Resetear filtros
            FilterManager.applyFilter('all');
            FilterManager.updateFilterButtons(DOM.filterButtons[0]);
            
            // Resetear vista
            ColumnManager.applyColumns(CONFIG.gallery.defaultColumns);
            ColumnManager.updateColumnButtons(
                document.querySelector(`[data-columns="${CONFIG.gallery.defaultColumns}"]`)
            );
            
            // Remover clase de carga
            setTimeout(() => {
                DOM.galleryContainer.classList.remove('loading');
            }, 500);
            
            // Disparar evento personalizado
            document.dispatchEvent(new CustomEvent('galleryReloaded'));
        }, 1000);
    },

    /**
     * Descarga el código fuente
     */
    downloadCode: () => {
        const code = `
/* Código fuente de la Galería Responsive */
/* HTML, CSS y JavaScript completos */

// Para obtener el código completo visita:
// ${window.location.href}
        `;
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = 'galeria-responsive-codigo.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Comparte la galería
     */
    shareGallery: () => {
        if (navigator.share) {
            navigator.share({
                title: 'Galería Responsive - CSS Grid Auto-fit',
                text: 'Mira esta increíble galería responsive con CSS Grid auto-fit y minmax()',
                url: window.location.href
            });
        } else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    alert('¡Enlace copiado al portapapeles!');
                })
                .catch(err => {
                    console.error('Error al copiar:', err);
                });
        }
    },

    /**
     * Actualiza el año actual en el footer
     */
    updateCurrentYear: () => {
        if (DOM.currentYear) {
            DOM.currentYear.textContent = new Date().getFullYear();
        }
    }
};

// ===========================================
// SISTEMA DE EVENTOS PERSONALIZADOS
// ===========================================

const EventManager = {
    /**
     * Configura todos los eventos personalizados
     */
    init: () => {
        // Vista cambiada
        DOM.galleryContainer.addEventListener('viewChanged', (event) => {
            console.log('Vista cambiada a:', event.detail.view);
        });

        // Columnas cambiadas
        DOM.galleryContainer.addEventListener('columnsChanged', (event) => {
            console.log('Columnas cambiadas a:', event.detail.columns);
        });

        // Filtro cambiado
        document.addEventListener('filterChanged', (event) => {
            console.log('Filtro cambiado a:', event.detail.filter);
        });

        // Galería mezclada
        DOM.galleryContainer.addEventListener('shuffled', () => {
            console.log('Galería mezclada');
        });

        // Modal abierto/cerrado
        DOM.modal.addEventListener('modalOpened', (event) => {
            console.log('Modal abierto para imagen:', event.detail.image);
        });

        DOM.modal.addEventListener('modalClosed', () => {
            console.log('Modal cerrado');
        });

        // Imagen likeada/unlikeada
        document.addEventListener('imageLiked', (event) => {
            console.log('Imagen likeada:', event.detail.imageId);
        });

        document.addEventListener('imageUnliked', (event) => {
            console.log('Imagen unlikeada:', event.detail.imageId);
        });

        // Galería recargada
        document.addEventListener('galleryReloaded', () => {
            console.log('Galería recargada');
        });
    }
};

// ===========================================
// SISTEMA DE RESPONSIVE DINÁMICO
// ===========================================

const ResponsiveManager = {
    /**
     * Inicializa el sistema responsive
     */
    init: () => {
        // Ajustar columnas basado en el tamaño de pantalla
        ResponsiveManager.handleResize();
        
        // Escuchar cambios de tamaño
        window.addEventListener('resize', 
            Utils.debounce(ResponsiveManager.handleResize, 250)
        );
    },

    /**
     * Maneja el cambio de tamaño de pantalla
     */
    handleResize: () => {
        const width = window.innerWidth;
        
        // Solo ajustar si estamos en modo auto
        if (AppState.currentColumns === 'auto') {
            if (width < 480) {
                // 1 columna en móviles pequeños
                DOM.galleryContainer.style.gridTemplateColumns = '1fr';
            } else if (width < 768) {
                // 2 columnas en tablets pequeñas
                DOM.galleryContainer.style.gridTemplateColumns = 'repeat(2, minmax(200px, 1fr))';
            } else if (width < 1024) {
                // auto-fit normal
                DOM.galleryContainer.style.gridTemplateColumns = '';
            }
        }
        
        // Actualizar estadísticas responsive
        ResponsiveManager.updateResponsiveStats(width);
    },

    /**
     * Actualiza estadísticas responsive
     */
    updateResponsiveStats: (width) => {
        const responsiveStat = DOM.headerStats?.querySelector('.stat:nth-child(2) .stat-number');
        if (responsiveStat) {
            if (width < 480) {
                responsiveStat.textContent = 'Mobile S';
            } else if (width < 768) {
                responsiveStat.textContent = 'Mobile L';
            } else if (width < 1024) {
                responsiveStat.textContent = 'Tablet';
            } else {
                responsiveStat.textContent = 'Desktop';
            }
        }
    }
};

// ===========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ===========================================

const App = {
    /**
     * Inicializa toda la aplicación
     */
    init: () => {
        try {
            // Inicializar sistemas
            ViewManager.init();
            ColumnManager.init();
            FilterManager.init();
            ShuffleManager.init();
            LikeManager.init();
            ModalManager.init();
            FooterManager.init();
            EventManager.init();
            ResponsiveManager.init();
            
            // Configurar estado inicial
            App.setupInitialState();
            
            // Configurar eventos globales
            App.setupGlobalEvents();
            
            console.log('🎨 Galería Responsive inicializada correctamente');
            
            // Disparar evento de carga completa
            document.dispatchEvent(new CustomEvent('galleryLoaded'));
            
        } catch (error) {
            console.error('Error al inicializar la galería:', error);
            App.showError();
        }
    },

    /**
     * Configura el estado inicial
     */
    setupInitialState: () => {
        // Asignar IDs a los items si no los tienen
        DOM.galleryItems.forEach((item, index) => {
            if (!item.getAttribute('data-id')) {
                item.setAttribute('data-id', `image-${index + 1}`);
            }
        });
        
        // Contar imágenes totales
        if (DOM.imageCount) {
            DOM.imageCount.textContent = DOM.galleryItems.length;
        }
        
        // Actualizar contadores de categorías
        FilterManager.updateCategoryCounts();
    },

    /**
     * Configura eventos globales
     */
    setupGlobalEvents: () => {
        // Abrir modal haciendo clic en la imagen
        DOM.galleryItems.forEach(item => {
            item.addEventListener('click', (event) => {
                if (!event.target.closest('.like-btn') && !event.target.closest('.zoom-btn')) {
                    ModalManager.openModal(item);
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            // Shift + S para shuffle
            if (event.shiftKey && event.key === 'S') {
                event.preventDefault();
                ShuffleManager.handleShuffle();
            }
            
            // Shift + F para resetear filtros
            if (event.shiftKey && event.key === 'F') {
                event.preventDefault();
                const allFilter = document.querySelector('[data-filter="all"]');
                if (allFilter) {
                    allFilter.click();
                }
            }
            
            // Shift + R para recargar
            if (event.shiftKey && event.key === 'R') {
                event.preventDefault();
                FooterManager.reloadGallery();
            }
        });
    },

    /**
     * Muestra mensaje de error
     */
    showError: () => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 9999;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        errorDiv.innerHTML = `
            <strong>⚠️ Error de inicialización</strong>
            <p>Algunas funciones pueden no estar disponibles.</p>
            <button onclick="this.parentElement.remove()" style="
                background: white;
                color: #ef4444;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                margin-top: 0.5rem;
                cursor: pointer;
                font-weight: bold;
            ">Cerrar</button>
        `;
        document.body.appendChild(errorDiv);
    }
};

// ===========================================
// INICIALIZAR APLICACIÓN CUANDO EL DOM ESTÉ LISTO
// ===========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    App.init();
}

// ===========================================
// EXPORTAR PARA USO GLOBAL (SI ES NECESARIO)
// ===========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        ViewManager,
        ColumnManager,
        FilterManager,
        ShuffleManager,
        LikeManager,
        ModalManager,
        FooterManager
    };
} else {
    // Hacer disponible globalmente para debugging
    window.GalleryApp = {
        state: AppState,
        managers: {
            view: ViewManager,
            columns: ColumnManager,
            filter: FilterManager,
            shuffle: ShuffleManager,
            like: LikeManager,
            modal: ModalManager,
            footer: FooterManager
        },
        utils: Utils,
        reload: () => FooterManager.reloadGallery(),
        shuffle: () => ShuffleManager.handleShuffle()
    };
}
