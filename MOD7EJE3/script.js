// =====================================
// GALLERY MANAGER - Sistema Modular
// =====================================
const GalleryManager = (() => {
    'use strict';
    
    // Configuración global
    const CONFIG = {
        gridSelector: '.gallery-grid',
        cardSelector: '.card',
        filterSelector: '.filter-btn',
        sortSelector: '.sort-select',
        viewSelector: '.view-btn',
        itemsPerPage: 12,
        animationDelay: 100,
        virtualScrollThreshold: 100,
        lazyLoadThreshold: 0.1,
        localStorageKey: 'gallery-state',
        maxImageCache: 50,
        enableGestures: true,
        debug: false
    };
    
    // Estado de la galería
    const state = {
        currentFilter: 'all',
        currentSort: 'default',
        currentView: 'masonry',
        currentPage: 1,
        totalItems: 0,
        filteredItems: [],
        isLoading: false,
        hasMore: true,
        likes: new Map(),
        galleryState: 'idle', // idle, loading, filtering, sorting, error
        observers: new Map(),
        imageCache: new Map()
    };
    
    // Datos de ejemplo (en producción vendrían de una API)
    const galleryData = [
        {
            id: 'img-1',
            title: 'Bosque Nórdico',
            description: 'Vista panorámica de un bosque denso con árboles altos',
            category: 'nature',
            date: '2024-01-15',
            likes: 42,
            src: 'https://picsum.photos/id/10/400/400',
            largeSrc: 'https://picsum.photos/id/10/1200/800',
            width: 400,
            height: 400,
            tags: ['naturaleza', 'bosque', 'verde']
        },
        {
            id: 'img-2',
            title: 'Cascada Majestuosa',
            description: 'Cascada alta cayendo entre rocas cubiertas de musgo',
            category: 'nature',
            date: '2024-01-14',
            likes: 128,
            src: 'https://picsum.photos/id/15/400/600',
            largeSrc: 'https://picsum.photos/id/15/800/1200',
            width: 400,
            height: 600,
            tags: ['naturaleza', 'agua', 'aventura']
        },
        {
            id: 'img-3',
            title: 'Horizonte Infinito',
            description: 'Paisaje amplio con montañas al atardecer',
            category: 'landscape',
            date: '2024-01-13',
            likes: 89,
            src: 'https://picsum.photos/id/28/600/400',
            largeSrc: 'https://picsum.photos/id/28/1200/800',
            width: 600,
            height: 400,
            tags: ['paisaje', 'montañas', 'atardecer']
        },
        {
            id: 'img-4',
            title: 'Gato Curioso',
            description: 'Retrato de un gato doméstico con expresión curiosa',
            category: 'animals',
            date: '2024-01-12',
            likes: 256,
            src: 'https://picsum.photos/id/40/400/400',
            largeSrc: 'https://picsum.photos/id/40/800/800',
            width: 400,
            height: 400,
            tags: ['animales', 'gato', 'mascota']
        },
        {
            id: 'img-5',
            title: 'Ciudad Nocturna',
            description: 'Skyline urbano iluminado por la noche',
            category: 'urban',
            date: '2024-01-11',
            likes: 312,
            src: 'https://picsum.photos/id/56/800/800',
            largeSrc: 'https://picsum.photos/id/56/1200/1200',
            width: 800,
            height: 800,
            tags: ['ciudad', 'nocturna', 'urbanismo']
        },
        {
            id: 'img-6',
            title: 'Estructuras Modernas',
            description: 'Arquitectura contemporánea con líneas limpias',
            category: 'architecture',
            date: '2024-01-10',
            likes: 174,
            src: 'https://picsum.photos/id/88/400/600',
            largeSrc: 'https://picsum.photos/id/88/600/900',
            width: 400,
            height: 600,
            tags: ['arquitectura', 'moderna', 'diseño']
        }
    ];
    
    // =====================================
    // UTILIDADES AVANZADAS
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
            console.log(`%c[GalleryManager] ${message}`, styles[type]);
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
            return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        },
        
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        
        formatNumber(num) {
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'k';
            }
            return num.toString();
        },
        
        async preloadImage(src) {
            if (state.imageCache.has(src)) {
                return state.imageCache.get(src);
            }
            
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    state.imageCache.set(src, img);
                    if (state.imageCache.size > CONFIG.maxImageCache) {
                        const firstKey = state.imageCache.keys().next().value;
                        state.imageCache.delete(firstKey);
                    }
                    resolve(img);
                };
                img.onerror = reject;
                img.src = src;
            });
        },
        
        getRandomSize() {
            const sizes = ['normal', 'tall', 'wide', 'big'];
            const weights = [0.4, 0.2, 0.2, 0.2]; // Probabilidades
            let random = Math.random();
            let sum = 0;
            
            for (let i = 0; i < sizes.length; i++) {
                sum += weights[i];
                if (random <= sum) {
                    return sizes[i];
                }
            }
            return 'normal';
        },
        
        calculateImageAspectRatio(width, height) {
            return width / height;
        },
        
        isMobile() {
            return window.innerWidth <= 768;
        },
        
        animateCSS(element, animation, prefix = 'animate__') {
            return new Promise((resolve) => {
                const animationName = `${prefix}${animation}`;
                const node = element;
                
                node.classList.add(`${prefix}animated`, animationName);
                
                function handleAnimationEnd(event) {
                    event.stopPropagation();
                    node.classList.remove(`${prefix}animated`, animationName);
                    resolve('Animation ended');
                }
                
                node.addEventListener('animationend', handleAnimationEnd, { once: true });
            });
        }
    };
    
    // =====================================
    // NUEVA FUNCIONALIDAD: FILTER MANAGER
    // =====================================
    const FilterManager = {
        init() {
            this.setupFilterControls();
            this.setupSortControls();
            this.setupViewControls();
            this.loadFilterState();
        },
        
        setupFilterControls() {
            const filterButtons = document.querySelectorAll(CONFIG.filterSelector);
            
            filterButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const filter = button.dataset.filter;
                    this.applyFilter(filter);
                    this.highlightActiveFilter(button);
                    
                    // Anunciar cambio para accesibilidad
                    this.announceFilterChange(filter);
                });
                
                // Navegación por teclado
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        button.click();
                    }
                });
            });
        },
        
        setupSortControls() {
            const sortSelect = document.querySelector(CONFIG.sortSelector);
            if (!sortSelect) return;
            
            sortSelect.addEventListener('change', (e) => {
                const sortBy = e.target.value;
                this.applySort(sortBy);
                Utils.log(`Ordenando por: ${sortBy}`, 'info');
            });
        },
        
        setupViewControls() {
            const viewButtons = document.querySelectorAll(CONFIG.viewSelector);
            
            viewButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const view = button.dataset.view;
                    this.applyView(view);
                    this.highlightActiveView(button);
                });
            });
        },
        
        applyFilter(filter) {
            if (state.galleryState === 'filtering') return;
            
            state.galleryState = 'filtering';
            state.currentFilter = filter;
            state.currentPage = 1;
            
            // Aplicar clase de transición
            document.querySelector(CONFIG.gridSelector)?.classList.add('filtering');
            
            // Filtrar datos
            state.filteredItems = filter === 'all' 
                ? [...galleryData]
                : galleryData.filter(item => item.category === filter);
            
            // Actualizar contadores
            this.updateFilterCounts();
            
            // Re-renderizar galería
            setTimeout(() => {
                GalleryRenderer.render();
                state.galleryState = 'idle';
                document.querySelector(CONFIG.gridSelector)?.classList.remove('filtering');
            }, 300);
            
            // Guardar estado
            this.saveFilterState();
            
            // Disparar evento
            this.dispatchFilterEvent(filter);
        },
        
        applySort(sortBy) {
            state.currentSort = sortBy;
            
            const sortedItems = [...state.filteredItems].sort((a, b) => {
                switch(sortBy) {
                    case 'date-newest':
                        return new Date(b.date) - new Date(a.date);
                    case 'date-oldest':
                        return new Date(a.date) - new Date(b.date);
                    case 'name-asc':
                        return a.title.localeCompare(b.title);
                    case 'name-desc':
                        return b.title.localeCompare(a.title);
                    case 'likes-desc':
                        return (b.likes || 0) - (a.likes || 0);
                    default:
                        return 0;
                }
            });
            
            state.filteredItems = sortedItems;
            GalleryRenderer.render();
            
            Utils.log(`Galería ordenada por: ${sortBy}`, 'success');
        },
        
        applyView(view) {
            state.currentView = view;
            const grid = document.querySelector(CONFIG.gridSelector);
            
            if (!grid) return;
            
            grid.classList.remove('masonry-view', 'grid-view', 'list-view');
            grid.classList.add(`${view}-view`);
            
            // Ajustar estilos según vista
            switch(view) {
                case 'grid':
                    grid.style.gridAutoRows = 'auto';
                    break;
                case 'list':
                    grid.style.gridTemplateColumns = '1fr';
                    grid.style.gridAutoRows = 'auto';
                    break;
                default: // masonry
                    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(240px, 1fr))';
                    grid.style.gridAutoRows = '10px';
                    break;
            }
            
            // Re-renderizar para ajustar tamaños
            setTimeout(() => GalleryRenderer.adjustLayout(), 100);
        },
        
        highlightActiveFilter(activeButton) {
            document.querySelectorAll(CONFIG.filterSelector).forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-selected', 'true');
            
            // Animación de confirmación
            Utils.animateCSS(activeButton, 'pulse');
        },
        
        highlightActiveView(activeButton) {
            document.querySelectorAll(CONFIG.viewSelector).forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-pressed', 'true');
        },
        
        updateFilterCounts() {
            const categories = ['all', 'nature', 'architecture', 'urban', 'animals', 'landscape'];
            
            categories.forEach(category => {
                const count = category === 'all' 
                    ? galleryData.length
                    : galleryData.filter(item => item.category === category).length;
                
                const button = document.querySelector(`[data-filter="${category}"]`);
                if (button) {
                    const countElement = button.querySelector('.filter-count');
                    if (countElement) {
                        countElement.textContent = `(${count})`;
                        countElement.setAttribute('aria-label', `${count} imágenes`);
                    }
                }
            });
        },
        
        announceFilterChange(filter) {
            const count = state.filteredItems.length;
            const announcement = document.getElementById('filter-announcement');
            
            if (announcement) {
                announcement.textContent = 
                    `Galería filtrada por ${filter}. Mostrando ${count} imágenes.`;
                
                // Reiniciar live region
                setTimeout(() => {
                    announcement.textContent = '';
                }, 1000);
            }
        },
        
        dispatchFilterEvent(filter) {
            const event = new CustomEvent('gallery:filter', {
                detail: {
                    filter,
                    count: state.filteredItems.length,
                    timestamp: Date.now()
                }
            });
            document.dispatchEvent(event);
        },
        
        saveFilterState() {
            const stateToSave = {
                filter: state.currentFilter,
                sort: state.currentSort,
                view: state.currentView,
                likes: Array.from(state.likes.entries())
            };
            
            try {
                localStorage.setItem(CONFIG.localStorageKey, JSON.stringify(stateToSave));
            } catch (e) {
                Utils.log('Error guardando estado de galería', 'error');
            }
        },
        
        loadFilterState() {
            try {
                const saved = localStorage.getItem(CONFIG.localStorageKey);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    state.currentFilter = parsed.filter || 'all';
                    state.currentSort = parsed.sort || 'default';
                    state.currentView = parsed.view || 'masonry';
                    
                    // Restaurar likes
                    if (parsed.likes) {
                        parsed.likes.forEach(([id, liked]) => {
                            state.likes.set(id, liked);
                        });
                    }
                    
                    // Aplicar estado guardado
                    this.applyFilter(state.currentFilter);
                    this.applySort(state.currentSort);
                    this.applyView(state.currentView);
                    
                    Utils.log('Estado de galería restaurado', 'success');
                }
            } catch (e) {
                Utils.log('Error cargando estado de galería', 'error');
            }
        }
    };
    
    // =====================================
    // NUEVA FUNCIONALIDAD: GALLERY RENDERER
    // =====================================
    const GalleryRenderer = {
        init() {
            this.grid = document.querySelector(CONFIG.gridSelector);
            if (!this.grid) {
                Utils.log('Grid no encontrado', 'error');
                return;
            }
            
            // Inicializar datos
            state.filteredItems = [...galleryData];
            state.totalItems = galleryData.length;
            
            this.render();
            this.setupIntersectionObserver();
            this.setupResizeObserver();
        },
        
        render() {
            if (!this.grid) return;
            
            // Limpiar grid
            this.grid.innerHTML = '';
            
            // Calcular elementos a mostrar (paginación simple)
            const start = (state.currentPage - 1) * CONFIG.itemsPerPage;
            const end = start + CONFIG.itemsPerPage;
            const itemsToShow = state.filteredItems.slice(start, end);
            
            // Renderizar cada elemento
            itemsToShow.forEach((item, index) => {
                const card = this.createCard(item, index);
                this.grid.appendChild(card);
            });
            
            // Aplicar animaciones escalonadas
            this.applyStaggeredAnimations();
            
            // Actualizar contador de paginación
            this.updatePaginationInfo();
            
            // Configurar eventos para nuevas cards
            this.setupCardEvents();
            
            Utils.log(`Renderizadas ${itemsToShow.length} imágenes`, 'success');
        },
        
        createCard(item, index) {
            const card = document.createElement('article');
            card.className = 'card';
            card.dataset.id = item.id;
            card.dataset.category = item.category;
            card.dataset.index = index;
            
            // Determinar tamaño aleatorio para efecto masonry
            const size = Utils.getRandomSize();
            if (size !== 'normal') {
                card.classList.add(`card-${size}`);
            }
            
            // Establecer aspect ratio para CLS
            const aspectRatio = Utils.calculateImageAspectRatio(item.width, item.height);
            card.style.setProperty('--img-ratio', aspectRatio);
            
            // Contenido de la card
            card.innerHTML = `
                <figure class="card-figure">
                    <a href="${item.largeSrc}" 
                       class="card-link" 
                       data-lightbox="gallery"
                       data-id="${item.id}"
                       aria-label="Ver imagen ampliada: ${item.title}">
                        <img src="${item.src}" 
                             alt="${item.description}"
                             class="card-image"
                             loading="lazy"
                             width="${item.width}"
                             height="${item.height}"
                             decoding="async"
                             data-src="${item.src}">
                    </a>
                    <figcaption class="sr-only">${item.description}</figcaption>
                </figure>
                <div class="card-content">
                    <div class="card-header">
                        <h3 class="card-title">${item.title}</h3>
                        <div class="card-meta">
                            <time class="card-date" datetime="${item.date}">
                                ${Utils.formatDate(item.date)}
                            </time>
                            <span class="card-category">${this.getCategoryName(item.category)}</span>
                        </div>
                    </div>
                    <p class="card-description">${item.description}</p>
                    <div class="card-actions">
                        <button class="card-btn like-btn" 
                                data-id="${item.id}"
                                aria-label="${state.likes.get(item.id) ? 'Quitar me gusta' : 'Me gusta esta imagen'}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="${state.likes.get(item.id) ? '#ef4444' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <span class="like-count">${Utils.formatNumber(item.likes)}</span>
                        </button>
                        <button class="card-btn share-btn" 
                                data-id="${item.id}"
                                aria-label="Compartir imagen">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="18" cy="5" r="3"/>
                                <circle cx="6" cy="12" r="3"/>
                                <circle cx="18" cy="19" r="3"/>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            
            return card;
        },
        
        getCategoryName(category) {
            const categories = {
                'nature': 'Naturaleza',
                'architecture': 'Arquitectura',
                'urban': 'Urbano',
                'animals': 'Animales',
                'landscape': 'Paisaje'
            };
            return categories[category] || category;
        },
        
        applyStaggeredAnimations() {
            const cards = this.grid.querySelectorAll('.card');
            
            cards.forEach((card, index) => {
                // Retraso escalonado
                card.style.animationDelay = `${index * CONFIG.animationDelay}ms`;
                
                // Añadir clase para animación
                card.classList.add('animate-in');
                
                // Configurar observer para animaciones de entrada
                if ('IntersectionObserver' in window) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('card-in-view');
                                observer.unobserve(entry.target);
                                
                                // NUEVO EFECTO: Parallax aleatorio
                                const direction = Math.random() > 0.5 ? 'up' : 'down';
                                entry.target.setAttribute('data-parallax', direction);
                            }
                        });
                    }, {
                        threshold: CONFIG.lazyLoadThreshold
                    });
                    
                    observer.observe(card);
                    state.observers.set(card, observer);
                }
            });
        },
        
        setupCardEvents() {
            // Eventos de like
            this.grid.querySelectorAll('.like-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = btn.dataset.id;
                    LikeManager.toggleLike(id, btn);
                });
            });
            
            // Eventos de share
            this.grid.querySelectorAll('.share-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = btn.dataset.id;
                    ShareManager.shareImage(id);
                });
            });
            
            // Eventos de lightbox
            this.grid.querySelectorAll('.card-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const id = link.dataset.id;
                    LightboxManager.open(id);
                });
            });
            
            // NUEVO: Eventos de teclado para cards
            this.grid.querySelectorAll('.card').forEach(card => {
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const link = card.querySelector('.card-link');
                        if (link) link.click();
                    }
                });
                
                // Hover effects mejorados
                card.addEventListener('mouseenter', () => {
                    card.classList.add('card-hover');
                });
                
                card.addEventListener('mouseleave', () => {
                    card.classList.remove('card-hover');
                });
            });
        },
        
        setupIntersectionObserver() {
            // Observer para infinite scroll
            const scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && state.hasMore && !state.isLoading) {
                        this.loadMore();
                    }
                });
            }, {
                rootMargin: `${CONFIG.virtualScrollThreshold}px`
            });
            
            // Crear sentinela para infinite scroll
            const sentinel = document.createElement('div');
            sentinel.className = 'scroll-sentinel';
            sentinel.style.height = '1px';
            sentinel.style.width = '100%';
            this.grid.parentNode.appendChild(sentinel);
            scrollObserver.observe(sentinel);
            
            state.observers.set('scroll', scrollObserver);
        },
        
        setupResizeObserver() {
            if (!('ResizeObserver' in window)) return;
            
            const resizeObserver = new ResizeObserver(
                Utils.throttle(() => {
                    this.adjustLayout();
                }, 250)
            );
            
            if (this.grid) {
                resizeObserver.observe(this.grid);
                state.observers.set('resize', resizeObserver);
            }
        },
        
        adjustLayout() {
            // Recalcular tamaños para masonry
            if (state.currentView === 'masonry') {
                this.recalculateMasonryLayout();
            }
            
            // Re-aplicar observadores de intersección
            this.grid.querySelectorAll('.card:not(.card-in-view)').forEach(card => {
                const observer = state.observers.get(card);
                if (observer) {
                    observer.unobserve(card);
                    observer.observe(card);
                }
            });
        },
        
        recalculateMasonryLayout() {
            // Algoritmo mejorado para masonry
            const cards = this.grid.querySelectorAll('.card');
            const gridWidth = this.grid.clientWidth;
            const columnWidth = 240; // minmax value
            const columns = Math.floor(gridWidth / columnWidth);
            
            if (columns > 0) {
                // Calcular alturas para algoritmo masonry
                cards.forEach(card => {
                    const sizeClass = Array.from(card.classList)
                        .find(cls => cls.startsWith('card-'));
                    
                    const size = sizeClass ? sizeClass.replace('card-', '') : 'normal';
                    const baseHeight = size === 'tall' ? 42 : 
                                      size === 'big' ? 42 : 26;
                    
                    // Ajustar altura basada en aspect ratio
                    const aspectRatio = card.style.getPropertyValue('--img-ratio');
                    if (aspectRatio) {
                        const adjustedHeight = baseHeight * parseFloat(aspectRatio);
                        card.style.gridRowEnd = `span ${Math.round(adjustedHeight)}`;
                    }
                });
            }
        },
        
        loadMore() {
            if (state.isLoading || !state.hasMore) return;
            
            state.isLoading = true;
            state.currentPage++;
            
            // Mostrar indicador de carga
            this.showLoadingIndicator();
            
            // Simular carga de datos
            setTimeout(() => {
                const newItems = galleryData.slice(
                    (state.currentPage - 1) * CONFIG.itemsPerPage,
                    state.currentPage * CONFIG.itemsPerPage
                );
                
                if (newItems.length === 0) {
                    state.hasMore = false;
                    this.hideLoadingIndicator();
                    return;
                }
                
                // Añadir nuevos items
                newItems.forEach((item, index) => {
                    const card = this.createCard(item, state.filteredItems.length + index);
                    this.grid.appendChild(card);
                });
                
                // Actualizar estado
                state.filteredItems = [...state.filteredItems, ...newItems];
                
                // Configurar eventos para nuevas cards
                this.setupCardEvents();
                
                // Aplicar animaciones
                this.applyStaggeredAnimations();
                
                // Ocultar indicador
                this.hideLoadingIndicator();
                
                state.isLoading = false;
                
                Utils.log(`Cargadas ${newItems.length} imágenes adicionales`, 'info');
                
                // Disparar evento
                this.dispatchLoadMoreEvent(newItems.length);
                
            }, 1000);
        },
        
        showLoadingIndicator() {
            let loader = document.querySelector('.gallery-loader');
            if (!loader) {
                loader = document.createElement('div');
                loader.className = 'gallery-loader';
                loader.innerHTML = `
                    <div class="loader-spinner"></div>
                    <p class="loader-text">Cargando más imágenes...</p>
                `;
                this.grid.parentNode.appendChild(loader);
            }
            loader.style.display = 'block';
        },
        
        hideLoadingIndicator() {
            const loader = document.querySelector('.gallery-loader');
            if (loader) {
                loader.style.display = 'none';
            }
        },
        
        updatePaginationInfo() {
            const total = state.filteredItems.length;
            const current = Math.min(state.currentPage * CONFIG.itemsPerPage, total);
            const start = (state.currentPage - 1) * CONFIG.itemsPerPage + 1;
            
            const infoElement = document.querySelector('.pagination-info');
            if (infoElement) {
                infoElement.innerHTML = `
                    Mostrando <span class="current-range">${start}-${current}</span> 
                    de <span class="total-items">${total}</span> imágenes
                `;
            }
        },
        
        dispatchLoadMoreEvent(count) {
            const event = new CustomEvent('gallery:loadmore', {
                detail: {
                    count,
                    total: state.filteredItems.length,
                    page: state.currentPage,
                    timestamp: Date.now()
                }
            });
            document.dispatchEvent(event);
        }
    };
    
    // =====================================
    // NUEVA FUNCIONALIDAD: LIGHTBOX MANAGER
    // =====================================
    const LightboxManager = {
        init() {
            this.createLightbox();
            this.setupKeyboardNavigation();
            this.setupGestureControls();
        },
        
        createLightbox() {
            // Verificar si ya existe
            if (document.getElementById('lightbox-modal')) return;
            
            const lightbox = document.createElement('div');
            lightbox.id = 'lightbox-modal';
            lightbox.className = 'lightbox-modal';
            lightbox.setAttribute('aria-hidden', 'true');
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-label', 'Visualizador de imagen');
            lightbox.setAttribute('aria-modal', 'true');
            
            lightbox.innerHTML = `
                <div class="lightbox-overlay" data-close="lightbox"></div>
                <div class="lightbox-container">
                    <button class="lightbox-close" aria-label="Cerrar visualizador" data-close="lightbox">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                    
                    <div class="lightbox-content">
                        <figure class="lightbox-figure">
                            <img class="lightbox-image" 
                                 src="" 
                                 alt=""
                                 loading="eager"
                                 decoding="sync">
                            <figcaption class="lightbox-caption"></figcaption>
                        </figure>
                        
                        <div class="lightbox-info">
                            <h3 class="lightbox-title"></h3>
                            <p class="lightbox-description"></p>
                            <div class="lightbox-meta">
                                <span class="lightbox-date"></span>
                                <span class="lightbox-category"></span>
                            </div>
                            <div class="lightbox-stats">
                                <button class="lightbox-like" aria-label="Me gusta">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                    </svg>
                                    <span class="like-count">0</span>
                                </button>
                                <button class="lightbox-download" aria-label="Descargar imagen">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="7 10 12 15 17 10"/>
                                        <line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                    Descargar
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <button class="lightbox-nav lightbox-prev" aria-label="Imagen anterior">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>
                    <button class="lightbox-nav lightbox-next" aria-label="Imagen siguiente">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </button>
                </div>
            `;
            
            document.body.appendChild(lightbox);
            this.setupLightboxEvents();
            
            Utils.log('Lightbox creado', 'success');
        },
        
        setupLightboxEvents() {
            const lightbox = document.getElementById('lightbox-modal');
            if (!lightbox) return;
            
            // Cerrar lightbox
            lightbox.querySelectorAll('[data-close="lightbox"]').forEach(btn => {
                btn.addEventListener('click', () => this.close());
            });
            
            // Navegación
            lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.prev());
            lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.next());
            
            // Like en lightbox
            lightbox.querySelector('.lightbox-like').addEventListener('click', (e) => {
                const id = lightbox.dataset.currentId;
                if (id) {
                    const btn = document.querySelector(`.like-btn[data-id="${id}"]`);
                    if (btn) btn.click();
                }
            });
            
            // Descargar imagen
            lightbox.querySelector('.lightbox-download').addEventListener('click', () => {
                this.downloadCurrentImage();
            });
            
            // Prevenir cierre al hacer click en el contenido
            lightbox.querySelector('.lightbox-container').addEventListener('click', (e) => {
                e.stopPropagation();
            });
        },
        
        setupKeyboardNavigation() {
            document.addEventListener('keydown', (e) => {
                const lightbox = document.getElementById('lightbox-modal');
                if (!lightbox || lightbox.getAttribute('aria-hidden') === 'true') return;
                
                switch(e.key) {
                    case 'Escape':
                        e.preventDefault();
                        this.close();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.prev();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.next();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.toggleLikeCurrent();
                        break;
                    case 'd':
                    case 'D':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.downloadCurrentImage();
                        }
                        break;
                }
            });
        },
        
        setupGestureControls() {
            if (!CONFIG.enableGestures || Utils.isMobile()) return;
            
            const lightbox = document.getElementById('lightbox-modal');
            if (!lightbox) return;
            
            const image = lightbox.querySelector('.lightbox-image');
            if (!image) return;
            
            let startX = 0;
            let startY = 0;
            let scale = 1;
            let lastScale = 1;
            let isDragging = false;
            
            // Touch events para zoom
            image.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    const distance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );
                    lastScale = distance;
                }
            }, { passive: false });
            
            image.addEventListener('touchmove', (e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    const distance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );
                    
                    scale = (distance / lastScale) * scale;
                    scale = Math.max(0.5, Math.min(3, scale));
                    
                    image.style.transform = `scale(${scale})`;
                }
            }, { passive: false });
            
            // Drag para navegación
            lightbox.addEventListener('mousedown', (e) => {
                if (e.target.closest('.lightbox-container')) {
                    startX = e.clientX;
                    startY = e.clientY;
                    isDragging = true;
                }
            });
            
            lightbox.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                // Solo considerar movimientos horizontales significativos
                if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
                    if (deltaX > 0) {
                        this.prev();
                    } else {
                        this.next();
                    }
                    isDragging = false;
                }
            });
            
            lightbox.addEventListener('mouseup', () => {
                isDragging = false;
            });
            
            lightbox.addEventListener('mouseleave', () => {
                isDragging = false;
            });
        },
        
        open(imageId) {
            const imageData = galleryData.find(img => img.id === imageId);
            if (!imageData) return;
            
            const lightbox = document.getElementById('lightbox-modal');
            if (!lightbox) return;
            
            // Actualizar contenido
            lightbox.querySelector('.lightbox-image').src = imageData.largeSrc;
            lightbox.querySelector('.lightbox-image').alt = imageData.description;
            lightbox.querySelector('.lightbox-caption').textContent = imageData.description;
            lightbox.querySelector('.lightbox-title').textContent = imageData.title;
            lightbox.querySelector('.lightbox-description').textContent = imageData.description;
            lightbox.querySelector('.lightbox-date').textContent = Utils.formatDate(imageData.date);
            lightbox.querySelector('.lightbox-category').textContent = 
                GalleryRenderer.getCategoryName(imageData.category);
            lightbox.querySelector('.lightbox-like .like-count').textContent = 
                Utils.formatNumber(imageData.likes);
            
            // Actualizar like button
            const likeBtn = lightbox.querySelector('.lightbox-like');
            const isLiked = state.likes.get(imageId);
            likeBtn.querySelector('svg').style.fill = isLiked ? '#ef4444' : 'none';
            likeBtn.setAttribute('aria-label', isLiked ? 'Quitar me gusta' : 'Me gusta');
            
            // Guardar ID actual
            lightbox.dataset.currentId = imageId;
            lightbox.dataset.currentIndex = galleryData.findIndex(img => img.id === imageId);
            
            // Mostrar lightbox
            lightbox.setAttribute('aria-hidden', 'false');
            lightbox.hidden = false;
            document.body.style.overflow = 'hidden';
            
            // Enfocar botón de cierre para accesibilidad
            setTimeout(() => {
                lightbox.querySelector('.lightbox-close').focus();
            }, 100);
            
            // Preload imágenes adyacentes
            this.preloadAdjacentImages(imageId);
            
            Utils.log(`Lightbox abierto: ${imageData.title}`, 'info');
            
            // Disparar evento
            this.dispatchLightboxEvent('open', imageId);
        },
        
        close() {
            const lightbox = document.getElementById('lightbox-modal');
            if (!lightbox) return;
            
            lightbox.setAttribute('aria-hidden', 'true');
            lightbox.hidden = true;
            document.body.style.overflow = '';
            
            // Restaurar foco al elemento que abrió el lightbox
            const opener = document.activeElement;
            if (opener && opener.classList.contains('card-link')) {
                opener.focus();
            }
            
            // Resetear zoom
            const image = lightbox.querySelector('.lightbox-image');
            if (image) {
                image.style.transform = 'scale(1)';
            }
            
            Utils.log('Lightbox cerrado', 'info');
            
            // Disparar evento
            this.dispatchLightboxEvent('close', lightbox.dataset.currentId);
        },
        
        prev() {
            const lightbox = document.getElementById('lightbox-modal');
            if (!lightbox) return;
            
            const currentIndex = parseInt(lightbox.dataset.currentIndex);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : galleryData.length - 1;
            const prevImage = galleryData[prevIndex];
            
            if (prevImage) {
                this.open(prevImage.id);
            }
        },
        
        next() {
            const lightbox = document.getElementById('lightbox-modal');
            if (!lightbox) return;
            
            const currentIndex = parseInt(lightbox.dataset.currentIndex);
            const nextIndex = currentIndex < galleryData.length - 1 ? currentIndex + 1 : 0;
            const nextImage = galleryData[nextIndex];
            
            if (nextImage) {
                this.open(nextImage.id);
            }
        },
        
        toggleLikeCurrent() {
            const lightbox = document.getElementById('lightbox-modal');
            if (!lightbox) return;
            
            const id = lightbox.dataset.currentId;
            if (id) {
                const btn = document.querySelector(`.like-btn[data-id="${id}"]`);
                if (btn) btn.click();
            }
        },
        
        async downloadCurrentImage() {
            const lightbox = document.getElementById('lightbox-modal');
            if (!lightbox) return;
            
            const id = lightbox.dataset.currentId;
            const imageData = galleryData.find(img => img.id === id);
            if (!imageData) return;
            
            try {
                const response = await fetch(imageData.largeSrc);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${imageData.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                Utils.log(`Imagen descargada: ${imageData.title}`, 'success');
                
                // Mostrar notificación
                this.showNotification('Imagen descargada correctamente');
            } catch (error) {
                Utils.log(`Error descargando imagen: ${error.message}`, 'error');
                this.showNotification('Error al descargar la imagen', 'error');
            }
        },
        
        async preloadAdjacentImages(currentId) {
            const currentIndex = galleryData.findIndex(img => img.id === currentId);
            const indices = [
                currentIndex - 1,
                currentIndex + 1,
                currentIndex - 2,
                currentIndex + 2
            ].filter(idx => idx >= 0 && idx < galleryData.length);
            
            for (const idx of indices) {
                const image = galleryData[idx];
                try {
                    await Utils.preloadImage(image.largeSrc);
                } catch (error) {
                    // Silently fail
                }
            }
        },
        
        showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `lightbox-notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'error' ? '#ef4444' : '#10b981'};
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 10001;
                animation: slideUp 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideDown 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },
        
        dispatchLightboxEvent(action, imageId) {
            const event = new CustomEvent(`lightbox:${action}`, {
                detail: {
                    imageId,
                    timestamp: Date.now()
                }
            });
            document.dispatchEvent(event);
        }
    };
    
    // =====================================
    // NUEVA FUNCIONALIDAD: LIKE MANAGER
    // =====================================
    const LikeManager = {
        init() {
            this.loadLikes();
        },
        
        toggleLike(imageId, button) {
            const isLiked = state.likes.get(imageId);
            const newLiked = !isLiked;
            
            // Actualizar estado
            state.likes.set(imageId, newLiked);
            
            // Actualizar UI
            this.updateLikeUI(imageId, button, newLiked);
            
            // Actualizar contador
            this.updateLikeCount(imageId, newLiked);
            
            // Guardar likes
            this.saveLikes();
            
            // Animación
            this.animateLike(button, newLiked);
            
            // Disparar evento
            this.dispatchLikeEvent(imageId, newLiked);
            
            Utils.log(`${newLiked ? 'Liked' : 'Unliked'}: ${imageId}`, 'info');
        },
        
        updateLikeUI(imageId, button, liked) {
            // Actualizar botón
            const svg = button.querySelector('svg');
            svg.style.fill = liked ? '#ef4444' : 'none';
            button.setAttribute('aria-label', liked ? 'Quitar me gusta' : 'Me gusta esta imagen');
            
            // Actualizar en lightbox si está abierto
            const lightbox = document.getElementById('lightbox-modal');
            if (lightbox && lightbox.dataset.currentId === imageId) {
                const lightboxLike = lightbox.querySelector('.lightbox-like');
                lightboxLike.querySelector('svg').style.fill = liked ? '#ef4444' : 'none';
                lightboxLike.setAttribute('aria-label', liked ? 'Quitar me gusta' : 'Me gusta');
            }
        },
        
        updateLikeCount(imageId, liked) {
            // Encontrar imagen en datos
            const imageIndex = galleryData.findIndex(img => img.id === imageId);
            if (imageIndex !== -1) {
                // Actualizar contador local
                galleryData[imageIndex].likes += liked ? 1 : -1;
                
                // Actualizar todos los botones de like para esta imagen
                document.querySelectorAll(`.like-btn[data-id="${imageId}"]`).forEach(btn => {
                    const countSpan = btn.querySelector('.like-count');
                    if (countSpan) {
                        countSpan.textContent = Utils.formatNumber(galleryData[imageIndex].likes);
                    }
                });
                
                // Actualizar en lightbox
                const lightbox = document.getElementById('lightbox-modal');
                if (lightbox && lightbox.dataset.currentId === imageId) {
                    const countSpan = lightbox.querySelector('.lightbox-like .like-count');
                    if (countSpan) {
                        countSpan.textContent = Utils.formatNumber(galleryData[imageIndex].likes);
                    }
                }
            }
        },
        
        animateLike(button, liked) {
            // Animación de corazón
            const svg = button.querySelector('svg');
            svg.style.transform = 'scale(1.3)';
            
            // Efecto de partículas para like
            if (liked) {
                this.createLikeParticles(button);
            }
            
            setTimeout(() => {
                svg.style.transform = 'scale(1)';
            }, 300);
            
            // Animación CSS
            Utils.animateCSS(button, 'pulse');
        },
        
        createLikeParticles(button) {
            const rect = button.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.className = 'like-particle';
                particle.style.cssText = `
                    position: fixed;
                    width: 6px;
                    height: 6px;
                    background: #ef4444;
                    border-radius: 50%;
                    left: ${centerX}px;
                    top: ${centerY}px;
                    z-index: 1000;
                    pointer-events: none;
                `;
                
                document.body.appendChild(particle);
                
                // Animación
                const angle = (i / 8) * Math.PI * 2;
                const distance = 30 + Math.random() * 20;
                const duration = 600 + Math.random() * 400;
                
                particle.animate([
                    {
                        transform: `translate(0, 0) scale(1)`,
                        opacity: 1
                    },
                    {
                        transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                        opacity: 0
                    }
                ], {
                    duration,
                    easing: 'cubic-bezier(0.2, 0, 0.8, 1)'
                });
                
                // Remover después de animación
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }, duration);
            }
        },
        
        saveLikes() {
            const likesArray = Array.from(state.likes.entries());
            try {
                localStorage.setItem('gallery-likes', JSON.stringify(likesArray));
            } catch (e) {
                Utils.log('Error guardando likes', 'error');
            }
        },
        
        loadLikes() {
            try {
                const saved = localStorage.getItem('gallery-likes');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    parsed.forEach(([id, liked]) => {
                        state.likes.set(id, liked);
                    });
                    Utils.log('Likes cargados', 'success');
                }
            } catch (e) {
                Utils.log('Error cargando likes', 'error');
            }
        },
        
        dispatchLikeEvent(imageId, liked) {
            const event = new CustomEvent('gallery:like', {
                detail: {
                    imageId,
                    liked,
                    timestamp: Date.now(),
                    totalLikes: Array.from(state.likes.values()).filter(v => v).length
                }
            });
            document.dispatchEvent(event);
        }
    };
    
    // =====================================
    // NUEVA FUNCIONALIDAD: SHARE MANAGER
    // =====================================
    const ShareManager = {
        async shareImage(imageId) {
            const imageData = galleryData.find(img => img.id === imageId);
            if (!imageData) return;
            
            const shareData = {
                title: imageData.title,
                text: imageData.description,
                url: window.location.href
            };
            
            // Intentar usar Web Share API
            if (navigator.share && navigator.canShare(shareData)) {
                try {
                    await navigator.share(shareData);
                    Utils.log('Imagen compartida', 'success');
                    this.showShareNotification('¡Compartido!');
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        this.fallbackShare(imageData);
                    }
                }
            } else {
                this.fallbackShare(imageData);
            }
        },
        
        fallbackShare(imageData) {
            // Copiar enlace al portapapeles
            const url = `${window.location.origin}#image-${imageData.id}`;
            
            navigator.clipboard.writeText(url).then(() => {
                this.showShareNotification('Enlace copiado al portapapeles');
                Utils.log('Enlace copiado al portapapeles', 'success');
            }).catch(err => {
                this.showShareNotification('Error al compartir', 'error');
                Utils.log('Error copiando enlace: ' + err, 'error');
            });
        },
        
        showShareNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = 'share-notification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: ${type === 'error' ? '#ef4444' : '#10b981'};
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 1000;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    };
    
    // =====================================
    // INICIALIZACIÓN Y API PÚBLICA
    // =====================================
    const init = () => {
        try {
            Utils.log('Inicializando Gallery Manager...', 'info');
            
            // Inicializar módulos
            FilterManager.init();
            GalleryRenderer.init();
            LightboxManager.init();
            LikeManager.init();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            // Marcar galería como cargada
            document.body.setAttribute('data-gallery-loaded', 'true');
            
            // Disparar evento de inicialización
            document.dispatchEvent(new CustomEvent('gallery:ready', {
                detail: {
                    version: '3.0.0',
                    totalImages: galleryData.length,
                    timestamp: Date.now()
                }
            }));
            
            Utils.log('Gallery Manager inicializado correctamente', 'success');
            
        } catch (error) {
            Utils.log(`Error inicializando Gallery Manager: ${error.message}`, 'error');
            this.applyFallback();
        }
    };
    
    const setupGlobalEvents = () => {
        // Prevenir comportamiento por defecto de enlaces
        document.addEventListener('click', (e) => {
            if (e.target.matches('.card-link')) {
                e.preventDefault();
            }
        });
        
        // Escuchar eventos personalizados
        document.addEventListener('gallery:filter', (e) => {
            Utils.log(`Filtro aplicado: ${e.detail.filter}`, 'info');
        });
        
        document.addEventListener('gallery:like', (e) => {
            Utils.log(`Like ${e.detail.liked ? 'añadido' : 'removido'}`, 'info');
        });
        
        // Cerrar lightbox con escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const lightbox = document.getElementById('lightbox-modal');
                if (lightbox && lightbox.getAttribute('aria-hidden') === 'false') {
                    LightboxManager.close();
                }
            }
        });
        
        // Resetear galería al cambiar tamaño
        window.addEventListener('resize', Utils.throttle(() => {
            GalleryRenderer.adjustLayout();
        }, 250));
    };
    
    const applyFallback = () => {
        // Fallback básico sin JavaScript avanzado
        const cards = document.querySelectorAll('.card');
        const sizes = ['card-normal', 'card-tall', 'card-wide', 'card-big'];
        
        cards.forEach(card => {
            const randomSize = Math.floor(Math.random() * sizes.length);
            if (sizes[randomSize] !== 'card-normal') {
                card.classList.add(sizes[randomSize]);
            }
        });
        
        Utils.log('Usando fallback básico', 'warning');
    };
    
    // API pública
    return {
        init,
        
        // Getters
        getState: () => ({ ...state }),
        getFilteredItems: () => [...state.filteredItems],
        getCurrentFilter: () => state.currentFilter,
        getTotalLikes: () => Array.from(state.likes.values()).filter(v => v).length,
        
        // Setters
        setFilter: (filter) => FilterManager.applyFilter(filter),
        setSort: (sortBy) => FilterManager.applySort(sortBy),
        setView: (view) => FilterManager.applyView(view),
        
        // Acciones
        openLightbox: (imageId) => LightboxManager.open(imageId),
        closeLightbox: () => LightboxManager.close(),
        likeImage: (imageId) => {
            const btn = document.querySelector(`.like-btn[data-id="${imageId}"]`);
            if (btn) LikeManager.toggleLike(imageId, btn);
        },
        shareImage: (imageId) => ShareManager.shareImage(imageId),
        
        // Utilidades
        refreshGallery: () => GalleryRenderer.render(),
        loadMore: () => GalleryRenderer.loadMore(),
        clearCache: () => {
            state.imageCache.clear();
            Utils.log('Cache limpiado', 'info');
        },
        enableDebug: () => CONFIG.debug = true,
        disableDebug: () => CONFIG.debug = false
    };
})();

