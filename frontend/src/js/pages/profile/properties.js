(function (global) {
    const init = (panel) => {
        if (!panel || panel.dataset.section !== 'propiedades' || panel.dataset.propertiesInitialized === 'true') {
            return;
        }

        const modal = panel.querySelector('[data-modal="publish"]');
        const detailModal = panel.querySelector('[data-modal="publish-details"]');
        if (!modal) {
            return;
        }

        const openButtons = panel.querySelectorAll('[data-modal-trigger="publish"]');
        if (!openButtons.length) {
            return;
        }

        panel.dataset.propertiesInitialized = 'true';

        const closers = Array.from(modal.querySelectorAll('[data-modal-close]'));
        const detailClosers = detailModal ? Array.from(detailModal.querySelectorAll('[data-modal-close]')) : [];
        const steps = Array.from(modal.querySelectorAll('.modal-publish__step'));
        const summaryBadges = {
            purpose: modal.querySelector('[data-selection-purpose]'),
            type: modal.querySelector('[data-selection-type]')
        };
        const detailBadges = {
            purpose: detailModal ? detailModal.querySelector('[data-detail-purpose]') : null,
            type: detailModal ? detailModal.querySelector('[data-detail-type]') : null
        };
        const purposeOptions = Array.from(modal.querySelectorAll('[data-purpose]'));
        const typeOptions = Array.from(modal.querySelectorAll('[data-type]'));
        const backButton = modal.querySelector('[data-publish-back]');
        const finishButton = modal.querySelector('[data-publish-finish]');
        const modalDialog = modal.querySelector('.modal__dialog');
        const detailDialog = detailModal ? detailModal.querySelector('.modal__dialog') : null;

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

        const updateAria = (element, isOpen) => {
            if (!element) {
                return;
            }

            element.setAttribute('aria-hidden', String(!isOpen));
            if (isOpen) {
                element.setAttribute('aria-modal', 'true');
            } else {
                element.removeAttribute('aria-modal');
            }
        };

        const closeModal = () => {
            modal.classList.remove('modal--visible');
            updateAria(modal, false);
            document.removeEventListener('keydown', handleKeyDown);
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
            updateAria(modal, true);
            document.addEventListener('keydown', handleKeyDown);

            if (modalDialog) {
                modalDialog.scrollTop = 0;
            }
        };

        const closeDetailModal = () => {
            if (!detailModal) {
                return;
            }

            detailModal.classList.remove('modal--visible');
            updateAria(detailModal, false);
            document.removeEventListener('keydown', handleDetailKeyDown);
        };

        const handleDetailKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeDetailModal();
            }
        };

        const openDetailModal = (detail) => {
            if (!detailModal) {
                return;
            }

            setBadge(detailBadges.purpose, detail === null || detail === void 0 ? void 0 : detail.purposeLabel);
            setBadge(detailBadges.type, detail === null || detail === void 0 ? void 0 : detail.typeLabel);

            detailModal.classList.add('modal--visible');
            updateAria(detailModal, true);
            document.addEventListener('keydown', handleDetailKeyDown);

            if (detailDialog) {
                detailDialog.scrollTop = 0;
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
                openDetailModal(detail);
                panel.dispatchEvent(new CustomEvent('properties:publish:continue', {
                    bubbles: true,
                    detail
                }));
                resetPublishState();
            });
        }

        if (detailClosers.length) {
            detailClosers.forEach(element => {
                element.addEventListener('click', event => {
                    event.preventDefault();
                    closeDetailModal();
                });
            });
        }
    };

    global.ProfileProperties = { init };
})(window);
