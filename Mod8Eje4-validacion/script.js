// ===== CONSTANTES Y CONFIGURACIÓN =====
const CONFIG = {
    TOAST_DURATION: 5000,
    AUTO_CLEAR_FORM: true,
    ENABLE_SOUNDS: true,
    REAL_TIME_VALIDATION: true,
    PASSWORD_MIN_LENGTH: 8,
    MIN_AGE: 18,
    MAX_AGE: 120
};

// ===== ELEMENTOS DEL DOM =====
const DOM = {
    // Formulario principal
    form: document.getElementById('registrationForm'),
    submitBtn: document.getElementById('submitBtn'),
    
    // Campos del formulario
    username: document.getElementById('username'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword'),
    age: document.getElementById('age'),
    terms: document.getElementById('terms'),
    
    // Elementos de estado
    statsPanel: document.getElementById('statsPanel'),
    validFields: document.getElementById('validFields'),
    timeSpent: document.getElementById('timeSpent'),
    validationCount: document.getElementById('validationCount'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    
    // Sidebar de validación
    overallStatus: document.getElementById('overallStatus'),
    statusDescription: document.getElementById('statusDescription'),
    overallStatusIcon: document.getElementById('overallStatusIcon'),
    completedFields: document.getElementById('completedFields'),
    errorCount: document.getElementById('errorCount'),
    warningCount: document.getElementById('warningCount'),
    fieldList: document.getElementById('fieldList'),
    validationHistory: document.getElementById('validationHistory'),
    
    // Toast (¡CRÍTICO!)
    toast: document.getElementById('toast'),
    toastClose: document.getElementById('toastClose'),
    toastIcon: document.getElementById('toastIcon'),
    toastTitle: document.getElementById('toastTitle'),
    toastMessage: document.getElementById('toastMessage'),
    toastProgress: document.getElementById('toastProgress'),
    
    // Modales
    termsModal: document.getElementById('termsModal'),
    successModal: document.getElementById('successModal'),
    successData: document.getElementById('successData')
};

// ===== ESTADO DE LA APLICACIÓN =====
const AppState = {
    startTime: new Date(),
    validationCount: 0,
    validFields: 0,
    totalFields: 6,
    fieldStates: {},
    validationHistory: [],
    toastTimeout: null,
    progressInterval: null,
    isValidationActive: CONFIG.REAL_TIME_VALIDATION
};

// ===== INICIALIZACIÓN =====
function initApp() {
    // Inicializar estado de campos
    const fields = ['username', 'email', 'password', 'confirmPassword', 'age', 'terms'];
    fields.forEach(field => {
        AppState.fieldStates[field] = {
            valid: false,
            value: '',
            lastValidation: null,
            errors: []
        };
    });
    
    // Configurar event listeners
    setupEventListeners();
    
    // Iniciar temporizador
    startTimer();
    
    // Iniciar barra de progreso
    startProgressTracking();
    
    // Actualizar UI inicial
    updateStats();
    updateValidationSummary();
    renderFieldList();
    
    console.log('✅ Validador de Formulario inicializado');
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        showToast('👋 ¡Bienvenido al Validador de Formulario!', 
                 'Completa todos los campos para habilitar el envío', 
                 'info');
    }, 1000);
}

// ===== FUNCIONES DE VALIDACIÓN MEJORADAS =====
function validateField(field, value) {
    const fieldId = field.id;
    const trimmedValue = value.trim();
    let isValid = true;
    let errors = [];
    let warnings = [];
    
    // Incrementar contador de validaciones
    AppState.validationCount++;
    
    switch(fieldId) {
        case 'username':
            isValid = validateUsername(trimmedValue, errors, warnings);
            break;
            
        case 'email':
            isValid = validateEmail(trimmedValue, errors, warnings);
            break;
            
        case 'password':
            isValid = validatePassword(trimmedValue, errors, warnings);
            break;
            
        case 'confirmPassword':
            isValid = validateConfirmPassword(trimmedValue, errors, warnings);
            break;
            
        case 'age':
            isValid = validateAge(trimmedValue, errors, warnings);
            break;
            
        case 'terms':
            isValid = validateTerms(field.checked, errors, warnings);
            break;
    }
    
    // Actualizar estado del campo
    AppState.fieldStates[fieldId] = {
        valid: isValid,
        value: trimmedValue,
        lastValidation: new Date(),
        errors: errors,
        warnings: warnings
    };
    
    // Actualizar UI del campo
    updateFieldUI(field, isValid, errors, warnings);
    
    // Registrar en historial si hubo cambios
    if (errors.length > 0 || warnings.length > 0) {
        addToHistory(fieldId, isValid, errors[0] || warnings[0]);
    }
    
    // Actualizar estadísticas
    updateStats();
    updateValidationSummary();
    renderFieldList();
    
    return isValid;
}

