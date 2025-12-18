// ============ MÓDULO: GESTIÓN DE DATOS ============
const ImageDataManager = (() => {
    // Datos de imágenes con más información
    let images = [
        {
            id: 1,
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
            title: 'Montañas al Amanecer',
            category: 'naturaleza',
            description: 'Hermoso paisaje montañoso al amanecer con colores cálidos',
            date: '2024-01-15',
            width: 4000,
            height: 3000,
            tags: ['montañas', 'amanecer', 'paisaje', 'naturaleza']
        },
        {
            id: 2,
            url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
            title: 'Ciudad Moderna',
            category: 'ciudad',
            description: 'Rascacielos iluminados en una gran metrópolis',
            date: '2024-01-14',
            width: 5000,
            height: 3333,
            tags: ['ciudad', 'rascacielos', 'moderno', 'arquitectura']
        },
        {
            id: 3,
            url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
            title: 'Tecnología Digital',
            category: 'tecnologia',
            description: 'Circuitos electrónicos y componentes tecnológicos',
            date: '2024-01-13',
            width: 4500,
            height: 3000,
            tags: ['tecnología', 'circuitos', 'digital', 'electrónica']
        },
        {
            id: 4,
            url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18',
            title: 'Retrato Profesional',
            category: 'personas',
            description: 'Fotografía de retrato con iluminación profesional',
            date: '2024-01-12',
            width: 3800,
            height: 2800,
            tags: ['retrato', 'persona', 'profesional', 'fotografía']
        },
        {
            id: 5,
            url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
            title: 'Bosque Mágico',
            category: 'naturaleza',
            description: 'Sendero misterioso en un bosque encantado',
            date: '2024-01-11',
            width: 4200,
            height: 2800,
            tags: ['bosque', 'naturaleza', 'sendero', 'mágico']
        },
        {
            id: 6,
            url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b',
            title: 'Skyline Nocturno',
            category: 'ciudad',
            description: 'Horizonte urbano iluminado durante la noche',
            date: '2024-01-10',
            width: 4800,
            height: 3200,
            tags: ['ciudad', 'nocturno', 'skyline', 'luces']
        },
        {
            id: 7,
            url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
            title: 'Gadgets Modernos',
            category: 'tecnologia',
            description: 'Dispositivos tecnológicos de última generación',
            date: '2024-01-09',
            width: 4600,
            height: 3067,
            tags: ['gadgets', 'tecnología', 'dispositivos', 'moderno']
        },
        {
            id: 8,
            url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
            title: 'Equipo de Trabajo',
            category: 'personas',
            description: 'Grupo colaborativo en un entorno laboral moderno',
            date: '2024-01-08',
            width: 4400,
            height: 2933,
            tags: ['equipo', 'trabajo', 'colaboración', 'personas']
        },
        {
            id: 9,
            url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262',
            title: 'Arte Abstracto',
            category: 'arte',
            description: 'Composición artística con formas y colores vibrantes',
            date: '2024-01-07',
            width: 4000,
            height: 3000,
            tags: ['arte', 'abstracto', 'colores', 'formas']
        },
        {
            id: 10,
            url: 'https://images.unsplash.com/photo-1513366208864-87536b8bd7b4',
            title: 'Patrones Geométricos',
            category: 'abstracto',
            description: 'Diseño con patrones geométricos repetitivos',
            date: '2024-01-06',
            width: 4200,
            height: 2800,
            tags: ['abstracto', 'geometría', 'patrones', 'diseño']
        },
        {
            id: 11,
            url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
            title: 'Lago Sereno',
            category: 'naturaleza',
            description: 'Lago tranquilo rodeado de montañas',
            date: '2024-01-05',
            width: 4500,
            height: 3000,
            tags: ['lago', 'montañas', 'naturaleza', 'paz']
        },
        {
            id: 12,
            url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90',
            title: 'Arquitectura Futurista',
            category: 'ciudad',
            description: 'Edificios con diseño arquitectónico innovador',
            date: '2024-01-04',
            width: 4800,
            height: 3200,
            tags: ['arquitectura', 'futurista', 'diseño', 'ciudad']
        }
    ];
    
    // Configuración
    const config = {
        itemsPerPage: 8,
        imageSizes: {
            thumb: 'w=300',
            medium: 'w=600',
            large: 'w=1200',
            original: ''
        }
    };
    
    // Función para generar URLs optimizadas
    const getOptimizedUrl = (url, size = 'medium') => {
        const baseUrl = url.split('?')[0];
        return `${baseUrl}?${config.imageSizes[size]}&auto=format&fit=crop&q=80`;
    };
    
    return {
        getAllImages: () => images.map(img => ({
            ...img,
            optimizedUrl: getOptimizedUrl(img.url, 'medium'),
            thumbUrl: getOptimizedUrl(img.url, 'thumb'),
            largeUrl: getOptimizedUrl(img.url, 'large')
        })),
        
        getImageById: (id) => {
            const img = images.find(img => img.id === id);
            return img ? {
                ...img,
                optimizedUrl: getOptimizedUrl(img.url, 'medium'),
                thumbUrl: getOptimizedUrl(img.url, 'thumb'),
                largeUrl: getOptimizedUrl(img.url, 'large')
            } : null;
        },
        
        getCategories: () => {
            const categories = new Set(images.map(img => img.category));
            return ['all', ...Array.from(categories)];
        },
        
        filterImages: (filter = 'all', searchQuery = '', sortBy = 'default') => {
            let filtered = images.filter(img => {
                const matchesCategory = filter === 'all' || img.category === filter;
                const matchesSearch = searchQuery === '' || 
                    img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    img.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    img.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
                
                return matchesCategory && matchesSearch;
            });
            
            // Ordenar
            switch(sortBy) {
                case 'title-asc':
                    filtered.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'title-desc':
                    filtered.sort((a, b) => b.title.localeCompare(a.title));
                    break;
                case 'category-asc':
                    filtered.sort((a, b) => a.category.localeCompare(b.category));
                    break;
                case 'category-desc':
                    filtered.sort((a, b) => b.category.localeCompare(a.category));
                    break;
                case 'date-newest':
                    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
                    break;
                case 'date-oldest':
                    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
                    break;
            }
            
            return filtered.map(img => ({
                ...img,
                optimizedUrl: getOptimizedUrl(img.url, 'medium'),
                thumbUrl: getOptimizedUrl(img.url, 'thumb'),
                largeUrl: getOptimizedUrl(img.url, 'large')
            }));
        },
        
        getConfig: () => ({ ...config }),
        
        // Para expansión futura (API, etc.)
        loadMoreImages: async () => {
            // Simulación de carga asíncrona
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(images.slice(0, 4)); // Simula nuevas imágenes
                }, 1000);
            });
        }
    };
})();

