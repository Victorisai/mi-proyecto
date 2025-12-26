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
        const alertBox = panel.querySelector('[data-media-alert]');
        const grid = panel.querySelector('[data-media-grid]');
        const dropzone = panel.querySelector('[data-media-dropzone]');
        const input = panel.querySelector('[data-media-input]');
        const backButton = panel.querySelector('[data-media-back]');
        const continueButton = panel.querySelector('[data-media-continue]');

        const state = {
            photos: [],
            expanded: false,
            drag: null
        };

        const MAX_FILES = 50;
        const MIN_FILES = 5;
        const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

        const showAlert = (message = '') => {
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

        const updateDropzoneState = () => {
            if (!dropzone || !input) {
                return;
            }

            const isDisabled = state.photos.length >= MAX_FILES;
            dropzone.classList.toggle('is-disabled', isDisabled);
            input.disabled = isDisabled;
            dropzone.setAttribute('aria-disabled', String(isDisabled));
        };

        const updateContinueState = () => {
            if (!continueButton) {
                return;
            }
            continueButton.disabled = state.photos.length < MIN_FILES;
        };

        const ensurePrimary = () => {
            if (!state.photos.length) {
                return;
            }
            state.photos.forEach((photo, index) => {
                photo.isPrimary = index === 0;
            });
        };

        const buildPreviewCard = (photo, index) => {
            const card = document.createElement('div');
            card.className = 'media-grid__item media-preview';
            card.dataset.mediaItem = 'photo';
            card.dataset.photoId = photo.id;
            card.dataset.photoIndex = String(index);

            const badge = photo.isPrimary
                ? '<span class="media-preview__badge">Foto principal</span>'
                : '';

            card.innerHTML = `
                <div class="media-preview__image">
                    <img src="${photo.url}" alt="Vista previa de la foto ${index + 1}" style="transform: rotate(${photo.rotation}deg);">
                    ${badge}
                    <div class="media-preview__controls">
                        <button type="button" class="media-preview__control" data-action="primary" aria-label="Marcar como foto principal">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
                                <path d="M12 3.5l2.7 5.47 6.03.88-4.36 4.25 1.03 6.01L12 17.9l-5.4 2.86 1.03-6.01-4.36-4.25 6.03-.88L12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button type="button" class="media-preview__control" data-action="rotate" aria-label="Rotar foto">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
                                <path d="M6 6v4h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8 10a7 7 0 1 1-1.7 7.35" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                            </svg>
                        </button>
                        <button type="button" class="media-preview__control" data-action="remove" aria-label="Eliminar foto">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
                                <path d="M4 7h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                                <path d="M9 7V5h6v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                                <path d="M7 7l1 12h8l1-12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <input class="media-preview__caption" type="text" placeholder="Ingresa un pie de foto" value="${photo.caption || ''}" data-media-caption>
            `;

            return card;
        };

        const buildViewMoreCard = (hiddenCount) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'media-grid__item media-grid__more';
            card.dataset.mediaExpand = 'true';
            card.innerHTML = `
                <span class="media-grid__more-count">+${hiddenCount}</span>
                <span class="media-grid__more-label">Ver más fotos</span>
            `;
            return card;
        };

        const renderPreviews = () => {
            if (!grid || !dropzone) {
                return;
            }

            const photos = state.photos;
            const showExpanded = state.expanded || photos.length <= 5;
            const visiblePhotos = showExpanded ? photos : photos.slice(0, 5);

            grid.innerHTML = '';
            grid.appendChild(dropzone);

            visiblePhotos.forEach((photo, index) => {
                const card = buildPreviewCard(photo, index);
                grid.appendChild(card);
            });

            if (!showExpanded && photos.length > 5) {
                const hiddenCount = photos.length - visiblePhotos.length;
                const moreCard = buildViewMoreCard(hiddenCount);
                grid.appendChild(moreCard);
            }

            updateDropzoneState();
            updateContinueState();
        };

        const setPrimary = (photoId) => {
            const index = state.photos.findIndex((photo) => photo.id === photoId);
            if (index <= 0) {
                ensurePrimary();
                renderPreviews();
                return;
            }

            const [photo] = state.photos.splice(index, 1);
            state.photos.unshift(photo);
            ensurePrimary();
            renderPreviews();
        };

        const removeImage = (photoId) => {
            const index = state.photos.findIndex((photo) => photo.id === photoId);
            if (index === -1) {
                return;
            }
            const [removed] = state.photos.splice(index, 1);
            if (removed && removed.url) {
                URL.revokeObjectURL(removed.url);
            }
            ensurePrimary();
            renderPreviews();
        };

        const rotateImage = (photoId) => {
            const photo = state.photos.find((item) => item.id === photoId);
            if (!photo) {
                return;
            }
            photo.rotation = (photo.rotation + 90) % 360;
            renderPreviews();
        };

        const updateCaption = (photoId, value) => {
            const photo = state.photos.find((item) => item.id === photoId);
            if (!photo) {
                return;
            }
            photo.caption = value;
        };

        const handleFiles = (fileList) => {
            const files = Array.from(fileList || []);
            if (!files.length) {
                return;
            }

            const availableSlots = MAX_FILES - state.photos.length;
            if (availableSlots <= 0) {
                showAlert('Has alcanzado el máximo de 50 fotos permitidas.');
                return;
            }

            const invalidFiles = files.filter((file) => !ACCEPTED_TYPES.includes(file.type));
            if (invalidFiles.length) {
                showAlert('Solo se permiten archivos JPG, JPEG o PNG. Revisa las fotos seleccionadas.');
            } else {
                showAlert('');
            }

            const validFiles = files.filter((file) => ACCEPTED_TYPES.includes(file.type));
            const selected = validFiles.slice(0, availableSlots);

            selected.forEach((file) => {
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

        const handleDrop = (event) => {
            event.preventDefault();
            dropzone.classList.remove('is-dragover');
            if (event.dataTransfer && event.dataTransfer.files) {
                handleFiles(event.dataTransfer.files);
            }
        };

        const handleDragOver = (event) => {
            event.preventDefault();
            dropzone.classList.add('is-dragover');
        };

        const handleDragLeave = () => {
            dropzone.classList.remove('is-dragover');
        };

        const handlePointerDown = (event) => {
            const target = event.target;
            if (target.closest('button, input, textarea, select')) {
                return;
            }

            const card = target.closest('[data-media-item="photo"]');
            if (!card || !grid) {
                return;
            }

            const photoIndex = Number(card.dataset.photoIndex);
            if (Number.isNaN(photoIndex)) {
                return;
            }

            const rect = card.getBoundingClientRect();
            const placeholder = document.createElement('div');
            placeholder.className = 'media-grid__placeholder';
            placeholder.style.width = `${rect.width}px`;
            placeholder.style.height = `${rect.height}px`;

            card.classList.add('is-dragging');
            card.style.width = `${rect.width}px`;
            card.style.height = `${rect.height}px`;
            card.style.position = 'fixed';
            card.style.top = `${rect.top}px`;
            card.style.left = `${rect.left}px`;
            card.style.margin = '0';
            card.style.zIndex = '20';
            card.style.pointerEvents = 'none';

            card.parentNode.insertBefore(placeholder, card);

            state.drag = {
                card,
                placeholder,
                startX: event.clientX,
                startY: event.clientY,
                photoIndex
            };

            card.setPointerCapture(event.pointerId);
        };

        const handlePointerMove = (event) => {
            if (!state.drag) {
                return;
            }

            const { card, startX, startY, placeholder } = state.drag;
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            card.style.transform = `translate(${dx}px, ${dy}px)`;

            const element = document.elementFromPoint(event.clientX, event.clientY);
            const target = element ? element.closest('[data-media-item=\"photo\"]') : null;

            if (target && target !== card && target.parentNode === grid) {
                const targetRect = target.getBoundingClientRect();
                const isBefore = event.clientY < targetRect.top + targetRect.height / 2;
                if (isBefore) {
                    grid.insertBefore(placeholder, target);
                } else {
                    grid.insertBefore(placeholder, target.nextSibling);
                }
            }
        };

        const handlePointerUp = () => {
            if (!state.drag) {
                return;
            }

            const { card, placeholder, photoIndex } = state.drag;
            const orderedNodes = Array.from(grid.querySelectorAll('[data-media-item=\"photo\"], .media-grid__placeholder'));
            const orderedIndices = orderedNodes.map((node) => {
                if (node.classList.contains('media-grid__placeholder')) {
                    return photoIndex;
                }
                return Number(node.dataset.photoIndex);
            });

            const photos = state.photos;

            if (state.expanded || photos.length <= 5) {
                state.photos = orderedIndices.map((index) => photos[index]);
            } else {
                const newOrder = orderedIndices.map((index) => photos[index]);
                state.photos = photos.slice();
                state.photos.splice(0, newOrder.length, ...newOrder);
            }

            ensurePrimary();

            if (card) {
                card.classList.remove('is-dragging');
                card.removeAttribute('style');
            }
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.removeChild(placeholder);
            }

            state.drag = null;
            renderPreviews();
        };

        const handlePointerCancel = () => {
            if (!state.drag) {
                return;
            }

            const { card, placeholder } = state.drag;
            if (card) {
                card.classList.remove('is-dragging');
                card.removeAttribute('style');
            }
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.removeChild(placeholder);
            }
            state.drag = null;
            renderPreviews();
        };

        const applyMediaContext = (detail = {}) => {
            const purpose = detail.purposeLabel || panel.dataset.publishPurposeLabel || 'Propósito no definido';
            const typeLabel = detail.typeLabel || panel.dataset.publishTypeLabel || 'Tipo no definido';
            const subtype = detail.subtype || panel.dataset.publishSubtype || 'Subtipo no definido';

            panel.dataset.publishPurposeLabel = purpose;
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

        if (input) {
            input.addEventListener('change', (event) => {
                const files = event.target.files;
                handleFiles(files);
                event.target.value = '';
            });
        }

        if (dropzone) {
            dropzone.addEventListener('click', () => {
                if (input && !input.disabled) {
                    input.click();
                }
            });

            dropzone.addEventListener('dragover', handleDragOver);
            dropzone.addEventListener('dragleave', handleDragLeave);
            dropzone.addEventListener('drop', handleDrop);
        }

        if (grid) {
            grid.addEventListener('click', (event) => {
                const expandButton = event.target.closest('[data-media-expand]');
                if (expandButton) {
                    state.expanded = true;
                    renderPreviews();
                    return;
                }

                const button = event.target.closest('[data-action]');
                if (!button) {
                    return;
                }
                const card = button.closest('[data-media-item=\"photo\"]');
                if (!card) {
                    return;
                }
                const photoId = card.dataset.photoId;
                if (!photoId) {
                    return;
                }
                const action = button.dataset.action;
                if (action === 'primary') {
                    setPrimary(photoId);
                }
                if (action === 'remove') {
                    removeImage(photoId);
                }
                if (action === 'rotate') {
                    rotateImage(photoId);
                }
            });

            grid.addEventListener('input', (event) => {
                const inputField = event.target.closest('[data-media-caption]');
                if (!inputField) {
                    return;
                }
                const card = inputField.closest('[data-media-item=\"photo\"]');
                if (!card) {
                    return;
                }
                const photoId = card.dataset.photoId;
                updateCaption(photoId, inputField.value);
            });

            grid.addEventListener('pointerdown', handlePointerDown);
            grid.addEventListener('pointermove', handlePointerMove);
            grid.addEventListener('pointerup', handlePointerUp);
            grid.addEventListener('pointercancel', handlePointerCancel);
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
