// ===== CONFIGURACIÓN Y CONSTANTES =====
const CONFIG = {
    MAX_HISTORY: 20,
    TOAST_DURATION: 3000,
    AUTO_COPY: true,
    ANIMATIONS: true,
    SOUNDS: true
};

// ===== ESTADO DE LA APLICACIÓN =====
const AppState = {
    currentColor: '#667EEA',
    colorHistory: JSON.parse(localStorage.getItem('colorHistory')) || [],
    favorites: JSON.parse(localStorage.getItem('colorFavorites')) || [],
    settings: JSON.parse(localStorage.getItem('colorSettings')) || CONFIG,
    isColorLocked: false,
    toastTimeout: null,
    palettes: []
};

// ===== ELEMENTOS DEL DOM =====
const DOM = {
    // Color display
    colorCode: document.getElementById('colorCode'),
    colorSwatch: document.getElementById('colorSwatch'),
    colorName: document.getElementById('colorName'),
    rgbValue: document.getElementById('rgbValue'),
    hslValue: document.getElementById('hslValue'),
    contrastValue: document.getElementById('contrastValue'),
    luminanceValue: document.getElementById('luminanceValue'),
    
    // Botones principales
    generateBtn: document.getElementById('generateBtn'),
    copyBtn: document.getElementById('copyBtn'),
    copyRGB: document.getElementById('copyRGB'),
    favoriteBtn: document.getElementById('favoriteBtn'),
    lockColor: document.getElementById('lockColor'),
    
    // Historial y estadísticas
    historyGrid: document.getElementById('historyGrid'),
    emptyHistory: document.getElementById('emptyHistory'),
    clearHistory: document.getElementById('clearHistory'),
    exportHistory: document.getElementById('exportHistory'),
    viewAllHistory: document.getElementById('viewAllHistory'),
    historyCount: document.getElementById('historyCount'),
    favoritesCount: document.getElementById('favoritesCount'),
    colorCount: document.getElementById('colorCount'),
    
    // Paletas
    palettesGrid: document.getElementById('palettesGrid'),
    refreshPalettes: document.getElementById('refreshPalettes'),
    
    // Configuración
    themeToggle: document.getElementById('themeToggle'),
    settingsBtn: document.getElementById('settingsBtn'),
    helpBtn: document.getElementById('helpBtn'),
    
    // Toast (¡CRÍTICO - SIN CAMBIOS!)
    toast: document.getElementById('toast'),
    toastClose: document.getElementById('toastClose'),
    toastMessage: document.getElementById('toastMessage'),
    
    // Modal
    settingsModal: document.getElementById('settingsModal'),
    modalClose: document.getElementById('modalClose'),
    saveSettings: document.getElementById('saveSettings'),
    resetSettings: document.getElementById('resetSettings')
};

// ===== INICIALIZACIÓN =====
function initApp() {
    // Cargar configuración
    loadSettings();
    
    // Cargar historial
    if (AppState.colorHistory.length > 0) {
        AppState.currentColor = AppState.colorHistory[0].color || '#667EEA';
    }
    
    // Aplicar color inicial
    applyColor(AppState.currentColor);
    
    // Renderizar elementos
    renderHistory();
    generatePalettes();
    updateStats();
    updateUI();
    
    // Configurar eventos
    setupEventListeners();
    
    // Mensaje de bienvenida
    setTimeout(() => {
        showToast('🎨 ¡Bienvenido a ColorGen Pro!', 'info');
    }, 1000);
    
    console.log('✅ Aplicación inicializada');
}

// ===== FUNCIONES DE COLOR MEJORADAS =====
function generateRandomColor() {
    // Método mejorado para colores más vibrantes
    const hue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.random() * 30; // 60-90%
    const lightness = 40 + Math.random() * 30;  // 40-70%
    
    return hslToHex(hue, saturation, lightness);
}

