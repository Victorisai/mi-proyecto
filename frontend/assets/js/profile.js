document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.sidebar__menu-link[data-section]');
    const panels = document.querySelectorAll('.profile__panel');

    const initializePropertiesPanel = (panel) => {
        const wizard = panel.querySelector('.property-wizard');
        if (!wizard) {
            return;
        }

        const openButtons = panel.querySelectorAll('.js-open-listing-wizard');
        const dialog = wizard.querySelector('.property-wizard__dialog');
        const closeTriggers = wizard.querySelectorAll('[data-close-dialog]');
        const form = wizard.querySelector('.property-wizard__form');
        const steps = Array.from(form.querySelectorAll('.property-wizard__step'));
        const stepIndicators = Array.from(wizard.querySelectorAll('.property-wizard__step-indicator'));
        const previousButton = wizard.querySelector('.property-wizard__prev');
        const nextButton = wizard.querySelector('.property-wizard__next');
        const submitButton = wizard.querySelector('.property-wizard__submit');
        const successState = wizard.querySelector('.property-wizard__success');
        const feedback = wizard.querySelector('.property-wizard__feedback');
        const photosInput = form.querySelector('#propertyPhotos');
        const photosHint = form.querySelector('[data-photos-hint]');
        let currentStep = 0;

        const getPhotosValidationMessage = (count) => {
            if (count === 0) {
                return 'Selecciona al menos 5 fotografías para continuar.';
            }
            if (count < 5) {
                const missing = 5 - count;
                return `Añade ${missing} fotografía${missing === 1 ? '' : 's'} más.`;
            }
            if (count > 50) {
                return 'El máximo permitido es de 50 fotografías.';
            }
            return '';
        };

        const updatePhotosHint = () => {
            if (!photosInput || !photosHint) {
                return;
            }
            const count = photosInput.files.length;
            if (count === 0) {
                photosHint.textContent = 'Selecciona imágenes en alta resolución. Puedes arrastrar y soltar varias a la vez.';
                return;
            }
            photosHint.textContent = `${count} fotografía${count === 1 ? '' : 's'} seleccionada${count === 1 ? '' : 's'}.`;
        };

        const showFeedback = (message = '') => {
            if (!feedback) {
                return;
            }
            if (message) {
                feedback.textContent = message;
                feedback.classList.add('property-wizard__feedback--visible');
            } else {
                feedback.textContent = '';
                feedback.classList.remove('property-wizard__feedback--visible');
            }
        };

        const updateStepIndicators = (index) => {
            stepIndicators.forEach((indicator, stepIndex) => {
                indicator.classList.toggle('property-wizard__step-indicator--active', stepIndex === index);
                indicator.classList.toggle('property-wizard__step-indicator--completed', stepIndex < index);
            });
        };

        const showStep = (index) => {
            steps.forEach((step, stepIndex) => {
                if (stepIndex === index) {
                    step.hidden = false;
                } else {
                    step.hidden = true;
                }
            });

            updateStepIndicators(index);

            previousButton.style.visibility = index === 0 ? 'hidden' : 'visible';
            nextButton.style.display = index === steps.length - 1 ? 'none' : 'inline-flex';
            submitButton.style.display = index === steps.length - 1 ? 'inline-flex' : 'none';
        };

        const validateStep = (index) => {
            const stepElement = steps[index];
            if (!stepElement) {
                return true;
            }

            const controls = Array.from(stepElement.querySelectorAll('input, textarea, select'));

            if (index === 0) {
                const selectedOperation = form.querySelector('input[name="operation"]:checked');
                if (!selectedOperation) {
                    showFeedback('Selecciona si publicarás una propiedad en venta o renta.');
                    return false;
                }
            }

            if (index === 1) {
                const selectedType = form.querySelector('input[name="propertyType"]:checked');
                if (!selectedType) {
                    showFeedback('Elige el tipo de propiedad para continuar.');
                    return false;
                }
            }

            for (const control of controls) {
                if (control.type === 'file') {
                    const message = getPhotosValidationMessage(control.files.length);
                    control.setCustomValidity(message);
                    if (!control.checkValidity()) {
                        showFeedback(message);
                        return false;
                    }
                    continue;
                }

                control.setCustomValidity('');
                if (!control.checkValidity()) {
                    control.reportValidity();
                    return false;
                }
            }

            showFeedback('');
            return true;
        };

        const resetWizard = () => {
            form.reset();
            form.hidden = false;
            successState.hidden = true;
            currentStep = 0;
            updatePhotosHint();
            showFeedback('');
            showStep(currentStep);
        };

        const openWizard = () => {
            resetWizard();
            wizard.classList.remove('property-wizard--hidden');
            wizard.setAttribute('aria-hidden', 'false');
            dialog.focus();
        };

        const closeWizard = () => {
            wizard.classList.add('property-wizard--hidden');
            wizard.setAttribute('aria-hidden', 'true');
            resetWizard();
        };

        if (photosInput) {
            photosInput.addEventListener('change', () => {
                const message = getPhotosValidationMessage(photosInput.files.length);
                photosInput.setCustomValidity(message);
                updatePhotosHint();
            });
        }

        openButtons.forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                openWizard();
            });
        });

        closeTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                closeWizard();
            });
        });

        wizard.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeWizard();
            }
        });

        previousButton.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep -= 1;
                showStep(currentStep);
            }
        });

        nextButton.addEventListener('click', () => {
            if (!validateStep(currentStep)) {
                return;
            }

            if (currentStep < steps.length - 1) {
                currentStep += 1;
                showStep(currentStep);
            }
        });

        form.addEventListener('submit', event => {
            event.preventDefault();

            if (!validateStep(currentStep)) {
                return;
            }

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            successState.hidden = false;
            form.hidden = true;
            showFeedback('');
            stepIndicators.forEach(indicator => indicator.classList.add('property-wizard__step-indicator--completed'));
        });
    };

    const loadPanelContent = (panel) => {
        const source = panel.dataset.src;
        if (!source) {
            return;
        }

        fetch(source)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`No se pudo cargar el contenido de ${source}`);
                }
                return response.text();
            })
            .then(html => {
                panel.innerHTML = html;
                if (panel.dataset.section === 'propiedades') {
                    initializePropertiesPanel(panel);
                }
            })
            .catch(error => {
                console.error(error);
                panel.innerHTML = '<p class="panel__error">No se pudo cargar el contenido. Intenta recargar la página.</p>';
            });
    };

    panels.forEach(loadPanelContent);

    menuLinks.forEach(link => {
        link.addEventListener('click', event => {
            const targetSection = link.dataset.section;
            if (!targetSection) {
                return;
            }

            event.preventDefault();

            menuLinks.forEach(menuLink => menuLink.classList.remove('sidebar__menu-link--active'));
            link.classList.add('sidebar__menu-link--active');

            panels.forEach(panel => {
                const isActive = panel.dataset.section === targetSection;
                panel.classList.toggle('profile__panel--active', isActive);
            });
        });
    });
});
