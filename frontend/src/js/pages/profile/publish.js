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

        const buildLocationDetail = () => ({
            country: countryInput ? countryInput.value.trim() : '',
            street: streetInput ? streetInput.value.trim() : '',
            state: stateInput ? stateInput.value.trim() : '',
            city: cityInput ? cityInput.value.trim() : ''
        });

        const syncInputsFromDataset = () => {
            if (countryInput) {
                countryInput.value = panel.dataset.publishCountry || '';
            }
            if (streetInput) {
                streetInput.value = panel.dataset.publishStreet || '';
            }
            if (stateInput) {
                stateInput.value = panel.dataset.publishState || '';
            }
            if (cityInput) {
                cityInput.value = panel.dataset.publishCity || '';
            }
        };

        const applyLocationContext = (detail = {}) => {
            const purpose = detail.purposeLabel || panel.dataset.publishPurposeLabel || 'Propósito no definido';
            const type = detail.typeLabel || panel.dataset.publishTypeLabel || 'Tipo no definido';
            const subtype = detail.subtype || panel.dataset.publishSubtype || 'Subtipo no definido';
            const title = detail.title || panel.dataset.publishTitle || 'Propiedad sin título';
            const location = detail.location || {
                country: panel.dataset.publishCountry || '',
                street: panel.dataset.publishStreet || '',
                state: panel.dataset.publishState || '',
                city: panel.dataset.publishCity || ''
            };

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

            panel.dataset.publishCountry = location.country || '';
            panel.dataset.publishStreet = location.street || '';
            panel.dataset.publishState = location.state || '';
            panel.dataset.publishCity = location.city || '';

            syncInputsFromDataset();
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
                    description: panel.dataset.publishDescription || '',
                    location: {
                        country: panel.dataset.publishCountry || '',
                        street: panel.dataset.publishStreet || '',
                        state: panel.dataset.publishState || '',
                        city: panel.dataset.publishCity || ''
                    }
                };

                document.dispatchEvent(new CustomEvent('publish:location:back', { detail }));
            });
        }

        if (saveButton) {
            saveButton.addEventListener('click', (event) => {
                event.preventDefault();

                const location = buildLocationDetail();

                panel.dataset.publishCountry = location.country;
                panel.dataset.publishStreet = location.street;
                panel.dataset.publishState = location.state;
                panel.dataset.publishCity = location.city;

                const detail = {
                    purpose: panel.dataset.publishPurpose || '',
                    purposeLabel: panel.dataset.publishPurposeLabel || '',
                    type: panel.dataset.publishType || '',
                    typeLabel: panel.dataset.publishTypeLabel || '',
                    subtype: panel.dataset.publishSubtype || '',
                    title: panel.dataset.publishTitle || '',
                    description: panel.dataset.publishDescription || '',
                    location
                };

                document.dispatchEvent(new CustomEvent('publish:characteristics:start', { detail }));
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
            panel.dataset.publishCountry = (detail.location && detail.location.country) || panel.dataset.publishCountry || '';
            panel.dataset.publishStreet = (detail.location && detail.location.street) || panel.dataset.publishStreet || '';
            panel.dataset.publishState = (detail.location && detail.location.state) || panel.dataset.publishState || '';
            panel.dataset.publishCity = (detail.location && detail.location.city) || panel.dataset.publishCity || '';

            applyLocationContext(detail);
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        applyLocationContext({
            purposeLabel: panel.dataset.publishPurposeLabel,
            typeLabel: panel.dataset.publishTypeLabel,
            subtype: panel.dataset.publishSubtype,
            title: panel.dataset.publishTitle,
            location: {
                country: panel.dataset.publishCountry,
                street: panel.dataset.publishStreet,
                state: panel.dataset.publishState,
                city: panel.dataset.publishCity
            }
        });
    };

    const initCharacteristicsPanel = (panel) => {
        if (!panel || panel.dataset.publishCharacteristicsInitialized === 'true') {
            return;
        }

        panel.dataset.publishCharacteristicsInitialized = 'true';

        const purposeTargets = panel.querySelectorAll('[data-characteristics-purpose]');
        const typeTargets = panel.querySelectorAll('[data-characteristics-type]');
        const subtypeTargets = panel.querySelectorAll('[data-characteristics-subtype]');
        const locationTargets = panel.querySelectorAll('[data-characteristics-location]');
        const titleTargets = panel.querySelectorAll('[data-characteristics-title]');
        const typeBadge = panel.querySelector('[data-characteristics-type-badge]');
        const typeHelper = panel.querySelector('[data-characteristics-type-helper]');
        const heading = panel.querySelector('[data-characteristics-heading]');
        const backButton = panel.querySelector('[data-characteristics-back]');
        const saveButton = panel.querySelector('[data-characteristics-save]');
        const groups = panel.querySelectorAll('[data-characteristics-group]');

        const getLocationText = (location = {}) => {
            const parts = [location.city, location.state].filter((value) => value && value.trim().length);
            if (parts.length) {
                return parts.join(', ');
            }

            return location.country && location.country.trim().length ? location.country : 'Ubicación pendiente';
        };

        const applyContext = (detail = {}) => {
            const purpose = detail.purposeLabel || panel.dataset.publishPurposeLabel || 'Propósito pendiente';
            const type = detail.typeLabel || panel.dataset.publishTypeLabel || 'Tipo de propiedad pendiente';
            const subtype = detail.subtype || panel.dataset.publishSubtype || 'Subtipo pendiente';
            const title = detail.title || panel.dataset.publishTitle || 'Propiedad sin título';
            const typeKey = detail.type || panel.dataset.publishType || '';
            const location = detail.location || {
                country: panel.dataset.publishCountry || '',
                street: panel.dataset.publishStreet || '',
                state: panel.dataset.publishState || '',
                city: panel.dataset.publishCity || ''
            };

            purposeTargets.forEach((element) => {
                element.textContent = purpose;
            });

            typeTargets.forEach((element) => {
                element.textContent = type;
            });

            subtypeTargets.forEach((element) => {
                element.textContent = subtype;
            });

            locationTargets.forEach((element) => {
                element.textContent = getLocationText(location);
            });

            titleTargets.forEach((element) => {
                element.textContent = title;
            });

            if (heading) {
                heading.textContent = type.trim().length
                    ? `Agrega las características de tu propiedad ${type.toLowerCase()}`
                    : 'Agrega las características de tu propiedad';
            }

            if (typeBadge) {
                typeBadge.textContent = type.trim().length ? type : 'Tipo pendiente';
            }

            let hasMatch = false;
            groups.forEach((group) => {
                const isActive = group.dataset.characteristicsGroup === typeKey;
                group.hidden = !isActive;
                group.classList.toggle('characteristics-group--active', isActive);
                if (isActive) {
                    hasMatch = true;
                }
            });

            if (typeHelper) {
                typeHelper.textContent = hasMatch
                    ? 'Personaliza los atributos sugeridos para este tipo de propiedad.'
                    : 'Selecciona un tipo para ver las opciones específicas.';
            }

            panel.dataset.publishPurposeLabel = purpose;
            panel.dataset.publishTypeLabel = type;
            panel.dataset.publishSubtype = subtype;
            panel.dataset.publishTitle = title;
            panel.dataset.publishPurpose = detail.purpose || panel.dataset.publishPurpose || '';
            panel.dataset.publishType = typeKey;
            panel.dataset.publishCountry = location.country || '';
            panel.dataset.publishStreet = location.street || '';
            panel.dataset.publishState = location.state || '';
            panel.dataset.publishCity = location.city || '';
        };

        const buildDetail = () => ({
            purpose: panel.dataset.publishPurpose || '',
            purposeLabel: panel.dataset.publishPurposeLabel || '',
            type: panel.dataset.publishType || '',
            typeLabel: panel.dataset.publishTypeLabel || '',
            subtype: panel.dataset.publishSubtype || '',
            title: panel.dataset.publishTitle || '',
            description: panel.dataset.publishDescription || '',
            location: {
                country: panel.dataset.publishCountry || '',
                street: panel.dataset.publishStreet || '',
                state: panel.dataset.publishState || '',
                city: panel.dataset.publishCity || ''
            }
        });

        if (backButton) {
            backButton.addEventListener('click', (event) => {
                event.preventDefault();
                document.dispatchEvent(new CustomEvent('publish:characteristics:back', { detail: buildDetail() }));
            });
        }

        if (saveButton) {
            saveButton.addEventListener('click', (event) => {
                event.preventDefault();
                document.dispatchEvent(new CustomEvent('publish:characteristics:save', { detail: buildDetail() }));
            });
        }

        panel.addEventListener('publish-characteristics:open', (event) => {
            const detail = event.detail || {};

            panel.dataset.publishPurpose = detail.purpose || panel.dataset.publishPurpose || '';
            panel.dataset.publishPurposeLabel = detail.purposeLabel || panel.dataset.publishPurposeLabel || '';
            panel.dataset.publishType = detail.type || panel.dataset.publishType || '';
            panel.dataset.publishTypeLabel = detail.typeLabel || panel.dataset.publishTypeLabel || '';
            panel.dataset.publishSubtype = detail.subtype || panel.dataset.publishSubtype || '';
            panel.dataset.publishTitle = detail.title || panel.dataset.publishTitle || '';
            panel.dataset.publishDescription = detail.description || panel.dataset.publishDescription || '';
            panel.dataset.publishCountry = (detail.location && detail.location.country) || panel.dataset.publishCountry || '';
            panel.dataset.publishStreet = (detail.location && detail.location.street) || panel.dataset.publishStreet || '';
            panel.dataset.publishState = (detail.location && detail.location.state) || panel.dataset.publishState || '';
            panel.dataset.publishCity = (detail.location && detail.location.city) || panel.dataset.publishCity || '';

            applyContext(detail);
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        applyContext({
            purposeLabel: panel.dataset.publishPurposeLabel,
            typeLabel: panel.dataset.publishTypeLabel,
            subtype: panel.dataset.publishSubtype,
            title: panel.dataset.publishTitle,
            type: panel.dataset.publishType,
            location: {
                country: panel.dataset.publishCountry,
                street: panel.dataset.publishStreet,
                state: panel.dataset.publishState,
                city: panel.dataset.publishCity
            }
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
        }
    };

    global.ProfilePublish = { init };
})(window);
