// Demo Interactiva Avanzada de Box-Sizing

const widthSlider = document.getElementById('widthSlider');
const paddingSlider = document.getElementById('paddingSlider');
const borderSlider = document.getElementById('borderSlider');

const widthValue = document.getElementById('widthValue');
const paddingValue = document.getElementById('paddingValue');
const borderValue = document.getElementById('borderValue');

const demoContentBox = document.getElementById('demoContentBox');
const demoBorderBox = document.getElementById('demoBorderBox');

const totalContentBox = document.getElementById('totalContentBox');
const totalBorderBox = document.getElementById('totalBorderBox');

// Crear tooltips
function createTooltip(box) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.padding = '4px 8px';
    tooltip.style.background = 'rgba(0,0,0,0.75)';
    tooltip.style.color = 'white';
    tooltip.style.fontSize = '0.8rem';
    tooltip.style.borderRadius = '4px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.transition = 'all 0.2s ease';
    box.style.position = 'relative';
    box.appendChild(tooltip);
    return tooltip;
}

const tooltipContentBox = createTooltip(demoContentBox);
const tooltipBorderBox = createTooltip(demoBorderBox);

function updateBoxes() {
    const width = parseInt(widthSlider.value);
    const padding = parseInt(paddingSlider.value);
    const border = parseInt(borderSlider.value);
    
    widthValue.textContent = `${width}px`;
    paddingValue.textContent = `${padding}px`;
    borderValue.textContent = `${border}px`;
    
    // Aplicar estilos
    [demoContentBox, demoBorderBox].forEach(box => {
        box.style.width = `${width}px`;
        box.style.padding = `${padding}px`;
        box.style.borderWidth = `${border}px`;
    });
    
    // Calcular totales
    const contentBoxTotal = width + padding*2 + border*2;
    const borderBoxTotal = width;
    
    // Actualizar textos
    totalContentBox.textContent = `Total: ${contentBoxTotal}px ${contentBoxTotal > width ? '❌' : ''}`;
    totalBorderBox.textContent = `Total: ${borderBoxTotal}px ✅`;
    
    totalContentBox.style.color = contentBoxTotal > width ? '#e74c3c' : '#2c3e50';
    totalBorderBox.style.color = '#27ae60';
    
    // Mostrar tooltips sobre cada caja
    tooltipContentBox.textContent = `${contentBoxTotal}px`;
    tooltipContentBox.style.top = `-${tooltipContentBox.offsetHeight + 6}px`;
    tooltipContentBox.style.left = `${(demoContentBox.offsetWidth - tooltipContentBox.offsetWidth)/2}px`;
    
    tooltipBorderBox.textContent = `${borderBoxTotal}px`;
    tooltipBorderBox.style.top = `-${tooltipBorderBox.offsetHeight + 6}px`;
    tooltipBorderBox.style.left = `${(demoBorderBox.offsetWidth - tooltipBorderBox.offsetWidth)/2}px`;
}

// Listeners
[widthSlider, paddingSlider, borderSlider].forEach(slider => slider.addEventListener('input', updateBoxes));

// Inicializar
updateBoxes();
