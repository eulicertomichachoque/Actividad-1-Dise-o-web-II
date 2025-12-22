/**
 * MÓDULO: Configuración y Constantes
 */
const APIConfig = {
    // URLs de APIs
    API_ENDPOINTS: {
        FETCH_USER: 'https://jsonplaceholder.typicode.com/users/1',
        FETCH_POSTS: 'https://jsonplaceholder.typicode.com/posts?_limit=3',
        RANDOM_USER: 'https://randomuser.me/api/'
    },
    
    // Colores para Canvas
    CANVAS_COLORS: [
        '#667eea', '#764ba2', '#4caf50', '#ff9800', '#f44336', '#2196f3',
        '#9c27b0', '#009688', '#ff5722', '#607d8b'
    ],
    
    // Notificaciones
    NOTIFICATION_OPTIONS: {
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDBDOC45NTQzMSAwIDAgOC45NTQzMSAwIDIwQzAgMzEuMDQ1NyA4Ljk1NDMxIDQwIDIwIDQwQzMxLjA0NTcgNDAgNDAgMzEuMDQ1NyA0MCAyMEM0MCA4Ljk1NDMxIDMxLjA0NTcgMCAyMCAwWiIgZmlsbD0iIzY2N0VFQSIvPgo8cGF0aCBkPSJNMjMgMjZIMTdDMjIgMjYgMjIgMTkgMjIgMTlDMTggMTkgMTYgMjIgMTYgMjVIMjRDMjQgMjIgMjIgMTkgMjIgMTlDMjIgMTkgMjIgMjYgMjMgMjZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjEgMjhIMTlDMjMgMjggMjMgMjYgMjMgMjZIMTdDMTcgMjYgMTcgMjggMjEgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
        badge: 'https://cdn-icons-png.flaticon.com/512/561/561127.png'
    },
    
    // Mensajes predefinidos
    MESSAGES: {
        SUCCESS: '✓ Operación completada exitosamente',
        ERROR: '❌ Ocurrió un error',
        LOADING: '⏳ Cargando...',
        NO_SUPPORT: '⚠ Esta API no está soportada en tu navegador'
    },
    
    // Tiempos (en milisegundos)
    TIMERS: {
        NOTIFICATION_DURATION: 5000,
        AUTO_SAVE_DELAY: 3000,
        SPEECH_RATE: 1.0,
        SPEECH_PITCH: 1.0
    }
};

/**
 * MÓDULO: Elementos del DOM
 */
const DOM = {
    // Geolocation
    getLocationBtn: document.getElementById('getLocation'),
    locationResult: document.getElementById('locationResult'),
    
    // LocalStorage
    storageInput: document.getElementById('storageInput'),
    saveStorageBtn: document.getElementById('saveStorage'),
    loadStorageBtn: document.getElementById('loadStorage'),
    clearStorageBtn: document.getElementById('clearStorage'),
    storageResult: document.getElementById('storageResult'),
    
    // Fetch API
    fetchDataBtn: document.getElementById('fetchData'),
    fetchResult: document.getElementById('fetchResult'),
    fetchLoading: document.getElementById('fetchLoading'),
    
    // Canvas API
    canvas: document.getElementById('myCanvas'),
    drawRectBtn: document.getElementById('drawRect'),
    drawCircleBtn: document.getElementById('drawCircle'),
    drawLineBtn: document.getElementById('drawLine'),
    clearCanvasBtn: document.getElementById('clearCanvas'),
    
    // Drag & Drop
    draggables: document.querySelectorAll('.draggable'),
    zones: document.querySelectorAll('.zone'),
    
    // Notification API
    requestNotificationBtn: document.getElementById('requestNotification'),
    showNotificationBtn: document.getElementById('showNotification'),
    notificationResult: document.getElementById('notificationResult'),
    
    // Audio API
    audioPlayer: document.getElementById('audioPlayer'),
    playAudioBtn: document.getElementById('playAudio'),
    pauseAudioBtn: document.getElementById('pauseAudio'),
    changeVolumeBtn: document.getElementById('changeVolume'),
    
    // Speech Synthesis
    speechText: document.getElementById('speechText'),
    speakTextBtn: document.getElementById('speakText'),
    pauseSpeechBtn: document.getElementById('pauseSpeech'),
    resumeSpeechBtn: document.getElementById('resumeSpeech'),
    stopSpeechBtn: document.getElementById('stopSpeech'),
    
    // UI
    toast: document.getElementById('toast'),
    permissionModal: document.getElementById('permissionModal'),
    closeModalBtn: document.getElementById('closeModal')
};

/**
 * MÓDULO: Utilidades de seguridad y validación
 */