// ============ MÓDULO: ESTADO DE LA APLICACIÓN ============
const AppState = (() => {
    let state = {
        currentFilter: 'all',
        currentView: 'grid',
        currentSort: 'default',
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 8,
        lightboxOpen: false,
        currentLightboxIndex: 0,
        filteredImages: [],
        totalImages: 0
    };
    
    // Cargar preferencias del usuario
    const loadPreferences = () => {
        try {
            const saved = localStorage.getItem('galleryPreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                state.currentFilter = preferences.filter || 'all';
                state.currentView = preferences.view || 'grid';
                state.currentSort = preferences.sort || 'default';
                state.itemsPerPage = preferences.itemsPerPage || 8;
            }
        } catch (error) {
            console.error('Error cargando preferencias:', error);
        }
    };
    
    // Guardar preferencias del usuario
    const savePreferences = () => {
        try {
            const preferences = {
                filter: state.currentFilter,
                view: state.currentView,
                sort: state.currentSort,
                itemsPerPage: state.itemsPerPage
            };
            localStorage.setItem('galleryPreferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Error guardando preferencias:', error);
        }
    };
    
    return {
        initialize: () => {
            loadPreferences();
            return state;
        },
        
        getState: () => ({ ...state }),
        
        updateState: (updates) => {
            state = { ...state, ...updates };
            
            // Filtrar imágenes cuando cambian filtros/búsqueda/orden
            if (updates.currentFilter !== undefined || 
                updates.searchQuery !== undefined || 
                updates.currentSort !== undefined) {
                state.filteredImages = ImageDataManager.filterImages(
                    state.currentFilter,
                    state.searchQuery,
                    state.currentSort
                );
                state.totalImages = state.filteredImages.length;
                state.currentPage = 1; // Resetear a primera página
            }
            
            savePreferences();
            return state;
        },
        
        getCurrentImage: () => {
            return state.filteredImages[state.currentLightboxIndex] || null;
        },
        
        getPaginatedImages: () => {
            const start = (state.currentPage - 1) * state.itemsPerPage;
            const end = start + state.itemsPerPage;
            return state.filteredImages.slice(start, end);
        },
        
        getTotalPages: () => {
            return Math.ceil(state.totalImages / state.itemsPerPage);
        },
        
        nextPage: () => {
            if (state.currentPage < this.getTotalPages()) {
                state.currentPage++;
                return state.currentPage;
            }
            return state.currentPage;
        },
        
        prevPage: () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                return state.currentPage;
            }
            return state.currentPage;
        },
        
        goToPage: (page) => {
            const totalPages = this.getTotalPages();
            if (page >= 1 && page <= totalPages) {
                state.currentPage = page;
            }
            return state.currentPage;
        },
        
        setLightboxIndex: (index) => {
            if (index >= 0 && index < state.filteredImages.length) {
                state.currentLightboxIndex = index;
                state.lightboxOpen = true;
            }
        }
    };
})();

