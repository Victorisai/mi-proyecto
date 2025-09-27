(function (window, document) {
    'use strict';

    const HIDDEN_CLASS = 'property-wizard--hidden';

    const getOpenButtons = (wizard, openButtonsOption) => {
        if (openButtonsOption) {
            return Array.from(openButtonsOption);
        }

        if (wizard.id) {
            return Array.from(document.querySelectorAll(`[data-open-wizard="${wizard.id}"]`));
        }

        return [];
    };

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

    const init = (wizard, options = {}) => {
        if (!wizard || wizard.dataset.propertyWizardInitialized === 'true') {
            return;
        }

        const dialog = wizard.querySelector('.property-wizard__dialog');
        const form = wizard.querySelector('.property-wizard__form');
        const successState = wizard.querySelector('.property-wizard__success');

        if (!dialog || !form || !successState) {
            return;
        }

        const openButtons = getOpenButtons(wizard, options.openButtons);
        const closeTriggers = wizard.querySelectorAll('[data-close-dialog]');
        const steps = Array.from(form.querySelectorAll('.property-wizard__step'));
        const stepIndicators = Array.from(wizard.querySelectorAll('.property-wizard__step-indicator'));
        const previousButton = wizard.querySelector('.property-wizard__prev');
        const nextButton = wizard.querySelector('.property-wizard__next');
        const submitButton = wizard.querySelector('.property-wizard__submit');
        const feedback = wizard.querySelector('.property-wizard__feedback');
        const photosInput = form.querySelector('#propertyPhotos');
        const photosHint = form.querySelector('[data-photos-hint]');
        let currentStep = 0;

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

        const updateStepIndicators = (index) => {
            stepIndicators.forEach((indicator, stepIndex) => {
                indicator.classList.toggle('property-wizard__step-indicator--active', stepIndex === index);
                indicator.classList.toggle('property-wizard__step-indicator--completed', stepIndex < index);
            });
        };

        const showStep = (index) => {
            steps.forEach((step, stepIndex) => {
                step.hidden = stepIndex !== index;
            });

            updateStepIndicators(index);

            if (previousButton) {
                previousButton.style.visibility = index === 0 ? 'hidden' : 'visible';
            }

            if (nextButton) {
                nextButton.style.display = index === steps.length - 1 ? 'none' : 'inline-flex';
            }

            if (submitButton) {
                submitButton.style.display = index === steps.length - 1 ? 'inline-flex' : 'none';
            }
        };

        const validateStep = (index) => {
            const stepElement = steps[index];
            if (!stepElement) {
                return true;
            }

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

            const controls = Array.from(stepElement.querySelectorAll('input, textarea, select'));

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
            stepIndicators.forEach(indicator => indicator.classList.remove('property-wizard__step-indicator--completed'));
        };

        const openWizard = () => {
            resetWizard();
            wizard.classList.remove(HIDDEN_CLASS);
            wizard.setAttribute('aria-hidden', 'false');
            dialog.focus();
        };

        const closeWizard = () => {
            wizard.classList.add(HIDDEN_CLASS);
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

        if (previousButton) {
            previousButton.addEventListener('click', () => {
                if (currentStep > 0) {
                    currentStep -= 1;
                    showStep(currentStep);
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (!validateStep(currentStep)) {
                    return;
                }

                if (currentStep < steps.length - 1) {
                    currentStep += 1;
                    showStep(currentStep);
                }
            });
        }

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

        wizard.dataset.propertyWizardInitialized = 'true';
        showStep(currentStep);
        updatePhotosHint();
    };

    const autoInit = (root = document) => {
        const scope = root instanceof Element ? root : document;
        const wizards = scope.querySelectorAll('[data-property-wizard]');
        wizards.forEach(wizard => init(wizard));
    };

    window.PropertyWizard = {
        init,
        autoInit
    };

    document.addEventListener('DOMContentLoaded', () => {
        autoInit(document);
    });
})(window, document);