const SecurityUtils = {
    /**
     * Sanitiza texto para prevenir XSS
     */
    sanitize(text) {
        if (typeof text !== 'string') return text;
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Crea elementos de forma segura
     */
    createElementSafe(tag, content, className = '', attributes = {}) {
        const element = document.createElement(tag);
        
        if (content) {
            element.textContent = content;
        }
        
        if (className) {
            element.className = className;
        }
        
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        return element;
    },
    
    /**
     * Valida entrada de texto
     */
    validateInput(text, maxLength = 500) {
        if (!text || typeof text !== 'string') {
            return { isValid: false, error: 'Entrada inválida' };
        }
        
        const trimmed = text.trim();
        
        if (trimmed.length === 0) {
            return { isValid: false, error: 'El texto no puede estar vacío' };
        }
        
        if (trimmed.length > maxLength) {
            return { isValid: false, error: `Máximo ${maxLength} caracteres` };
        }
        
        return { isValid: true, value: trimmed };
    },
    
    /**
     * Verifica si una API está soportada
     */
    isAPISupported(apiName) {
        const supportedAPIs = {
            'geolocation': 'geolocation' in navigator,
            'localStorage': 'localStorage' in window,
            'fetch': 'fetch' in window,
            'canvas': 'HTMLCanvasElement' in window,
            'dragdrop': 'draggable' in document.documentElement,
            'notifications': 'Notification' in window,
            'audio': 'HTMLAudioElement' in window,
            'speech': 'speechSynthesis' in window
        };
        
        return supportedAPIs[apiName] || false;
    }
};

/**
 * MÓDULO: Utilidades de UI
 */
const UIUtils = {
    /**
     * Muestra un mensaje toast
     */
    showToast(message, type = 'info') {
        const toast = DOM.toast;
        const icon = type === 'success' ? '✓' : 
                    type === 'error' ? '❌' : 
                    type === 'warning' ? '⚠' : 'ℹ';
        
        toast.querySelector('.toast-message').textContent = `${icon} ${message}`;
        
        // Actualizar color según tipo
        toast.style.background = type === 'success' ? 'var(--color-accent)' :
                                type === 'error' ? 'var(--color-danger)' :
                                type === 'warning' ? 'var(--color-warning)' :
                                'var(--color-gray-800)';
        
        // Mostrar toast
        toast.hidden = false;
        toast.classList.add('show');
        
        // Ocultar después de tiempo
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.hidden = true;
            }, 300);
        }, 3000);
    },
    
    /**
     * Muestra/oculta indicador de carga
     */
    setLoading(element, isLoading) {
        if (isLoading) {
            element.classList.add('loading');
            element.setAttribute('aria-busy', 'true');
        } else {
            element.classList.remove('loading');
            element.removeAttribute('aria-busy');
        }
    },
    
    /**
     * Actualiza un elemento de resultado
     */
    updateResult(element, content, type = 'info') {
        element.innerHTML = '';
        element.className = 'result';
        
        if (type === 'success') {
            element.classList.add('success');
        } else if (type === 'error') {
            element.classList.add('error');
        }
        
        if (typeof content === 'string') {
            element.innerHTML = SecurityUtils.sanitize(content);
        } else if (content instanceof HTMLElement) {
            element.appendChild(content);
        }
        
        // Anunciar a lectores de pantalla
        this.announceToScreenReader(`Resultado actualizado: ${content}`);
    },
    
    /**
     * Anuncia cambios a lectores de pantalla
     */
    announceToScreenReader(message) {
        const announcement = SecurityUtils.createElementSafe(
            'div',
            message,
            'visually-hidden',
            {
                'role': 'status',
                'aria-live': 'polite',
                'aria-atomic': 'true'
            }
        );
        
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 100);
    },
    
    /**
     * Muestra/oculta modal
     */
    toggleModal(modal, show) {
        if (show) {
            modal.removeAttribute('hidden');
            setTimeout(() => modal.classList.add('active'), 10);
            // Atrapar focus dentro del modal
            const firstFocusable = modal.querySelector('button, input, [tabindex]');
            if (firstFocusable) firstFocusable.focus();
        } else {
            modal.classList.remove('active');
            setTimeout(() => modal.hidden = true, 300);
        }
    },
    
    /**
     * Formatea coordenadas geográficas
     */
    formatCoordinates(lat, lon) {
        return {
            lat: lat.toFixed(6),
            lon: lon.toFixed(6),
            dms: {
                lat: this.decimalToDMS(lat, true),
                lon: this.decimalToDMS(lon, false)
            }
        };
    },
    
    /**
     * Convierte decimal a grados, minutos, segundos
     */
    decimalToDMS(decimal, isLatitude) {
        const absolute = Math.abs(decimal);
        const degrees = Math.floor(absolute);
        const minutesNotTruncated = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesNotTruncated);
        const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
        
        const direction = isLatitude 
            ? (decimal >= 0 ? 'N' : 'S')
            : (decimal >= 0 ? 'E' : 'W');
        
        return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
    }
};

/**
 * MÓDULO: Geolocation API
 */
const GeolocationAPI = {
    ctx: null,
    
    init() {
        this.ctx = DOM.locationResult;
        
        if (!SecurityUtils.isAPISupported('geolocation')) {
            UIUtils.updateResult(this.ctx, APIConfig.MESSAGES.NO_SUPPORT, 'error');
            DOM.getLocationBtn.disabled = true;
            return;
        }
    },
    
    async getCurrentLocation() {
        try {
            UIUtils.setLoading(DOM.getLocationBtn, true);
            UIUtils.updateResult(this.ctx, APIConfig.MESSAGES.LOADING);
            
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });
            
            const { latitude, longitude, accuracy } = position.coords;
            const formatted = UIUtils.formatCoordinates(latitude, longitude);
            
            const content = document.createDocumentFragment();
            
            // Coordenadas decimales
            const decimalSection = SecurityUtils.createElementSafe('div', '', 'result-section');
            decimalSection.appendChild(SecurityUtils.createElementSafe('h4', 'Coordenadas Decimales'));
            decimalSection.appendChild(SecurityUtils.createElementSafe('p', `Latitud: ${formatted.lat}`));
            decimalSection.appendChild(SecurityUtils.createElementSafe('p', `Longitud: ${formatted.lon}`));
            
            // Coordenadas DMS
            const dmsSection = SecurityUtils.createElementSafe('div', '', 'result-section');
            dmsSection.appendChild(SecurityUtils.createElementSafe('h4', 'Coordenadas DMS'));
            dmsSection.appendChild(SecurityUtils.createElementSafe('p', `Latitud: ${formatted.dms.lat}`));
            dmsSection.appendChild(SecurityUtils.createElementSafe('p', `Longitud: ${formatted.dms.lon}`));
            
            // Metadatos
            const metaSection = SecurityUtils.createElementSafe('div', '', 'result-section');
            metaSection.appendChild(SecurityUtils.createElementSafe('h4', 'Información Adicional'));
            metaSection.appendChild(SecurityUtils.createElementSafe('p', `Precisión: ${accuracy.toFixed(0)} metros`));
            metaSection.appendChild(SecurityUtils.createElementSafe('p', `Altitud: ${position.coords.altitude ? position.coords.altitude.toFixed(0) + ' metros' : 'No disponible'}`));
            metaSection.appendChild(SecurityUtils.createElementSafe('p', `Hora: ${new Date(position.timestamp).toLocaleString()}`));
            
            content.appendChild(decimalSection);
            content.appendChild(dmsSection);
            content.appendChild(metaSection);
            
            UIUtils.updateResult(this.ctx, content, 'success');
            UIUtils.showToast('Ubicación obtenida exitosamente', 'success');
            
            // Intentar obtener dirección (opcional)
            // this.getAddressFromCoordinates(latitude, longitude);
            
        } catch (error) {
            console.error('Geolocation error:', error);
            
            let errorMessage;
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Permiso denegado. Por favor, habilita la geolocalización en tu navegador.';
                    UIUtils.toggleModal(DOM.permissionModal, true);
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Información de ubicación no disponible.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Tiempo de espera agotado. Intenta nuevamente.';
                    break;
                default:
                    errorMessage = `Error desconocido: ${error.message}`;
            }
            
            UIUtils.updateResult(this.ctx, errorMessage, 'error');
            UIUtils.showToast(errorMessage, 'error');
        } finally {
            UIUtils.setLoading(DOM.getLocationBtn, false);
        }
    },
    
    async getAddressFromCoordinates(lat, lon) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await response.json();
            
            if (data.address) {
                const addressElement = SecurityUtils.createElementSafe('div', '', 'result-section');
                addressElement.appendChild(SecurityUtils.createElementSafe('h4', 'Dirección aproximada'));
                
                const addressParts = [];
                if (data.address.road) addressParts.push(data.address.road);
                if (data.address.city) addressParts.push(data.address.city);
                if (data.address.state) addressParts.push(data.address.state);
                if (data.address.country) addressParts.push(data.address.country);
                
                addressElement.appendChild(
                    SecurityUtils.createElementSafe('p', addressParts.join(', '))
                );
                
                this.ctx.appendChild(addressElement);
            }
        } catch (error) {
            // Silently fail - this is just an extra feature
            console.log('Reverse geocoding failed:', error);
        }
    }
};