// ============ MÓDULO: INTERFAZ DE USUARIO ============
const UI = (() => {
    // Elementos del DOM
    const elements = {
        gallery: document.getElementById('gallery'),
        searchInput: document.getElementById('searchInput'),
        clearSearchBtn: document.getElementById('clearSearchBtn'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        viewBtns: document.querySelectorAll('.view-btn'),
        sortSelect: document.getElementById('sortSelect'),
        imageCount: document.getElementById('imageCount'),
        totalImages: document.getElementById('totalImages'),
        activeCategory: document.getElementById('activeCategory'),
        galleryStatus: document.getElementById('gallery-status'),
        emptyState: document.getElementById('emptyState'),
        loadingState: document.getElementById('loadingState'),
        resetFiltersBtn: document.getElementById('resetFiltersBtn'),
        lightboxDialog: document.getElementById('lightboxDialog'),
        lightboxImg: document.getElementById('lightboxImg'),
        lightboxTitle: document.getElementById('lightboxTitle'),
        lightboxCategory: document.getElementById('lightboxCategory'),
        lightboxDescription: document.getElementById('lightboxDescription'),
        lightboxDate: document.getElementById('lightboxDate'),
        lightboxDimensions: document.getElementById('lightboxDimensions'),
        lightboxCounter: document.getElementById('lightboxCounter'),
        lightboxThumbnails: document.getElementById('lightboxThumbnails'),
        lightboxClose: document.getElementById('lightboxClose'),
        lightboxPrev: document.getElementById('lightboxPrev'),
        lightboxNext: document.getElementById('lightboxNext'),
        lightboxFullscreen: document.getElementById('lightboxFullscreen'),
        lightboxDownload: document.getElementById('lightboxDownload'),
        pagination: document.getElementById('pagination'),
        paginationPrev: document.querySelector('.pagination-prev'),
        paginationNext: document.querySelector('.pagination-next'),
        paginationPages: document.getElementById('paginationPages')
    };
    
    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // Mostrar/ocultar loading
    const showLoading = () => {
        if (elements.loadingState) {
            elements.loadingState.classList.remove('hidden');
            elements.emptyState?.classList.add('hidden');
        }
    };
    
    const hideLoading = () => {
        if (elements.loadingState) {
            elements.loadingState.classList.add('hidden');
        }
    };
    
    // Crear elemento de imagen
    const createImageElement = (image, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.id = image.id;
        item.dataset.index = index;
        item.dataset.category = image.category;
        item.style.animationDelay = `${index * 0.05}s`;
        
        const categoryColors = {
            'naturaleza': '#2ecc71',
            'ciudad': '#3498db',
            'tecnologia': '#9b59b6',
            'personas': '#e74c3c',
            'arte': '#f39c12',
            'abstracto': '#1abc9c'
        };
        
        item.innerHTML = `
            <div class="gallery-img-wrapper">
                <img 
                    src="${image.thumbUrl}" 
                    data-src="${image.optimizedUrl}" 
                    alt="${image.title}" 
                    class="gallery-img" 
                    loading="lazy" 
                    width="${image.width}" 
                    height="${image.height}"
                >
            </div>
            <div class="gallery-info">
                <span class="gallery-category" data-category="${image.category}" style="--category-color: ${categoryColors[image.category] || '#667eea'}">
                    ${image.category}
                </span>
                <h3 class="gallery-title-item">${image.title}</h3>
                <p class="gallery-description">${image.description}</p>
                <div class="gallery-meta">
                    <span class="gallery-date">
                        📅 ${formatDate(image.date)}
                    </span>
                    <span class="gallery-tags">
                        ${image.tags.slice(0, 2).map(tag => `#${tag}`).join(' ')}
                    </span>
                </div>
            </div>
        `;
        
        // Lazy loading
        const img = item.querySelector('.gallery-img');
        const lazyLoad = () => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    lazyLoad();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(img);
        
        return item;
    };
    
    // Renderizar galería
    const renderGallery = (images, totalCount) => {
        showLoading();
        
        setTimeout(() => {
            const fragment = document.createDocumentFragment();
            
            if (images.length === 0) {
                elements.emptyState?.classList.remove('hidden');
                elements.gallery.innerHTML = '';
            } else {
                elements.emptyState?.classList.add('hidden');
                elements.gallery.innerHTML = '';
                
                images.forEach((image, index) => {
                    fragment.appendChild(createImageElement(image, index));
                });
                
                elements.gallery.appendChild(fragment);
            }
            
            updateStats(totalCount);
            hideLoading();
        }, 300); // Pequeño delay para mejor UX
    };
    
    // Actualizar estadísticas
    const updateStats = (totalCount) => {
        if (elements.imageCount) {
            elements.imageCount.textContent = totalCount;
        }
        
        const state = AppState.getState();
        if (elements.totalImages) {
            const allImages = ImageDataManager.getAllImages();
            elements.totalImages.textContent = allImages.length;
        }
        
        if (elements.activeCategory) {
            const categoryNames = {
                'all': 'Todas',
                'naturaleza': 'Naturaleza',
                'ciudad': 'Ciudad',
                'tecnologia': 'Tecnología',
                'personas': 'Personas',
                'arte': 'Arte',
                'abstracto': 'Abstracto'
            };
            elements.activeCategory.textContent = categoryNames[state.currentFilter] || state.currentFilter;
        }
        
        if (elements.galleryStatus) {
            const showing = Math.min(state.itemsPerPage, totalCount);
            elements.galleryStatus.textContent = 
                totalCount === 0 ? 'No hay imágenes que coincidan' :
                `Mostrando ${showing} de ${totalCount} imágenes`;
        }
    };
    
    // Actualizar controles de filtro
    const updateFilterControls = (currentFilter) => {
        elements.filterBtns?.forEach(btn => {
            const isActive = btn.dataset.filter === currentFilter;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive);
        });
    };
    
    // Actualizar controles de vista
    const updateViewControls = (currentView) => {
        elements.viewBtns?.forEach(btn => {
            const isActive = btn.dataset.view === currentView;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive);
        });
        
        if (elements.gallery) {
            elements.gallery.dataset.view = currentView;
        }
    };
    
    // Renderizar paginación
    const renderPagination = (currentPage, totalPages) => {
        if (!elements.pagination || totalPages <= 1) {
            elements.pagination?.classList.add('hidden');
            return;
        }
        
        elements.pagination.classList.remove('hidden');
        
        // Botones prev/next
        elements.paginationPrev.disabled = currentPage === 1;
        elements.paginationNext.disabled = currentPage === totalPages;
        
        // Números de página
        elements.paginationPages.innerHTML = '';
        const fragment = document.createDocumentFragment();
        
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        // Primera página
        if (start > 1) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination-page';
            pageBtn.textContent = '1';
            pageBtn.addEventListener('click', () => AppState.goToPage(1));
            fragment.appendChild(pageBtn);
            
            if (start > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                fragment.appendChild(ellipsis);
            }
        }
        
        // Páginas visibles
        for (let i = start; i <= end; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-page ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => AppState.goToPage(i));
            fragment.appendChild(pageBtn);
        }
        
        // Última página
        if (end < totalPages) {
            if (end < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                fragment.appendChild(ellipsis);
            }
            
            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination-page';
            pageBtn.textContent = totalPages;
            pageBtn.addEventListener('click', () => AppState.goToPage(totalPages));
            fragment.appendChild(pageBtn);
        }
        
        elements.paginationPages.appendChild(fragment);
    };
    
    // Actualizar lightbox
    const updateLightbox = (image, currentIndex, total) => {
        if (!image) return;
        
        if (elements.lightboxImg) {
            elements.lightboxImg.src = image.largeUrl;
            elements.lightboxImg.alt = image.title;
        }
        
        if (elements.lightboxTitle) {
            elements.lightboxTitle.textContent = image.title;
        }
        
        if (elements.lightboxCategory) {
            elements.lightboxCategory.textContent = image.category;
        }
        
        if (elements.lightboxDescription) {
            elements.lightboxDescription.textContent = image.description;
        }
        
        if (elements.lightboxDate) {
            elements.lightboxDate.textContent = formatDate(image.date);
        }
        
        if (elements.lightboxDimensions) {
            elements.lightboxDimensions.textContent = `${image.width} × ${image.height}`;
        }
        
        if (elements.lightboxCounter) {
            elements.lightboxCounter.textContent = `Imagen ${currentIndex + 1} de ${total}`;
        }
        
        // Actualizar miniaturas
        updateLightboxThumbnails(currentIndex);
    };
    
    // Actualizar miniaturas del lightbox
    const updateLightboxThumbnails = (currentIndex) => {
        if (!elements.lightboxThumbnails) return;
        
        elements.lightboxThumbnails.innerHTML = '';
        const state = AppState.getState();
        const fragment = document.createDocumentFragment();
        
        state.filteredImages.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = `thumbnail ${index === currentIndex ? 'active' : ''}`;
            thumbnail.src = image.thumbUrl;
            thumbnail.alt = `Miniatura: ${image.title}`;
            thumbnail.loading = 'eager';
            thumbnail.addEventListener('click', () => {
                AppState.setLightboxIndex(index);
                updateLightbox(image, index, state.filteredImages.length);
            });
            
            fragment.appendChild(thumbnail);
        });
        
        elements.lightboxThumbnails.appendChild(fragment);
    };
    
    // Mostrar lightbox
    const showLightbox = () => {
        if (elements.lightboxDialog) {
            const state = AppState.getState();
            const image = state.filteredImages[state.currentLightboxIndex];
            
            if (image) {
                updateLightbox(image, state.currentLightboxIndex, state.filteredImages.length);
                elements.lightboxDialog.showModal();
                
                // Añadir clase para animación
                setTimeout(() => {
                    elements.lightboxDialog.classList.add('open');
                }, 10);
            }
        }
    };
    
    // Ocultar lightbox
    const hideLightbox = () => {
        if (elements.lightboxDialog) {
            elements.lightboxDialog.classList.remove('open');
            setTimeout(() => {
                elements.lightboxDialog.close();
            }, 300);
        }
    };
    
    return {
        getElements: () => elements,
        
        initialize: () => {
            // Cargar estado inicial
            const state = AppState.initialize();
            
            // Actualizar controles con estado inicial
            updateFilterControls(state.currentFilter);
            updateViewControls(state.currentView);
            
            if (elements.sortSelect) {
                elements.sortSelect.value = state.currentSort;
            }
            
            return elements;
        },
        
        renderGallery,
        
        updateFilterControls,
        
        updateViewControls,
        
        renderPagination,
        
        showLightbox,
        
        hideLightbox,
        
        updateLightbox,
        
        updateStats,
        
        showLoading,
        
        hideLoading,
        
        // Función para limpiar búsqueda
        clearSearch: () => {
            if (elements.searchInput) {
                elements.searchInput.value = '';
                elements.clearSearchBtn.style.display = 'none';
            }
        },
        
        // Mostrar/ocultar botón de limpiar búsqueda
        toggleClearSearchButton: (show) => {
            if (elements.clearSearchBtn) {
                elements.clearSearchBtn.style.display = show ? 'block' : 'none';
            }
        }
    };
})();

// ============ MÓDULO: MANEJADORES DE EVENTOS ============
const EventHandlers = (() => {
    const elements = UI.getElements();
    
    // Búsqueda
    const handleSearch = (e) => {
        const searchQuery = e.target.value;
        AppState.updateState({ searchQuery });
        UI.toggleClearSearchButton(searchQuery.length > 0);
        updateUI();
    };
    
    // Limpiar búsqueda
    const handleClearSearch = () => {
        UI.clearSearch();
        AppState.updateState({ searchQuery: '' });
        UI.toggleClearSearchButton(false);
        updateUI();
    };
    
    // Filtro por categoría
    const handleFilterChange = (filter) => {
        AppState.updateState({ currentFilter: filter });
        UI.updateFilterControls(filter);
        updateUI();
    };
    
    // Cambio de vista
    const handleViewChange = (view) => {
        AppState.updateState({ currentView: view });
        UI.updateViewControls(view);
    };
    
    // Ordenación
    const handleSortChange = (e) => {
        AppState.updateState({ currentSort: e.target.value });
        updateUI();
    };
    
    // Resetear filtros
    const handleResetFilters = () => {
        AppState.updateState({ 
            currentFilter: 'all', 
            searchQuery: '',
            currentSort: 'default',
            currentPage: 1
        });
        
        UI.clearSearch();
        UI.toggleClearSearchButton(false);
        UI.updateFilterControls('all');
        
        if (elements.sortSelect) {
            elements.sortSelect.value = 'default';
        }
        
        updateUI();
    };
    
    // Click en imagen
    const handleImageClick = (e) => {
        const galleryItem = e.target.closest('.gallery-item');
        if (!galleryItem) return;
        
        const index = parseInt(galleryItem.dataset.index);
        AppState.setLightboxIndex(index);
        UI.showLightbox();
    };
    
    // Navegación del lightbox
    const handleLightboxNavigation = (direction) => {
        const state = AppState.getState();
        let newIndex;
        
        if (direction === 'next') {
            newIndex = (state.currentLightboxIndex + 1) % state.filteredImages.length;
        } else {
            newIndex = (state.currentLightboxIndex - 1 + state.filteredImages.length) % state.filteredImages.length;
        }
        
        AppState.setLightboxIndex(newIndex);
        const image = state.filteredImages[newIndex];
        UI.updateLightbox(image, newIndex, state.filteredImages.length);
    };
    
    // Descargar imagen
    const handleDownloadImage = async () => {
        const state = AppState.getState();
        const image = state.filteredImages[state.currentLightboxIndex];
        
        if (!image) return;
        
        try {
            const response = await fetch(image.largeUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `imagen_${image.id}_${image.title.toLowerCase().replace(/\s+/g, '_')}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error descargando imagen:', error);
        }
    };
    
    // Pantalla completa
    const handleFullscreen = () => {
        const lightboxContent = elements.lightboxDialog?.querySelector('.lightbox-container');
        if (!lightboxContent) return;
        
        if (!document.fullscreenElement) {
            lightboxContent.requestFullscreen().catch(err => {
                console.error('Error al entrar en pantalla completa:', err);
            });
        } else {
            document.exitFullscreen();
        }
    };
    
    // Navegación por teclado
    const handleKeyboardNavigation = (e) => {
        const state = AppState.getState();
        
        // Lightbox abierto
        if (state.lightboxOpen) {
            switch(e.key) {
                case 'Escape':
                    UI.hideLightbox();
                    break;
                case 'ArrowRight':
                case 'd':
                    handleLightboxNavigation('next');
                    break;
                case 'ArrowLeft':
                case 'a':
                    handleLightboxNavigation('prev');
                    break;
                case 'f':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        handleFullscreen();
                    }
                    break;
            }
        } else {
            // Atajos globales
            switch(e.key) {
                case 'Escape':
                    handleResetFilters();
                    break;
                case '/':
                    e.preventDefault();
                    elements.searchInput?.focus();
                    break;
            }
        }
    };
    
    // Paginación
    const handlePagination = (direction) => {
        const state = AppState.getState();
        const totalPages = Math.ceil(state.totalImages / state.itemsPerPage);
        
        let newPage = state.currentPage;
        
        if (direction === 'prev' && state.currentPage > 1) {
            newPage = state.currentPage - 1;
        } else if (direction === 'next' && state.currentPage < totalPages) {
            newPage = state.currentPage + 1;
        }
        
        if (newPage !== state.currentPage) {
            AppState.updateState({ currentPage: newPage });
            updateUI();
        }
    };
    
    // Función para actualizar toda la UI
    const updateUI = () => {
        const state = AppState.getState();
        const paginatedImages = AppState.getPaginatedImages();
        const totalPages = AppState.getTotalPages();
        
        UI.renderGallery(paginatedImages, state.totalImages);
        UI.renderPagination(state.currentPage, totalPages);
    };
    
    return {
        handleSearch,
        handleClearSearch,
        handleFilterChange,
        handleViewChange,
        handleSortChange,
        handleResetFilters,
        handleImageClick,
        handleLightboxNavigation,
        handleDownloadImage,
        handleFullscreen,
        handleKeyboardNavigation,
        handlePagination,
        updateUI
    };
})();

