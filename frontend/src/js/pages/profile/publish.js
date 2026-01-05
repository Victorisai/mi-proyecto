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
        const backButton = panel.querySelector('[data-media-back]');
        const continueButton = panel.querySelector('[data-media-continue]');
        const alertBox = panel.querySelector('[data-media-alert]');
        const grid = panel.querySelector('[data-media-grid]');
        const dropzone = panel.querySelector('[data-media-dropzone]');
        const fileInput = panel.querySelector('[data-media-input]');
        const counter = panel.querySelector('[data-media-counter]');

        const mediaState = {
            items: [],
            isExpanded: false,
            drag: null,
            maxItems: 50,
            minItems: 5
        };

        const svgIcons = {
            rotate: '<svg viewBox="0 0 24 24" role="img" focusable="false" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.65 4.79 1 1 0 1 1 1.9-.62A5 5 0 1 0 12 7h-2a1 1 0 0 1-.7-1.71l3-3a1 1 0 0 1 1.4 0l3 3A1 1 0 0 1 16 7h-4z"></path></svg>',
            delete: '<svg viewBox="0 0 24 24" role="img" focusable="false" aria-hidden="true"><path d="M6 7a1 1 0 0 1 1 1v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8a1 1 0 1 1 2 0v9a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8a1 1 0 0 1 1-1z"></path><path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2H9V4zm-3 2a1 1 0 0 1 1-1h10a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1z"></path></svg>',
            star: '<svg viewBox="0 0 24 24" role="img" focusable="false" aria-hidden="true"><path d="M12 3.5l2.4 4.86 5.37.78-3.89 3.79.92 5.36L12 15.9l-4.8 2.53.92-5.36L4.23 9.14l5.37-.78L12 3.5z"></path></svg>'
        };

        const showAlert = (message) => {
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

        const updateCounter = () => {
            if (counter) {
                counter.textContent = `${mediaState.items.length}/${mediaState.maxItems} fotos`;
            }
        };

        const updateContinueState = () => {
            if (!continueButton) {
                return;
            }
            continueButton.disabled = mediaState.items.length < mediaState.minItems;
        };

        const enforcePrimary = () => {
            if (!mediaState.items.length) {
                return;
            }
            mediaState.items.forEach((item, index) => {
                item.isPrimary = index === 0;
            });
        };

        const validateFiles = (files) => {
            const allowedTypes = ['image/jpeg', 'image/png'];
            const invalid = files.filter((file) => !allowedTypes.includes(file.type));
            if (invalid.length) {
                showAlert('Solo puedes cargar imágenes en formato JPG, JPEG o PNG.');
                return false;
            }
            return true;
        };

        const handleFiles = (files) => {
            const fileList = Array.from(files || []);
            if (!fileList.length) {
                return;
            }

            showAlert('');

            if (!validateFiles(fileList)) {
                return;
            }

            const available = mediaState.maxItems - mediaState.items.length;
            if (available <= 0) {
                showAlert('Has alcanzado el máximo de 50 fotos.');
                return;
            }

            const acceptedFiles = fileList.slice(0, available);
            acceptedFiles.forEach((file) => {
                const url = URL.createObjectURL(file);
                mediaState.items.push({
                    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    file,
                    url,
                    caption: '',
                    rotation: 0,
                    isPrimary: false
                });
            });

            enforcePrimary();
            renderPreviews();
        };

        const removeImage = (id) => {
            const index = mediaState.items.findIndex((item) => item.id === id);
            if (index === -1) {
                return;
            }
            const [removed] = mediaState.items.splice(index, 1);
            if (removed && removed.url) {
                URL.revokeObjectURL(removed.url);
            }
            enforcePrimary();
            if (mediaState.items.length <= 5) {
                mediaState.isExpanded = false;
            }
            renderPreviews();
        };

        const rotateImage = (id) => {
            const target = mediaState.items.find((item) => item.id === id);
            if (!target) {
                return;
            }
            target.rotation = (target.rotation + 90) % 360;
            renderPreviews();
        };

        const setPrimary = (id) => {
            const index = mediaState.items.findIndex((item) => item.id === id);
            if (index === -1) {
                return;
            }
            const [selected] = mediaState.items.splice(index, 1);
            mediaState.items.unshift(selected);
            enforcePrimary();
            renderPreviews();
        };

        const updateCaption = (id, value) => {
            const target = mediaState.items.find((item) => item.id === id);
            if (target) {
                target.caption = value;
            }
        };

        const getVisibleItems = () => {
            if (mediaState.isExpanded || mediaState.items.length <= 5) {
                return mediaState.items;
            }
            return mediaState.items.slice(0, 5);
        };

        const renderViewMoreCard = () => {
            if (!grid || mediaState.isExpanded || mediaState.items.length <= 5) {
                return;
            }

            const remaining = mediaState.items.length - 5;
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'media-more';
            card.dataset.mediaViewMore = 'true';
            card.innerHTML = `\n                <span class=\"media-more__count\">+${remaining}</span>\n                <span class=\"media-more__label\">Ver más fotos</span>\n            `;

            card.addEventListener('click', () => {
                mediaState.isExpanded = true;
                renderPreviews();
            });

            grid.appendChild(card);
        };

        const buildPreviewCard = (item) => {
            const card = document.createElement('div');
            card.className = 'media-preview';
            card.dataset.mediaId = item.id;

            const badge = item.isPrimary
                ? `<span class=\"media-preview__badge\">${svgIcons.star}<span>Foto principal</span></span>`
                : '';

            card.innerHTML = `\n                <div class=\"media-preview__frame\">\n                    <img class=\"media-preview__image\" src=\"${item.url}\" alt=\"Vista previa de la foto\" style=\"transform: rotate(${item.rotation}deg);\">\n                    ${badge}\n                    <div class=\"media-preview__controls\">\n                        <button type=\"button\" class=\"media-preview__control\" data-action=\"primary\" aria-label=\"Marcar como foto principal\">${svgIcons.star}</button>\n                        <button type=\"button\" class=\"media-preview__control\" data-action=\"rotate\" aria-label=\"Rotar foto\">${svgIcons.rotate}</button>\n                        <button type=\"button\" class=\"media-preview__control\" data-action=\"delete\" aria-label=\"Eliminar foto\">${svgIcons.delete}</button>\n                    </div>\n                </div>\n                <input class=\"media-preview__caption\" type=\"text\" placeholder=\"Ingresa un pie de foto\">\n            `;

            const captionInput = card.querySelector('.media-preview__caption');
            if (captionInput) {
                captionInput.value = item.caption;
                captionInput.addEventListener('input', (event) => {
                    updateCaption(item.id, event.target.value);
                });
            }

            const controlButtons = card.querySelectorAll('[data-action]');
            controlButtons.forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const action = button.dataset.action;
                    if (action === 'delete') {
                        removeImage(item.id);
                    } else if (action === 'rotate') {
                        rotateImage(item.id);
                    } else if (action === 'primary') {
                        setPrimary(item.id);
                    }
                });
            });

            return card;
        };

        const renderPreviews = () => {
            if (!grid) {
                return;
            }

            const existing = grid.querySelectorAll('.media-preview, .media-more');
            existing.forEach((node) => node.remove());

            const visibleItems = getVisibleItems();
            visibleItems.forEach((item) => {
                grid.appendChild(buildPreviewCard(item));
            });

            renderViewMoreCard();

            if (dropzone) {
                const isMaxed = mediaState.items.length >= mediaState.maxItems;
                dropzone.classList.toggle('media-dropzone--disabled', isMaxed);
                dropzone.toggleAttribute('aria-disabled', isMaxed);
                if (fileInput) {
                    fileInput.disabled = isMaxed;
                }
            }

            updateCounter();
            updateContinueState();
        };

        const syncOrderFromDom = () => {
            if (!grid) {
                return;
            }

            const visibleIds = Array.from(grid.querySelectorAll('.media-preview[data-media-id]')).map(
                (item) => item.dataset.mediaId
            );
            const remaining = mediaState.items.filter((item) => !visibleIds.includes(item.id));
            const reordered = visibleIds
                .map((id) => mediaState.items.find((item) => item.id === id))
                .filter(Boolean);

            mediaState.items = reordered.concat(remaining);
            enforcePrimary();
        };

        const handlePointerMove = (event) => {
            if (!mediaState.drag) {
                return;
            }

            const { element, offsetX, offsetY, placeholder } = mediaState.drag;
            const x = event.clientX - offsetX;
            const y = event.clientY - offsetY;

            element.style.left = `${x}px`;
            element.style.top = `${y}px`;

            const elementUnderPointer = document.elementFromPoint(event.clientX, event.clientY);
            const targetCard = elementUnderPointer ? elementUnderPointer.closest('.media-preview') : null;

            if (!targetCard || targetCard === element || targetCard.classList.contains('media-preview--placeholder')) {
                return;
            }

            const targetRect = targetCard.getBoundingClientRect();
            const insertAfter = event.clientY > targetRect.top + targetRect.height / 2;
            const referenceNode = insertAfter ? targetCard.nextSibling : targetCard;

            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.insertBefore(placeholder, referenceNode);
            }
        };

        const handlePointerUp = () => {
            if (!mediaState.drag) {
                return;
            }

            const { element, placeholder } = mediaState.drag;

            element.classList.remove('media-preview--dragging');
            element.style.position = '';
            element.style.top = '';
            element.style.left = '';
            element.style.width = '';
            element.style.height = '';
            element.style.zIndex = '';
            element.style.pointerEvents = '';

            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.replaceChild(element, placeholder);
            }

            if (element.releasePointerCapture && mediaState.drag && mediaState.drag.pointerId !== undefined) {
                element.releasePointerCapture(mediaState.drag.pointerId);
            }

            syncOrderFromDom();
            renderPreviews();

            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);

            mediaState.drag = null;
        };

        const handlePointerDown = (event) => {
            if (!grid || mediaState.items.length <= 1) {
                return;
            }

            const targetCard = event.target.closest('.media-preview');
            if (!targetCard) {
                return;
            }

            if (event.target.closest('button') || event.target.closest('input')) {
                return;
            }

            event.preventDefault();

            const rect = targetCard.getBoundingClientRect();
            if (targetCard.setPointerCapture) {
                targetCard.setPointerCapture(event.pointerId);
            }
            const placeholder = document.createElement('div');
            placeholder.className = 'media-preview media-preview--placeholder';
            placeholder.style.width = `${rect.width}px`;
            placeholder.style.height = `${rect.height}px`;

            targetCard.parentNode.insertBefore(placeholder, targetCard.nextSibling);

            targetCard.classList.add('media-preview--dragging');
            targetCard.style.position = 'fixed';
            targetCard.style.top = `${rect.top}px`;
            targetCard.style.left = `${rect.left}px`;
            targetCard.style.width = `${rect.width}px`;
            targetCard.style.height = `${rect.height}px`;
            targetCard.style.zIndex = '1000';
            targetCard.style.pointerEvents = 'none';

            mediaState.drag = {
                element: targetCard,
                placeholder,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top,
                pointerId: event.pointerId
            };

            document.addEventListener('pointermove', handlePointerMove);
            document.addEventListener('pointerup', handlePointerUp);
        };

        const setupDropzone = () => {
            if (!dropzone || !fileInput) {
                return;
            }

            dropzone.addEventListener('click', () => {
                if (!fileInput.disabled) {
                    fileInput.click();
                }
            });

            dropzone.addEventListener('dragover', (event) => {
                event.preventDefault();
                if (dropzone.classList.contains('media-dropzone--disabled')) {
                    return;
                }
                dropzone.classList.add('media-dropzone--active');
            });

            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('media-dropzone--active');
            });

            dropzone.addEventListener('drop', (event) => {
                event.preventDefault();
                dropzone.classList.remove('media-dropzone--active');
                if (dropzone.classList.contains('media-dropzone--disabled')) {
                    return;
                }
                handleFiles(event.dataTransfer.files);
            });

            fileInput.addEventListener('change', (event) => {
                handleFiles(event.target.files);
                fileInput.value = '';
            });
        };

        const applyMediaContext = (detail = {}) => {
            const purpose = detail.purposeLabel || panel.dataset.publishPurposeLabel || 'Propósito pendiente';
            const type = detail.typeLabel || panel.dataset.publishTypeLabel || 'Tipo de propiedad pendiente';
            const subtype = detail.subtype || panel.dataset.publishSubtype || 'Subtipo pendiente';

            panel.dataset.publishPurpose = detail.purpose || panel.dataset.publishPurpose || '';
            panel.dataset.publishPurposeLabel = purpose;
            panel.dataset.publishType = detail.type || panel.dataset.publishType || '';
            panel.dataset.publishTypeLabel = type;
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
                element.textContent = type;
            });

            subtypeTargets.forEach((element) => {
                element.textContent = subtype.trim().length ? subtype : 'Subtipo pendiente';
            });
        };

        if (grid) {
            grid.addEventListener('pointerdown', handlePointerDown);
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
                showAlert('');
            });
        }

        panel.addEventListener('publish-media:open', (event) => {
            applyMediaContext(event.detail || {});
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        setupDropzone();
        applyMediaContext({});
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
