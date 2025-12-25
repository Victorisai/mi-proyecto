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
        const alert = panel.querySelector('[data-media-alert]');
        const countLabel = panel.querySelector('[data-media-count]');
        const continueButton = panel.querySelector('[data-media-continue]');
        const backButton = panel.querySelector('[data-media-back]');

        if (!grid || !dropzone || !fileInput) {
            return;
        }

        const MAX_FILES = 50;
        const MIN_FILES = 5;
        const PREVIEW_LIMIT = 5;
        const state = {
            images: [],
            expanded: false,
            draggingId: null,
            dragPointerId: null
        };

        const supportsFileType = (file) => {
            const name = file.name || '';
            return /image\/(jpeg|png)/.test(file.type) || /\.(jpe?g|png)$/i.test(name);
        };

        const showAlert = (message) => {
            if (!alert) {
                return;
            }
            if (!message) {
                alert.textContent = '';
                alert.hidden = true;
                return;
            }
            alert.textContent = message;
            alert.hidden = false;
        };

        const updateCount = () => {
            if (countLabel) {
                countLabel.textContent = `${state.images.length}/${MAX_FILES} fotos`;
            }
        };

        const updateContinueState = () => {
            if (continueButton) {
                continueButton.disabled = state.images.length < MIN_FILES;
            }
        };

        const updateDropzoneState = () => {
            const reachedMax = state.images.length >= MAX_FILES;
            dropzone.classList.toggle('is-disabled', reachedMax);
            dropzone.setAttribute('aria-disabled', String(reachedMax));
            fileInput.disabled = reachedMax;
        };

        const ensurePrimary = () => {
            if (!state.images.length) {
                return;
            }
            const hasPrimary = state.images.some((image) => image.isPrimary);
            if (!hasPrimary) {
                state.images[0].isPrimary = true;
            }
        };

        const readFile = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
            reader.readAsDataURL(file);
        });

        const createImageItem = async (file) => {
            const url = await readFile(file);
            return {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                file,
                url,
                caption: '',
                rotation: 0,
                isPrimary: false
            };
        };

        const renderMediaCard = (image) => {
            const card = document.createElement('article');
            card.className = 'media-card';
            card.dataset.mediaId = image.id;

            const preview = document.createElement('div');
            preview.className = 'media-card__preview';

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.caption ? `Foto: ${image.caption}` : 'Vista previa de la foto';
            img.style.transform = `rotate(${image.rotation}deg)`;
            preview.appendChild(img);

            if (image.isPrimary) {
                const badge = document.createElement('span');
                badge.className = 'media-card__badge';
                badge.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.6 2.7 5.4 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 8.9l6-.9L12 2.6Z" fill="currentColor"/></svg><span>Foto principal</span>';
                preview.appendChild(badge);
            }

            const actions = document.createElement('div');
            actions.className = 'media-card__actions';

            const primaryButton = document.createElement('button');
            primaryButton.type = 'button';
            primaryButton.className = 'media-card__action';
            primaryButton.setAttribute('aria-label', 'Establecer como foto principal');
            primaryButton.innerHTML = '<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m12 2.6 2.7 5.4 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 8.9l6-.9L12 2.6Z\" fill=\"currentColor\"/></svg>';

            const rotateButton = document.createElement('button');
            rotateButton.type = 'button';
            rotateButton.className = 'media-card__action';
            rotateButton.setAttribute('aria-label', 'Rotar foto');
            rotateButton.innerHTML = '<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 4a8 8 0 1 1-7.5 10.3 1 1 0 1 1 1.9-.6A6 6 0 1 0 12 6h-1.4l1.7 1.7a1 1 0 1 1-1.4 1.4l-3.4-3.4c-.4-.4-.4-1 0-1.4l3.4-3.4a1 1 0 1 1 1.4 1.4L10.6 4H12Z\" fill=\"currentColor\"/></svg>';

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'media-card__action media-card__action--danger';
            removeButton.setAttribute('aria-label', 'Eliminar foto');
            removeButton.innerHTML = '<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M9 3a1 1 0 0 0-1 1v1H5.5a1 1 0 0 0 0 2h.8l.8 12.2A2 2 0 0 0 9.1 21h5.8a2 2 0 0 0 2-1.8L17.7 7h.8a1 1 0 0 0 0-2H16V4a1 1 0 0 0-1-1H9Zm1 2h4v1h-4V5Zm-.8 4.5a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm5.6 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z\" fill=\"currentColor\"/></svg>';

            actions.appendChild(primaryButton);
            actions.appendChild(rotateButton);
            actions.appendChild(removeButton);
            preview.appendChild(actions);

            const caption = document.createElement('input');
            caption.type = 'text';
            caption.className = 'media-card__caption';
            caption.placeholder = 'Ingresa un pie de foto';
            caption.value = image.caption;
            caption.setAttribute('aria-label', 'Pie de foto');

            card.appendChild(preview);
            card.appendChild(caption);

            primaryButton.addEventListener('click', (event) => {
                event.preventDefault();
                setPrimary(image.id);
            });

            rotateButton.addEventListener('click', (event) => {
                event.preventDefault();
                rotateImage(image.id);
            });

            removeButton.addEventListener('click', (event) => {
                event.preventDefault();
                removeImage(image.id);
            });

            caption.addEventListener('input', () => {
                image.caption = caption.value;
            });

            return card;
        };

        const renderViewMoreCard = (remainingCount, previewImage) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'media-more';
            card.dataset.mediaViewMore = 'true';
            card.setAttribute('aria-label', 'Ver más fotos');

            if (previewImage) {
                card.style.backgroundImage = `url(${previewImage.url})`;
            }

            const count = document.createElement('span');
            count.className = 'media-more__count';
            count.textContent = `+${remainingCount}`;

            const label = document.createElement('span');
            label.className = 'media-more__label';
            label.textContent = 'Ver más fotos';

            card.appendChild(count);
            card.appendChild(label);

            card.addEventListener('click', () => {
                state.expanded = true;
                renderPreviews();
            });

            return card;
        };

        const renderPreviews = () => {
            const currentItems = grid.querySelectorAll('[data-media-id], [data-media-view-more]');
            currentItems.forEach((item) => item.remove());

            ensurePrimary();

            const shouldCollapse = state.images.length > PREVIEW_LIMIT && !state.expanded;
            const previewItems = shouldCollapse ? state.images.slice(0, PREVIEW_LIMIT - 1) : state.images;

            previewItems.forEach((image) => {
                const card = renderMediaCard(image);
                grid.appendChild(card);
            });

            if (shouldCollapse) {
                const remainingCount = Math.max(state.images.length - PREVIEW_LIMIT, 0);
                const previewImage = state.images[PREVIEW_LIMIT - 1];
                const viewMoreCard = renderViewMoreCard(remainingCount, previewImage);
                viewMoreCard.dataset.mediaViewMore = 'true';
                grid.appendChild(viewMoreCard);
            }

            updateDropzoneState();
            updateCount();
            updateContinueState();
        };

        const setPrimary = (id) => {
            state.images.forEach((image) => {
                image.isPrimary = image.id === id;
            });

            const index = state.images.findIndex((image) => image.id === id);
            if (index > 0) {
                const [image] = state.images.splice(index, 1);
                state.images.unshift(image);
            }

            renderPreviews();
        };

        const rotateImage = (id) => {
            const image = state.images.find((item) => item.id === id);
            if (!image) {
                return;
            }
            image.rotation = (image.rotation + 90) % 360;
            renderPreviews();
        };

        const removeImage = (id) => {
            const removedIndex = state.images.findIndex((image) => image.id === id);
            if (removedIndex === -1) {
                return;
            }
            state.images.splice(removedIndex, 1);
            if (state.images.length <= PREVIEW_LIMIT) {
                state.expanded = false;
            }
            ensurePrimary();
            renderPreviews();
        };

        const handleFiles = async (files) => {
            if (!files || !files.length) {
                return;
            }

            showAlert('');

            const validFiles = [];
            const errors = [];

            Array.from(files).forEach((file) => {
                if (!supportsFileType(file)) {
                    errors.push(`El archivo ${file.name} no tiene un formato válido.`);
                    return;
                }
                validFiles.push(file);
            });

            if (state.images.length + validFiles.length > MAX_FILES) {
                const remaining = Math.max(MAX_FILES - state.images.length, 0);
                if (remaining === 0) {
                    errors.push('Ya alcanzaste el máximo de 50 fotos.');
                } else {
                    errors.push(`Solo puedes agregar ${remaining} fotos más.`);
                }
                validFiles.splice(remaining);
            }

            if (errors.length) {
                showAlert(errors[0]);
            }

            if (!validFiles.length) {
                updateDropzoneState();
                return;
            }

            try {
                const items = await Promise.all(validFiles.map((file) => createImageItem(file)));
                state.images.push(...items);
                ensurePrimary();
                renderPreviews();
            } catch (error) {
                console.error(error);
                showAlert('Ocurrió un error al cargar las imágenes. Intenta nuevamente.');
            }
        };

        const collectDragOrder = () => {
            const items = Array.from(grid.querySelectorAll('.media-card[data-media-id]'));
            const map = new Map(state.images.map((image) => [image.id, image]));
            state.images = items.map((item) => map.get(item.dataset.mediaId)).filter(Boolean);
            ensurePrimary();
            renderPreviews();
        };

        const handlePointerDown = (event) => {
            if (event.button !== 0) {
                return;
            }

            if (state.images.length > PREVIEW_LIMIT && !state.expanded) {
                return;
            }

            const card = event.target.closest('.media-card[data-media-id]');
            if (!card || card.dataset.mediaId === undefined) {
                return;
            }

            if (event.target.closest('button, input')) {
                return;
            }

            state.draggingId = card.dataset.mediaId;
            state.dragPointerId = event.pointerId;
            card.classList.add('is-dragging');
            grid.classList.add('is-dragging');
            card.setPointerCapture(event.pointerId);
        };

        const handlePointerMove = (event) => {
            if (!state.draggingId || event.pointerId !== state.dragPointerId) {
                return;
            }

            const draggingElement = grid.querySelector(`.media-card[data-media-id=\"${state.draggingId}\"]`);
            if (!draggingElement) {
                return;
            }

            const element = document.elementFromPoint(event.clientX, event.clientY);
            const targetCard = element ? element.closest('.media-card[data-media-id]') : null;
            if (!targetCard || targetCard === draggingElement) {
                return;
            }

            const rect = targetCard.getBoundingClientRect();
            const insertBefore = event.clientY < rect.top + rect.height / 2;
            grid.insertBefore(draggingElement, insertBefore ? targetCard : targetCard.nextSibling);
        };

        const handlePointerUp = (event) => {
            if (!state.draggingId || event.pointerId !== state.dragPointerId) {
                return;
            }

            const draggingElement = grid.querySelector(`.media-card[data-media-id=\"${state.draggingId}\"]`);
            if (draggingElement) {
                draggingElement.classList.remove('is-dragging');
                draggingElement.releasePointerCapture(event.pointerId);
            }

            grid.classList.remove('is-dragging');
            state.draggingId = null;
            state.dragPointerId = null;
            collectDragOrder();
        };

        dropzone.addEventListener('click', () => {
            if (!fileInput.disabled) {
                fileInput.click();
            }
        });

        dropzone.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (!fileInput.disabled) {
                    fileInput.click();
                }
            }
        });

        dropzone.addEventListener('dragover', (event) => {
            event.preventDefault();
            if (fileInput.disabled) {
                return;
            }
            dropzone.classList.add('is-dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('is-dragover');
        });

        dropzone.addEventListener('drop', (event) => {
            event.preventDefault();
            dropzone.classList.remove('is-dragover');
            if (fileInput.disabled) {
                return;
            }
            handleFiles(event.dataTransfer.files);
        });

        fileInput.addEventListener('change', (event) => {
            handleFiles(event.target.files);
            event.target.value = '';
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