function generatePalette() {
    const baseHue = Math.floor(Math.random() * 360);
    const palette = [];
    
    // Generar 5 colores armónicos
    for (let i = 0; i < 5; i++) {
        const hue = (baseHue + (i * 72)) % 360; // Colores equidistantes
        const saturation = 50 + Math.random() * 40;
        const lightness = 30 + Math.random() * 40;
        palette.push(hslToHex(hue, saturation, lightness));
    }
    
    return palette;
}

function applyColor(color) {
    if (AppState.isColorLocked) return;
    
    // Actualizar estado
    AppState.currentColor = color.toUpperCase();
    
    // Actualizar vista
    updateColorDisplay(color);
    updateColorData(color);
    updateBackground(color);
    
    // Agregar al historial
    addToHistory(color);
    
    // Actualizar favorito
    updateFavoriteButton();
    
    // Copiar automáticamente si está configurado
    if (AppState.settings.AUTO_COPY) {
        setTimeout(() => copyToClipboard(color), 300);
    }
    
    // Animación
    if (AppState.settings.ANIMATIONS) {
        animateColorChange();
    }
    
    // Sonido
    if (AppState.settings.SOUNDS) {
        playSound('colorChange');
    }
}

function updateColorDisplay(color) {
    DOM.colorCode.textContent = color;
    DOM.colorSwatch.style.background = `linear-gradient(135deg, ${color}, ${darkenColor(color, 20)})`;
    
    // Nombre del color
    const name = getColorName(color);
    DOM.colorName.textContent = name;
    DOM.colorName.title = name;
}

function updateColorData(color) {
    // RGB
    const rgb = hexToRgb(color);
    DOM.rgbValue.textContent = rgb.replace('rgb(', '').replace(')', '');
    
    // HSL
    const hsl = hexToHsl(color);
    const hslValues = hsl.match(/\d+/g);
    DOM.hslValue.textContent = `${hslValues[0]}°, ${hslValues[1]}%, ${hslValues[2]}%`;
    
    // Contraste
    const contrast = calculateContrast(color);
    DOM.contrastValue.textContent = `${contrast}:1`;
    DOM.contrastValue.style.color = contrast >= 4.5 ? '#4caf50' : '#ff6b6b';
    
    // Luminosidad
    const luminance = calculateLuminance(color);
    DOM.luminanceValue.textContent = `${luminance}%`;
}

function updateBackground(color) {
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-dark', darkenColor(color, 15));
}

// ===== CONVERSIONES DE COLOR =====
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
}

function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r, g, b;
    
    if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
    else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
    else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
    else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
    else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    
    const rgb = [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    ];
    
    return '#' + rgb.map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

// ===== FUNCIONES DE UTILIDAD =====
function darkenColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    
    return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1).toUpperCase();
}

function getColorName(hex) {
    const colorNames = {
        '#667EEA': 'Azul Digital',
        '#764BA2': 'Púrpura Real',
        '#FF6B6B': 'Rojo Coral',
        '#4CAF50': 'Verde Esmeralda',
        '#FFC107': 'Ámbar Brillante',
        '#2196F3': 'Azul Cielo',
        '#9C27B0': 'Violeta Índigo',
        '#FF9800': 'Naranja Fuego',
        '#E91E63': 'Rosa Vibrante',
        '#00BCD4': 'Cian Turquesa',
        '#8BC34A': 'Verde Lima',
        '#FF5722': 'Naranja Profundo'
    };
    
    return colorNames[hex] || `Color ${hex}`;
}

function calculateContrast(hex) {
    const rgb = hexToRgb(hex).match(/\d+/g);
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    const contrast = (luminance + 0.05) / 0.05;
    return contrast.toFixed(1);
}

function calculateLuminance(hex) {
    const rgb = hexToRgb(hex).match(/\d+/g);
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return Math.round(luminance * 100);
}

