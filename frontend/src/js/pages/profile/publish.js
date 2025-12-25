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

        const grid = panel.querySelector('[data-media-grid]');
        const dropzone = panel.querySelector('[data-media-dropzone]');
        const fileInput = panel.querySelector('[data-media-input]');
        const errorMessage = panel.querySelector('[data-media-error]');
        const countLabel = panel.querySelector('[data-media-count]');
        const continueButton = panel.querySelector('[data-media-continue]');
        const backButton = panel.querySelector('[data-media-back]');

        if (!grid || !dropzone || !fileInput) {
            return;
        }

        const state = {
            images: [],
            dragging: null
        };

        const maxPhotos = 50;
        const minPhotos = 5;
        const allowedTypes = new Set(['image/jpeg', 'image/png']);

        const setError = (message) => {
            if (!errorMessage) {
                return;
            }
            errorMessage.textContent = message;
            errorMessage.classList.toggle('media-error--visible', Boolean(message));
        };

        const updateCount = () => {
            if (countLabel) {
                countLabel.textContent = `${state.images.length} / ${maxPhotos} fotos`;
            }
        };

        const updateContinue = () => {
            if (continueButton) {
                continueButton.disabled = state.images.length < minPhotos;
            }
        };

        const toggleDropzoneState = () => {
            const isFull = state.images.length >= maxPhotos;
            dropzone.classList.toggle('media-dropzone--disabled', isFull);
            dropzone.setAttribute('aria-disabled', String(isFull));
        };

        const ensurePrimary = () => {
            if (!state.images.length) {
                return;
            }
            state.images.forEach((image, index) => {
                image.isPrimary = index === 0;
            });
        };

        const setPrimaryById = (id) => {
            const index = state.images.findIndex((image) => image.id === id);
            if (index === -1) {
                return;
            }
            const [primary] = state.images.splice(index, 1);
            state.images.unshift(primary);
            ensurePrimary();
            renderPreviews();
        };

        const removeImageById = (id) => {
            const index = state.images.findIndex((image) => image.id === id);
            if (index === -1) {
                return;
            }
            const [removed] = state.images.splice(index, 1);
            if (removed && removed.previewUrl) {
                URL.revokeObjectURL(removed.previewUrl);
            }
            ensurePrimary();
            renderPreviews();
        };

        const updateCaption = (id, value) => {
            const image = state.images.find((item) => item.id === id);
            if (image) {
                image.caption = value;
            }
        };

        const handleFiles = (fileList) => {
            if (!fileList || !fileList.length) {
                return;
            }

            let hasInvalid = false;
            let hasMaxExceeded = false;

            Array.from(fileList).forEach((file) => {
                if (state.images.length >= maxPhotos) {
                    hasMaxExceeded = true;
                    return;
                }

                if (!allowedTypes.has(file.type)) {
                    hasInvalid = true;
                    return;
                }

                const previewUrl = URL.createObjectURL(file);
                state.images.push({
                    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    file,
                    previewUrl,
                    caption: '',
                    isPrimary: false
                });
            });

            if (hasInvalid) {
                setError('Solo se admiten archivos JPG, JPEG o PNG.');
            } else if (hasMaxExceeded) {
                setError('Has alcanzado el máximo de 50 fotos.');
            } else {
                setError('');
            }

            ensurePrimary();
            renderPreviews();
        };

        const createControlButton = (action, label, icon) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'media-preview__control';
            button.dataset.mediaAction = action;
            button.setAttribute('aria-label', label);
            button.innerHTML = icon;
            return button;
        };

        const renderPreviews = () => {
            const previews = grid.querySelectorAll('.media-preview');
            previews.forEach((preview) => preview.remove());

            state.images.forEach((image) => {
                const card = document.createElement('div');
                card.className = 'media-preview';
                card.dataset.mediaId = image.id;

                const thumb = document.createElement('div');
                thumb.className = 'media-preview__thumb';

                const img = document.createElement('img');
                img.src = image.previewUrl;
                img.alt = image.caption || 'Vista previa de la foto';
                img.loading = 'lazy';

                const badge = document.createElement('span');
                badge.className = 'media-preview__badge';
                badge.innerHTML = '<span class=\"media-preview__badge-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\"><path d=\"M12 3l2.4 5 5.5.8-4 3.9.9 5.6L12 16.8 7.2 18.3l.9-5.6-4-3.9 5.5-.8L12 3z\" fill=\"#ffffff\"/></svg></span>Foto principal';
                badge.style.display = image.isPrimary ? 'inline-flex' : 'none';

                const controls = document.createElement('div');
                controls.className = 'media-preview__controls';
                controls.appendChild(createControlButton('primary', 'Establecer como principal', '<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\"><path d=\"M12 3l2.4 5 5.5.8-4 3.9.9 5.6L12 16.8 7.2 18.3l.9-5.6-4-3.9 5.5-.8L12 3z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/></svg>'));
                controls.appendChild(createControlButton('rotate', 'Rotar foto', '<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\"><path d=\"M5 12a7 7 0 0 1 12.4-4.2\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><path d=\"M17 4v5h-5\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><path d=\"M19 12a7 7 0 0 1-12.4 4.2\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/></svg>'));
                controls.appendChild(createControlButton('remove', 'Eliminar foto', '<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\"><path d=\"M4 7h16\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><path d=\"M9 7V5h6v2\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><path d=\"M7 7l1 12h8l1-12\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\"/></svg>'));

                thumb.appendChild(img);
                thumb.appendChild(badge);
                thumb.appendChild(controls);

                const caption = document.createElement('input');
                caption.type = 'text';
                caption.className = 'media-preview__caption';
                caption.placeholder = 'Ingresa un pie de foto';
                caption.value = image.caption;
                caption.addEventListener('input', (event) => updateCaption(image.id, event.target.value));

                card.appendChild(thumb);
                card.appendChild(caption);
                grid.appendChild(card);
            });

            updateCount();
            updateContinue();
            toggleDropzoneState();
        };

        const reorderFromDom = () => {
            const ids = Array.from(grid.querySelectorAll('.media-preview'))
                .filter((item) => !item.classList.contains('media-preview--placeholder'))
                .map((item) => item.dataset.mediaId);
            state.images = ids.map((id) => state.images.find((image) => image.id === id)).filter(Boolean);
            ensurePrimary();
            renderPreviews();
        };

        const onPointerMove = (event) => {
            if (!state.dragging) {
                return;
            }

            const { card, placeholder, offsetX, offsetY } = state.dragging;
            card.style.left = `${event.clientX - offsetX}px`;
            card.style.top = `${event.clientY - offsetY}px`;

            const target = document.elementFromPoint(event.clientX, event.clientY);
            if (!target) {
                return;
            }

            const preview = target.closest('.media-preview');
            if (!preview || preview === card || preview.classList.contains('media-preview--placeholder')) {
                return;
            }

            const rect = preview.getBoundingClientRect();
            const shouldPlaceAfter = event.clientY > rect.top + rect.height / 2;
            if (shouldPlaceAfter) {
                preview.after(placeholder);
            } else {
                preview.before(placeholder);
            }
        };

        const onPointerUp = () => {
            if (!state.dragging) {
                return;
            }

            const { card, placeholder } = state.dragging;
            card.classList.remove('is-dragging');
            if (card.hasPointerCapture && card.hasPointerCapture(state.dragging.pointerId)) {
                card.releasePointerCapture(state.dragging.pointerId);
            }
            card.style.position = '';
            card.style.left = '';
            card.style.top = '';
            card.style.width = '';
            card.style.height = '';
            card.style.zIndex = '';
            card.style.pointerEvents = '';

            placeholder.replaceWith(card);
            state.dragging = null;
            reorderFromDom();
        };

        const onPointerDown = (event) => {
            const card = event.target.closest('.media-preview');
            if (!card || event.target.closest('button') || event.target.closest('input')) {
                return;
            }

            event.preventDefault();

            const rect = card.getBoundingClientRect();
            const placeholder = document.createElement('div');
            placeholder.className = 'media-preview media-preview--placeholder';
            placeholder.style.height = `${rect.height}px`;

            card.after(placeholder);
            card.classList.add('is-dragging');
            card.style.position = 'fixed';
            card.style.width = `${rect.width}px`;
            card.style.height = `${rect.height}px`;
            card.style.left = `${rect.left}px`;
            card.style.top = `${rect.top}px`;
            card.style.zIndex = '20';
            card.style.pointerEvents = 'none';

            card.setPointerCapture(event.pointerId);

            state.dragging = {
                card,
                placeholder,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top,
                pointerId: event.pointerId
            };
        };

        const onDropzoneClick = () => {
            if (state.images.length >= maxPhotos) {
                return;
            }
            fileInput.click();
        };

        const onFileChange = (event) => {
            handleFiles(event.target.files);
            event.target.value = '';
        };

        const onDrop = (event) => {
            event.preventDefault();
            dropzone.classList.remove('media-dropzone--active');
            if (state.images.length >= maxPhotos) {
                return;
            }
            handleFiles(event.dataTransfer.files);
        };

        const onDragOver = (event) => {
            event.preventDefault();
            if (state.images.length >= maxPhotos) {
                return;
            }
            dropzone.classList.add('media-dropzone--active');
        };

        const onDragLeave = () => {
            dropzone.classList.remove('media-dropzone--active');
        };

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

        if (continueButton) {
            continueButton.addEventListener('click', (event) => {
                if (state.images.length < minPhotos) {
                    event.preventDefault();
                    setError('Necesitas cargar al menos 5 fotos para continuar.');
                }
            });
        }

        grid.addEventListener('click', (event) => {
            const actionButton = event.target.closest('[data-media-action]');
            if (!actionButton) {
                return;
            }

            const card = actionButton.closest('.media-preview');
            if (!card) {
                return;
            }

            const action = actionButton.dataset.mediaAction;
            const id = card.dataset.mediaId;

            if (action === 'primary') {
                setPrimaryById(id);
            }

            if (action === 'remove') {
                removeImageById(id);
            }

            if (action === 'rotate') {
                card.classList.toggle('media-preview--rotated');
            }
        });

        grid.addEventListener('pointerdown', onPointerDown);
        grid.addEventListener('pointermove', onPointerMove);
        grid.addEventListener('pointerup', onPointerUp);
        grid.addEventListener('pointercancel', onPointerUp);

        dropzone.addEventListener('click', onDropzoneClick);
        dropzone.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onDropzoneClick();
            }
        });
        dropzone.addEventListener('dragover', onDragOver);
        dropzone.addEventListener('dragleave', onDragLeave);
        dropzone.addEventListener('drop', onDrop);
        fileInput.addEventListener('change', onFileChange);

        panel.addEventListener('publish-media:open', (event) => {
            const detail = event.detail || {};
            panel.dataset.publishPurpose = detail.purpose || panel.dataset.publishPurpose || '';
            panel.dataset.publishPurposeLabel = detail.purposeLabel || panel.dataset.publishPurposeLabel || '';
            panel.dataset.publishType = detail.type || panel.dataset.publishType || '';
            panel.dataset.publishTypeLabel = detail.typeLabel || panel.dataset.publishTypeLabel || '';
            panel.dataset.publishSubtype = detail.subtype || panel.dataset.publishSubtype || '';
            panel.dataset.publishTitle = detail.title || panel.dataset.publishTitle || '';
            panel.dataset.publishDescription = detail.description || panel.dataset.publishDescription || '';
            panel.dataset.locationCountry = detail.country || panel.dataset.locationCountry || '';
            panel.dataset.locationState = detail.state || panel.dataset.locationState || '';
            panel.dataset.locationCity = detail.city || panel.dataset.locationCity || '';
            panel.dataset.locationStreet = detail.street || panel.dataset.locationStreet || '';
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        }

        if (panel.dataset.section === 'publicar-media') {
            initMediaPanel(panel);
        }
    };

    global.ProfilePublish = { init };
})(window);