// Funciones de validación específicas
function validateUsername(value, errors, warnings) {
    if (!value) {
        errors.push('El nombre de usuario es obligatorio');
        return false;
    }
    
    if (value.length < 3) {
        errors.push('Debe tener al menos 3 caracteres');
        return false;
    }
    
    if (value.length > 20) {
        warnings.push('Máximo recomendado: 20 caracteres');
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        errors.push('Solo letras, números y guiones bajos');
        return false;
    }
    
    if (value.toLowerCase() === 'admin' || value.toLowerCase() === 'administrador') {
        warnings.push('Este nombre de usuario está restringido');
    }
    
    return true;
}

function validateEmail(value, errors, warnings) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!value) {
        errors.push('El correo electrónico es obligatorio');
        return false;
    }
    
    if (!emailRegex.test(value)) {
        errors.push('Formato de correo inválido');
        return false;
    }
    
    // Validación adicional de dominio
    const domain = value.split('@')[1];
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    
    if (!commonDomains.includes(domain.toLowerCase()) && 
        !domain.includes('.') && domain.split('.').length < 2) {
        warnings.push('Verifica que el dominio sea correcto');
    }
    
    return true;
}

function validatePassword(value, errors, warnings) {
    if (!value) {
        errors.push('La contraseña es obligatoria');
        return false;
    }
    
    if (value.length < CONFIG.PASSWORD_MIN_LENGTH) {
        errors.push(`Debe tener al menos ${CONFIG.PASSWORD_MIN_LENGTH} caracteres`);
        return false;
    }
    
    const requirements = {
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        length: value.length
    };
    
    let metRequirements = 0;
    let totalRequirements = 4;
    
    if (!requirements.hasUppercase) {
        errors.push('Debe contener al menos una mayúscula');
    } else {
        metRequirements++;
    }
    
    if (!requirements.hasLowercase) {
        errors.push('Debe contener al menos una minúscula');
    } else {
        metRequirements++;
    }
    
    if (!requirements.hasNumber) {
        errors.push('Debe contener al menos un número');
    } else {
        metRequirements++;
    }
    
    if (!requirements.hasSpecial) {
        warnings.push('Considera agregar un carácter especial');
    } else {
        metRequirements++;
    }
    
    // Calcular fortaleza
    updatePasswordStrength(value, requirements);
    
    // Actualizar requisitos visuales
    updatePasswordRequirements(value, requirements);
    
    return errors.length === 0;
}

function validateConfirmPassword(value, errors, warnings) {
    const passwordValue = DOM.password.value;
    
    if (!value) {
        errors.push('Confirma tu contraseña');
        return false;
    }
    
    if (value !== passwordValue) {
        errors.push('Las contraseñas no coinciden');
        return false;
    }
    
    return true;
}

function validateAge(value, errors, warnings) {
    const age = parseInt(value);
    
    if (!value) {
        errors.push('La edad es obligatoria');
        return false;
    }
    
    if (isNaN(age)) {
        errors.push('Debe ser un número válido');
        return false;
    }
    
    if (age < CONFIG.MIN_AGE) {
        errors.push(`Debes ser mayor de ${CONFIG.MIN_AGE} años`);
        return false;
    }
    
    if (age > CONFIG.MAX_AGE) {
        errors.push(`La edad máxima es ${CONFIG.MAX_AGE} años`);
        return false;
    }
    
    // Categorizar edad
    updateAgeCategory(age);
    
    if (age >= 60) {
        warnings.push('Gracias por registrarte, verifica tus datos cuidadosamente');
    }
    
    return true;
}

function validateTerms(isChecked, errors, warnings) {
    if (!isChecked) {
        errors.push('Debes aceptar los términos y condiciones');
        return false;
    }
    
    return true;
}

