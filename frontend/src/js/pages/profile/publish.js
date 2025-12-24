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

        const MIN_FILES = 5;
        const MAX_FILES = 50;

        const purposeTargets = panel.querySelectorAll('[data-media-purpose]');
        const typeTargets = panel.querySelectorAll('[data-media-type]');
        const subtypeTargets = panel.querySelectorAll('[data-media-subtype]');
        const dropzone = panel.querySelector('[data-media-dropzone]');
        const fileInput = panel.querySelector('[data-media-input]');
        const grid = panel.querySelector('[data-media-grid]');
        const counter = panel.querySelector('[data-media-counter]');
        const minimumMessage = panel.querySelector('[data-media-minimum]');
        const alertBox = panel.querySelector('[data-media-alert]');
        const continueButton = panel.querySelector('[data-media-continue]');
        const backButton = panel.querySelector('[data-media-back]');
        const emptyTemplate = panel.querySelector('[data-media-empty]');

        const state = {
            images: [],
            drag: null,
            alertTimer: null
        };

        const createId = () => `media-${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const showAlert = (message) => {
            if (!alertBox) {
                return;
            }
            alertBox.textContent = message;
            alertBox.hidden = false;

            if (state.alertTimer) {
                clearTimeout(state.alertTimer);
            }

            state.alertTimer = setTimeout(() => {
                alertBox.hidden = true;
            }, 4500);
        };

        const applyMediaContext = (detail = {}) => {
            const purpose = detail.purposeLabel || panel.dataset.publishPurposeLabel || 'Propósito no definido';
            const typeLabel = detail.typeLabel || panel.dataset.publishTypeLabel || 'Tipo no definido';
            const subtype = detail.subtype || panel.dataset.publishSubtype || 'Subtipo pendiente';

            panel.dataset.publishPurpose = detail.purpose || panel.dataset.publishPurpose || '';
            panel.dataset.publishPurposeLabel = purpose;
            panel.dataset.publishType = detail.type || panel.dataset.publishType || '';
            panel.dataset.publishTypeLabel = typeLabel;
            panel.dataset.publishSubtype = subtype;
            panel.dataset.publishTitle = detail.title || panel.dataset.publishTitle || '';
            panel.dataset.publishDescription = detail.description || panel.dataset.publishDescription || '';
            panel.dataset.locationCountry = detail.country || panel.dataset.locationCountry || '';
            panel.dataset.locationState = detail.state || panel.dataset.locationState || '';
            panel.dataset.locationCity = detail.city || panel.dataset.locationCity || '';
            panel.dataset.locationStreet = detail.street || panel.dataset.locationStreet || '';

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

        const updateStatus = () => {
            if (counter) {
                counter.textContent = `${state.images.length}/${MAX_FILES}`;
            }
            if (minimumMessage) {
                if (state.images.length < MIN_FILES) {
                    const remaining = MIN_FILES - state.images.length;
                    minimumMessage.textContent = `Faltan ${remaining} foto${remaining === 1 ? '' : 's'} para el mínimo.`;
                } else {
                    minimumMessage.textContent = 'Mínimo cubierto. Ya puedes continuar.';
                }
            }
            if (continueButton) {
                continueButton.disabled = state.images.length < MIN_FILES;
            }
        };

        const normalizePrimary = () => {
            if (!state.images.length) {
                return;
            }

            state.images.forEach((item, index) => {
                item.isPrimary = index === 0;
            });
        };

        const setPrimary = (id) => {
            const index = state.images.findIndex((item) => item.id === id);
            if (index <= 0) {
                return;
            }

            const [item] = state.images.splice(index, 1);
            state.images.unshift(item);
            normalizePrimary();
            renderPreviews();
            updateStatus();
        };

        const removeImage = (id) => {
            const index = state.images.findIndex((item) => item.id === id);
            if (index === -1) {
                return;
            }

            const [removed] = state.images.splice(index, 1);
            if (removed && removed.url) {
                URL.revokeObjectURL(removed.url);
            }
            normalizePrimary();
            renderPreviews();
            updateStatus();
        };

        const handleCaptionChange = (id, value) => {
            const image = state.images.find((item) => item.id === id);
            if (!image) {
                return;
            }
            image.caption = value;
        };

        const renderEmptyState = () => {
            if (!grid) {
                return;
            }
            const emptyNode = emptyTemplate ? emptyTemplate.cloneNode(true) : null;
            if (emptyNode) {
                grid.appendChild(emptyNode);
                return;
            }
            const fallback = document.createElement('div');
            fallback.className = 'publish-media__empty';
            fallback.textContent = 'Aún no has cargado fotos. Usa la zona de carga para comenzar.';
            grid.appendChild(fallback);
        };

        const renderPreviews = () => {
            if (!grid) {
                return;
            }

            grid.innerHTML = '';

            if (!state.images.length) {
                renderEmptyState();
                return;
            }

            state.images.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'publish-media__preview';
                card.dataset.mediaId = item.id;
                card.setAttribute('tabindex', '0');

                const media = document.createElement('div');
                media.className = 'publish-media__preview-media';

                const img = document.createElement('img');
                img.className = 'publish-media__preview-image';
                img.src = item.url;
                img.alt = `Foto ${index + 1} del inmueble`;

                media.appendChild(img);

                if (item.isPrimary) {
                    const badge = document.createElement('span');
                    badge.className = 'publish-media__badge';
                    badge.textContent = '⭐ Foto principal';
                    media.appendChild(badge);
                }

                const actions = document.createElement('div');
                actions.className = 'publish-media__actions';

                const primaryButton = document.createElement('button');
                primaryButton.type = 'button';
                primaryButton.className = 'publish-media__action-btn';
                primaryButton.dataset.mediaAction = 'primary';
                primaryButton.setAttribute('aria-label', 'Establecer como foto principal');
                primaryButton.setAttribute('aria-pressed', String(item.isPrimary));
                primaryButton.innerHTML = '<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\"><path d=\"m12 3 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.8l-5.3 2.9 1-5.8L3.5 9.2l5.9-.9L12 3Z\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/></svg>';

                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'publish-media__action-btn publish-media__action-btn--danger';
                deleteButton.dataset.mediaAction = 'remove';
                deleteButton.setAttribute('aria-label', 'Eliminar foto');
                deleteButton.innerHTML = '<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\"><path d=\"M5 7h14\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\"/><path d=\"M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2\" stroke=\"currentColor\" stroke-width=\"1.6\"/><path d=\"M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12\" stroke=\"currentColor\" stroke-width=\"1.6\"/></svg>';

                actions.appendChild(primaryButton);
                actions.appendChild(deleteButton);
                media.appendChild(actions);

                const caption = document.createElement('input');
                caption.type = 'text';
                caption.className = 'publish-media__caption-input';
                caption.placeholder = 'Ingresa un pie de foto';
                caption.value = item.caption || '';
                caption.dataset.mediaCaption = item.id;
                caption.setAttribute('aria-label', `Pie de foto para la imagen ${index + 1}`);

                card.appendChild(media);
                card.appendChild(caption);
                grid.appendChild(card);
            });
        };

        const handleFiles = (files) => {
            const incoming = Array.from(files || []);
            if (!incoming.length) {
                return;
            }

            const validFiles = incoming.filter((file) => file.type.startsWith('image/'));
            const invalidFiles = incoming.filter((file) => !file.type.startsWith('image/'));

            if (invalidFiles.length) {
                showAlert('Algunos archivos fueron omitidos porque no son imágenes.');
            }

            const availableSlots = MAX_FILES - state.images.length;
            if (availableSlots <= 0) {
                showAlert('Ya alcanzaste el máximo de 50 fotos.');
                return;
            }

            if (validFiles.length > availableSlots) {
                showAlert(`Solo puedes agregar ${availableSlots} foto${availableSlots === 1 ? '' : 's'} más.`);
            }

            validFiles.slice(0, availableSlots).forEach((file) => {
                state.images.push({
                    id: createId(),
                    file,
                    url: URL.createObjectURL(file),
                    caption: '',
                    isPrimary: false
                });
            });

            normalizePrimary();
            renderPreviews();
            updateStatus();
        };

        const handleDrop = (event) => {
            event.preventDefault();
            if (dropzone) {
                dropzone.classList.remove('is-dragover');
            }
            if (event.dataTransfer && event.dataTransfer.files) {
                handleFiles(event.dataTransfer.files);
            }
        };

        const startDrag = (event, card) => {
            if (!grid || !card) {
                return;
            }

            const id = card.dataset.mediaId;
            if (!id || state.images.length < 2) {
                return;
            }

            const gridRect = grid.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            const placeholder = document.createElement('div');
            placeholder.className = 'publish-media__preview-placeholder';
            placeholder.style.width = `${cardRect.width}px`;
            placeholder.style.height = `${cardRect.height}px`;

            card.classList.add('is-dragging');
            card.style.width = `${cardRect.width}px`;
            card.style.height = `${cardRect.height}px`;
            card.style.left = `${cardRect.left - gridRect.left}px`;
            card.style.top = `${cardRect.top - gridRect.top}px`;
            card.style.position = 'absolute';
            card.style.pointerEvents = 'none';

            grid.insertBefore(placeholder, card.nextSibling);
            grid.appendChild(card);
            grid.classList.add('is-reordering');

            card.setPointerCapture(event.pointerId);

            state.drag = {
                id,
                card,
                placeholder,
                offsetX: event.clientX - cardRect.left,
                offsetY: event.clientY - cardRect.top,
                gridRect
            };
        };

        const handlePointerMove = (event) => {
            if (!state.drag) {
                return;
            }

            const { card, placeholder, offsetX, offsetY, gridRect } = state.drag;
            const x = event.clientX - gridRect.left - offsetX;
            const y = event.clientY - gridRect.top - offsetY;

            card.style.left = `${x}px`;
            card.style.top = `${y}px`;

            const element = document.elementFromPoint(event.clientX, event.clientY);
            const target = element ? element.closest('.publish-media__preview:not(.is-dragging)') : null;

            if (target && target !== placeholder) {
                const rect = target.getBoundingClientRect();
                const shouldInsertAfter = event.clientY > rect.top + rect.height / 2;
                if (shouldInsertAfter) {
                    target.after(placeholder);
                } else {
                    target.before(placeholder);
                }
                return;
            }

            if (!target && grid) {
                grid.appendChild(placeholder);
            }
        };

        const finishDrag = (event) => {
            if (!state.drag) {
                return;
            }

            const { card, placeholder, id } = state.drag;

            card.releasePointerCapture(event.pointerId);
            grid.classList.remove('is-reordering');
            card.classList.remove('is-dragging');
            card.style.position = '';
            card.style.left = '';
            card.style.top = '';
            card.style.width = '';
            card.style.height = '';
            card.style.pointerEvents = '';

            const placeholderIndex = Array.from(grid.children).indexOf(placeholder);
            placeholder.remove();

            const currentIndex = state.images.findIndex((item) => item.id === id);
            if (currentIndex !== -1) {
                const [moved] = state.images.splice(currentIndex, 1);
                const newIndex = Math.max(0, Math.min(placeholderIndex, state.images.length));
                state.images.splice(newIndex, 0, moved);
                normalizePrimary();
            }

            state.drag = null;
            renderPreviews();
            updateStatus();
        };

        if (dropzone && fileInput) {
            dropzone.addEventListener('click', () => {
                fileInput.click();
            });

            dropzone.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    fileInput.click();
                }
            });

            ['dragenter', 'dragover'].forEach((eventName) => {
                dropzone.addEventListener(eventName, (event) => {
                    event.preventDefault();
                    dropzone.classList.add('is-dragover');
                });
            });

            ['dragleave', 'drop'].forEach((eventName) => {
                dropzone.addEventListener(eventName, (event) => {
                    event.preventDefault();
                    dropzone.classList.remove('is-dragover');
                });
            });

            dropzone.addEventListener('drop', handleDrop);

            fileInput.addEventListener('change', (event) => {
                handleFiles(event.target.files);
                fileInput.value = '';
            });
        }

        if (grid) {
            grid.addEventListener('click', (event) => {
                const actionButton = event.target.closest('button[data-media-action]');
                if (!actionButton) {
                    return;
                }

                const card = actionButton.closest('[data-media-id]');
                if (!card) {
                    return;
                }

                const id = card.dataset.mediaId;
                if (!id) {
                    return;
                }

                const action = actionButton.dataset.mediaAction;

                if (action === 'primary') {
                    setPrimary(id);
                }

                if (action === 'remove') {
                    removeImage(id);
                }
            });

            grid.addEventListener('input', (event) => {
                const input = event.target.closest('input[data-media-caption]');
                if (!input) {
                    return;
                }
                handleCaptionChange(input.dataset.mediaCaption, input.value);
            });

            grid.addEventListener('pointerdown', (event) => {
                const card = event.target.closest('.publish-media__preview');
                if (!card || event.button !== 0) {
                    return;
                }
                if (event.target.closest('button, input')) {
                    return;
                }
                event.preventDefault();
                startDrag(event, card);
            });

            grid.addEventListener('pointermove', handlePointerMove);
            grid.addEventListener('pointerup', finishDrag);
            grid.addEventListener('pointercancel', finishDrag);
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
            applyMediaContext(event.detail || {});
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        applyMediaContext({
            purposeLabel: panel.dataset.publishPurposeLabel,
            typeLabel: panel.dataset.publishTypeLabel,
            subtype: panel.dataset.publishSubtype
        });

        renderPreviews();
        updateStatus();
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
