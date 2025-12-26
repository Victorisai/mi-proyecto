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
        const saveButton = panel.querySelector('[data-characteristics-save]');

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

        if (saveButton) {
            saveButton.addEventListener('click', (event) => {
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

        const MIN_PHOTOS = 5;
        const MAX_PHOTOS = 50;
        const VALID_TYPES = ['image/jpeg', 'image/png'];

        const purposeTargets = panel.querySelectorAll('[data-media-purpose]');
        const typeTargets = panel.querySelectorAll('[data-media-type]');
        const subtypeTargets = panel.querySelectorAll('[data-media-subtype]');
        const grid = panel.querySelector('[data-media-grid]');
        const dropzone = panel.querySelector('[data-media-dropzone]');
        const input = panel.querySelector('[data-media-input]');
        const errorMessage = panel.querySelector('[data-media-error]');
        const backButton = panel.querySelector('[data-media-back]');
        const continueButton = panel.querySelector('[data-media-continue]');

        if (!grid || !dropzone || !input) {
            return;
        }

        const state = {
            photos: [],
            expanded: false,
            dragging: null
        };

        const clearError = () => {
            if (errorMessage) {
                errorMessage.textContent = '';
                errorMessage.classList.remove('publish-media__error--visible');
            }
        };

        const showError = (message) => {
            if (errorMessage) {
                errorMessage.textContent = message;
                errorMessage.classList.add('publish-media__error--visible');
            }
        };

        const updateContinueState = () => {
            if (continueButton) {
                continueButton.disabled = state.photos.length < MIN_PHOTOS;
            }
        };

        const updateDropzoneState = () => {
            const isMaxed = state.photos.length >= MAX_PHOTOS;
            dropzone.classList.toggle('media-dropzone--disabled', isMaxed);
            input.disabled = isMaxed;
            dropzone.setAttribute('aria-disabled', String(isMaxed));
            dropzone.tabIndex = isMaxed ? -1 : 0;
        };

        const ensurePrimary = () => {
            if (!state.photos.length) {
                return;
            }

            state.photos.forEach((photo, index) => {
                photo.isPrimary = index === 0;
            });
        };

        const createCardButton = (label, svg, className) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `media-card__control ${className}`;
            button.setAttribute('aria-label', label);
            button.innerHTML = svg;
            return button;
        };

        const removeImage = (id) => {
            const index = state.photos.findIndex((photo) => photo.id === id);
            if (index === -1) {
                return;
            }

            const [removed] = state.photos.splice(index, 1);
            if (removed && removed.url) {
                URL.revokeObjectURL(removed.url);
            }

            ensurePrimary();
            if (state.photos.length <= 5) {
                state.expanded = false;
            }
            renderPreviews();
        };

        const renderPreviews = () => {
            const existing = grid.querySelectorAll('[data-media-item], [data-media-more]');
            existing.forEach((element) => element.remove());

            const shouldShowMore = !state.expanded && state.photos.length > 5;
            const visiblePhotos = shouldShowMore ? state.photos.slice(0, 5) : state.photos;
            grid.classList.toggle('media-grid--expanded', state.expanded);

            visiblePhotos.forEach((photo) => {
                const card = document.createElement('div');
                card.className = 'media-card';
                card.dataset.mediaItem = 'true';
                card.dataset.mediaId = photo.id;
                card.setAttribute('tabindex', '0');

                const preview = document.createElement('div');
                preview.className = 'media-card__preview';

                const image = document.createElement('img');
                image.src = photo.url;
                image.alt = 'Vista previa del inmueble';
                image.style.transform = `rotate(${photo.rotation}deg)`;
                preview.appendChild(image);

                if (photo.isPrimary) {
                    const badge = document.createElement('span');
                    badge.className = 'media-card__badge';
                    badge.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 3.5 14.6 9l6.2.5-4.7 4 1.4 6.1L12 16.7 6.5 19.6 8 13.5 3.3 9.5 9.5 9z" fill="#f59e0b"/></svg>Foto principal';
                    preview.appendChild(badge);
                }

                const controls = document.createElement('div');
                controls.className = 'media-card__controls';

                const rotateButton = createCardButton(
                    'Rotar foto',
                    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.65 4.82" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path d="M5 5v4h4" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                    'media-card__control--rotate'
                );

                const primaryButton = createCardButton(
                    'Marcar como foto principal',
                    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 3.5 14.6 9l6.2.5-4.7 4 1.4 6.1L12 16.7 6.5 19.6 8 13.5 3.3 9.5 9.5 9z" fill="#ffffff"/></svg>',
                    'media-card__control--primary'
                );

                const removeButton = createCardButton(
                    'Eliminar foto',
                    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 7h14M9 7V5h6v2M9 11v6M15 11v6" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path d="M7 7l1 12h8l1-12" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>',
                    'media-card__control--remove'
                );

                rotateButton.addEventListener('click', () => {
                    photo.rotation = (photo.rotation + 90) % 360;
                    renderPreviews();
                });

                primaryButton.addEventListener('click', () => {
                    const currentIndex = state.photos.findIndex((item) => item.id === photo.id);
                    if (currentIndex > -1) {
                        const [selected] = state.photos.splice(currentIndex, 1);
                        state.photos.unshift(selected);
                        ensurePrimary();
                        renderPreviews();
                    }
                });

                removeButton.addEventListener('click', () => {
                    removeImage(photo.id);
                });

                controls.appendChild(rotateButton);
                if (!photo.isPrimary) {
                    controls.appendChild(primaryButton);
                }
                controls.appendChild(removeButton);
                preview.appendChild(controls);

                const caption = document.createElement('input');
                caption.type = 'text';
                caption.className = 'media-card__caption';
                caption.placeholder = 'Ingresa un pie de foto';
                caption.value = photo.caption;
                caption.addEventListener('input', (event) => {
                    photo.caption = event.target.value;
                });

                card.appendChild(preview);
                card.appendChild(caption);
                grid.appendChild(card);
            });

            if (shouldShowMore) {
                const remainingCount = state.photos.length - visiblePhotos.length;
                const moreCard = document.createElement('button');
                moreCard.type = 'button';
                moreCard.className = 'media-card media-card--more';
                moreCard.dataset.mediaMore = 'true';
                moreCard.innerHTML = `<span class=\"media-card__more-count\">+${remainingCount}</span><span class=\"media-card__more-text\">Ver más fotos</span>`;
                moreCard.addEventListener('click', () => {
                    state.expanded = true;
                    renderPreviews();
                });
                grid.appendChild(moreCard);
            }

            updateContinueState();
            updateDropzoneState();
        };

        const addPhotos = (files) => {
            clearError();

            const validFiles = [];
            const rejectedFiles = [];

            Array.from(files).forEach((file) => {
                if (!VALID_TYPES.includes(file.type)) {
                    rejectedFiles.push(file);
                } else {
                    validFiles.push(file);
                }
            });

            if (rejectedFiles.length) {
                showError('Solo se permiten fotos en formato JPG o PNG.');
            }

            if (!validFiles.length) {
                return;
            }

            const availableSlots = MAX_PHOTOS - state.photos.length;

            if (availableSlots <= 0) {
                showError('Ya alcanzaste el máximo de 50 fotos.');
                updateDropzoneState();
                return;
            }

            const filesToAdd = validFiles.slice(0, availableSlots);
            if (validFiles.length > availableSlots) {
                showError('Se alcanzó el máximo de 50 fotos. Se cargaron solo las primeras disponibles.');
            }

            filesToAdd.forEach((file) => {
                const photo = {
                    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    file,
                    url: URL.createObjectURL(file),
                    caption: '',
                    rotation: 0,
                    isPrimary: false
                };
                state.photos.push(photo);
            });

            ensurePrimary();
            renderPreviews();
        };

        const updateOrderFromDom = () => {
            const items = Array.from(grid.querySelectorAll('[data-media-item]'));
            const visibleIds = items.map((item) => item.dataset.mediaId);

            if (!state.expanded && state.photos.length > 5) {
                const visiblePhotos = visibleIds
                    .map((id) => state.photos.find((photo) => photo.id === id))
                    .filter(Boolean);
                const remaining = state.photos.filter((photo) => !visibleIds.includes(photo.id));
                state.photos = [...visiblePhotos, ...remaining];
            } else {
                state.photos = visibleIds
                    .map((id) => state.photos.find((photo) => photo.id === id))
                    .filter(Boolean);
            }

            ensurePrimary();
        };

        const startDrag = (event, card) => {
            event.preventDefault();

            const rect = card.getBoundingClientRect();
            const placeholder = document.createElement('div');
            placeholder.className = 'media-card media-card--placeholder';
            placeholder.style.height = `${rect.height}px`;

            card.after(placeholder);

            card.classList.add('is-dragging');
            card.style.width = `${rect.width}px`;
            card.style.height = `${rect.height}px`;
            card.style.left = `${rect.left}px`;
            card.style.top = `${rect.top}px`;

            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;

            card.setPointerCapture(event.pointerId);

            state.dragging = {
                card,
                placeholder,
                offsetX,
                offsetY,
                pointerId: event.pointerId
            };

            document.body.classList.add('media-dragging');
        };

        const handlePointerMove = (event) => {
            if (!state.dragging) {
                return;
            }

            const { card, placeholder, offsetX, offsetY } = state.dragging;
            card.style.left = `${event.clientX - offsetX}px`;
            card.style.top = `${event.clientY - offsetY}px`;

            const target = document.elementFromPoint(event.clientX, event.clientY);
            const targetCard = target ? target.closest('[data-media-item]') : null;

            if (!targetCard || targetCard === card) {
                return;
            }

            const targetRect = targetCard.getBoundingClientRect();
            const shouldInsertAfter = event.clientY > targetRect.top + targetRect.height / 2;

            if (shouldInsertAfter) {
                targetCard.after(placeholder);
            } else {
                targetCard.before(placeholder);
            }
        };

        const endDrag = () => {
            if (!state.dragging) {
                return;
            }

            const { card, placeholder, pointerId } = state.dragging;
            card.releasePointerCapture(pointerId);
            card.classList.remove('is-dragging');
            card.removeAttribute('style');

            placeholder.replaceWith(card);

            state.dragging = null;
            document.body.classList.remove('media-dragging');

            updateOrderFromDom();
            renderPreviews();
        };

        const handlePointerDown = (event) => {
            if (event.button !== 0) {
                return;
            }

            const card = event.target.closest('[data-media-item]');
            if (!card) {
                return;
            }

            if (event.target.closest('button') || event.target.closest('input')) {
                return;
            }

            startDrag(event, card);
        };

        const applyMediaContext = (detail = {}) => {
            const purpose = detail.purposeLabel || panel.dataset.publishPurposeLabel || 'Propósito pendiente';
            const typeLabel = detail.typeLabel || panel.dataset.publishTypeLabel || 'Tipo de propiedad pendiente';
            const subtype = detail.subtype || panel.dataset.publishSubtype || 'Subtipo pendiente';

            panel.dataset.publishPurpose = detail.purpose || panel.dataset.publishPurpose || '';
            panel.dataset.publishPurposeLabel = purpose;
            panel.dataset.publishType = detail.type || panel.dataset.publishType || '';
            panel.dataset.publishTypeLabel = typeLabel;
            panel.dataset.publishSubtype = subtype;

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

        renderPreviews();

        input.addEventListener('change', (event) => {
            addPhotos(event.target.files);
            event.target.value = '';
        });

        dropzone.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                input.click();
            }
        });

        dropzone.addEventListener('dragover', (event) => {
            event.preventDefault();
            dropzone.classList.add('media-dropzone--dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('media-dropzone--dragover');
        });

        dropzone.addEventListener('drop', (event) => {
            event.preventDefault();
            dropzone.classList.remove('media-dropzone--dragover');
            if (event.dataTransfer && event.dataTransfer.files) {
                addPhotos(event.dataTransfer.files);
            }
        });

        grid.addEventListener('pointerdown', handlePointerDown);
        grid.addEventListener('pointermove', handlePointerMove);
        grid.addEventListener('pointerup', endDrag);
        grid.addEventListener('pointercancel', endDrag);

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
            applyMediaContext(event.detail || {});
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        applyMediaContext({
            purposeLabel: panel.dataset.publishPurposeLabel,
            typeLabel: panel.dataset.publishTypeLabel,
            subtype: panel.dataset.publishSubtype
        });
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