/**
 * MÓDULO: LocalStorage API
 */
const LocalStorageAPI = {
    STORAGE_KEY: 'explorer_api_data',
    MAX_STORAGE_SIZE: 1024 * 5, // 5KB
    
    init() {
        if (!SecurityUtils.isAPISupported('localStorage')) {
            UIUtils.updateResult(DOM.storageResult, APIConfig.MESSAGES.NO_SUPPORT, 'error');
            DOM.saveStorageBtn.disabled = true;
            DOM.loadStorageBtn.disabled = true;
            DOM.clearStorageBtn.disabled = true;
            return;
        }
        
        this.loadSavedData();
        this.setupAutoSave();
    },
    
    /**
     * Guarda datos en localStorage
     */
    saveData() {
        try {
            const validation = SecurityUtils.validateInput(DOM.storageInput.value);
            
            if (!validation.isValid) {
                UIUtils.updateResult(DOM.storageResult, validation.error, 'error');
                UIUtils.showToast(validation.error, 'error');
                return;
            }
            
            const data = {
                text: validation.value,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                lastUpdated: Date.now()
            };
            
            // Verificar tamaño
            const dataSize = JSON.stringify(data).length;
            if (dataSize > this.MAX_STORAGE_SIZE) {
                UIUtils.updateResult(DOM.storageResult, 'El texto es demasiado grande', 'error');
                UIUtils.showToast('El texto excede el límite de almacenamiento', 'error');
                return;
            }
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            
            UIUtils.updateResult(DOM.storageResult, 
                `✓ Guardado exitosamente (${dataSize} bytes)`, 
                'success'
            );
            UIUtils.showToast('Datos guardados localmente', 'success');
            
            // Actualizar estado de botones
            DOM.clearStorageBtn.disabled = false;
            
        } catch (error) {
            console.error('LocalStorage save error:', error);
            UIUtils.updateResult(DOM.storageResult, 'Error al guardar datos', 'error');
            UIUtils.showToast('Error al guardar datos', 'error');
        }
    },
    
    /**
     * Carga datos desde localStorage
     */
    loadData() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            
            if (!saved) {
                UIUtils.updateResult(DOM.storageResult, 'No hay datos guardados', 'info');
                return;
            }
            
            const data = JSON.parse(saved);
            DOM.storageInput.value = data.text;
            
            const date = new Date(data.timestamp);
            const timeAgo = this.getTimeAgo(date);
            
            const content = document.createDocumentFragment();
            content.appendChild(SecurityUtils.createElementSafe('p', 
                `📅 Guardado: ${date.toLocaleString()}`
            ));
            content.appendChild(SecurityUtils.createElementSafe('p', 
                `⏱️ Hace: ${timeAgo}`
            ));
            content.appendChild(SecurityUtils.createElementSafe('p', 
                `📏 Tamaño: ${JSON.stringify(data).length} bytes`
            ));
            
            UIUtils.updateResult(DOM.storageResult, content, 'success');
            UIUtils.showToast('Datos cargados exitosamente', 'success');
            
        } catch (error) {
            console.error('LocalStorage load error:', error);
            UIUtils.updateResult(DOM.storageResult, 'Error al cargar datos', 'error');
            UIUtils.showToast('Error al cargar datos', 'error');
        }
    },
    
    /**
     * Limpia localStorage
     */
    clearData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            DOM.storageInput.value = '';
            
            UIUtils.updateResult(DOM.storageResult, '✓ Almacenamiento limpiado', 'success');
            UIUtils.showToast('Almacenamiento limpiado', 'success');
            
            // Actualizar estado de botones
            DOM.clearStorageBtn.disabled = true;
            
        } catch (error) {
            console.error('LocalStorage clear error:', error);
            UIUtils.updateResult(DOM.storageResult, 'Error al limpiar datos', 'error');
            UIUtils.showToast('Error al limpiar datos', 'error');
        }
    },
    
    /**
     * Carga datos al iniciar
     */
    loadSavedData() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                DOM.storageInput.value = data.text;
                DOM.clearStorageBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    },
    
    /**
     * Configura guardado automático
     */
    setupAutoSave() {
        let timeoutId;
        
        DOM.storageInput.addEventListener('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (DOM.storageInput.value.trim()) {
                    this.saveData();
                }
            }, APIConfig.TIMERS.AUTO_SAVE_DELAY);
        });
    },
    
    /**
     * Calcula tiempo transcurrido
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'hace unos segundos';
        if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
        if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
        return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    }
};

/**
 * MÓDULO: Fetch API
 */
