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
        const input = panel.querySelector('[data-media-input]');
        const errorMessage = panel.querySelector('[data-media-error]');
        const continueButton = panel.querySelector('[data-media-continue]');
        const backButton = panel.querySelector('[data-media-back]');

        if (!grid || !dropzone || !input) {
            return;
        }

        const MAX_FILES = 50;
        const MIN_FILES = 5;
        const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
        let images = [];
        let dragState = null;
        let idCounter = 0;

        const showError = (message = '') => {
            if (!errorMessage) {
                return;
            }
            errorMessage.textContent = message;
            errorMessage.hidden = !message;
        };

        const updateContinueState = () => {
            if (!continueButton) {
                return;
            }
            continueButton.disabled = images.length < MIN_FILES;
        };

        const updateDropzoneState = () => {
            const isDisabled = images.length >= MAX_FILES;
            dropzone.classList.toggle('is-disabled', isDisabled);
            dropzone.classList.toggle('is-hidden', isDisabled);
            input.disabled = isDisabled;
        };

        const ensurePrimary = () => {
            if (!images.length) {
                return;
            }

            const hasPrimary = images.some((image) => image.isPrimary);
            if (!hasPrimary) {
                images[0].isPrimary = true;
            }
        };

        const renderPreviews = () => {
            grid.querySelectorAll('.media-preview, .media-grid__placeholder').forEach((item) => item.remove());

            images.forEach((image, index) => {
                const preview = document.createElement('article');
                preview.className = 'media-preview';
                preview.dataset.mediaId = image.id;

                preview.innerHTML = `
                    <div class="media-preview__frame">
                        ${image.isPrimary ? `
                            <span class="media-preview__badge">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
                                    <path d="m12 3 2.7 5.6 6.2.9-4.5 4.4 1.1 6.1L12 17.8 6.5 20l1.1-6.1L3 9.5l6.3-.9L12 3Z" fill="#facc15"/>
                                </svg>
                                Foto principal
                            </span>
                        ` : ''}
                        <img class="media-preview__image" src="${image.url}" alt="Foto ${index + 1}" style="transform: rotate(${image.rotation}deg);">
                        <div class="media-preview__actions">
                            <button type="button" class="media-preview__action" data-media-action="primary" aria-label="Establecer como principal">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
                                    <path d="m12 3 2.7 5.6 6.2.9-4.5 4.4 1.1 6.1L12 17.8 6.5 20l1.1-6.1L3 9.5l6.3-.9L12 3Z" fill="currentColor"/>
                                </svg>
                            </button>
                            <button type="button" class="media-preview__action" data-media-action="rotate" aria-label="Rotar foto">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
                                    <path d="M12 4a8 8 0 1 1-7.7 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    <path d="M4 4v6h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </button>
                            <button type="button" class="media-preview__action media-preview__action--danger" data-media-action="remove" aria-label="Eliminar foto">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
                                    <path d="M6 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    <path d="M9 7V5h6v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    <path d="M8 7l1 12h6l1-12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="media-preview__caption">
                        <label class="sr-only" for="caption-${image.id}">Ingresa un pie de foto</label>
                        <input id="caption-${image.id}" class="media-preview__input" type="text" placeholder="Ingresa un pie de foto">
                    </div>
                `;

                const captionInput = preview.querySelector('.media-preview__input');
                if (captionInput) {
                    captionInput.value = image.caption;
                    captionInput.dataset.mediaCaption = image.id;
                }

                grid.appendChild(preview);
            });

            updateDropzoneState();
            updateContinueState();
        };

        const setPrimary = (id) => {
            images = images.map((image) => ({
                ...image,
                isPrimary: image.id === id
            }));

            const primaryIndex = images.findIndex((image) => image.id === id);
            if (primaryIndex > 0) {
                const [primary] = images.splice(primaryIndex, 1);
                images.unshift(primary);
            }

            renderPreviews();
        };

        const removeImage = (id) => {
            const imageToRemove = images.find((image) => image.id === id);
            if (imageToRemove && imageToRemove.url) {
                URL.revokeObjectURL(imageToRemove.url);
            }

            images = images.filter((image) => image.id !== id);
            ensurePrimary();
            renderPreviews();
        };

        const rotateImage = (id) => {
            images = images.map((image) => {
                if (image.id !== id) {
                    return image;
                }
                return {
                    ...image,
                    rotation: (image.rotation + 90) % 360
                };
            });
            renderPreviews();
        };

        const updateCaption = (id, value) => {
            images = images.map((image) => (image.id === id ? { ...image, caption: value } : image));
        };

        const handleFiles = (fileList) => {
            showError('');

            const files = Array.from(fileList || []);
            if (!files.length) {
                return;
            }

            const invalidFiles = files.filter((file) => !ACCEPTED_TYPES.includes(file.type));
            if (invalidFiles.length) {
                showError('Solo se permiten imágenes JPG o PNG.');
            }

            const validFiles = files.filter((file) => ACCEPTED_TYPES.includes(file.type));
            const availableSlots = MAX_FILES - images.length;

            if (validFiles.length > availableSlots) {
                showError('Solo puedes cargar hasta 50 fotos.');
            }

            validFiles.slice(0, availableSlots).forEach((file) => {
                images.push({
                    id: `media-${Date.now()}-${idCounter++}`,
                    file,
                    url: URL.createObjectURL(file),
                    caption: '',
                    isPrimary: false,
                    rotation: 0
                });
            });

            ensurePrimary();
            renderPreviews();
        };

        const createPlaceholder = (rect) => {
            const placeholder = document.createElement('div');
            placeholder.className = 'media-grid__placeholder';
            placeholder.style.width = `${rect.width}px`;
            placeholder.style.height = `${rect.height}px`;
            return placeholder;
        };

        const getReorderedImages = () => {
            const items = Array.from(grid.querySelectorAll('.media-preview'));
            const orderMap = new Map(images.map((image) => [image.id, image]));
            return items.map((item) => orderMap.get(item.dataset.mediaId)).filter(Boolean);
        };

        const clearDragState = () => {
            if (!dragState) {
                return;
            }

            const { preview, placeholder, pointerId } = dragState;
            preview.releasePointerCapture(pointerId);
            preview.classList.remove('is-dragging');
            preview.style.removeProperty('transform');
            preview.style.removeProperty('left');
            preview.style.removeProperty('top');
            preview.style.removeProperty('width');
            preview.style.removeProperty('height');
            preview.style.removeProperty('position');
            preview.style.removeProperty('z-index');

            if (placeholder && placeholder.parentElement) {
                placeholder.replaceWith(preview);
            }

            images = getReorderedImages();
            ensurePrimary();
            dragState = null;
            renderPreviews();
        };

        const handlePointerDown = (event) => {
            const preview = event.target.closest('.media-preview');
            if (!preview || event.target.closest('button, input, textarea')) {
                return;
            }

            event.preventDefault();

            const rect = preview.getBoundingClientRect();
            const gridRect = grid.getBoundingClientRect();
            const placeholder = createPlaceholder(rect);

            preview.after(placeholder);
            preview.classList.add('is-dragging');
            preview.style.position = 'absolute';
            preview.style.width = `${rect.width}px`;
            preview.style.height = `${rect.height}px`;
            preview.style.left = `${rect.left - gridRect.left}px`;
            preview.style.top = `${rect.top - gridRect.top}px`;
            preview.style.zIndex = '10';

            preview.setPointerCapture(event.pointerId);

            dragState = {
                preview,
                placeholder,
                startX: event.clientX,
                startY: event.clientY,
                pointerId: event.pointerId
            };
        };

        const handlePointerMove = (event) => {
            if (!dragState) {
                return;
            }

            event.preventDefault();

            const deltaX = event.clientX - dragState.startX;
            const deltaY = event.clientY - dragState.startY;

            dragState.preview.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;

            const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY);
            const targetPreview = elementAtPoint ? elementAtPoint.closest('.media-preview') : null;

            if (!targetPreview || targetPreview === dragState.preview) {
                return;
            }

            const targetRect = targetPreview.getBoundingClientRect();
            const shouldInsertAfter = event.clientY > targetRect.top + targetRect.height / 2;
            const referenceNode = shouldInsertAfter ? targetPreview.nextSibling : targetPreview;

            if (referenceNode !== dragState.placeholder) {
                grid.insertBefore(dragState.placeholder, referenceNode);
            }
        };

        const handlePointerUp = () => {
            if (!dragState) {
                return;
            }
            clearDragState();
        };

        dropzone.addEventListener('click', (event) => {
            if (dropzone.classList.contains('is-disabled')) {
                return;
            }

            if (event.target === input) {
                return;
            }

            input.click();
        });

        dropzone.addEventListener('keydown', (event) => {
            if (dropzone.classList.contains('is-disabled')) {
                return;
            }
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                input.click();
            }
        });

        dropzone.addEventListener('dragover', (event) => {
            if (dropzone.classList.contains('is-disabled')) {
                return;
            }
            event.preventDefault();
            dropzone.classList.add('is-dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('is-dragover');
        });

        dropzone.addEventListener('drop', (event) => {
            if (dropzone.classList.contains('is-disabled')) {
                return;
            }
            event.preventDefault();
            dropzone.classList.remove('is-dragover');
            handleFiles(event.dataTransfer.files);
        });

        input.addEventListener('change', (event) => {
            handleFiles(event.target.files);
            input.value = '';
        });

        grid.addEventListener('click', (event) => {
            const actionButton = event.target.closest('[data-media-action]');
            if (!actionButton) {
                return;
            }

            const preview = actionButton.closest('.media-preview');
            if (!preview) {
                return;
            }

            const id = preview.dataset.mediaId;
            const action = actionButton.dataset.mediaAction;

            if (action === 'primary') {
                setPrimary(id);
            }

            if (action === 'remove') {
                removeImage(id);
            }

            if (action === 'rotate') {
                rotateImage(id);
            }
        });

        grid.addEventListener('input', (event) => {
            const inputElement = event.target.closest('[data-media-caption]');
            if (!inputElement) {
                return;
            }
            updateCaption(inputElement.dataset.mediaCaption, inputElement.value);
        });

        grid.addEventListener('pointerdown', handlePointerDown);
        grid.addEventListener('pointermove', handlePointerMove);
        grid.addEventListener('pointerup', handlePointerUp);
        grid.addEventListener('pointercancel', handlePointerUp);

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
            renderPreviews();
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
