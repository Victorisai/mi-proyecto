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
        const finishButton = modal.querySelector('[data-publish-finish]');
        const detailsForm = modal.querySelector('[data-publish-form]');
        const titleInput = modal.querySelector('[name="property-title"]');
        const descriptionInput = modal.querySelector('[name="property-description"]');
        const imagesInput = modal.querySelector('[name="property-images"]');
        const uploadList = modal.querySelector('[data-upload-list]');
        const dropzone = modal.querySelector('[data-publish-dropzone]');
        const locationInputs = Array.from(modal.querySelectorAll('[data-location-input]'));

        let publishState = {
            purpose: null,
            type: null
        };

        const clearUploadList = () => {
            if (!uploadList) {
                return;
            }
            uploadList.innerHTML = '';
            uploadList.hidden = true;
        };

        const renderUploadList = files => {
            if (!uploadList) {
                return;
            }

            clearUploadList();

            if (!files || !files.length) {
                return;
            }

            const fragment = document.createDocumentFragment();

            Array.from(files).forEach(file => {
                const item = document.createElement('li');
                item.className = 'modal-publish__upload-item';
                item.textContent = file.name;
                const size = document.createElement('span');
                size.textContent = `${Math.round(file.size / 1024)} KB`;
                size.setAttribute('aria-hidden', 'true');
                item.appendChild(size);
                fragment.appendChild(item);
            });

            uploadList.appendChild(fragment);
            uploadList.hidden = false;
        };

        const updateFinishState = () => {
            if (!finishButton) {
                return;
            }

            const hasTitle = titleInput && titleInput.value.trim().length > 0;
            const hasDescription = descriptionInput && descriptionInput.value.trim().length > 0;
            const hasAddress = locationInputs.length === 0 || locationInputs.some(input => input.name === 'property-address' && input.value.trim().length > 0);
            const hasImages = imagesInput && imagesInput.files && imagesInput.files.length > 0;

            finishButton.disabled = !(hasTitle && hasDescription && hasAddress && hasImages);
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
            clearUploadList();
            if (detailsForm) {
                detailsForm.reset();
            }
            updateFinishState();
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
                updateFinishState();
                showStep('type');
            });
        });

        typeOptions.forEach(option => {
            option.addEventListener('click', () => {
                publishState.type = option.dataset.type || null;
                toggleOptionSelection(typeOptions, option);
                setBadge(summaryBadges.type, option.dataset.label || '');
                showStep('details');
                updateFinishState();
                if (titleInput) {
                    window.requestAnimationFrame(() => {
                        titleInput.focus();
                    });
                }
            });
        });

        backButtons.forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                const target = button.dataset.publishBack || 'purpose';
                showStep(target);
                updateFinishState();
            });
        });

        if (detailsForm) {
            detailsForm.addEventListener('submit', event => {
                event.preventDefault();
                updateFinishState();
                if (finishButton && finishButton.disabled) {
                    return;
                }
                closeModal();
            });
        }

        if (titleInput) {
            titleInput.addEventListener('input', updateFinishState);
        }

        if (descriptionInput) {
            descriptionInput.addEventListener('input', updateFinishState);
        }

        locationInputs.forEach(input => {
            input.addEventListener('input', updateFinishState);
        });

        if (imagesInput) {
            imagesInput.addEventListener('change', () => {
                renderUploadList(imagesInput.files);
                updateFinishState();
            });
        }

        if (dropzone) {
            const toggleDropzoneState = isActive => {
                dropzone.classList.toggle('is-active', isActive);
            };

            ['dragenter', 'dragover'].forEach(eventName => {
                dropzone.addEventListener(eventName, event => {
                    event.preventDefault();
                    toggleDropzoneState(true);
                });
            });

            ['dragleave', 'dragend', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, () => {
                    toggleDropzoneState(false);
                });
            });

            dropzone.addEventListener('drop', event => {
                event.preventDefault();
                if (!imagesInput) {
                    return;
                }
                const { files } = event.dataTransfer || {};
                if (files && files.length) {
                    try {
                        if (typeof DataTransfer !== 'undefined') {
                            const dataTransfer = new DataTransfer();
                            Array.from(files).forEach(file => dataTransfer.items.add(file));
                            imagesInput.files = dataTransfer.files;
                        } else {
                            imagesInput.files = files;
                        }
                    } catch (error) {
                        imagesInput.files = files;
                    }
                    imagesInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
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