const FetchAPI = {
    init() {
        if (!SecurityUtils.isAPISupported('fetch')) {
            UIUtils.updateResult(DOM.fetchResult, APIConfig.MESSAGES.NO_SUPPORT, 'error');
            DOM.fetchDataBtn.disabled = true;
            return;
        }
    },
    
    async fetchData() {
        try {
            UIUtils.setLoading(DOM.fetchDataBtn, true);
            DOM.fetchLoading.hidden = false;
            
            const [userResponse, postsResponse] = await Promise.all([
                fetch(APIConfig.API_ENDPOINTS.FETCH_USER),
                fetch(APIConfig.API_ENDPOINTS.FETCH_POSTS)
            ]);
            
            if (!userResponse.ok || !postsResponse.ok) {
                throw new Error(`HTTP error! status: ${userResponse.status}`);
            }
            
            const [userData, postsData] = await Promise.all([
                userResponse.json(),
                postsResponse.json()
            ]);
            
            this.displayResults(userData, postsData);
            UIUtils.showToast('Datos cargados exitosamente', 'success');
            
        } catch (error) {
            console.error('Fetch error:', error);
            
            const errorContent = document.createDocumentFragment();
            errorContent.appendChild(SecurityUtils.createElementSafe('p', 
                '❌ Error al cargar datos'
            ));
            errorContent.appendChild(SecurityUtils.createElementSafe('p', 
                `Detalle: ${error.message}`
            ));
            errorContent.appendChild(SecurityUtils.createElementSafe('button',
                '🔄 Reintentar',
                'btn btn-secondary retry-btn'
            ));
            
            UIUtils.updateResult(DOM.fetchResult, errorContent, 'error');
            
            // Agregar event listener al botón de reintento
            DOM.fetchResult.querySelector('.retry-btn')?.addEventListener('click', () => {
                this.fetchData();
            });
            
            UIUtils.showToast('Error al cargar datos', 'error');
            
        } finally {
            UIUtils.setLoading(DOM.fetchDataBtn, false);
            DOM.fetchLoading.hidden = true;
        }
    },
    
    displayResults(user, posts) {
        const content = document.createDocumentFragment();
        
        // Información del usuario
        const userSection = SecurityUtils.createElementSafe('div', '', 'result-section');
        userSection.appendChild(SecurityUtils.createElementSafe('h4', '👤 Información del Usuario'));
        userSection.appendChild(SecurityUtils.createElementSafe('p', `Nombre: ${user.name}`));
        userSection.appendChild(SecurityUtils.createElementSafe('p', `Email: ${user.email}`));
        userSection.appendChild(SecurityUtils.createElementSafe('p', `Ciudad: ${user.address.city}`));
        userSection.appendChild(SecurityUtils.createElementSafe('p', `Empresa: ${user.company.name}`));
        content.appendChild(userSection);
        
        // Posts recientes
        if (posts && posts.length > 0) {
            const postsSection = SecurityUtils.createElementSafe('div', '', 'result-section');
            postsSection.appendChild(SecurityUtils.createElementSafe('h4', '📝 Posts Recientes'));
            
            posts.forEach(post => {
                const postElement = SecurityUtils.createElementSafe('details', '', 'post-item');
                const summary = SecurityUtils.createElementSafe('summary', post.title);
                const body = SecurityUtils.createElementSafe('p', post.body);
                
                postElement.appendChild(summary);
                postElement.appendChild(body);
                postsSection.appendChild(postElement);
            });
            
            content.appendChild(postsSection);
        }
        
        // Estadísticas
        const statsSection = SecurityUtils.createElementSafe('div', '', 'result-section');
        statsSection.appendChild(SecurityUtils.createElementSafe('h4', '📊 Estadísticas'));
        statsSection.appendChild(SecurityUtils.createElementSafe('p', 
            `Total de posts cargados: ${posts.length}`
        ));
        statsSection.appendChild(SecurityUtils.createElementSafe('p', 
            `Hora de la solicitud: ${new Date().toLocaleTimeString()}`
        ));
        content.appendChild(statsSection);
        
        UIUtils.updateResult(DOM.fetchResult, content, 'success');
    }
};

/**
 * MÓDULO: Canvas API
 */