// ===== HISTORIAL MEJORADO =====
function addToHistory(color) {
    const historyItem = {
        color: color.toUpperCase(),
        timestamp: new Date().toISOString(),
        name: getColorName(color)
    };
    
    // Evitar duplicados consecutivos
    if (AppState.colorHistory[0] && AppState.colorHistory[0].color === color) {
        return;
    }
    
    // Agregar al inicio
    AppState.colorHistory.unshift(historyItem);
    
    // Limitar tamaño
    const maxSize = AppState.settings.MAX_HISTORY || CONFIG.MAX_HISTORY;
    if (AppState.colorHistory.length > maxSize) {
        AppState.colorHistory = AppState.colorHistory.slice(0, maxSize);
    }
    
    // Guardar
    localStorage.setItem('colorHistory', JSON.stringify(AppState.colorHistory));
    
    // Actualizar UI
    renderHistory();
    updateStats();
}

function renderHistory() {
    DOM.historyGrid.innerHTML = '';
    
    if (AppState.colorHistory.length === 0) {
        DOM.emptyHistory.style.display = 'flex';
        return;
    }
    
    DOM.emptyHistory.style.display = 'none';
    
    // Mostrar solo los primeros 8 elementos
    const recentHistory = AppState.colorHistory.slice(0, 8);
    
    recentHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="color-preview-small" style="background: ${item.color}"></div>
            <div class="color-info-small">
                <div class="color-hex-small">${item.color}</div>
                <div class="color-time">${formatTime(item.timestamp)}</div>
            </div>
            ${AppState.favorites.includes(item.color) ? 
                '<i class="fas fa-star" style="color: #FFC107;"></i>' : ''}
        `;
        
        historyItem.addEventListener('click', () => {
            applyColor(item.color);
            showToast(`↻ Aplicado: ${item.name}`);
        });
        
        DOM.historyGrid.appendChild(historyItem);
    });
}

function clearHistory() {
    if (AppState.colorHistory.length === 0) {
        showToast('ℹ️ El historial ya está vacío', 'info');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial?\nEsta acción no se puede deshacer.')) {
        AppState.colorHistory = [];
        localStorage.removeItem('colorHistory');
        renderHistory();
        updateStats();
        showToast('🗑️ Historial limpiado correctamente', 'success');
        
        if (AppState.settings.SOUNDS) {
            playSound('delete');
        }
    }
}

// ===== PALETAS =====
function generatePalettes() {
    DOM.palettesGrid.innerHTML = '';
    AppState.palettes = [];
    
    for (let i = 0; i < 4; i++) {
        const palette = generatePalette();
        AppState.palettes.push(palette);
        
        const paletteElement = document.createElement('div');
        paletteElement.className = 'palette-item';
        paletteElement.innerHTML = `
            <div class="palette-colors">
                ${palette.map(color => 
                    `<div class="palette-color" style="background: ${color}"></div>`
                ).join('')}
            </div>
            <div class="palette-info">Paleta ${i + 1}</div>
        `;
        
        paletteElement.addEventListener('click', () => {
            const randomColor = palette[Math.floor(Math.random() * palette.length)];
            applyColor(randomColor);
            showToast('🎨 Color de paleta aplicado');
        });
        
        DOM.palettesGrid.appendChild(paletteElement);
    }
}

// ===== FAVORITOS =====
function toggleFavorite() {
    const color = AppState.currentColor;
    const index = AppState.favorites.indexOf(color);
    
    if (index === -1) {
        // Agregar a favoritos
        AppState.favorites.push(color);
        showToast('⭐ Color agregado a favoritos', 'success');
    } else {
        // Remover de favoritos
        AppState.favorites.splice(index, 1);
        showToast('★ Color removido de favoritos', 'info');
    }
    
    // Guardar
    localStorage.setItem('colorFavorites', JSON.stringify(AppState.favorites));
    
    // Actualizar UI
    updateFavoriteButton();
    updateStats();
    renderHistory();
}

function updateFavoriteButton() {
    const icon = DOM.favoriteBtn.querySelector('i');
    const isFavorite = AppState.favorites.includes(AppState.currentColor);
    
    if (isFavorite) {
        icon.className = 'fas fa-star';
        DOM.favoriteBtn.style.background = '#FFC107';
        DOM.favoriteBtn.style.color = 'white';
        DOM.favoriteBtn.style.borderColor = '#FFC107';
        DOM.favoriteBtn.title = 'Remover de favoritos';
    } else {
        icon.className = 'far fa-star';
        DOM.favoriteBtn.style.background = '';
        DOM.favoriteBtn.style.color = '#FFC107';
        DOM.favoriteBtn.style.borderColor = '#FFC107';
        DOM.favoriteBtn.title = 'Agregar a favoritos';
    }
}

// ===== PORTAPAPELES =====
async function copyToClipboard(text = AppState.currentColor, type = 'HEX') {
    try {
        await navigator.clipboard.writeText(text);
        showToast(`📋 ${type} copiado al portapapeles`, 'success');
        
        if (AppState.settings.SOUNDS) {
            playSound('copy');
        }
        
        return true;
    } catch (err) {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast(`📋 ${type} copiado (método alternativo)`, 'info');
        return true;
    }
}

// ===== TOAST - ¡MANTENIENDO LA FUNCIONALIDAD ORIGINAL! =====
function showToast(message, type = 'success') {
    // Limpiar timeout anterior
    if (AppState.toastTimeout) {
        clearTimeout(AppState.toastTimeout);
    }
    
    // Configurar mensaje
    DOM.toastMessage.textContent = message;
    
    // Establecer color según tipo
    const colors = {
        success: 'linear-gradient(135deg, #4CAF50, #45A049)',
        info: 'linear-gradient(135deg, #2196F3, #1976D2)',
        warning: 'linear-gradient(135deg, #FF9800, #F57C00)',
        error: 'linear-gradient(135deg, #F44336, #D32F2F)'
    };
    
    DOM.toast.style.background = colors[type] || colors.success;
    
    // Mostrar
    DOM.toast.classList.add('show');
    
    // Ocultar automáticamente
    AppState.toastTimeout = setTimeout(hideToast, CONFIG.TOAST_DURATION);
}

function hideToast() {
    DOM.toast.classList.remove('show');
    
    if (AppState.toastTimeout) {
        clearTimeout(AppState.toastTimeout);
        AppState.toastTimeout = null;
    }
}

// ===== CONFIGURACIÓN =====
function loadSettings() {
    const saved = JSON.parse(localStorage.getItem('colorSettings'));
    if (saved) {
        AppState.settings = { ...CONFIG, ...saved };
    }
}

function saveSettings() {
    localStorage.setItem('colorSettings', JSON.stringify(AppState.settings));
    showToast('⚙️ Configuración guardada', 'success');
}

// ===== UI Y ESTADÍSTICAS =====
function updateStats() {
    DOM.historyCount.textContent = AppState.colorHistory.length;
    DOM.favoritesCount.textContent = AppState.favorites.length;
    DOM.colorCount.textContent = `${AppState.colorHistory.length} colores generados`;
}

function updateUI() {
    // Actualizar botón de bloqueo
    const lockIcon = DOM.lockColor.querySelector('i');
    if (AppState.isColorLocked) {
        lockIcon.className = 'fas fa-lock';
        lockIcon.style.color = '#4CAF50';
        DOM.lockColor.title = 'Desbloquear color';
    } else {
        lockIcon.className = 'fas fa-lock-open';
        lockIcon.style.color = '';
        DOM.lockColor.title = 'Bloquear color actual';
    }
}

function animateColorChange() {
    DOM.colorSwatch.style.animation = 'none';
    setTimeout(() => {
        DOM.colorSwatch.style.animation = 'pulse 0.5s ease';
    }, 10);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Generar color
    DOM.generateBtn.addEventListener('click', () => {
        const newColor = generateRandomColor();
        applyColor(newColor);
    });
    
    // Copiar HEX
    DOM.copyBtn.addEventListener('click', () => {
        copyToClipboard(AppState.currentColor, 'HEX');
    });
    
    // Copiar RGB
    DOM.copyRGB.addEventListener('click', () => {
        const rgb = hexToRgb(AppState.currentColor);
        copyToClipboard(rgb, 'RGB');
    });
    
    // Favorito
    DOM.favoriteBtn.addEventListener('click', toggleFavorite);
    
    // Bloquear/desbloquear
    DOM.lockColor.addEventListener('click', () => {
        AppState.isColorLocked = !AppState.isColorLocked;
        updateUI();
        showToast(AppState.isColorLocked ? '🔒 Color bloqueado' : '🔓 Color desbloqueado', 'info');
    });
    
    // Historial
    DOM.clearHistory.addEventListener('click', clearHistory);
    DOM.exportHistory.addEventListener('click', () => {
        showToast('📊 Función de exportación en desarrollo', 'info');
    });
    DOM.viewAllHistory.addEventListener('click', () => {
        showToast('📋 Mostrando historial completo', 'info');
    });
    
    // Paletas
    DOM.refreshPalettes.addEventListener('click', generatePalettes);
    
    // Configuración
    DOM.themeToggle.addEventListener('click', () => {
        showToast('🌙 Tema oscuro en desarrollo', 'info');
    });
    
    DOM.settingsBtn.addEventListener('click', () => {
        DOM.settingsModal.classList.add('show');
    });
    
    DOM.helpBtn.addEventListener('click', () => {
        showToast('📖 Abriendo documentación', 'info');
    });
    
    // Modal
    DOM.modalClose.addEventListener('click', () => {
        DOM.settingsModal.classList.remove('show');
    });
    
    DOM.saveSettings.addEventListener('click', saveSettings);
    DOM.resetSettings.addEventListener('click', () => {
        if (confirm('¿Restablecer configuración predeterminada?')) {
            localStorage.removeItem('colorSettings');
            AppState.settings = { ...CONFIG };
            showToast('🔄 Configuración restablecida', 'success');
        }
    });
    
    // ===== TOAST - ¡EVENTOS CRÍTICOS (SIN CAMBIOS)! =====
    
    // 1. Cerrar con la X (FUNCIONALIDAD ORIGINAL MANTENIDA)
    DOM.toastClose.addEventListener('click', function(e) {
        e.stopPropagation(); // ¡IMPORTANTE!
        hideToast();
    });
    
    // 2. Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideToast();
            DOM.settingsModal.classList.remove('show');
        }
    });
    
    // 3. Cerrar modal al hacer clic fuera
    DOM.settingsModal.addEventListener('click', function(e) {
        if (e.target === this) {
            DOM.settingsModal.classList.remove('show');
        }
    });
    
    // ===== ATAJOS DE TECLADO =====
    document.addEventListener('keydown', function(e) {
        // Evitar atajos en inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                if (!AppState.isColorLocked) {
                    const newColor = generateRandomColor();
                    applyColor(newColor);
                }
                break;
                
            case 'h':
                e.preventDefault();
                copyToClipboard(AppState.currentColor, 'HEX');
                break;
                
            case 'r':
                e.preventDefault();
                const rgb = hexToRgb(AppState.currentColor);
                copyToClipboard(rgb, 'RGB');
                break;
                
            case 'f':
                e.preventDefault();
                toggleFavorite();
                break;
                
            case 'g':
                e.preventDefault();
                generatePalettes();
                break;
                
            case 'l':
                e.preventDefault();
                AppState.isColorLocked = !AppState.isColorLocked;
                updateUI();
                break;
        }
    });
    
    // Click en el código HEX para copiar
    DOM.colorCode.addEventListener('click', () => {
        copyToClipboard(AppState.currentColor, 'HEX');
    });
}

// ===== FUNCIONES DE UTILIDAD =====
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Ahora mismo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
}

function playSound(type) {
    if (!AppState.settings.SOUNDS) return;
    
    // Implementación simple de sonidos
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    if (audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'colorChange':
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
                break;
            case 'copy':
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime);
                break;
            case 'delete':
                oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    }
}

// ===== INICIAR APLICACIÓN =====
document.addEventListener('DOMContentLoaded', initApp);

// Manejo de errores
window.addEventListener('error', function(e) {
    console.error('Error:', e.error);
    showToast('⚠️ Error en la aplicación', 'error');
});
