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
        const backButton = modal.querySelector('[data-publish-back]');
        const finishButton = modal.querySelector('[data-publish-finish]');
        const detailsModal = panel.querySelector('[data-modal="publish-details"]');
        const pricingModal = panel.querySelector('[data-modal="publish-pricing"]');

        const createModalController = (modalElement, options = {}) => {
            if (!modalElement) {
                return null;
            }

            const { onComplete } = options;
            const closers = Array.from(modalElement.querySelectorAll('[data-modal-close]'));
            const firstField = modalElement.querySelector('input, textarea, select, button');
            const fileInput = modalElement.querySelector('.publish-details__file-input');
            const uploadButton = modalElement.querySelector('.publish-details__upload-btn');
            const uploadArea = modalElement.querySelector('.publish-details__upload');
            const galleryContainer = modalElement.querySelector('.publish-details__gallery');
            const galleryList = modalElement.querySelector('[data-gallery-list]');
            const galleryStatus = modalElement.querySelector('[data-gallery-status]');
            const galleryCount = modalElement.querySelector('[data-gallery-count]');
            const galleryProgress = modalElement.querySelector('[data-gallery-progress]');
            const galleryProgressWrapper = modalElement.querySelector('[data-gallery-progress-wrapper]');
            const galleryProgressLabel = modalElement.querySelector('[data-gallery-progress-label]');
            const galleryCover = modalElement.querySelector('[data-gallery-cover]');
            const galleryItems = [];
            const recommendedGallerySize = 12;
            let dragSourceIndex = null;
            const detailsForm = modalElement.querySelector('.publish-details');
            const detailsSteps = detailsForm ? Array.from(detailsForm.querySelectorAll('[data-details-step]')) : [];
            const detailsPrevButton = modalElement.querySelector('[data-details-prev]');
            const featuresContent = modalElement.querySelector('[data-features-content]');
            const featureGroups = Array.from(modalElement.querySelectorAll('[data-feature-category]'));
            const featureTypeLabel = modalElement.querySelector('[data-feature-type-label]');
            const featureSummary = modalElement.querySelector('[data-feature-summary]');
            const modalDialog = modalElement.querySelector('.modal__dialog');
            let currentDetailsStep = 'basic';
            let selectedPropertyType = null;
            let selectedPropertyTypeLabel = '';
            let selectedPropertyPurpose = null;
            let selectedPropertyPurposeLabel = '';
            const propertyTypeNames = {
                casa: 'Casa',
                departamento: 'Departamento',
                terreno: 'Terreno',
                desarrollo: 'Desarrollo'
            };

            const updateFeatureSummary = () => {
                const displayName = selectedPropertyTypeLabel || propertyTypeNames[selectedPropertyType] || '';
                if (featureTypeLabel) {
                    featureTypeLabel.textContent = displayName || 'Tipo no seleccionado';
                }
                if (featureSummary) {
                    featureSummary.textContent = displayName
                        ? `Personaliza los atributos clave para ${displayName}.`
                        : 'Selecciona un tipo de propiedad en el paso anterior para ver las opciones disponibles.';
                }
            };

            const updateFeatureGroups = () => {
                const hasType = Boolean(selectedPropertyType);
                featureGroups.forEach(group => {
                    const matches = hasType && group.dataset.featureCategory === selectedPropertyType;
                    group.classList.toggle('property-features__group--active', matches);
                    if (matches) {
                        group.removeAttribute('hidden');
                    } else {
                        group.setAttribute('hidden', '');
                    }
                });
                if (featuresContent) {
                    featuresContent.hidden = !hasType;
                }
                updateFeatureSummary();
            };

            const showDetailsStep = (step) => {
                currentDetailsStep = step;
                if (!detailsSteps.length) {
                    updateFeatureGroups();
                    return;
                }
                if (detailsForm) {
                    detailsForm.dataset.currentStep = step;
                }
                detailsSteps.forEach(section => {
                    const isActive = section.dataset.detailsStep === step;
                    section.classList.toggle('publish-details__step--active', isActive);
                    section.classList.toggle('is-active', isActive);
                    if (isActive) {
                        section.removeAttribute('hidden');
                    } else {
                        section.setAttribute('hidden', '');
                    }
                });
                if (modalDialog) {
                    modalDialog.scrollTop = 0;
                }
                const activeSection = detailsSteps.find(section => section.dataset.detailsStep === step);
                if (activeSection) {
                    const focusable = activeSection.querySelector('input, textarea, select, button:not([type="hidden"])');
                    if (focusable) {
                        setTimeout(() => focusable.focus(), 80);
                    }
                }
                if (step === 'features') {
                    updateFeatureGroups();
                }
            };

            const updateAriaState = (isOpen) => {
                modalElement.setAttribute('aria-hidden', String(!isOpen));
                if (isOpen) {
                    modalElement.setAttribute('aria-modal', 'true');
                } else {
                    modalElement.removeAttribute('aria-modal');
                }
            };

            const handleKeyDown = (event) => {
                if (event.key === 'Escape') {
                    close();
                }
            };

            const close = () => {
                modalElement.classList.remove('modal--visible');
                updateAriaState(false);
                document.removeEventListener('keydown', handleKeyDown);
                dragSourceIndex = null;
                if (uploadArea) {
                    uploadArea.classList.remove('is-dragover');
                }
                selectedPropertyType = null;
                selectedPropertyTypeLabel = '';
                selectedPropertyPurpose = null;
                selectedPropertyPurposeLabel = '';
                currentDetailsStep = 'basic';
                if (detailsForm) {
                    detailsForm.dataset.currentStep = 'basic';
                }
                showDetailsStep('basic');
                updateFeatureGroups();
            };

            const open = (context = {}) => {
                const {
                    type = null,
                    typeLabel = '',
                    purpose = null,
                    purposeLabel = '',
                    initialStep = 'basic'
                } = context;
                selectedPropertyType = type;
                selectedPropertyTypeLabel = typeLabel;
                selectedPropertyPurpose = purpose;
                selectedPropertyPurposeLabel = purposeLabel;
                currentDetailsStep = initialStep;
                updateFeatureSummary();
                updateFeatureGroups();
                showDetailsStep(initialStep);
                modalElement.classList.add('modal--visible');
                updateAriaState(true);
                document.addEventListener('keydown', handleKeyDown);
                if (firstField) {
                    setTimeout(() => firstField.focus(), 50);
                }
            };

            closers.forEach(closer => {
                closer.addEventListener('click', event => {
                    event.preventDefault();
                    close();
                });
            });

            const formatFileName = (name = '') => {
                if (name.length <= 32) {
                    return name;
                }
                const start = name.slice(0, 18);
                const end = name.slice(-10);
                return `${start}…${end}`;
            };

            const formatFileSize = (size = 0) => {
                if (size <= 0) {
                    return '';
                }
                const kilobytes = size / 1024;
                if (kilobytes < 1024) {
                    return `${kilobytes.toFixed(1)} KB`;
                }
                return `${(kilobytes / 1024).toFixed(2)} MB`;
            };

            const revokePreview = (item) => {
                if (item && item.previewUrl) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            };

            const updateGalleryEmptyState = () => {
                if (!galleryContainer) {
                    return;
                }

                const count = galleryItems.length;
                const isEmpty = count === 0;
                const percentage = Math.min(Math.round((count / recommendedGallerySize) * 100), 100);
                const statusState = isEmpty ? 'empty' : (count >= recommendedGallerySize ? 'complete' : 'filled');

                galleryContainer.dataset.empty = isEmpty ? 'true' : 'false';

                if (galleryStatus) {
                    galleryStatus.dataset.state = statusState;
                }

                if (galleryCount) {
                    galleryCount.textContent = String(count);
                }

                if (galleryCover) {
                    galleryCover.textContent = isEmpty
                        ? 'La portada se asignará a la primera imagen que cargues.'
                        : `Portada actual: ${formatFileName(galleryItems[0].file.name)}`;
                }

                if (galleryProgress) {
                    galleryProgress.style.width = `${percentage}%`;
                    galleryProgress.setAttribute('data-progress-value', String(percentage));
                }

                if (galleryProgressLabel) {
                    galleryProgressLabel.textContent = count >= recommendedGallerySize
                        ? 'Galería lista'
                        : `${count}/${recommendedGallerySize} sugeridas`;
                }

                if (galleryProgressWrapper) {
                    const label = statusState === 'complete'
                        ? 'Progreso de la galería completado'
                        : `Progreso de la galería ${percentage}% listo`;
                    galleryProgressWrapper.setAttribute('aria-label', label);
                }
            };

            const removeGalleryItem = (index) => {
                if (index < 0 || index >= galleryItems.length) {
                    return;
                }
                const [removed] = galleryItems.splice(index, 1);
                revokePreview(removed);
                renderGallery();
            };

            const handleItemDragStart = (event) => {
                const target = event.currentTarget;
                dragSourceIndex = Number(target.dataset.index);
                target.classList.add('is-dragging');
                if (event.dataTransfer) {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', String(dragSourceIndex));
                }
            };

            const handleItemDragOver = (event) => {
                event.preventDefault();
                if (event.dataTransfer) {
                    event.dataTransfer.dropEffect = 'move';
                }
            };

            const handleItemDrop = (event) => {
                event.preventDefault();
                const targetIndex = Number(event.currentTarget.dataset.index);
                if (
                    Number.isInteger(dragSourceIndex) &&
                    dragSourceIndex !== null &&
                    dragSourceIndex !== targetIndex &&
                    targetIndex >= 0 &&
                    targetIndex < galleryItems.length
                ) {
                    const [movedItem] = galleryItems.splice(dragSourceIndex, 1);
                    galleryItems.splice(targetIndex, 0, movedItem);
                    renderGallery();
                }
                dragSourceIndex = null;
            };

            const handleItemDragEnd = (event) => {
                event.currentTarget.classList.remove('is-dragging');
            };

            const renderGallery = () => {
                if (!galleryList) {
                    return;
                }

                galleryList.innerHTML = '';
                updateGalleryEmptyState();

                galleryItems.forEach((item, index) => {
                    const listItem = document.createElement('li');
                    listItem.className = 'publish-details__gallery-item';
                    listItem.draggable = true;
                    listItem.dataset.index = String(index);

                    const image = document.createElement('img');
                    image.className = 'publish-details__gallery-thumb';
                    image.src = item.previewUrl;
                    image.alt = `Vista previa ${index + 1}`;

                    const overlay = document.createElement('div');
                    overlay.className = 'publish-details__gallery-overlay';

                    const indexBadge = document.createElement('span');
                    indexBadge.className = 'publish-details__gallery-index';
                    indexBadge.textContent = String(index + 1);

                    const removeButton = document.createElement('button');
                    removeButton.type = 'button';
                    removeButton.className = 'publish-details__gallery-remove';
                    removeButton.setAttribute('aria-label', `Quitar ${item.file.name}`);
                    removeButton.innerHTML = '&times;';
                    removeButton.addEventListener('click', (event) => {
                        event.preventDefault();
                        removeGalleryItem(index);
                    });

                    overlay.append(indexBadge, removeButton);
                    listItem.append(image, overlay);

                    listItem.addEventListener('dragstart', handleItemDragStart);
                    listItem.addEventListener('dragover', handleItemDragOver);
                    listItem.addEventListener('drop', handleItemDrop);
                    listItem.addEventListener('dragend', handleItemDragEnd);

                    galleryList.append(listItem);
                });
            };

            const addFilesToGallery = (files) => {
                if (!files || !files.length) {
                    return;
                }

                Array.from(files).forEach(file => {
                    if (!file.type.startsWith('image/')) {
                        return;
                    }

                    const identifier = `${file.name}-${file.lastModified}-${file.size}`;
                    const isDuplicate = galleryItems.some(item => item.id === identifier);
                    if (isDuplicate) {
                        return;
                    }

                    galleryItems.push({
                        id: identifier,
                        file,
                        previewUrl: URL.createObjectURL(file)
                    });
                });

                renderGallery();
            };

            const triggerFileDialog = () => {
                if (fileInput) {
                    fileInput.click();
                }
            };

            if (uploadButton && fileInput) {
                uploadButton.addEventListener('click', event => {
                    event.preventDefault();
                    triggerFileDialog();
                });
            }

            if (uploadArea && fileInput) {
                uploadArea.addEventListener('click', event => {
                    if (event.target.closest('button') || event.target === fileInput) {
                        return;
                    }
                    triggerFileDialog();
                });

                const preventDefaults = (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                };

                const activateDragState = (event) => {
                    preventDefaults(event);
                    uploadArea.classList.add('is-dragover');
                };

                const deactivateDragState = (event) => {
                    preventDefaults(event);
                    uploadArea.classList.remove('is-dragover');
                };

                ['dragenter', 'dragover'].forEach(type => {
                    uploadArea.addEventListener(type, activateDragState);
                });

                ['dragleave', 'dragend'].forEach(type => {
                    uploadArea.addEventListener(type, event => {
                        preventDefaults(event);
                        setTimeout(() => {
                            if (!uploadArea.matches(':hover')) {
                                uploadArea.classList.remove('is-dragover');
                            }
                        }, 50);
                    });
                });

                uploadArea.addEventListener('drop', event => {
                    deactivateDragState(event);
                    if (event.dataTransfer?.files?.length) {
                        addFilesToGallery(event.dataTransfer.files);
                    }
                });
            }

            if (fileInput) {
                fileInput.addEventListener('change', event => {
                    const target = event.target;
                    if (target && target.files) {
                        addFilesToGallery(target.files);
                        target.value = '';
                    }
                });
            }

            renderGallery();

            if (detailsPrevButton) {
                detailsPrevButton.addEventListener('click', event => {
                    event.preventDefault();
                    showDetailsStep('basic');
                });
            }

            if (detailsForm) {
                detailsForm.addEventListener('submit', event => {
                    event.preventDefault();
                    if (currentDetailsStep === 'basic') {
                        showDetailsStep('features');
                        return;
                    }
                    const completionContext = {
                        type: selectedPropertyType,
                        typeLabel: selectedPropertyTypeLabel,
                        purpose: selectedPropertyPurpose,
                        purposeLabel: selectedPropertyPurposeLabel
                    };
                    close();
                    if (typeof onComplete === 'function') {
                        onComplete(completionContext);
                    }
                });
            }

            updateFeatureSummary();
            showDetailsStep('basic');
            updateFeatureGroups();

            return { open, close, showStep: showDetailsStep };
        };

        const createPricingModal = (modalElement, options = {}) => {
            if (!modalElement) {
                return null;
            }

            const { onBack, onSubmit } = options;
            const closers = Array.from(modalElement.querySelectorAll('[data-modal-close]'));
            const form = modalElement.querySelector('[data-pricing-form]');
            const backButton = modalElement.querySelector('[data-pricing-back]');
            const priceInput = modalElement.querySelector('[data-pricing-input]');
            const inputGroup = modalElement.querySelector('.publish-pricing__input-group');
            const helper = modalElement.querySelector('[data-pricing-helper]');
            const errorMessage = modalElement.querySelector('[data-pricing-error]');
            const priceLabel = modalElement.querySelector('[data-pricing-label]');
            const currencySymbol = modalElement.querySelector('[data-pricing-currency-symbol]');
            const currencySelect = modalElement.querySelector('[data-pricing-currency-select]');
            const summaryPurpose = modalElement.querySelector('[data-pricing-purpose]');
            const summaryType = modalElement.querySelector('[data-pricing-type]');
            const modalDialog = modalElement.querySelector('.modal__dialog');
            let selectedCurrency = 'MXN';
            let selectedCurrencyLabel = 'Peso mexicano';
            let selectedCurrencySymbol = '$';
            let selectedCurrencyCode = 'MXN';
            let currentContext = {
                purpose: null,
                purposeLabel: '',
                type: null,
                typeLabel: ''
            };

            const updateAriaState = (isOpen) => {
                modalElement.setAttribute('aria-hidden', String(!isOpen));
                if (isOpen) {
                    modalElement.setAttribute('aria-modal', 'true');
                } else {
                    modalElement.removeAttribute('aria-modal');
                }
            };

            const handleKeyDown = (event) => {
                if (event.key === 'Escape') {
                    close();
                }
            };

            const resetErrorState = () => {
                if (errorMessage) {
                    errorMessage.hidden = true;
                }
                if (inputGroup) {
                    inputGroup.classList.remove('has-error');
                }
                if (priceInput) {
                    priceInput.removeAttribute('aria-invalid');
                }
            };

            const updateCurrencyState = (option) => {
                if (!option) {
                    return;
                }

                selectedCurrency = (option.value || 'MXN').toUpperCase();
                selectedCurrencyLabel = option.dataset.currencyLabel || selectedCurrency;
                selectedCurrencySymbol = option.dataset.currencySymbol || '$';
                selectedCurrencyCode = selectedCurrency;

                if (currencySymbol) {
                    currencySymbol.textContent = selectedCurrencySymbol;
                }
                if (currencySelect) {
                    currencySelect.value = selectedCurrency;
                }
            };

            const close = () => {
                modalElement.classList.remove('modal--visible');
                updateAriaState(false);
                document.removeEventListener('keydown', handleKeyDown);
            };

            const open = (context = {}) => {
                currentContext = {
                    purpose: context.purpose || null,
                    purposeLabel: context.purposeLabel || '',
                    type: context.type || null,
                    typeLabel: context.typeLabel || ''
                };

                const isRent = currentContext.purpose === 'rentar';

                if (priceLabel) {
                    priceLabel.textContent = isRent ? 'Precio mensual' : 'Precio de venta';
                }

                if (helper) {
                    helper.textContent = isRent
                        ? 'Este será el monto mensual mostrado en tu anuncio de renta.'
                        : 'Este será el precio total mostrado en tu anuncio de venta.';
                }

                if (summaryPurpose) {
                    summaryPurpose.textContent = currentContext.purposeLabel || 'Por definir';
                }

                if (summaryType) {
                    summaryType.textContent = currentContext.typeLabel || 'Por definir';
                }

                if (form) {
                    form.reset();
                }

                resetErrorState();

                if (priceInput) {
                    priceInput.placeholder = isRent ? 'Ej. 25,000' : 'Ej. 4,500,000';
                    priceInput.value = '';
                }

                if (currencySelect && currencySelect.options.length) {
                    const options = Array.from(currencySelect.options);
                    const defaultOption = options.find(option => {
                        const value = option.value || '';
                        return value.toUpperCase() === selectedCurrency;
                    }) || options[0];
                    updateCurrencyState(defaultOption);
                }

                modalElement.classList.add('modal--visible');
                updateAriaState(true);
                document.addEventListener('keydown', handleKeyDown);

                if (modalDialog) {
                    modalDialog.scrollTop = 0;
                }

                if (priceInput) {
                    setTimeout(() => priceInput.focus(), 80);
                }
            };

            if (currencySelect) {
                currencySelect.addEventListener('change', () => {
                    const selectedOption = currencySelect.options[currencySelect.selectedIndex];
                    updateCurrencyState(selectedOption);
                });
            }

            closers.forEach(closer => {
                closer.addEventListener('click', event => {
                    event.preventDefault();
                    close();
                });
            });

            if (backButton) {
                backButton.addEventListener('click', event => {
                    event.preventDefault();
                    close();
                    if (typeof onBack === 'function') {
                        onBack(currentContext);
                    }
                });
            }

            if (priceInput) {
                priceInput.addEventListener('input', () => {
                    resetErrorState();
                });
            }

            if (form) {
                form.addEventListener('submit', event => {
                    event.preventDefault();

                    if (!priceInput) {
                        close();
                        return;
                    }

                    const value = priceInput.value ? priceInput.value.trim() : '';
                    const numeric = Number(value);

                    if (!value || Number.isNaN(numeric) || numeric <= 0) {
                        if (errorMessage) {
                            errorMessage.hidden = false;
                        }
                        if (inputGroup) {
                            inputGroup.classList.add('has-error');
                        }
                        priceInput.setAttribute('aria-invalid', 'true');
                        priceInput.focus();
                        return;
                    }

                    resetErrorState();

                    const submission = {
                        ...currentContext,
                        price: value,
                        priceValue: numeric,
                        currency: selectedCurrency,
                        currencyCode: selectedCurrencyCode,
                        currencyLabel: selectedCurrencyLabel,
                        billing: currentContext.purpose === 'rentar' ? 'monthly' : 'total'
                    };

                    close();

                    if (typeof onSubmit === 'function') {
                        onSubmit(submission);
                    }
                });
            }

            return { open, close };
        };

        let lastDetailsContext = null;
        let pricingModalController = null;

        const detailsModalController = createModalController(detailsModal, {
            onComplete: (context) => {
                lastDetailsContext = {
                    type: context.type || null,
                    typeLabel: context.typeLabel || '',
                    purpose: context.purpose || null,
                    purposeLabel: context.purposeLabel || ''
                };

                if (pricingModalController) {
                    pricingModalController.open({ ...lastDetailsContext });
                }
            }
        });

        pricingModalController = createPricingModal(pricingModal, {
            onBack: () => {
                if (detailsModalController && lastDetailsContext) {
                    detailsModalController.open({
                        ...lastDetailsContext,
                        initialStep: 'features'
                    });
                }
            }
        });

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
            });
            modal.dataset.currentStep = stepName;
        };

        const resetPublishState = () => {
            publishState = { purpose: null, purposeLabel: null, type: null, typeLabel: null };
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
                closeModal();
                const detailsContext = {
                    type: publishState.type,
                    typeLabel: publishState.typeLabel,
                    purpose: publishState.purpose,
                    purposeLabel: publishState.purposeLabel
                };
                lastDetailsContext = { ...detailsContext };
                if (detailsModalController) {
                    detailsModalController.open(detailsContext);
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