// =====================================
// INICIALIZACIÓN AL CARGAR EL DOCUMENTO
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar con retardo para priorizar contenido crítico
    setTimeout(() => {
        GalleryManager.init();
    }, 100);
    
    // Añadir estilos para efectos dinámicos
    const styles = document.createElement('style');
    styles.textContent = `
        @keyframes slideUp {
            from { transform: translateX(-50%) translateY(100%); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(100%); opacity: 0; }
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .gallery-loader {
            text-align: center;
            padding: 40px;
            grid-column: 1 / -1;
        }
        
        .loader-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loader-text {
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .filtering .card {
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .like-particle {
            will-change: transform, opacity;
        }
        
        .masonry-view {
            grid-auto-flow: dense;
        }
        
        .grid-view .card {
            grid-row: span 26 !important;
        }
        
        .list-view .card {
            display: grid;
            grid-template-columns: 200px 1fr;
            grid-row: auto !important;
        }
        
        .list-view .card-figure {
            height: 200px;
        }
        
        @media (max-width: 768px) {
            .list-view .card {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(styles);
});

// =====================================
// HANDLER DE ERRORES GLOBAL
// =====================================
window.addEventListener('error', (event) => {
    console.error('[GalleryManager] Error global:', event.error);
});

// =====================================
// COMPATIBILIDAD CON CÓDIGO ANTERIOR
// =====================================
// Mantener compatibilidad con el código original
const cards = document.querySelectorAll('.card');
if (cards.length > 0 && typeof GalleryManager === 'undefined') {
    const sizes = ['card-normal', 'card-tall', 'card-wide', 'card-big'];
    
    cards.forEach(card => {
        const randomSize = Math.floor(Math.random() * sizes.length);
        if (sizes[randomSize] !== 'card-normal') {
            card.classList.add(sizes[randomSize]);
        }
    });
}
