/**
 * Módulo principal del Buscador Avanzado
 * Implementa patrón de módulo para encapsulación
 */
const ProductSearch = (() => {
    // Estado interno
    let currentPage = 1;
    let itemsPerPage = 24;
    let currentFilters = {};
    let searchHistory = [];
    
    // Elementos DOM - inicializados en init()
    let elements = {
        searchInput: null,
        categorySelect: null,
        minPriceInput: null,
        maxPriceInput: null,
        ratingInputs: null,
        availabilityInputs: null,
        sortSelect: null,
        applyBtn: null,
        clearBtn: null,
        resultsGrid: null,
        resultsCount: null,
        currentPageSpan: null,
        totalPagesSpan: null,
        itemsShownSpan: null,
        totalItemsSpan: null,
        prevBtn: null,
        nextBtn: null,
        itemsPerPageSelect: null,
        gridViewBtn: null,
        listViewBtn: null,
        loadingState: null,
        emptyState: null,
        resetSearchBtn: null,
        mobileFiltersBtn: null,
        collapseFiltersBtn: null,
        clearSearchBtn: null,
        activeFiltersList: null,
        mobileFilterCount: null,
        pricePresetButtons: null,
        searchSuggestions: null
    };
    
    // Configuración
    const config = {
        debounceDelay: 300,
        localStorageKey: 'productSearchHistory',
        maxHistoryItems: 50,
        maxSuggestions: 5,
        itemsPerPageOptions: [12, 24, 48, 96]
    };
    
    /**
     * Base de datos de productos mejorada
     * Con imágenes, descripciones y más detalles
     */
    const productsDatabase = [
        {
            id: 1,
            name: "MacBook Air M2",
            description: "Ultraportátil con chip M2, pantalla Retina de 13.6 pulgadas, 8GB RAM, 256GB SSD",
            category: "electronics",
            price: 1299,
            originalPrice: 1499,
            rating: 4.8,
            reviews: 342,
            stock: 15,
            fastDelivery: true,
            freeShipping: true,
            tags: ["nuevo", "apple", "portátil", "m2"],
            imageClass: "electronics",
            icon: "fas fa-laptop",
            brand: "Apple",
            weight: "1.24 kg",
            dimensions: "30.41 x 21.5 x 1.13 cm"
        },
        {
            id: 2,
            name: "Sudadera Oversize Algodón",
            description: "Sudadera oversize de algodón orgánico, corte moderno y cómodo para uso diario",
            category: "clothing",
            price: 45.99,
            originalPrice: 59.99,
            rating: 4.3,
            reviews: 89,
            stock: 42,
            fastDelivery: true,
            freeShipping: false,
            tags: ["ropa", "oversize", "algodón", "básico"],
            imageClass: "clothing",
            icon: "fas fa-tshirt",
            brand: "UrbanStyle",
            sizes: ["S", "M", "L", "XL"],
            colors: ["Negro", "Gris", "Blanco", "Azul"]
        },
        {
            id: 3,
            name: "Cafetera Espresso Automática",
            description: "Cafetera espresso automática con molinillo integrado y sistema de vapor para capuchinos",
            category: "home",
            price: 429.99,
            originalPrice: 549.99,
            rating: 4.7,
            reviews: 156,
            stock: 8,
            fastDelivery: true,
            freeShipping: true,
            tags: ["cocina", "café", "automática", "espresso"],
            imageClass: "home",
            icon: "fas fa-coffee",
            brand: "KitchenMaster",
            power: "1450W",
            capacity: "1.8L"
        },
        {
            id: 4,
            name: "Teclado Mecánico Gaming RGB",
            description: "Teclado mecánico para gaming con switches Cherry MX Red y retroiluminación RGB personalizable",
            category: "electronics",
            price: 129.99,
            originalPrice: 169.99,
            rating: 4.6,
            reviews: 234,
            stock: 25,
            fastDelivery: true,
            freeShipping: true,
            tags: ["gaming", "mecánico", "rgb", "teclado"],
            imageClass: "electronics",
            icon: "fas fa-keyboard",
            brand: "GamingPro",
            switches: "Cherry MX Red",
            connectivity: "USB-C"
        },
        {
            id: 5,
            name: "Pantalón Denim Slim Fit",
            description: "Pantalón denim de corte slim fit con elastano para mayor comodidad y movimiento",
            category: "clothing",
            price: 79.99,
            originalPrice: 99.99,
            rating: 4.4,
            reviews: 67,
            stock: 38,
            fastDelivery: false,
            freeShipping: true,
            tags: ["denim", "slim", "vaquero", "básico"],
            imageClass: "clothing",
            icon: "fas fa-tshirt",
            brand: "DenimCo",
            sizes: ["28", "30", "32", "34", "36"],
            colors: ["Azul oscuro", "Azul claro", "Negro"]
        },
        {
            id: 6,
            name: "Lámpara de Pie Moderna",
            description: "Lámpara de pie con diseño moderno y regulador de intensidad, perfecta para salón o dormitorio",
            category: "home",
            price: 89.99,
            originalPrice: 119.99,
            rating: 4.2,
            reviews: 45,
            stock: 12,
            fastDelivery: true,
            freeShipping: false,
            tags: ["iluminación", "moderna", "regulable", "diseño"],
            imageClass: "home",
            icon: "fas fa-lightbulb",
            brand: "LightStyle",
            power: "60W",
            height: "160 cm"
        },
        {
            id: 7,
            name: "iPhone 15 Pro",
            description: "iPhone 15 Pro con Dynamic Island, cámara profesional de 48MP y chip A17 Pro",
            category: "electronics",
            price: 999.99,
            originalPrice: 1199.99,
            rating: 4.9,
            reviews: 512,
            stock: 32,
            fastDelivery: true,
            freeShipping: true,
            tags: ["smartphone", "apple", "pro", "nuevo"],
            imageClass: "electronics",
            icon: "fas fa-mobile-alt",
            brand: "Apple",
            storage: ["128GB", "256GB", "512GB"],
            color: ["Titanio negro", "Titanio blanco", "Titanio azul"]
        },
        {
            id: 8,
            name: "Zapatillas Running Premium",
            description: "Zapatillas de running con amortiguación reactiva y tecnología de ventilación activa",
            category: "sports",
            price: 149.99,
            originalPrice: 189.99,
            rating: 4.5,
            reviews: 189,
            stock: 21,
            fastDelivery: true,
            freeShipping: true,
            tags: ["running", "deporte", "zapatillas", "premium"],
            imageClass: "sports",
            icon: "fas fa-running",
            brand: "RunFast",
            sizes: ["38", "39", "40", "41", "42", "43", "44"],
            weight: "280g"
        },
        {
            id: 9,
            name: "Set de Cuchillos Profesional",
            description: "Set de 6 cuchillos profesionales de acero inoxidable con soporte de madera",
            category: "home",
            price: 129.99,
            originalPrice: 159.99,
            rating: 4.6,
            reviews: 98,
            stock: 17,
            fastDelivery: true,
            freeShipping: true,
            tags: ["cocina", "cuchillos", "profesional", "acero"],
            imageClass: "home",
            icon: "fas fa-utensils",
            brand: "ChefPro",
            material: "Acero inoxidable",
            pieces: 6
        },
        {
            id: 10,
            name: "Monitor Gaming 4K 144Hz",
            description: "Monitor gaming de 27 pulgadas con resolución 4K, frecuencia 144Hz y tecnología HDR",
            category: "electronics",
            price: 599.99,
            originalPrice: 749.99,
            rating: 4.7,
            reviews: 267,
            stock: 14,
            fastDelivery: true,
            freeShipping: true,
            tags: ["gaming", "monitor", "4k", "144hz"],
            imageClass: "electronics",
            icon: "fas fa-desktop",
            brand: "GameScreen",
            size: "27 pulgadas",
            resolution: "3840 x 2160"
        },
        {
            id: 11,
            name: "Set de Maquillaje Profesional",
            description: "Set completo de maquillaje profesional con 24 sombras, pinceles y base",
            category: "beauty",
            price: 79.99,
            originalPrice: 99.99,
            rating: 4.4,
            reviews: 134,
            stock: 28,
            fastDelivery: true,
            freeShipping: false,
            tags: ["maquillaje", "beauty", "profesional", "set"],
            imageClass: "beauty",
            icon: "fas fa-palette",
            brand: "BeautyPro",
            pieces: 36,
            crueltyFree: true
        },
        {
            id: 12,
            name: "Libro: El Arte de la Programación",
            description: "Guía completa sobre algoritmos y estructuras de datos para desarrolladores",
            category: "books",
            price: 39.99,
            originalPrice: 49.99,
            rating: 4.8,
            reviews: 89,
            stock: 56,
            fastDelivery: false,
            freeShipping: true,
            tags: ["programación", "libro", "algoritmos", "educación"],
            imageClass: "books",
            icon: "fas fa-book",
            brand: "TechBooks",
            author: "Donald Knuth",
            pages: 672
        },
        {
            id: 13,
            name: "Smartwatch Fitness Tracker",
            description: "Smartwatch con monitor de frecuencia cardíaca, GPS y resistencia al agua",
            category: "electronics",
            price: 199.99,
            originalPrice: 249.99,
            rating: 4.3,
            reviews: 178,
            stock: 36,
            fastDelivery: true,
            freeShipping: true,
            tags: ["smartwatch", "fitness", "wearable", "salud"],
            imageClass: "electronics",
            icon: "fas fa-clock",
            brand: "FitTech",
            battery: "7 días",
            connectivity: ["Bluetooth", "GPS"]
        },
        {
            id: 14,
            name: "Chaqueta Impermeable Outdoor",
            description: "Chaqueta impermeable y transpirable para actividades outdoor",
            category: "sports",
            price: 129.99,
            originalPrice: 159.99,
            rating: 4.5,
            reviews: 92,
            stock: 19,
            fastDelivery: true,
            freeShipping: true,
            tags: ["outdoor", "impermeable", "chaqueta", "deporte"],
            imageClass: "sports",
            icon: "fas fa-hiking",
            brand: "OutdoorPro",
            sizes: ["S", "M", "L", "XL"],
            waterproof: "10000mm"
        },
        {
            id: 15,
            name: "Robot Aspirador Inteligente",
            description: "Robot aspirador con navegación láser y aplicación móvil para programación",
            category: "home",
            price: 349.99,
            originalPrice: 429.99,
            rating: 4.6,
            reviews: 213,
            stock: 11,
            fastDelivery: true,
            freeShipping: true,
            tags: ["robot", "aspirador", "inteligente", "hogar"],
            imageClass: "home",
            icon: "fas fa-robot",
            brand: "CleanTech",
            suction: "2500Pa",
            battery: "150 min"
        },
        {
            id: 16,
            name: "Auriculares Inalámbricos Premium",
            description: "Auriculares inalámbricos con cancelación de ruido activa y sonido Hi-Res",
            category: "electronics",
            price: 279.99,
            originalPrice: 349.99,
            rating: 4.7,
            reviews: 321,
            stock: 24,
            fastDelivery: true,
            freeShipping: true,
            tags: ["auriculares", "inalámbricos", "premium", "audio"],
            imageClass: "electronics",
            icon: "fas fa-headphones",
            brand: "SoundMax",
            battery: "30 horas",
            noiseCancelling: true
        },
        {
            id: 17,
            name: "Sartén Antiadherente Cerámica",
            description: "Sartén antiadherente de cerámica libre de PFOA, apta para todo tipo de cocinas",
            category: "home",
            price: 49.99,
            originalPrice: 69.99,
            rating: 4.4,
            reviews: 167,
            stock: 47,
            fastDelivery: true,
            freeShipping: false,
            tags: ["cocina", "sartén", "cerámica", "antiadherente"],
            imageClass: "home",
            icon: "fas fa-utensil-spoon",
            brand: "KitchenSafe",
            diameter: "28 cm",
            material: "Cerámica"
        },
        {
            id: 18,
            name: "Cámara Mirrorless 4K",
            description: "Cámara mirrorless con sensor full frame y grabación de video 4K a 60fps",
            category: "electronics",
            price: 1499.99,
            originalPrice: 1799.99,
            rating: 4.9,
            reviews: 189,
            stock: 9,
            fastDelivery: true,
            freeShipping: true,
            tags: ["cámara", "fotografía", "4k", "profesional"],
            imageClass: "electronics",
            icon: "fas fa-camera",
            brand: "PhotoPro",
            sensor: "Full Frame 35mm",
            resolution: "24.2 MP"
        },
        {
            id: 19,
            name: "Yoga Mat Premium",
            description: "Colchoneta de yoga extra gruesa con diseño antideslizante y kit de accesorios",
            category: "sports",
            price: 39.99,
            originalPrice: 59.99,
            rating: 4.3,
            reviews: 145,
            stock: 63,
            fastDelivery: true,
            freeShipping: true,
            tags: ["yoga", "fitness", "colchoneta", "salud"],
            imageClass: "sports",
            icon: "fas fa-spa",
            brand: "ZenYoga",
            thickness: "6 mm",
            material: "TPE ecológico"
        },
        {
            id: 20,
            name: "E-reader con Luz Cálida",
            description: "E-reader de 7 pulgadas con luz cálida ajustable y resistencia al agua",
            category: "electronics",
            price: 159.99,
            originalPrice: 199.99,
            rating: 4.5,
            reviews: 98,
            stock: 31,
            fastDelivery: true,
            freeShipping: true,
            tags: ["ebook", "lector", "digital", "libros"],
            imageClass: "electronics",
            icon: "fas fa-tablet-alt",
            brand: "ReadWell",
            storage: "32GB",
            battery: "6 semanas"
        }
    ];
    
    /**
     * Inicializa el buscador
     */
    function init() {
        console.log('🚀 Inicializando buscador avanzado...');
        
        // Cargar elementos DOM
        loadElements();
        
        // Verificar elementos críticos
        if (!elements.resultsGrid || !elements.searchInput) {
            console.error('❌ Elementos críticos del DOM no encontrados');
            return;
        }
        
        // Cargar historial de búsquedas
        loadSearchHistory();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Configurar controles de precio
        setupPriceControls();
        
        // Aplicar filtros iniciales desde URL o localStorage
        applyInitialFilters();
        
        // Renderizar productos iniciales
        renderProducts();
        
        console.log('✅ Buscador avanzado inicializado correctamente');
    }
    
    /**
     * Carga elementos del DOM
     */
    function loadElements() {
        const ids = [
            'search', 'category', 'minPrice', 'maxPrice', 'rating5',
            'rating4', 'rating3', 'ratingAll', 'inStock', 'fastDelivery',
            'freeShipping', 'sort', 'applyFiltersBtn', 'clearBtn',
            'resultsGrid', 'resultsCount', 'currentPage', 'totalPages',
            'itemsShown', 'totalItems', 'prevBtn', 'nextBtn', 'itemsPerPage',
            'gridViewBtn', 'listViewBtn', 'loadingState', 'emptyState',
            'resetSearchBtn', 'mobileFiltersBtn', 'collapseFiltersBtn',
            'clearSearchBtn', 'activeFiltersList', 'mobileFilterCount',
            'searchSuggestions'
        ];
        
        ids.forEach(id => {
            elements[id] = document.getElementById(id);
        });
        
        // Agrupar elementos por tipo
        elements.ratingInputs = [
            elements.rating5, elements.rating4, 
            elements.rating3, elements.ratingAll
        ];
        
        elements.availabilityInputs = [
            elements.inStock, elements.fastDelivery, 
            elements.freeShipping
        ];
        
        elements.pricePresetButtons = document.querySelectorAll('.btn-price-preset');
    }
    
    /**
     * Configura event listeners
     */
    function setupEventListeners() {
        // Búsqueda en tiempo real con debouncing
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', debounce(handleSearchInput, config.debounceDelay));
            elements.searchInput.addEventListener('focus', showSearchSuggestions);
            elements.searchInput.addEventListener('blur', () => {
                setTimeout(hideSearchSuggestions, 200);
            });
        }
        
        // Botón para limpiar búsqueda
        if (elements.clearSearchBtn) {
            elements.clearSearchBtn.addEventListener('click', clearSearchInput);
        }
        
        // Cambios en filtros (excepto búsqueda que ya tiene debouncing)
        const filterElements = [
            elements.categorySelect,
            elements.sortSelect,
            elements.minPriceInput,
            elements.maxPriceInput,
            ...elements.ratingInputs,
            ...elements.availabilityInputs
        ];
        
        filterElements.forEach(element => {
            if (element) {
                element.addEventListener('change', handleFilterChange);
            }
        });
        
        // Botón para aplicar filtros
        if (elements.applyFiltersBtn) {
            elements.applyFiltersBtn.addEventListener('click', applyFilters);
        }
        
        // Botón para limpiar filtros
        if (elements.clearBtn) {
            elements.clearBtn.addEventListener('click', clearAllFilters);
        }
        
        // Paginación
        if (elements.prevBtn) {
            elements.prevBtn.addEventListener('click', goToPrevPage);
        }
        
        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', goToNextPage);
        }
        
        // Cambiar cantidad de items por página
        if (elements.itemsPerPageSelect) {
            elements.itemsPerPageSelect.addEventListener('change', handleItemsPerPageChange);
        }
        
        // Cambiar vista (grid/list)
        if (elements.gridViewBtn) {
            elements.gridViewBtn.addEventListener('click', () => changeViewMode('grid'));
        }
        
        if (elements.listViewBtn) {
            elements.listViewBtn.addEventListener('click', () => changeViewMode('list'));
        }
        
        // Botón para resetear búsqueda
        if (elements.resetSearchBtn) {
            elements.resetSearchBtn.addEventListener('click', resetSearch);
        }
        
        // Botón para móviles (filtros)
        if (elements.mobileFiltersBtn) {
            elements.mobileFiltersBtn.addEventListener('click', toggleMobileFilters);
        }
        
        // Botón para colapsar filtros en desktop
        if (elements.collapseFiltersBtn) {
            elements.collapseFiltersBtn.addEventListener('click', toggleFiltersPanel);
        }
        
        // Presets de precio
        if (elements.pricePresetButtons) {
            elements.pricePresetButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    applyPricePreset(e.target.dataset.min, e.target.dataset.max);
                });
            });
        }
        
        // Navegación con teclado en sugerencias
        document.addEventListener('keydown', handleKeyboardNavigation);
        
        // Guardar estado al cerrar la página
        window.addEventListener('beforeunload', saveSearchState);
        
        // Cargar estado al volver a la página
        window.addEventListener('pageshow', loadSearchState);
    }
    
    /**
     * Configura controles de precio
     */
    function setupPriceControls() {
        const minPrice = elements.minPriceInput;
        const maxPrice = elements.maxPriceInput;
        const priceValue = document.getElementById('priceValue');
        const sliderRange = document.getElementById('sliderRange');
        
        if (!minPrice || !maxPrice || !priceValue || !sliderRange) return;
        
        const updatePriceDisplay = () => {
            const min = parseInt(minPrice.value);
            const max = parseInt(maxPrice.value);
            
            priceValue.textContent = `$${min} - $${max}`;
            
            // Actualizar rango visual
            const minPercent = (min / 1000) * 100;
            const maxPercent = (max / 1000) * 100;
            sliderRange.style.left = `${minPercent}%`;
            sliderRange.style.width = `${maxPercent - minPercent}%`;
            
            // Actualizar filtros
            currentFilters.minPrice = min;
            currentFilters.maxPrice = max;
        };
        
        minPrice.addEventListener('input', updatePriceDisplay);
        maxPrice.addEventListener('input', updatePriceDisplay);
        
        // Inicializar display
        updatePriceDisplay();
    }
    
    /**
     * Aplica filtros iniciales desde URL o localStorage
     */
    function applyInitialFilters() {
        // Cargar desde URL primero
        const params = new URLSearchParams(window.location.search);
        
        if (params.toString()) {
            // Hay parámetros en la URL, cargarlos
            loadFiltersFromURL();
        } else {
            // No hay parámetros, cargar desde localStorage
            loadFiltersFromStorage();
        }
        
        // Actualizar contador de filtros activos
        updateActiveFiltersCount();
    }
    
    /**
     * Maneja entrada de búsqueda
     */
    function handleSearchInput(e) {
        const searchTerm = e.target.value.trim();
        
        // Guardar en historial si no está vacío
        if (searchTerm) {
            addToSearchHistory(searchTerm);
        }
        
        // Actualizar filtros y renderizar
        currentFilters.search = searchTerm;
        currentPage = 1;
        
        // Mostrar sugerencias si hay término
        if (searchTerm.length > 0) {
            showSearchSuggestions();
        } else {
            hideSearchSuggestions();
        }
        
        renderProducts();
    }
    
    /**
     * Maneja cambio en filtros
     */
    function handleFilterChange(e) {
        const { name, value, type, checked } = e.target;
        
        // Resetear a página 1 cuando cambia un filtro
        currentPage = 1;
        
        // Manejar diferentes tipos de inputs
        if (type === 'checkbox') {
            currentFilters[name] = checked;
        } else if (type === 'radio' && name === 'rating') {
            currentFilters.rating = parseInt(value);
        } else {
            currentFilters[name] = value;
        }
        
        // Actualizar contador de filtros activos
        updateActiveFiltersCount();
        
        // Renderizar productos
        renderProducts();
    }
    
    /**
     * Aplica todos los filtros
     */
    function applyFilters() {
        // Mostrar estado de carga
        showLoadingState();
        
        // Actualizar URL con filtros actuales
        updateURLWithFilters();
        
        // Renderizar después de un breve delay para mejor UX
        setTimeout(() => {
            renderProducts();
            hideLoadingState();
            
            // Mostrar notificación de éxito
            showNotification('Filtros aplicados correctamente', 'success');
            
            // Guardar estado
            saveSearchState();
        }, 500);
    }
    
    /**
     * Limpia todos los filtros
     */
    function clearAllFilters() {
        if (!confirm('¿Estás seguro de que quieres limpiar todos los filtros?')) {
            return;
        }
        
        // Resetear formulario
        const form = document.getElementById('filterForm');
        if (form) form.reset();
        
        // Resetear filtros internos
        currentFilters = {};
        currentPage = 1;
        
        // Resetear controles de precio
        if (elements.minPriceInput) elements.minPriceInput.value = 0;
        if (elements.maxPriceInput) elements.maxPriceInput.value = 1000;
        setupPriceControls();
        
        // Limpiar URL
        window.history.replaceState({}, '', window.location.pathname);
        
        // Renderizar todos los productos
        renderProducts();
        
        // Actualizar contador de filtros
        updateActiveFiltersCount();
        
        // Mostrar notificación
        showNotification('Todos los filtros han sido limpiados', 'info');
        
        // Guardar estado limpio
        saveSearchState();
    }
    
    /**
     * Limpia el input de búsqueda
     */
    function clearSearchInput() {
        if (elements.searchInput) {
            elements.searchInput.value = '';
            elements.searchInput.focus();
            currentFilters.search = '';
            renderProducts();
            hideSearchSuggestions();
        }
    }
    
    /**
     * Aplica un preset de precio
     */
    function applyPricePreset(min, max) {
        if (elements.minPriceInput && elements.maxPriceInput) {
            elements.minPriceInput.value = min;
            elements.maxPriceInput.value = max;
            setupPriceControls();
            
            // Actualizar botones activos
            elements.pricePresetButtons.forEach(button => {
                button.classList.remove('active');
                if (button.dataset.min === min && button.dataset.max === max) {
                    button.classList.add('active');
                }
            });
            
            // Actualizar filtros
            currentFilters.minPrice = parseInt(min);
            currentFilters.maxPrice = parseInt(max);
            renderProducts();
        }
    }
    
    /**
     * Cambia el modo de vista (grid/list)
     */
    function changeViewMode(mode) {
        const grid = elements.resultsGrid;
        if (!grid) return;
        
        // Actualizar botones activos
        if (elements.gridViewBtn && elements.listViewBtn) {
            elements.gridViewBtn.classList.toggle('active', mode === 'grid');
            elements.listViewBtn.classList.toggle('active', mode === 'list');
        }
        
        // Cambiar clases del grid
        grid.classList.toggle('list-view', mode === 'list');
        grid.classList.toggle('grid-view', mode === 'grid');
        
        // Guardar preferencia
        localStorage.setItem('productViewMode', mode);
    }
    
    /**
     * Cambia la cantidad de items por página
     */
    function handleItemsPerPageChange(e) {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderProducts();
        
        // Guardar preferencia
        localStorage.setItem('itemsPerPage', itemsPerPage);
    }
    
    /**
     * Navega a página anterior
     */
    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
            scrollToResultsTop();
        }
    }
    
    /**
     * Navega a página siguiente
     */
    function goToNextPage() {
        const totalPages = calculateTotalPages();
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
            scrollToResultsTop();
        }
    }
    
    /**
     * Alterna panel de filtros en móviles
     */
    function toggleMobileFilters() {
        const filtersPanel = document.querySelector('.filters-panel');
        const mobileBtn = elements.mobileFiltersBtn;
        
        if (!filtersPanel || !mobileBtn) return;
        
        const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true';
        
        filtersPanel.classList.toggle('active', !isExpanded);
        mobileBtn.setAttribute('aria-expanded', !isExpanded);
        mobileBtn.classList.toggle('expanded', !isExpanded);
        
        // Actualizar texto del botón
        const btnText = mobileBtn.querySelector('.btn-text');
        if (btnText) {
            btnText.textContent = !isExpanded ? 'Cerrar' : 'Filtros';
        }
    }
    
    /**
     * Alterna panel de filtros en desktop
     */
    function toggleFiltersPanel() {
        const filtersPanel = document.querySelector('.filters-panel');
        const collapseBtn = elements.collapseFiltersBtn;
        
        if (!filtersPanel || !collapseBtn) return;
        
        const isCollapsed = filtersPanel.classList.contains('collapsed');
        
        filtersPanel.classList.toggle('collapsed', !isCollapsed);
        collapseBtn.setAttribute('aria-expanded', isCollapsed);
        collapseBtn.querySelector('i').classList.toggle('fa-chevron-left', isCollapsed);
        collapseBtn.querySelector('i').classList.toggle('fa-chevron-right', !isCollapsed);
        
        // Actualizar aria-label
        collapseBtn.setAttribute('aria-label', 
            isCollapsed ? 'Mostrar filtros' : 'Ocultar filtros'
        );
    }
    
    /**
     * Muestra sugerencias de búsqueda
     */
    function showSearchSuggestions() {
        const searchTerm = elements.searchInput?.value.trim();
        const suggestionsContainer = elements.searchSuggestions;
        
        if (!searchTerm || !suggestionsContainer) {
            hideSearchSuggestions();
            return;
        }
        
        // Obtener sugerencias del historial y productos
        const suggestions = getSearchSuggestions(searchTerm);
        
        if (suggestions.length > 0) {
            suggestionsContainer.innerHTML = suggestions.map(suggestion => `
                <div class="suggestion-item" data-suggestion="${suggestion}">
                    <i class="fas fa-history"></i>
                    <span>${suggestion}</span>
                </div>
            `).join('');
            
            suggestionsContainer.hidden = false;
            
            // Agregar event listeners a las sugerencias
            suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const suggestion = e.currentTarget.dataset.suggestion;
                    elements.searchInput.value = suggestion;
                    currentFilters.search = suggestion;
                    renderProducts();
                    hideSearchSuggestions();
                });
            });
        } else {
            hideSearchSuggestions();
        }
    }
    
    /**
     * Oculta sugerencias de búsqueda
     */
    function hideSearchSuggestions() {
        if (elements.searchSuggestions) {
            elements.searchSuggestions.hidden = true;
        }
    }
    
    /**
     * Maneja navegación con teclado en sugerencias
     */
    function handleKeyboardNavigation(e) {
        const suggestions = elements.searchSuggestions;
        if (!suggestions || suggestions.hidden) return;
        
        const items = suggestions.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;
        
        let currentIndex = -1;
        
        // Encontrar item actualmente seleccionado
        items.forEach((item, index) => {
            if (item.classList.contains('selected')) {
                currentIndex = index;
            }
        });
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % items.length;
                selectSuggestionItem(items, nextIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
                selectSuggestionItem(items, prevIndex);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (currentIndex >= 0) {
                    const selectedSuggestion = items[currentIndex].dataset.suggestion;
                    elements.searchInput.value = selectedSuggestion;
                    currentFilters.search = selectedSuggestion;
                    renderProducts();
                    hideSearchSuggestions();
                }
                break;
                
            case 'Escape':
                hideSearchSuggestions();
                break;
        }
    }
    
    /**
     * Selecciona un item de sugerencia
     */
    function selectSuggestionItem(items, index) {
        items.forEach(item => item.classList.remove('selected'));
        items[index].classList.add('selected');
        items[index].scrollIntoView({ block: 'nearest' });
    }
    
    /**
     * Obtiene sugerencias de búsqueda
     */
    function getSearchSuggestions(searchTerm) {
        const suggestions = new Set();
        
        // Agregar del historial
        searchHistory.forEach(term => {
            if (term.toLowerCase().includes(searchTerm.toLowerCase())) {
                suggestions.add(term);
            }
        });
        
        // Agregar de nombres de productos
        productsDatabase.forEach(product => {
            if (product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                suggestions.add(product.name);
            }
        });
        
        // Agregar de categorías
        const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Belleza', 'Libros'];
        categories.forEach(category => {
            if (category.toLowerCase().includes(searchTerm.toLowerCase())) {
                suggestions.add(category);
            }
        });
        
        return Array.from(suggestions).slice(0, config.maxSuggestions);
    }
    
    /**
     * Agrega término al historial de búsquedas
     */
    function addToSearchHistory(term) {
        // Evitar duplicados
        const index = searchHistory.indexOf(term);
        if (index > -1) {
            searchHistory.splice(index, 1);
        }
        
        // Agregar al inicio
        searchHistory.unshift(term);
        
        // Limitar tamaño
        if (searchHistory.length > config.maxHistoryItems) {
            searchHistory.pop();
        }
        
        // Guardar en localStorage
        saveSearchHistory();
    }
    
    /**
     * Guarda historial de búsquedas
     */
    function saveSearchHistory() {
        try {
            localStorage.setItem(config.localStorageKey, JSON.stringify(searchHistory));
        } catch (error) {
            console.error('Error al guardar historial de búsqueda:', error);
        }
    }
    
    /**
     * Carga historial de búsquedas
     */
    function loadSearchHistory() {
        try {
            const savedHistory = localStorage.getItem(config.localStorageKey);
            if (savedHistory) {
                searchHistory = JSON.parse(savedHistory);
            }
        } catch (error) {
            console.error('Error al cargar historial de búsqueda:', error);
            searchHistory = [];
        }
    }
    
    /**
     * Guarda estado de búsqueda actual
     */
    function saveSearchState() {
        try {
            const state = {
                filters: currentFilters,
                page: currentPage,
                itemsPerPage: itemsPerPage,
                viewMode: document.querySelector('.results-grid')?.classList.contains('list-view') ? 'list' : 'grid'
            };
            
            localStorage.setItem('productSearchState', JSON.stringify(state));
        } catch (error) {
            console.error('Error al guardar estado de búsqueda:', error);
        }
    }
    
    /**
     * Carga estado de búsqueda guardado
     */
    function loadSearchState() {
        try {
            const savedState = localStorage.getItem('productSearchState');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                currentFilters = state.filters || {};
                currentPage = state.page || 1;
                itemsPerPage = state.itemsPerPage || 24;
                
                // Aplicar vista guardada
                if (state.viewMode === 'list') {
                    changeViewMode('list');
                }
                
                // Actualizar UI con filtros cargados
                updateUIWithFilters();
            }
        } catch (error) {
            console.error('Error al cargar estado de búsqueda:', error);
        }
    }
    
    /**
     * Carga filtros desde URL
     */
    function loadFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        params.forEach((value, key) => {
            if (key === 'page') {
                currentPage = parseInt(value) || 1;
            } else if (key === 'itemsPerPage') {
                itemsPerPage = parseInt(value) || 24;
            } else {
                currentFilters[key] = value;
            }
        });
        
        // Actualizar UI
        updateUIWithFilters();
    }
    
    /**
     * Carga filtros desde localStorage
     */
    function loadFiltersFromStorage() {
        try {
            const savedFilters = localStorage.getItem('productSearchFilters');
            if (savedFilters) {
                currentFilters = JSON.parse(savedFilters);
                updateUIWithFilters();
            }
        } catch (error) {
            console.error('Error al cargar filtros:', error);
        }
    }
    
    /**
     * Actualiza UI con filtros actuales
     */
    function updateUIWithFilters() {
        // Actualizar inputs de búsqueda
        if (elements.searchInput && currentFilters.search) {
            elements.searchInput.value = currentFilters.search;
        }
        
        // Actualizar selects
        if (elements.categorySelect && currentFilters.category) {
            elements.categorySelect.value = currentFilters.category;
        }
        
        if (elements.sortSelect && currentFilters.sort) {
            elements.sortSelect.value = currentFilters.sort;
        }
        
        // Actualizar precio
        if (elements.minPriceInput && currentFilters.minPrice) {
            elements.minPriceInput.value = currentFilters.minPrice;
        }
        
        if (elements.maxPriceInput && currentFilters.maxPrice) {
            elements.maxPriceInput.value = currentFilters.maxPrice;
        }
        
        // Actualizar rating
        if (currentFilters.rating && elements.ratingInputs) {
            elements.ratingInputs.forEach(input => {
                if (input && input.value === currentFilters.rating.toString()) {
                    input.checked = true;
                }
            });
        }
        
        // Actualizar disponibilidad
        if (elements.availabilityInputs) {
            elements.availabilityInputs.forEach(input => {
                if (input && currentFilters[input.name] !== undefined) {
                    input.checked = currentFilters[input.name];
                }
            });
        }
        
        // Actualizar items por página
        if (elements.itemsPerPageSelect && itemsPerPage) {
            elements.itemsPerPageSelect.value = itemsPerPage;
        }
        
        // Re-configurar controles de precio
        setupPriceControls();
    }
    
    /**
     * Actualiza URL con filtros actuales
     */
    function updateURLWithFilters() {
        const params = new URLSearchParams();
        
        // Agregar filtros activos
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== false) {
                params.set(key, value.toString());
            }
        });
        
        // Agregar paginación
        params.set('page', currentPage.toString());
        params.set('itemsPerPage', itemsPerPage.toString());
        
        // Actualizar URL sin recargar
        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newURL);
    }
    
    /**
     * Renderiza productos según filtros actuales
     */
    function renderProducts() {
        // Mostrar estado de carga
        showLoadingState();
        
        // Filtrar productos
        const filteredProducts = filterProducts();
        
        // Ordenar productos
        const sortedProducts = sortProducts(filteredProducts);
        
        // Calcular paginación
        const totalProducts = sortedProducts.length;
        const totalPages = calculateTotalPages(totalProducts);
        
        // Ajustar página actual si es necesario
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        // Obtener productos para la página actual
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const productsToShow = sortedProducts.slice(startIndex, endIndex);
        
        // Renderizar productos
        renderProductsGrid(productsToShow);
        
        // Actualizar información de paginación
        updatePaginationInfo(totalProducts, totalPages);
        
        // Actualizar contador de resultados
        updateResultsCount(totalProducts);
        
        // Actualizar filtros activos en UI
        updateActiveFiltersUI();
        
        // Ocultar estado de carga
        setTimeout(() => {
            hideLoadingState();
            
            // Mostrar estado vacío si no hay productos
            if (totalProducts === 0) {
                showEmptyState();
            } else {
                hideEmptyState();
            }
        }, 500);
        
        // Guardar estado
        saveSearchState();
    }
    
    /**
     * Filtra productos según filtros actuales
     */
    function filterProducts() {
        return productsDatabase.filter(product => {
            // Filtro de búsqueda por texto
            if (currentFilters.search) {
                const searchTerm = currentFilters.search.toLowerCase();
                const matchesName = product.name.toLowerCase().includes(searchTerm);
                const matchesDescription = product.description.toLowerCase().includes(searchTerm);
                const matchesBrand = product.brand.toLowerCase().includes(searchTerm);
                const matchesTags = product.tags.some(tag => 
                    tag.toLowerCase().includes(searchTerm)
                );
                
                if (!(matchesName || matchesDescription || matchesBrand || matchesTags)) {
                    return false;
                }
            }
            
            // Filtro por categoría
            if (currentFilters.category && product.category !== currentFilters.category) {
                return false;
            }
            
            // Filtro por precio
            if (currentFilters.minPrice && product.price < currentFilters.minPrice) {
                return false;
            }
            
            if (currentFilters.maxPrice && product.price > currentFilters.maxPrice) {
                return false;
            }
            
            // Filtro por rating
            if (currentFilters.rating && product.rating < currentFilters.rating) {
                return false;
            }
            
            // Filtro por disponibilidad
            if (currentFilters.inStock === true && product.stock === 0) {
                return false;
            }
            
            if (currentFilters.fastDelivery === true && !product.fastDelivery) {
                return false;
            }
            
            if (currentFilters.freeShipping === true && !product.freeShipping) {
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * Ordena productos según criterio seleccionado
     */
    function sortProducts(products) {
        const sortBy = currentFilters.sort || 'relevance';
        
        switch (sortBy) {
            case 'price_asc':
                return [...products].sort((a, b) => a.price - b.price);
                
            case 'price_desc':
                return [...products].sort((a, b) => b.price - a.price);
                
            case 'rating':
                return [...products].sort((a, b) => b.rating - a.rating);
                
            case 'newest':
                return [...products].sort((a, b) => b.id - a.id);
                
            case 'popular':
                return [...products].sort((a, b) => b.reviews - a.reviews);
                
            default: // relevance
                return products;
        }
    }
    
    /**
     * Calcula total de páginas
     */
    function calculateTotalPages(totalProducts) {
        return Math.ceil(totalProducts / itemsPerPage) || 1;
    }
    
    /**
     * Renderiza grid de productos
     */
    function renderProductsGrid(products) {
        const grid = elements.resultsGrid;
        if (!grid) return;
        
        // Verificar si estamos en modo lista
        const isListView = grid.classList.contains('list-view');
        
        if (products.length === 0) {
            grid.innerHTML = '';
            return;
        }
        
        grid.innerHTML = products.map(product => {
            const discount = product.originalPrice > product.price 
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;
            
            const stars = generateStarRating(product.rating);
            const isNew = product.id > productsDatabase.length - 5;
            const isPopular = product.reviews > 100;
            
            return `
                <div class="product-card ${isListView ? 'list-view' : ''}">
                    ${discount > 0 ? `<div class="product-badge sale">-${discount}%</div>` : ''}
                    ${isNew ? '<div class="product-badge new">Nuevo</div>' : ''}
                    ${isPopular ? '<div class="product-badge popular">Popular</div>' : ''}
                    
                    <div class="product-image ${product.imageClass}">
                        <div class="product-image-content">
                            <i class="${product.icon}"></i>
                            <div class="product-image-text">${product.brand}</div>
                        </div>
                    </div>
                    
                    <div class="product-content">
                        <div class="product-header">
                            <div class="product-category">
                                <i class="fas fa-tag"></i>
                                ${getCategoryName(product.category)}
                            </div>
                            <h3 class="product-title">${product.name}</h3>
                        </div>
                        
                        <p class="product-description">${product.description}</p>
                        
                        <div class="product-meta">
                            <div class="product-price">
                                ${product.originalPrice > product.price 
                                    ? `<span class="old-price">$${product.originalPrice}</span>` 
                                    : ''
                                }
                                <span>$${product.price}</span>
                            </div>
                            
                            <div class="product-rating">
                                <div class="rating-stars">
                                    ${stars}
                                </div>
                                <span class="rating-value">${product.rating.toFixed(1)}</span>
                                <span class="rating-count">(${product.reviews})</span>
                            </div>
                        </div>
                        
                        <div class="product-details">
                            <div class="detail-item">
                                <i class="fas fa-box"></i>
                                <span>Stock: ${product.stock} unidades</span>
                            </div>
                            ${product.fastDelivery 
                                ? '<div class="detail-item"><i class="fas fa-shipping-fast"></i> Envío rápido</div>' 
                                : ''
                            }
                            ${product.freeShipping 
                                ? '<div class="detail-item"><i class="fas fa-truck"></i> Envío gratis</div>' 
                                : ''
                            }
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn-product-action btn-view-details" data-id="${product.id}">
                                <i class="fas fa-eye"></i>
                                <span>Ver detalles</span>
                            </button>
                            <button class="btn-product-action btn-add-cart" data-id="${product.id}">
                                <i class="fas fa-shopping-cart"></i>
                                <span>Añadir al carrito</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Agregar event listeners a los botones de producto
        addProductEventListeners();
    }
    
    /**
     * Agrega event listeners a productos individuales
     */
    function addProductEventListeners() {
        // Botones de ver detalles
        document.querySelectorAll('.btn-view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.id);
                viewProductDetails(productId);
            });
        });
        
        // Botones de añadir al carrito
        document.querySelectorAll('.btn-add-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.id);
                addToCart(productId);
            });
        });
    }
    
    /**
     * Muestra detalles de producto
     */
    function viewProductDetails(productId) {
        const product = productsDatabase.find(p => p.id === productId);
        if (!product) return;
        
        // Crear modal de detalles
        const modal = createProductModal(product);
        document.body.appendChild(modal);
        
        // Mostrar modal con animación
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Event listener para cerrar modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('btn-close-modal')) {
                modal.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            }
        });
        
        // Añadir al historial de visualizaciones
        addToViewHistory(productId);
    }
    
    /**
     * Crea modal de detalles de producto
     */
    function createProductModal(product) {
        const stars = generateStarRating(product.rating);
        const discount = product.originalPrice > product.price 
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;
        
        return document.createRange().createContextualFragment(`
            <div class="product-modal">
                <div class="modal-content">
                    <button class="btn-close-modal" aria-label="Cerrar">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="modal-body">
                        <div class="modal-image ${product.imageClass}">
                            <div class="modal-image-content">
                                <i class="${product.icon} fa-4x"></i>
                            </div>
                        </div>
                        
                        <div class="modal-details">
                            <div class="modal-header">
                                <span class="modal-category">${getCategoryName(product.category)}</span>
                                <h2 class="modal-title">${product.name}</h2>
                                <div class="modal-rating">
                                    ${stars}
                                    <span>${product.rating.toFixed(1)} (${product.reviews} reseñas)</span>
                                </div>
                            </div>
                            
                            <div class="modal-description">
                                <h3>Descripción</h3>
                                <p>${product.description}</p>
                            </div>
                            
                            <div class="modal-specs">
                                <h3>Especificaciones</h3>
                                <ul>
                                    <li><strong>Marca:</strong> ${product.brand}</li>
                                    ${product.weight ? `<li><strong>Peso:</strong> ${product.weight}</li>` : ''}
                                    ${product.dimensions ? `<li><strong>Dimensiones:</strong> ${product.dimensions}</li>` : ''}
                                    ${product.sizes ? `<li><strong>Tallas:</strong> ${product.sizes.join(', ')}</li>` : ''}
                                    ${product.colors ? `<li><strong>Colores:</strong> ${product.colors.join(', ')}</li>` : ''}
                                    <li><strong>Stock disponible:</strong> ${product.stock} unidades</li>
                                    <li><strong>Envío rápido:</strong> ${product.fastDelivery ? 'Sí' : 'No'}</li>
                                    <li><strong>Envío gratis:</strong> ${product.freeShipping ? 'Sí' : 'No'}</li>
                                </ul>
                            </div>
                            
                            <div class="modal-price">
                                ${discount > 0 
                                    ? `<div class="price-discount">-${discount}%</div>` 
                                    : ''
                                }
                                <div class="price-current">
                                    ${product.originalPrice > product.price 
                                        ? `<span class="price-old">$${product.originalPrice}</span>` 
                                        : ''
                                    }
                                    <span class="price-new">$${product.price}</span>
                                </div>
                            </div>
                            
                            <div class="modal-actions">
                                <button class="btn btn-primary btn-add-to-cart" data-id="${product.id}">
                                    <i class="fas fa-shopping-cart"></i>
                                    Añadir al carrito
                                </button>
                                <button class="btn btn-secondary btn-buy-now" data-id="${product.id}">
                                    <i class="fas fa-bolt"></i>
                                    Comprar ahora
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).firstElementChild;
    }
    
    /**
     * Añade producto al carrito
     */
    function addToCart(productId) {
        const product = productsDatabase.find(p => p.id === productId);
        if (!product) return;
        
        // Simular añadir al carrito
        showNotification(`"${product.name}" añadido al carrito`, 'success');
        
        // Aquí normalmente se llamaría a una API o se actualizaría el estado global del carrito
        
        // Animación de feedback
        const button = document.querySelector(`.btn-add-cart[data-id="${productId}"]`);
        if (button) {
            button.classList.add('added');
            setTimeout(() => {
                button.classList.remove('added');
            }, 1000);
        }
    }
    
    /**
     * Añade producto al historial de visualizaciones
     */
    function addToViewHistory(productId) {
        try {
            const viewHistory = JSON.parse(localStorage.getItem('productViewHistory') || '[]');
            
            // Evitar duplicados
            const index = viewHistory.indexOf(productId);
            if (index > -1) {
                viewHistory.splice(index, 1);
            }
            
            // Agregar al inicio
            viewHistory.unshift(productId);
            
            // Limitar tamaño
            if (viewHistory.length > 20) {
                viewHistory.pop();
            }
            
            localStorage.setItem('productViewHistory', JSON.stringify(viewHistory));
        } catch (error) {
            console.error('Error al guardar historial de visualizaciones:', error);
        }
    }
    
    /**
     * Genera rating con estrellas
     */
    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Estrellas llenas
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Media estrella
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Estrellas vacías
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    /**
     * Obtiene nombre de categoría legible
     */
    function getCategoryName(categoryKey) {
        const categories = {
            electronics: 'Electrónica',
            clothing: 'Ropa y Accesorios',
            home: 'Hogar y Jardín',
            sports: 'Deportes y Aire Libre',
            beauty: 'Belleza y Cuidado Personal',
            books: 'Libros y Educación'
        };
        
        return categories[categoryKey] || categoryKey;
    }
    
    /**
     * Actualiza información de paginación
     */
    function updatePaginationInfo(totalProducts, totalPages) {
        // Actualizar números de página
        if (elements.currentPageSpan) {
            elements.currentPageSpan.textContent = currentPage;
        }
        
        if (elements.totalPagesSpan) {
            elements.totalPagesSpan.textContent = totalPages;
        }
        
        // Actualizar contadores de items
        if (elements.itemsShownSpan) {
            const start = Math.min((currentPage - 1) * itemsPerPage + 1, totalProducts);
            const end = Math.min(currentPage * itemsPerPage, totalProducts);
            elements.itemsShownSpan.textContent = `${start}-${end}`;
        }
        
        if (elements.totalItemsSpan) {
            elements.totalItemsSpan.textContent = totalProducts;
        }
        
        // Actualizar estado de botones de paginación
        if (elements.prevBtn) {
            elements.prevBtn.disabled = currentPage <= 1;
        }
        
        if (elements.nextBtn) {
            elements.nextBtn.disabled = currentPage >= totalPages;
        }
    }
    
    /**
     * Actualiza contador de resultados
     */
    function updateResultsCount(totalProducts) {
        if (elements.resultsCount) {
            const countElement = elements.resultsCount.querySelector('.count-number');
            if (countElement) {
                countElement.textContent = totalProducts;
            }
        }
    }
    
    /**
     * Actualiza filtros activos en UI
     */
    function updateActiveFiltersUI() {
        const activeFiltersList = elements.activeFiltersList;
        const activeFiltersContainer = elements.activeFiltersList?.parentElement;
        
        if (!activeFiltersList || !activeFiltersContainer) return;
        
        // Limpiar lista actual
        activeFiltersList.innerHTML = '';
        
        // Contar filtros activos
        let activeCount = 0;
        
        // Filtro de búsqueda
        if (currentFilters.search) {
            activeCount++;
            activeFiltersList.appendChild(createActiveFilterTag(
                'search',
                `Buscar: "${currentFilters.search}"`
            ));
        }
        
        // Filtro de categoría
        if (currentFilters.category) {
            activeCount++;
            activeFiltersList.appendChild(createActiveFilterTag(
                'category',
                `Categoría: ${getCategoryName(currentFilters.category)}`
            ));
        }
        
        // Filtro de precio
        if (currentFilters.minPrice || currentFilters.maxPrice) {
            activeCount++;
            const min = currentFilters.minPrice || 0;
            const max = currentFilters.maxPrice || 1000;
            activeFiltersList.appendChild(createActiveFilterTag(
                'price',
                `Precio: $${min} - $${max}`
            ));
        }
        
        // Filtro de rating
        if (currentFilters.rating && currentFilters.rating > 0) {
            activeCount++;
            activeFiltersList.appendChild(createActiveFilterTag(
                'rating',
                `Rating: ${currentFilters.rating}+ estrellas`
            ));
        }
        
        // Filtros de disponibilidad
        if (currentFilters.inStock === true) {
            activeCount++;
            activeFiltersList.appendChild(createActiveFilterTag(
                'inStock',
                'En stock'
            ));
        }
        
        if (currentFilters.fastDelivery === true) {
            activeCount++;
            activeFiltersList.appendChild(createActiveFilterTag(
                'fastDelivery',
                'Envío rápido'
            ));
        }
        
        if (currentFilters.freeShipping === true) {
            activeCount++;
            activeFiltersList.appendChild(createActiveFilterTag(
                'freeShipping',
                'Envío gratis'
            ));
        }
        
        // Mostrar/ocultar contenedor de filtros activos
        if (activeCount > 0) {
            activeFiltersContainer.hidden = false;
            
            // Actualizar contador en botón móvil
            if (elements.mobileFilterCount) {
                elements.mobileFilterCount.textContent = activeCount;
                elements.mobileFilterCount.style.display = 'flex';
            }
        } else {
            activeFiltersContainer.hidden = true;
            
            // Ocultar contador en botón móvil
            if (elements.mobileFilterCount) {
                elements.mobileFilterCount.style.display = 'none';
            }
        }
    }
    
    /**
     * Crea etiqueta de filtro activo
     */
    function createActiveFilterTag(filterKey, label) {
        const div = document.createElement('div');
        div.className = 'active-filter-tag';
        div.innerHTML = `
            <span>${label}</span>
            <button class="btn-remove-filter" data-filter="${filterKey}" aria-label="Remover filtro">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Event listener para remover filtro
        div.querySelector('.btn-remove-filter').addEventListener('click', (e) => {
            removeFilter(filterKey);
            e.stopPropagation();
        });
        
        return div;
    }
    
    /**
     * Remueve un filtro específico
     */
    function removeFilter(filterKey) {
        switch (filterKey) {
            case 'search':
                currentFilters.search = '';
                if (elements.searchInput) elements.searchInput.value = '';
                break;
                
            case 'category':
                currentFilters.category = '';
                if (elements.categorySelect) elements.categorySelect.value = '';
                break;
                
            case 'price':
                currentFilters.minPrice = undefined;
                currentFilters.maxPrice = undefined;
                if (elements.minPriceInput) elements.minPriceInput.value = 0;
                if (elements.maxPriceInput) elements.maxPriceInput.value = 1000;
                setupPriceControls();
                break;
                
            case 'rating':
                currentFilters.rating = undefined;
                if (elements.ratingAll) elements.ratingAll.checked = true;
                break;
                
            default:
                currentFilters[filterKey] = undefined;
                const input = document.querySelector(`[name="${filterKey}"]`);
                if (input) input.checked = false;
        }
        
        renderProducts();
    }
    
    /**
     * Actualiza contador de filtros activos
     */
    function updateActiveFiltersCount() {
        let count = 0;
        
        // Contar filtros no vacíos
        Object.values(currentFilters).forEach(value => {
            if (value !== undefined && value !== '' && value !== false) {
                count++;
            }
        });
        
        // Actualizar badge móvil
        if (elements.mobileFilterCount) {
            if (count > 0) {
                elements.mobileFilterCount.textContent = count;
                elements.mobileFilterCount.style.display = 'flex';
            } else {
                elements.mobileFilterCount.style.display = 'none';
            }
        }
    }
    
    /**
     * Muestra estado de carga
     */
    function showLoadingState() {
        if (elements.loadingState) {
            elements.loadingState.hidden = false;
            elements.resultsGrid.style.opacity = '0.5';
            elements.resultsGrid.style.pointerEvents = 'none';
        }
    }
    
    /**
     * Oculta estado de carga
     */
    function hideLoadingState() {
        if (elements.loadingState) {
            elements.loadingState.hidden = true;
            elements.resultsGrid.style.opacity = '1';
            elements.resultsGrid.style.pointerEvents = 'auto';
        }
    }
    
    /**
     * Muestra estado vacío
     */
    function showEmptyState() {
        if (elements.emptyState) {
            elements.emptyState.hidden = false;
            elements.resultsGrid.style.display = 'none';
        }
    }
    
    /**
     * Oculta estado vacío
     */
    function hideEmptyState() {
        if (elements.emptyState) {
            elements.emptyState.hidden = true;
            elements.resultsGrid.style.display = 'grid';
        }
    }
    
    /**
     * Resetea búsqueda
     */
    function resetSearch() {
        clearAllFilters();
        
        // Scroll al inicio
        scrollToResultsTop();
        
        showNotification('Búsqueda reiniciada', 'info');
    }
    
    /**
     * Scroll al inicio de resultados
     */
    function scrollToResultsTop() {
        const resultsContainer = document.querySelector('.results-container');
        if (resultsContainer) {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    /**
     * Muestra notificación
     */
    function showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
            color: white;
            border-radius: var(--border-radius-sm);
            box-shadow: var(--shadow-xl);
            z-index: var(--z-tooltip);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            font-weight: 500;
        `;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    /**
     * Debounce para optimizar rendimiento
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // API pública del módulo
    return {
        init,
        applyFilters,
        clearAllFilters,
        resetSearch,
        toggleMobileFilters,
        toggleFiltersPanel
    };
})();

// ==========================================================================
// INICIALIZACIÓN Y CSS ADICIONAL
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Agregar animaciones CSS adicionales si no existen
    if (!document.querySelector('style[data-search-animations]')) {
        const style = document.createElement('style');
        style.setAttribute('data-search-animations', 'true');
        style.textContent = `
            /* Animaciones para el buscador */
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Modal de producto */
            .product-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: var(--z-modal);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--spacing-md);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .product-modal.show {
                opacity: 1;
            }
            
            .modal-content {
                background: var(--bg-card);
                border-radius: var(--border-radius-lg);
                max-width: 900px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                animation: fadeIn 0.3s ease;
                box-shadow: var(--shadow-xxl);
            }
            
            .btn-close-modal {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: var(--bg-hover);
                border: none;
                border-radius: 50%;
                width: 40px;
            height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--text-tertiary);
                transition: all var(--transition-fast);
                z-index: 1;
            }
            
            .btn-close-modal:hover {
                background: var(--danger-color);
                color: white;
                transform: rotate(90deg);
            }
            
            .modal-body {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: var(--spacing-xl);
                padding: var(--spacing-xl);
            }
            
            @media (max-width: 768px) {
                .modal-body {
                    grid-template-columns: 1fr;
                }
            }
            
            .modal-image {
                border-radius: var(--border-radius-lg);
                overflow: hidden;
                height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-details {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
            }
            
            .modal-category {
                font-size: var(--font-size-sm);
                color: var(--text-tertiary);
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 600;
            }
            
            .modal-title {
                font-size: var(--font-size-xxxl);
                font-weight: 700;
                color: var(--text-primary);
                line-height: 1.2;
            }
            
            .modal-rating {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                color: var(--text-secondary);
            }
            
            .modal-description h3,
            .modal-specs h3 {
                font-size: var(--font-size-lg);
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: var(--spacing-sm);
            }
            
            .modal-specs ul {
                list-style: none;
                padding-left: 0;
            }
            
            .modal-specs li {
                padding: var(--spacing-xs) 0;
                border-bottom: 1px solid var(--border-color);
                color: var(--text-secondary);
            }
            
            .modal-specs li:last-child {
                border-bottom: none;
            }
            
            .modal-price {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding: var(--spacing-lg);
                background: var(--bg-hover);
                border-radius: var(--border-radius-md);
            }
            
            .price-discount {
                background: var(--danger-color);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: var(--border-radius-sm);
                font-weight: 700;
                font-size: var(--font-size-lg);
            }
            
            .price-current {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }
            
            .price-old {
                font-size: var(--font-size-lg);
                color: var(--text-tertiary);
                text-decoration: line-through;
            }
            
            .price-new {
                font-size: var(--font-size-xxxl);
                font-weight: 800;
                color: var(--primary-color);
            }
            
            .modal-actions {
                display: flex;
                gap: var(--spacing-md);
            }
            
            @media (max-width: 576px) {
                .modal-actions {
                    flex-direction: column;
                }
            }
            
            /* Detalles de producto en cards */
            .product-details {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-sm);
                margin-top: var(--spacing-md);
                font-size: var(--font-size-xs);
            }
            
            .detail-item {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                padding: 0.25rem 0.5rem;
                background: var(--bg-hover);
                border-radius: var(--border-radius-sm);
                color: var(--text-secondary);
            }
            
            .detail-item i {
                color: var(--primary-color);
                font-size: 0.8em;
            }
            
            /* Rating count */
            .rating-count {
                font-size: var(--font-size-xs);
                color: var(--text-tertiary);
            }
            
            /* Animación para añadir al carrito */
            .btn-add-cart.added {
                background: var(--success-color) !important;
                border-color: var(--success-color) !important;
                color: white !important;
                transform: scale(0.95);
            }
            
            /* Sugerencias de búsqueda */
            .search-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--bg-card);
                border-radius: var(--border-radius-sm);
                box-shadow: var(--shadow-xl);
                margin-top: var(--spacing-xs);
                z-index: var(--z-dropdown);
                max-height: 300px;
                overflow-y: auto;
            }
            
            .suggestion-item {
                padding: var(--spacing-sm) var(--spacing-md);
                cursor: pointer;
                transition: all var(--transition-fast);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                color: var(--text-secondary);
            }
            
            .suggestion-item:hover,
            .suggestion-item.selected {
                background: var(--bg-hover);
                color: var(--text-primary);
            }
            
            .suggestion-item i {
                color: var(--text-tertiary);
                font-size: 0.9em;
            }
            
            /* Loading state animations */
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid var(--border-color);
                border-top-color: var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .loading-text {
                font-size: var(--font-size-lg);
                font-weight: 600;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
            }
            
            /* Empty state */
            .empty-state {
                text-align: center;
                padding: var(--spacing-xxl) var(--spacing-xl);
                background: var(--bg-hover);
                border-radius: var(--border-radius-lg);
                border: 2px dashed var(--border-color);
            }
            
            .empty-icon {
                font-size: 4rem;
                color: var(--border-color);
                margin-bottom: var(--spacing-lg);
                opacity: 0.5;
            }
            
            .empty-title {
                font-size: var(--font-size-xl);
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: var(--spacing-sm);
            }
            
            .empty-description {
                font-size: var(--font-size-md);
                color: var(--text-secondary);
                margin-bottom: var(--spacing-xl);
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
            }
            
            /* Notification */
            .notification {
                font-family: var(--font-family);
            }
            
            /* Active filters */
            .active-filter-tag {
                display: inline-flex;
                align-items: center;
                gap: var(--spacing-xs);
                padding: 0.5rem 0.75rem;
                background: var(--bg-light);
                border: 2px solid var(--primary-color);
                border-radius: var(--border-radius-sm);
                font-size: var(--font-size-xs);
                font-weight: 500;
                color: var(--primary-color);
                animation: fadeIn 0.3s ease;
            }
            
            .btn-remove-filter {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 0.125rem;
                border-radius: 50%;
                font-size: 0.75rem;
                transition: background-color var(--transition-fast);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn-remove-filter:hover {
                background: rgba(0, 0, 0, 0.1);
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .product-card.list-view {
                    flex-direction: column;
                }
                
                .product-card.list-view .product-image {
                    width: 100%;
                    height: 200px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('🚀 Iniciando buscador avanzado...');
    
    // Inicializar el buscador
    try {
        ProductSearch.init();
        
        // Debug: mostrar estado inicial
        setTimeout(() => {
            console.log('🎯 Buscador listo. Puedes probar:');
            console.log('   • Buscar: "laptop" o "ropa"');
            console.log('   • Filtrar por categoría: Electrónica');
            console.log('   • Usar el rango de precio: $0 - $500');
            console.log('   • Cambiar vista: grid/list');
        }, 1000);
        
    } catch (error) {
        console.error('💥 Error crítico al inicializar el buscador:', error);
        alert('Error al inicializar el buscador. Por favor, recarga la página.');
    }
});

// Hacer disponible globalmente para debugging
window.ProductSearch = ProductSearch;
