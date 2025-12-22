/**
 * MÓDULO: Configuración y Constantes
 */
const WizardConfig = {
    TOTAL_STEPS: 4,
    STORAGE_KEY: 'wizardFormData_v1',
    SESSION_KEY: 'wizardSession',
    
    VALIDATION_RULES: {
        firstName: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/,
            errorMessages: {
                required: 'El nombre es obligatorio',
                minLength: 'El nombre debe tener al menos 2 caracteres',
                pattern: 'Solo se permiten letras, espacios y guiones'
            }
        },
        lastName: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/,
            errorMessages: {
                required: 'El apellido es obligatorio',
                minLength: 'El apellido debe tener al menos 2 caracteres',
                pattern: 'Solo se permiten letras, espacios y guiones'
            }
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            errorMessages: {
                required: 'El email es obligatorio',
                pattern: 'Email inválido. Ejemplo: usuario@ejemplo.com'
            }
        },
        phone: {
            required: true,
            pattern: /^\d{10}$/,
            errorMessages: {
                required: 'El teléfono es obligatorio',
                pattern: 'El teléfono debe tener 10 dígitos'
            }
        },
        street: {
            required: true,
            minLength: 5,
            maxLength: 100,
            errorMessages: {
                required: 'La calle es obligatoria',
                minLength: 'La dirección debe tener al menos 5 caracteres'
            }
        },
        city: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/,
            errorMessages: {
                required: 'La ciudad es obligatoria',
                pattern: 'Solo se permiten letras, espacios y guiones'
            }
        },
        zipCode: {
            required: true,
            pattern: /^\d{5}$/,
            errorMessages: {
                required: 'El código postal es obligatorio',
                pattern: 'El código postal debe tener 5 dígitos'
            }
        },
        country: {
            required: true,
            errorMessages: {
                required: 'Debes seleccionar un país'
            }
        },
        interests: {
            required: true,
            minChecked: 1,
            errorMessages: {
                required: 'Selecciona al menos un interés'
            }
        },
        terms: {
            required: true,
            errorMessages: {
                required: 'Debes aceptar los términos y condiciones'
            }
        }
    },
    
    COUNTRIES: {
        'mx': 'México',
        'es': 'España', 
        'ar': 'Argentina',
        'co': 'Colombia',
        'cl': 'Chile',
        'pe': 'Perú'
    },
    
    INTERESTS: {
        'tecnologia': 'Tecnología',
        'deportes': 'Deportes',
        'musica': 'Música',
        'viajes': 'Viajes',
        'cocina': 'Cocina',
        'lectura': 'Lectura'
    }
};

/**
 * MÓDULO: Elementos del DOM
 */
