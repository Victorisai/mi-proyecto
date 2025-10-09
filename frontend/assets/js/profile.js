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
            const pricingInputGroup = modalElement.querySelector('.publish-pricing__input-group');
            const pricingPrevButton = modalElement.querySelector('[data-pricing-prev]');
            const currencySelect = modalElement.querySelector('[data-pricing-currency-select]');
            const customCurrencySelect = modalElement.querySelector('[data-currency-select]');
            const currencyTrigger = modalElement.querySelector('[data-currency-trigger]');
            const currencyTriggerLabel = modalElement.querySelector('[data-currency-label]');
            const currencyOptionsList = modalElement.querySelector('[data-currency-options]');
            const currencyOptionItems = currencyOptionsList
                ? Array.from(currencyOptionsList.querySelectorAll('[data-currency-option]'))
                : [];
            const modalDialog = modalElement.querySelector('.modal__dialog');
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
                step.classList.toggle('modal-publish__step--active', isActive);
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

    const setupLeadsPanel = (panel) => {
        if (panel.dataset.section !== 'leads') {
            return;
        }

        const leadsData = [
            { id: 1, name: 'Juan Pérez', phone: '+52 999 123 4567', email: 'juan@mail.com', property: 'Lote Holbox · ID #L25', message: 'Estoy interesado en el lote cerca de la playa.', date: '2025-10-08', state: 'new' },
            { id: 2, name: 'Ana López', phone: '+52 998 111 2233', email: 'ana@correo.com', property: 'Casa Cancún · ID #A102', message: '¿Se puede visitar el sábado?', date: '2025-10-07', state: 'progress' },
            { id: 3, name: 'Carlos Ruiz', phone: '+52 984 321 7788', email: 'carlos@mx.com', property: 'Depto Centro · ID #D9', message: 'Busco financiamiento, ¿tienen opciones?', date: '2025-10-06', state: 'done' },
            { id: 4, name: 'María Gómez', phone: '+52 55 222 3344', email: 'maria@gm.com', property: 'Casa Cancún · ID #A102', message: 'Quiero más fotos y planos.', date: '2025-10-06', state: 'new' },
            { id: 5, name: 'Pedro Lara', phone: '+52 81 888 3344', email: 'pedro@ej.com', property: 'Lote Holbox · ID #L25', message: '¿Cuál es el precio final?', date: '2025-10-05', state: 'progress' },
            { id: 6, name: 'Laura Méndez', phone: '+52 442 555 8899', email: 'laura@me.com', property: 'Depto Centro · ID #D9', message: '¿Aceptan crédito bancario?', date: '2025-10-05', state: 'new' },
            { id: 7, name: 'Iván Soto', phone: '+52 33 777 9090', email: 'ivan@so.com', property: 'Casa Cancún · ID #A102', message: 'Estoy listo para ofertar.', date: '2025-10-04', state: 'progress' },
            { id: 8, name: 'Paula Ríos', phone: '+52 222 444 6666', email: 'paula@ri.com', property: 'Lote Holbox · ID #L25', message: 'Me interesa para inversión.', date: '2025-10-04', state: 'new' },
            { id: 9, name: 'Diego León', phone: '+52 55 444 8899', email: 'diego@le.com', property: 'Depto Centro · ID #D9', message: '¿Cuota de mantenimiento?', date: '2025-10-03', state: 'done' },
            { id: 10, name: 'Sofía Cruz', phone: '+52 81 333 1122', email: 'sofia@cr.com', property: 'Casa Cancún · ID #A102', message: 'Agendemos llamada mañana.', date: '2025-10-02', state: 'new' },
            { id: 11, name: 'Raúl Peña', phone: '+52 618 777 6655', email: 'raul@pe.com', property: 'Lote Holbox · ID #L25', message: '¿Se puede escriturar pronto?', date: '2025-10-02', state: 'progress' },
            { id: 12, name: 'Nadia Vega', phone: '+52 662 909 1122', email: 'nadia@ve.com', property: 'Depto Centro · ID #D9', message: 'Estoy comparando opciones.', date: '2025-10-01', state: 'new' }
        ];

        const pagination = { index: 0, size: 10 };
        const $ = (selector) => panel.querySelector(selector);

        const elements = {
            search: $('#leadSearch'),
            stateFilter: $('#leadStateFilter'),
            propertyFilter: $('#leadPropertyFilter'),
            dateRange: $('#leadDateRange'),
            tableBody: $('#leadRows'),
            countLabel: $('#leadsCount'),
            totalCount: $('#leadsTotal'),
            newCount: $('#leadsNew'),
            progressCount: $('#leadsProgress'),
            doneCount: $('#leadsDone'),
            rangeLabel: $('#leadsRange'),
            prevBtn: $('#leadsPrev'),
            nextBtn: $('#leadsNext'),
            exportBtn: $('#exportBtn'),
            drawer: $('#leadDrawer'),
            drawerName: $('#drawerName'),
            drawerEmail: $('#drawerEmail'),
            drawerPhone: $('#drawerPhone'),
            drawerProperty: $('#drawerProperty'),
            drawerDate: $('#drawerDate'),
            drawerState: $('#drawerState'),
            drawerMessage: $('#drawerMessage'),
            drawerMailto: $('#drawerMailto'),
            drawerWhats: $('#drawerWhats'),
            drawerMarkProgress: $('#drawerMarkProgress'),
            drawerMarkDone: $('#drawerMarkDone')
        };

        if (!elements.tableBody || !elements.search || !elements.stateFilter || !elements.propertyFilter || !elements.dateRange || !elements.prevBtn || !elements.nextBtn || !elements.exportBtn || !elements.drawer) {
            return;
        }

        const formatDate = (isoDate) => {
            const date = new Date(`${isoDate}T00:00:00`);
            return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
        };

        const buildStateBadge = (state) => {
            if (state === 'new') {
                return '<span class="leads-state leads-state--new">🟡 Nuevo</span>';
            }
            if (state === 'progress') {
                return '<span class="leads-state leads-state--progress">🟠 En seguimiento</span>';
            }
            return '<span class="leads-state leads-state--done">🟢 Cerrado</span>';
        };

        let lastFiltered = leadsData.slice();

        const closeDrawer = () => {
            if (!elements.drawer) {
                return;
            }
            elements.drawer.classList.remove('is-active');
            elements.drawer.setAttribute('aria-hidden', 'true');
        };

        const openDrawer = (id) => {
            const lead = leadsData.find((item) => item.id === id);
            if (!lead || !elements.drawer) {
                return;
            }

            if (elements.drawerName) {
                elements.drawerName.textContent = lead.name;
            }
            if (elements.drawerEmail) {
                elements.drawerEmail.innerHTML = `<a class="leads-link" href="mailto:${lead.email}">${lead.email}</a>`;
            }
            if (elements.drawerPhone) {
                elements.drawerPhone.innerHTML = `<a class="leads-link" href="tel:${lead.phone}">${lead.phone}</a>`;
            }
            if (elements.drawerProperty) {
                elements.drawerProperty.textContent = lead.property;
            }
            if (elements.drawerDate) {
                elements.drawerDate.textContent = new Date(`${lead.date}T00:00:00`).toLocaleDateString('es-MX');
            }
            if (elements.drawerState) {
                elements.drawerState.innerHTML = buildStateBadge(lead.state);
            }
            if (elements.drawerMessage) {
                elements.drawerMessage.textContent = lead.message;
            }
            if (elements.drawerMailto) {
                elements.drawerMailto.href = `mailto:${lead.email}?subject=Interés%20en%20${encodeURIComponent(lead.property)}`;
            }
            if (elements.drawerWhats) {
                const whatsappNumber = lead.phone.replace(/\D/g, '');
                elements.drawerWhats.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola ${lead.name}, vi tu interés en ${lead.property}`)}`;
            }
            if (elements.drawerMarkProgress) {
                elements.drawerMarkProgress.onclick = () => {
                    lead.state = 'progress';
                    closeDrawer();
                    renderTable();
                };
            }
            if (elements.drawerMarkDone) {
                elements.drawerMarkDone.onclick = () => {
                    lead.state = 'done';
                    closeDrawer();
                    renderTable();
                };
            }

            elements.drawer.classList.add('is-active');
            elements.drawer.setAttribute('aria-hidden', 'false');
        };

        const openWhatsApp = (id) => {
            const lead = leadsData.find((item) => item.id === id);
            if (!lead) {
                return;
            }
            const whatsappNumber = lead.phone.replace(/\D/g, '');
            window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola ${lead.name}, vi tu interés en ${lead.property}`)}`, '_blank');
        };

        const renderTable = () => {
            const query = (elements.search.value || '').trim().toLowerCase();
            const stateFilter = elements.stateFilter.value;
            const propertyFilter = elements.propertyFilter.value;
            const dateRange = elements.dateRange.value;

            let filtered = leadsData.filter((lead) => {
                const searchable = `${lead.name}${lead.email}${lead.phone}${lead.message}${lead.property}`.toLowerCase();
                const matchesQuery = !query || searchable.includes(query);
                const matchesState = stateFilter === 'all' || lead.state === stateFilter;
                const matchesProperty = propertyFilter === 'all' || lead.property === propertyFilter;

                let matchesDate = true;
                const today = new Date();
                const leadDate = new Date(`${lead.date}T00:00:00`);

                if (dateRange === 'today') {
                    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    matchesDate = leadDate >= start;
                } else if (dateRange === 'week') {
                    const start = new Date(today);
                    start.setDate(start.getDate() - 7);
                    matchesDate = leadDate >= start;
                } else if (dateRange === 'month') {
                    const start = new Date(today);
                    start.setMonth(start.getMonth() - 1);
                    matchesDate = leadDate >= start;
                }

                return matchesQuery && matchesState && matchesProperty && matchesDate;
            });

            lastFiltered = filtered.slice();

            const totalPages = Math.max(1, Math.ceil(filtered.length / pagination.size));
            pagination.index = Math.min(pagination.index, totalPages - 1);

            const start = pagination.index * pagination.size;
            const end = start + pagination.size;
            const pageRows = filtered.slice(start, end);

            elements.tableBody.innerHTML = pageRows.map((lead) => {
                const message = lead.message || '';
                const truncatedMessage = message.length > 48 ? `${message.slice(0, 48)}…` : message;
                return `
                    <tr>
                        <td>${lead.name}</td>
                        <td><a href="tel:${lead.phone}" class="leads-link">${lead.phone}</a></td>
                        <td><a href="mailto:${lead.email}" class="leads-link">${lead.email}</a></td>
                        <td>${lead.property}</td>
                        <td title="${message}">${truncatedMessage}</td>
                        <td>${formatDate(lead.date)}</td>
                        <td>${buildStateBadge(lead.state)}</td>
                        <td>
                            <div class="leads-row-actions">
                                <button class="leads-btn leads-btn--ghost leads-btn--icon" type="button" aria-label="Ver detalles" data-view="${lead.id}">👁</button>
                                <button class="leads-btn leads-btn--ghost leads-btn--icon" type="button" aria-label="Abrir WhatsApp" data-whats="${lead.id}">💬</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            if (elements.countLabel) {
                elements.countLabel.textContent = `Total: ${filtered.length}`;
            }
            if (elements.totalCount) {
                elements.totalCount.textContent = filtered.length;
            }
            if (elements.newCount) {
                elements.newCount.textContent = filtered.filter((lead) => lead.state === 'new').length;
            }
            if (elements.progressCount) {
                elements.progressCount.textContent = filtered.filter((lead) => lead.state === 'progress').length;
            }
            if (elements.doneCount) {
                elements.doneCount.textContent = filtered.filter((lead) => lead.state === 'done').length;
            }

            if (elements.rangeLabel) {
                const rangeStart = filtered.length === 0 ? 0 : Math.min(start + 1, filtered.length);
                const rangeEnd = Math.min(end, filtered.length);
                elements.rangeLabel.textContent = `Mostrando ${rangeStart}–${rangeEnd} de ${filtered.length}`;
            }

            elements.prevBtn.disabled = pagination.index === 0 || filtered.length === 0;
            elements.nextBtn.disabled = end >= filtered.length;

            elements.tableBody.querySelectorAll('[data-view]').forEach((button) => {
                button.addEventListener('click', () => openDrawer(Number(button.dataset.view)));
            });

            elements.tableBody.querySelectorAll('[data-whats]').forEach((button) => {
                button.addEventListener('click', () => openWhatsApp(Number(button.dataset.whats)));
            });
        };

        elements.search.addEventListener('input', () => {
            pagination.index = 0;
            renderTable();
        });

        elements.stateFilter.addEventListener('change', () => {
            pagination.index = 0;
            renderTable();
        });

        elements.propertyFilter.addEventListener('change', () => {
            pagination.index = 0;
            renderTable();
        });

        elements.dateRange.addEventListener('change', () => {
            pagination.index = 0;
            renderTable();
        });

        elements.prevBtn.addEventListener('click', () => {
            if (pagination.index > 0) {
                pagination.index -= 1;
                renderTable();
            }
        });

        elements.nextBtn.addEventListener('click', () => {
            pagination.index += 1;
            renderTable();
        });

        panel.querySelectorAll('[data-close]').forEach((element) => {
            element.addEventListener('click', closeDrawer);
        });

        elements.exportBtn.addEventListener('click', () => {
            const dataset = Array.isArray(lastFiltered) ? lastFiltered : leadsData;
            const rows = dataset.map((lead) => [
                lead.name,
                lead.phone,
                lead.email,
                lead.property,
                lead.message,
                lead.date,
                lead.state
            ]);
            const header = ['Nombre', 'Teléfono', 'Email', 'Propiedad', 'Mensaje', 'Fecha', 'Estado'];
            const csv = [header, ...rows]
                .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
                .join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'leads.csv';
            link.click();
            URL.revokeObjectURL(link.href);
        });

        renderTable();
    };

    const initializePanelFeatures = (panel) => {
        if (panel.dataset.section === 'propiedades') {
            setupPublishModal(panel);
        }
        if (panel.dataset.section === 'leads') {
            setupLeadsPanel(panel);
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
