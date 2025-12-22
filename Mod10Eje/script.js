/**
 * Módulo principal de validación de formulario
 * Patrón de módulo para encapsulación
 */
const FormValidator = (() => {
    // Elementos DOM
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const formFeedback = document.getElementById('formFeedback');
    
    // Cache de elementos para mejor rendimiento
    let inputCache = new Map();
    
    // Mensajes de error personalizados con más detalle
    const errorMessages = {
        username: {
            valueMissing: 'El nombre de usuario es obligatorio',
            tooShort: 'El nombre debe tener al menos 3 caracteres',
            tooLong: 'El nombre no puede exceder los 20 caracteres',
            patternMismatch: 'Solo se permiten letras, números y guiones bajos'
        },
        email: {
            valueMissing: 'El correo electrónico es obligatorio',
            typeMismatch: 'Ingresa un correo electrónico válido (ejemplo@dominio.com)',
            tooShort: 'El correo electrónico es demasiado corto'
        },
        password: {
            valueMissing: 'La contraseña es obligatoria',
            tooShort: 'La contraseña debe tener al menos 8 caracteres',
            patternMismatch: 'Debe contener mayúsculas, minúsculas y números'
        },
        confirmPassword: {
            valueMissing: 'Confirma tu contraseña',
            mismatch: 'Las contraseñas no coinciden'
        },
        phone: {
            patternMismatch: 'Ingresa un número de 10 dígitos sin espacios'
        },
        terms: {
            valueMissing: 'Debes aceptar los términos y condiciones'
        }
    };
    
    // Configuración de validación
    const validationConfig = {
        debounceDelay: 300,
        passwordMinLength: 8,
        usernameMinLength: 3,
        usernameMaxLength: 20,
        showSuccessTimeout: 3000
    };
    
    /**
     * Inicializa el validador del formulario
     */
    function init() {
        if (!form) return;
        
        cacheInputs();
        setupEventListeners();
        setupPasswordToggle();
        setupFormFeedback();
    }
    
    /**
     * Cachea los inputs para mejor rendimiento
     */
    function cacheInputs() {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            const formGroup = input.closest('.form-group');
            inputCache.set(input.id, {
                element: input,
                formGroup,
                errorElement: formGroup.querySelector('.error-message'),
                successIcon: formGroup.querySelector('.success-icon')
            });
        });
    }
    
    /**
     * Configura los event listeners
     */
    function setupEventListeners() {
        // Validación en tiempo real con debouncing
        inputCache.forEach((cache, inputId) => {
            const input = cache.element;
            
            input.addEventListener('blur', () => validateField(input));
            
            input.addEventListener('input', debounce(() => {
                if (input.classList.contains('invalid')) {
                    validateField(input);
                }
                
                // Validación especial para contraseña
                if (inputId === 'password') {
                    checkPasswordStrength(input.value);
                    validateField(document.getElementById('confirmPassword'));
                }
                
                if (inputId === 'confirmPassword') {
                    validateField(input);
                }
            }, validationConfig.debounceDelay));
            
            // Enter para navegar entre campos
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    focusNextInput(input);
                }
            });
        });
        
        // Manejo del submit
        form.addEventListener('submit', handleSubmit);
        
        // Validación inicial del formulario
        validateForm();
    }
    
    /**
     * Configura el toggle de visibilidad de contraseña
     */
    function setupPasswordToggle() {
        const toggleButtons = form.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('.password-input');
                const isPassword = input.type === 'password';
                
                input.type = isPassword ? 'text' : 'password';
                button.setAttribute('aria-label', 
                    isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                );
                button.textContent = isPassword ? '🙈' : '👁️';
                
                // Efecto visual
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }
    
    /**
     * Configura el sistema de feedback del formulario
     */
    function setupFormFeedback() {
        formFeedback.style.display = 'none';
    }
    
    /**
     * Valida un campo individual
     */
    function validateField(input) {
        const cache = inputCache.get(input.id);
        if (!cache) return false;
        
        const { formGroup, errorElement } = cache;
        
        // Validación personalizada por tipo de campo
        let isValid = true;
        let errorMessage = '';
        
        switch (input.id) {
            case 'confirmPassword':
                isValid = validateConfirmPassword(input);
                if (!isValid) {
                    errorMessage = errorMessages.confirmPassword.mismatch;
                }
                break;
                
            case 'password':
                isValid = validatePassword(input.value);
                if (!isValid && input.value.length > 0) {
                    errorMessage = errorMessages.password.patternMismatch;
                }
                break;
                
            case 'username':
                isValid = validateUsername(input.value);
                if (!isValid && input.value.length > 0) {
                    errorMessage = errorMessages.username.patternMismatch;
                }
                break;
                
            default:
                isValid = input.checkValidity();
        }
        
        // Validación estándar HTML5
        if (isValid) {
            isValid = input.checkValidity();
        }
        
        // Mostrar resultado
        if (!isValid) {
            if (!errorMessage) {
                const errorType = getErrorType(input.validity);
                errorMessage = errorMessages[input.name]?.[errorType] || 'Campo inválido';
            }
            showFieldError(input, formGroup, errorElement, errorMessage);
            return false;
        }
        
        showFieldSuccess(input, formGroup, errorElement);
        return true;
    }
    
    /**
     * Valida la confirmación de contraseña
     */
    function validateConfirmPassword(input) {
        const password = document.getElementById('password').value;
        return input.value === password;
    }
    
    /**
     * Valida la fortaleza de la contraseña
     */
    function validatePassword(password) {
        if (password.length < validationConfig.passwordMinLength) return false;
        
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumbers;
    }
    
    /**
     * Valida el nombre de usuario
     */
    function validateUsername(username) {
        if (username.length < validationConfig.usernameMinLength) return false;
        if (username.length > validationConfig.usernameMaxLength) return false;
        
        // Solo letras, números y guiones bajos
        return /^[a-zA-Z0-9_]+$/.test(username);
    }
    
    /**
     * Obtiene el tipo de error de valididad
     */
    function getErrorType(validity) {
        if (validity.valueMissing) return 'valueMissing';
        if (validity.typeMismatch) return 'typeMismatch';
        if (validity.tooShort) return 'tooShort';
        if (validity.tooLong) return 'tooLong';
        if (validity.patternMismatch) return 'patternMismatch';
        return 'invalid';
    }
    
    /**
     * Muestra error en un campo
     */
    function showFieldError(input, formGroup, errorElement, message) {
        formGroup.classList.add('error');
        formGroup.classList.remove('valid');
        input.classList.add('invalid');
        input.classList.remove('valid');
        errorElement.textContent = message;
        errorElement.style.opacity = '1';
        
        // Animación de shake
        input.style.animation = 'none';
        setTimeout(() => {
            input.style.animation = 'shake 0.5s ease';
        }, 10);
    }
    
    /**
     * Muestra éxito en un campo
     */
    function showFieldSuccess(input, formGroup, errorElement) {
        formGroup.classList.remove('error');
        formGroup.classList.add('valid');
        input.classList.remove('invalid');
        input.classList.add('valid');
        errorElement.textContent = '';
        errorElement.style.opacity = '0';
    }
    
    /**
     * Verifica la fortaleza de la contraseña
     */
    function checkPasswordStrength(password) {
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('password-strength-text');
        
        if (!password) {
            strengthBar.className = 'strength-bar';
            strengthText.textContent = 'Seguridad de la contraseña';
            return;
        }
        
        let score = 0;
        const feedback = [];
        
        // Criterios de fortaleza
        if (password.length >= validationConfig.passwordMinLength) score += 1;
        if (password.length >= 12) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        
        // Actualizar visualización con animación
        strengthBar.classList.remove('weak', 'medium', 'strong');
        
        setTimeout(() => {
            if (score <= 2) {
                strengthBar.classList.add('weak');
                strengthText.textContent = 'Débil - Añade mayúsculas y números';
                strengthText.style.color = 'var(--error-color)';
            } else if (score <= 4) {
                strengthBar.classList.add('medium');
                strengthText.textContent = 'Media - Podría ser más segura';
                strengthText.style.color = 'var(--warning-color)';
            } else {
                strengthBar.classList.add('strong');
                strengthText.textContent = 'Fuerte - ¡Excelente contraseña!';
                strengthText.style.color = 'var(--success-color)';
                
                // Efecto de pulso para contraseñas fuertes
                strengthText.style.animation = 'pulse 2s infinite';
                setTimeout(() => {
                    strengthText.style.animation = '';
                }, 2000);
            }
        }, 10);
    }
    
    /**
     * Valida todo el formulario
     */
    function validateForm() {
        let isValid = true;
        
        inputCache.forEach((cache, inputId) => {
            const input = cache.element;
            if (input.required || input.value.trim() !== '') {
                if (!validateField(input)) {
                    isValid = false;
                }
            }
        });
        
        updateSubmitButton(isValid);
        return isValid;
    }
    
    /**
     * Actualiza el estado del botón de envío
     */
    function updateSubmitButton(isValid) {
        if (isValid) {
            submitBtn.disabled = false;
            submitBtn.setAttribute('aria-label', 'Haz clic para registrarte');
        } else {
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-label', 'Completa correctamente el formulario para habilitar el registro');
        }
    }
    
    /**
     * Maneja el envío del formulario
     */
    async function handleSubmit(e) {
        e.preventDefault();
        
        // Mostrar estado de carga
        setLoadingState(true);
        
        // Validar todo el formulario
        const isValid = validateForm();
        
        if (!isValid) {
            showFormFeedback('Por favor, corrige los errores del formulario', 'error');
            setLoadingState(false);
            
            // Enfocar el primer campo con error
            const firstError = form.querySelector('.error input');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        // Obtener datos del formulario
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simulación de envío a servidor (reemplazar con fetch real)
        try {
            const success = await mockSubmitToServer(data);
            
            if (success) {
                showFormFeedback('¡Registro exitoso! Redirigiendo...', 'success');
                
                // Resetear formulario después de éxito
                setTimeout(() => {
                    form.reset();
                    resetFormVisuals();
                    showFormFeedback('Puedes registrar otra cuenta si lo deseas', 'info');
                }, validationConfig.showSuccessTimeout);
            } else {
                showFormFeedback('Error en el servidor. Intenta nuevamente.', 'error');
            }
        } catch (error) {
            showFormFeedback('Error de conexión. Verifica tu internet.', 'error');
            console.error('Error en envío:', error);
        } finally {
            setLoadingState(false);
        }
    }
    
    /**
     * Simula envío a servidor (reemplazar con fetch real)
     */
    function mockSubmitToServer(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Datos enviados al servidor:', {
                    ...data,
                    password: '[PROTECTED]',
                    confirmPassword: '[PROTECTED]'
                });
                resolve(true); // Cambiar a false para simular error
            }, 1500);
        });
    }
    
    /**
     * Muestra feedback del formulario
     */
    function showFormFeedback(message, type = 'info') {
        formFeedback.textContent = message;
        formFeedback.className = `form-feedback ${type}`;
        formFeedback.style.display = 'block';
        
        // Ocultar después de cierto tiempo para mensajes de info
        if (type === 'info' || type === 'success') {
            setTimeout(() => {
                formFeedback.style.opacity = '0';
                setTimeout(() => {
                    formFeedback.style.display = 'none';
                    formFeedback.style.opacity = '1';
                }, 300);
            }, 5000);
        }
    }
    
    /**
     * Establece el estado de carga del botón
     */
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-label', 'Enviando formulario...');
        } else {
            submitBtn.classList.remove('loading');
            validateForm(); // Re-valida para actualizar estado del botón
        }
    }
    
    /**
     * Resetea los estilos visuales del formulario
     */
    function resetFormVisuals() {
        inputCache.forEach((cache) => {
            const { element, formGroup } = cache;
            formGroup.classList.remove('error', 'valid');
            element.classList.remove('invalid', 'valid');
        });
        
        // Resetear indicador de fortaleza de contraseña
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('password-strength-text');
        if (strengthBar && strengthText) {
            strengthBar.className = 'strength-bar';
            strengthText.textContent = 'Seguridad de la contraseña';
            strengthText.style.color = '';
        }
    }
    
    /**
     * Enfoca el siguiente input
     */
    function focusNextInput(currentInput) {
        const inputsArray = Array.from(inputCache.keys());
        const currentIndex = inputsArray.indexOf(currentInput.id);
        
        if (currentIndex < inputsArray.length - 1) {
            const nextInput = inputCache.get(inputsArray[currentIndex + 1]).element;
            nextInput.focus();
        }
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
        validateForm,
        resetForm: resetFormVisuals
    };
})();

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
    FormValidator.init();
    
    // Agregar CSS para animaciones adicionales
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        .shake {
            animation: shake 0.5s ease;
        }
    `;
    document.head.appendChild(style);
});

/**
 * Hacer disponible globalmente si es necesario (opcional)
 */
window.FormValidator = FormValidator;