const CanvasAPI = {
    ctx: null,
    shapes: [],
    
    init() {
        this.ctx = DOM.canvas.getContext('2d');
        
        if (!this.ctx) {
            UIUtils.showToast('Canvas no soportado en este navegador', 'error');
            DOM.drawRectBtn.disabled = true;
            DOM.drawCircleBtn.disabled = true;
            DOM.drawLineBtn.disabled = true;
            DOM.clearCanvasBtn.disabled = true;
            return;
        }
        
        this.setupCanvas();
    },
    
    setupCanvas() {
        // Establecer tamaño responsive
        const resizeCanvas = () => {
            const container = DOM.canvas.parentElement;
            DOM.canvas.width = container.clientWidth;
            DOM.canvas.height = 200;
            this.redraw();
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Agregar interacción de clic
        DOM.canvas.addEventListener('click', (e) => {
            const rect = DOM.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.drawRandomShape(x, y);
        });
    },
    
    drawRandomShape(x, y) {
        const shapes = ['circle', 'rectangle', 'triangle'];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        
        switch (randomShape) {
            case 'circle':
                this.drawCircle(x, y);
                break;
            case 'rectangle':
                this.drawRectangle(x, y);
                break;
            case 'triangle':
                this.drawTriangle(x, y);
                break;
        }
    },
    
    drawRectangle(customX = null, customY = null) {
        const x = customX !== null ? customX : Math.random() * (DOM.canvas.width - 100);
        const y = customY !== null ? customY : Math.random() * (DOM.canvas.height - 100);
        const width = 40 + Math.random() * 60;
        const height = 40 + Math.random() * 60;
        const color = APIConfig.CANVAS_COLORS[Math.floor(Math.random() * APIConfig.CANVAS_COLORS.length)];
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        
        // Agregar borde
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        this.shapes.push({ type: 'rectangle', x, y, width, height, color });
        UIUtils.announceToScreenReader('Rectángulo dibujado');
    },
    
    drawCircle(customX = null, customY = null) {
        const x = customX !== null ? customX : Math.random() * DOM.canvas.width;
        const y = customY !== null ? customY : Math.random() * DOM.canvas.height;
        const radius = 20 + Math.random() * 30;
        const color = APIConfig.CANVAS_COLORS[Math.floor(Math.random() * APIConfig.CANVAS_COLORS.length)];
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Agregar borde
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.shapes.push({ type: 'circle', x, y, radius, color });
        UIUtils.announceToScreenReader('Círculo dibujado');
    },
    
    drawLine() {
        const x1 = Math.random() * DOM.canvas.width;
        const y1 = Math.random() * DOM.canvas.height;
        const x2 = Math.random() * DOM.canvas.width;
        const y2 = Math.random() * DOM.canvas.height;
        const color = APIConfig.CANVAS_COLORS[Math.floor(Math.random() * APIConfig.CANVAS_COLORS.length)];
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        
        this.shapes.push({ type: 'line', x1, y1, x2, y2, color });
        UIUtils.announceToScreenReader('Línea dibujada');
    },
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        this.shapes = [];
        UIUtils.showToast('Canvas limpiado', 'success');
        UIUtils.announceToScreenReader('Canvas limpiado');
    },
    
    redraw() {
        this.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        this.shapes.forEach(shape => {
            this.ctx.save();
            
            switch (shape.type) {
                case 'rectangle':
                    this.ctx.fillStyle = shape.color;
                    this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                    this.ctx.strokeStyle = '#333';
                    this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                    break;
                    
                case 'circle':
                    this.ctx.fillStyle = shape.color;
                    this.ctx.beginPath();
                    this.ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#333';
                    this.ctx.stroke();
                    break;
                    
                case 'line':
                    this.ctx.strokeStyle = shape.color;
                    this.ctx.lineWidth = 3;
                    this.ctx.lineCap = 'round';
                    this.ctx.beginPath();
                    this.ctx.moveTo(shape.x1, shape.y1);
                    this.ctx.lineTo(shape.x2, shape.y2);
                    this.ctx.stroke();
                    break;
            }
            
            this.ctx.restore();
        });
    }
};

/**
 * MÓDULO: Drag and Drop API
 */
const DragDropAPI = {
    currentDragging: null,
    draggedIndex: -1,
    
    init() {
        if (!SecurityUtils.isAPISupported('dragdrop')) {
            UIUtils.showToast('Drag & Drop no soportado', 'warning');
            return;
        }
        
        this.setupDraggables();
        this.setupDropZones();
        this.setupKeyboardNavigation();
    },
    
    setupDraggables() {
        DOM.draggables.forEach((draggable, index) => {
            // Configurar ARIA
            draggable.setAttribute('aria-label', `Elemento arrastrable ${index + 1}`);
            draggable.setAttribute('tabindex', '0');
            draggable.setAttribute('role', 'button');
            
            // Eventos de mouse/touch
            draggable.addEventListener('dragstart', this.handleDragStart.bind(this, draggable, index));
            draggable.addEventListener('dragend', this.handleDragEnd.bind(this));
            
            // Eventos de teclado
            draggable.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleKeyboardDragStart(draggable, index);
                }
            });
        });
    },
    
    setupDropZones() {
        DOM.zones.forEach(zone => {
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));
            
            // Para navegación por teclado
            zone.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && this.currentDragging) {
                    e.preventDefault();
                    this.handleKeyboardDrop(zone);
                }
            });
        });
    },
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentDragging) {
                this.cancelDrag();
            }
            
            if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && this.draggedIndex !== -1) {
                e.preventDefault();
                this.handleKeyboardMove(e.key);
            }
        });
    },
    
    handleDragStart(element, index, e) {
        this.currentDragging = element;
        this.draggedIndex = index;
        
        element.classList.add('dragging');
        element.setAttribute('aria-grabbed', 'true');
        
        // Configurar datos de transferencia
        e.dataTransfer.setData('text/plain', element.textContent);
        e.dataTransfer.effectAllowed = 'move';
        
        UIUtils.announceToScreenReader(`Arrastrando elemento: ${element.textContent}`);
    },
    
    handleKeyboardDragStart(element, index) {
        this.currentDragging = element;
        this.draggedIndex = index;
        
        element.classList.add('dragging');
        element.setAttribute('aria-grabbed', 'true');
        
        UIUtils.announceToScreenReader(`Modo arrastre activado para: ${element.textContent}. Usa las flechas para mover y Enter para soltar.`);
    },
    
    handleDragEnd() {
        if (this.currentDragging) {
            this.currentDragging.classList.remove('dragging');
            this.currentDragging.setAttribute('aria-grabbed', 'false');
            this.currentDragging = null;
            this.draggedIndex = -1;
            
            DOM.zones.forEach(zone => zone.classList.remove('dragover'));
            
            UIUtils.announceToScreenReader('Elemento soltado');
        }
    },
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const zone = e.currentTarget;
        zone.classList.add('dragover');
    },
    
    handleDragLeave(e) {
        const zone = e.currentTarget;
        zone.classList.remove('dragover');
    },
    
    handleDrop(e) {
        e.preventDefault();
        const zone = e.currentTarget;
        zone.classList.remove('dragover');
        
        if (this.currentDragging) {
            zone.appendChild(this.currentDragging);
            UIUtils.showToast(`Elemento movido a ${zone.id === 'zone1' ? 'Zona de origen' : 'Zona de destino'}`, 'success');
            UIUtils.announceToScreenReader(`Elemento movido a ${zone.id}`);
        }
        
        this.handleDragEnd();
    },
    
    handleKeyboardMove(key) {
        const items = Array.from(document.querySelectorAll('.draggable'));
        let newIndex = this.draggedIndex;
        
        if (key === 'ArrowUp' && newIndex > 0) {
            newIndex--;
        } else if (key === 'ArrowDown' && newIndex < items.length - 1) {
            newIndex++;
        } else {
            return;
        }
        
        // Reordenar elementos
        const parent = this.currentDragging.parentElement;
        const targetItem = items[newIndex];
        
        if (parent === targetItem.parentElement) {
            parent.insertBefore(this.currentDragging, 
                key === 'ArrowUp' ? targetItem : targetItem.nextSibling);
            this.draggedIndex = newIndex;
            
            UIUtils.announceToScreenReader(`Elemento movido a posición ${newIndex + 1}`);
        }
    },
    
    handleKeyboardDrop(zone) {
        if (this.currentDragging) {
            zone.appendChild(this.currentDragging);
            UIUtils.showToast(`Elemento movido a ${zone.id === 'zone1' ? 'Zona de origen' : 'Zona de destino'}`, 'success');
            UIUtils.announceToScreenReader(`Elemento soltado en ${zone.id}`);
            this.handleDragEnd();
        }
    },
    
    cancelDrag() {
        if (this.currentDragging) {
            this.currentDragging.classList.remove('dragging');
            this.currentDragging.setAttribute('aria-grabbed', 'false');
            this.currentDragging = null;
            this.draggedIndex = -1;
            
            UIUtils.announceToScreenReader('Arrastre cancelado');
        }
    }
};

