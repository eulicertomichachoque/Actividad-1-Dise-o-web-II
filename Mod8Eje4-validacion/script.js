// ===============================================
// MÓDULO AVANZADO DE VALIDACIÓN DE FORMULARIOS
// ===============================================

const FormValidator = (() => {
    // ===== CONFIGURACIÓN Y CONSTANTES =====
    const CONFIG = {
        STORAGE_KEY: 'form-validator-state-v2',
        DEBOUNCE_DELAY: 300,
        VALIDATION_RULES: {
            username: {
                minLength: 3,
                maxLength: 20,
                pattern: /^[a-zA-Z0-9_]+$/,
                messages: {
                    required: 'El nombre de usuario es obligatorio',
                    minLength: 'Mínimo 3 caracteres',
                    maxLength: 'Máximo 20 caracteres',
                    pattern: 'Solo letras, números y guiones bajos'
                }
            },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                messages: {
                    required: 'El correo electrónico es obligatorio',
                    pattern: 'Ingresa un correo electrónico válido'
                }
            },
            password: {
                minLength: 8,
                requirements: {
                    length: { test: (p) => p.length >= 8, message: 'Mínimo 8 caracteres' },
                    uppercase: { test: (p) => /[A-Z]/.test(p), message: 'Al menos una letra mayúscula' },
                    lowercase: { test: (p) => /[a-z]/.test(p), message: 'Al menos una letra minúscula' },
                    number: { test: (p) => /[0-9]/.test(p), message: 'Al menos un número' },
                    special: { test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), message: 'Al menos un carácter especial' }
                }
            },
            age: {
                min: 18,
                max: 120,
                messages: {
                    required: 'La edad es obligatoria',
                    min: 'Debes ser mayor de 18 años',
                    max: 'Ingresa una edad válida',
                    invalid: 'Ingresa una edad válida'
                }
            },
            terms: {
                messages: {
                    required: 'Debes aceptar los términos y condiciones'
                }
            }
        },
        PASSWORD_STRENGTH: {
            'very-weak': { min: 0, max: 2, color: '#ef4444', label: 'Muy débil' },
            'weak': { min: 2, max: 4, color: '#f59e0b', label: 'Débil' },
            'fair': { min: 4, max: 6, color: '#3b82f6', label: 'Regular' },
            'good': { min: 6, max: 8, color: '#8b5cf6', label: 'Buena' },
            'strong': { min: 8, max: 10, color: '#10b981', label: 'Excelente' }
        }
    };

    // ===== ESTADO GLOBAL =====
    const state = {
        fields: {},
        isValid: false,
        isSubmitting: false,
        totalChanges: 0,
        validFields: 0,
        lastValidation: null,
        history: []
    };

    // ===== REFERENCIAS AL DOM =====
    const DOM = {
        form: null,
        fields: {},
        progress: {
            fill: null,
            text: null,
            stats: null
        },
        summary: {
            container: null,
            content: null,
            details: null,
            stats: {
                completed: null,
                validation: null,
                lastCheck: null
            }
        },
        password: {
            strength: null,
            strengthLabel: null,
            requirements: {},
            toggle: null
        },
        buttons: {
            submit: null,
            reset: null,
            validate: null
        },
        notifications: null,
        modal: null,
        modalAcceptBtn: null
    };

    // ===== INICIALIZACIÓN =====
    function init() {
        try {
            loadDOMReferences();
            setupEventListeners();
            restoreFormState();
            setupPasswordToggle();
            setupModal();
            setupNotifications();
            
            // Validar campos iniciales
            validateAllFields(true);
            
            console.log('📝 FormValidator iniciado correctamente');
            
            showNotification('Formulario listo. La validación ocurre en tiempo real.', 'info');
            
        } catch (error) {
            console.error('❌ Error al inicializar FormValidator:', error);
            showErrorUI();
        }
    }

    // ===== MANEJO DEL DOM =====
    function loadDOMReferences() {
        DOM.form = document.getElementById('registrationForm');
        if (!DOM.form) throw new Error('Formulario no encontrado');

        // Campos principales
        const fieldIds = ['username', 'email', 'password', 'confirmPassword', 'age', 'terms'];
        fieldIds.forEach(id => {
            DOM.fields[id] = document.getElementById(id);
            if (!DOM.fields[id] && id !== 'terms') {
                console.warn(`Campo ${id} no encontrado`);
            }
        });

        // Barra de progreso
        DOM.progress.fill = document.getElementById('progressFill');
        DOM.progress.text = document.getElementById('progressText');
        DOM.progress.stats = document.getElementById('progressStats');

        // Resumen
        DOM.summary.container = document.getElementById('validationSummary');
        DOM.summary.content = document.getElementById('summaryContent');
        DOM.summary.details = document.getElementById('summaryDetails');
        DOM.summary.stats.completed = document.getElementById('completedFields');
        DOM.summary.stats.validation = document.getElementById('validationStatus');
        DOM.summary.stats.lastCheck = document.getElementById('lastCheck');

        // Password
        DOM.password.strength = document.getElementById('passwordStrength');
        DOM.password.strengthLabel = document.getElementById('passwordStrengthLabel');
        
        // Requisitos de contraseña
        const requirementElements = document.querySelectorAll('.requirement');
        requirementElements.forEach(el => {
            const requirement = el.dataset.requirement;
            if (requirement) {
                DOM.password.requirements[requirement] = el;
            }
        });

        // Botones
        DOM.buttons.submit = document.getElementById('submitBtn');
        DOM.buttons.reset = document.getElementById('resetBtn');
        DOM.buttons.validate = document.getElementById('validateBtn');

        // Modal
        DOM.modal = document.getElementById('termsModal');
        DOM.modalAcceptBtn = document.getElementById('acceptTermsModal');

        // Otros elementos
        DOM.notifications = document.querySelector('.form-notifications');
    }

    function showErrorUI() {
        if (DOM.notifications) {
            createNotification('Error al cargar el formulario', 'danger');
        }
    }

    // ===== MANEJO DE ESTADO =====
    function restoreFormState() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                Object.keys(data.fields || {}).forEach(fieldId => {
                    if (DOM.fields[fieldId]) {
                        DOM.fields[fieldId].value = data.fields[fieldId];
                        if (fieldId === 'terms') {
                            DOM.fields[fieldId].checked = data.fields[fieldId] === 'true' || data.fields[fieldId] === true;
                        }
                    }
                });
                console.log('📂 Estado del formulario restaurado');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo restaurar el estado:', error);
        }
    }

    function saveFormState() {
        const fieldsData = {};
        Object.keys(DOM.fields).forEach(fieldId => {
            if (DOM.fields[fieldId]) {
                if (fieldId === 'terms') {
                    fieldsData[fieldId] = DOM.fields[fieldId].checked;
                } else {
                    fieldsData[fieldId] = DOM.fields[fieldId].value;
                }
            }
        });

        const stateToSave = {
            fields: fieldsData,
            timestamp: new Date().toISOString(),
            version: '2.0'
        };

        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar el estado:', error);
        }
    }

    function clearFormState() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
        } catch (error) {
            console.warn('⚠️ No se pudo limpiar el estado:', error);
        }
    }

    // ===== VALIDACIÓN DE CAMPOS =====
    function validateField(fieldId, silent = false) {
        const field = DOM.fields[fieldId];
        if (!field) return false;

        const fieldElement = document.querySelector(`[data-field="${fieldId}"]`);
        if (!fieldElement) return false;

        let isValid = true;
        let message = '';
        const value = fieldId === 'terms' ? field.checked : field.value.trim();

        // Validación específica por campo
        switch (fieldId) {
            case 'username':
                isValid = validateUsername(value);
                if (!isValid) {
                    message = getUsernameErrorMessage(value);
                }
                break;

            case 'email':
                isValid = validateEmail(value);
                if (!isValid) {
                    message = CONFIG.VALIDATION_RULES.email.messages[value ? 'pattern' : 'required'];
                }
                break;

            case 'password':
                isValid = validatePassword(value);
                if (!isValid) {
                    message = 'La contraseña no cumple los requisitos';
                }
                updatePasswordStrength(value);
                updatePasswordRequirements(value);
                break;

            case 'confirmPassword':
                isValid = validateConfirmPassword(value);
                if (!isValid) {
                    message = value ? 'Las contraseñas no coinciden' : 'Confirma tu contraseña';
                }
                break;

            case 'age':
                isValid = validateAge(value);
                if (!isValid) {
                    message = getAgeErrorMessage(value);
                }
                break;

            case 'terms':
                isValid = field.checked;
                if (!isValid) {
                    message = CONFIG.VALIDATION_RULES.terms.messages.required;
                }
                break;
        }

        // Actualizar UI
        if (!silent) {
            updateFieldUI(fieldId, fieldElement, isValid, message);
        }

        // Actualizar estado
        state.fields[fieldId] = {
            value: value,
            isValid: isValid,
            message: message,
            lastValidated: new Date().toISOString()
        };

        // Actualizar contadores
        if (!silent) {
            state.totalChanges++;
            updateProgress();
            updateSummary();
            checkFormValidity();
            saveFormState();
        }

        return isValid;
    }

    function validateUsername(value) {
        if (!value) return false;
        if (value.length < CONFIG.VALIDATION_RULES.username.minLength) return false;
        if (value.length > CONFIG.VALIDATION_RULES.username.maxLength) return false;
        if (!CONFIG.VALIDATION_RULES.username.pattern.test(value)) return false;
        return true;
    }

    function getUsernameErrorMessage(value) {
        if (!value) return CONFIG.VALIDATION_RULES.username.messages.required;
        if (value.length < CONFIG.VALIDATION_RULES.username.minLength) 
            return CONFIG.VALIDATION_RULES.username.messages.minLength;
        if (value.length > CONFIG.VALIDATION_RULES.username.maxLength) 
            return CONFIG.VALIDATION_RULES.username.messages.maxLength;
        return CONFIG.VALIDATION_RULES.username.messages.pattern;
    }

    function validateEmail(value) {
        if (!value) return false;
        return CONFIG.VALIDATION_RULES.email.pattern.test(value);
    }

    function validatePassword(value) {
        if (!value) return false;
        if (value.length < CONFIG.VALIDATION_RULES.password.minLength) return false;
        
        // Verificar todos los requisitos
        const requirements = CONFIG.VALIDATION_RULES.password.requirements;
        for (const key in requirements) {
            if (!requirements[key].test(value)) return false;
        }
        return true;
    }

    function validateConfirmPassword(value) {
        if (!value) return false;
        return value === (DOM.fields.password?.value || '');
    }

    function validateAge(value) {
        if (!value) return false;
        const age = parseInt(value);
        if (isNaN(age)) return false;
        if (age < CONFIG.VALIDATION_RULES.age.min) return false;
        if (age > CONFIG.VALIDATION_RULES.age.max) return false;
        return true;
    }

    function getAgeErrorMessage(value) {
        if (!value) return CONFIG.VALIDATION_RULES.age.messages.required;
        const age = parseInt(value);
        if (isNaN(age)) return CONFIG.VALIDATION_RULES.age.messages.invalid;
        if (age < CONFIG.VALIDATION_RULES.age.min) return CONFIG.VALIDATION_RULES.age.messages.min;
        return CONFIG.VALIDATION_RULES.age.messages.max;
    }

    // ===== MANEJO DE CONTRASEÑA =====
    function updatePasswordStrength(password) {
        if (!DOM.password.strength || !password) return;

        let score = 0;
        const requirements = CONFIG.VALIDATION_RULES.password.requirements;

        // Calcular score
        for (const key in requirements) {
            if (requirements[key].test(password)) score += 2;
        }

        // Determinar fuerza
        let strength = 'very-weak';
        for (const level in CONFIG.PASSWORD_STRENGTH) {
            if (score >= CONFIG.PASSWORD_STRENGTH[level].min && 
                score <= CONFIG.PASSWORD_STRENGTH[level].max) {
                strength = level;
                break;
            }
        }

        // Actualizar UI
        DOM.password.strength.setAttribute('data-strength', strength);
        DOM.password.strength.style.width = `${score * 10}%`;
        DOM.password.strength.style.backgroundColor = CONFIG.PASSWORD_STRENGTH[strength].color;
        
        if (DOM.password.strengthLabel) {
            const span = DOM.password.strengthLabel.querySelector('span');
            if (span) {
                span.textContent = CONFIG.PASSWORD_STRENGTH[strength].label;
                span.style.color = CONFIG.PASSWORD_STRENGTH[strength].color;
            }
        }
    }

    function updatePasswordRequirements(password) {
        if (!password) return;
        
        const requirements = CONFIG.VALIDATION_RULES.password.requirements;
        
        for (const key in requirements) {
            const element = DOM.password.requirements[key];
            if (element) {
                const isMet = requirements[key].test(password);
                element.classList.toggle('met', isMet);
                
                const icon = element.querySelector('.requirement-icon');
                if (icon) {
                    icon.textContent = isMet ? '✓' : '○';
                    icon.style.backgroundColor = isMet ? '#10b981' : 'transparent';
                    icon.style.borderColor = isMet ? '#10b981' : '#e2e8f0';
                    icon.style.color = isMet ? 'white' : '#718096';
                }
            }
        }
    }

    // ===== ACTUALIZACIÓN DE UI =====
    function updateFieldUI(fieldId, fieldElement, isValid, message) {
        // Remover estados previos
        fieldElement.classList.remove('valid', 'invalid', 'warning');
        
        // Aplicar nuevo estado
        if (fieldId === 'password' && DOM.fields.password?.value && !isValid) {
            fieldElement.classList.add('warning');
        } else if (isValid) {
            fieldElement.classList.add('valid');
        } else {
            fieldElement.classList.add('invalid');
        }
        
        // Actualizar mensajes de error
        const errorElement = fieldElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message || '';
            errorElement.style.display = message ? 'block' : 'none';
        }
        
        // Actualizar estado del campo
        const statusElement = fieldElement.querySelector('.field-status');
        if (statusElement) {
            statusElement.textContent = isValid ? '✓ Válido' : '✗ Inválido';
            statusElement.style.background = isValid ? '#d1fae5' : '#fee2e2';
            statusElement.style.color = isValid ? '#065f46' : '#991b1b';
        }
        
        // Actualizar icono de éxito
        const successIcon = fieldElement.querySelector('.success-icon');
        if (successIcon) {
            successIcon.style.display = isValid ? 'inline-block' : 'none';
        }
    }

    function updateProgress() {
        if (!DOM.progress.fill) return;
        
        const totalFields = Object.keys(DOM.fields).length;
        const validCount = Object.values(state.fields).filter(f => f?.isValid).length;
        const progress = (validCount / totalFields) * 100;
        
        // Actualizar barra de progreso
        DOM.progress.fill.style.width = `${progress}%`;
        DOM.progress.text.textContent = `${Math.round(progress)}% completado`;
        DOM.progress.stats.textContent = `${validCount}/${totalFields} campos`;
        
        // Actualizar atributos ARIA
        const progressBar = DOM.progress.fill.parentElement;
        if (progressBar) {
            progressBar.setAttribute('aria-valuenow', Math.round(progress));
        }
    }

    function updateSummary() {
        if (!DOM.summary.container) return;
        
        const totalFields = Object.keys(DOM.fields).length;
        const validCount = Object.values(state.fields).filter(f => f?.isValid).length;
        const isValid = validCount === totalFields;
        
        // Actualizar estadísticas
        if (DOM.summary.stats.completed) {
            DOM.summary.stats.completed.textContent = `${validCount}/${totalFields}`;
        }
        
        if (DOM.summary.stats.validation) {
            DOM.summary.stats.validation.textContent = isValid ? 'Válido' : 'No válido';
            DOM.summary.stats.validation.style.color = isValid ? '#10b981' : '#ef4444';
        }
        
        if (DOM.summary.stats.lastCheck) {
            DOM.summary.stats.lastCheck.textContent = new Date().toLocaleTimeString();
        }
        
        // Actualizar detalles
        if (DOM.summary.details) {
            let detailsHtml = '<h3>Estado de Campos:</h3><ul>';
            
            Object.entries(state.fields).forEach(([fieldId, field]) => {
                if (field) {
                    const status = field.isValid ? '✓' : '✗';
                    const color = field.isValid ? '#10b981' : '#ef4444';
                    const displayValue = fieldId === 'terms' 
                        ? (field.value ? 'Aceptado' : 'No aceptado')
                        : (field.value || '(vacío)');
                    
                    detailsHtml += `
                        <li style="color: ${color}; margin-bottom: 0.5rem;">
                            ${status} ${fieldId}: ${displayValue}
                            ${field.message ? `<br><small>${field.message}</small>` : ''}
                        </li>
                    `;
                }
            });
            
            detailsHtml += '</ul>';
            DOM.summary.details.innerHTML = detailsHtml;
        }
        
        state.validFields = validCount;
        state.lastValidation = new Date().toISOString();
    }

    function checkFormValidity() {
        const totalFields = Object.keys(DOM.fields).length;
        const validCount = Object.values(state.fields).filter(f => f?.isValid).length;
        state.isValid = validCount === totalFields;
        
        // Actualizar botón de envío
        if (DOM.buttons.submit) {
            DOM.buttons.submit.disabled = !state.isValid;
            DOM.buttons.submit.setAttribute('aria-disabled', !state.isValid);
            
            // Actualizar texto del botón si está cargando
            if (state.isSubmitting) {
                DOM.buttons.submit.classList.add('loading');
            } else {
                DOM.buttons.submit.classList.remove('loading');
            }
        }
        
        return state.isValid;
    }

    // ===== MANEJO DE EVENTOS =====
    function setupEventListeners() {
        if (!DOM.form) return;
        
        // Eventos de entrada para cada campo
        Object.keys(DOM.fields).forEach(fieldId => {
            const field = DOM.fields[fieldId];
            if (!field) return;
            
            const debouncedValidate = debounce(() => validateField(fieldId), CONFIG.DEBOUNCE_DELAY);
            
            if (field.type === 'checkbox') {
                field.addEventListener('change', () => {
                    validateField(fieldId);
                    checkFormValidity();
                });
            } else {
                field.addEventListener('input', debouncedValidate);
                field.addEventListener('blur', () => validateField(fieldId));
            }
        });
        
        // Envío del formulario
        DOM.form.addEventListener('submit', handleSubmit);
        
        // Botón de reset
        if (DOM.buttons.reset) {
            DOM.buttons.reset.addEventListener('click', handleReset);
        }
        
        // Botón de validar todo
        if (DOM.buttons.validate) {
            DOM.buttons.validate.addEventListener('click', () => validateAllFields());
        }
        
        // Toggle de resumen
        const toggleBtn = document.getElementById('toggleSummary');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
                const content = DOM.summary.content;
                
                toggleBtn.setAttribute('aria-expanded', !isExpanded);
                const toggleText = toggleBtn.querySelector('.toggle-text');
                if (toggleText) {
                    toggleText.textContent = isExpanded ? 'Mostrar detalles' : 'Ocultar detalles';
                }
                
                const toggleIcon = toggleBtn.querySelector('.toggle-icon');
                if (toggleIcon) {
                    toggleIcon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
                }
                
                if (content) {
                    content.hidden = isExpanded;
                }
            });
        }
        
        // Envío con Enter (permitido solo cuando el formulario es válido)
        DOM.form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && state.isValid && !state.isSubmitting) {
                e.preventDefault();
                handleSubmit(e);
            }
        });
        
        // Guardar estado antes de cerrar
        window.addEventListener('beforeunload', () => {
            if (Object.values(state.fields).some(f => f?.value)) {
                saveFormState();
            }
        });
    }

    function setupPasswordToggle() {
        const togglePassword = document.getElementById('togglePassword');
        const toggleConfirm = document.getElementById('toggleConfirmPassword');
        
        if (togglePassword && DOM.fields.password) {
            togglePassword.addEventListener('click', () => {
                const type = DOM.fields.password.type === 'password' ? 'text' : 'password';
                DOM.fields.password.type = type;
                togglePassword.classList.toggle('active');
                togglePassword.setAttribute('aria-label', 
                    type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
            });
        }
        
        if (toggleConfirm && DOM.fields.confirmPassword) {
            toggleConfirm.addEventListener('click', () => {
                const type = DOM.fields.confirmPassword.type === 'password' ? 'text' : 'password';
                DOM.fields.confirmPassword.type = type;
                toggleConfirm.classList.toggle('active');
                toggleConfirm.setAttribute('aria-label', 
                    type === 'password' ? 'Mostrar confirmación' : 'Ocultar confirmación');
            });
        }
    }

    function setupModal() {
        const modal = DOM.modal;
        const closeBtn = modal?.querySelector('.modal-close');
        const termsLink = document.querySelector('.terms-link');
        
        if (termsLink) {
            termsLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (modal) {
                    modal.hidden = false;
                    modal.setAttribute('aria-hidden', 'false');
                }
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.hidden = true;
                modal.setAttribute('aria-hidden', 'true');
            });
        }
        
        if (DOM.modalAcceptBtn) {
            DOM.modalAcceptBtn.addEventListener('click', () => {
                if (DOM.fields.terms) {
                    DOM.fields.terms.checked = true;
                    validateField('terms');
                    modal.hidden = true;
                    modal.setAttribute('aria-hidden', 'true');
                    showNotification('Términos aceptados', 'success');
                }
            });
        }
        
        // Cerrar modal al hacer clic fuera
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.hidden = true;
                    modal.setAttribute('aria-hidden', 'true');
                }
            });
        }
    }

    // ===== MANEJO DE FORMULARIO =====
    function handleSubmit(e) {
        e.preventDefault();
        
        if (state.isSubmitting) return;
        
        // Validar todos los campos primero
        const allValid = validateAllFields();
        if (!allValid) {
            showNotification('Por favor, corrige los errores antes de enviar', 'warning');
            
            // Enfocar el primer campo inválido
            const firstInvalidField = document.querySelector('.form-field.invalid input, .form-field.invalid .checkbox-container');
            if (firstInvalidField) {
                if (firstInvalidField.classList.contains('checkbox-container')) {
                    const checkbox = firstInvalidField.querySelector('input[type="checkbox"]');
                    if (checkbox) checkbox.focus();
                } else {
                    firstInvalidField.focus();
                }
            }
            return;
        }
        
        state.isSubmitting = true;
        
        // Mostrar estado de carga
        if (DOM.buttons.submit) {
            DOM.buttons.submit.classList.add('loading');
            DOM.buttons.submit.disabled = true;
        }
        
        // Simular envío asíncrono
        setTimeout(() => {
            // Aquí iría el envío real a un servidor
            const formData = {};
            Object.keys(DOM.fields).forEach(key => {
                if (DOM.fields[key]) {
                    formData[key] = key === 'terms' ? DOM.fields[key].checked : DOM.fields[key].value;
                }
            });
            
            // Agregar al historial
            state.history.push({
                data: formData,
                timestamp: new Date().toISOString(),
                isValid: true
            });
            
            // Limitar historial
            if (state.history.length > 10) {
                state.history = state.history.slice(-10);
            }
            
            // Mostrar éxito
            showNotification('¡Formulario enviado correctamente!', 'success');
            
            // Resetear formulario
            setTimeout(() => {
                handleReset();
            }, 1000);
            
            // Restaurar estado
            state.isSubmitting = false;
            if (DOM.buttons.submit) {
                DOM.buttons.submit.classList.remove('loading');
            }
            
            console.log('📤 Formulario enviado:', formData);
            
        }, 1500);
    }

    function handleReset() {
        if (!DOM.form) return;
        
        DOM.form.reset();
        
        // Limpiar estados UI
        document.querySelectorAll('.form-field').forEach(field => {
            field.classList.remove('valid', 'invalid', 'warning');
        });
        
        // Limpiar mensajes de error
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        
        // Limpiar iconos de éxito
        document.querySelectorAll('.success-icon').forEach(el => {
            el.style.display = 'none';
        });
        
        // Limpiar estado
        state.fields = {};
        state.isValid = false;
        state.validFields = 0;
        state.isSubmitting = false;
        
        // Actualizar UI
        updateProgress();
        updateSummary();
        checkFormValidity();
        clearFormState();
        
        // Restablecer contraseña
        if (DOM.password.strength) {
            DOM.password.strength.setAttribute('data-strength', 'very-weak');
            DOM.password.strength.style.width = '0%';
        }
        
        // Resetear requisitos de contraseña
        Object.values(DOM.password.requirements).forEach(el => {
            if (el) {
                el.classList.remove('met');
                const icon = el.querySelector('.requirement-icon');
                if (icon) {
                    icon.textContent = '○';
                    icon.style.backgroundColor = 'transparent';
                    icon.style.borderColor = '#e2e8f0';
                    icon.style.color = '#718096';
                }
            }
        });
        
        // Resetear fuerza de contraseña
        if (DOM.password.strengthLabel) {
            const span = DOM.password.strengthLabel.querySelector('span');
            if (span) {
                span.textContent = 'Muy débil';
                span.style.color = '#ef4444';
            }
        }
        
        showNotification('Formulario restablecido', 'info');
    }

    function validateAllFields(silent = false) {
        let allValid = true;
        Object.keys(DOM.fields).forEach(fieldId => {
            const isValid = validateField(fieldId, silent);
            if (!isValid) allValid = false;
        });
        
        if (!silent) {
            if (allValid) {
                showNotification('¡Todos los campos son válidos!', 'success');
            } else {
                showNotification('Hay campos que requieren atención', 'warning');
            }
        }
        
        return allValid;
    }

    // ===== NOTIFICACIONES =====
    function setupNotifications() {
        if (!DOM.notifications) {
            DOM.notifications = document.createElement('div');
            DOM.notifications.className = 'form-notifications';
            document.body.appendChild(DOM.notifications);
        }
    }

    function showNotification(message, type = 'info') {
        const notification = createNotification(message, type);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    function createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        if (DOM.notifications) {
            DOM.notifications.appendChild(notification);
        } else {
            document.body.appendChild(notification);
        }
        
        return notification;
    }

    // ===== UTILIDADES =====
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

    // ===== API PÚBLICA =====
    return {
        init,
        validateField,
        validateAllFields,
        getState: () => ({ ...state }),
        getFieldState: (fieldId) => ({ ...state.fields[fieldId] }),
        resetForm: handleReset,
        submitForm: handleSubmit
    };
})();

// ===============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // Iniciar el validador de formularios
    FormValidator.init();
    
    // Mensaje de bienvenida en consola
    console.log(`
        📝 VALIDADOR DE FORMULARIO v2.0
        ================================
        ✅ Validación en tiempo real
        🔍 Validación por campo
        📊 Progreso visual
        🔒 Seguridad de contraseña
        💾 Persistencia automática
        🎯 Retroalimentación inmediata
    `);
});

// ===============================================
// MANEJO DE ERRORES GLOBALES
// ===============================================

window.addEventListener('error', (event) => {
    console.error('❌ Error global en FormValidator:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promesa rechazada no manejada:', event.reason);
});
