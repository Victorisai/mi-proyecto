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

        const dropzone = panel.querySelector('[data-media-dropzone]');
        const input = panel.querySelector('[data-media-input]');
        const grid = panel.querySelector('[data-media-grid]');
        const emptyState = panel.querySelector('[data-media-empty]');
        const counter = panel.querySelector('[data-media-counter]');
        const minimum = panel.querySelector('[data-media-minimum]');
        const error = panel.querySelector('[data-media-error]');
        const backButton = panel.querySelector('[data-media-back]');
        const continueButton = panel.querySelector('[data-media-continue]');

        const maxPhotos = 50;
        const minPhotos = 5;
        let idCounter = 0;

        const state = {
            images: []
        };

        const setError = (message) => {
            if (!error) {
                return;
            }
            if (!message) {
                error.textContent = '';
                error.hidden = true;
                return;
            }
            error.textContent = message;
            error.hidden = false;
        };

        const updateStatus = () => {
            const total = state.images.length;

            if (counter) {
                counter.textContent = `${total}/${maxPhotos}`;
            }

            if (minimum) {
                if (total < minPhotos) {
                    minimum.textContent = `Faltan ${minPhotos - total} fotos para llegar al mínimo.`;
                    minimum.classList.remove('is-complete');
                } else {
                    minimum.textContent = 'Mínimo alcanzado.';
                    minimum.classList.add('is-complete');
                }
            }

            if (continueButton) {
                continueButton.disabled = total < minPhotos;
            }

            if (emptyState) {
                emptyState.hidden = total > 0;
            }
        };

        const normalizePrimary = () => {
            if (!state.images.length) {
                return;
            }
            const currentPrimary = state.images.find((image) => image.isPrimary);
            state.images.forEach((image) => {
                image.isPrimary = false;
            });
            if (currentPrimary) {
                const index = state.images.indexOf(currentPrimary);
                if (index > 0) {
                    state.images.splice(index, 1);
                    state.images.unshift(currentPrimary);
                }
                currentPrimary.isPrimary = true;
                return;
            }
            state.images[0].isPrimary = true;
        };

        const renderPreviews = () => {
            if (!grid) {
                return;
            }

            grid.innerHTML = '';
            normalizePrimary();

            state.images.forEach((image) => {
                const item = document.createElement('div');
                item.className = `publish-media__item${image.isPrimary ? ' is-primary' : ''}`;
                item.dataset.id = image.id;

                item.innerHTML = `
                    <div class="publish-media__preview" tabindex="0">
                        <img src="${image.url}" alt="Vista previa de la foto cargada" class="publish-media__image">
                        <span class="publish-media__badge" aria-hidden="${!image.isPrimary}">
                            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                                <path d="M12 3.5l2.47 5a1 1 0 0 0 .75.55l5.52.8-3.99 3.9a1 1 0 0 0-.29.88l.94 5.5-4.95-2.6a1 1 0 0 0-.93 0l-4.95 2.6.94-5.5a1 1 0 0 0-.29-.88L3.26 9.85l5.52-.8a1 1 0 0 0 .75-.55L12 3.5z"></path>
                            </svg>
                            <span>Foto principal</span>
                        </span>
                        <div class="publish-media__actions">
                            <button type="button" class="publish-media__action" data-action="primary" aria-label="Establecer como foto principal">
                                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                                    <path d="M12 3.5l2.47 5a1 1 0 0 0 .75.55l5.52.8-3.99 3.9a1 1 0 0 0-.29.88l.94 5.5-4.95-2.6a1 1 0 0 0-.93 0l-4.95 2.6.94-5.5a1 1 0 0 0-.29-.88L3.26 9.85l5.52-.8a1 1 0 0 0 .75-.55L12 3.5z"></path>
                                </svg>
                            </button>
                            <button type="button" class="publish-media__action publish-media__action--danger" data-action="remove" aria-label="Eliminar foto">
                                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                                    <path d="M9 3a1 1 0 0 0-1 1v1H5a1 1 0 1 0 0 2h1v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7h1a1 1 0 1 0 0-2h-3V4a1 1 0 0 0-1-1H9zm2 4a1 1 0 0 1 1 1v9a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1zm4 1v9a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0zM10 5h4V4h-4v1z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <input class="publish-media__caption" type="text" placeholder="Ingresa un pie de foto" data-caption>
                `;

                const captionInput = item.querySelector('[data-caption]');
                if (captionInput) {
                    captionInput.value = image.caption || '';
                }

                grid.appendChild(item);
            });

            updateStatus();
        };

        const addImages = (files = []) => {
            const incoming = Array.from(files);
            if (!incoming.length) {
                return;
            }

            setError('');

            const validFiles = incoming.filter((file) => file.type.startsWith('image/'));
            const invalidFiles = incoming.filter((file) => !file.type.startsWith('image/'));

            if (invalidFiles.length) {
                setError('Algunas imágenes no son válidas. Por favor selecciona archivos de imagen.');
            }

            const remainingSlots = maxPhotos - state.images.length;
            if (remainingSlots <= 0) {
                setError('Ya alcanzaste el máximo de 50 fotos permitidas.');
                return;
            }

            const filesToAdd = validFiles.slice(0, remainingSlots);
            if (validFiles.length > remainingSlots) {
                setError('Solo se pueden cargar hasta 50 fotos. Se omitieron las adicionales.');
            }

            filesToAdd.forEach((file) => {
                const url = URL.createObjectURL(file);
                state.images.push({
                    id: `media-${Date.now()}-${idCounter++}`,
                    file,
                    url,
                    caption: '',
                    isPrimary: false
                });
            });

            normalizePrimary();
            renderPreviews();
        };

        const setPrimary = (id) => {
            const targetIndex = state.images.findIndex((image) => image.id === id);
            if (targetIndex === -1) {
                return;
            }

            state.images.forEach((image) => {
                image.isPrimary = false;
            });

            const [primary] = state.images.splice(targetIndex, 1);
            primary.isPrimary = true;
            state.images.unshift(primary);
            renderPreviews();
        };

        const removeImage = (id) => {
            const index = state.images.findIndex((image) => image.id === id);
            if (index === -1) {
                return;
            }

            const [removed] = state.images.splice(index, 1);
            if (removed && removed.url) {
                URL.revokeObjectURL(removed.url);
            }

            normalizePrimary();
            renderPreviews();
        };

        const updateCaption = (id, value) => {
            const image = state.images.find((item) => item.id === id);
            if (image) {
                image.caption = value;
            }
        };

        const reorderFromDom = () => {
            if (!grid) {
                return;
            }

            const orderedIds = Array.from(grid.querySelectorAll('.publish-media__item')).map((item) => item.dataset.id);
            const reordered = orderedIds.map((id) => state.images.find((image) => image.id === id)).filter(Boolean);
            state.images = reordered;
            normalizePrimary();
            renderPreviews();
        };

        const handleDropzoneKeydown = (event) => {
            if (!input) {
                return;
            }
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                input.click();
            }
        };

        const handleFiles = (fileList) => {
            addImages(fileList);
            if (input) {
                input.value = '';
            }
        };

        const handleDragOver = (event) => {
            event.preventDefault();
            if (dropzone) {
                dropzone.classList.add('is-dragover');
            }
        };

        const handleDragLeave = (event) => {
            if (event.target === dropzone) {
                dropzone.classList.remove('is-dragover');
            }
        };

        const handleDrop = (event) => {
            event.preventDefault();
            if (dropzone) {
                dropzone.classList.remove('is-dragover');
            }
            if (event.dataTransfer) {
                handleFiles(event.dataTransfer.files);
            }
        };

        let dragState = null;

        const handlePointerDown = (event) => {
            const item = event.target.closest('.publish-media__item');
            if (!item || event.button !== 0) {
                return;
            }

            if (event.target.closest('button') || event.target.closest('input')) {
                return;
            }

            event.preventDefault();

            const rect = item.getBoundingClientRect();
            const placeholder = document.createElement('div');
            placeholder.className = 'publish-media__placeholder';
            placeholder.style.width = `${rect.width}px`;
            placeholder.style.height = `${rect.height}px`;

            item.parentNode.insertBefore(placeholder, item.nextSibling);

            item.classList.add('is-dragging');
            item.style.width = `${rect.width}px`;
            item.style.height = `${rect.height}px`;
            item.style.left = `${rect.left}px`;
            item.style.top = `${rect.top}px`;
            item.style.position = 'fixed';
            item.style.zIndex = '1000';
            item.style.pointerEvents = 'none';

            item.setPointerCapture(event.pointerId);

            dragState = {
                item,
                placeholder,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top,
                pointerId: event.pointerId
            };
        };

        const handlePointerMove = (event) => {
            if (!dragState) {
                return;
            }

            const { item, placeholder, offsetX, offsetY } = dragState;
            item.style.left = `${event.clientX - offsetX}px`;
            item.style.top = `${event.clientY - offsetY}px`;

            const element = document.elementFromPoint(event.clientX, event.clientY);
            if (!element || !grid) {
                return;
            }

            const overItem = element.closest('.publish-media__item');
            if (!overItem || overItem === item) {
                return;
            }

            const overRect = overItem.getBoundingClientRect();
            const isAfter = event.clientY > overRect.top + overRect.height / 2;
            grid.insertBefore(placeholder, isAfter ? overItem.nextSibling : overItem);
        };

        const handlePointerUp = (event) => {
            if (!dragState || !grid) {
                return;
            }

            const { item, placeholder, pointerId } = dragState;

            if (item.hasPointerCapture(pointerId)) {
                item.releasePointerCapture(pointerId);
            }

            item.classList.remove('is-dragging');
            item.style.position = '';
            item.style.left = '';
            item.style.top = '';
            item.style.width = '';
            item.style.height = '';
            item.style.zIndex = '';
            item.style.pointerEvents = '';

            grid.insertBefore(item, placeholder);
            placeholder.remove();

            dragState = null;
            reorderFromDom();
        };

        if (dropzone) {
            dropzone.addEventListener('dragenter', handleDragOver);
            dropzone.addEventListener('dragover', handleDragOver);
            dropzone.addEventListener('dragleave', handleDragLeave);
            dropzone.addEventListener('drop', handleDrop);
            dropzone.addEventListener('keydown', handleDropzoneKeydown);
        }

        if (input) {
            input.addEventListener('change', (event) => handleFiles(event.target.files));
        }

        if (grid) {
            grid.addEventListener('click', (event) => {
                const actionButton = event.target.closest('[data-action]');
                if (!actionButton) {
                    return;
                }
                const item = event.target.closest('.publish-media__item');
                if (!item) {
                    return;
                }
                const action = actionButton.dataset.action;
                const id = item.dataset.id;
                if (action === 'primary') {
                    setPrimary(id);
                }
                if (action === 'remove') {
                    removeImage(id);
                }
            });

            grid.addEventListener('input', (event) => {
                if (!event.target.matches('[data-caption]')) {
                    return;
                }
                const item = event.target.closest('.publish-media__item');
                if (!item) {
                    return;
                }
                updateCaption(item.dataset.id, event.target.value);
            });

            grid.addEventListener('pointerdown', handlePointerDown);
            grid.addEventListener('pointermove', handlePointerMove);
            grid.addEventListener('pointerup', handlePointerUp);
            grid.addEventListener('pointercancel', handlePointerUp);
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

        if (continueButton) {
            continueButton.addEventListener('click', (event) => {
                event.preventDefault();
                if (continueButton.disabled) {
                    setError('Agrega al menos 5 fotos para continuar.');
                }
            });
        }

        panel.addEventListener('publish-media:open', () => {
            renderPreviews();
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

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
            return;
        }

        if (panel.dataset.section === 'publicar-media') {
            initMediaPanel(panel);
        }
    };

    global.ProfilePublish = { init };
})(window);