/**
 * MÓDULO: Notification API
 */
const NotificationAPI = {
    permission: null,
    
    init() {
        if (!SecurityUtils.isAPISupported('notifications')) {
            UIUtils.updateResult(DOM.notificationResult, APIConfig.MESSAGES.NO_SUPPORT, 'error');
            DOM.requestNotificationBtn.disabled = true;
            DOM.showNotificationBtn.disabled = true;
            return;
        }
        
        this.checkPermission();
        this.setupServiceWorker();
    },
    
    async checkPermission() {
        this.permission = Notification.permission;
        
        if (this.permission === 'granted') {
            DOM.showNotificationBtn.disabled = false;
            UIUtils.updateResult(DOM.notificationResult, '✓ Permiso ya concedido', 'success');
        } else if (this.permission === 'denied') {
            DOM.requestNotificationBtn.disabled = true;
            UIUtils.updateResult(DOM.notificationResult, 'Permiso denegado previamente', 'error');
        }
    },
    
    async requestPermission() {
        try {
            UIUtils.setLoading(DOM.requestNotificationBtn, true);
            
            this.permission = await Notification.requestPermission();
            
            if (this.permission === 'granted') {
                DOM.showNotificationBtn.disabled = false;
                UIUtils.updateResult(DOM.notificationResult, '✓ Permiso concedido', 'success');
                UIUtils.showToast('Permiso para notificaciones concedido', 'success');
            } else {
                DOM.showNotificationBtn.disabled = true;
                UIUtils.updateResult(DOM.notificationResult, 'Permiso denegado', 'error');
                UIUtils.showToast('Permiso para notificaciones denegado', 'error');
            }
            
        } catch (error) {
            console.error('Notification permission error:', error);
            UIUtils.updateResult(DOM.notificationResult, 'Error al solicitar permiso', 'error');
            UIUtils.showToast('Error al solicitar permiso', 'error');
        } finally {
            UIUtils.setLoading(DOM.requestNotificationBtn, false);
        }
    },
    
    showNotification() {
        try {
            if (this.permission !== 'granted') {
                UIUtils.updateResult(DOM.notificationResult, 'Primero solicita permiso', 'error');
                return;
            }
            
            const notification = new Notification('🚀 Explorador de APIs HTML5', {
                body: '¡Esta es una notificación de demostración!',
                icon: APIConfig.NOTIFICATION_OPTIONS.icon,
                badge: APIConfig.NOTIFICATION_OPTIONS.badge,
                tag: 'api-explorer-notification',
                requireInteraction: false,
                vibrate: [200, 100, 200],
                data: {
                    url: window.location.href,
                    timestamp: Date.now()
                },
                actions: [
                    {
                        action: 'open',
                        title: 'Abrir sitio'
                    },
                    {
                        action: 'close',
                        title: 'Cerrar'
                    }
                ]
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            
            notification.onclose = () => {
                UIUtils.announceToScreenReader('Notificación cerrada');
            };
            
            notification.onshow = () => {
                UIUtils.updateResult(DOM.notificationResult, '✓ Notificación enviada', 'success');
                UIUtils.announceToScreenReader('Notificación mostrada');
                
                // Auto cerrar después de 5 segundos
                setTimeout(() => {
                    notification.close();
                }, APIConfig.TIMERS.NOTIFICATION_DURATION);
            };
            
        } catch (error) {
            console.error('Notification error:', error);
            UIUtils.updateResult(DOM.notificationResult, 'Error al mostrar notificación', 'error');
            UIUtils.showToast('Error al mostrar notificación', 'error');
        }
    },
    
    async setupServiceWorker() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('ServiceWorker registrado:', registration);
            } catch (error) {
                console.log('ServiceWorker registration failed:', error);
            }
        }
    }
};

/**
 * MÓDULO: Audio API
 */