// ===== ACTUALIZACIÓN DE UI =====
function updateFieldUI(field, isValid, errors, warnings) {
    const fieldCard = field.closest('.form-card') || field.closest('.form-group');
    const statusElement = fieldCard.querySelector('.field-status');
    const errorDisplay = fieldCard.querySelector('.error-display');
    const successDisplay = fieldCard.querySelector('.success-display');
    
    // Resetear clases
    fieldCard.classList.remove('valid', 'error', 'warning');
    field.classList.remove('valid', 'error', 'warning');
    
    // Actualizar según estado
    if (!field.value.trim()) {
        // Campo vacío
        statusElement.textContent = '';
        statusElement.className = 'field-status';
    } else if (isValid) {
        // Campo válido
        fieldCard.classList.add('valid');
        field.classList.add('valid');
        statusElement.textContent = '✓ Válido';
        statusElement.className = 'field-status valid';
        
        // Mostrar éxito
        if (successDisplay) {
            successDisplay.textContent = getSuccessMessage(field.id);
            successDisplay.classList.add('show');
        }
        if (errorDisplay) errorDisplay.classList.remove('show');
    } else {
        // Campo con errores
        fieldCard.classList.add('error');
        field.classList.add('error');
        statusElement.textContent = '✗ Error';
        statusElement.className = 'field-status error';
        
        // Mostrar primer error
        if (errorDisplay && errors.length > 0) {
            errorDisplay.textContent = errors[0];
            errorDisplay.classList.add('show');
        }
        if (successDisplay) successDisplay.classList.remove('show');
    }
    
    // Mostrar advertencias si existen
    if (warnings.length > 0 && warnings[0]) {
        fieldCard.classList.add('warning');
        showToast('⚠️ Advertencia', warnings[0], 'warning');
    }
}

function getSuccessMessage(fieldId) {
    const messages = {
        'username': '¡Nombre de usuario disponible!',
        'email': 'Formato de correo válido',
        'password': 'Contraseña segura',
        'confirmPassword': 'Las contraseñas coinciden',
        'age': 'Edad válida para registro'
    };
    
    return messages[fieldId] || 'Campo válido';
}

function updatePasswordStrength(password, requirements) {
    const strengthMeter = document.getElementById('passwordStrength');
    const strengthLabel = document.getElementById('strengthLabel');
    const bars = strengthMeter.querySelectorAll('.strength-bar');
    
    let strength = 0;
    let label = 'Muy débil';
    let color = '#f44336';
    
    // Calcular fortaleza basada en requisitos cumplidos
    if (requirements.length >= CONFIG.PASSWORD_MIN_LENGTH) strength++;
    if (requirements.hasUppercase) strength++;
    if (requirements.hasNumber) strength++;
    if (requirements.hasSpecial) strength++;
    
    // Actualizar barras y etiqueta
    bars.forEach((bar, index) => {
        bar.classList.remove('active', 'medium', 'strong');
        
        if (index < strength) {
            bar.classList.add('active');
            
            if (strength >= 3) bar.classList.add('medium');
            if (strength >= 4) bar.classList.add('strong');
        }
    });
    
    // Actualizar etiqueta
    if (strength === 1) {
        label = 'Muy débil';
        color = '#f44336';
    } else if (strength === 2) {
        label = 'Débil';
        color = '#ff9800';
    } else if (strength === 3) {
        label = 'Media';
        color = '#ffc107';
    } else if (strength >= 4) {
        label = 'Fuerte';
        color = '#4caf50';
    }
    
    strengthLabel.innerHTML = `Seguridad: <span style="color: ${color}">${label}</span>`;
}

