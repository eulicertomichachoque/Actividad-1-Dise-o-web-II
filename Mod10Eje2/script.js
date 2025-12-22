/**
 * Módulo principal de la Calculadora de IMC
 * Implementa patrón de módulo para encapsulación
 */
const IMCCalculator = (() => {
    // Estado interno
    let history = [];
    let currentCalculation = null;
    
    // Elementos DOM - inicializados en init()
    let elements = {
        form: null,
        pesoInput: null,
        alturaInput: null,
        edadInput: null,
        resultSection: null,
        imcValue: null,
        imcCategory: null,
        imcIndicator: null,
        healthStatus: null,
        healthyWeight: null,
        recommendationText: null,
        historyList: null,
        historyStats: null,
        clearHistoryBtn: null,
        exportHistoryBtn: null,
        resetBtn: null,
        saveResultBtn: null,
        closeResultBtn: null
    };
    
    // Configuración
    const config = {
        maxHistoryItems: 20,
        localStorageKey: 'imcCalculatorHistory',
        animationDuration: 800,
        debounceDelay: 300
    };
    
    // Categorías de IMC con rangos detallados
    const imcCategories = [
        {
            name: 'Bajo peso severo',
            min: 0,
            max: 16,
            color: 'var(--underweight)',
            bgColor: 'var(--underweight-light)',
            risk: 'Alto',
            icon: 'fas fa-exclamation-triangle'
        },
        {
            name: 'Bajo peso moderado',
            min: 16,
            max: 17,
            color: 'var(--underweight)',
            bgColor: 'var(--underweight-light)',
            risk: 'Moderado',
            icon: 'fas fa-exclamation-circle'
        },
        {
            name: 'Bajo peso leve',
            min: 17,
            max: 18.5,
            color: 'var(--underweight)',
            bgColor: 'var(--underweight-light)',
            risk: 'Leve',
            icon: 'fas fa-info-circle'
        },
        {
            name: 'Peso normal',
            min: 18.5,
            max: 25,
            color: 'var(--normal)',
            bgColor: 'var(--normal-light)',
            risk: 'Bajo',
            icon: 'fas fa-check-circle'
        },
        {
            name: 'Sobrepeso',
            min: 25,
            max: 30,
            color: 'var(--overweight)',
            bgColor: 'var(--overweight-light)',
            risk: 'Aumentado',
            icon: 'fas fa-exclamation-circle'
        },
        {
            name: 'Obesidad Grado I',
            min: 30,
            max: 35,
            color: 'var(--obesity)',
            bgColor: 'var(--obesity-light)',
            risk: 'Moderado',
            icon: 'fas fa-exclamation-triangle'
        },
        {
            name: 'Obesidad Grado II',
            min: 35,
            max: 40,
            color: 'var(--obesity-ii)',
            bgColor: 'var(--obesity-light)',
            risk: 'Severo',
            icon: 'fas fa-skull-crossbones'
        },
        {
            name: 'Obesidad Grado III',
            min: 40,
            max: 100,
            color: 'var(--obesity-iii)',
            bgColor: 'var(--obesity-light)',
            risk: 'Muy severo',
            icon: 'fas fa-heartbeat'
        }
    ];
    
    /**
     * Inicializa la calculadora
     */
    function init() {
        console.log('🔄 Inicializando calculadora de IMC...');
        
        // Cargar elementos DOM
        loadElements();
        
        // Verificar elementos críticos
        if (!elements.form || !elements.resultSection) {
            console.error('❌ Elementos críticos del DOM no encontrados');
            console.log('Formulario encontrado:', !!elements.form);
            console.log('Sección resultados:', !!elements.resultSection);
            return;
        }
        
        console.log('✅ Elementos DOM cargados correctamente');
        
        // Cargar historial
        loadHistory();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Renderizar historial inicial
        renderHistory();
        
        console.log('✅ Calculadora de IMC inicializada correctamente');
    }
    
    /**
     * Carga elementos del DOM
     */
    function loadElements() {
        const ids = [
            'imcForm', 'peso', 'altura', 'edad', 'resultSection',
            'imcValue', 'imcCategory', 'imcIndicator', 'healthStatus',
            'healthyWeight', 'recommendationText', 'historyList',
            'historyStats', 'clearHistoryBtn', 'exportHistoryBtn',
            'resetBtn', 'saveResultBtn', 'closeResultBtn'
        ];
        
        ids.forEach(id => {
            elements[id] = document.getElementById(id);
        });
        
        // Debug: mostrar elementos encontrados
        console.log('📋 Elementos encontrados:', 
            Object.keys(elements).filter(key => elements[key] !== null).length, 
            'de', Object.keys(elements).length
        );
    }
    
    /**
     * Configura event listeners
     */
    function setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        
        // Validación en tiempo real con debouncing
        setupInputValidation();
        
        // Submit del formulario
        elements.form.addEventListener('submit', handleFormSubmit);
        
        // Botón de reset
        if (elements.resetBtn) {
            elements.resetBtn.addEventListener('click', resetForm);
        }
        
        // Botón para cerrar resultados
        if (elements.closeResultBtn) {
            elements.closeResultBtn.addEventListener('click', closeResults);
        }
        
        // Botón para guardar resultado
        if (elements.saveResultBtn) {
            elements.saveResultBtn.addEventListener('click', saveCurrentResult);
        }
        
        // Botón para limpiar historial
        if (elements.clearHistoryBtn) {
            elements.clearHistoryBtn.addEventListener('click', clearHistory);
        }
        
        // Botón para exportar historial
        if (elements.exportHistoryBtn) {
            elements.exportHistoryBtn.addEventListener('click', exportHistory);
        }
        
        // Validación inicial
        validateAllFields();
        
        console.log('✅ Event listeners configurados');
    }
    
    /**
     * Configura validación de inputs
     */
    function setupInputValidation() {
        const inputs = [elements.pesoInput, elements.alturaInput, elements.edadInput];
        
        inputs.forEach(input => {
            if (!input) {
                console.warn(`⚠️ Input no encontrado: ${input}`);
                return;
            }
            
            // Validar al perder foco
            input.addEventListener('blur', () => validateField(input));
            
            // Validar al escribir (con debouncing)
            input.addEventListener('input', debounce(() => {
                if (input.classList.contains('invalid')) {
                    validateField(input);
                }
            }, config.debounceDelay));
            
            // Permitir enter para navegar
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    focusNextInput(input);
                }
            });
        });
    }
    
    /**
     * Valida un campo individual
     */
    function validateField(input) {
        if (!input) return false;
        
        const value = parseFloat(input.value);
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;
        const errorElement = document.getElementById(`${input.id}-error`);
        
        // Resetear estado
        input.classList.remove('valid', 'invalid');
        if (errorElement) errorElement.textContent = '';
        
        // Validar
        if (!input.value.trim()) {
            showFieldError(input, errorElement, 'Este campo es obligatorio');
            return false;
        }
        
        if (isNaN(value)) {
            showFieldError(input, errorElement, 'Debe ser un número válido');
            return false;
        }
        
        if (value < min || value > max) {
            showFieldError(input, errorElement, `Debe estar entre ${min} y ${max}`);
            return false;
        }
        
        // Validaciones específicas
        if (input.id === 'peso' && value > 300) {
            showFieldError(input, errorElement, 'El peso no puede superar los 300 kg');
            return false;
        }
        
        if (input.id === 'altura' && value > 250) {
            showFieldError(input, errorElement, 'La altura no puede superar los 250 cm');
            return false;
        }
        
        if (input.id === 'edad' && value > 120) {
            showFieldError(input, errorElement, 'La edad no puede superar los 120 años');
            return false;
        }
        
        // Éxito
        showFieldSuccess(input, errorElement);
        return true;
    }
    
    /**
     * Muestra error en campo
     */
    function showFieldError(input, errorElement, message) {
        input.classList.add('invalid');
        input.classList.remove('valid');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.opacity = '1';
        }
        
        // Animación de shake
        input.style.animation = 'none';
        setTimeout(() => {
            input.style.animation = 'shake 0.5s ease';
        }, 10);
    }
    
    /**
     * Muestra éxito en campo
     */
    function showFieldSuccess(input, errorElement) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.opacity = '0';
        }
    }
    
    /**
     * Valida todos los campos
     */
    function validateAllFields() {
        const inputs = [elements.pesoInput, elements.alturaInput, elements.edadInput];
        const results = inputs.map(input => validateField(input));
        return results.every(result => result === true);
    }
    
    /**
     * Maneja el envío del formulario
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        console.log('📤 Formulario enviado'); // Debug
        
        // Validar campos
        if (!validateAllFields()) {
            showNotification('Por favor, corrige los errores del formulario', 'error');
            focusFirstInvalidField();
            return;
        }
        
        // Obtener valores
        const peso = parseFloat(elements.pesoInput.value);
        const altura = parseFloat(elements.alturaInput.value);
        const edad = parseInt(elements.edadInput.value);
        const sexo = document.querySelector('input[name="sexo"]:checked')?.value || 'masculino';
        
        console.log('📊 Datos obtenidos:', { peso, altura, edad, sexo }); // Debug
        
        // Validar que los valores sean números válidos
        if (isNaN(peso) || isNaN(altura) || isNaN(edad)) {
            showNotification('Los datos ingresados no son válidos', 'error');
            return;
        }
        
        // Calcular IMC - CORRECCIÓN PRINCIPAL
        const imc = calculateBMI(peso, altura);
        
        console.log('🧮 IMC calculado:', imc); // Debug
        
        if (imc <= 0 || imc > 100) {
            showNotification('El IMC calculado no es válido. Revisa los datos.', 'error');
            return;
        }
        
        // Obtener categoría
        const category = getBMICategory(imc);
        
        console.log('🏷️ Categoría:', category); // Debug
        
        // Guardar cálculo actual
        currentCalculation = {
            peso,
            altura,
            edad,
            sexo,
            imc,
            category,
            fecha: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Mostrar resultados
        showResults(currentCalculation);
        
        // Scroll suave a resultados
        setTimeout(() => {
            elements.resultSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }
    
    /**
     * Calcula el IMC - FUNCIÓN CORREGIDA
     */
    function calculateBMI(peso, alturaCm) {
        // Validar entrada
        if (typeof peso !== 'number' || typeof alturaCm !== 'number' || 
            peso <= 0 || alturaCm <= 0) {
            console.error('❌ Datos inválidos para calcular IMC:', { peso, alturaCm });
            return 0;
        }
        
        // Convertir altura de cm a metros
        const alturaM = alturaCm / 100;
        
        // Calcular IMC: peso (kg) / altura (m)²
        const imc = peso / (alturaM * alturaM);
        
        // Redondear a 1 decimal
        return Math.round(imc * 10) / 10;
    }
    
    /**
     * Obtiene la categoría del IMC
     */
    function getBMICategory(imc) {
        // Validar IMC
        if (typeof imc !== 'number' || imc <= 0) {
            return imcCategories[3]; // Peso normal por defecto
        }
        
        // Encontrar categoría
        const category = imcCategories.find(cat => imc >= cat.min && imc < cat.max);
        
        // Si no encuentra (IMC muy alto), devolver la última categoría
        return category || imcCategories[imcCategories.length - 1];
    }
    
    /**
     * Calcula el rango de peso saludable
     */
    function calculateHealthyWeightRange(alturaCm) {
        if (alturaCm <= 0) return { min: 0, max: 0 };
        
        const alturaM = alturaCm / 100;
        const min = 18.5 * (alturaM * alturaM);
        const max = 24.9 * (alturaM * alturaM);
        
        return {
            min: Math.round(min),
            max: Math.round(max)
        };
    }
    
    /**
     * Obtiene recomendaciones personalizadas
     */
    function getRecommendations(calculation) {
        const { imc, category, edad, sexo } = calculation;
        const weightRange = calculateHealthyWeightRange(calculation.altura);
        
        let recommendations = [];
        
        // Recomendaciones por categoría
        if (category.name.includes('Bajo peso')) {
            recommendations.push(
                'Consulta con un nutricionista para desarrollar un plan de alimentación adecuado.',
                'Considera aumentar la ingesta de alimentos ricos en nutrientes y calorías saludables.',
                'Realiza ejercicio de fuerza para ganar masa muscular de manera saludable.'
            );
        } else if (category.name === 'Peso normal') {
            recommendations.push(
                '¡Excelente! Mantén una dieta equilibrada y variada.',
                'Continúa con actividad física regular (al menos 150 minutos semanales).',
                'Realiza chequeos médicos periódicos para mantener tu salud.'
            );
        } else if (category.name === 'Sobrepeso') {
            recommendations.push(
                'Considera reducir la ingesta de alimentos procesados y azúcares añadidos.',
                'Aumenta la actividad física gradualmente (caminar, nadar, ciclismo).',
                'Consulta con un profesional para establecer metas realistas de pérdida de peso.'
            );
        } else if (category.name.includes('Obesidad')) {
            recommendations.push(
                'Es importante consultar con un médico para una evaluación completa.',
                'Considera un programa supervisado de pérdida de peso.',
                'Prioriza cambios de estilo de vida sostenibles sobre dietas extremas.'
            );
        }
        
        // Recomendaciones por edad
        if (edad > 60) {
            recommendations.push(
                'A tu edad, es importante mantener la masa muscular. Considera ejercicios de fuerza.',
                'Consulta con tu médico antes de realizar cambios significativos en tu dieta o actividad física.'
            );
        }
        
        // Recomendaciones por sexo
        if (sexo === 'femenino') {
            recommendations.push(
                'Recuerda que las necesidades nutricionales pueden variar durante diferentes etapas de la vida.',
                'El ejercicio regular ayuda a mantener la densidad ósea.'
            );
        }
        
        // Agregar rango de peso saludable
        recommendations.push(`Tu rango de peso saludable para tu altura es: ${weightRange.min} - ${weightRange.max} kg.`);
        
        return recommendations;
    }
    
    /**
     * Muestra los resultados
     */
    function showResults(calculation) {
        const { imc, category } = calculation;
        const weightRange = calculateHealthyWeightRange(calculation.altura);
        
        console.log('📈 Mostrando resultados para IMC:', imc); // Debug
        
        // Actualizar valores
        if (elements.imcValue) {
            elements.imcValue.textContent = imc;
        }
        
        if (elements.imcCategory) {
            elements.imcCategory.textContent = category.name;
            elements.imcCategory.style.color = category.color;
            elements.imcCategory.style.backgroundColor = category.bgColor;
        }
        
        // Actualizar detalles
        if (elements.healthStatus) {
            elements.healthStatus.textContent = `Riesgo ${category.risk}`;
        }
        
        if (elements.healthyWeight) {
            elements.healthyWeight.textContent = `${weightRange.min} - ${weightRange.max} kg`;
        }
        
        // Actualizar recomendaciones
        if (elements.recommendationText) {
            const recommendations = getRecommendations(calculation);
            elements.recommendationText.innerHTML = recommendations
                .map(rec => `<p><i class="fas fa-check-circle" style="color: var(--normal);"></i> ${rec}</p>`)
                .join('');
        }
        
        // Posicionar indicador
        positionIndicator(imc);
        
        // Mostrar sección de resultados
        if (elements.resultSection) {
            elements.resultSection.hidden = false;
        }
        
        // Animación del valor del IMC
        animateIMCValue(imc);
        
        console.log('✅ Resultados mostrados correctamente');
    }
    
    /**
     * Anima el valor del IMC
     */
    function animateIMCValue(finalValue) {
        const element = elements.imcValue;
        if (!element) return;
        
        const duration = 1500;
        const steps = 60;
        const stepTime = duration / steps;
        let currentStep = 0;
        
        // Guardar estilo original
        const originalFontSize = element.style.fontSize;
        
        // Animación de conteo
        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            const currentValue = (finalValue * progress).toFixed(1);
            
            element.textContent = currentValue;
            
            // Efecto de escala
            const scale = 1 + (0.2 * Math.sin(progress * Math.PI));
            element.style.transform = `scale(${scale})`;
            
            if (currentStep >= steps) {
                clearInterval(interval);
                element.textContent = finalValue.toFixed(1);
                element.style.transform = 'scale(1)';
                element.style.fontSize = originalFontSize;
            }
        }, stepTime);
    }
    
    /**
     * Posiciona el indicador en la barra
     */
    function positionIndicator(imc) {
        const indicator = elements.imcIndicator;
        if (!indicator) return;
        
        // Calcular posición según IMC
        let position = 0;
        
        if (imc < 18.5) {
            // Bajo peso: 0-25%
            position = (imc / 18.5) * 25;
        } else if (imc < 25) {
            // Normal: 25-50%
            position = 25 + ((imc - 18.5) / (25 - 18.5)) * 25;
        } else if (imc < 30) {
            // Sobrepeso: 50-75%
            position = 50 + ((imc - 25) / (30 - 25)) * 25;
        } else {
            // Obesidad: 75-100%
            position = 75 + Math.min(((imc - 30) / 20) * 25, 25);
        }
        
        // Ajustar posición
        position = Math.max(0, Math.min(position, 95));
        
        // Aplicar con animación
        indicator.style.left = `${position}%`;
        indicator.style.transition = `left ${config.animationDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        
        // Actualizar ARIA
        if (indicator.parentElement) {
            indicator.parentElement.setAttribute('aria-valuenow', imc.toFixed(1));
            indicator.parentElement.setAttribute('aria-valuetext', `IMC: ${imc.toFixed(1)} - ${getBMICategory(imc).name}`);
        }
    }
    
    /**
     * Cierra la sección de resultados
     */
    function closeResults() {
        if (elements.resultSection) {
            elements.resultSection.hidden = true;
        }
        showNotification('Resultados cerrados', 'info');
    }
    
    /**
     * Guarda el resultado actual en el historial
     */
    function saveCurrentResult() {
        if (!currentCalculation) {
            showNotification('No hay resultados para guardar', 'error');
            return;
        }
        
        saveToHistory(currentCalculation);
        showNotification('Resultado guardado en el historial', 'success');
    }
    
    /**
     * Guarda un cálculo en el historial
     */
    function saveToHistory(calculation) {
        const historyItem = {
            ...calculation,
            imc: calculation.imc.toFixed(1),
            fecha: new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            id: Date.now()
        };
        
        history.unshift(historyItem);
        
        // Limitar tamaño del historial
        if (history.length > config.maxHistoryItems) {
            history = history.slice(0, config.maxHistoryItems);
        }
        
        // Guardar en localStorage
        saveHistoryToStorage();
        
        // Renderizar historial actualizado
        renderHistory();
    }
    
    /**
     * Carga el historial desde localStorage
     */
    function loadHistory() {
        try {
            const savedHistory = localStorage.getItem(config.localStorageKey);
            if (savedHistory) {
                history = JSON.parse(savedHistory);
                console.log('📚 Historial cargado:', history.length, 'registros');
            }
        } catch (error) {
            console.error('❌ Error al cargar el historial:', error);
            history = [];
        }
    }
    
    /**
     * Guarda el historial en localStorage
     */
    function saveHistoryToStorage() {
        try {
            localStorage.setItem(config.localStorageKey, JSON.stringify(history));
        } catch (error) {
            console.error('❌ Error al guardar el historial:', error);
            showNotification('Error al guardar en el historial', 'error');
        }
    }
    
    /**
     * Renderiza el historial
     */
    function renderHistory() {
        const container = elements.historyList;
        const stats = elements.historyStats;
        
        if (!container) return;
        
        if (history.length === 0) {
            container.innerHTML = `
                <div class="empty-history" id="emptyHistory">
                    <div class="empty-icon" aria-hidden="true">
                        <i class="fas fa-clock"></i>
                    </div>
                    <p>No hay cálculos previos</p>
                    <p class="empty-hint">Los cálculos que realices aparecerán aquí</p>
                </div>
            `;
            
            // Ocultar botones de acciones del historial
            if (elements.clearHistoryBtn) {
                const parent = elements.clearHistoryBtn.parentElement;
                if (parent) parent.hidden = true;
            }
            
            // Actualizar estadísticas
            if (stats) {
                stats.innerHTML = `
                    <span class="stat-item">
                        <i class="fas fa-calculator" aria-hidden="true"></i>
                        <span id="totalCalculations">0</span> cálculos
                    </span>
                `;
            }
            
            return;
        }
        
        // Mostrar botones de acciones del historial
        if (elements.clearHistoryBtn) {
            const parent = elements.clearHistoryBtn.parentElement;
            if (parent) parent.hidden = false;
        }
        
        // Actualizar estadísticas
        if (stats) {
            stats.innerHTML = `
                <span class="stat-item">
                    <i class="fas fa-calculator" aria-hidden="true"></i>
                    <span id="totalCalculations">${history.length}</span> cálculos
                </span>
                <span class="stat-item">
                    <i class="fas fa-chart-line" aria-hidden="true"></i>
                    Último: ${history[0].fecha}
                </span>
            `;
        }
        
        // Renderizar lista
        container.innerHTML = history.map(item => {
            const category = getBMICategory(parseFloat(item.imc));
            return `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-info">
                        <div class="history-imc">${item.imc}</div>
                        <div class="history-category" style="color: ${category.color}; background: ${category.bgColor}">
                            ${category.name}
                        </div>
                        <div class="history-details">
                            <span class="history-weight">${item.peso} kg</span>
                            <span class="history-height">${item.altura} cm</span>
                            <span class="history-date">${item.fecha}</span>
                        </div>
                    </div>
                    <button class="btn-history-action" data-action="delete" aria-label="Eliminar este cálculo">
                        <i class="fas fa-trash" aria-hidden="true"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        // Agregar event listeners a los botones de acción
        container.querySelectorAll('.btn-history-action').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemElement = e.target.closest('.history-item');
                const itemId = itemElement.dataset.id;
                const action = button.dataset.action;
                
                if (action === 'delete') {
                    deleteHistoryItem(itemId);
                }
            });
        });
    }
    
    /**
     * Elimina un elemento del historial
     */
    function deleteHistoryItem(id) {
        if (!confirm('¿Eliminar este cálculo del historial?')) return;
        
        history = history.filter(item => item.id !== parseInt(id));
        saveHistoryToStorage();
        renderHistory();
        showNotification('Cálculo eliminado del historial', 'success');
    }
    
    /**
     * Limpia todo el historial
     */
    function clearHistory() {
        if (!confirm('¿Estás seguro de eliminar todo el historial? Esta acción no se puede deshacer.')) {
            return;
        }
        
        history = [];
        localStorage.removeItem(config.localStorageKey);
        renderHistory();
        showNotification('Historial eliminado', 'success');
    }
    
    /**
     * Exporta el historial como archivo
     */
    function exportHistory() {
        if (history.length === 0) {
            showNotification('No hay datos para exportar', 'error');
            return;
        }
        
        const dataStr = JSON.stringify(history, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `historial-imc-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('Historial exportado correctamente', 'success');
    }
    
    /**
     * Resetea el formulario
     */
    function resetForm() {
        if (elements.form) {
            elements.form.reset();
        }
        
        // Resetear estilos de validación
        [elements.pesoInput, elements.alturaInput, elements.edadInput].forEach(input => {
            if (input) {
                input.classList.remove('valid', 'invalid');
                const errorElement = document.getElementById(`${input.id}-error`);
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.style.opacity = '0';
                }
            }
        });
        
        // Cerrar resultados
        if (elements.resultSection) {
            elements.resultSection.hidden = true;
        }
        
        showNotification('Formulario restablecido', 'info');
    }
    
    /**
     * Enfoca el siguiente campo
     */
    function focusNextInput(currentInput) {
        const inputs = [elements.pesoInput, elements.alturaInput, elements.edadInput];
        const currentIndex = inputs.indexOf(currentInput);
        
        if (currentIndex < inputs.length - 1) {
            const nextInput = inputs[currentIndex + 1];
            if (nextInput) nextInput.focus();
        }
    }
    
    /**
     * Enfoca el primer campo inválido
     */
    function focusFirstInvalidField() {
        const invalidInput = elements.form.querySelector('.invalid');
        if (invalidInput) {
            invalidInput.focus();
            invalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    /**
     * Muestra una notificación
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
            background: ${type === 'success' ? 'var(--normal)' : type === 'error' ? 'var(--obesity)' : '#6d5dfc'};
            color: white;
            border-radius: var(--border-radius-sm);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
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
        calculateBMI,
        getBMICategory,
        resetForm,
        clearHistory,
        exportHistory
    };
})();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Agregar animaciones CSS adicionales si no existen
    if (!document.querySelector('style[data-imc-animations]')) {
        const style = document.createElement('style');
        style.setAttribute('data-imc-animations', 'true');
        style.textContent = `
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
            
            .notification {
                font-family: var(--font-family);
            }
            
            .btn-history-action {
                background: none;
                border: none;
                color: var(--text-tertiary);
                cursor: pointer;
                padding: 0.5rem;
                border-radius: var(--border-radius-sm);
                transition: all var(--transition-fast);
            }
            
            .btn-history-action:hover {
                color: var(--obesity);
                background: var(--bg-hover);
            }
            
            /* Debug styles */
            .debug-info {
                position: fixed;
                bottom: 10px;
                left: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 9999;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('🚀 Iniciando calculadora de IMC...');
    
    // Inicializar la calculadora
    try {
        IMCCalculator.init();
        
        // Debug: mostrar estado inicial
        setTimeout(() => {
            console.log('🎯 Calculadora lista. Puedes probarla ingresando:');
            console.log('   • Peso: 70 kg');
            console.log('   • Altura: 170 cm');
            console.log('   • Edad: 25 años');
            console.log('   • Haz clic en "Calcular IMC"');
        }, 1000);
        
    } catch (error) {
        console.error('💥 Error crítico al inicializar la calculadora:', error);
        alert('Error al inicializar la calculadora. Por favor, recarga la página.');
    }
});

// Hacer disponible globalmente para debugging
window.IMCCalculator = IMCCalculator;