// ============ INICIALIZACIÓN DE LA APLICACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar UI
    const elements = UI.initialize();
    const handlers = EventHandlers;
    
    // ============ CONFIGURACIÓN DE EVENTOS ============
    
    // Búsqueda
    elements.searchInput?.addEventListener('input', handlers.handleSearch);
    elements.clearSearchBtn?.addEventListener('click', handlers.handleClearSearch);
    
    // Mostrar/ocultar botón de limpiar búsqueda
    elements.searchInput?.addEventListener('input', (e) => {
        UI.toggleClearSearchButton(e.target.value.length > 0);
    });
    
    // Filtros
    elements.filterBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            handlers.handleFilterChange(btn.dataset.filter);
        });
    });
    
    // Vistas
    elements.viewBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            handlers.handleViewChange(btn.dataset.view);
        });
    });
    
    // Ordenación
    elements.sortSelect?.addEventListener('change', handlers.handleSortChange);
    
    // Resetear filtros
    elements.resetFiltersBtn?.addEventListener('click', handlers.handleResetFilters);
    
    // Galería (delegación de eventos)
    elements.gallery?.addEventListener('click', handlers.handleImageClick);
    
    // Lightbox
    elements.lightboxClose?.addEventListener('click', UI.hideLightbox);
    elements.lightboxPrev?.addEventListener('click', () => handlers.handleLightboxNavigation('prev'));
    elements.lightboxNext?.addEventListener('click', () => handlers.handleLightboxNavigation('next'));
    elements.lightboxDownload?.addEventListener('click', handlers.handleDownloadImage);
    elements.lightboxFullscreen?.addEventListener('click', handlers.handleFullscreen);
    
    // Cerrar lightbox al hacer clic fuera
    elements.lightboxDialog?.addEventListener('click', (e) => {
        if (e.target === elements.lightboxDialog) {
            UI.hideLightbox();
        }
    });
    
    // Paginación
    elements.paginationPrev?.addEventListener('click', () => handlers.handlePagination('prev'));
    elements.paginationNext?.addEventListener('click', () => handlers.handlePagination('next'));
    
    // Navegación por teclado
    document.addEventListener('keydown', handlers.handleKeyboardNavigation);
    
    // Fullscreen change
    document.addEventListener('fullscreenchange', () => {
        const icon = elements.lightboxFullscreen?.querySelector('span') || elements.lightboxFullscreen;
        if (icon) {
            icon.textContent = document.fullscreenElement ? '⭭' : '⛶';
        }
    });
    
    // Cargar imágenes iniciales
    const state = AppState.updateState({}); // Forzar filtrado inicial
    handlers.updateUI();
    
    // ============ CARGAR MÁS IMÁGENES AL SCROLL (lazy loading infinito) ============
    const loadMoreOnScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const state = AppState.getState();
        const totalPages = Math.ceil(state.totalImages / state.itemsPerPage);
        
        if (scrollTop + clientHeight >= scrollHeight - 100 && 
            state.currentPage < totalPages) {
            
            AppState.updateState({ currentPage: state.currentPage + 1 });
            const newImages = AppState.getPaginatedImages();
            
            // Añadir nuevas imágenes sin recargar todo
            const fragment = document.createDocumentFragment();
            const startIndex = (state.currentPage - 1) * state.itemsPerPage;
            
            newImages.slice(startIndex).forEach((image, index) => {
                const element = UI.createImageElement(image, startIndex + index);
                fragment.appendChild(element);
            });
            
            elements.gallery.appendChild(fragment);
            UI.renderPagination(state.currentPage, totalPages);
        }
    };
    
    window.addEventListener('scroll', loadMoreOnScroll);
    
    // ============ DEBUG Y ESTADÍSTICAS ============
    console.log('Galería Interactiva inicializada correctamente');
    console.log(`Total de imágenes: ${ImageDataManager.getAllImages().length}`);
    console.log(`Categorías disponibles: ${ImageDataManager.getCategories().join(', ')}`);
});

// ============ SERVICE WORKER (OPCIONAL - PWA) ============
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}

// ============ EXPORTACIÓN PARA MÓDULOS ============
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ImageDataManager,
        AppState,
        UI,
        EventHandlers
    };
}