function updatePasswordRequirements(password, requirements) {
    const reqElements = {
        'length': document.querySelector('[data-req="length"]'),
        'uppercase': document.querySelector('[data-req="uppercase"]'),
        'lowercase': document.querySelector('[data-req="lowercase"]'),
        'number': document.querySelector('[data-req="number"]'),
        'special': document.querySelector('[data-req="special"]')
    };
    
    // Actualizar cada requisito
    if (reqElements.length) {
        const countElement = reqElements.length.querySelector('.req-count');
        countElement.textContent = `${password.length}/${CONFIG.PASSWORD_MIN_LENGTH}`;
        
        if (password.length >= CONFIG.PASSWORD_MIN_LENGTH) {
            reqElements.length.classList.add('valid');
            reqElements.length.classList.remove('error');
        } else {
            reqElements.length.classList.add('error');
            reqElements.length.classList.remove('valid');
        }
    }
    
    if (reqElements.uppercase) {
        if (requirements.hasUppercase) {
            reqElements.uppercase.classList.add('valid');
            reqElements.uppercase.classList.remove('error');
        } else {
            reqElements.uppercase.classList.add('error');
            reqElements.uppercase.classList.remove('valid');
        }
    }
    
    if (reqElements.lowercase) {
        if (requirements.hasLowercase) {
            reqElements.lowercase.classList.add('valid');
            reqElements.lowercase.classList.remove('error');
        } else {
            reqElements.lowercase.classList.add('error');
            reqElements.lowercase.classList.remove('valid');
        }
    }
    
    if (reqElements.number) {
        if (requirements.hasNumber) {
            reqElements.number.classList.add('valid');
            reqElements.number.classList.remove('error');
        } else {
            reqElements.number.classList.add('error');
            reqElements.number.classList.remove('valid');
        }
    }
    
    if (reqElements.special) {
        if (requirements.hasSpecial) {
            reqElements.special.classList.add('valid');
            reqElements.special.classList.remove('error');
        } else {
            reqElements.special.classList.add('error');
            reqElements.special.classList.remove('valid');
        }
    }
}

function updateAgeCategory(age) {
    const ageLabel = document.getElementById('ageLabel');
    const ageCategory = document.getElementById('ageCategory');
    
    if (ageLabel) {
        ageLabel.textContent = `Edad: ${age}`;
    }
    
    if (ageCategory) {
        let category = '';
        let color = '';
        
        if (age < 18) {
            category = 'Menor de edad';
            color = '#f44336';
        } else if (age < 30) {
            category = 'Joven';
            color = '#4caf50';
        } else if (age < 50) {
            category = 'Adulto';
            color = '#2196f3';
        } else if (age < 65) {
            category = 'Adulto mayor';
            color = '#ff9800';
        } else {
            category = 'Tercera edad';
            color = '#9c27b0';
        }
        
        ageCategory.textContent = category;
        ageCategory.style.color = color;
    }
}

// ===== ESTADÍSTICAS Y PROGRESO =====
function updateStats() {
    // Calcular campos válidos
    const validCount = Object.values(AppState.fieldStates).filter(field => field.valid).length;
    AppState.validFields = validCount;
    
    // Actualizar elementos del DOM
    if (DOM.validFields) DOM.validFields.textContent = validCount;
    if (DOM.validationCount) DOM.validationCount.textContent = AppState.validationCount;
    if (DOM.completedFields) DOM.completedFields.textContent = `${validCount}/${AppState.totalFields}`;
    
    // Actualizar contador de errores y advertencias
    let errorCount = 0;
    let warningCount = 0;
    
    Object.values(AppState.fieldStates).forEach(field => {
        errorCount += field.errors.length;
        warningCount += field.warnings.length;
    });
    
    if (DOM.errorCount) DOM.errorCount.textContent = errorCount;
    if (DOM.warningCount) DOM.warningCount.textContent = warningCount;
    
    // Actualizar barra de progreso
    const progress = (validCount / AppState.totalFields) * 100;
    if (DOM.progressFill) {
        DOM.progressFill.style.width = `${progress}%`;
    }
    if (DOM.progressPercent) {
        DOM.progressPercent.textContent = `${Math.round(progress)}%`;
    }
}