const AudioAPI = {
    audioContext: null,
    analyser: null,
    source: null,
    volume: 0.5,
    
    init() {
        if (!SecurityUtils.isAPISupported('audio')) {
            UIUtils.showToast('Audio API no soportada completamente', 'warning');
            DOM.playAudioBtn.disabled = true;
            DOM.pauseAudioBtn.disabled = true;
            DOM.changeVolumeBtn.disabled = true;
            return;
        }
        
        this.setupAudio();
        this.setupVisualizer();
    },
    
    setupAudio() {
        // Configurar eventos del reproductor
        DOM.audioPlayer.volume = this.volume;
        
        // Actualizar botones según estado del audio
        DOM.audioPlayer.addEventListener('play', () => {
            DOM.playAudioBtn.disabled = true;
            DOM.pauseAudioBtn.disabled = false;
            UIUtils.announceToScreenReader('Audio reproduciéndose');
        });
        
        DOM.audioPlayer.addEventListener('pause', () => {
            DOM.playAudioBtn.disabled = false;
            DOM.pauseAudioBtn.disabled = true;
            UIUtils.announceToScreenReader('Audio pausado');
        });
        
        DOM.audioPlayer.addEventListener('ended', () => {
            DOM.playAudioBtn.disabled = false;
            DOM.pauseAudioBtn.disabled = true;
            UIUtils.announceToScreenReader('Audio finalizado');
        });
        
        DOM.audioPlayer.addEventListener('volumechange', () => {
            this.volume = DOM.audioPlayer.volume;
            DOM.changeVolumeBtn.textContent = `🔊 Volumen ${Math.round(this.volume * 100)}%`;
        });
    },
    
    setupVisualizer() {
        if (!window.AudioContext && !window.webkitAudioContext) {
            return; // No soportado
        }
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        
        // Crear analizador para visualización
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        
        // Conectar al elemento de audio
        this.source = this.audioContext.createMediaElementSource(DOM.audioPlayer);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    },
    
    play() {
        if (DOM.audioPlayer.paused) {
            DOM.audioPlayer.play().catch(error => {
                console.error('Audio play error:', error);
                UIUtils.showToast('Error al reproducir audio', 'error');
            });
        }
    },
    
    pause() {
        if (!DOM.audioPlayer.paused) {
            DOM.audioPlayer.pause();
        }
    },
    
    toggleVolume() {
        this.volume = this.volume === 0.5 ? 0.25 : this.volume === 0.25 ? 0.75 : 0.5;
        DOM.audioPlayer.volume = this.volume;
        
        const volumeText = `${Math.round(this.volume * 100)}%`;
        DOM.changeVolumeBtn.textContent = `🔊 Volumen ${volumeText}`;
        UIUtils.announceToScreenReader(`Volumen ajustado a ${volumeText}`);
    }
};

/**
 * MÓDULO: Speech Synthesis API
 */
