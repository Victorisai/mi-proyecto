(function () {
    const sanitizeText = (value) => (typeof value === 'string' ? value.trim() : '');
    const cleanDigitsForWhatsApp = (value) => sanitizeText(value).replace(/\D/g, '');

    const formatTelHref = (value) => {
        const raw = sanitizeText(value);
        if (!raw) {
            return '';
        }
        if (raw.startsWith('+')) {
            return `tel:${raw.replace(/\s+/g, '')}`;
        }
        const digits = raw.replace(/\D/g, '');
        return digits ? `tel:${digits}` : '';
    };

    const toWhatsAppUrl = (value) => {
        const digits = cleanDigitsForWhatsApp(value);
        return digits ? `https://wa.me/${digits}` : '';
    };

    const initPasswordToggles = (scope) => {
        const root = scope || document;
        const toggles = root.querySelectorAll('[data-password-toggle]');

        toggles.forEach((toggle) => {
            const targetId = toggle.getAttribute('data-password-target');
            const input = targetId ? document.getElementById(targetId) : null;

            if (!input) {
                return;
            }

            const showIcon = toggle.querySelector('[data-password-icon="show"]');
            const hideIcon = toggle.querySelector('[data-password-icon="hide"]');

            const updateState = () => {
                const isPassword = input.type === 'password';
                toggle.setAttribute('aria-label', isPassword ? 'Mostrar contraseña' : 'Ocultar contraseña');
                toggle.setAttribute('aria-pressed', isPassword ? 'false' : 'true');
                toggle.classList.toggle('is-active', !isPassword);

                if (showIcon && hideIcon) {
                    showIcon.classList.toggle('is-hidden', !isPassword);
                    hideIcon.classList.toggle('is-hidden', isPassword);
                }
            };

            toggle.addEventListener('click', () => {
                input.type = input.type === 'password' ? 'text' : 'password';
                updateState();
                input.focus();
            });

            updateState();
        });
    };

    const cloneSocials = (source) => {
        const clone = {};
        if (!source) {
            return clone;
        }
        Object.keys(source).forEach((key) => {
            clone[key] = source[key];
        });
        return clone;
    };

    const getPlaceholder = (element, fallback = '') => {
        if (!element) {
            return fallback;
        }
        return element.dataset.profilePlaceholder || fallback;
    };

    window.ProfileMyProfile = window.ProfileMyProfile || {
        init(panel) {
            if (!panel || panel.dataset.myProfileInitialized === 'true') {
                return;
            }

            panel.dataset.myProfileInitialized = 'true';

            const tabButtons = Array.from(panel.querySelectorAll('[data-profile-tab]'));
            const tabPanels = Array.from(panel.querySelectorAll('[data-profile-panel]'));
            const securityForm = panel.querySelector('.profile-security');

            initPasswordToggles(panel);

            const setupSecurityStrengthMeter = () => {
                if (!securityForm) {
                    return;
                }

                const newPasswordInput = securityForm.querySelector('[data-profile-security="newPassword"]');
                const strengthMeter = securityForm.querySelector('[data-profile-security="strengthMeter"]');
                const strengthBar = securityForm.querySelector('[data-profile-security="strengthBar"]');
                const strengthText = securityForm.querySelector('[data-profile-security="strengthText"]');

                if (!newPasswordInput || !strengthMeter || !strengthBar || !strengthText) {
                    return;
                }

                const requirementChecks = {
                    length: (value) => value.length >= 8,
                    numbers: (value) => /\d/.test(value),
                    uppercase: (value) => /[A-Z]/.test(value) && /[a-z]/.test(value),
                    symbols: (value) => /[^A-Za-z0-9]/.test(value),
                };

                const tips = new Map();
                securityForm.querySelectorAll('[data-profile-security-tip]').forEach((item) => {
                    const key = item.dataset.profileSecurityTip;
                    if (key) {
                        tips.set(key, item);
                    }
                });

                const getStrengthDescriptor = (score, value) => {
                    if (!value) {
                        return { label: '', color: '#f87171', percentage: 0 };
                    }

                    const total = Object.keys(requirementChecks).length;
                    const percentage = Math.round((score / total) * 100);
                    if (score >= total) {
                        return { label: 'Muy segura', color: '#15803d', percentage };
                    }
                    if (score === total - 1) {
                        return { label: 'Segura', color: '#34d399', percentage };
                    }
                    if (score === total - 2) {
                        return { label: 'Media', color: '#fbbf24', percentage };
                    }
                    if (score === 1) {
                        return { label: 'Débil', color: '#f97316', percentage };
                    }
                    return { label: 'Muy débil', color: '#f87171', percentage };
                };

                const updateStrength = (rawValue) => {
                    const value = typeof rawValue === 'string' ? rawValue.trim() : '';
                    let score = 0;

                    Object.entries(requirementChecks).forEach(([key, check]) => {
                        const passed = check(value);
                        if (passed) {
                            score += 1;
                        }
                        const tipItem = tips.get(key);
                        if (tipItem) {
                            tipItem.classList.toggle('is-met', passed);
                        }
                    });

                    const { label, color, percentage } = getStrengthDescriptor(score, value);
                    const width = value ? `${percentage}%` : '0%';
                    strengthBar.style.width = width;
                    strengthBar.style.background = color;
                    strengthMeter.setAttribute('aria-valuenow', String(value ? percentage : 0));
                    strengthMeter.setAttribute('aria-valuetext', value ? `Seguridad ${label}` : 'Sin contraseña evaluada');

                    if (value) {
                        strengthText.textContent = `Seguridad de la contraseña: ${label}`;
                    } else {
                        strengthText.textContent = 'Usa al menos 8 caracteres, combinando mayúsculas, números y símbolos.';
                    }
                };

                newPasswordInput.addEventListener('input', (event) => {
                    updateStrength(event.target.value);
                });

                updateStrength(newPasswordInput.value);
            };

            setupSecurityStrengthMeter();

            const setupPasswordConfirmationValidation = () => {
                if (!securityForm) {
                    return;
                }

                const newPasswordInput = securityForm.querySelector('[data-profile-security="newPassword"]');
                const confirmPasswordInput = securityForm.querySelector('#profileConfirmPassword');

                if (!newPasswordInput || !confirmPasswordInput) {
                    return;
                }

                const clearValidationState = () => {
                    [newPasswordInput, confirmPasswordInput].forEach((input) => {
                        input.classList.remove('is-valid', 'is-invalid');
                    });
                };

                const applyValidationState = (isMatch) => {
                    clearValidationState();

                    if (isMatch === null) {
                        return;
                    }

                    const className = isMatch ? 'is-valid' : 'is-invalid';
                    [newPasswordInput, confirmPasswordInput].forEach((input) => {
                        input.classList.add(className);
                    });
                };

                const updateValidationState = () => {
                    const newValue = typeof newPasswordInput.value === 'string' ? newPasswordInput.value.trim() : '';
                    const confirmValue = typeof confirmPasswordInput.value === 'string' ? confirmPasswordInput.value.trim() : '';

                    if (!newValue && !confirmValue) {
                        applyValidationState(null);
                        return;
                    }

                    if (!confirmValue) {
                        applyValidationState(null);
                        return;
                    }

                    const isMatch = Boolean(newValue) && newValue === confirmValue;
                    applyValidationState(isMatch);
                };

                newPasswordInput.addEventListener('input', updateValidationState);
                confirmPasswordInput.addEventListener('input', updateValidationState);
                confirmPasswordInput.addEventListener('blur', updateValidationState);
                newPasswordInput.addEventListener('blur', updateValidationState);

                updateValidationState();
            };

            setupPasswordConfirmationValidation();

            const activateTab = (target) => {
                tabButtons.forEach((button) => {
                    const isActive = button.dataset.profileTab === target;
                    button.classList.toggle('is-active', isActive);
                    button.setAttribute('aria-selected', String(isActive));
                    button.setAttribute('tabindex', isActive ? '0' : '-1');
                });

                tabPanels.forEach((tabPanel) => {
                    const isMatch = tabPanel.dataset.profilePanel === target;
                    tabPanel.classList.toggle('is-hidden', !isMatch);
                    tabPanel.setAttribute('aria-hidden', String(!isMatch));
                    if (!isMatch) {
                        tabPanel.setAttribute('hidden', 'hidden');
                    } else {
                        tabPanel.removeAttribute('hidden');
                    }
                });
            };

            tabButtons.forEach((button) => {
                button.addEventListener('click', () => activateTab(button.dataset.profileTab));
            });

            const summaryRefs = {
                avatar: panel.querySelector('[data-profile-summary="avatar"]'),
                name: panel.querySelector('[data-profile-summary="name"]'),
                bio: panel.querySelector('[data-profile-summary="bio"]'),
                emailGroup: panel.querySelector('[data-profile-summary-group="email"]'),
                emailLink: panel.querySelector('[data-profile-summary="email"]'),
                phoneLink: panel.querySelector('[data-profile-summary="phone"]'),
                whatsappButton: panel.querySelector('[data-profile-summary="whatsapp"]'),
            };

            const overviewRefs = {
                bio: panel.querySelector('[data-profile-overview="bio"]'),
            };

            const form = panel.querySelector('.profile-form');
            if (!form) {
                activateTab('overview');
                return;
            }

            const formFields = {
                displayName: form.querySelector('[data-profile-input="displayName"]'),
                bio: form.querySelector('[data-profile-input="bio"]'),
                email: form.querySelector('[data-profile-input="email"]'),
                phone: form.querySelector('[data-profile-input="phone"]'),
                useWhatsapp: form.querySelector('[data-profile-input="useWhatsapp"]'),
                avatarInput: form.querySelector('[data-profile-input="avatar"]'),
            };

            const avatarPreview = form.querySelector('[data-profile-avatar-preview]');
            const avatarPlaceholder = avatarPreview ? (avatarPreview.dataset.profileAvatarPlaceholder || '') : '';
            const summaryAvatarPlaceholder = summaryRefs.avatar ? (summaryRefs.avatar.dataset.profileAvatarPlaceholder || '') : '';

            const socialInputs = new Map();
            form.querySelectorAll('[data-profile-input^="social-"]').forEach((input) => {
                const key = input.dataset.profileInput.replace('social-', '');
                socialInputs.set(key, input);
            });

            const socialLinks = new Map();
            panel.querySelectorAll('[data-profile-social]').forEach((link) => {
                socialLinks.set(link.dataset.profileSocial, link);
            });

            const socialItems = new Map();
            panel.querySelectorAll('[data-profile-social-item]').forEach((item) => {
                socialItems.set(item.dataset.profileSocialItem, item);
            });

            const defaults = {
                displayName: summaryRefs.name ? sanitizeText(summaryRefs.name.textContent) : '',
                bio: summaryRefs.bio ? sanitizeText(summaryRefs.bio.textContent) : '',
                overviewBio: overviewRefs.bio ? sanitizeText(overviewRefs.bio.textContent) : '',
                email: summaryRefs.emailLink ? sanitizeText(summaryRefs.emailLink.textContent) : '',
                phone: summaryRefs.phoneLink ? sanitizeText(summaryRefs.phoneLink.textContent) : '',
                useWhatsapp: formFields.useWhatsapp ? formFields.useWhatsapp.checked : false,
                avatar: summaryRefs.avatar ? summaryRefs.avatar.getAttribute('src') || '' : '',
                socials: {},
            };

            socialLinks.forEach((link, key) => {
                defaults.socials[key] = link.getAttribute('href') || '';
            });

            let state = {
                displayName: defaults.displayName,
                bio: defaults.bio,
                overviewBio: defaults.overviewBio,
                email: defaults.email,
                phone: defaults.phone,
                useWhatsapp: defaults.useWhatsapp,
                avatar: defaults.avatar,
                socials: cloneSocials(defaults.socials),
            };

            let pendingAvatar = null;
            let statusTimeout = null;

            const statusRegion = form.querySelector('[data-profile-form-status]');

            const updateStatus = (message, variant = 'success') => {
                if (!statusRegion) {
                    return;
                }

                if (statusTimeout) {
                    window.clearTimeout(statusTimeout);
                    statusTimeout = null;
                }

                if (!message) {
                    statusRegion.textContent = '';
                    statusRegion.classList.remove('is-visible');
                    statusRegion.removeAttribute('data-status');
                    return;
                }

                statusRegion.textContent = message;
                statusRegion.dataset.status = variant;
                statusRegion.classList.add('is-visible');

                statusTimeout = window.setTimeout(() => {
                    statusRegion.textContent = '';
                    statusRegion.classList.remove('is-visible');
                    statusRegion.removeAttribute('data-status');
                }, 5000);
            };

            const getAvatarSource = (preferred) => {
                if (typeof preferred === 'string') {
                    const trimmed = preferred.trim();
                    if (trimmed) {
                        return trimmed;
                    }
                    if (preferred === '') {
                        if (avatarPlaceholder) {
                            return avatarPlaceholder;
                        }
                        if (summaryAvatarPlaceholder) {
                            return summaryAvatarPlaceholder;
                        }
                    }
                }
                if (state.avatar) {
                    return state.avatar;
                }
                if (defaults.avatar) {
                    return defaults.avatar;
                }
                if (avatarPlaceholder) {
                    return avatarPlaceholder;
                }
                return summaryAvatarPlaceholder;
            };

            const refreshAvatarPreview = (preferred) => {
                if (!avatarPreview) {
                    return;
                }
                const source = getAvatarSource(preferred);
                avatarPreview.src = source;
            };

            const applyStateToSummary = () => {
                const avatarSource = getAvatarSource();
                if (summaryRefs.avatar && avatarSource) {
                    summaryRefs.avatar.src = avatarSource;
                }

                if (summaryRefs.name) {
                    summaryRefs.name.textContent = state.displayName || defaults.displayName;
                }

                const bioValue = state.bio || defaults.bio || getPlaceholder(summaryRefs.bio);
                if (summaryRefs.bio) {
                    summaryRefs.bio.textContent = bioValue;
                }

                if (overviewRefs.bio) {
                    const overviewValue = state.bio || defaults.overviewBio || getPlaceholder(overviewRefs.bio, bioValue);
                    overviewRefs.bio.textContent = overviewValue;
                }

                if (summaryRefs.emailLink) {
                    const emailValue = sanitizeText(state.email);
                    if (emailValue) {
                        summaryRefs.emailLink.textContent = emailValue;
                        summaryRefs.emailLink.href = `mailto:${emailValue}`;
                        summaryRefs.emailLink.removeAttribute('aria-disabled');
                        if (summaryRefs.emailGroup) {
                            summaryRefs.emailGroup.hidden = false;
                        }
                    } else {
                        summaryRefs.emailLink.textContent = getPlaceholder(summaryRefs.emailLink, 'Agrega un correo electrónico');
                        summaryRefs.emailLink.removeAttribute('href');
                        summaryRefs.emailLink.setAttribute('aria-disabled', 'true');
                        if (summaryRefs.emailGroup) {
                            summaryRefs.emailGroup.hidden = true;
                        }
                    }
                }

                if (summaryRefs.phoneLink) {
                    const phoneValue = sanitizeText(state.phone);
                    if (phoneValue) {
                        summaryRefs.phoneLink.textContent = phoneValue;
                        const telHref = formatTelHref(phoneValue);
                        if (telHref) {
                            summaryRefs.phoneLink.href = telHref;
                        }
                        summaryRefs.phoneLink.removeAttribute('aria-disabled');
                    } else {
                        summaryRefs.phoneLink.textContent = getPlaceholder(summaryRefs.phoneLink, 'Agrega un número de contacto');
                        summaryRefs.phoneLink.removeAttribute('href');
                        summaryRefs.phoneLink.setAttribute('aria-disabled', 'true');
                    }
                }

                if (summaryRefs.whatsappButton) {
                    const phoneValue = sanitizeText(state.phone);
                    const isEnabled = Boolean(state.useWhatsapp && phoneValue && toWhatsAppUrl(phoneValue));
                    summaryRefs.whatsappButton.disabled = !isEnabled;
                    summaryRefs.whatsappButton.setAttribute('aria-disabled', String(!isEnabled));
                    summaryRefs.whatsappButton.dataset.whatsappUrl = isEnabled ? toWhatsAppUrl(phoneValue) : '';
                }

                socialLinks.forEach((link, key) => {
                    const value = sanitizeText(state.socials[key]);
                    const listItem = socialItems.get(key);
                    if (value) {
                        link.href = value;
                        link.removeAttribute('aria-disabled');
                        if (listItem) {
                            listItem.hidden = false;
                        }
                    } else {
                        link.href = '#';
                        link.setAttribute('aria-disabled', 'true');
                        if (listItem) {
                            listItem.hidden = true;
                        }
                    }
                });
            };

            const applyStateToForm = () => {
                if (formFields.displayName) {
                    formFields.displayName.value = state.displayName || '';
                }
                if (formFields.bio) {
                    formFields.bio.value = state.bio || '';
                }
                if (formFields.email) {
                    formFields.email.value = state.email || '';
                }
                if (formFields.phone) {
                    formFields.phone.value = state.phone || '';
                }
                if (formFields.useWhatsapp) {
                    formFields.useWhatsapp.checked = Boolean(state.useWhatsapp && (state.phone || formFields.phone?.value));
                }
                socialInputs.forEach((input, key) => {
                    input.value = state.socials[key] || '';
                });
                refreshAvatarPreview();
            };

            const handleWhatsAppClick = (event) => {
                if (!summaryRefs.whatsappButton || summaryRefs.whatsappButton.disabled) {
                    event.preventDefault();
                    return;
                }

                const url = summaryRefs.whatsappButton.dataset.whatsappUrl;
                if (!url) {
                    event.preventDefault();
                    return;
                }
                window.open(url, '_blank', 'noopener');
            };

            if (summaryRefs.whatsappButton) {
                summaryRefs.whatsappButton.addEventListener('click', handleWhatsAppClick);
            }

            const openEditButtons = panel.querySelectorAll('[data-profile-action="openEdit"]');
            openEditButtons.forEach((button) => {
                button.addEventListener('click', () => {
                    activateTab('edit');
                    if (formFields.displayName) {
                        formFields.displayName.focus();
                    }
                });
            });

            const openAvatarButtons = panel.querySelectorAll('[data-profile-action="openAvatar"]');
            openAvatarButtons.forEach((button) => {
                button.addEventListener('click', () => {
                    activateTab('edit');
                    formFields.avatarInput?.click();
                });
            });

            const uploadAvatarButton = form.querySelector('[data-profile-action="uploadAvatar"]');
            if (uploadAvatarButton && formFields.avatarInput) {
                uploadAvatarButton.addEventListener('click', () => {
                    formFields.avatarInput.click();
                });
            }

            const clearAvatarButton = form.querySelector('[data-profile-action="clearAvatar"]');
            if (clearAvatarButton) {
                clearAvatarButton.addEventListener('click', () => {
                    pendingAvatar = '';
                    if (formFields.avatarInput) {
                        formFields.avatarInput.value = '';
                    }
                    refreshAvatarPreview('');
                    updateStatus('La foto de perfil se ha restablecido. No olvides guardar los cambios.', 'info');
                });
            }

            if (formFields.avatarInput) {
                formFields.avatarInput.addEventListener('change', () => {
                    const [file] = formFields.avatarInput.files || [];
                    if (!file) {
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                        pendingAvatar = reader.result;
                        refreshAvatarPreview(pendingAvatar);
                        updateStatus('Vista previa actualizada. Guarda los cambios para aplicarla en tu perfil.', 'info');
                    };
                    reader.readAsDataURL(file);
                });
            }

            form.addEventListener('submit', (event) => {
                event.preventDefault();

                const displayNameValue = sanitizeText(formFields.displayName ? formFields.displayName.value : '');
                state.displayName = displayNameValue || defaults.displayName;

                state.bio = sanitizeText(formFields.bio ? formFields.bio.value : '');
                state.email = sanitizeText(formFields.email ? formFields.email.value : '');
                state.phone = sanitizeText(formFields.phone ? formFields.phone.value : '');
                state.useWhatsapp = Boolean(formFields.useWhatsapp ? formFields.useWhatsapp.checked : false);
                if (!state.phone) {
                    state.useWhatsapp = false;
                }

                const updatedSocials = {};
                socialInputs.forEach((input, key) => {
                    updatedSocials[key] = sanitizeText(input.value);
                });
                state.socials = updatedSocials;

                if (pendingAvatar !== null) {
                    state.avatar = sanitizeText(pendingAvatar);
                    pendingAvatar = null;
                }

                applyStateToSummary();
                applyStateToForm();
                updateStatus('Tus cambios se han guardado correctamente.');
                activateTab('overview');
            });

            form.addEventListener('reset', (event) => {
                event.preventDefault();
                pendingAvatar = null;
                applyStateToForm();
                refreshAvatarPreview();
                updateStatus('Se descartaron los cambios no guardados.', 'info');
            });

            applyStateToSummary();
            applyStateToForm();
            refreshAvatarPreview();
            activateTab('overview');
        },
    };
})();
