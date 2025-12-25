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

        const purposeTargets = panel.querySelectorAll('[data-media-purpose]');
        const typeTargets = panel.querySelectorAll('[data-media-type]');
        const subtypeTargets = panel.querySelectorAll('[data-media-subtype]');
        const grid = panel.querySelector('[data-media-grid]');
        const dropzone = panel.querySelector('[data-media-dropzone]');
        const fileInput = panel.querySelector('[data-media-input]');
        const alertBox = panel.querySelector('[data-media-alert]');
        const continueButton = panel.querySelector('[data-media-continue]');
        const backButton = panel.querySelector('[data-media-back]');

        if (!grid || !dropzone || !fileInput) {
            return;
        }

        const state = {
            items: [],
            showAll: false
        };

        const maxImages = 50;
        const minImages = 5;
        let idCounter = 0;
        let dragState = null;

        const icons = {
            star: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false"><path d="M12 3.5 14.9 9l6.1.9-4.5 4.3 1.1 6.1L12 17.6 6.4 20.3l1.1-6.1L3 9.9 9.1 9 12 3.5Z" fill="currentColor"/></svg>',
            rotate: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false"><path d="M12 4a8 8 0 0 1 7.7 6h-2.4l3.2 3.2L23 10h-2.1A9 9 0 1 0 12 21a9 9 0 0 0 7.9-4.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            trash: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };

        const setAlert = (message = '') => {
            if (!alertBox) {
                return;
            }
            if (!message) {
                alertBox.textContent = '';
                alertBox.hidden = true;
                return;
            }
            alertBox.textContent = message;
            alertBox.hidden = false;
        };

        const updateContinueState = () => {
            if (!continueButton) {
                return;
            }
            const isValid = state.items.length >= minImages;
            continueButton.disabled = !isValid;
            continueButton.setAttribute('aria-disabled', String(!isValid));
        };

        const updateDropzoneState = () => {
            const isFull = state.items.length >= maxImages;
            dropzone.classList.toggle('media-dropzone--disabled', isFull);
            dropzone.setAttribute('aria-disabled', String(isFull));
            fileInput.disabled = isFull;
        };

        const formatContext = (value, fallback) => (value && value.trim().length ? value : fallback);

        const applyMediaContext = (detail = {}) => {
            const purpose = formatContext(detail.purposeLabel || panel.dataset.publishPurposeLabel, 'Propósito pendiente');
            const type = formatContext(detail.typeLabel || panel.dataset.publishTypeLabel, 'Tipo de propiedad pendiente');
            const subtype = formatContext(detail.subtype || panel.dataset.publishSubtype, 'Subtipo pendiente');

            purposeTargets.forEach((element) => {
                element.textContent = purpose;
            });

            typeTargets.forEach((element) => {
                element.textContent = type;
            });

            subtypeTargets.forEach((element) => {
                element.textContent = subtype;
            });
        };

        const buildBadge = () => {
            const badge = document.createElement('span');
            badge.className = 'media-card__badge';
            badge.innerHTML = `${icons.star}<span>Foto principal</span>`;
            return badge;
        };

        const buildActionButton = (action, label, icon, isActive = false) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `media-card__action${isActive ? ' media-card__action--active' : ''}`;
            button.dataset.action = action;
            button.setAttribute('aria-label', label);
            if (action === 'primary') {
                button.setAttribute('aria-pressed', String(isActive));
            }
            button.innerHTML = icon;
            return button;
        };

        const buildMediaCard = (item) => {
            const card = document.createElement('article');
            card.className = 'media-card';
            card.dataset.mediaItem = 'true';
            card.dataset.mediaId = item.id;

            const preview = document.createElement('div');
            preview.className = 'media-card__preview';

            const image = document.createElement('img');
            image.src = item.url;
            image.alt = item.caption || 'Foto del inmueble';
            image.style.transform = `rotate(${item.rotation}deg)`;
            preview.appendChild(image);

            if (item.isPrimary) {
                preview.appendChild(buildBadge());
            }

            const actions = document.createElement('div');
            actions.className = 'media-card__actions';
            actions.appendChild(buildActionButton('primary', 'Establecer como principal', icons.star, item.isPrimary));
            actions.appendChild(buildActionButton('rotate', 'Rotar foto', icons.rotate));
            actions.appendChild(buildActionButton('remove', 'Eliminar foto', icons.trash));
            preview.appendChild(actions);

            const caption = document.createElement('input');
            caption.type = 'text';
            caption.className = 'media-card__caption';
            caption.placeholder = 'Ingresa un pie de foto';
            caption.value = item.caption;
            caption.dataset.caption = 'true';

            card.appendChild(preview);
            card.appendChild(caption);

            return card;
        };

        const buildMoreCard = (hiddenCount) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'media-card media-card--more';
            button.dataset.mediaMore = 'true';
            button.innerHTML = `
                <span class="media-card__more-count">+${hiddenCount}</span>
                <span class="media-card__more-label">Ver más fotos</span>
            `;
            return button;
        };

        const clearMediaItems = () => {
            const items = grid.querySelectorAll('[data-media-item], [data-media-more]');
            items.forEach((item) => item.remove());
        };

        const renderMediaGrid = () => {
            clearMediaItems();
            updateDropzoneState();

            const displayItems = state.showAll ? state.items : state.items.slice(0, minImages);
            displayItems.forEach((item) => {
                grid.appendChild(buildMediaCard(item));
            });

            if (!state.showAll && state.items.length > minImages) {
                const hiddenCount = state.items.length - minImages;
                grid.appendChild(buildMoreCard(hiddenCount));
            }

            updateContinueState();
        };

        const setPrimary = (id) => {
            if (!state.items.some((item) => item.id === id)) {
                return;
            }

            state.items = state.items.map((item) => ({
                ...item,
                isPrimary: item.id === id
            }));

            const target = state.items.find((item) => item.id === id);
            state.items = [target, ...state.items.filter((item) => item.id !== id)];
            renderMediaGrid();
        };

        const rotateImage = (id) => {
            state.items = state.items.map((item) => {
                if (item.id !== id) {
                    return item;
                }
                const rotation = (item.rotation + 90) % 360;
                return { ...item, rotation };
            });
            renderMediaGrid();
        };

        const removeImage = (id) => {
            const removed = state.items.find((item) => item.id === id);
            if (removed && removed.url) {
                URL.revokeObjectURL(removed.url);
            }

            state.items = state.items.filter((item) => item.id !== id);

            if (state.items.length && !state.items.some((item) => item.isPrimary)) {
                state.items[0].isPrimary = true;
            }

            if (state.items.length <= minImages) {
                state.showAll = false;
            }

            renderMediaGrid();
        };

        const updateCaption = (id, value) => {
            state.items = state.items.map((item) => (item.id === id ? { ...item, caption: value } : item));
        };

        const handleFiles = (files) => {
            const fileList = Array.from(files || []);
            if (!fileList.length) {
                return;
            }

            const errors = [];
            const validItems = [];
            const availableSlots = Math.max(maxImages - state.items.length, 0);

            fileList.forEach((file) => {
                if (!['image/jpeg', 'image/png'].includes(file.type)) {
                    errors.push('Solo se permiten archivos JPG o PNG.');
                    return;
                }

                if (validItems.length >= availableSlots) {
                    return;
                }

                const id = `media-${Date.now()}-${idCounter++}`;
                validItems.push({
                    id,
                    file,
                    url: URL.createObjectURL(file),
                    caption: '',
                    isPrimary: false,
                    rotation: 0
                });
            });

            if (!availableSlots) {
                errors.push('Ya alcanzaste el máximo de 50 fotos.');
            } else if (fileList.length > availableSlots) {
                errors.push('Solo puedes cargar hasta 50 fotos en total.');
            }

            if (validItems.length) {
                state.items = state.items.concat(validItems);
                if (!state.items.some((item) => item.isPrimary)) {
                    state.items[0].isPrimary = true;
                }
                renderMediaGrid();
            }

            setAlert(errors.length ? errors[0] : '');
        };

        const reorderFromDom = () => {
            const orderedIds = Array.from(grid.querySelectorAll('[data-media-item]')).map((item) => item.dataset.mediaId);
            if (!orderedIds.length) {
                return;
            }

            const orderedItems = orderedIds
                .map((id) => state.items.find((item) => item.id === id))
                .filter(Boolean);
            const remainingItems = state.items.filter((item) => !orderedIds.includes(item.id));
            state.items = orderedItems.concat(remainingItems);
        };

        const startDrag = (card, event) => {
            const rect = card.getBoundingClientRect();
            const placeholder = document.createElement('div');
            placeholder.className = 'media-card media-card--placeholder';
            placeholder.style.height = `${rect.height}px`;
            placeholder.style.width = `${rect.width}px`;

            dragState = {
                card,
                placeholder,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top
            };

            card.classList.add('media-card--dragging');
            card.style.width = `${rect.width}px`;
            card.style.height = `${rect.height}px`;
            card.style.position = 'fixed';
            card.style.left = `${rect.left}px`;
            card.style.top = `${rect.top}px`;
            card.style.zIndex = '30';
            card.style.pointerEvents = 'none';

            grid.insertBefore(placeholder, card.nextSibling);

            document.addEventListener('pointermove', handleDragMove);
            document.addEventListener('pointerup', handleDragEnd);
        };

        const handleDragMove = (event) => {
            if (!dragState) {
                return;
            }

            const x = event.clientX - dragState.offsetX;
            const y = event.clientY - dragState.offsetY;
            dragState.card.style.left = `${x}px`;
            dragState.card.style.top = `${y}px`;

            const target = document.elementFromPoint(event.clientX, event.clientY);
            const overCard = target ? target.closest('[data-media-item]') : null;

            if (!overCard || overCard === dragState.card) {
                return;
            }

            const overRect = overCard.getBoundingClientRect();
            const isAfter = event.clientY > overRect.top + overRect.height / 2;
            const referenceNode = isAfter ? overCard.nextSibling : overCard;

            if (referenceNode !== dragState.placeholder) {
                grid.insertBefore(dragState.placeholder, referenceNode);
            }
        };

        const handleDragEnd = () => {
            if (!dragState) {
                return;
            }

            dragState.card.classList.remove('media-card--dragging');
            dragState.card.style.position = '';
            dragState.card.style.left = '';
            dragState.card.style.top = '';
            dragState.card.style.width = '';
            dragState.card.style.height = '';
            dragState.card.style.zIndex = '';
            dragState.card.style.pointerEvents = '';

            grid.insertBefore(dragState.card, dragState.placeholder);
            dragState.placeholder.remove();

            reorderFromDom();
            dragState = null;
            renderMediaGrid();

            document.removeEventListener('pointermove', handleDragMove);
            document.removeEventListener('pointerup', handleDragEnd);
        };

        const handlePointerDown = (event) => {
            if (event.button !== 0) {
                return;
            }
            const card = event.target.closest('[data-media-item]');
            if (!card || event.target.closest('button, input')) {
                return;
            }
            startDrag(card, event);
        };

        dropzone.addEventListener('dragover', (event) => {
            event.preventDefault();
            dropzone.classList.add('media-dropzone--active');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('media-dropzone--active');
        });

        dropzone.addEventListener('drop', (event) => {
            event.preventDefault();
            dropzone.classList.remove('media-dropzone--active');
            handleFiles(event.dataTransfer ? event.dataTransfer.files : []);
        });

        dropzone.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                fileInput.click();
            }
        });

        fileInput.addEventListener('change', (event) => {
            handleFiles(event.target.files);
            event.target.value = '';
        });

        grid.addEventListener('click', (event) => {
            const actionButton = event.target.closest('[data-action]');
            if (!actionButton) {
                const moreButton = event.target.closest('[data-media-more]');
                if (moreButton) {
                    state.showAll = true;
                    renderMediaGrid();
                }
                return;
            }

            const card = actionButton.closest('[data-media-item]');
            if (!card) {
                return;
            }

            const id = card.dataset.mediaId;
            const action = actionButton.dataset.action;
            if (action === 'primary') {
                setPrimary(id);
            }
            if (action === 'rotate') {
                rotateImage(id);
            }
            if (action === 'remove') {
                removeImage(id);
            }
        });

        grid.addEventListener('input', (event) => {
            const input = event.target.closest('[data-caption]');
            if (!input) {
                return;
            }
            const card = input.closest('[data-media-item]');
            if (!card) {
                return;
            }
            updateCaption(card.dataset.mediaId, input.value);
        });

        grid.addEventListener('pointerdown', handlePointerDown);

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

        renderMediaGrid();
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