const SpeechSynthesisAPI = {
    speechSynth: null,
    currentUtterance: null,
    isSpeaking: false,
    isPaused: false,
    
    init() {
        if (!SecurityUtils.isAPISupported('speech')) {
            UIUtils.showToast('Speech Synthesis no soportada', 'warning');
            DOM.speakTextBtn.disabled = true;
            DOM.pauseSpeechBtn.disabled = true;
            DOM.resumeSpeechBtn.disabled = true;
            DOM.stopSpeechBtn.disabled = true;
            return;
        }
        
        this.speechSynth = window.speechSynthesis;
        this.setupEventListeners();
        this.populateVoices();
    },
    
    setupEventListeners() {
        // Actualizar estado de botones según eventos
        this.speechSynth.addEventListener('start', () => {
            this.isSpeaking = true;
            this.isPaused = false;
            this.updateButtonStates();
            UIUtils.announceToScreenReader('Síntesis de voz iniciada');
        });
        
        this.speechSynth.addEventListener('end', () => {
            this.isSpeaking = false;
            this.isPaused = false;
            this.updateButtonStates();
            UIUtils.announceToScreenReader('Síntesis de voz finalizada');
        });
        
        this.speechSynth.addEventListener('pause', () => {
            this.isPaused = true;
            this.updateButtonStates();
            UIUtils.announceToScreenReader('Síntesis de voz pausada');
        });
        
        this.speechSynth.addEventListener('resume', () => {
            this.isPaused = false;
            this.updateButtonStates();
            UIUtils.announceToScreenReader('Síntesis de voz reanudada');
        });
    },
    
    populateVoices() {
        // En una versión mejorada, podríamos agregar un selector de voces
        const voices = this.speechSynth.getVoices();
        if (voices.length > 0) {
            console.log(`${voices.length} voces disponibles`);
        }
    },
    
    speak() {
        const validation = SecurityUtils.validateInput(DOM.speechText.value);
        
        if (!validation.isValid) {
            UIUtils.showToast(validation.error, 'error');
            return;
        }
        
        try {
            // Cancelar cualquier síntesis en curso
            this.speechSynth.cancel();
            
            // Crear nuevo utterance
            this.currentUtterance = new SpeechSynthesisUtterance(validation.value);
            
            // Configurar opciones
            this.currentUtterance.rate = APIConfig.TIMERS.SPEECH_RATE;
            this.currentUtterance.pitch = APIConfig.TIMERS.SPEECH_PITCH;
            this.currentUtterance.volume = 1;
            
            // Intentar usar voz en español si está disponible
            const voices = this.speechSynth.getVoices();
            const spanishVoice = voices.find(voice => 
                voice.lang.startsWith('es') || voice.name.toLowerCase().includes('spanish')
            );
            
            if (spanishVoice) {
                this.currentUtterance.voice = spanishVoice;
                this.currentUtterance.lang = 'es-ES';
            } else {
                this.currentUtterance.lang = 'es-ES';
            }
            
            // Eventos del utterance
            this.currentUtterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                UIUtils.showToast('Error en síntesis de voz', 'error');
                this.isSpeaking = false;
                this.isPaused = false;
                this.updateButtonStates();
            };
            
            // Iniciar síntesis
            this.speechSynth.speak(this.currentUtterance);
            UIUtils.showToast('Reproduciendo texto en voz', 'success');
            
        } catch (error) {
            console.error('Speech synthesis error:', error);
            UIUtils.showToast('Error al iniciar síntesis de voz', 'error');
        }
    },
    
    pause() {
        if (this.isSpeaking && !this.isPaused) {
            this.speechSynth.pause();
        }
    },
    
    resume() {
        if (this.isSpeaking && this.isPaused) {
            this.speechSynth.resume();
        }
    },
    
    stop() {
        if (this.isSpeaking || this.isPaused) {
            this.speechSynth.cancel();
            UIUtils.showToast('Síntesis de voz detenida', 'success');
        }
    },
    
    updateButtonStates() {
        DOM.speakTextBtn.disabled = this.isSpeaking;
        DOM.pauseSpeechBtn.disabled = !this.isSpeaking || this.isPaused;
        DOM.resumeSpeechBtn.disabled = !this.isSpeaking || !this.isPaused;
        DOM.stopSpeechBtn.disabled = !this.isSpeaking && !this.isPaused;
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
        this.setupGeolocation();
        this.setupLocalStorage();
        this.setupFetchAPI();
        this.setupCanvas();
        this.setupDragDrop();
        this.setupNotifications();
        this.setupAudio();
        this.setupSpeechSynthesis();
        this.setupUIEvents();
    },
    
    setupGeolocation() {
        DOM.getLocationBtn.addEventListener('click', () => {
            GeolocationAPI.getCurrentLocation();
        });
    },
    
    setupLocalStorage() {
        DOM.saveStorageBtn.addEventListener('click', () => {
            LocalStorageAPI.saveData();
        });
        
        DOM.loadStorageBtn.addEventListener('click', () => {
            LocalStorageAPI.loadData();
        });
        
        DOM.clearStorageBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas eliminar todos los datos guardados?')) {
                LocalStorageAPI.clearData();
            }
        });
    },
    
    setupFetchAPI() {
        DOM.fetchDataBtn.addEventListener('click', () => {
            FetchAPI.fetchData();
        });
    },
    
    setupCanvas() {
        DOM.drawRectBtn.addEventListener('click', () => {
            CanvasAPI.drawRectangle();
        });
        
        DOM.drawCircleBtn.addEventListener('click', () => {
            CanvasAPI.drawCircle();
        });
        
        DOM.drawLineBtn.addEventListener('click', () => {
            CanvasAPI.drawLine();
        });
        
        DOM.clearCanvasBtn.addEventListener('click', () => {
            CanvasAPI.clearCanvas();
        });
    },
    
    setupDragDrop() {
        // Ya configurado en DragDropAPI.init()
    },
    
    setupNotifications() {
        DOM.requestNotificationBtn.addEventListener('click', () => {
            NotificationAPI.requestPermission();
        });
        
        DOM.showNotificationBtn.addEventListener('click', () => {
            NotificationAPI.showNotification();
        });
    },
    
    setupAudio() {
        DOM.playAudioBtn.addEventListener('click', () => {
            AudioAPI.play();
        });
        
        DOM.pauseAudioBtn.addEventListener('click', () => {
            AudioAPI.pause();
        });
        
        DOM.changeVolumeBtn.addEventListener('click', () => {
            AudioAPI.toggleVolume();
        });
    },
    
    setupSpeechSynthesis() {
        DOM.speakTextBtn.addEventListener('click', () => {
            SpeechSynthesisAPI.speak();
        });
        
        DOM.pauseSpeechBtn.addEventListener('click', () => {
            SpeechSynthesisAPI.pause();
        });
        
        DOM.resumeSpeechBtn.addEventListener('click', () => {
            SpeechSynthesisAPI.resume();
        });
        
        DOM.stopSpeechBtn.addEventListener('click', () => {
            SpeechSynthesisAPI.stop();
        });
    },
    
    setupUIEvents() {
        // Cerrar modal
        DOM.closeModalBtn.addEventListener('click', () => {
            UIUtils.toggleModal(DOM.permissionModal, false);
        });
        
        // Cerrar modal al hacer clic fuera
        DOM.permissionModal.addEventListener('click', (e) => {
            if (e.target === DOM.permissionModal || e.target.classList.contains('modal-overlay')) {
                UIUtils.toggleModal(DOM.permissionModal, false);
            }
        });
        
        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !DOM.permissionModal.hidden) {
                UIUtils.toggleModal(DOM.permissionModal, false);
            }
        });
    }
};

/**
 * INICIALIZACIÓN DE LA APLICACIÓN
 */
class APIExplorerApp {
    static async init() {
        try {
            console.log('🚀 Inicializando Explorador de APIs HTML5...');
            
            // Inicializar APIs
            GeolocationAPI.init();
            LocalStorageAPI.init();
            FetchAPI.init();
            CanvasAPI.init();
            DragDropAPI.init();
            NotificationAPI.init();
            AudioAPI.init();
            SpeechSynthesisAPI.init();
            
            // Configurar eventos
            EventHandlers.init();
            
            // Verificar compatibilidad
            this.checkAPISupport();
            
            // Mostrar mensaje de bienvenida
            setTimeout(() => {
                UIUtils.showToast('Explorador de APIs HTML5 listo', 'success');
            }, 1000);
            
            console.log('✅ Explorador de APIs inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            UIUtils.showToast('Error al inicializar la aplicación', 'error');
        }
    }
    
    static checkAPISupport() {
        const apis = [
            'geolocation',
            'localStorage', 
            'fetch',
            'canvas',
            'dragdrop',
            'notifications',
            'audio',
            'speech'
        ];
        
        const unsupported = apis.filter(api => !SecurityUtils.isAPISupported(api));
        
        if (unsupported.length > 0) {
            console.warn(`⚠ APIs no soportadas: ${unsupported.join(', ')}`);
        }
    }
}

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => APIExplorerApp.init());
} else {
    APIExplorerApp.init();
}

// Exportar para testing (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GeolocationAPI,
        LocalStorageAPI,
        FetchAPI,
        CanvasAPI,
        DragDropAPI,
        NotificationAPI,
        AudioAPI,
        SpeechSynthesisAPI
    };
}
