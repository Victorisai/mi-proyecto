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
        const fileInput = panel.querySelector('[data-media-input]');
        const dropzone = panel.querySelector('[data-media-dropzone]');
        const trigger = panel.querySelector('[data-media-trigger]');
        const alertBox = panel.querySelector('[data-media-alert]');
        const continueButton = panel.querySelector('[data-media-continue]');
        const backButton = panel.querySelector('[data-media-back]');

        if (!grid || !fileInput || !dropzone) {
            return;
        }

        const minPhotos = 5;
        const maxPhotos = 50;
        const acceptedTypes = ['image/jpeg', 'image/png'];
        let mediaItems = [];
        let isExpanded = false;
        let dragState = null;

        const setAlert = (messages = []) => {
            if (!alertBox) {
                return;
            }

            if (!messages.length) {
                alertBox.hidden = true;
                alertBox.innerHTML = '';
                return;
            }

            alertBox.hidden = false;
            alertBox.innerHTML = `<ul>${messages.map((message) => `<li>${message}</li>`).join('')}</ul>`;
        };

        const updateContinueState = () => {
            if (!continueButton) {
                return;
            }
            const isValid = mediaItems.length >= minPhotos;
            continueButton.disabled = !isValid;
            continueButton.setAttribute('aria-disabled', String(!isValid));
        };

        const updateDropzoneState = () => {
            const isFull = mediaItems.length >= maxPhotos;
            dropzone.classList.toggle('media-dropzone--disabled', isFull);
            dropzone.setAttribute('aria-disabled', String(isFull));
            fileInput.disabled = isFull;
        };

        const ensurePrimary = () => {
            if (!mediaItems.length) {
                return;
            }

            mediaItems.forEach((item, index) => {
                item.isPrimary = index === 0;
            });
        };

        const updatePrimary = (id) => {
            const index = mediaItems.findIndex((item) => item.id === id);
            if (index === -1) {
                return;
            }

            const [selected] = mediaItems.splice(index, 1);
            mediaItems.unshift(selected);
            ensurePrimary();
            renderPreviews();
        };

        const removeImage = (id) => {
            const index = mediaItems.findIndex((item) => item.id === id);
            if (index === -1) {
                return;
            }

            const [removed] = mediaItems.splice(index, 1);
            if (removed && removed.url) {
                URL.revokeObjectURL(removed.url);
            }
            ensurePrimary();
            if (mediaItems.length <= 5) {
                isExpanded = false;
            }
            renderPreviews();
        };

        const updateCaption = (id, value) => {
            const item = mediaItems.find((entry) => entry.id === id);
            if (!item) {
                return;
            }
            item.caption = value;
        };

        const rotateImage = (id) => {
            const item = mediaItems.find((entry) => entry.id === id);
            if (!item) {
                return;
            }
            item.rotation = (item.rotation + 90) % 360;
            renderPreviews();
        };

        const setExpanded = () => {
            isExpanded = true;
            renderPreviews();
        };

        const handleFiles = (files) => {
            if (!files || !files.length) {
                return;
            }

            const messages = [];
            const availableSlots = maxPhotos - mediaItems.length;
            const incoming = Array.from(files).slice(0, availableSlots);

            files.forEach((file) => {
                if (!acceptedTypes.includes(file.type)) {
                    messages.push(`El archivo ${file.name} no es válido. Usa JPG o PNG.`);
                }
            });

            if (files.length > availableSlots) {
                messages.push('Se alcanzó el máximo de 50 fotos.');
            }

            const validFiles = incoming.filter((file) => acceptedTypes.includes(file.type));

            validFiles.forEach((file) => {
                mediaItems.push({
                    id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    file,
                    url: URL.createObjectURL(file),
                    caption: '',
                    rotation: 0,
                    isPrimary: false
                });
            });

            ensurePrimary();
            setAlert(messages);
            renderPreviews();
        };

        const getVisibleItems = () => (isExpanded ? mediaItems : mediaItems.slice(0, 5));

        const createIcon = (path, viewBox = '0 0 24 24', options = {}) => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', viewBox);
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('focusable', 'false');
            if (options.fill) {
                svg.setAttribute('fill', options.fill);
            }
            if (options.stroke) {
                svg.setAttribute('stroke', options.stroke);
            }
            if (options.strokeWidth) {
                svg.setAttribute('stroke-width', options.strokeWidth);
            }
            if (options.strokeLinecap) {
                svg.setAttribute('stroke-linecap', options.strokeLinecap);
            }
            if (options.strokeLinejoin) {
                svg.setAttribute('stroke-linejoin', options.strokeLinejoin);
            }
            const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            shape.setAttribute('d', path);
            svg.appendChild(shape);
            return svg;
        };

        const createMediaCard = (item) => {
            const card = document.createElement('div');
            card.className = 'media-grid__item media-card';
            card.dataset.mediaItem = item.id;
            card.dataset.mediaDraggable = 'true';

            const frame = document.createElement('div');
            frame.className = 'media-card__frame';
            frame.dataset.mediaDragHandle = 'true';

            const img = document.createElement('img');
            img.className = 'media-card__image';
            img.src = item.url;
            img.alt = 'Vista previa de la foto';
            img.style.transform = `rotate(${item.rotation}deg)`;
            frame.appendChild(img);

            if (item.isPrimary) {
                const badge = document.createElement('div');
                badge.className = 'media-card__badge';
                const badgeIcon = document.createElement('span');
                badgeIcon.className = 'media-card__badge-icon';
                badgeIcon.appendChild(createIcon('M12 2.5l2.9 5.88 6.5.94-4.7 4.58 1.1 6.47L12 17.9 6.2 20.37l1.1-6.47-4.7-4.58 6.5-.94L12 2.5z', '0 0 24 24', { fill: 'currentColor' }));
                const badgeText = document.createElement('span');
                badgeText.textContent = 'Foto principal';
                badge.appendChild(badgeIcon);
                badge.appendChild(badgeText);
                frame.appendChild(badge);
            }

            const actions = document.createElement('div');
            actions.className = 'media-card__actions';

            const primaryButton = document.createElement('button');
            primaryButton.type = 'button';
            primaryButton.className = 'media-card__action';
            primaryButton.dataset.mediaAction = 'primary';
            primaryButton.dataset.mediaId = item.id;
            primaryButton.setAttribute('aria-label', 'Establecer como principal');
            primaryButton.appendChild(createIcon('M12 2.5l2.9 5.88 6.5.94-4.7 4.58 1.1 6.47L12 17.9 6.2 20.37l1.1-6.47-4.7-4.58 6.5-.94L12 2.5z', '0 0 24 24', { fill: 'currentColor' }));

            const rotateButton = document.createElement('button');
            rotateButton.type = 'button';
            rotateButton.className = 'media-card__action';
            rotateButton.dataset.mediaAction = 'rotate';
            rotateButton.dataset.mediaId = item.id;
            rotateButton.setAttribute('aria-label', 'Rotar imagen');
            rotateButton.appendChild(createIcon('M12 4a8 8 0 1 1-7.55 5.36', '0 0 24 24', { stroke: 'currentColor', fill: 'none', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }));
            const rotatePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            rotatePath.setAttribute('d', 'M6 3v4h4');
            rotatePath.setAttribute('stroke', 'currentColor');
            rotatePath.setAttribute('stroke-width', '2');
            rotatePath.setAttribute('stroke-linecap', 'round');
            rotatePath.setAttribute('stroke-linejoin', 'round');
            rotateButton.querySelector('svg').appendChild(rotatePath);

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'media-card__action media-card__action--danger';
            removeButton.dataset.mediaAction = 'remove';
            removeButton.dataset.mediaId = item.id;
            removeButton.setAttribute('aria-label', 'Eliminar foto');
            removeButton.appendChild(createIcon('M6 7h12M9 7V5h6v2m-7 0v11m8-11v11', '0 0 18 18', { stroke: 'currentColor', fill: 'none', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }));

            actions.appendChild(primaryButton);
            actions.appendChild(rotateButton);
            actions.appendChild(removeButton);
            frame.appendChild(actions);

            card.appendChild(frame);

            const caption = document.createElement('input');
            caption.type = 'text';
            caption.className = 'media-card__caption';
            caption.placeholder = 'Ingresa un pie de foto';
            caption.value = item.caption;
            caption.dataset.mediaCaption = item.id;
            caption.setAttribute('aria-label', 'Ingresa un pie de foto');
            card.appendChild(caption);

            return card;
        };

        const createViewMoreCard = (count) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'media-grid__item media-view-more';
            card.dataset.mediaViewMore = 'true';
            card.innerHTML = `<span class=\"media-view-more__count\">+${count}</span><span class=\"media-view-more__label\">Ver más fotos</span>`;
            return card;
        };

        const renderPreviews = () => {
            const existingItems = grid.querySelectorAll('[data-media-item], [data-media-view-more]');
            existingItems.forEach((node) => node.remove());

            const visibleItems = getVisibleItems();

            visibleItems.forEach((item) => {
                grid.appendChild(createMediaCard(item));
            });

            if (!isExpanded && mediaItems.length > 5) {
                grid.appendChild(createViewMoreCard(mediaItems.length - 5));
            }

            updateDropzoneState();
            updateContinueState();
        };

        const handlePointerDown = (event) => {
            const card = event.target.closest('[data-media-item]');
            if (!card || !card.dataset.mediaDraggable) {
                return;
            }

            if (event.target.closest('button, input')) {
                return;
            }

            const id = card.dataset.mediaItem;
            const visibleItems = getVisibleItems();
            const draggableIds = visibleItems.map((item) => item.id);
            if (!draggableIds.includes(id)) {
                return;
            }

            const rect = card.getBoundingClientRect();
            const ghost = card.cloneNode(true);
            ghost.classList.add('media-card__ghost');
            ghost.style.width = `${rect.width}px`;
            ghost.style.height = `${rect.height}px`;
            ghost.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
            document.body.appendChild(ghost);

            const placeholder = document.createElement('div');
            placeholder.className = 'media-card__placeholder';
            placeholder.style.width = `${rect.width}px`;
            placeholder.style.height = `${rect.height}px`;
            card.replaceWith(placeholder);

            dragState = {
                id,
                pointerId: event.pointerId,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top,
                ghost,
                placeholder,
                draggableIds
            };

            document.body.classList.add('media-drag-active');
            if (grid.setPointerCapture) {
                grid.setPointerCapture(event.pointerId);
            }
            event.preventDefault();
        };

        const handlePointerMove = (event) => {
            if (!dragState || dragState.pointerId !== event.pointerId) {
                return;
            }

            const { ghost, offsetX, offsetY, placeholder } = dragState;
            const x = event.clientX - offsetX;
            const y = event.clientY - offsetY;
            ghost.style.transform = `translate(${x}px, ${y}px)`;
            event.preventDefault();

            const element = document.elementFromPoint(event.clientX, event.clientY);
            const target = element ? element.closest('[data-media-item]') : null;

            if (!target || target.dataset.mediaItem === dragState.id) {
                return;
            }

            const rect = target.getBoundingClientRect();
            const isAfter = event.clientY > rect.top + rect.height / 2 || event.clientX > rect.left + rect.width / 2;

            if (isAfter) {
                target.after(placeholder);
            } else {
                target.before(placeholder);
            }
        };

        const handlePointerUp = (event) => {
            if (!dragState || dragState.pointerId !== event.pointerId) {
                return;
            }

            const { ghost, placeholder, id, draggableIds } = dragState;
            ghost.remove();
            const placeholderIndex = Array.from(grid.querySelectorAll('[data-media-item], .media-card__placeholder'))
                .filter((node) => node.classList.contains('media-card__placeholder') || draggableIds.includes(node.dataset.mediaItem))
                .findIndex((node) => node.classList.contains('media-card__placeholder'));

            const itemIndex = mediaItems.findIndex((item) => item.id === id);
            if (itemIndex !== -1 && placeholderIndex !== -1) {
                const [moved] = mediaItems.splice(itemIndex, 1);
                const targetIndex = Math.min(placeholderIndex, mediaItems.length);
                mediaItems.splice(targetIndex, 0, moved);
                ensurePrimary();
            }

            placeholder.remove();
            dragState = null;
            document.body.classList.remove('media-drag-active');
            if (grid.releasePointerCapture) {
                grid.releasePointerCapture(event.pointerId);
            }
            renderPreviews();
        };

        const handlePointerCancel = (event) => {
            if (!dragState || dragState.pointerId !== event.pointerId) {
                return;
            }

            dragState.ghost.remove();
            dragState.placeholder.remove();
            dragState = null;
            document.body.classList.remove('media-drag-active');
            if (grid.releasePointerCapture) {
                grid.releasePointerCapture(event.pointerId);
            }
            renderPreviews();
        };

        const handleGridClick = (event) => {
            const actionButton = event.target.closest('[data-media-action]');
            if (actionButton) {
                const id = actionButton.dataset.mediaId;
                const action = actionButton.dataset.mediaAction;
                if (action === 'primary') {
                    updatePrimary(id);
                } else if (action === 'remove') {
                    removeImage(id);
                } else if (action === 'rotate') {
                    rotateImage(id);
                }
                return;
            }

            const viewMore = event.target.closest('[data-media-view-more]');
            if (viewMore) {
                setExpanded();
            }
        };

        const handleGridInput = (event) => {
            const captionInput = event.target.closest('[data-media-caption]');
            if (!captionInput) {
                return;
            }
            updateCaption(captionInput.dataset.mediaCaption, captionInput.value);
        };

        const handleDropzoneClick = () => {
            if (!fileInput.disabled) {
                fileInput.click();
            }
        };

        const handleFileInput = (event) => {
            handleFiles(event.target.files);
            event.target.value = '';
        };

        const handleDragOver = (event) => {
            event.preventDefault();
            dropzone.classList.add('media-dropzone--active');
        };

        const handleDragLeave = () => {
            dropzone.classList.remove('media-dropzone--active');
        };

        const handleDrop = (event) => {
            event.preventDefault();
            dropzone.classList.remove('media-dropzone--active');
            handleFiles(event.dataTransfer.files);
        };

        if (trigger) {
            trigger.addEventListener('click', handleDropzoneClick);
        }

        fileInput.addEventListener('change', handleFileInput);
        dropzone.addEventListener('dragover', handleDragOver);
        dropzone.addEventListener('dragleave', handleDragLeave);
        dropzone.addEventListener('drop', handleDrop);
        dropzone.addEventListener('click', handleDropzoneClick);

        grid.addEventListener('click', handleGridClick);
        grid.addEventListener('input', handleGridInput);
        grid.addEventListener('pointerdown', handlePointerDown);
        grid.addEventListener('pointermove', handlePointerMove);
        grid.addEventListener('pointerup', handlePointerUp);
        grid.addEventListener('pointercancel', handlePointerCancel);

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
                if (continueButton.disabled) {
                    event.preventDefault();
                    setAlert(['Necesitas al menos 5 fotos para continuar.']);
                    return;
                }

                document.dispatchEvent(new CustomEvent('publish:media:continue', { detail: { mediaItems } }));
            });
        }

        panel.addEventListener('publish-media:open', () => {
            updateDropzoneState();
            updateContinueState();
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
