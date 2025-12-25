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
        const fileInput = panel.querySelector('[data-media-input]');
        const grid = panel.querySelector('[data-media-grid]');
        const counter = panel.querySelector('[data-media-count]');
        const minimum = panel.querySelector('[data-media-minimum]');
        const errorMessage = panel.querySelector('[data-media-error]');
        const backButton = panel.querySelector('[data-media-back]');
        const continueButton = panel.querySelector('[data-media-continue]');

        const state = {
            images: [],
            min: 5,
            max: 50,
            draggingId: null
        };

        const showError = (message = '') => {
            if (!errorMessage) {
                return;
            }

            if (!message) {
                errorMessage.hidden = true;
                errorMessage.textContent = '';
                return;
            }

            errorMessage.textContent = message;
            errorMessage.hidden = false;
        };

        const updateStatus = () => {
            if (counter) {
                counter.textContent = `${state.images.length}/${state.max}`;
            }

            if (minimum) {
                const remaining = Math.max(state.min - state.images.length, 0);
                if (remaining === 0) {
                    minimum.textContent = 'Listo para continuar con la publicación.';
                    minimum.classList.add('is-valid');
                } else {
                    minimum.textContent = `Faltan ${remaining} fotos para alcanzar el mínimo.`;
                    minimum.classList.remove('is-valid');
                }
            }

            if (continueButton) {
                continueButton.disabled = state.images.length < state.min;
            }
        };

        const ensurePrimary = () => {
            if (!state.images.length) {
                return;
            }

            if (!state.images.some((item) => item.isPrimary)) {
                state.images[0].isPrimary = true;
            }
        };

        const setPrimary = (id) => {
            const targetIndex = state.images.findIndex((item) => item.id === id);
            if (targetIndex === -1) {
                return;
            }

            state.images.forEach((item) => {
                item.isPrimary = false;
            });

            const [item] = state.images.splice(targetIndex, 1);
            item.isPrimary = true;
            state.images.unshift(item);
            renderPreviews();
        };

        const removeImage = (id) => {
            const targetIndex = state.images.findIndex((item) => item.id === id);
            if (targetIndex === -1) {
                return;
            }

            const [removed] = state.images.splice(targetIndex, 1);
            if (removed && removed.previewUrl) {
                URL.revokeObjectURL(removed.previewUrl);
            }

            if (removed.isPrimary && state.images.length) {
                state.images.forEach((item) => {
                    item.isPrimary = false;
                });
                state.images[0].isPrimary = true;
            }

            renderPreviews();
        };

        const updateCaption = (id, value) => {
            const target = state.images.find((item) => item.id === id);
            if (!target) {
                return;
            }
            target.caption = value;
        };

        const reorderFromDom = () => {
            if (!grid) {
                return;
            }

            const ids = Array.from(grid.querySelectorAll('.publish-media__preview-card'))
                .map((card) => card.dataset.id)
                .filter(Boolean);

            const map = new Map(state.images.map((item) => [item.id, item]));
            state.images = ids.map((id) => map.get(id)).filter(Boolean);

            const primaryIndex = state.images.findIndex((item) => item.isPrimary);
            if (primaryIndex > 0) {
                const [primary] = state.images.splice(primaryIndex, 1);
                state.images.unshift(primary);
            }

            renderPreviews();
        };

        const renderPreviews = () => {
            if (!grid) {
                return;
            }

            grid.innerHTML = '';

            if (!state.images.length) {
                const empty = document.createElement('p');
                empty.className = 'publish-media__empty';
                empty.textContent = 'Aún no has cargado fotos. Agrega al menos 5 para continuar.';
                grid.appendChild(empty);
                updateStatus();
                return;
            }

            ensurePrimary();

            state.images.forEach((item) => {
                const card = document.createElement('article');
                card.className = 'publish-media__preview-card';
                card.dataset.id = item.id;
                card.setAttribute('draggable', 'false');

                const image = document.createElement('img');
                image.className = 'publish-media__preview-image';
                image.src = item.previewUrl;
                image.alt = 'Foto cargada de la propiedad';
                image.loading = 'lazy';

                if (item.isPrimary) {
                    const badge = document.createElement('span');
                    badge.className = 'publish-media__badge';
                    badge.textContent = '⭐ Foto principal';
                    card.appendChild(badge);
                }

                const controls = document.createElement('div');
                controls.className = 'publish-media__controls';

                const primaryButton = document.createElement('button');
                primaryButton.type = 'button';
                primaryButton.className = 'publish-media__control-btn';
                primaryButton.setAttribute('aria-label', 'Establecer como foto principal');
                primaryButton.innerHTML = '<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 2l2.39 6.88h7.24l-5.86 4.26 2.24 6.86L12 15.77 6 20l2.24-6.86L2.38 8.88h7.24L12 2z\"></path></svg>';
                primaryButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    setPrimary(item.id);
                });

                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'publish-media__control-btn';
                deleteButton.setAttribute('aria-label', 'Eliminar foto');
                deleteButton.innerHTML = '<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9z\"></path></svg>';
                deleteButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    removeImage(item.id);
                });

                controls.appendChild(primaryButton);
                controls.appendChild(deleteButton);

                const caption = document.createElement('input');
                caption.className = 'publish-media__caption';
                caption.type = 'text';
                caption.placeholder = 'Ingresa un pie de foto';
                caption.value = item.caption || '';
                caption.setAttribute('aria-label', 'Ingresa un pie de foto');
                caption.addEventListener('input', (event) => {
                    updateCaption(item.id, event.target.value);
                });

                card.appendChild(controls);
                card.appendChild(image);
                card.appendChild(caption);
                grid.appendChild(card);
            });

            updateStatus();
        };

        const addFiles = (files) => {
            if (!files || !files.length) {
                return;
            }

            showError('');

            const incoming = Array.from(files);
            const invalidFiles = incoming.filter((file) => !file.type.startsWith('image/'));
            const validFiles = incoming.filter((file) => file.type.startsWith('image/'));

            if (invalidFiles.length) {
                showError('Solo se permiten imágenes en formatos JPG, PNG o WEBP.');
            }

            const remainingSlots = state.max - state.images.length;
            if (remainingSlots <= 0) {
                showError('Ya alcanzaste el máximo de 50 fotos.');
                return;
            }

            const acceptedFiles = validFiles.slice(0, remainingSlots);
            if (validFiles.length > remainingSlots) {
                showError(`Solo puedes subir hasta ${state.max} fotos. Se omitieron ${validFiles.length - remainingSlots} archivos.`);
            }

            acceptedFiles.forEach((file) => {
                state.images.push({
                    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    file,
                    previewUrl: URL.createObjectURL(file),
                    caption: '',
                    isPrimary: false
                });
            });

            if (state.images.length && !state.images.some((item) => item.isPrimary)) {
                state.images[0].isPrimary = true;
            }

            renderPreviews();
        };

        const handleDrop = (event) => {
            event.preventDefault();
            if (dropzone) {
                dropzone.classList.remove('is-dragover');
            }
            if (event.dataTransfer) {
                addFiles(event.dataTransfer.files);
            }
        };

        const handleDragOver = (event) => {
            event.preventDefault();
            if (dropzone) {
                dropzone.classList.add('is-dragover');
            }
        };

        const handleDragLeave = (event) => {
            if (!dropzone || event.relatedTarget === dropzone || dropzone.contains(event.relatedTarget)) {
                return;
            }
            dropzone.classList.remove('is-dragover');
        };

        const handlePointerDown = (event) => {
            if (!grid || event.button !== 0) {
                return;
            }

            if (event.target.closest('button') || event.target.closest('input')) {
                return;
            }

            const card = event.target.closest('.publish-media__preview-card');
            if (!card) {
                return;
            }

            state.draggingId = card.dataset.id;
            card.classList.add('is-dragging');
            card.setPointerCapture(event.pointerId);
        };

        const handlePointerMove = (event) => {
            if (!state.draggingId || !grid) {
                return;
            }

            const activeCard = grid.querySelector(`.publish-media__preview-card[data-id=\"${state.draggingId}\"]`);
            if (!activeCard) {
                return;
            }

            const target = document.elementFromPoint(event.clientX, event.clientY);
            const overCard = target ? target.closest('.publish-media__preview-card') : null;
            if (!overCard || overCard === activeCard) {
                return;
            }

            grid.querySelectorAll('.publish-media__preview-card').forEach((card) => {
                card.classList.remove('is-over');
            });
            overCard.classList.add('is-over');

            const rect = overCard.getBoundingClientRect();
            const shouldInsertBefore = event.clientY < rect.top + rect.height / 2;

            if (shouldInsertBefore) {
                grid.insertBefore(activeCard, overCard);
            } else {
                grid.insertBefore(activeCard, overCard.nextSibling);
            }
        };

        const handlePointerUp = (event) => {
            if (!state.draggingId || !grid) {
                return;
            }

            const activeCard = grid.querySelector(`.publish-media__preview-card[data-id=\"${state.draggingId}\"]`);
            if (activeCard) {
                activeCard.classList.remove('is-dragging');
                activeCard.releasePointerCapture(event.pointerId);
            }

            grid.querySelectorAll('.publish-media__preview-card').forEach((card) => {
                card.classList.remove('is-over');
            });

            state.draggingId = null;
            reorderFromDom();
        };

        if (fileInput) {
            fileInput.addEventListener('change', (event) => {
                addFiles(event.target.files);
                event.target.value = '';
            });
        }

        if (dropzone) {
            dropzone.addEventListener('dragenter', handleDragOver);
            dropzone.addEventListener('dragover', handleDragOver);
            dropzone.addEventListener('dragleave', handleDragLeave);
            dropzone.addEventListener('drop', handleDrop);
            dropzone.addEventListener('click', () => {
                if (fileInput) {
                    fileInput.click();
                }
            });
            dropzone.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (fileInput) {
                        fileInput.click();
                    }
                }
            });
        }

        if (grid) {
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

        panel.addEventListener('publish-media:open', () => {
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
            return;
        }

        if (panel.dataset.section === 'publicar-media') {
            initMediaPanel(panel);
        }
    };

    global.ProfilePublish = { init };
})(window);
