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
        const emptyState = panel.querySelector('[data-media-empty]');
        const countText = panel.querySelector('[data-media-count]');
        const minimumText = panel.querySelector('[data-media-minimum]');
        const alertText = panel.querySelector('[data-media-alert]');
        const continueButton = panel.querySelector('[data-media-continue]');
        const backButton = panel.querySelector('[data-media-back]');

        const state = {
            items: [],
            max: 50,
            min: 5,
            drag: null
        };

        const showAlert = (message) => {
            if (!alertText) {
                return;
            }
            if (!message) {
                alertText.textContent = '';
                alertText.hidden = true;
                return;
            }
            alertText.textContent = message;
            alertText.hidden = false;
        };

        const updateStatus = () => {
            const count = state.items.length;
            if (countText) {
                countText.textContent = `${count}/${state.max}`;
            }
            if (minimumText) {
                if (count >= state.min) {
                    minimumText.textContent = '¡Listo para continuar!';
                    minimumText.classList.add('publish-media__minimum--ready');
                } else {
                    const remaining = state.min - count;
                    minimumText.textContent = `Faltan ${remaining} foto${remaining === 1 ? '' : 's'} para continuar.`;
                    minimumText.classList.remove('publish-media__minimum--ready');
                }
            }
            if (continueButton) {
                continueButton.disabled = count < state.min;
            }
        };

        const setPrimary = (id) => {
            const index = state.items.findIndex((item) => item.id === id);
            if (index === -1) {
                return;
            }
            const [selected] = state.items.splice(index, 1);
            selected.isPrimary = true;
            state.items.forEach((item) => {
                item.isPrimary = false;
            });
            state.items.unshift(selected);
        };

        const removeImage = (id) => {
            const index = state.items.findIndex((item) => item.id === id);
            if (index === -1) {
                return;
            }
            const [removed] = state.items.splice(index, 1);
            if (removed && removed.url) {
                URL.revokeObjectURL(removed.url);
            }
            if (!state.items.length) {
                return;
            }
            if (!state.items.some((item) => item.isPrimary)) {
                state.items[0].isPrimary = true;
            }
        };

        const reorderItems = (orderedIds) => {
            const reordered = orderedIds
                .map((id) => state.items.find((item) => item.id === id))
                .filter(Boolean);
            if (reordered.length === state.items.length) {
                state.items = reordered;
                if (state.items.length) {
                    state.items.forEach((item, index) => {
                        item.isPrimary = index === 0;
                    });
                }
            }
        };

        const renderPreviews = () => {
            if (!grid) {
                return;
            }

            grid.innerHTML = '';

            if (!state.items.length) {
                if (emptyState) {
                    emptyState.hidden = false;
                    grid.appendChild(emptyState);
                }
                updateStatus();
                return;
            }

            if (emptyState) {
                emptyState.hidden = true;
            }

            state.items.forEach((item) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'publish-media__item';
                wrapper.dataset.mediaId = item.id;

                const thumb = document.createElement('div');
                thumb.className = 'publish-media__thumb';

                const img = document.createElement('img');
                img.src = item.url;
                img.alt = 'Vista previa de la foto';
                thumb.appendChild(img);

                if (item.isPrimary) {
                    const badge = document.createElement('span');
                    badge.className = 'publish-media__badge';
                    badge.textContent = '⭐ Foto principal';
                    thumb.appendChild(badge);
                }

                const overlay = document.createElement('div');
                overlay.className = 'publish-media__overlay';

                const primaryButton = document.createElement('button');
                primaryButton.type = 'button';
                primaryButton.className = 'publish-media__icon-btn';
                primaryButton.setAttribute('aria-label', 'Establecer como principal');
                primaryButton.innerHTML = '⭐';
                primaryButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    setPrimary(item.id);
                    renderPreviews();
                });

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'publish-media__icon-btn publish-media__icon-btn--danger';
                removeButton.setAttribute('aria-label', 'Eliminar foto');
                removeButton.innerHTML = '🗑';
                removeButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    removeImage(item.id);
                    renderPreviews();
                });

                overlay.appendChild(primaryButton);
                overlay.appendChild(removeButton);
                thumb.appendChild(overlay);

                const caption = document.createElement('input');
                caption.type = 'text';
                caption.className = 'publish-media__caption';
                caption.placeholder = 'Ingresa un pie de foto';
                caption.value = item.caption || '';
                caption.addEventListener('input', () => {
                    item.caption = caption.value;
                });

                wrapper.appendChild(thumb);
                wrapper.appendChild(caption);
                grid.appendChild(wrapper);
            });

            updateStatus();
        };

        const validateFiles = (files) => {
            const validFiles = [];
            const remaining = state.max - state.items.length;

            Array.from(files).forEach((file) => {
                if (!file.type.startsWith('image/')) {
                    return;
                }
                if (validFiles.length < remaining) {
                    validFiles.push(file);
                }
            });

            if (!validFiles.length) {
                showAlert('No pudimos cargar esas imágenes. Intenta con fotos en formato JPG o PNG.');
            } else if (files.length > remaining) {
                showAlert(`Solo puedes subir hasta ${state.max} fotos. Se agregaron ${validFiles.length}.`);
            } else {
                showAlert('');
            }

            return validFiles;
        };

        const handleFiles = (files) => {
            if (!files || !files.length) {
                return;
            }
            const validFiles = validateFiles(files);
            if (!validFiles.length) {
                return;
            }

            validFiles.forEach((file) => {
                const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
                state.items.push({
                    id,
                    file,
                    url: URL.createObjectURL(file),
                    caption: '',
                    isPrimary: false
                });
            });

            if (!state.items.some((item) => item.isPrimary) && state.items.length) {
                state.items[0].isPrimary = true;
            }

            renderPreviews();
        };

        const openFileDialog = () => {
            if (fileInput) {
                fileInput.click();
            }
        };

        const handleDropzoneKey = (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openFileDialog();
            }
        };

        const handleDragEnter = (event) => {
            event.preventDefault();
            if (dropzone) {
                dropzone.classList.add('publish-media__dropzone--active');
            }
        };

        const handleDragLeave = (event) => {
            if (dropzone && event.target === dropzone) {
                dropzone.classList.remove('publish-media__dropzone--active');
            }
        };

        const handleDragOver = (event) => {
            event.preventDefault();
        };

        const handleDrop = (event) => {
            event.preventDefault();
            if (dropzone) {
                dropzone.classList.remove('publish-media__dropzone--active');
            }
            handleFiles(event.dataTransfer.files);
        };

        const startReorder = (event) => {
            const thumb = event.target.closest('.publish-media__thumb');
            const item = event.target.closest('.publish-media__item');
            if (!item || !thumb || event.button !== 0 || event.target.closest('button')) {
                return;
            }
            event.preventDefault();

            const rect = item.getBoundingClientRect();
            const placeholder = document.createElement('div');
            placeholder.className = 'publish-media__placeholder';
            placeholder.style.width = `${rect.width}px`;
            placeholder.style.height = `${rect.height}px`;

            item.parentNode.insertBefore(placeholder, item.nextSibling);
            item.classList.add('publish-media__item--dragging');
            item.style.visibility = 'hidden';

            const ghost = item.cloneNode(true);
            ghost.classList.add('publish-media__ghost');
            ghost.style.width = `${rect.width}px`;
            ghost.style.height = `${rect.height}px`;
            ghost.style.left = '0px';
            ghost.style.top = '0px';
            ghost.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;

            document.body.appendChild(ghost);

            state.drag = {
                item,
                placeholder,
                ghost,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top
            };

            const onMove = (moveEvent) => {
                if (!state.drag) {
                    return;
                }

                const x = moveEvent.clientX - state.drag.offsetX;
                const y = moveEvent.clientY - state.drag.offsetY;
                state.drag.ghost.style.transform = `translate3d(${x}px, ${y}px, 0)`;

                const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
                if (!target) {
                    return;
                }
                const targetItem = target.closest('.publish-media__item');
                if (!targetItem || targetItem === state.drag.item) {
                    return;
                }

                const targetRect = targetItem.getBoundingClientRect();
                const insertBefore = moveEvent.clientX < targetRect.left + targetRect.width / 2;
                if (insertBefore) {
                    targetItem.parentNode.insertBefore(state.drag.placeholder, targetItem);
                } else {
                    targetItem.parentNode.insertBefore(state.drag.placeholder, targetItem.nextSibling);
                }
            };

            const onEnd = () => {
                if (!state.drag) {
                    return;
                }

                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onEnd);

                state.drag.ghost.remove();
                state.drag.item.style.visibility = '';
                state.drag.item.classList.remove('publish-media__item--dragging');

                state.drag.placeholder.parentNode.insertBefore(state.drag.item, state.drag.placeholder);
                state.drag.placeholder.remove();

                const orderedIds = Array.from(grid.querySelectorAll('.publish-media__item')).map((node) => node.dataset.mediaId);
                reorderItems(orderedIds);
                state.drag = null;
                renderPreviews();
            };

            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onEnd);
        };

        if (fileInput) {
            fileInput.addEventListener('change', (event) => {
                handleFiles(event.target.files);
                event.target.value = '';
            });
        }

        if (dropzone) {
            dropzone.addEventListener('click', openFileDialog);
            dropzone.addEventListener('keydown', handleDropzoneKey);
            dropzone.addEventListener('dragenter', handleDragEnter);
            dropzone.addEventListener('dragover', handleDragOver);
            dropzone.addEventListener('dragleave', handleDragLeave);
            dropzone.addEventListener('drop', handleDrop);
        }

        if (grid) {
            grid.addEventListener('pointerdown', startReorder);
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
                if (state.items.length < state.min) {
                    showAlert('Necesitas al menos 5 fotos para continuar.');
                }
            });
        }

        panel.addEventListener('publish-media:open', () => {
            updateStatus();
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
