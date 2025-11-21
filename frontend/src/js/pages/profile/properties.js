(function (global) {
    const init = (panel) => {
        if (!panel || panel.dataset.section !== 'propiedades' || panel.dataset.propertiesInitialized === 'true') {
            return;
        }

        const modal = panel.querySelector('[data-modal="publish"]');
        if (!modal) {
            return;
        }

        const openButtons = panel.querySelectorAll('[data-modal-trigger="publish"]');
        if (!openButtons.length) {
            return;
        }

        panel.dataset.propertiesInitialized = 'true';

        const closers = Array.from(modal.querySelectorAll('[data-modal-close]'));
        const steps = Array.from(modal.querySelectorAll('.modal-publish__step'));
        const summaryBadges = {
            purpose: modal.querySelector('[data-selection-purpose]'),
            type: modal.querySelector('[data-selection-type]')
        };
        const purposeOptions = Array.from(modal.querySelectorAll('[data-purpose]'));
        const typeOptions = Array.from(modal.querySelectorAll('[data-type]'));
        const backButton = modal.querySelector('[data-publish-back]');
        const finishButton = modal.querySelector('[data-publish-finish]');
        const modalDialog = modal.querySelector('.modal__dialog');

        let publishState = {
            purpose: null,
            purposeLabel: null,
            type: null,
            typeLabel: null
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
                if (isActive) {
                    step.removeAttribute('hidden');
                } else {
                    step.setAttribute('hidden', '');
                }
            });
            modal.dataset.currentStep = stepName;

            const activeStep = steps.find(step => step.dataset.step === stepName);
            if (!activeStep) {
                return;
            }

            const focusTarget = activeStep.querySelector('button.modal-publish__option, button.modal-publish__back');
            if (focusTarget) {
                setTimeout(() => {
                    focusTarget.focus();
                }, 60);
            }
        };

        const resetPublishState = () => {
            publishState = {
                purpose: null,
                purposeLabel: null,
                type: null,
                typeLabel: null
            };
            toggleOptionSelection(purposeOptions, null);
            toggleOptionSelection(typeOptions, null);
            setBadge(summaryBadges.purpose, '');
            setBadge(summaryBadges.type, '');
            if (finishButton) {
                finishButton.disabled = true;
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

        const openPublicationTemplate = (detail) => {
            const profileRoot = panel.closest('.profile');
            if (!profileRoot) {
                return;
            }

            const mainContent = profileRoot.querySelector('.profile__main-content');
            const publicationPanel = mainContent ? mainContent.querySelector('.profile__panel[data-section="publicar-propiedad"]') : null;

            if (!mainContent || !publicationPanel) {
                return;
            }

            const setActivePanel = () => {
                mainContent.querySelectorAll('.profile__panel').forEach((panelItem) => {
                    const isActive = panelItem === publicationPanel;
                    panelItem.classList.toggle('profile__panel--active', isActive);
                });
            };

            const applyPublicationSummary = () => {
                const purposeBadge = publicationPanel.querySelector('[data-publish-summary="purpose"]');
                const typeBadge = publicationPanel.querySelector('[data-publish-summary="type"]');
                const context = publicationPanel.querySelector('[data-publish-context]');
                const heading = publicationPanel.querySelector('[data-publish-heading]');

                if (purposeBadge) {
                    purposeBadge.textContent = detail && detail.purposeLabel ? detail.purposeLabel : '';
                    purposeBadge.hidden = !(detail && detail.purposeLabel);
                }

                if (typeBadge) {
                    typeBadge.textContent = detail && detail.typeLabel ? detail.typeLabel : '';
                    typeBadge.hidden = !(detail && detail.typeLabel);
                }

                if (context) {
                    const hasType = Boolean(detail && detail.typeLabel);
                    const hasPurpose = Boolean(detail && detail.purposeLabel);
                    const purposeText = hasPurpose ? detail.purposeLabel.toLowerCase() : 'publicar';
                    context.textContent = hasType
                        ? `Configura los datos iniciales para ${detail.typeLabel.toLowerCase()} en modalidad de ${purposeText}.`
                        : 'Completa los datos base para crear un borrador profesional de tu anuncio.';
                }

                if (heading && typeof heading.focus === 'function') {
                    heading.focus();
                }
            };

            const ensurePublicationContent = () => {
                if (publicationPanel.dataset.loaded === 'true') {
                    return Promise.resolve();
                }

                const source = publicationPanel.dataset.src;

                if (!source) {
                    publicationPanel.dataset.loaded = 'true';
                    return Promise.resolve();
                }

                publicationPanel.dataset.loading = 'true';

                return fetch(source)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`No se pudo cargar el contenido de ${source}`);
                        }
                        return response.text();
                    })
                    .then((html) => {
                        publicationPanel.innerHTML = html;
                        publicationPanel.dataset.loaded = 'true';
                    })
                    .catch((error) => {
                        console.error(error);
                        publicationPanel.innerHTML = '<p class="panel__error">No se pudo cargar la plantilla de publicación.</p>';
                        publicationPanel.dataset.loaded = 'error';
                    })
                    .finally(() => {
                        delete publicationPanel.dataset.loading;
                    });
            };

            ensurePublicationContent()
                .then(() => {
                    setActivePanel();
                    applyPublicationSummary();
                })
                .catch((error) => console.error(error));
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeModal();
                resetPublishState();
            }
        };

        const openModal = () => {
            resetPublishState();
            modal.classList.add('modal--visible');
            updateAria(true);
            document.addEventListener('keydown', handleKeyDown);

            if (modalDialog) {
                modalDialog.scrollTop = 0;
            }
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
                resetPublishState();
            });
        });

        purposeOptions.forEach(option => {
            option.addEventListener('click', () => {
                publishState.purpose = option.dataset.purpose || null;
                publishState.purposeLabel = option.dataset.label || null;
                toggleOptionSelection(purposeOptions, option);
                setBadge(summaryBadges.purpose, option.dataset.label || '');
                publishState.type = null;
                publishState.typeLabel = null;
                toggleOptionSelection(typeOptions, null);
                setBadge(summaryBadges.type, '');
                if (finishButton) {
                    finishButton.disabled = true;
                }
                showStep('type');
            });
        });

        typeOptions.forEach(option => {
            option.addEventListener('click', () => {
                publishState.type = option.dataset.type || null;
                publishState.typeLabel = option.dataset.label || null;
                toggleOptionSelection(typeOptions, option);
                setBadge(summaryBadges.type, option.dataset.label || '');
                if (finishButton) {
                    finishButton.disabled = false;
                }
            });
        });

        if (backButton) {
            backButton.addEventListener('click', event => {
                event.preventDefault();
                showStep('purpose');
                if (finishButton) {
                    finishButton.disabled = !publishState.type;
                }
            });
        }

        if (finishButton) {
            finishButton.addEventListener('click', event => {
                event.preventDefault();
                if (finishButton.disabled) {
                    return;
                }

                const detail = {
                    purpose: publishState.purpose,
                    purposeLabel: publishState.purposeLabel,
                    type: publishState.type,
                    typeLabel: publishState.typeLabel
                };

                closeModal();
                panel.dispatchEvent(new CustomEvent('properties:publish:continue', {
                    bubbles: true,
                    detail
                }));
                openPublicationTemplate(detail);
                resetPublishState();
            });
        }
    };

    global.ProfileProperties = { init };
})(window);
