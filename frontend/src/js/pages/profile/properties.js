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

        const closers = modal.querySelectorAll('[data-modal-close]');
        const steps = Array.from(modal.querySelectorAll('.properties-view-modal-publish__step'));
        const summaryBadges = {
            purpose: modal.querySelector('[data-selection-purpose]'),
            type: modal.querySelector('[data-selection-type]')
        };
        const purposeOptions = Array.from(modal.querySelectorAll('[data-purpose]'));
        const typeOptions = Array.from(modal.querySelectorAll('[data-type]'));
        const backButton = modal.querySelector('[data-publish-back]');
        const finishButton = modal.querySelector('[data-publish-finish]');
        const detailsModal = panel.querySelector('[data-modal="publish-details"]');

        const createModalController = (modalElement, options = {}) => {
            if (!modalElement) {
                return null;
            }

            const { onComplete } = options;
            const closers = Array.from(modalElement.querySelectorAll('[data-modal-close]'));
            const firstField = modalElement.querySelector('input, textarea, select, button');
            const fileInput = modalElement.querySelector('.properties-view-publish-details__file-input');
            const uploadButton = modalElement.querySelector('.properties-view-publish-details__upload-btn');
            const uploadArea = modalElement.querySelector('.properties-view-publish-details__upload');
            const galleryContainer = modalElement.querySelector('.properties-view-publish-details__gallery');
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
            const detailsForm = modalElement.querySelector('.properties-view-publish-details');
            const detailsSteps = detailsForm ? Array.from(detailsForm.querySelectorAll('[data-details-step]')) : [];
            const detailsPrevButton = modalElement.querySelector('[data-details-prev]');
            const featuresContent = modalElement.querySelector('[data-features-content]');
            const featureGroups = Array.from(modalElement.querySelectorAll('[data-feature-category]'));
            const featureTypeLabel = modalElement.querySelector('[data-feature-type-label]');
            const featureSummary = modalElement.querySelector('[data-feature-summary]');
            const pricingSection = modalElement.querySelector('[data-details-step="pricing"]');
            const pricingSummary = {
                purpose: modalElement.querySelector('[data-pricing-purpose]'),
                type: modalElement.querySelector('[data-pricing-type]')
            };
            const pricingLabel = modalElement.querySelector('[data-pricing-label]');
            const pricingHelper = modalElement.querySelector('[data-pricing-helper]');
            const pricingError = modalElement.querySelector('[data-pricing-error]');
            const priceInput = modalElement.querySelector('[data-pricing-input]');
            const currencySymbol = modalElement.querySelector('[data-pricing-currency-symbol]');
            const pricingInputGroup = modalElement.querySelector('.properties-view-publish-pricing__input-group');
            const pricingPrevButton = modalElement.querySelector('[data-pricing-prev]');
            const currencySelect = modalElement.querySelector('[data-pricing-currency-select]');
            const customCurrencySelect = modalElement.querySelector('[data-currency-select]');
            const currencyTrigger = modalElement.querySelector('[data-currency-trigger]');
            const currencyTriggerLabel = modalElement.querySelector('[data-currency-label]');
            const currencyOptionsList = modalElement.querySelector('[data-currency-options]');
            const currencyOptionItems = currencyOptionsList
                ? Array.from(currencyOptionsList.querySelectorAll('[data-currency-option]'))
                : [];
            const modalDialog = modalElement.querySelector('.properties-view-modal__dialog');
            let currentDetailsStep = 'basic';
            let selectedPropertyType = null;
            let selectedPropertyTypeLabel = '';
            let selectedPropertyPurpose = null;
            let selectedPropertyPurposeLabel = '';
            let selectedCurrency = 'MXN';
            let selectedCurrencyLabel = 'Peso mexicano';
            let selectedCurrencySymbol = '$';
            let selectedCurrencyCode = 'MXN';
            let isCurrencyDropdownOpen = false;
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
                    group.classList.toggle('properties-view-property-features__group--active', matches);
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

            const updatePricingSummary = () => {
                const isRent = selectedPropertyPurpose === 'rentar';
                if (pricingLabel) {
                    pricingLabel.textContent = isRent ? 'Precio mensual' : 'Precio de venta';
                }
                if (pricingHelper) {
                    pricingHelper.textContent = isRent
                        ? 'Este será el monto mensual mostrado en tu anuncio de renta.'
                        : 'Este será el precio total mostrado en tu anuncio de venta.';
                }
                if (pricingSummary.purpose) {
                    pricingSummary.purpose.textContent = selectedPropertyPurposeLabel || 'Por definir';
                }
                if (pricingSummary.type) {
                    pricingSummary.type.textContent = selectedPropertyTypeLabel || 'Por definir';
                }
                if (priceInput) {
                    priceInput.placeholder = isRent ? 'Ej. 25,000' : 'Ej. 4,500,000';
                }
                if (currencySymbol) {
                    currencySymbol.textContent = selectedCurrencySymbol;
                }
            };

            const resetPricingErrorState = () => {
                if (pricingError) {
                    pricingError.hidden = true;
                }
                if (pricingInputGroup) {
                    pricingInputGroup.classList.remove('has-error');
                }
                if (priceInput) {
                    priceInput.removeAttribute('aria-invalid');
                }
            };

            const handleCurrencyOutsideClick = (event) => {
                if (!customCurrencySelect || !isCurrencyDropdownOpen) {
                    return;
                }
                if (customCurrencySelect.contains(event.target)) {
                    return;
                }
                if (currencyTrigger) {
                    currencyTrigger.setAttribute('aria-expanded', 'false');
                }
                isCurrencyDropdownOpen = false;
                customCurrencySelect.classList.remove('is-open');
                document.removeEventListener('click', handleCurrencyOutsideClick);
                document.removeEventListener('keydown', handleCurrencyKeyDown);
            };

            const closeCurrencyDropdown = () => {
                if (!customCurrencySelect) {
                    return;
                }
                if (currencyTrigger) {
                    currencyTrigger.setAttribute('aria-expanded', 'false');
                }
                isCurrencyDropdownOpen = false;
                customCurrencySelect.classList.remove('is-open');
                document.removeEventListener('click', handleCurrencyOutsideClick);
                document.removeEventListener('keydown', handleCurrencyKeyDown);
            };

            const openCurrencyDropdown = () => {
                if (!customCurrencySelect || isCurrencyDropdownOpen) {
                    return;
                }
                isCurrencyDropdownOpen = true;
                customCurrencySelect.classList.add('is-open');
                if (currencyTrigger) {
                    currencyTrigger.setAttribute('aria-expanded', 'true');
                }
                document.addEventListener('click', handleCurrencyOutsideClick);
                document.addEventListener('keydown', handleCurrencyKeyDown);
            };

            const toggleCurrencyDropdown = () => {
                if (isCurrencyDropdownOpen) {
                    closeCurrencyDropdown();
                } else {
                    openCurrencyDropdown();
                }
            };

            const updateCustomCurrencyUI = () => {
                if (currencyTriggerLabel) {
                    currencyTriggerLabel.textContent = `${selectedCurrency} · ${selectedCurrencyLabel}`;
                }
                currencyOptionItems.forEach(item => {
                    const value = (item.dataset.value || '').toUpperCase();
                    const isActive = value === selectedCurrency;
                    item.classList.toggle('is-active', isActive);
                    item.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });
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
                    currencySelect.value = option.value || selectedCurrency;
                }
                updateCustomCurrencyUI();
            };

            const handleCurrencyOptionSelection = (item) => {
                if (!item) {
                    return;
                }

                const value = (item.dataset.value || '').toUpperCase();

                if (currencySelect) {
                    const matchingOption = Array.from(currencySelect.options).find(option => {
                        const optionValue = (option.value || '').toUpperCase();
                        return optionValue === value;
                    });

                    if (matchingOption) {
                        updateCurrencyState(matchingOption);
                    }
                } else {
                    selectedCurrency = value || selectedCurrency;
                    selectedCurrencyLabel = item.dataset.label || selectedCurrencyLabel;
                    selectedCurrencySymbol = item.dataset.symbol || selectedCurrencySymbol;
                    selectedCurrencyCode = selectedCurrency;
                    if (currencySymbol) {
                        currencySymbol.textContent = selectedCurrencySymbol;
                    }
                    updateCustomCurrencyUI();
                }

                closeCurrencyDropdown();

                if (currencyTrigger) {
                    currencyTrigger.focus();
                }
            };

            const handleCurrencyKeyDown = (event) => {
                if (event.key === 'Escape') {
                    closeCurrencyDropdown();
                    if (currencyTrigger) {
                        currencyTrigger.focus();
                    }
                }
            };

            const formatPriceValue = (value = '') => {
                if (!value) {
                    return { formatted: '', numericString: '' };
                }

                const cleanedValue = value
                    .replace(/\s+/g, '')
                    .replace(/[^\d.,]/g, '');

                if (!cleanedValue) {
                    return { formatted: '', numericString: '' };
                }

                const lastComma = cleanedValue.lastIndexOf(',');
                const lastDot = cleanedValue.lastIndexOf('.');
                let decimalIndex = Math.max(lastComma, lastDot);

                if (decimalIndex > -1) {
                    const decimalCandidate = cleanedValue.slice(decimalIndex + 1);
                    const decimalDigits = decimalCandidate.replace(/[^\d]/g, '');
                    const hasGroupingSeparators = /[.,]/.test(decimalCandidate);
                    const isValidDecimal = decimalDigits.length <= 2 && !hasGroupingSeparators;

                    if (!isValidDecimal) {
                        decimalIndex = -1;
                    }
                }

                let integerSection = cleanedValue;
                let decimalSection = '';

                if (decimalIndex > -1) {
                    integerSection = cleanedValue.slice(0, decimalIndex);
                    decimalSection = cleanedValue.slice(decimalIndex + 1);
                }

                let integerPart = integerSection.replace(/[^\d]/g, '');
                integerPart = integerPart.replace(/^0+(?=\d)/, '');
                let decimalPart = decimalSection.replace(/[^\d]/g, '');

                if (decimalPart.length > 2) {
                    decimalPart = decimalPart.slice(0, 2);
                }

                if (!integerPart && !decimalPart) {
                    return { formatted: '', numericString: '' };
                }

                const formattedInteger = integerPart
                    ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    : '0';

                let formattedValue = formattedInteger;
                let numericString = integerPart || '0';

                if (decimalPart) {
                    formattedValue += `.${decimalPart}`;
                    numericString += `.${decimalPart}`;
                }

                if (!integerPart && decimalPart) {
                    formattedValue = `0.${decimalPart}`;
                    numericString = `0.${decimalPart}`;
                }

                if (!decimalPart && !integerPart) {
                    formattedValue = '';
                    numericString = '';
                }

                return { formatted: formattedValue, numericString };
            };

            const updatePriceInputFormatting = () => {
                if (!priceInput) {
                    return;
                }

                const { formatted, numericString } = formatPriceValue(priceInput.value);
                priceInput.value = formatted;
                priceInput.dataset.numericValue = numericString;

                if (document.activeElement === priceInput) {
                    const caretPosition = priceInput.value.length;
                    priceInput.setSelectionRange(caretPosition, caretPosition);
                }
            };

            const getNumericPriceValue = () => {
                if (!priceInput) {
                    return '';
                }

                if (typeof priceInput.dataset.numericValue === 'string') {
                    return priceInput.dataset.numericValue;
                }

                const { numericString } = formatPriceValue(priceInput.value);
                return numericString;
            };

            const resetPricingState = () => {
                selectedCurrency = 'MXN';
                selectedCurrencyLabel = 'Peso mexicano';
                selectedCurrencySymbol = '$';
                selectedCurrencyCode = 'MXN';
                isCurrencyDropdownOpen = false;
                resetPricingErrorState();
                if (priceInput) {
                    priceInput.value = '';
                    priceInput.dataset.numericValue = '';
                }
                if (currencySelect && currencySelect.options.length) {
                    const options = Array.from(currencySelect.options);
                    const defaultOption = options.find(option => (option.value || '').toUpperCase() === selectedCurrency) || options[0];
                    if (defaultOption) {
                        updateCurrencyState(defaultOption);
                    }
                } else {
                    updateCustomCurrencyUI();
                }
                closeCurrencyDropdown();
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
                    section.classList.toggle('properties-view-publish-details__step--active', isActive);
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
                } else if (step === 'pricing') {
                    updatePricingSummary();
                    resetPricingErrorState();
                    closeCurrencyDropdown();
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
                resetPricingState();
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
                resetPricingState();
                updateFeatureSummary();
                updateFeatureGroups();
                updatePricingSummary();
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
                    listItem.className = 'properties-view-publish-details__gallery-item';
                    listItem.draggable = true;
                    listItem.dataset.index = String(index);

                    const image = document.createElement('img');
                    image.className = 'properties-view-publish-details__gallery-thumb';
                    image.src = item.previewUrl;
                    image.alt = `Vista previa ${index + 1}`;

                    const overlay = document.createElement('div');
                    overlay.className = 'properties-view-publish-details__gallery-overlay';

                    const indexBadge = document.createElement('span');
                    indexBadge.className = 'properties-view-publish-details__gallery-index';
                    indexBadge.textContent = String(index + 1);

                    const removeButton = document.createElement('button');
                    removeButton.type = 'button';
                    removeButton.className = 'properties-view-publish-details__gallery-remove';
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

            if (currencySelect) {
                currencySelect.addEventListener('change', () => {
                    const selectedOption = currencySelect.options[currencySelect.selectedIndex];
                    updateCurrencyState(selectedOption);
                });
            }

            if (currencyTrigger) {
                currencyTrigger.addEventListener('click', event => {
                    event.preventDefault();
                    toggleCurrencyDropdown();
                });
            }

            currencyOptionItems.forEach(item => {
                item.addEventListener('click', event => {
                    event.preventDefault();
                    handleCurrencyOptionSelection(item);
                });

                item.addEventListener('keydown', event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleCurrencyOptionSelection(item);
                    }
                });
            });

            if (priceInput) {
                priceInput.addEventListener('input', () => {
                    resetPricingErrorState();
                    updatePriceInputFormatting();
                });

                priceInput.addEventListener('blur', () => {
                    updatePriceInputFormatting();
                });
            }

            if (detailsPrevButton) {
                detailsPrevButton.addEventListener('click', event => {
                    event.preventDefault();
                    showDetailsStep('basic');
                });
            }

            if (pricingPrevButton) {
                pricingPrevButton.addEventListener('click', event => {
                    event.preventDefault();
                    showDetailsStep('features');
                });
            }

            if (detailsForm) {
                detailsForm.addEventListener('submit', event => {
                    event.preventDefault();
                    if (currentDetailsStep === 'basic') {
                        showDetailsStep('features');
                        return;
                    }
                    if (currentDetailsStep === 'features') {
                        showDetailsStep('pricing');
                        return;
                    }

                    if (currentDetailsStep === 'pricing') {
                        updatePriceInputFormatting();

                        const numericString = getNumericPriceValue();
                        const numeric = Number(numericString);

                        if (!numericString || Number.isNaN(numeric) || numeric <= 0) {
                            if (pricingError) {
                                pricingError.hidden = false;
                            }
                            if (pricingInputGroup) {
                                pricingInputGroup.classList.add('has-error');
                            }
                            if (priceInput) {
                                priceInput.setAttribute('aria-invalid', 'true');
                                priceInput.focus();
                            }
                            return;
                        }

                        resetPricingErrorState();

                        const completionContext = {
                            type: selectedPropertyType,
                            typeLabel: selectedPropertyTypeLabel,
                            purpose: selectedPropertyPurpose,
                            purposeLabel: selectedPropertyPurposeLabel,
                            price: numericString,
                            priceValue: numeric,
                            currency: selectedCurrency,
                            currencyCode: selectedCurrencyCode,
                            currencyLabel: selectedCurrencyLabel,
                            billing: selectedPropertyPurpose === 'rentar' ? 'monthly' : 'total'
                        };

                        close();

                        if (typeof onComplete === 'function') {
                            onComplete(completionContext);
                        }
                    }
                });
            }

            updateFeatureSummary();
            showDetailsStep('basic');
            updateFeatureGroups();

            return { open, close, showStep: showDetailsStep };
        };

        const detailsModalController = createModalController(detailsModal, {
            onComplete: (context = {}) => {
                publishState = {
                    ...publishState,
                    purpose: context.purpose ?? publishState.purpose,
                    purposeLabel: context.purposeLabel ?? publishState.purposeLabel,
                    type: context.type ?? publishState.type,
                    typeLabel: context.typeLabel ?? publishState.typeLabel,
                    price: context.price ?? null,
                    priceValue: context.priceValue ?? null,
                    currency: context.currency ?? null,
                    currencyCode: context.currencyCode ?? null,
                    currencyLabel: context.currencyLabel ?? null,
                    billing: context.billing ?? null
                };
            }
        });

        let publishState = {
            purpose: null,
            purposeLabel: null,
            type: null,
            typeLabel: null,
            price: null,
            priceValue: null,
            currency: null,
            currencyCode: null,
            currencyLabel: null,
            billing: null
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
                step.classList.toggle('properties-view-modal-publish__step--active', isActive);
            });
            modal.dataset.currentStep = stepName;
        };

        const resetPublishState = () => {
            publishState = {
                purpose: null,
                purposeLabel: null,
                type: null,
                typeLabel: null,
                price: null,
                priceValue: null,
                currency: null,
                currencyCode: null,
                currencyLabel: null,
                billing: null
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
                if (detailsModalController) {
                    detailsModalController.open(detailsContext);
                }
            });
        }
    
    };

    global.ProfileProperties = { init };
})(window);
