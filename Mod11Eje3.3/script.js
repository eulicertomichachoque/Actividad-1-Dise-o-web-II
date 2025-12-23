/**
 * PAINT PRO ULTRA - EDITOR DE IMÁGENES PROFESIONAL
 * Versión 3.0 - Totalmente optimizado y modular
 * @author Paint Pro Team
 * @license MIT
 */

'use strict';

// ============================================================================
// MÓDULO PRINCIPAL - PATRÓN IIFE
// ============================================================================

const PaintProUltra = (function() {
    // ========================================================================
    // CONFIGURACIÓN Y ESTADO
    // ========================================================================
    
    const CONFIG = Object.freeze({
        CANVAS_WIDTH: 1000,
        CANVAS_HEIGHT: 700,
        DEFAULT_COLOR: '#1a73e8',
        DEFAULT_LINE_WIDTH: 5,
        MIN_LINE_WIDTH: 1,
        MAX_LINE_WIDTH: 100,
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
        THROTTLE_DELAY: 16, // ~60fps
        BATCH_SIZE: 10000, // Píxeles por lote en filtros
        DPI_MULTIPLIER: window.devicePixelRatio || 1
    });
    
    const state = {
        isDrawing: false,
        startX: 0,
        startY: 0,
        currentTool: 'brush',
        lastSnapshot: null,
        isDrawingEnabled: true,
        isLoading: false,
        lastAction: null,
        actionsHistory: [],
        maxHistorySize: 50
    };
    
    // ========================================================================
    // REFERENCIAS DOM
    // ========================================================================
    
    let canvas = null;
    let ctx = null;
    let elements = {
        colorPicker: null,
        lineWidthInput: null,
        lineWidthLabel: null,
        currentToolDisplay: null,
        loadingMessage: null,
        fileNameDisplay: null,
        statusArea: null
    };
    
    // ========================================================================
    // FUNCIONES DE UTILIDAD
    // ========================================================================
    
    /**
     * Normaliza coordenadas para mouse/touch
     * @param {Event} e - Evento de entrada
     * @returns {{x: number, y: number}} Coordenadas normalizadas
     */
    const normalizeCoordinates = (e) => {
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        
        if (e.type.includes('touch')) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        // Ajustar por DPI
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };
    
    /**
     * Throttle para optimizar rendimiento
     * @param {Function} fn - Función a limitar
     * @param {number} limit - Límite en ms
     * @returns {Function} Función limitada
     */
    const throttle = (fn, limit) => {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= limit) {
                lastCall = now;
                fn.apply(this, args);
            }
        };
    };
    
    /**
     * Debounce para eventos frecuentes
     * @param {Function} fn - Función a debounce
     * @param {number} delay - Retardo en ms
     * @returns {Function} Función debounceada
     */
    const debounce = (fn, delay) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    };
    
    /**
     * Guarda una acción en el historial
     * @param {string} action - Tipo de acción
     * @param {ImageData} data - Datos de la acción
     */
    const saveToHistory = (action, data) => {
        state.actionsHistory.push({
            action,
            timestamp: Date.now(),
            data: ctx ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null
        });
        
        // Mantener tamaño máximo del historial
        if (state.actionsHistory.length > state.maxHistorySize) {
            state.actionsHistory.shift();
        }
        
        state.lastAction = action;
    };
    
    // ========================================================================
    // MANEJO DE ESTADO Y UI
    // ========================================================================
    
    /**
     * Actualiza el estado de la UI
     * @param {boolean} isLoading - Si está cargando
     */
    const updateUIState = (isLoading) => {
        state.isLoading = isLoading;
        state.isDrawingEnabled = !isLoading;
        
        // Actualizar elementos de carga
        if (elements.loadingMessage) {
            elements.loadingMessage.hidden = !isLoading;
        }
        
        // Habilitar/deshabilitar controles
        const controls = document.querySelectorAll('button, input, select, .tool');
        controls.forEach(control => {
            if (isLoading) {
                control.setAttribute('disabled', 'true');
                control.classList.add('disabled');
            } else {
                control.removeAttribute('disabled');
                control.classList.remove('disabled');
            }
        });
    };
    
    /**
     * Muestra un mensaje de estado
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje
     */
    const showStatusMessage = (message, type = 'info') => {
        if (!elements.statusArea) return;
        
        // Crear elemento de mensaje si no existe
        let messageElement = elements.statusArea.querySelector('.status-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'status-message';
            elements.statusArea.appendChild(messageElement);
        }
        
        // Actualizar contenido y clases
        messageElement.textContent = message;
        messageElement.className = `status-message status-${type}`;
        
        // Auto-eliminar después de 3 segundos
        clearTimeout(messageElement.timeoutId);
        messageElement.timeoutId = setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'status-message';
        }, 3000);
    };
    
    /**
     * Actualiza el progreso de carga
     * @param {number} percent - Porcentaje de progreso
     */
    const updateLoadingProgress = (percent) => {
        if (!elements.loadingMessage) return;
        
        const progressBar = elements.loadingMessage.querySelector('.loading-progress-fill');
        if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
        }
        
        const message = elements.loadingMessage.querySelector('p');
        if (message) {
            message.textContent = `Cargando imagen... ${Math.round(percent)}%`;
        }
    };
    
    // ========================================================================
    // GESTIÓN DEL CANVAS
    // ========================================================================
    
    /**
     * Inicializa el canvas con configuración optimizada
     */
    const initCanvas = () => {
        if (!canvas) throw new Error('Canvas element not found');
        
        // Configurar dimensiones con DPI
        canvas.width = CONFIG.CANVAS_WIDTH * CONFIG.DPI_MULTIPLIER;
        canvas.height = CONFIG.CANVAS_HEIGHT * CONFIG.DPI_MULTIPLIER;
        canvas.style.width = `${CONFIG.CANVAS_WIDTH}px`;
        canvas.style.height = `${CONFIG.CANVAS_HEIGHT}px`;
        
        // Obtener contexto 2D
        ctx = canvas.getContext('2d', {
            willReadFrequently: true,
            alpha: true
        });
        
        if (!ctx) throw new Error('Canvas context not supported');
        
        // Escalar contexto para DPI
        ctx.scale(CONFIG.DPI_MULTIPLIER, CONFIG.DPI_MULTIPLIER);
        
        // Configurar estilo por defecto
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        ctx.strokeStyle = CONFIG.DEFAULT_COLOR;
        ctx.lineWidth = CONFIG.DEFAULT_LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Guardar estado inicial
        saveToHistory('init', null);
    };
    
    /**
     * Guarda snapshot del estado actual
     */
    const saveSnapshot = () => {
        if (!ctx || !canvas) return;
        
        try {
            state.lastSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (error) {
            console.warn('Failed to save snapshot:', error);
        }
    };
    
    /**
     * Restaura el último snapshot
     */
    const restoreSnapshot = () => {
        if (state.lastSnapshot && ctx) {
            ctx.putImageData(state.lastSnapshot, 0, 0);
        }
    };
    
    /**
     * Limpia el canvas completamente
     */
    const clearCanvas = () => {
        if (!ctx || !canvas) return;
        
        if (confirm('¿Estás seguro de que quieres limpiar el lienzo? Se perderá todo el trabajo actual.')) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            showStatusMessage('Lienzo limpiado', 'success');
            saveToHistory('clear', null);
        }
    };
    
    // ========================================================================
    // SISTEMA DE DIBUJO
    // ========================================================================
    
    /**
     * Inicia el proceso de dibujo
     * @param {Event} e - Evento de inicio
     */
    const startDrawing = (e) => {
        if (!state.isDrawingEnabled || state.isLoading) return;
        
        e.preventDefault();
        state.isDrawing = true;
        
        const coords = normalizeCoordinates(e);
        state.startX = coords.x / CONFIG.DPI_MULTIPLIER;
        state.startY = coords.y / CONFIG.DPI_MULTIPLIER;
        
        saveSnapshot();
        
        if (state.currentTool === 'brush' || state.currentTool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(state.startX, state.startY);
        }
    };
    
    /**
     * Proceso de dibujo (throttled)
     */
    const draw = throttle((e) => {
        if (!state.isDrawing || !state.isDrawingEnabled || !ctx) return;
        
        e.preventDefault();
        
        const coords = normalizeCoordinates(e);
        const currentX = coords.x / CONFIG.DPI_MULTIPLIER;
        const currentY = coords.y / CONFIG.DPI_MULTIPLIER;
        
        // Restaurar snapshot para formas temporales
        if (state.currentTool === 'rectangle' || state.currentTool === 'circle') {
            restoreSnapshot();
        }
        
        // Aplicar herramienta actual
        switch (state.currentTool) {
            case 'brush':
                ctx.strokeStyle = elements.colorPicker?.value || CONFIG.DEFAULT_COLOR;
                ctx.lineTo(currentX, currentY);
                ctx.stroke();
                break;
                
            case 'rectangle':
                ctx.strokeStyle = elements.colorPicker?.value || CONFIG.DEFAULT_COLOR;
                const width = currentX - state.startX;
                const height = currentY - state.startY;
                ctx.strokeRect(state.startX, state.startY, width, height);
                break;
                
            case 'circle':
                ctx.strokeStyle = elements.colorPicker?.value || CONFIG.DEFAULT_COLOR;
                const radius = Math.sqrt(
                    Math.pow(state.startX - currentX, 2) + 
                    Math.pow(state.startY - currentY, 2)
                );
                ctx.beginPath();
                ctx.arc(state.startX, state.startY, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'eraser':
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineTo(currentX, currentY);
                ctx.stroke();
                break;
                
            default:
                console.warn(`Unknown tool: ${state.currentTool}`);
        }
        
        // Guardar snapshot para herramientas continuas
        if (state.currentTool === 'brush' || state.currentTool === 'eraser') {
            saveSnapshot();
        }
    }, CONFIG.THROTTLE_DELAY);
    
    /**
     * Finaliza el dibujo
     */
    const stopDrawing = () => {
        if (!state.isDrawing) return;
        
        state.isDrawing = false;
        ctx.closePath();
        
        // Guardar en historial
        if (state.lastAction !== 'draw') {
            saveToHistory('draw', null);
        }
    };
    
    // ========================================================================
    // MANEJO DE IMÁGENES (MEJORADO)
    // ========================================================================
    
    /**
     * Valida un archivo de imagen
     * @param {File} file - Archivo a validar
     * @returns {{isValid: boolean, message: string}} Resultado de validación
     */
    const validateImageFile = (file) => {
        if (!file) {
            return { isValid: false, message: 'No se seleccionó ningún archivo' };
        }
        
        if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
            return { 
                isValid: false, 
                message: `Formato no soportado. Usa: ${CONFIG.SUPPORTED_FORMATS.join(', ')}` 
            };
        }
        
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            const maxSizeMB = CONFIG.MAX_FILE_SIZE / (1024 * 1024);
            return { 
                isValid: false, 
                message: `La imagen es demasiado grande (máximo ${maxSizeMB}MB)` 
            };
        }
        
        return { isValid: true, message: '' };
    };
    
    /**
     * Procesa y carga una imagen en el canvas
     * @param {File} file - Archivo de imagen
     */
    const loadImage = async (file) => {
        // Validar archivo
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            showStatusMessage(validation.message, 'error');
            return;
        }
        
        // Iniciar carga
        updateUIState(true);
        updateLoadingProgress(0);
        
        try {
            // Leer archivo como DataURL
            const dataUrl = await readFileAsDataURL(file);
            updateLoadingProgress(30);
            
            // Cargar imagen
            const img = await loadImageFromDataURL(dataUrl);
            updateLoadingProgress(60);
            
            // Procesar y dibujar imagen
            await drawImageOnCanvas(img, file);
            updateLoadingProgress(100);
            
            // Éxito
            showStatusMessage(
                `Imagen cargada: ${img.width}×${img.height}px • ${(file.size / 1024).toFixed(1)}KB`,
                'success'
            );
            
            // Actualizar tooltip
            canvas.title = `${file.name} (${img.width}×${img.height}px)`;
            
            // Guardar en historial
            saveToHistory('load_image', null);
            
        } catch (error) {
            console.error('Error loading image:', error);
            showStatusMessage(`Error al cargar la imagen: ${error.message}`, 'error');
        } finally {
            // Finalizar carga
            setTimeout(() => {
                updateUIState(false);
                updateLoadingProgress(0);
            }, 500);
        }
    };
    
    /**
     * Lee un archivo como DataURL
     * @param {File} file - Archivo a leer
     * @returns {Promise<string>} DataURL
     */
    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = (e.loaded / e.total) * 30; // 0-30%
                    updateLoadingProgress(percent);
                }
            };
            
            reader.readAsDataURL(file);
        });
    };
    
    /**
     * Carga una imagen desde DataURL
     * @param {string} dataUrl - DataURL de la imagen
     * @returns {Promise<HTMLImageElement>} Imagen cargada
     */
    const loadImageFromDataURL = (dataUrl) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                updateLoadingProgress(60);
                resolve(img);
            };
            
            img.onerror = () => reject(new Error('Error al cargar la imagen'));
            
            img.src = dataUrl;
        });
    };
    
    /**
     * Dibuja una imagen en el canvas
     * @param {HTMLImageElement} img - Imagen a dibujar
     * @param {File} file - Archivo original
     */
    const drawImageOnCanvas = (img, file) => {
        return new Promise((resolve) => {
            // Limpiar canvas
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            
            // Calcular dimensiones manteniendo proporción
            let width = img.width;
            let height = img.height;
            
            // Redimensionar si es necesario
            if (width > CONFIG.CANVAS_WIDTH || height > CONFIG.CANVAS_HEIGHT) {
                const ratio = Math.min(
                    CONFIG.CANVAS_WIDTH / width,
                    CONFIG.CANVAS_HEIGHT / height
                );
                width *= ratio;
                height *= ratio;
            }
            
            // Calcular posición centrada
            const x = (CONFIG.CANVAS_WIDTH - width) / 2;
            const y = (CONFIG.CANVAS_HEIGHT - height) / 2;
            
            // Dibujar imagen con alta calidad
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, x, y, width, height);
            
            // Guardar snapshot
            saveSnapshot();
            updateLoadingProgress(90);
            
            resolve();
        });
    };
    
    // ========================================================================
    // FILTROS DE IMAGEN (OPTIMIZADOS)
    // ========================================================================
    
    /**
     * Aplica un filtro a la imagen
     * @param {string} filterType - Tipo de filtro
     */
    const applyFilter = (filterType) => {
        if (!ctx || !canvas || state.isLoading) {
            showStatusMessage('Espere a que termine la operación actual', 'warning');
            return;
        }
        
        updateUIState(true);
        showStatusMessage(`Aplicando filtro ${filterType}...`, 'info');
        
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const totalPixels = data.length;
            
            // Procesar por lotes para mejor rendimiento
            const processBatch = (startIndex = 0) => {
                const endIndex = Math.min(startIndex + CONFIG.BATCH_SIZE, totalPixels);
                
                for (let i = startIndex; i < endIndex; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    switch (filterType) {
                        case 'gray':
                            // Luminosidad ponderada
                            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                            data[i] = data[i + 1] = data[i + 2] = gray;
                            break;
                            
                        case 'invert':
                            data[i] = 255 - r;
                            data[i + 1] = 255 - g;
                            data[i + 2] = 255 - b;
                            break;
                            
                        case 'sepia':
                            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                            break;
                    }
                }
                
                // Actualizar progreso
                const progress = (endIndex / totalPixels) * 100;
                updateLoadingProgress(progress);
                
                // Continuar procesando si no terminó
                if (endIndex < totalPixels) {
                    requestAnimationFrame(() => processBatch(endIndex));
                } else {
                    // Finalizar
                    ctx.putImageData(imageData, 0, 0);
                    updateUIState(false);
                    showStatusMessage(`Filtro ${filterType} aplicado`, 'success');
                    saveToHistory(`filter_${filterType}`, null);
                }
            };
            
            // Iniciar procesamiento
            processBatch();
            
        } catch (error) {
            console.error('Error applying filter:', error);
            showStatusMessage('Error al aplicar el filtro', 'error');
            updateUIState(false);
        }
    };
    
    // ========================================================================
    // DESCARGA Y EXPORTACIÓN
    // ========================================================================
    
    /**
     * Descarga la imagen actual como PNG
     */
    const downloadImage = () => {
        if (!canvas) return;
        
        try {
            // Crear enlace temporal
            const link = document.createElement('a');
            const timestamp = new Date()
                .toISOString()
                .replace(/[:.]/g, '-')
                .replace('T', '_')
                .slice(0, 19);
            
            link.download = `paint-pro-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showStatusMessage('Imagen descargada como PNG', 'success');
            
        } catch (error) {
            console.error('Error downloading image:', error);
            showStatusMessage('Error al descargar la imagen', 'error');
        }
    };
    
    // ========================================================================
    // MANEJO DE DRAG & DROP
    // ========================================================================
    
    /**
     * Configura drag & drop para imágenes
     */
    const setupDragAndDrop = () => {
        const dropZone = document.querySelector('.file-button');
        if (!dropZone) return;
        
        // Prevenir comportamientos por defecto
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Resaltar zona de drop
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });
        
        // Manejar drop
        dropZone.addEventListener('drop', handleDrop, false);
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        function highlight() {
            dropZone.classList.add('drag-over');
        }
        
        function unhighlight() {
            dropZone.classList.remove('drag-over');
        }
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                const file = files[0];
                if (file.type.match('image.*')) {
                    // Simular selección de archivo
                    const fileInput = document.getElementById('imageLoader');
                    if (fileInput) {
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        fileInput.files = dataTransfer.files;
                        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else {
                    showStatusMessage('Solo se permiten archivos de imagen', 'error');
                }
            }
        }
    };
    
    // ========================================================================
    // MANEJO DE EVENTOS
    // ========================================================================
    
    /**
     * Configura todos los event listeners
     */
    const setupEventListeners = () => {
        if (!canvas) return;
        
        // Eventos de dibujo (mouse)
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        
        // Eventos de dibujo (touch)
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);
        
        // Prevenir menú contextual en canvas
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Herramientas
        document.querySelectorAll('.tool').forEach(btn => {
            btn.addEventListener('click', () => {
                // Actualizar UI
                document.querySelectorAll('.tool').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                state.currentTool = btn.dataset.tool;
                
                // Actualizar display
                if (elements.currentToolDisplay) {
                    const toolName = btn.querySelector('.tool-name')?.textContent || 
                                    state.currentTool.charAt(0).toUpperCase() + state.currentTool.slice(1);
                    elements.currentToolDisplay.textContent = toolName;
                }
                
                showStatusMessage(`Herramienta activa: ${state.currentTool}`, 'info');
            });
        });
        
        // Filtros
        document.getElementById('filterGray')?.addEventListener('click', () => applyFilter('gray'));
        document.getElementById('filterInvert')?.addEventListener('click', () => applyFilter('invert'));
        document.getElementById('filterSepia')?.addEventListener('click', () => applyFilter('sepia'));
        
        // Controles
        if (elements.colorPicker) {
            elements.colorPicker.addEventListener('input', (e) => {
                ctx.strokeStyle = e.target.value;
            });
        }
        
        if (elements.lineWidthInput) {
            elements.lineWidthInput.addEventListener('input', (e) => {
                const value = Math.max(
                    CONFIG.MIN_LINE_WIDTH, 
                    Math.min(CONFIG.MAX_LINE_WIDTH, parseInt(e.target.value))
                );
                ctx.lineWidth = value;
                if (elements.lineWidthLabel) {
                    elements.lineWidthLabel.textContent = value;
                }
            });
        }
        
        // Carga de archivos
        const fileInput = document.getElementById('imageLoader');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    loadImage(e.target.files[0]);
                    
                    // Mostrar nombre del archivo
                    if (elements.fileNameDisplay) {
                        elements.fileNameDisplay.textContent = `📄 ${e.target.files[0].name}`;
                        elements.fileNameDisplay.title = `Tamaño: ${(e.target.files[0].size / 1024).toFixed(1)}KB`;
                    }
                }
            });
        }
        
        // Drag & drop
        setupDragAndDrop();
        
        // Descarga
        document.getElementById('downloadBtn')?.addEventListener('click', downloadImage);
        
        // Limpieza
        document.getElementById('clearBtn')?.addEventListener('click', clearCanvas);
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl+Z para deshacer (placeholder)
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                showStatusMessage('Historial de deshacer no implementado aún', 'info');
            }
            
            // Teclas para herramientas
            if (!e.ctrlKey && !e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        setActiveTool('brush');
                        break;
                    case 'r':
                        setActiveTool('rectangle');
                        break;
                    case 'c':
                        setActiveTool('circle');
                        break;
                    case 'e':
                        setActiveTool('eraser');
                        break;
                }
            }
        });
    };
    
    /**
     * Establece la herramienta activa
     * @param {string} tool - Nombre de la herramienta
     */
    const setActiveTool = (tool) => {
        const toolBtn = document.querySelector(`.tool[data-tool="${tool}"]`);
        if (toolBtn) {
            toolBtn.click();
        }
    };
    
    /**
     * Limpia todos los event listeners
     */
    const cleanupEventListeners = () => {
        // En una aplicación real, aquí se guardarían las referencias
        // a los event listeners para eliminarlos correctamente
        console.log('Cleaning up event listeners...');
    };
    
    // ========================================================================
    // INICIALIZACIÓN
    // ========================================================================
    
    /**
     * Inicializa la aplicación
     */
    const init = () => {
        try {
            // Obtener referencias DOM
            canvas = document.getElementById('canvas');
            elements = {
                colorPicker: document.getElementById('colorPicker'),
                lineWidthInput: document.getElementById('lineWidth'),
                lineWidthLabel: document.getElementById('wLabel'),
                currentToolDisplay: document.getElementById('currentTool'),
                loadingMessage: document.getElementById('loadingMessage'),
                fileNameDisplay: document.getElementById('fileNameDisplay'),
                statusArea: document.querySelector('.status-area')
            };
            
            // Validar elementos esenciales
            if (!canvas) {
                throw new Error('Elemento canvas no encontrado en el documento');
            }
            
            // Crear elementos de UI si no existen
            createUIElements();
            
            // Inicializar canvas
            initCanvas();
            
            // Configurar controles iniciales
            setupControls();
            
            // Configurar event listeners
            setupEventListeners();
            
            // Estado inicial
            showStatusMessage('Paint Pro Ultra listo. ¡Comienza a crear!', 'success');
            console.log('Paint Pro Ultra initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Paint Pro Ultra:', error);
            showError(`Error de inicialización: ${error.message}`);
        }
    };
    
    /**
     * Crea elementos de UI dinámicos
     */
    const createUIElements = () => {
        // Crear mensaje de carga si no existe
        if (!elements.loadingMessage) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loadingMessage';
            loadingDiv.className = 'loading-message';
            loadingDiv.hidden = true;
            loadingDiv.innerHTML = `
                <p>Cargando imagen...</p>
                <div class="loading-progress">
                    <div class="loading-progress-fill"></div>
                </div>
            `;
            document.querySelector('.canvas-container')?.appendChild(loadingDiv);
            elements.loadingMessage = loadingDiv;
        }
        
        // Crear display de nombre de archivo si no existe
        if (!elements.fileNameDisplay) {
            const fileDisplay = document.createElement('div');
            fileDisplay.id = 'fileNameDisplay';
            fileDisplay.className = 'file-name-display';
            document.querySelector('.file-controls')?.appendChild(fileDisplay);
            elements.fileNameDisplay = fileDisplay;
        }
    };
    
    /**
     * Configura controles iniciales
     */
    const setupControls = () => {
        if (elements.colorPicker) {
            elements.colorPicker.value = CONFIG.DEFAULT_COLOR;
        }
        
        if (elements.lineWidthInput) {
            elements.lineWidthInput.min = CONFIG.MIN_LINE_WIDTH;
            elements.lineWidthInput.max = CONFIG.MAX_LINE_WIDTH;
            elements.lineWidthInput.value = CONFIG.DEFAULT_LINE_WIDTH;
        }
        
        if (elements.lineWidthLabel) {
            elements.lineWidthLabel.textContent = CONFIG.DEFAULT_LINE_WIDTH;
        }
        
        if (elements.currentToolDisplay) {
            elements.currentToolDisplay.textContent = 'Pincel';
        }
    };
    
    /**
     * Muestra un error crítico
     * @param {string} message - Mensaje de error
     */
    const showError = (message) => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>❌ Error Crítico</h3>
            <p>${message}</p>
            <button onclick="window.location.reload()" class="btn-primary">
                🔄 Recargar Aplicación
            </button>
        `;
        document.body.innerHTML = '';
        document.body.appendChild(errorDiv);
    };
    
    /**
     * Limpia recursos y destruye la aplicación
     */
    const destroy = () => {
        cleanupEventListeners();
        canvas = null;
        ctx = null;
        elements = {};
        console.log('Paint Pro Ultra destroyed');
    };
    
    // ========================================================================
    // API PÚBLICA
    // ========================================================================
    
    return {
        // Métodos principales
        init,
        destroy,
        
        // Manipulación de imágenes
        loadImage,
        downloadImage,
        clearCanvas,
        applyFilter,
        
        // Herramientas
        setActiveTool,
        
        // Estado
        getState: () => ({ ...state }),
        getConfig: () => ({ ...CONFIG }),
        
        // Utilidades
        showStatusMessage,
        updateUIState
    };
})();

// ============================================================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================================================

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        PaintProUltra.init();
    });
} else {
    // DOM ya cargado
    PaintProUltra.init();
}

// Limpieza al cerrar la página
window.addEventListener('beforeunload', () => {
    PaintProUltra.destroy();
});

// Exponer para depuración (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
    window.PaintProUltra = PaintProUltra;
}

// ============================================================================
// SOPORTE PARA MÓDULOS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaintProUltra;
}