function startTimer() {
    setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - AppState.startTime) / 1000);
        
        if (DOM.timeSpent) {
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            DOM.timeSpent.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function startProgressTracking() {
    AppState.progressInterval = setInterval(() => {
        updateStats();
        checkFormValidity();
    }, 500);
}

function updateValidationSummary() {
    const validCount = AppState.validFields;
    const totalCount = AppState.totalFields;
    
    if (validCount === totalCount) {
        // Todos los campos válidos
        DOM.overallStatus.textContent = 'Formulario Completo';
        DOM.statusDescription.textContent = '¡Todo listo para enviar!';
        DOM.overallStatusIcon.className = 'status-icon valid';
        DOM.overallStatusIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
    } else if (validCount > 0) {
        // Algunos campos válidos
        DOM.overallStatus.textContent = 'En Progreso';
        DOM.statusDescription.textContent = `${validCount} de ${totalCount} campos completados`;
        DOM.overallStatusIcon.className = 'status-icon warning';
        DOM.overallStatusIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    } else {
        // Ningún campo válido
        DOM.overallStatus.textContent = 'Sin Completar';
        DOM.statusDescription.textContent = 'Comienza completando los campos requeridos';
        DOM.overallStatusIcon.className = 'status-icon';
        DOM.overallStatusIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
    }
}

function renderFieldList() {
    if (!DOM.fieldList) return;
    
    DOM.fieldList.innerHTML = '';
    
    Object.entries(AppState.fieldStates).forEach(([fieldId, state]) => {
        const fieldName = getFieldDisplayName(fieldId);
        const fieldItem = document.createElement('div');
        fieldItem.className = 'field-item';
        
        let statusIcon = '';
        let statusClass = '';
        let description = '';
        
        if (state.valid) {
            statusIcon = '<i class="fas fa-check"></i>';
            statusClass = 'valid';
            description = 'Campo válido';
        } else if (state.value.trim()) {
            statusIcon = '<i class="fas fa-exclamation"></i>';
            statusClass = 'error';
            description = state.errors[0] || 'Requiere atención';
        } else {
            statusIcon = '<i class="fas fa-circle"></i>';
            statusClass = '';
            description = 'Sin completar';
        }
        
        fieldItem.innerHTML = `
            <div class="field-status-icon ${statusClass}">${statusIcon}</div>
            <div class="field-info">
                <div class="field-name">${fieldName}</div>
                <div class="field-desc">${description}</div>
            </div>
        `;
        
        DOM.fieldList.appendChild(fieldItem);
    });
}

function getFieldDisplayName(fieldId) {
    const names = {
        'username': 'Nombre de Usuario',
        'email': 'Correo Electrónico',
        'password': 'Contraseña',
        'confirmPassword': 'Confirmar Contraseña',
        'age': 'Edad',
        'terms': 'Términos y Condiciones'
    };
    
    return names[fieldId] || fieldId;
}

// ===== HISTORIAL =====
function addToHistory(fieldId, isValid, message) {
    const historyItem = {
        field: getFieldDisplayName(fieldId),
        isValid: isValid,
        message: message,
        timestamp: new Date().toLocaleTimeString(),
        type: isValid ? 'success' : 'error'
    };
    
    AppState.validationHistory.unshift(historyItem);
    
    // Limitar historial a 10 elementos
    if (AppState.validationHistory.length > 10) {
        AppState.validationHistory.pop();
    }
    
    // Actualizar UI del historial
    renderHistory();
}

function renderHistory() {
    if (!DOM.validationHistory) return;
    
    const historyContainer = DOM.validationHistory;
    
    if (AppState.validationHistory.length === 0) {
        historyContainer.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-clipboard"></i>
                <p>Aquí verás el historial de validaciones</p>
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = '';
    
    AppState.validationHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${item.type}`;
        
        historyItem.innerHTML = `
            <div class="history-time">${item.timestamp}</div>
            <div class="history-message">
                <strong>${item.field}:</strong> ${item.message}
            </div>
        `;
        
        historyContainer.appendChild(historyItem);
    });
}

// ===== TOAST - ¡IMPLEMENTACIÓN CORREGIDA! =====
function showToast(title, message, type = 'success') {
    // Limpiar timeout anterior
    if (AppState.toastTimeout) {
        clearTimeout(AppState.toastTimeout);
        AppState.toastProgress.style.transition = 'none';
        AppState.toastProgress.style.transform = 'scaleX(0)';
    }
    
    // Configurar tipo de toast
    DOM.toast.className = 'toast';
    DOM.toast.classList.add(type);
    
    // Configurar icono según tipo
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    DOM.toastIcon.className = icons[type] || icons.success;
    
    // Configurar mensaje
    DOM.toastTitle.textContent = title;
    DOM.toastMessage.textContent = message;
    
    // Mostrar toast
    DOM.toast.classList.add('show');
    
    // Resetear y animar barra de progreso
    setTimeout(() => {
        AppState.toastProgress.style.transition = 'transform 5s linear';
        AppState.toastProgress.style.transform = 'scaleX(1)';
    }, 10);
    
    // Ocultar automáticamente después del tiempo configurado
    AppState.toastTimeout = setTimeout(() => {
        hideToast();
    }, CONFIG.TOAST_DURATION);
}

function hideToast() {
    DOM.toast.classList.remove('show');
    
    if (AppState.toastTimeout) {
        clearTimeout(AppState.toastTimeout);
        AppState.toastTimeout = null;
    }
    
    // Resetear barra de progreso
    DOM.toastProgress.style.transition = 'none';
    DOM.toastProgress.style.transform = 'scaleX(0)';
}

// ===== VALIDACIÓN DEL FORMULARIO COMPLETO =====
function checkFormValidity() {
    const validFields = Object.values(AppState.fieldStates).filter(field => field.valid).length;
    const isFormValid = validFields === AppState.totalFields;
    
    // Actualizar botón de envío
    DOM.submitBtn.disabled = !isFormValid;
    
    // Actualizar estado del botón
    const submitStatus = DOM.submitBtn.querySelector('.submit-status');
    if (submitStatus) {
        if (isFormValid) {
            submitStatus.innerHTML = '<i class="fas fa-lock-open"></i><span>Formulario listo</span>';
            submitStatus.style.color = '#4caf50';
        } else {
            submitStatus.innerHTML = `<i class="fas fa-lock"></i><span>${validFields}/${AppState.totalFields} campos</span>`;
            submitStatus.style.color = '#666';
        }
    }
    
    return isFormValid;
}

function validateAllFields() {
    let allValid = true;
    
    // Validar cada campo
    allValid &= validateField(DOM.username, DOM.username.value);
    allValid &= validateField(DOM.email, DOM.email.value);
    allValid &= validateField(DOM.password, DOM.password.value);
    allValid &= validateField(DOM.confirmPassword, DOM.confirmPassword.value);
    allValid &= validateField(DOM.age, DOM.age.value);
    allValid &= validateField(DOM.terms, DOM.terms.checked);
    
    return allValid;
}

// ===== MANEJO DEL ENVÍO =====
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validar todos los campos
    const isFormValid = validateAllFields();
    
    if (!isFormValid) {
        showToast('❌ Formulario Inválido', 
                 'Corrige los errores antes de enviar', 
                 'error');
        
        // Agitar el formulario
        DOM.form.classList.add('shake');
        setTimeout(() => DOM.form.classList.remove('shake'), 500);
        
        return;
    }
    
    // Mostrar toast de envío
    showToast('📤 Enviando...', 'Procesando tu registro', 'info');
    
    // Simular envío al servidor
    try {
        await simulateServerRequest();
        
        // Mostrar modal de éxito
        showSuccessModal();
        
        // Mostrar toast de éxito
        showToast('✅ ¡Registro Exitoso!', 
                 'Tus datos se han enviado correctamente', 
                 'success');
        
        // Limpiar formulario si está configurado
        if (CONFIG.AUTO_CLEAR_FORM) {
            setTimeout(clearForm, 2000);
        }
        
    } catch (error) {
        showToast('❌ Error de Envío', 
                 'Hubo un problema al procesar tu registro', 
                 'error');
    }
}

function simulateServerRequest() {
    return new Promise((resolve, reject) => {
        // Simular delay de red
        setTimeout(() => {
            // 90% de probabilidad de éxito
            if (Math.random() > 0.1) {
                resolve();
            } else {
                reject(new Error('Error del servidor'));
            }
        }, 1500);
    });
}

function showSuccessModal() {
    // Actualizar datos en el modal
    DOM.successData.innerHTML = `
        <p><strong>Usuario:</strong> ${DOM.username.value}</p>
        <p><strong>Email:</strong> ${DOM.email.value}</p>
        <p><strong>Edad:</strong> ${DOM.age.value} años</p>
        <p><strong>Fecha de registro:</strong> ${new Date().toLocaleDateString()}</p>
    `;
    
    // Mostrar modal
    DOM.successModal.classList.add('show');
}

function clearForm() {
    // Resetear formulario
    DOM.form.reset();
    
    // Resetear estados
    Object.keys(AppState.fieldStates).forEach(fieldId => {
        AppState.fieldStates[fieldId] = {
            valid: false,
            value: '',
            lastValidation: null,
            errors: [],
            warnings: []
        };
    });
    
    // Resetear UI
    document.querySelectorAll('.form-card').forEach(card => {
        card.classList.remove('valid', 'error', 'warning');
    });
    
    document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('valid', 'error', 'warning');
    });
    
    document.querySelectorAll('.error-display, .success-display').forEach(display => {
        display.classList.remove('show');
    });
    
    // Resetear contadores
    AppState.validFields = 0;
    updateStats();
    updateValidationSummary();
    renderFieldList();
    
    // Mostrar toast de confirmación
    showToast('🔄 Formulario Limpiado', 
             'Todos los campos han sido restablecidos', 
             'info');
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Validación en tiempo real para cada campo
    if (AppState.isValidationActive) {
        DOM.username.addEventListener('input', () => validateField(DOM.username, DOM.username.value));
        DOM.email.addEventListener('input', () => validateField(DOM.email, DOM.email.value));
        DOM.password.addEventListener('input', () => validateField(DOM.password, DOM.password.value));
        DOM.confirmPassword.addEventListener('input', () => validateField(DOM.confirmPassword, DOM.confirmPassword.value));
        DOM.age.addEventListener('input', () => validateField(DOM.age, DOM.age.value));
        DOM.terms.addEventListener('change', () => validateField(DOM.terms, DOM.terms.checked));
        
        // Validación al perder foco
        DOM.username.addEventListener('blur', () => validateField(DOM.username, DOM.username.value));
        DOM.email.addEventListener('blur', () => validateField(DOM.email, DOM.email.value));
        DOM.age.addEventListener('blur', () => validateField(DOM.age, DOM.age.value));
    }
    
    // Envío del formulario
    DOM.form.addEventListener('submit', handleFormSubmit);
    
    // ===== TOAST - ¡EVENT LISTENERS CRÍTICOS! =====
    
    // 1. Cerrar con la X
    DOM.toastClose.addEventListener('click', function(e) {
        e.stopPropagation(); // ¡IMPORTANTE! Evita que el click se propague
        hideToast();
    });
    
    // 2. Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideToast();
            DOM.termsModal.classList.remove('show');
            DOM.successModal.classList.remove('show');
        }
    });
    
    // 3. NO cierra el toast al hacer clic en él (solo con la X)
    // Esto es intencional - el toast es no bloqueante
    
    // Botón de mostrar/ocultar contraseña
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = DOM.password.getAttribute('type') === 'password' ? 'text' : 'password';
            DOM.password.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Botón de limpiar historial
    const clearHistoryBtn = document.getElementById('clearHistory');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            AppState.validationHistory = [];
            renderHistory();
            showToast('🗑️ Historial Limpiado', 
                     'Se ha borrado el historial de validaciones', 
                     'info');
        });
    }
    
    // Botón de rellenar datos demo
    const fillDemoBtn = document.getElementById('fillDemo');
    if (fillDemoBtn) {
        fillDemoBtn.addEventListener('click', function() {
            DOM.username.value = 'john_doe123';
            DOM.email.value = 'john@example.com';
            DOM.password.value = 'SecurePass123!';
            DOM.confirmPassword.value = 'SecurePass123!';
            DOM.age.value = '25';
            DOM.terms.checked = true;
            
            // Validar todos los campos
            validateAllFields();
            
            showToast('🎭 Datos Demo Cargados', 
                     'Se han cargado datos de ejemplo', 
                     'info');
        });
    }
    
    // Botón de limpiar formulario
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }
    
    // Botón de ver términos
    const viewTermsBtn = document.getElementById('viewTerms');
    if (viewTermsBtn) {
        viewTermsBtn.addEventListener('click', function() {
            DOM.termsModal.classList.add('show');
        });
    }
    
    // Cerrar modales
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('show');
        });
    });
    
    // Cerrar modales al hacer clic fuera
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
    
    // Botón de aceptar términos en modal
    const acceptTermsBtn = document.getElementById('acceptTerms');
    if (acceptTermsBtn) {
        acceptTermsBtn.addEventListener('click', function() {
            DOM.terms.checked = true;
            validateField(DOM.terms, true);
            DOM.termsModal.classList.remove('show');
            showToast('✅ Términos Aceptados', 
                     'Has aceptado los términos y condiciones', 
                     'success');
        });
    }
    
    // Botón de continuar en modal de éxito
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            DOM.successModal.classList.remove('show');
            clearForm();
        });
    }
}

// ===== INICIAR APLICACIÓN =====
document.addEventListener('DOMContentLoaded', initApp);

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
    showToast('⚠️ Error del Sistema', 
             'Ha ocurrido un error inesperado', 
             'error');
});
