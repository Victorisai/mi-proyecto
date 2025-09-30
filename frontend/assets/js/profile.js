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
            type: modal.querySelector('[data-selection-type]')
        };
        const purposeOptions = Array.from(modal.querySelectorAll('[data-purpose]'));
        const typeOptions = Array.from(modal.querySelectorAll('[data-type]'));
        const backButtons = Array.from(modal.querySelectorAll('[data-publish-back]'));
        const continueButton = modal.querySelector('[data-publish-continue]');
        const publishForm = modal.querySelector('[data-publish-form]');

        let publishState = {
            purpose: null,
            type: null
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
            publishState = { purpose: null, type: null };
            toggleOptionSelection(purposeOptions, null);
            toggleOptionSelection(typeOptions, null);
            setBadge(summaryBadges.purpose, '');
            setBadge(summaryBadges.type, '');
            if (continueButton) {
                continueButton.disabled = true;
            }
            if (publishForm) {
                publishForm.reset();
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
                if (continueButton) {
                    continueButton.disabled = true;
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

        backButtons.forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                const target = button.dataset.publishBack;
                if (!target) {
                    return;
                }
                showStep(target);
                if (continueButton) {
                    if (target === 'type') {
                        continueButton.disabled = !publishState.type;
                    }
                    if (target === 'purpose') {
                        continueButton.disabled = true;
                    }
                }
            });
        });

        if (continueButton) {
            continueButton.addEventListener('click', event => {
                event.preventDefault();
                if (continueButton.disabled) {
                    return;
                }
                showStep('details');
            });
        }

        if (publishForm) {
            publishForm.addEventListener('submit', event => {
                event.preventDefault();
                const formData = new FormData(publishForm);
                const details = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    city: formData.get('city'),
                    neighborhood: formData.get('neighborhood'),
                    address: formData.get('address')
                };
                console.info('Información lista para publicar:', {
                    ...publishState,
                    details
                });
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
