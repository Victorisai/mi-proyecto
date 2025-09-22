(function () {
    const API_ENDPOINT = '/api/auth/register';

    const state = {
        isSubmitting: false,
    };

    const selectors = {
        form: document.getElementById('register-form'),
        message: document.getElementById('register-form-message'),
        submitButton: document.getElementById('register-submit'),
        submitText: document.querySelector('.register-form__submit-text'),
        spinner: document.querySelector('.register-form__spinner'),
        progressSteps: Array.from(document.querySelectorAll('.register-form__progress-step')),
        passwordInput: document.getElementById('register-password'),
        confirmInput: document.getElementById('register-password-confirm'),
        phoneInput: document.getElementById('register-phone'),
        birthdateInput: document.getElementById('register-birthdate'),
        passwordStrength: document.getElementById('password-strength'),
        toggles: Array.from(document.querySelectorAll('.register-form__toggle')),
        loginLink: document.getElementById('register-login-link'),
    };

    if (!selectors.form) {
        return;
    }

    if (selectors.birthdateInput) {
        const today = new Date().toISOString().split('T')[0];
        selectors.birthdateInput.setAttribute('max', today);
    }

    if (selectors.phoneInput) {
        selectors.phoneInput.addEventListener('input', (event) => {
            const digits = event.target.value.replace(/\D/g, '').slice(0, 10);
            event.target.value = digits;
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    const feedbackElements = Array.from(document.querySelectorAll('.register-form__feedback'));

    const setMessage = (message, type = 'info') => {
        if (!selectors.message) return;
        selectors.message.textContent = message;
        selectors.message.className = `register-form__message register-form__message--${type}`;
    };

    const clearFeedback = () => {
        feedbackElements.forEach((element) => {
            element.textContent = '';
            element.classList.remove('is-visible');
        });
        if (selectors.message) {
            selectors.message.textContent = '';
            selectors.message.className = 'register-form__message';
        }
    };

    const setFieldFeedback = (id, message) => {
        const feedback = feedbackElements.find((element) => element.dataset.feedbackFor === id);
        const input = document.getElementById(id);
        if (feedback) {
            feedback.textContent = message;
            feedback.classList.toggle('is-visible', Boolean(message));
        }
        if (input) {
            input.classList.toggle('has-error', Boolean(message));
        }
    };

    const setSubmitting = (submitting) => {
        state.isSubmitting = submitting;
        if (!selectors.submitButton) return;
        selectors.submitButton.disabled = submitting;
        if (selectors.spinner) {
            selectors.spinner.classList.toggle('is-visible', submitting);
        }
        if (selectors.submitText) {
            selectors.submitText.textContent = submitting ? 'Creando cuenta...' : 'Crear cuenta';
        }
    };

    const updateProgress = (stepIndex) => {
        selectors.progressSteps.forEach((step, index) => {
            step.classList.toggle('is-active', index === stepIndex);
            step.classList.toggle('is-completed', index < stepIndex);
        });
    };

    const evaluatePassword = (password) => {
        const rules = {
            length: password.length >= 8,
            number: /\d/.test(password),
            uppercase: /[A-ZÁÉÍÓÚÜÑ]/.test(password),
        };

        Object.entries(rules).forEach(([rule, isValid]) => {
            const ruleElement = document.querySelector(`[data-rule="${rule}"]`);
            if (ruleElement) {
                ruleElement.classList.toggle('is-valid', isValid);
            }
        });

        let strengthLabel = 'Débil';
        const score = Object.values(rules).filter(Boolean).length;
        if (score === 3) {
            strengthLabel = 'Fuerte';
        } else if (score === 2) {
            strengthLabel = 'Intermedia';
        }

        if (selectors.passwordStrength) {
            selectors.passwordStrength.innerHTML = `Seguridad de la contraseña: <strong>${strengthLabel}</strong>`;
            selectors.passwordStrength.dataset.strength = strengthLabel.toLowerCase();
        }
    };

    updateProgress(0);
    evaluatePassword(selectors.passwordInput ? selectors.passwordInput.value : '');

    const togglePasswordVisibility = (inputId, trigger) => {
        const input = document.getElementById(inputId);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        trigger.classList.toggle('is-active', isPassword);
    };

    const focusFirstError = () => {
        const errorInput = selectors.form.querySelector('.has-error');
        if (errorInput) {
            errorInput.focus();
        }
    };

    const validateForm = () => {
        clearFeedback();
        let isValid = true;

        const formData = new FormData(selectors.form);
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const phone = formData.get('phone').trim();
        const birthDate = formData.get('birth_date');
        const password = formData.get('password');
        const passwordConfirm = formData.get('passwordConfirm');
        const terms = selectors.form.querySelector('#register-terms');

        if (!name) {
            setFieldFeedback('register-name', 'Por favor ingresa tu nombre completo.');
            isValid = false;
        } else if (name.split(' ').length < 2) {
            setFieldFeedback('register-name', 'Incluye al menos nombre y apellido.');
            isValid = false;
        }

        if (!email) {
            setFieldFeedback('register-email', 'Necesitamos tu correo electrónico.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            setFieldFeedback('register-email', 'Revisa que el formato del correo sea válido.');
            isValid = false;
        }

        if (phone && !phoneRegex.test(phone)) {
            setFieldFeedback('register-phone', 'El teléfono debe contener 10 dígitos.');
            isValid = false;
        }

        if (birthDate) {
            const today = new Date();
            const selectedDate = new Date(birthDate);
            if (selectedDate > today) {
                setFieldFeedback('register-birthdate', 'La fecha no puede ser futura.');
                isValid = false;
            }
        }

        if (!password) {
            setFieldFeedback('register-password', 'Crea una contraseña segura.');
            isValid = false;
        } else {
            const rules = [password.length >= 8, /\d/.test(password), /[A-ZÁÉÍÓÚÜÑ]/.test(password)];
            if (rules.includes(false)) {
                setFieldFeedback('register-password', 'Sigue las recomendaciones para una contraseña robusta.');
                isValid = false;
            }
        }

        if (!passwordConfirm) {
            setFieldFeedback('register-password-confirm', 'Confirma tu contraseña.');
            isValid = false;
        } else if (passwordConfirm !== password) {
            setFieldFeedback('register-password-confirm', 'Las contraseñas no coinciden.');
            isValid = false;
        }

        if (!terms.checked) {
            setFieldFeedback('register-terms', 'Debes aceptar los términos para continuar.');
            isValid = false;
        }

        if (!isValid) {
            focusFirstError();
        }

        return {
            isValid,
            payload: {
                name,
                email,
                password,
                phone: phone || null,
                birth_date: birthDate || null,
            },
        };
    };

    selectors.toggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const inputId = toggle.dataset.toggle;
            togglePasswordVisibility(inputId, toggle);
        });
    });

    if (selectors.passwordInput) {
        selectors.passwordInput.addEventListener('input', (event) => {
            evaluatePassword(event.target.value);
            updateProgress(event.target.value.length > 0 ? 1 : 0);
        });
    }

    if (selectors.confirmInput) {
        selectors.confirmInput.addEventListener('input', (event) => {
            const isMatch = selectors.passwordInput && event.target.value === selectors.passwordInput.value;
            const feedback = feedbackElements.find((element) => element.dataset.feedbackFor === 'register-password-confirm');
            if (feedback) {
                feedback.textContent = isMatch ? '' : 'Las contraseñas deben coincidir.';
                feedback.classList.toggle('is-visible', !isMatch);
            }
            event.target.classList.toggle('has-error', !isMatch && event.target.value.length > 0);
            if (isMatch) {
                updateProgress(2);
            }
        });
    }

    selectors.form.addEventListener('input', (event) => {
        if (event.target.matches('input')) {
            const feedback = feedbackElements.find((element) => element.dataset.feedbackFor === event.target.id);
            if (feedback && feedback.textContent) {
                feedback.textContent = '';
                feedback.classList.remove('is-visible');
                event.target.classList.remove('has-error');
            }
        }
    });

    if (selectors.loginLink) {
        selectors.loginLink.addEventListener('click', (event) => {
            event.preventDefault();
            const loginTrigger = document.getElementById('header-login-button');
            if (loginTrigger) {
                loginTrigger.click();
            }
        });
    }

    selectors.form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (state.isSubmitting) {
            return;
        }

        const { isValid, payload } = validateForm();
        if (!isValid) {
            return;
        }

        setSubmitting(true);
        setMessage('Estamos creando tu cuenta...', 'info');

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result?.message || 'No pudimos completar tu registro. Inténtalo más tarde.';
                setMessage(errorMessage, 'error');
                updateProgress(1);
                return;
            }

            selectors.form.reset();
            evaluatePassword('');
            updateProgress(selectors.progressSteps.length - 1);
            setMessage('¡Cuenta creada con éxito! Revisa tu correo para confirmar tu registro.', 'success');
            selectors.form.classList.add('is-success');
        } catch (error) {
            console.error('Error registrando usuario', error);
            setMessage('Tuvimos un inconveniente. Por favor, verifica tu conexión e inténtalo de nuevo.', 'error');
            updateProgress(1);
        } finally {
            setSubmitting(false);
        }
    });
})();
