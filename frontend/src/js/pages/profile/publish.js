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
        const continueButton = panel.querySelector('[data-characteristics-continue]');

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

        if (continueButton) {
            continueButton.addEventListener('click', (event) => {
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
        const countLabel = panel.querySelector('[data-media-count]');
        const minimumLabel = panel.querySelector('[data-media-minimum]');
        const alertBox = panel.querySelector('[data-media-alert]');
        const continueButton = panel.querySelector('[data-media-continue]');
        const backButton = panel.querySelector('[data-media-back]');
        const purposeTarget = panel.querySelector('[data-media-purpose]');
        const typeTarget = panel.querySelector('[data-media-type]');
        const subtypeTarget = panel.querySelector('[data-media-subtype]');

        const MAX_FILES = 50;
        const MIN_FILES = 5;
        const images = [];
        let draggingState = null;

        const updateContext = (detail = {}) => {
            if (purposeTarget) {
                purposeTarget.textContent = detail.purposeLabel || panel.dataset.publishPurposeLabel || 'Propósito pendiente';
            }

            if (typeTarget) {
                typeTarget.textContent = detail.typeLabel || panel.dataset.publishTypeLabel || 'Tipo de propiedad pendiente';
            }

            if (subtypeTarget) {
                subtypeTarget.textContent = detail.subtype || panel.dataset.publishSubtype || 'Subtipo pendiente';
            }
        };

        const showAlert = (message) => {
            if (!alertBox) {
                return;
            }

            if (message) {
                alertBox.textContent = message;
                alertBox.hidden = false;
            } else {
                alertBox.textContent = '';
                alertBox.hidden = true;
            }
        };

        const updateMeta = () => {
            const total = images.length;
            if (countLabel) {
                countLabel.textContent = `${total}/${MAX_FILES}`;
            }

            if (minimumLabel) {
                if (total < MIN_FILES) {
                    minimumLabel.textContent = `Te faltan ${MIN_FILES - total} fotos para completar el mínimo.`;
                } else {
                    minimumLabel.textContent = '¡Listo! Puedes continuar con la publicación.';
                }
            }

            if (continueButton) {
                continueButton.disabled = total < MIN_FILES;
            }
        };

        const ensurePrimary = () => {
            if (!images.length) {
                return;
            }

            const primaryIndex = images.findIndex((item) => item.isPrimary);
            if (primaryIndex === -1) {
                images[0].isPrimary = true;
                return;
            }

            if (primaryIndex !== 0) {
                const [primary] = images.splice(primaryIndex, 1);
                images.unshift(primary);
            }
        };

        const renderPreviews = () => {
            if (!grid || !dropzone) {
                return;
            }

            const existingCards = grid.querySelectorAll('.publish-media__preview-card');
            existingCards.forEach((card) => card.remove());

            ensurePrimary();

            images.forEach((image) => {
                const card = document.createElement('div');
                card.className = 'publish-media__preview-card';
                card.dataset.id = image.id;

                const imageWrap = document.createElement('div');
                imageWrap.className = 'publish-media__preview-image';

                const img = document.createElement('img');
                img.src = image.url;
                img.alt = 'Vista previa de la foto';

                const controls = document.createElement('div');
                controls.className = 'publish-media__preview-controls';

                const primaryButton = document.createElement('button');
                primaryButton.type = 'button';
                primaryButton.className = 'publish-media__preview-action';
                primaryButton.setAttribute('aria-label', 'Establecer como foto principal');
                primaryButton.innerHTML = '⭐';
                primaryButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    setPrimary(image.id);
                });

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'publish-media__preview-action publish-media__preview-action--danger';
                removeButton.setAttribute('aria-label', 'Eliminar foto');
                removeButton.innerHTML = '🗑️';
                removeButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    removeImage(image.id);
                });

                controls.appendChild(primaryButton);
                controls.appendChild(removeButton);

                if (image.isPrimary) {
                    const badge = document.createElement('span');
                    badge.className = 'publish-media__preview-badge';
                    badge.textContent = '⭐ Foto principal';
                    imageWrap.appendChild(badge);
                }

                imageWrap.appendChild(img);
                imageWrap.appendChild(controls);

                const caption = document.createElement('input');
                caption.type = 'text';
                caption.className = 'publish-media__caption-input';
                caption.placeholder = 'Ingresa un pie de foto';
                caption.value = image.caption || '';
                caption.addEventListener('input', (event) => {
                    image.caption = event.target.value;
                });

                card.appendChild(imageWrap);
                card.appendChild(caption);
                grid.appendChild(card);
            });

            updateMeta();
        };

        const addFiles = (fileList) => {
            const files = Array.from(fileList || []);
            if (!files.length) {
                return;
            }

            showAlert('');

            const remaining = MAX_FILES - images.length;
            if (remaining <= 0) {
                showAlert('Has alcanzado el máximo de 50 fotos permitidas.');
                return;
            }

            let added = 0;
            let invalid = false;
            let overflow = false;

            files.forEach((file) => {
                if (!file.type.startsWith('image/')) {
                    invalid = true;
                    return;
                }

                if (added >= remaining) {
                    overflow = true;
                    return;
                }

                images.push({
                    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    file,
                    url: URL.createObjectURL(file),
                    caption: '',
                    isPrimary: false
                });
                added += 1;
            });

            if (!images.some((item) => item.isPrimary) && images.length) {
                images[0].isPrimary = true;
            }

            if (invalid) {
                showAlert('Algunas fotos no se cargaron porque el formato no es válido.');
            }

            if (overflow) {
                showAlert('Solo puedes cargar hasta 50 fotos en total.');
            }

            renderPreviews();
        };

        const setPrimary = (id) => {
            const index = images.findIndex((item) => item.id === id);
            if (index === -1) {
                return;
            }

            images.forEach((item) => {
                item.isPrimary = false;
            });
            images[index].isPrimary = true;
            ensurePrimary();
            renderPreviews();
        };

        const removeImage = (id) => {
            const index = images.findIndex((item) => item.id === id);
            if (index === -1) {
                return;
            }

            const [removed] = images.splice(index, 1);
            if (removed && removed.url) {
                URL.revokeObjectURL(removed.url);
            }

            if (!images.some((item) => item.isPrimary) && images.length) {
                images[0].isPrimary = true;
            }

            renderPreviews();
        };

        const startDrag = (event, card) => {
            if (!grid || !card) {
                return;
            }

            if (draggingState || (typeof event.button === 'number' && event.button !== 0)) {
                return;
            }

            const target = event.target;
            if (target.closest('button') || target.closest('input')) {
                return;
            }

            event.preventDefault();

            const rect = card.getBoundingClientRect();
            const ghost = card.cloneNode(true);
            ghost.classList.add('publish-media__drag-ghost');
            ghost.style.width = `${rect.width}px`;
            ghost.style.height = `${rect.height}px`;
            ghost.style.left = `${rect.left}px`;
            ghost.style.top = `${rect.top}px`;

            const placeholder = document.createElement('div');
            placeholder.className = 'publish-media__preview-placeholder';
            placeholder.style.width = `${rect.width}px`;
            placeholder.style.height = `${rect.height}px`;

            grid.insertBefore(placeholder, card);
            grid.removeChild(card);

            document.body.appendChild(ghost);

            draggingState = {
                id: card.dataset.id,
                ghost,
                placeholder,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top,
                card
            };

            card.classList.add('is-dragging');
        };

        const updateDrag = (event) => {
            if (!draggingState) {
                return;
            }

            const { ghost, placeholder } = draggingState;
            ghost.style.left = `${event.clientX - draggingState.offsetX}px`;
            ghost.style.top = `${event.clientY - draggingState.offsetY}px`;

            const element = document.elementFromPoint(event.clientX, event.clientY);
            const targetCard = element ? element.closest('.publish-media__preview-card') : null;

            if (targetCard && targetCard !== draggingState.card) {
                const rect = targetCard.getBoundingClientRect();
                const insertBefore = event.clientY < rect.top + rect.height / 2;
                if (insertBefore) {
                    grid.insertBefore(placeholder, targetCard);
                } else {
                    grid.insertBefore(placeholder, targetCard.nextSibling);
                }
            }
        };

        const finishDrag = () => {
            if (!draggingState || !grid) {
                return;
            }

            const { card, placeholder, ghost } = draggingState;
            grid.insertBefore(card, placeholder);
            placeholder.remove();
            ghost.remove();
            card.classList.remove('is-dragging');

            const orderedIds = Array.from(grid.querySelectorAll('.publish-media__preview-card')).map((item) => item.dataset.id);
            const ordered = orderedIds.map((id) => images.find((item) => item.id === id)).filter(Boolean);
            images.length = 0;
            images.push(...ordered);
            ensurePrimary();
            renderPreviews();

            draggingState = null;
        };

        if (grid) {
            grid.addEventListener('pointerdown', (event) => {
                const card = event.target.closest('.publish-media__preview-card');
                if (!card) {
                    return;
                }

                startDrag(event, card);
            });
        }

        window.addEventListener('pointermove', (event) => updateDrag(event));
        window.addEventListener('pointerup', () => finishDrag());
        window.addEventListener('pointercancel', () => finishDrag());

        if (dropzone) {
            dropzone.addEventListener('click', () => {
                if (input) {
                    input.click();
                }
            });

            dropzone.addEventListener('keydown', (event) => {
                if ((event.key === 'Enter' || event.key === ' ') && input) {
                    event.preventDefault();
                    input.click();
                }
            });

            ['dragenter', 'dragover'].forEach((type) => {
                dropzone.addEventListener(type, (event) => {
                    event.preventDefault();
                    dropzone.classList.add('is-dragover');
                });
            });

            ['dragleave', 'drop'].forEach((type) => {
                dropzone.addEventListener(type, (event) => {
                    event.preventDefault();
                    dropzone.classList.remove('is-dragover');
                });
            });

            dropzone.addEventListener('drop', (event) => {
                if (!event.dataTransfer) {
                    return;
                }
                addFiles(event.dataTransfer.files);
            });
        }

        if (input) {
            input.addEventListener('change', (event) => {
                const { files } = event.target;
                addFiles(files);
                event.target.value = '';
            });
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
            updateContext(detail);
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        updateContext({
            purposeLabel: panel.dataset.publishPurposeLabel,
            typeLabel: panel.dataset.publishTypeLabel,
            subtype: panel.dataset.publishSubtype
        });

        updateMeta();
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
