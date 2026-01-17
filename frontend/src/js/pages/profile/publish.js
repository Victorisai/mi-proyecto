(function (global) {
    const subtypeCatalog = {
        residencial: [
            'Casa',
            'Departamento / Apartamento',
            'Estudio',
            'Loft',
            'Dúplex / Townhouse',
            'Villa',
            'Penthouse',
            'Cabaña / Chalet',
            'Casa en condominio',
            'Casa de campo / Quinta',
            'Residencia de lujo',
            'Tiny House',
            'Rancho / Hacienda habitacional'
        ],
        terrenos: [
            'Terreno urbano',
            'Terreno rústico / ejidal',
            'Lote residencial',
            'Terreno comercial',
            'Terreno industrial',
            'Lote dentro de desarrollo',
            'Macrolote',
            'Terreno frente al mar / beachfront'
        ],
        comercial: [
            'Local comercial',
            'Oficina',
            'Coworking',
            'Bodega / Almacenamiento',
            'Plaza comercial',
            'Hotel / Hostal',
            'Restaurante / Bar',
            'Consultorio / Clínica',
            'Terreno comercial',
            'Centro de distribución / Warehouse'
        ],
        industrial: [
            'Nave industrial',
            'Bodega industrial',
            'Parque industrial',
            'Terreno industrial',
            'Centro logístico',
            'Planta de producción',
            'Almacén a gran escala'
        ],
        especiales: [
            'Eco-cabañas',
            'Glamping / Domos',
            'Propiedad turística',
            'Finca agrícola',
            'Parcela agrícola',
            'Rancho ganadero',
            'Reserva ecológica',
            'Isla privada',
            'Propiedad frente al mar'
        ],
        desarrollos: [
            'Desarrollo horizontal',
            'Desarrollo vertical',
            'Preventas',
            'Masterplan',
            'Condo-hotel',
            'Fraccionamiento / Loteo residencial',
            'Macrodesarrollo'
        ]
    };

    const initPublishPanel = (panel) => {
        if (!panel || panel.dataset.publishInitialized === 'true') {
            return;
        }

        panel.dataset.publishInitialized = 'true';

        const heading = panel.querySelector('[data-publish-heading]');
        const purposeLabels = panel.querySelectorAll('[data-publish-purpose-label]');
        const typeLabels = panel.querySelectorAll('[data-publish-type-label]');
        const subtypeSelect = panel.querySelector('[data-publish-subtype]');
        const subtypeHelper = panel.querySelector('[data-publish-subtype-helper]');
        const subtypePreview = panel.querySelector('[data-publish-subtype-preview]');
        const selectedTypeTag = panel.querySelector('[data-publish-selected-type]');
        const titleInput = panel.querySelector('[data-publish-title]');
        const descriptionInput = panel.querySelector('[data-publish-description]');
        const continueButton = panel.querySelector('[data-publish-continue]');

        const formatSelection = (value, fallback) => (value && value.trim().length ? value : fallback);

        const updateSubtypePreview = () => {
            if (!subtypePreview) {
                return;
            }
            const currentOption = subtypeSelect ? subtypeSelect.options[subtypeSelect.selectedIndex] : null;
            const previewText = currentOption && currentOption.value ? currentOption.textContent : 'Pendiente de selección';
            subtypePreview.textContent = previewText;
        };

        const populateSubtypeOptions = (typeKey) => {
            if (!subtypeSelect) {
                return;
            }

            const options = subtypeCatalog[typeKey] || [];
            subtypeSelect.innerHTML = '';

            if (!options.length) {
                const placeholder = document.createElement('option');
                placeholder.textContent = 'Selecciona primero un tipo';
                placeholder.value = '';
                placeholder.disabled = true;
                placeholder.selected = true;
                subtypeSelect.appendChild(placeholder);
                subtypeSelect.disabled = true;
                if (subtypeHelper) {
                    subtypeHelper.textContent = 'Elige un tipo de propiedad para ver los subtipos disponibles.';
                }
                updateSubtypePreview();
                return;
            }

            const placeholder = document.createElement('option');
            placeholder.textContent = 'Selecciona el subtipo';
            placeholder.value = '';
            placeholder.disabled = true;
            placeholder.selected = true;
            subtypeSelect.appendChild(placeholder);

            options.forEach((subtype) => {
                const option = document.createElement('option');
                option.value = subtype;
                option.textContent = subtype;
                subtypeSelect.appendChild(option);
            });

            subtypeSelect.disabled = false;
            if (subtypeHelper) {
                subtypeHelper.textContent = 'Elige el subtipo que mejor describe tu inmueble.';
            }
            updateSubtypePreview();
        };

        const applySelection = (detail = {}) => {
            const purposeText = formatSelection(detail.purposeLabel, 'Propósito no definido');
            const typeText = formatSelection(detail.typeLabel, 'Tipo de propiedad no definido');

            purposeLabels.forEach((element) => {
                element.textContent = purposeText;
            });

            typeLabels.forEach((element) => {
                element.textContent = typeText;
            });

            if (selectedTypeTag) {
                selectedTypeTag.textContent = detail.typeLabel ? `Tipo: ${detail.typeLabel}` : 'Define el tipo desde el modal';
            }

            if (heading) {
                heading.textContent = detail.typeLabel ? `Publicando ${detail.typeLabel.toLowerCase()}` : 'Configura tu anuncio';
            }

            populateSubtypeOptions(detail.type);
        };

        const handleContinue = (event) => {
            event.preventDefault();

            const detail = {
                purpose: panel.dataset.publishPurpose || '',
                purposeLabel: panel.dataset.publishPurposeLabel || '',
                type: panel.dataset.publishType || '',
                typeLabel: panel.dataset.publishTypeLabel || '',
                subtype: subtypeSelect ? subtypeSelect.value : '',
                title: titleInput ? titleInput.value.trim() : '',
                description: descriptionInput ? descriptionInput.value.trim() : ''
            };

            document.dispatchEvent(new CustomEvent('publish:location:start', { detail }));
        };

        if (subtypeSelect) {
            subtypeSelect.addEventListener('change', updateSubtypePreview);
        }

        if (continueButton) {
            continueButton.addEventListener('click', handleContinue);
        }

        panel.addEventListener('publish:open', (event) => {
            applySelection(event.detail || {});
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        applySelection({
            purposeLabel: panel.dataset.publishPurposeLabel,
            typeLabel: panel.dataset.publishTypeLabel,
            type: panel.dataset.publishType
        });
    };

    const initLocationPanel = (panel) => {
        if (!panel || panel.dataset.publishLocationInitialized === 'true') {
            return;
        }

        panel.dataset.publishLocationInitialized = 'true';

        const purposeTargets = panel.querySelectorAll('[data-location-purpose]');
        const typeTargets = panel.querySelectorAll('[data-location-type]');
        const subtypeTargets = panel.querySelectorAll('[data-location-subtype]');
        const titleTargets = panel.querySelectorAll('[data-location-title]');
        const heading = panel.querySelector('[data-location-heading]');
        const backButton = panel.querySelector('[data-publish-location-back]');
        const saveButton = panel.querySelector('[data-publish-location-save]');
        const countryInput = panel.querySelector('[data-location-country]');
        const streetInput = panel.querySelector('[data-location-street]');
        const stateInput = panel.querySelector('[data-location-state]');
        const cityInput = panel.querySelector('[data-location-city]');

        const collectLocationDetail = () => ({
            purpose: panel.dataset.publishPurpose || '',
            purposeLabel: panel.dataset.publishPurposeLabel || '',
            type: panel.dataset.publishType || '',
            typeLabel: panel.dataset.publishTypeLabel || '',
            subtype: panel.dataset.publishSubtype || '',
            title: panel.dataset.publishTitle || '',
            description: panel.dataset.publishDescription || '',
            country: countryInput ? countryInput.value.trim() : '',
            street: streetInput ? streetInput.value.trim() : '',
            state: stateInput ? stateInput.value.trim() : '',
            city: cityInput ? cityInput.value.trim() : ''
        });

        const applyLocationContext = (detail = {}) => {
            const purpose = detail.purposeLabel || panel.dataset.publishPurposeLabel || 'Propósito no definido';
            const type = detail.typeLabel || panel.dataset.publishTypeLabel || 'Tipo no definido';
            const subtype = detail.subtype || panel.dataset.publishSubtype || 'Subtipo no definido';
            const title = detail.title || panel.dataset.publishTitle || 'Propiedad sin título';
            const country = detail.country || panel.dataset.locationCountry || '';
            const state = detail.state || panel.dataset.locationState || '';
            const city = detail.city || panel.dataset.locationCity || '';
            const street = detail.street || panel.dataset.locationStreet || '';

            panel.dataset.locationCountry = country;
            panel.dataset.locationState = state;
            panel.dataset.locationCity = city;
            panel.dataset.locationStreet = street;

            purposeTargets.forEach((element) => {
                element.textContent = purpose;
            });

            typeTargets.forEach((element) => {
                element.textContent = type;
            });

            subtypeTargets.forEach((element) => {
                element.textContent = subtype.trim().length ? subtype : 'Subtipo pendiente';
            });

            titleTargets.forEach((element) => {
                element.textContent = title.trim().length ? title : 'Propiedad sin título';
            });

            if (heading) {
                heading.textContent = title.trim().length ? `Ubicación para: ${title}` : 'Define la ubicación de tu propiedad';
            }

            if (countryInput && typeof countryInput.value === 'string') {
                countryInput.value = country;
            }

            if (streetInput && typeof streetInput.value === 'string') {
                streetInput.value = street;
            }

            if (stateInput && typeof stateInput.value === 'string') {
                stateInput.value = state;
            }

            if (cityInput && typeof cityInput.value === 'string') {
                cityInput.value = city;
            }
        };

        if (backButton) {
            backButton.addEventListener('click', (event) => {
                event.preventDefault();

                const detail = {
                    purposeLabel: panel.dataset.publishPurposeLabel || '',
                    typeLabel: panel.dataset.publishTypeLabel || '',
                    type: panel.dataset.publishType || '',
                    subtype: panel.dataset.publishSubtype || '',
                    title: panel.dataset.publishTitle || '',
                    description: panel.dataset.publishDescription || ''
                };

                document.dispatchEvent(new CustomEvent('publish:location:back', { detail }));
            });
        }

        panel.addEventListener('publish-location:open', (event) => {
            const detail = event.detail || {};

            panel.dataset.publishPurpose = detail.purpose || panel.dataset.publishPurpose || '';
            panel.dataset.publishPurposeLabel = detail.purposeLabel || panel.dataset.publishPurposeLabel || '';
            panel.dataset.publishType = detail.type || panel.dataset.publishType || '';
            panel.dataset.publishTypeLabel = detail.typeLabel || panel.dataset.publishTypeLabel || '';
            panel.dataset.publishSubtype = detail.subtype || panel.dataset.publishSubtype || '';
            panel.dataset.publishTitle = detail.title || panel.dataset.publishTitle || '';
            panel.dataset.publishDescription = detail.description || panel.dataset.publishDescription || '';
            panel.dataset.publishPurpose = detail.purpose || panel.dataset.publishPurpose || '';

            applyLocationContext(detail);
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        applyLocationContext({
            purposeLabel: panel.dataset.publishPurposeLabel,
            typeLabel: panel.dataset.publishTypeLabel,
            subtype: panel.dataset.publishSubtype,
            title: panel.dataset.publishTitle,
            country: panel.dataset.locationCountry,
            state: panel.dataset.locationState,
            city: panel.dataset.locationCity,
            street: panel.dataset.locationStreet
        });

        if (saveButton) {
            saveButton.addEventListener('click', (event) => {
                event.preventDefault();

                const detail = collectLocationDetail();
                document.dispatchEvent(new CustomEvent('publish:characteristics:start', { detail }));
            });
        }
    };

    const initCharacteristicsPanel = (panel) => {
        if (!panel || panel.dataset.publishCharacteristicsInitialized === 'true') {
            return;
        }

        panel.dataset.publishCharacteristicsInitialized = 'true';

        const purposeTargets = panel.querySelectorAll('[data-characteristics-purpose]');
        const typeTargets = panel.querySelectorAll('[data-characteristics-type]');
        const subtypeTargets = panel.querySelectorAll('[data-characteristics-subtype]');
        const titleTargets = panel.querySelectorAll('[data-characteristics-title]');
        const locationTargets = panel.querySelectorAll('[data-characteristics-location]');
        const heading = panel.querySelector('[data-characteristics-heading]');
        const typeBadge = panel.querySelector('[data-characteristics-type-label]');
        const emptyGroup = panel.querySelector('[data-characteristics-empty]');
        const typeGroups = panel.querySelectorAll('[data-characteristics-group]');
        const backButton = panel.querySelector('[data-characteristics-back]');
        const continueButton = panel.querySelector('[data-characteristics-continue]');

        const applyCharacteristicsContext = (detail = {}) => {
            const purpose = detail.purposeLabel || panel.dataset.publishPurposeLabel || 'Propósito no definido';
            const typeLabel = detail.typeLabel || panel.dataset.publishTypeLabel || 'Tipo no definido';
            const subtype = detail.subtype || panel.dataset.publishSubtype || 'Subtipo no definido';
            const title = detail.title || panel.dataset.publishTitle || 'Propiedad sin título';
            const country = detail.country || panel.dataset.locationCountry || '';
            const state = detail.state || panel.dataset.locationState || '';
            const city = detail.city || panel.dataset.locationCity || '';
            const street = detail.street || panel.dataset.locationStreet || '';
            const locationText = [street, city, state, country].filter(Boolean).join(', ') || 'Ubicación pendiente';

            panel.dataset.publishPurpose = detail.purpose || panel.dataset.publishPurpose || '';
            panel.dataset.publishPurposeLabel = purpose;
            panel.dataset.publishType = detail.type || panel.dataset.publishType || '';
            panel.dataset.publishTypeLabel = typeLabel;
            panel.dataset.publishSubtype = subtype;
            panel.dataset.publishTitle = title;
            panel.dataset.locationCountry = country;
            panel.dataset.locationState = state;
            panel.dataset.locationCity = city;
            panel.dataset.locationStreet = street;

            purposeTargets.forEach((element) => {
                element.textContent = purpose;
            });

            typeTargets.forEach((element) => {
                element.textContent = typeLabel;
            });

            subtypeTargets.forEach((element) => {
                element.textContent = subtype.trim().length ? subtype : 'Subtipo pendiente';
            });

            titleTargets.forEach((element) => {
                element.textContent = title.trim().length ? title : 'Propiedad sin título';
            });

            locationTargets.forEach((element) => {
                element.textContent = locationText;
            });

            if (heading) {
                heading.textContent = title.trim().length ? `Características para: ${title}` : 'Define las características del inmueble';
            }

            if (typeBadge) {
                typeBadge.textContent = detail.typeLabel || panel.dataset.publishTypeLabel || 'Define un tipo en el paso anterior';
            }

            if (!typeGroups.length || !emptyGroup) {
                return;
            }

            const typeKey = detail.type || panel.dataset.publishType || '';
            let hasMatch = false;

            typeGroups.forEach((group) => {
                const isMatch = group.dataset.characteristicsGroup === typeKey;
                group.hidden = !isMatch;
                if (isMatch) {
                    hasMatch = true;
                }
            });

            emptyGroup.hidden = hasMatch;
        };

        panel.addEventListener('publish-characteristics:open', (event) => {
            const detail = event.detail || {};
            applyCharacteristicsContext(detail);
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        if (backButton) {
            backButton.addEventListener('click', (event) => {
                event.preventDefault();

                const detail = {
                    purpose: panel.dataset.publishPurpose || '',
                    purposeLabel: panel.dataset.publishPurposeLabel || '',
                    type: panel.dataset.publishType || '',
                    typeLabel: panel.dataset.publishTypeLabel || '',
                    subtype: panel.dataset.publishSubtype || '',
                    title: panel.dataset.publishTitle || '',
                    description: panel.dataset.publishDescription || '',
                    country: panel.dataset.locationCountry || '',
                    state: panel.dataset.locationState || '',
                    city: panel.dataset.locationCity || '',
                    street: panel.dataset.locationStreet || ''
                };

                document.dispatchEvent(new CustomEvent('publish:characteristics:back', { detail }));
            });
        }

        if (continueButton) {
            continueButton.addEventListener('click', (event) => {
                event.preventDefault();

                const detail = {
                    purpose: panel.dataset.publishPurpose || '',
                    purposeLabel: panel.dataset.publishPurposeLabel || '',
                    type: panel.dataset.publishType || '',
                    typeLabel: panel.dataset.publishTypeLabel || '',
                    subtype: panel.dataset.publishSubtype || '',
                    title: panel.dataset.publishTitle || '',
                    description: panel.dataset.publishDescription || '',
                    country: panel.dataset.locationCountry || '',
                    state: panel.dataset.locationState || '',
                    city: panel.dataset.locationCity || '',
                    street: panel.dataset.locationStreet || ''
                };

                document.dispatchEvent(new CustomEvent('publish:media:start', { detail }));
            });
        }

        applyCharacteristicsContext({
            purposeLabel: panel.dataset.publishPurposeLabel,
            typeLabel: panel.dataset.publishTypeLabel,
            subtype: panel.dataset.publishSubtype,
            title: panel.dataset.publishTitle,
            country: panel.dataset.locationCountry,
            state: panel.dataset.locationState,
            city: panel.dataset.locationCity,
            street: panel.dataset.locationStreet
        });
    };

    const initMediaPanel = (panel) => {
        if (!panel || panel.dataset.publishMediaInitialized === 'true') {
            return;
        }

        panel.dataset.publishMediaInitialized = 'true';

        const purposeTargets = panel.querySelectorAll('[data-media-purpose]');
        const typeTargets = panel.querySelectorAll('[data-media-type]');
        const subtypeTargets = panel.querySelectorAll('[data-media-subtype]');
        const grid = panel.querySelector('[data-media-grid]');
        const dropzoneItem = panel.querySelector('[data-media-dropzone-item]');
        const dropzoneButton = panel.querySelector('[data-media-dropzone]');
        const fileInput = panel.querySelector('[data-media-input]');
        const errorMessage = panel.querySelector('[data-media-error]');
        const backButton = panel.querySelector('[data-media-back]');
        const continueButton = panel.querySelector('[data-media-continue]');

        const MAX_FILES = 50;
        const MIN_FILES = 5;
        const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
        const isDesktop = () => window.matchMedia('(min-width: 993px)').matches;

        let images = [];
        let showAll = false;
        let dragState = null;
        const rowsCollapsed = 2;

        const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const clearError = () => {
            if (errorMessage) {
                errorMessage.textContent = '';
                errorMessage.hidden = true;
            }
        };

        const showError = (message) => {
            if (errorMessage) {
                errorMessage.textContent = message;
                errorMessage.hidden = false;
            }
        };

        const updateContinueState = () => {
            if (continueButton) {
                continueButton.disabled = images.length < MIN_FILES;
            }
        };

        const normalizePrimaryFromOrder = () => {
            if (!images.length) {
                return;
            }
            images = images.map((image, index) => ({
                ...image,
                isPrimary: index === 0
            }));
        };

        const renderAfterAction = () => {
            renderPreviews({ preserveScroll: window.matchMedia('(max-width: 992px)').matches });
        };

        const setPrimary = (id) => {
            const index = images.findIndex((image) => image.id === id);
            if (index === -1) {
                return;
            }
            const [primary] = images.splice(index, 1);
            images.unshift(primary);
            normalizePrimaryFromOrder();
            renderAfterAction();
        };

        const rotateImage = (id) => {
            images = images.map((image) => {
                if (image.id !== id) {
                    return image;
                }
                return { ...image, rotation: (image.rotation + 90) % 360 };
            });
            renderAfterAction();
        };

        const removeImage = (id) => {
            const target = images.find((image) => image.id === id);
            if (target && target.url) {
                URL.revokeObjectURL(target.url);
            }
            images = images.filter((image) => image.id !== id);
            normalizePrimaryFromOrder();
            renderAfterAction();
        };

        const applyOrder = (orderedIds) => {
            const orderMap = new Map(images.map((image) => [image.id, image]));
            const reordered = orderedIds.map((id) => orderMap.get(id)).filter(Boolean);

            if (showAll) {
                images = reordered;
            } else {
                const remaining = images.filter((image) => !orderedIds.includes(image.id));
                images = [...reordered, ...remaining];
            }

            normalizePrimaryFromOrder();
        };

        const handleFiles = (fileList) => {
            clearError();

            if (!fileList || !fileList.length) {
                return;
            }

            const files = Array.from(fileList);
            const invalidFiles = files.filter((file) => !ACCEPTED_TYPES.includes(file.type));
            if (invalidFiles.length) {
                showError('Solo se aceptan archivos JPG o PNG.');
            }

            const validFiles = files.filter((file) => ACCEPTED_TYPES.includes(file.type));
            const availableSlots = MAX_FILES - images.length;

            if (availableSlots <= 0) {
                showError('Alcanzaste el máximo de 50 fotos permitidas.');
                return;
            }

            const filesToAdd = validFiles.slice(0, availableSlots);
            if (filesToAdd.length < validFiles.length) {
                showError('Solo puedes cargar hasta 50 fotos.');
            }

            const newItems = filesToAdd.map((file) => ({
                id: createId(),
                file,
                url: URL.createObjectURL(file),
                caption: '',
                rotation: 0,
                isPrimary: false
            }));

            images = [...images, ...newItems];
            normalizePrimaryFromOrder();
            renderPreviews();
        };

        const createControlButton = (label, iconMarkup, action) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'publish-media__control-btn';
            button.setAttribute('aria-label', label);
            button.dataset.action = action;
            button.innerHTML = iconMarkup;
            return button;
        };

        const createImageCard = (image) => {
            const item = document.createElement('div');
            item.className = 'publish-media__item publish-media__preview';
            item.dataset.imageId = image.id;

            const media = document.createElement('div');
            media.className = 'publish-media__media';

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = 'Vista previa de la foto del inmueble';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.className = 'publish-media__img';
            img.style.transform = `rotate(${image.rotation}deg)`;

            const controls = document.createElement('div');
            controls.className = 'publish-media__controls';

            const starIcon = `
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17l-5.5 3.2 1-6.2L3 9.6l6.2-.9L12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                </svg>`;
            const rotateIcon = `
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M20 11a8 8 0 1 1-2.3-5.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M20 4v6h-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
            const deleteIcon = `
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 7h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>`;

            const primaryButton = createControlButton('Marcar como foto principal', starIcon, 'primary');
            if (image.isPrimary) {
                primaryButton.classList.add('is-active');
                primaryButton.setAttribute('aria-pressed', 'true');
            }

            controls.appendChild(primaryButton);
            controls.appendChild(createControlButton('Rotar foto', rotateIcon, 'rotate'));
            controls.appendChild(createControlButton('Eliminar foto', deleteIcon, 'remove'));

            if (image.isPrimary) {
                const badge = document.createElement('div');
                badge.className = 'publish-media__badge';
                badge.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17l-5.5 3.2 1-6.2L3 9.6l6.2-.9L12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                    </svg>
                    Foto principal`;
                media.appendChild(badge);
            }

            media.appendChild(img);

            item.appendChild(media);
            item.appendChild(controls);

            item.addEventListener('pointerdown', (event) => {
                if (event.button !== undefined && event.button !== 0) {
                    return;
                }
                if (event.target.closest('button') || event.target.closest('input')) {
                    return;
                }
                if (!isDesktop() || event.pointerType === 'touch') {
                    return;
                }
                startDrag(event, item);
            });

            controls.addEventListener('click', (event) => {
                const actionTarget = event.target.closest('button');
                if (!actionTarget) {
                    return;
                }
                isInteracting = true;
                window.setTimeout(() => {
                    isInteracting = false;
                }, 300);
                const action = actionTarget.dataset.action;
                if (action === 'primary') {
                    setPrimary(image.id);
                }
                if (action === 'rotate') {
                    rotateImage(image.id);
                }
                if (action === 'remove') {
                    removeImage(image.id);
                }
            });

            return item;
        };

        const createMoreCard = (count) => {
            const item = document.createElement('div');
            item.className = 'publish-media__item publish-media__more';

            const media = document.createElement('div');
            media.className = 'publish-media__media';
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'publish-media__more-btn';
            button.innerHTML = `
                <span class="publish-media__more-count">+${count}</span>
                <span class="publish-media__more-label">Ver más fotos</span>`;
            button.addEventListener('click', () => {
                showAll = true;
                renderPreviews();
            });
            media.appendChild(button);

            item.appendChild(media);
            return item;
        };

        const createLessLink = () => {
            const wrap = document.createElement('div');
            wrap.className = 'publish-media__less';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'publish-media__less-btn';
            btn.textContent = 'Ver menos';

            btn.addEventListener('click', () => {
                showAll = false;

                const preserveScroll = window.matchMedia('(max-width: 992px)').matches;
                renderPreviews({ preserveScroll });
            });

            wrap.appendChild(btn);
            return wrap;
        };

        const getGridColumns = () => {
            if (!grid) {
                return 1;
            }
            const template = window.getComputedStyle(grid).gridTemplateColumns;
            if (!template || template === 'none') {
                return 1;
            }
            const columns = template.split(' ').filter(Boolean).length;
            return columns || 1;
        };

        const debounce = (callback, delay = 150) => {
            let timerId;
            return (...args) => {
                window.clearTimeout(timerId);
                timerId = window.setTimeout(() => callback(...args), delay);
            };
        };

        let isInteracting = false;
        let lastViewportWidth = window.innerWidth;
        let lastBreakpointIsDesktop = window.matchMedia('(min-width: 993px)').matches;

        const shouldRerenderOnResize = () => {
            const currentWidth = window.innerWidth;
            const isDesktopNow = window.matchMedia('(min-width: 993px)').matches;

            const widthChanged = Math.abs(currentWidth - lastViewportWidth) > 2;
            const breakpointChanged = isDesktopNow !== lastBreakpointIsDesktop;

            if (isInteracting && !breakpointChanged) {
                return false;
            }

            if (!widthChanged && !breakpointChanged) {
                return false;
            }

            lastViewportWidth = currentWidth;
            lastBreakpointIsDesktop = isDesktopNow;
            return true;
        };

        const getDraggableCards = (draggedItem, placeholder) => {
            if (!grid) {
                return [];
            }
            return Array.from(grid.querySelectorAll('.publish-media__item[data-image-id]')).filter(
                (card) => card !== draggedItem && card !== placeholder && card.dataset.imageId
            );
        };

        const renderPreviews = ({ preserveScroll = false } = {}) => {
            if (!grid || !dropzoneItem) {
                return;
            }

            const scrollPosition = preserveScroll ? { x: window.scrollX, y: window.scrollY } : null;
            const isMobile = window.matchMedia('(max-width: 992px)').matches;
            if (isMobile) {
                dropzoneItem.classList.toggle('publish-media__dropzone--full', images.length === 0);
                dropzoneItem.classList.toggle('publish-media__dropzone--cell', images.length > 0);
            } else {
                dropzoneItem.classList.remove('publish-media__dropzone--full', 'publish-media__dropzone--cell');
            }

            grid.innerHTML = '';
            grid.appendChild(dropzoneItem);

            const columns = getGridColumns();
            const maxCells = Math.max(1, columns * rowsCollapsed);
            const previewCapacity = Math.max(0, maxCells - 1);
            const hasOverflow = images.length > previewCapacity;

            if (!hasOverflow) {
                showAll = false;
            }

            let visibleImages = images;
            if (!showAll && hasOverflow) {
                const visibleImagesCount = Math.max(0, maxCells - 2);
                visibleImages = images.slice(0, visibleImagesCount);
            }

            visibleImages.forEach((image) => {
                grid.appendChild(createImageCard(image));
            });

            if (!showAll && hasOverflow) {
                const hiddenCount = images.length - visibleImages.length;
                grid.appendChild(createMoreCard(hiddenCount));
            }

            if (showAll && hasOverflow) {
                grid.appendChild(createLessLink());
            }

            const isAtMax = images.length >= MAX_FILES;
            if (dropzoneItem) {
                dropzoneItem.classList.toggle('publish-media__dropzone--disabled', isAtMax);
                dropzoneItem.setAttribute('aria-disabled', String(isAtMax));
            }
            if (dropzoneButton) {
                dropzoneButton.disabled = isAtMax;
            }
            if (fileInput) {
                fileInput.disabled = isAtMax;
            }

            updateContinueState();
            if (scrollPosition) {
                window.requestAnimationFrame(() => {
                    window.scrollTo(scrollPosition.x, scrollPosition.y);
                });
            }
        };

        const startDrag = (event, item) => {
            if (dragState || !grid) {
                return;
            }
            if (!isDesktop() || event.pointerType === 'touch') {
                return;
            }

            const id = item.dataset.imageId;
            if (!id) {
                return;
            }

            event.preventDefault();

            const rect = item.getBoundingClientRect();
            const placeholder = document.createElement('div');
            placeholder.className = 'publish-media__item publish-media__item--placeholder';
            placeholder.style.height = `${rect.height}px`;

            item.classList.add('is-dragging');
            item.style.width = `${rect.width}px`;
            item.style.height = `${rect.height}px`;
            item.style.left = `${rect.left}px`;
            item.style.top = `${rect.top}px`;

            grid.insertBefore(placeholder, item);
            document.body.appendChild(item);

            dragState = {
                id,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top,
                placeholder,
                lastPlacementKey: null
            };

            item.setPointerCapture(event.pointerId);

            let moveRafId = null;
            let pendingMoveEvent = null;

            const handleMove = (moveEvent) => {
                if (!dragState) {
                    return;
                }
                pendingMoveEvent = moveEvent;
                if (moveRafId) {
                    return;
                }
                moveRafId = window.requestAnimationFrame(() => {
                    moveRafId = null;
                    if (!dragState || !pendingMoveEvent) {
                        return;
                    }
                    const { clientX, clientY } = pendingMoveEvent;
                    pendingMoveEvent = null;

                    item.style.left = `${clientX - dragState.offsetX}px`;
                    item.style.top = `${clientY - dragState.offsetY}px`;

                    const cards = getDraggableCards(item, dragState.placeholder);
                    if (!cards.length) {
                        return;
                    }

                    const firstCard = cards[0];
                    const lastCard = cards[cards.length - 1];
                    const firstRect = firstCard.getBoundingClientRect();
                    const lastRect = lastCard.getBoundingClientRect();

                    if (clientY < firstRect.top + firstRect.height * 0.25) {
                        if (dragState.lastPlacementKey !== 'start') {
                            firstCard.before(dragState.placeholder);
                            dragState.lastPlacementKey = 'start';
                        }
                        return;
                    }

                    if (clientY > lastRect.bottom - lastRect.height * 0.25) {
                        if (dragState.lastPlacementKey !== 'end') {
                            lastCard.after(dragState.placeholder);
                            dragState.lastPlacementKey = 'end';
                        }
                        return;
                    }

                    let closest = null;
                    let closestRect = null;
                    let closestDistance = Number.POSITIVE_INFINITY;

                    cards.forEach((card) => {
                        const rect = card.getBoundingClientRect();
                        const cx = rect.left + rect.width / 2;
                        const cy = rect.top + rect.height / 2;
                        const distance =
                            (cx - clientX) * (cx - clientX) + (cy - clientY) * (cy - clientY);
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closest = card;
                            closestRect = rect;
                        }
                    });

                    if (!closest || !closestRect) {
                        return;
                    }

                    const centerX = closestRect.left + closestRect.width / 2;
                    const centerY = closestRect.top + closestRect.height / 2;
                    const isSameRow = Math.abs(clientY - centerY) < closestRect.height * 0.35;
                    const shouldInsertAfter = isSameRow ? clientX > centerX : clientY > centerY;
                    const placementKey = `${closest.dataset.imageId}:${shouldInsertAfter ? 'after' : 'before'}`;

                    if (dragState.lastPlacementKey === placementKey) {
                        return;
                    }

                    if (shouldInsertAfter) {
                        closest.after(dragState.placeholder);
                    } else {
                        closest.before(dragState.placeholder);
                    }
                    dragState.lastPlacementKey = placementKey;
                });
            };

            const handleEnd = () => {
                if (!dragState) {
                    return;
                }
                if (moveRafId) {
                    window.cancelAnimationFrame(moveRafId);
                    moveRafId = null;
                }
                pendingMoveEvent = null;

                item.classList.remove('is-dragging');
                item.style.width = '';
                item.style.height = '';
                item.style.left = '';
                item.style.top = '';

                const orderedIds = Array.from(grid.children).reduce((acc, element) => {
                    if (element === dragState.placeholder) {
                        acc.push(dragState.id);
                        return acc;
                    }
                    if (element.dataset && element.dataset.imageId) {
                        acc.push(element.dataset.imageId);
                    }
                    return acc;
                }, []);

                dragState.placeholder.replaceWith(item);
                item.removeEventListener('pointermove', handleMove);
                item.removeEventListener('pointerup', handleEnd);
                item.removeEventListener('pointercancel', handleEnd);
                item.removeEventListener('lostpointercapture', handleEnd);
                dragState = null;
                applyOrder(orderedIds);
                renderPreviews();
            };

            item.addEventListener('pointermove', handleMove);
            item.addEventListener('pointerup', handleEnd, { once: true });
            item.addEventListener('pointercancel', handleEnd, { once: true });
            item.addEventListener('lostpointercapture', handleEnd, { once: true });
        };

        const applyMediaContext = (detail = {}) => {
            const purpose = detail.purposeLabel || panel.dataset.publishPurposeLabel || 'Propósito pendiente';
            const typeLabel = detail.typeLabel || panel.dataset.publishTypeLabel || 'Tipo pendiente';
            const subtype = detail.subtype || panel.dataset.publishSubtype || 'Subtipo pendiente';

            purposeTargets.forEach((element) => {
                element.textContent = purpose;
            });
            typeTargets.forEach((element) => {
                element.textContent = typeLabel;
            });
            subtypeTargets.forEach((element) => {
                element.textContent = subtype.trim().length ? subtype : 'Subtipo pendiente';
            });
        };

        if (dropzoneButton && fileInput) {
            dropzoneButton.addEventListener('click', () => {
                if (!fileInput.disabled) {
                    fileInput.click();
                }
            });

            fileInput.addEventListener('change', (event) => {
                handleFiles(event.target.files);
                fileInput.value = '';
            });
        }

        if (dropzoneItem) {
            dropzoneItem.addEventListener('dragover', (event) => {
                event.preventDefault();
                dropzoneItem.classList.add('publish-media__dropzone--active');
            });

            dropzoneItem.addEventListener('dragleave', () => {
                dropzoneItem.classList.remove('publish-media__dropzone--active');
            });

            dropzoneItem.addEventListener('drop', (event) => {
                event.preventDefault();
                dropzoneItem.classList.remove('publish-media__dropzone--active');
                handleFiles(event.dataTransfer.files);
            });
        }

        if (backButton) {
            backButton.addEventListener('click', (event) => {
                event.preventDefault();

                const detail = {
                    purpose: panel.dataset.publishPurpose || '',
                    purposeLabel: panel.dataset.publishPurposeLabel || '',
                    type: panel.dataset.publishType || '',
                    typeLabel: panel.dataset.publishTypeLabel || '',
                    subtype: panel.dataset.publishSubtype || '',
                    title: panel.dataset.publishTitle || '',
                    description: panel.dataset.publishDescription || '',
                    country: panel.dataset.locationCountry || '',
                    state: panel.dataset.locationState || '',
                    city: panel.dataset.locationCity || '',
                    street: panel.dataset.locationStreet || ''
                };

                document.dispatchEvent(new CustomEvent('publish:media:back', { detail }));
            });
        }

        panel.addEventListener('publish-media:open', (event) => {
            const detail = event.detail || {};
            applyMediaContext(detail);
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        const handleResize = debounce(() => {
            if (!shouldRerenderOnResize()) {
                return;
            }
            renderPreviews();
        }, 200);

        window.addEventListener('resize', handleResize, { passive: true });
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize, { passive: true });
        }

        applyMediaContext({
            purposeLabel: panel.dataset.publishPurposeLabel,
            typeLabel: panel.dataset.publishTypeLabel,
            subtype: panel.dataset.publishSubtype
        });

        renderPreviews();
    };

    const init = (panel) => {
        if (!panel) {
            return;
        }

        if (panel.dataset.section === 'publicar') {
            initPublishPanel(panel);
            return;
        }

        if (panel.dataset.section === 'publicar-ubicacion') {
            initLocationPanel(panel);
            return;
        }

        if (panel.dataset.section === 'publicar-caracteristicas') {
            initCharacteristicsPanel(panel);
            return;
        }

        if (panel.dataset.section === 'publicar-media') {
            initMediaPanel(panel);
        }
    };

    global.ProfilePublish = { init };
})(window);
