document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    if (!form) {
        return;
    }

    const DEFAULT_API = 'http://localhost:3000/api';

    const resolveApiBase = () => {
        const dataAttr = document.body.dataset.apiBase;
        if (dataAttr) {
            return dataAttr;
        }
        const { hostname, origin } = window.location;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return DEFAULT_API;
        }
        if (origin && origin !== 'null' && origin !== 'file://') {
            return `${origin.replace(/\/$/, '')}/api`;
        }
        return DEFAULT_API;
    };

    const API_URL = resolveApiBase();
    const REGISTER_ENDPOINT = `${API_URL}/auth/register`;

    const submitButton = form.querySelector('.register-form__submit');
    const submitText = form.querySelector('.register-form__submit-text');
    const spinner = form.querySelector('.register-form__spinner');
    const feedback = document.getElementById('register-feedback');
    const steps = Array.from(document.querySelectorAll('.register-progress__step'));
    const progressBar = document.querySelector('.register-progress__bar-fill');
    const strengthBar = document.getElementById('password-strength-bar');
    const strengthText = document.getElementById('password-strength-text');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    const birthInput = document.getElementById('register-birth');
    const loginLink = document.getElementById('register-login-link');

    if (birthInput) {
        const today = new Date();
        birthInput.max = today.toISOString().split('T')[0];
    }

    if (loginLink) {
        loginLink.addEventListener('click', (event) => {
            event.preventDefault();
            const loginTrigger = document.getElementById('header-login-button');
            if (loginTrigger) {
                loginTrigger.dispatchEvent(new Event('click', { bubbles: true }));
            }
        });
    }

    const toggleButtons = Array.from(document.querySelectorAll('.register-form__toggle'));
    toggleButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            if (!input) {
                return;
            }
            const isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');
            button.classList.toggle('is-active', isPassword);
        });
    });

    const validators = {
        name: (value) => {
            if (!value.trim()) {
                return 'Ingresa tu nombre completo.';
            }
            if (value.trim().length < 3) {
                return 'El nombre debe tener al menos 3 caracteres.';
            }
            return '';
        },
        email: (value) => {
            if (!value.trim()) {
                return 'El correo electrónico es obligatorio.';
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value.trim())) {
                return 'Ingresa un correo electrónico válido.';
            }
            return '';
        },
        phone: (value) => {
            if (!value.trim()) {
                return '';
            }
            const digits = value.replace(/\D/g, '');
            if (digits.length < 10) {
                return 'Ingresa un teléfono de al menos 10 dígitos.';
            }
            return '';
        },
        birth_date: (value) => {
            if (!value) {
                return '';
            }
            const selected = new Date(value);
            const now = new Date();
            if (selected > now) {
                return 'Selecciona una fecha de nacimiento válida.';
            }
            const adultDate = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
            if (selected > adultDate) {
                return 'Debes ser mayor de 18 años para registrarte.';
            }
            return '';
        },
        password: (value) => {
            if (!value) {
                return 'Crea una contraseña para continuar.';
            }
            if (value.length < 8) {
                return 'La contraseña debe tener al menos 8 caracteres.';
            }
            const requirements = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];
            const metRequirements = requirements.filter((regex) => regex.test(value)).length;
            if (metRequirements < 3) {
                return 'Combina mayúsculas, minúsculas, números y símbolos.';
            }
            return '';
        },
        confirm_password: (value) => {
            if (!value) {
                return 'Confirma tu contraseña.';
            }
            if (value !== (passwordInput ? passwordInput.value : '')) {
                return 'Las contraseñas no coinciden.';
            }
            return '';
        },
        terms: (checked) => {
            if (!checked) {
                return 'Debes aceptar los términos y condiciones.';
            }
            return '';
        },
    };

    const fields = Array.from(form.querySelectorAll('input'));

    const getFieldName = (input) => input.getAttribute('name');

    const getGroup = (input) => input.closest('.register-form__group');

    const showError = (input, message) => {
        const group = getGroup(input);
        if (!group) {
            return;
        }
        const errorElement = group.querySelector('.register-form__error');
        if (errorElement) {
            errorElement.textContent = message;
        }
        group.classList.toggle('has-error', !!message);
        const value = input.type === 'checkbox' ? (input.checked ? 'checked' : '') : input.value;
        const shouldMarkValid = !message && value.trim() !== '';
        group.classList.toggle('is-valid', shouldMarkValid);
    };

    const validateInput = (input, options = { silent: false }) => {
        const name = getFieldName(input);
        if (!name || !(name in validators)) {
            return true;
        }
        const value = name === 'terms' ? input.checked : input.value;
        const message = validators[name](value);
        if (!options.silent) {
            showError(input, message);
        }
        return !message;
    };

    const updateStrengthMeter = (value) => {
        if (!strengthBar || !strengthText) {
            return;
        }
        const requirements = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];
        let score = 0;
        if (value.length >= 8) {
            score += 1;
        }
        requirements.forEach((regex) => {
            if (regex.test(value)) {
                score += 1;
            }
        });
        const clampedScore = Math.min(score, 4);
        const percentage = (clampedScore / 4) * 100;
        strengthBar.style.width = `${percentage}%`;
        let label = 'Débil';
        let color = '#f87171';
        if (clampedScore >= 3) {
            label = 'Segura';
            color = '#34d399';
        } else if (clampedScore === 2) {
            label = 'Media';
            color = '#fbbf24';
        }
        strengthBar.style.background = color;
        strengthText.textContent = value ? `Seguridad de contraseña: ${label}` : 'Usa mayúsculas, números y símbolos para una contraseña robusta.';
    };

    const stepThresholds = [40, 80, 100];

    const updateProgress = () => {
        const trackedFields = ['name', 'email', 'password', 'confirm_password', 'terms'];
        const completed = trackedFields.reduce((count, fieldName) => {
            const input = form.querySelector(`[name="${fieldName}"]`);
            if (!input) {
                return count;
            }
            return count + (validateInput(input, { silent: true }) ? 1 : 0);
        }, 0);
        const total = trackedFields.length;
        const percent = Math.round((completed / total) * 100);
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
        steps.forEach((step, index) => {
            const threshold = stepThresholds[index] ?? 100;
            const isComplete = percent >= threshold;
            step.classList.toggle('is-complete', isComplete);
        });
    };

    const updateSubmitState = () => {
        const requiredFields = ['name', 'email', 'password', 'confirm_password', 'terms'];
        const allValid = requiredFields.every((name) => {
            const input = form.querySelector(`[name="${name}"]`);
            return input ? validateInput(input, { silent: true }) : true;
        });
        if (submitButton) {
            submitButton.disabled = !allValid;
        }
    };

    fields.forEach((input) => {
        input.addEventListener('input', () => {
            if (input === passwordInput) {
                updateStrengthMeter(input.value);
                if (confirmPasswordInput && confirmPasswordInput.value) {
                    validateInput(confirmPasswordInput);
                }
            }
            validateInput(input, { silent: input.type === 'checkbox' });
            updateProgress();
            updateSubmitState();
        });
        input.addEventListener('blur', () => {
            validateInput(input);
            updateProgress();
            updateSubmitState();
        });
    });

    if (passwordInput) {
        updateStrengthMeter(passwordInput.value);
    }
    updateProgress();
    updateSubmitState();

    let previousSubmitDisabled = false;

    const setLoadingState = (isLoading) => {
        if (!submitButton) {
            return;
        }
        if (isLoading) {
            previousSubmitDisabled = submitButton.disabled;
            submitButton.disabled = true;
        } else {
            submitButton.disabled = previousSubmitDisabled;
            updateSubmitState();
        }
        submitButton.classList.toggle('is-loading', isLoading);
        if (submitText) {
            submitText.textContent = isLoading ? 'Creando cuenta…' : 'Crear cuenta';
        }
        if (spinner) {
            spinner.style.display = isLoading ? 'inline-block' : 'none';
        }
        form.classList.toggle('is-loading', isLoading);
    };

    const resetForm = () => {
        form.reset();
        fields.forEach((input) => {
            showError(input, '');
        });
        updateStrengthMeter('');
        updateProgress();
        updateSubmitState();
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedback.textContent = '';
        feedback.classList.remove('is-error', 'is-success');
        const requiredInputs = ['name', 'email', 'password', 'confirm_password', 'terms'];
        let isValid = true;
        requiredInputs.forEach((name) => {
            const input = form.querySelector(`[name="${name}"]`);
            if (input && !validateInput(input)) {
                isValid = false;
            }
        });
        const optionalInputs = ['phone', 'birth_date'];
        optionalInputs.forEach((name) => {
            const input = form.querySelector(`[name="${name}"]`);
            if (input) {
                validateInput(input);
            }
        });
        if (!isValid) {
            feedback.textContent = 'Revisa los campos marcados en rojo para continuar.';
            feedback.classList.remove('is-success');
            feedback.classList.add('is-error');
            return;
        }

        const payload = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value,
            phone: form.phone.value.trim() || null,
            birth_date: form.birth_date.value || null,
        };

        try {
            setLoadingState(true);
            const response = await fetch(REGISTER_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({ message: 'No se pudo interpretar la respuesta del servidor.' }));

            if (!response.ok) {
                const message = data?.message || 'No pudimos crear tu cuenta. Inténtalo nuevamente.';
                feedback.textContent = message;
                feedback.classList.remove('is-success');
                feedback.classList.add('is-error');
                return;
            }

            feedback.textContent = data?.message || '¡Tu cuenta ha sido creada exitosamente!';
            feedback.classList.remove('is-error');
            feedback.classList.add('is-success');
            resetForm();

            setTimeout(() => {
                const loginTrigger = document.getElementById('header-login-button');
                if (loginTrigger) {
                    loginTrigger.dispatchEvent(new Event('click', { bubbles: true }));
                }
            }, 1800);
        } catch (error) {
            console.error('Error al registrar:', error);
            feedback.textContent = 'Ocurrió un error inesperado. Verifica tu conexión e inténtalo nuevamente.';
            feedback.classList.remove('is-success');
            feedback.classList.add('is-error');
        } finally {
            setLoadingState(false);
        }
    });
});
