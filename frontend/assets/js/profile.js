document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.sidebar__menu-link[data-section]');
    const panels = document.querySelectorAll('.profile__panel');

    const setupPublishModal = (panel) => {
        const modal = panel.querySelector('[data-modal="publish"]');
        if (!modal) {
            return;
        }

        const openButtons = panel.querySelectorAll('[data-modal-trigger="publish"]');
        if (!openButtons.length) {
            return;
        }

        const closers = modal.querySelectorAll('[data-modal-close]');
        const steps = Array.from(modal.querySelectorAll('.modal-publish__step'));
        const summaryBadges = {
            purpose: modal.querySelector('[data-selection-purpose]'),
            type: modal.querySelector('[data-selection-type]'),
            title: modal.querySelector('[data-selection-title]')
        };
        const purposeOptions = Array.from(modal.querySelectorAll('[data-purpose]'));
        const typeOptions = Array.from(modal.querySelectorAll('[data-type]'));
        const backButtons = Array.from(modal.querySelectorAll('[data-publish-back]'));
        const continueButton = modal.querySelector('[data-publish-continue]');
        const finishButton = modal.querySelector('[data-publish-finish]');
        const detailsForm = modal.querySelector('[data-publish-form]');
        const firstDetailField = detailsForm ? detailsForm.querySelector('input, textarea') : null;

        let publishState = {
            purpose: null,
            type: null,
            title: ''
        };

        const setBadge = (badge, label) => {
            if (!badge) {
                return;
            }

            if (label) {
                badge.textContent = label;
                badge.hidden = false;
            } else {
                badge.textContent = '';
                badge.hidden = true;
            }
        };

        const toggleOptionSelection = (options, activeOption) => {
            options.forEach(option => {
                const isActive = option === activeOption;
                option.classList.toggle('is-selected', isActive);
                option.setAttribute('aria-pressed', String(isActive));
            });
        };

        const showStep = (stepName) => {
            steps.forEach(step => {
                const isActive = step.dataset.step === stepName;
                step.classList.toggle('modal-publish__step--active', isActive);
            });
            modal.dataset.currentStep = stepName;
        };

        const resetPublishState = () => {
            publishState = { purpose: null, type: null, title: '' };
            toggleOptionSelection(purposeOptions, null);
            toggleOptionSelection(typeOptions, null);
            setBadge(summaryBadges.purpose, '');
            setBadge(summaryBadges.type, '');
            setBadge(summaryBadges.title, '');
            if (continueButton) {
                continueButton.disabled = true;
            }
            if (finishButton) {
                finishButton.disabled = true;
            }
            if (detailsForm) {
                detailsForm.reset();
            }
            showStep('purpose');
        };

        const updateAria = (isOpen) => {
            modal.setAttribute('aria-hidden', String(!isOpen));
            if (isOpen) {
                modal.setAttribute('aria-modal', 'true');
            } else {
                modal.removeAttribute('aria-modal');
            }
        };

        const closeModal = () => {
            modal.classList.remove('modal--visible');
            updateAria(false);
            document.removeEventListener('keydown', handleKeyDown);
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };

        const openModal = () => {
            resetPublishState();
            modal.classList.add('modal--visible');
            updateAria(true);
            document.addEventListener('keydown', handleKeyDown);
        };

        openButtons.forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                openModal();
            });
        });

        closers.forEach(element => {
            element.addEventListener('click', event => {
                event.preventDefault();
                closeModal();
            });
        });

        purposeOptions.forEach(option => {
            option.addEventListener('click', () => {
                publishState.purpose = option.dataset.purpose || null;
                toggleOptionSelection(purposeOptions, option);
                setBadge(summaryBadges.purpose, option.dataset.label || '');
                publishState.type = null;
                toggleOptionSelection(typeOptions, null);
                setBadge(summaryBadges.type, '');
                setBadge(summaryBadges.title, '');
                publishState.title = '';
                if (finishButton) {
                    finishButton.disabled = true;
                }
                if (continueButton) {
                    continueButton.disabled = true;
                }
                if (detailsForm) {
                    detailsForm.reset();
                }
                showStep('type');
            });
        });

        typeOptions.forEach(option => {
            option.addEventListener('click', () => {
                publishState.type = option.dataset.type || null;
                toggleOptionSelection(typeOptions, option);
                setBadge(summaryBadges.type, option.dataset.label || '');
                if (continueButton) {
                    continueButton.disabled = false;
                }
            });
        });

        const updateFinishState = () => {
            if (!finishButton || !detailsForm) {
                return;
            }
            finishButton.disabled = !detailsForm.checkValidity();
        };

        if (detailsForm) {
            detailsForm.addEventListener('input', updateFinishState);
            detailsForm.addEventListener('change', updateFinishState);
        }

        if (continueButton) {
            continueButton.addEventListener('click', event => {
                event.preventDefault();
                if (continueButton.disabled) {
                    return;
                }
                showStep('details');
                if (firstDetailField) {
                    firstDetailField.focus();
                }
                updateFinishState();
            });
        }

        backButtons.forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                const targetStep = button.dataset.publishBack || 'purpose';
                showStep(targetStep);
                if (targetStep === 'purpose') {
                    if (continueButton) {
                        continueButton.disabled = true;
                    }
                    if (finishButton) {
                        finishButton.disabled = true;
                    }
                }
                if (targetStep === 'type' && continueButton) {
                    continueButton.disabled = !publishState.type;
                }
            });
        });

        const titleInput = detailsForm ? detailsForm.querySelector('[name="property-title"]') : null;
        if (titleInput) {
            const handleTitleUpdate = () => {
                publishState.title = titleInput.value.trim();
                setBadge(summaryBadges.title, publishState.title);
            };
            titleInput.addEventListener('input', handleTitleUpdate);
            titleInput.addEventListener('change', handleTitleUpdate);
        }

        if (finishButton) {
            finishButton.addEventListener('click', event => {
                event.preventDefault();
                if (finishButton.disabled) {
                    return;
                }
                if (detailsForm && !detailsForm.reportValidity()) {
                    return;
                }
                closeModal();
            });
        }
    };

    const initializePanelFeatures = (panel) => {
        if (panel.dataset.section === 'propiedades') {
            setupPublishModal(panel);
        }
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
                initializePanelFeatures(panel);
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
                if (isActive && !panel.innerHTML.trim()) {
                    loadPanelContent(panel);
                }
            });
        });
    });
});