const DOM = {
    form: document.getElementById('wizardForm'),
    steps: document.querySelectorAll('.form-step'),
    progressSteps: document.querySelectorAll('.progress-step'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    submitBtn: document.getElementById('submitBtn'),
    saveDraftBtn: document.getElementById('saveDraftBtn'),
    successModal: document.getElementById('successModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    downloadDataBtn: document.getElementById('downloadDataBtn'),
    toast: document.getElementById('toast'),
    
    // Elementos de resumen
    summaryPersonal: document.getElementById('summaryPersonal'),
    summaryAddress: document.getElementById('summaryAddress'),
    summaryPreferences: document.getElementById('summaryPreferences')
};

/**
 * MÓDULO: Estado de la aplicación
 */
const AppState = {
    currentStep: 1,
    formData: {},
    isSubmitting: false,
    sessionId: null,
    
    init() {
        this.generateSessionId();
        this.loadSavedData();
    },
    
    generateSessionId() {
        this.sessionId = 'wizard_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    loadSavedData() {
        try {
            const saved = localStorage.getItem(WizardConfig.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                this.formData = data;
                
                // Restaurar sesión si es la misma
                const session = localStorage.getItem(WizardConfig.SESSION_KEY);
                if (session && JSON.parse(session).sessionId === data.sessionId) {
                    this.currentStep = data.lastStep || 1;
                    return true;
                }
            }
        } catch (error) {
            console.error('Error al cargar datos guardados:', error);
            this.showToast('⚠ No se pudieron cargar los datos guardados', 'error');
        }
        return false;
    },
    
    saveStepData() {
        try {
            this.formData.lastStep = this.currentStep;
            this.formData.sessionId = this.sessionId;
            this.formData.updatedAt = new Date().toISOString();
            
            localStorage.setItem(WizardConfig.STORAGE_KEY, JSON.stringify(this.formData));
            localStorage.setItem(WizardConfig.SESSION_KEY, JSON.stringify({
                sessionId: this.sessionId,
                lastAccess: new Date().toISOString()
            }));
            
            return true;
        } catch (error) {
            console.error('Error al guardar datos:', error);
            this.showToast('⚠ No se pudieron guardar los datos', 'error');
            return false;
        }
    },
    
    clearSavedData() {
        try {
            localStorage.removeItem(WizardConfig.STORAGE_KEY);
            localStorage.removeItem(WizardConfig.SESSION_KEY);
            this.formData = {};
            return true;
        } catch (error) {
            console.error('Error al limpiar datos:', error);
            return false;
        }
    },
    
    updateFormData(field, value) {
        this.formData[field] = value;
        this.saveStepData();
    }
};

/**
 * MÓDULO: Utilidades de validación y sanitización
 */
const ValidationUtils = {
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
     * Valida un campo según las reglas de validación
     */
    validateField(fieldName, value, rules) {
        const errors = [];
        
        if (rules.required && (value === '' || value === null || value === undefined)) {
            errors.push(rules.errorMessages?.required || 'Este campo es obligatorio');
            return { isValid: false, errors };
        }
        
        if (value === '' || value === null || value === undefined) {
            return { isValid: true, errors: [] };
        }
        
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(rules.errorMessages?.minLength || `Mínimo ${rules.minLength} caracteres`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(rules.errorMessages?.maxLength || `Máximo ${rules.maxLength} caracteres`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(rules.errorMessages?.pattern || 'Formato inválido');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },
    
    /**
     * Valida un grupo de checkboxes
     */
    validateCheckboxes(checkboxes, rules) {
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        
        if (rules.required && checkedCount < (rules.minChecked || 1)) {
            return {
                isValid: false,
                errors: [rules.errorMessages?.required || 'Selecciona al menos una opción']
            };
        }
        
        return { isValid: true, errors: [] };
    },
    
    /**
     * Formatea el teléfono para mostrar
     */
    formatPhone(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    },
    
    /**
     * Formatea el nombre del país
     */
    formatCountry(countryCode) {
        return WizardConfig.COUNTRIES[countryCode] || countryCode;
    },
    
    /**
     * Formatea los intereses
     */
    formatInterests(interestCodes) {
        if (!interestCodes || !Array.isArray(interestCodes)) return 'Ninguno';
        return interestCodes.map(code => WizardConfig.INTERESTS[code] || code).join(', ');
    }
};

/**
 * MÓDULO: Manejo de UI y navegación
 */
const UI = {
    /**
     * Muestra un paso específico del formulario
     */
    showStep(step) {
        // Validar paso dentro de rango
        step = Math.max(1, Math.min(step, WizardConfig.TOTAL_STEPS));
        AppState.currentStep = step;
        
        // Ocultar todos los pasos
        DOM.steps.forEach((stepElement, index) => {
            const isActive = index + 1 === step;
            stepElement.classList.toggle('active', isActive);
            stepElement.hidden = !isActive;
            
            // Actualizar ARIA para accesibilidad
            stepElement.setAttribute('aria-hidden', !isActive);
        });
        
        // Actualizar barra de progreso
        this.updateProgressBar(step);
        
        // Actualizar botones de navegación
        this.updateNavigationButtons(step);
        
        // Si estamos en el último paso, mostrar resumen
        if (step === WizardConfig.TOTAL_STEPS) {
            this.showSummary();
        }
        
        // Anunciar cambio de paso a lectores de pantalla
        this.announceStepChange(step);
        
        // Guardar estado actual
        AppState.saveStepData();
    },
    
    /**
     * Actualiza la barra de progreso
     */
    updateProgressBar(currentStep) {
        DOM.progressSteps.forEach((stepElement, index) => {
            const stepNumber = index + 1;
            
            stepElement.classList.remove('active', 'completed');
            stepElement.removeAttribute('aria-current');
            
            if (stepNumber === currentStep) {
                stepElement.classList.add('active');
                stepElement.setAttribute('aria-current', 'step');
            } else if (stepNumber < currentStep) {
                stepElement.classList.add('completed');
            }
        });
    },
    
    /**
     * Actualiza los botones de navegación
     */
    updateNavigationButtons(step) {
        // Botón Anterior
        DOM.prevBtn.style.display = step === 1 ? 'none' : 'flex';
        DOM.prevBtn.setAttribute('aria-hidden', step === 1);
        
        // Botón Siguiente
        DOM.nextBtn.style.display = step === WizardConfig.TOTAL_STEPS ? 'none' : 'flex';
        DOM.nextBtn.setAttribute('aria-hidden', step === WizardConfig.TOTAL_STEPS);
        
        // Botón Enviar
        DOM.submitBtn.style.display = step === WizardConfig.TOTAL_STEPS ? 'flex' : 'none';
        DOM.submitBtn.setAttribute('aria-hidden', step !== WizardConfig.TOTAL_STEPS);
        
        // Botón Guardar Borrador
        DOM.saveDraftBtn.style.display = step !== WizardConfig.TOTAL_STEPS ? 'flex' : 'none';
        DOM.saveDraftBtn.setAttribute('aria-hidden', step === WizardConfig.TOTAL_STEPS);
        
        // Actualizar texto del botón Siguiente
        if (step === WizardConfig.TOTAL_STEPS - 1) {
            DOM.nextBtn.querySelector('.btn-text').textContent = 'Revisar';
        } else {
            DOM.nextBtn.querySelector('.btn-text').textContent = 'Siguiente';
        }
    },
    
    /**
     * Muestra el resumen de datos
     */
    showSummary() {
        const { formData } = AppState;
        
        // Crear elementos de forma segura
        this.createSummaryElement('summaryPersonal', [
            { label: 'Nombre', value: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() },
            { label: 'Email', value: formData.email },
            { label: 'Teléfono', value: ValidationUtils.formatPhone(formData.phone) }
        ]);
        
        this.createSummaryElement('summaryAddress', [
            { label: 'Dirección', value: formData.street },
            { label: 'Ciudad', value: formData.city },
            { label: 'Código Postal', value: formData.zipCode },
            { label: 'País', value: ValidationUtils.formatCountry(formData.country) }
        ]);
        
        this.createSummaryElement('summaryPreferences', [
            { label: 'Intereses', value: ValidationUtils.formatInterests(formData.interests) },
            { label: 'Newsletter', value: formData.newsletter ? 'Sí' : 'No' },
            { label: 'Comentarios', value: formData.comments || 'Sin comentarios' }
        ]);
    },
    
    /**
     * Crea elementos de resumen de forma segura
     */
    createSummaryElement(elementId, items) {
        const element = document.getElementById(elementId);
        element.innerHTML = '';
        
        items.forEach(item => {
            const p = document.createElement('p');
            p.innerHTML = `
                <strong>${ValidationUtils.sanitize(item.label)}:</strong>
                <span>${ValidationUtils.sanitize(item.value)}</span>
            `;
            element.appendChild(p);
        });
    },
    
    /**
     * Muestra un mensaje toast
     */
    showToast(message, type = 'info') {
        const toast = DOM.toast;
        const icon = type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ';
        
        toast.querySelector('.toast-message').textContent = message;
        
        // Actualizar color según tipo
        toast.style.background = type === 'success' ? 'var(--color-success)' :
                                type === 'error' ? 'var(--color-error)' :
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
     * Muestra el modal de éxito
     */
    showSuccessModal() {
        const modal = DOM.successModal;
        
        // Asegurar focus dentro del modal
        modal.removeAttribute('hidden');
        setTimeout(() => {
            modal.classList.add('active');
            DOM.closeModalBtn.focus();
        }, 10);
        
        // Agregar evento para cerrar con Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideSuccessModal();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        modal._escapeHandler = handleEscape;
    },
    
    /**
     * Oculta el modal de éxito
     */
    hideSuccessModal() {
        const modal = DOM.successModal;
        modal.classList.remove('active');
        
        setTimeout(() => {
            modal.hidden = true;
            // Limpiar formulario y reiniciar
            this.resetForm();
        }, 300);
        
        // Remover event listener
        if (modal._escapeHandler) {
            document.removeEventListener('keydown', modal._escapeHandler);
        }
    },
    
    /**
     * Reinicia el formulario
     */
    resetForm() {
        DOM.form.reset();
        AppState.formData = {};
        AppState.clearSavedData();
        AppState.generateSessionId();
        this.showStep(1);
    },
    
    /**
     * Anuncia cambio de paso para lectores de pantalla
     */
    announceStepChange(step) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'visually-hidden';
        
        const stepTitles = [
            'Datos Personales',
            'Dirección',
            'Preferencias',
            'Confirmación'
        ];
        
        announcement.textContent = `Paso ${step} de ${WizardConfig.TOTAL_STEPS}: ${stepTitles[step - 1]}`;
        
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 100);
    }
};

/**
 * MÓDULO: Validación del formulario
 */
const FormValidation = {
    /**
     * Valida el paso actual del formulario
     */
    validateCurrentStep() {
        const step = AppState.currentStep;
        const stepElement = DOM.steps[step - 1];
        let isValid = true;
        
        // Limpiar errores previos
        this.clearStepErrors(stepElement);
        
        switch (step) {
            case 1:
                isValid = this.validateStep1(stepElement);
                break;
            case 2:
                isValid = this.validateStep2(stepElement);
                break;
            case 3:
                isValid = this.validateStep3(stepElement);
                break;
            case 4:
                isValid = this.validateStep4(stepElement);
                break;
        }
        
        return isValid;
    },
    
    /**
     * Limpia errores del paso
     */
    clearStepErrors(stepElement) {
        const errorMessages = stepElement.querySelectorAll('.error-message');
        const formGroups = stepElement.querySelectorAll('.form-group');
        
        errorMessages.forEach(msg => {
            msg.textContent = '';
            msg.setAttribute('aria-hidden', 'true');
        });
        
        formGroups.forEach(group => {
            group.classList.remove('error', 'valid');
        });
    },
    
    /**
     * Valida paso 1: Datos Personales
     */
    validateStep1(stepElement) {
        let isValid = true;
        const fields = ['firstName', 'lastName', 'email', 'phone'];
        
        fields.forEach(fieldName => {
            const input = stepElement.querySelector(`[name="${fieldName}"]`);
            const formGroup = input.closest('.form-group');
            const errorMessage = formGroup.querySelector('.error-message');
            const rules = WizardConfig.VALIDATION_RULES[fieldName];
            
            const validation = ValidationUtils.validateField(
                fieldName,
                input.value.trim(),
                rules
            );
            
            // Actualizar UI
            input.classList.remove('valid', 'invalid');
            formGroup.classList.remove('error', 'valid');
            
            if (!validation.isValid) {
                isValid = false;
                input.classList.add('invalid');
                formGroup.classList.add('error');
                errorMessage.textContent = validation.errors[0];
                errorMessage.setAttribute('aria-hidden', 'false');
                
                // Enfocar primer campo con error
                if (isValid === false) {
                    input.focus();
                }
            } else if (input.value.trim()) {
                input.classList.add('valid');
                formGroup.classList.add('valid');
            }
        });
        
        return isValid;
    },
    
    /**
     * Valida paso 2: Dirección
     */
    validateStep2(stepElement) {
        let isValid = true;
        const fields = ['street', 'city', 'zipCode', 'country'];
        
        fields.forEach(fieldName => {
            const input = stepElement.querySelector(`[name="${fieldName}"]`);
            const formGroup = input.closest('.form-group');
            const errorMessage = formGroup.querySelector('.error-message');
            const rules = WizardConfig.VALIDATION_RULES[fieldName];
            
            const value = fieldName === 'country' ? input.value : input.value.trim();
            const validation = ValidationUtils.validateField(
                fieldName,
                value,
                rules
            );
            
            // Actualizar UI
            input.classList.remove('valid', 'invalid');
            formGroup.classList.remove('error', 'valid');
            
            if (!validation.isValid) {
                isValid = false;
                input.classList.add('invalid');
                formGroup.classList.add('error');
                errorMessage.textContent = validation.errors[0];
                errorMessage.setAttribute('aria-hidden', 'false');
                
                // Enfocar primer campo con error
                if (isValid === false) {
                    input.focus();
                }
            } else if (value) {
                input.classList.add('valid');
                formGroup.classList.add('valid');
            }
        });
        
        return isValid;
    },
    
    /**
     * Valida paso 3: Preferencias
     */
    validateStep3(stepElement) {
        let isValid = true;
        
        // Validar intereses
        const interestsCheckboxes = stepElement.querySelectorAll('input[name="interests"]');
        const interestsGroup = interestsCheckboxes[0].closest('.form-group');
        const errorMessage = interestsGroup.querySelector('.error-message');
        const rules = WizardConfig.VALIDATION_RULES.interests;
        
        const validation = ValidationUtils.validateCheckboxes(interestsCheckboxes, rules);
        
        interestsGroup.classList.remove('error', 'valid');
        
        if (!validation.isValid) {
            isValid = false;
            interestsGroup.classList.add('error');
            errorMessage.textContent = validation.errors[0];
            errorMessage.setAttribute('aria-hidden', 'false');
        } else {
            interestsGroup.classList.add('valid');
        }
        
        return isValid;
    },
    
    /**
     * Valida paso 4: Confirmación
     */
    validateStep4(stepElement) {
        let isValid = true;
        
        // Validar términos
        const termsCheckbox = stepElement.querySelector('#terms');
        const termsGroup = termsCheckbox.closest('.form-group');
        const errorMessage = termsGroup.querySelector('.error-message');
        const rules = WizardConfig.VALIDATION_RULES.terms;
        
        termsGroup.classList.remove('error', 'valid');
        
        if (!termsCheckbox.checked) {
            isValid = false;
            termsGroup.classList.add('error');
            errorMessage.textContent = rules.errorMessages.required;
            errorMessage.setAttribute('aria-hidden', 'false');
            termsCheckbox.focus();
        } else {
            termsGroup.classList.add('valid');
        }
        
        return isValid;
    },
    
    /**
     * Valida el formulario completo
     */
    validateCompleteForm() {
        // Validar todos los pasos
        for (let step = 1; step <= WizardConfig.TOTAL_STEPS; step++) {
            AppState.currentStep = step;
            if (!this.validateCurrentStep()) {
                UI.showStep(step);
                return false;
            }
        }
        return true;
    }
};

/**
 * MÓDULO: Manejo de datos del formulario
 */
const FormDataManager = {
    /**
     * Guarda los datos del paso actual
     */
    saveCurrentStepData() {
        const step = AppState.currentStep;
        const stepElement = DOM.steps[step - 1];
        
        switch (step) {
            case 1:
                this.saveStep1Data(stepElement);
                break;
            case 2:
                this.saveStep2Data(stepElement);
                break;
            case 3:
                this.saveStep3Data(stepElement);
                break;
            case 4:
                this.saveStep4Data(stepElement);
                break;
        }
        
        AppState.saveStepData();
    },
    
    /**
     * Guarda datos del paso 1
     */
    saveStep1Data(stepElement) {
        const data = {};
        const fields = ['firstName', 'lastName', 'email', 'phone'];
        
        fields.forEach(field => {
            const input = stepElement.querySelector(`[name="${field}"]`);
            data[field] = input.value.trim();
        });
        
        Object.assign(AppState.formData, data);
    },
    
    /**
     * Guarda datos del paso 2
     */
    saveStep2Data(stepElement) {
        const data = {};
        const fields = ['street', 'city', 'zipCode', 'country'];
        
        fields.forEach(field => {
            const input = stepElement.querySelector(`[name="${field}"]`);
            data[field] = field === 'country' ? input.value : input.value.trim();
        });
        
        Object.assign(AppState.formData, data);
    },
    
    /**
     * Guarda datos del paso 3
     */
    saveStep3Data(stepElement) {
        const data = {};
        
        // Intereses
        const interestsCheckboxes = stepElement.querySelectorAll('input[name="interests"]:checked');
        data.interests = Array.from(interestsCheckboxes).map(cb => cb.value);
        
        // Newsletter
        const newsletterCheckbox = stepElement.querySelector('#newsletter');
        data.newsletter = newsletterCheckbox.checked;
        
        // Comentarios
        const commentsTextarea = stepElement.querySelector('#comments');
        data.comments = commentsTextarea.value.trim();
        
        Object.assign(AppState.formData, data);
    },
    
    /**
     * Guarda datos del paso 4
     */
    saveStep4Data(stepElement) {
        const data = {};
        
        // Términos
        const termsCheckbox = stepElement.querySelector('#terms');
        data.termsAccepted = termsCheckbox.checked;
        data.termsAcceptedAt = new Date().toISOString();
        
        Object.assign(AppState.formData, data);
    },
    
    /**
     * Rellena el formulario con datos guardados
     */
    populateFormWithSavedData() {
        const { formData } = AppState;
        
        Object.keys(formData).forEach(field => {
            if (field === 'interests') {
                // Manejar intereses
                formData.interests.forEach(value => {
                    const checkbox = document.querySelector(`input[name="interests"][value="${value}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            } else if (field === 'newsletter' || field === 'termsAccepted') {
                // Manejar checkboxes booleanos
                const checkbox = document.querySelector(`[name="${field}"]`);
                if (checkbox) checkbox.checked = formData[field];
            } else if (!['lastStep', 'sessionId', 'updatedAt', 'termsAcceptedAt'].includes(field)) {
                // Manejar otros campos
                const input = document.querySelector(`[name="${field}"]`);
                if (input) input.value = formData[field] || '';
            }
        });
    },
    
    /**
     * Genera un JSON para descargar los datos
     */
    generateDownloadData() {
        const data = { ...AppState.formData };
        
        // Remover metadatos internos
        delete data.lastStep;
        delete data.sessionId;
        delete data.updatedAt;
        
        // Formatear datos para mejor legibilidad
        const formattedData = {
            ...data,
            phone: ValidationUtils.formatPhone(data.phone),
            country: ValidationUtils.formatCountry(data.country),
            interests: ValidationUtils.formatInterests(data.interests),
            newsletter: data.newsletter ? 'Sí' : 'No',
            submittedAt: new Date().toISOString()
        };
        
        return JSON.stringify(formattedData, null, 2);
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
        this.setupNavigation();
        this.setupFormValidation();
        this.setupModal();
        this.setupKeyboardShortcuts();
        this.setupAutoSave();
    },
    
    /**
     * Configura navegación entre pasos
     */
    setupNavigation() {
        // Botón Siguiente
        DOM.nextBtn.addEventListener('click', () => {
            if (FormValidation.validateCurrentStep()) {
                FormDataManager.saveCurrentStepData();
                UI.showStep(AppState.currentStep + 1);
            } else {
                UI.showToast('⚠ Por favor corrige los errores antes de continuar', 'error');
            }
        });
        
        // Botón Anterior
        DOM.prevBtn.addEventListener('click', () => {
            UI.showStep(AppState.currentStep - 1);
        });
        
        // Botón Guardar Borrador
        if (DOM.saveDraftBtn) {
            DOM.saveDraftBtn.addEventListener('click', () => {
                FormDataManager.saveCurrentStepData();
                UI.showToast('📝 Borrador guardado exitosamente', 'success');
            });
        }
    },
    
    /**
     * Configura validación del formulario
     */
    setupFormValidation() {
        // Validación en tiempo real para campos de texto
        DOM.form.addEventListener('input', (e) => {
            const input = e.target;
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA' || input.tagName === 'SELECT') {
                // Validación simple en tiempo real
                this.validateSingleField(input);
            }
        });
        
        // Validación al perder el foco
        DOM.form.addEventListener('blur', (e) => {
            const input = e.target;
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA' || input.tagName === 'SELECT') {
                this.validateSingleField(input, true);
            }
        }, true);
        
        // Envío del formulario
        DOM.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (AppState.isSubmitting) return;
            
            // Validar formulario completo
            if (!FormValidation.validateCompleteForm()) {
                UI.showToast('⚠ Por favor corrige todos los errores', 'error');
                return;
            }
            
            AppState.isSubmitting = true;
            DOM.submitBtn.disabled = true;
            DOM.submitBtn.innerHTML = '<span class="btn-text">Enviando...</span>';
            
            try {
                // Simular envío a servidor
                await this.submitForm();
                
                // Mostrar éxito
                UI.showSuccessModal();
                UI.showToast('✅ Formulario enviado exitosamente', 'success');
                
                // Limpiar datos guardados
                AppState.clearSavedData();
                
            } catch (error) {
                console.error('Error al enviar formulario:', error);
                UI.showToast('❌ Error al enviar el formulario. Intenta nuevamente.', 'error');
            } finally {
                AppState.isSubmitting = false;
                DOM.submitBtn.disabled = false;
                DOM.submitBtn.innerHTML = '<span class="btn-text">Enviar</span><span class="btn-icon" aria-hidden="true">✓</span>';
            }
        });
    },
    
    /**
     * Valida un solo campo
     */
    validateSingleField(input, showError = false) {
        const fieldName = input.name;
        const rules = WizardConfig.VALIDATION_RULES[fieldName];
        
        if (!rules) return;
        
        const formGroup = input.closest('.form-group');
        const errorMessage = formGroup?.querySelector('.error-message');
        
        let value;
        if (input.type === 'checkbox' && input.name === 'interests') {
            const checkboxes = document.querySelectorAll(`input[name="${input.name}"]`);
            value = Array.from(checkboxes).filter(cb => cb.checked).length;
        } else if (input.type === 'checkbox') {
            value = input.checked;
        } else {
            value = input.value.trim();
        }
        
        const validation = ValidationUtils.validateField(fieldName, value, rules);
        
        // Actualizar UI
        input.classList.remove('valid', 'invalid');
        formGroup?.classList.remove('error', 'valid');
        
        if (showError && !validation.isValid) {
            input.classList.add('invalid');
            formGroup?.classList.add('error');
            if (errorMessage) {
                errorMessage.textContent = validation.errors[0];
                errorMessage.setAttribute('aria-hidden', 'false');
            }
        } else if (validation.isValid && value && value !== '') {
            input.classList.add('valid');
            formGroup?.classList.add('valid');
        }
    },
    
    /**
     * Simula el envío del formulario al servidor
     */
    async submitForm() {
        // Simular llamada a API
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // En una aplicación real, aquí iría fetch() o axios
                const success = Math.random() > 0.1; // 90% éxito
                
                if (success) {
                    resolve();
                } else {
                    reject(new Error('Error de servidor simulado'));
                }
            }, 1500);
        });
    },
    
    /**
     * Configura el modal de éxito
     */
    setupModal() {
        // Botón cerrar modal
        DOM.closeModalBtn.addEventListener('click', () => {
            UI.hideSuccessModal();
        });
        
        // Botón descargar datos
        DOM.downloadDataBtn.addEventListener('click', () => {
            const data = FormDataManager.generateDownloadData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = `formulario_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            UI.showToast('📄 Datos descargados exitosamente', 'success');
        });
        
        // Cerrar modal al hacer clic fuera
        DOM.successModal.addEventListener('click', (e) => {
            if (e.target === DOM.successModal || e.target.classList.contains('modal-overlay')) {
                UI.hideSuccessModal();
            }
        });
    },
    
    /**
     * Configura atajos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + S para guardar borrador
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (DOM.saveDraftBtn.style.display !== 'none') {
                    DOM.saveDraftBtn.click();
                }
            }
            
            // Flechas para navegar
            if (e.key === 'ArrowRight' && DOM.nextBtn.style.display !== 'none') {
                e.preventDefault();
                DOM.nextBtn.click();
            }
            
            if (e.key === 'ArrowLeft' && DOM.prevBtn.style.display !== 'none') {
                e.preventDefault();
                DOM.prevBtn.click();
            }
            
            // Enter para enviar en último paso
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && 
                DOM.submitBtn.style.display !== 'none' && !AppState.isSubmitting) {
                e.preventDefault();
                DOM.submitBtn.click();
            }
        });
    },
    
    /**
     * Configura guardado automático
     */
    setupAutoSave() {
        // Guardar automáticamente cada 30 segundos
        setInterval(() => {
            if (AppState.currentStep !== WizardConfig.TOTAL_STEPS) {
                FormDataManager.saveCurrentStepData();
            }
        }, 30000);
        
        // Guardar al salir de la página
        window.addEventListener('beforeunload', () => {
            FormDataManager.saveCurrentStepData();
        });
    }
};

/**
 * INICIALIZACIÓN DE LA APLICACIÓN
 */
class MultiStepFormApp {
    static init() {
        try {
            // Inicializar estado
            AppState.init();
            
            // Configurar eventos
            EventHandlers.init();
            
            // Rellenar formulario con datos guardados
            FormDataManager.populateFormWithSavedData();
            
            // Mostrar paso actual
            UI.showStep(AppState.currentStep);
            
            // Log de inicialización
            console.log('📝 Formulario Multi-paso - Inicializado');
            console.log(`📊 Paso actual: ${AppState.currentStep}`);
            console.log(`💾 Datos cargados: ${Object.keys(AppState.formData).length > 0 ? 'Sí' : 'No'}`);
            
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            UI.showToast('❌ Error al inicializar el formulario', 'error');
        }
    }
}

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MultiStepFormApp.init());
} else {
    MultiStepFormApp.init();
}

// Exportar para testing (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        ValidationUtils,
        FormValidation
    };
}
