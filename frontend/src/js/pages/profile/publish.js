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

        const applyLocationContext = (detail = {}) => {
            const purpose = detail.purposeLabel || panel.dataset.publishPurposeLabel || 'Propósito no definido';
            const type = detail.typeLabel || panel.dataset.publishTypeLabel || 'Tipo no definido';
            const subtype = detail.subtype || panel.dataset.publishSubtype || 'Subtipo no definido';
            const title = detail.title || panel.dataset.publishTitle || 'Propiedad sin título';
            const location = detail.location || {};

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

            if (countryInput && typeof location.country === 'string') {
                countryInput.value = location.country;
            }

            if (streetInput && typeof location.street === 'string') {
                streetInput.value = location.street;
            }

            if (stateInput && typeof location.state === 'string') {
                stateInput.value = location.state;
            }

            if (cityInput && typeof location.city === 'string') {
                cityInput.value = location.city;
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

        if (saveButton) {
            saveButton.addEventListener('click', (event) => {
                event.preventDefault();

                const location = {
                    country: countryInput ? countryInput.value.trim() : '',
                    street: streetInput ? streetInput.value.trim() : '',
                    state: stateInput ? stateInput.value.trim() : '',
                    city: cityInput ? cityInput.value.trim() : ''
                };

                panel.dataset.locationCountry = location.country;
                panel.dataset.locationStreet = location.street;
                panel.dataset.locationState = location.state;
                panel.dataset.locationCity = location.city;

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
            panel.dataset.locationCountry = (detail.location && detail.location.country) || panel.dataset.locationCountry || '';
            panel.dataset.locationStreet = (detail.location && detail.location.street) || panel.dataset.locationStreet || '';
            panel.dataset.locationState = (detail.location && detail.location.state) || panel.dataset.locationState || '';
            panel.dataset.locationCity = (detail.location && detail.location.city) || panel.dataset.locationCity || '';

            applyLocationContext(detail);
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        applyLocationContext({
            purposeLabel: panel.dataset.publishPurposeLabel,
            typeLabel: panel.dataset.publishTypeLabel,
            subtype: panel.dataset.publishSubtype,
            title: panel.dataset.publishTitle,
            location: {
                country: panel.dataset.locationCountry,
                street: panel.dataset.locationStreet,
                state: panel.dataset.locationState,
                city: panel.dataset.locationCity
            }
        });
    };

    const initCharacteristicsPanel = (panel) => {
        if (!panel || panel.dataset.publishCharacteristicsInitialized === 'true') {
            return;
        }

        panel.dataset.publishCharacteristicsInitialized = 'true';

        const heading = panel.querySelector('[data-characteristics-heading]');
        const purposeTargets = panel.querySelectorAll('[data-characteristics-purpose]');
        const typeTargets = panel.querySelectorAll('[data-characteristics-type]');
        const subtypeTargets = panel.querySelectorAll('[data-characteristics-subtype]');
        const titleTargets = panel.querySelectorAll('[data-characteristics-title]');
        const locationBadge = panel.querySelector('[data-characteristics-location]');
        const typeSections = panel.querySelectorAll('[data-characteristics-section]');
        const backButton = panel.querySelector('[data-publish-characteristics-back]');
        const saveButton = panel.querySelector('[data-publish-characteristics-save]');

        const formatLocationBadge = (location = {}) => {
            const parts = [location.city, location.state].filter(Boolean);
            return parts.length ? `Ubicación: ${parts.join(', ')}` : 'Ubicación pendiente';
        };

        const applyCharacteristicsContext = (detail = {}) => {
            const purpose = detail.purposeLabel || panel.dataset.publishPurposeLabel || 'Propósito no definido';
            const type = detail.typeLabel || panel.dataset.publishTypeLabel || 'Tipo no definido';
            const subtype = detail.subtype || panel.dataset.publishSubtype || 'Subtipo no definido';
            const title = detail.title || panel.dataset.publishTitle || 'Propiedad sin título';
            const location = detail.location || {
                city: panel.dataset.locationCity,
                state: panel.dataset.locationState
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
                element.textContent = title.trim().length ? title : 'Título pendiente';
            });

            if (locationBadge) {
                locationBadge.textContent = formatLocationBadge(location);
            }

            typeSections.forEach((section) => {
                const isActive = (detail.type || panel.dataset.publishType) === section.dataset.type;
                section.classList.toggle('publish-characteristics__specific-group--visible', isActive);
            });

            if (heading) {
                heading.textContent = title.trim().length
                    ? `Características para: ${title}`
                    : 'Define las características clave';
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
                    location: {
                        country: panel.dataset.locationCountry || '',
                        street: panel.dataset.locationStreet || '',
                        state: panel.dataset.locationState || '',
                        city: panel.dataset.locationCity || ''
                    }
                };

                document.dispatchEvent(new CustomEvent('publish:characteristics:back', { detail }));
            });
        }

        if (saveButton) {
            saveButton.addEventListener('click', (event) => {
                event.preventDefault();

                const general = {
                    totalArea: panel.querySelector('[data-characteristic-total-area]')?.value.trim(),
                    builtArea: panel.querySelector('[data-characteristic-built-area]')?.value.trim(),
                    age: panel.querySelector('[data-characteristic-age]')?.value,
                    condition: panel.querySelector('[data-characteristic-condition]')?.value,
                    financing: panel.querySelector('[data-characteristic-financing]')?.checked || false,
                    services: Array.from(panel.querySelectorAll('[data-characteristic-service]:checked')).map((service) =>
                        service.value
                    )
                };

                const detail = {
                    purposeLabel: panel.dataset.publishPurposeLabel || '',
                    typeLabel: panel.dataset.publishTypeLabel || '',
                    type: panel.dataset.publishType || '',
                    subtype: panel.dataset.publishSubtype || '',
                    title: panel.dataset.publishTitle || '',
                    location: {
                        country: panel.dataset.locationCountry || '',
                        street: panel.dataset.locationStreet || '',
                        state: panel.dataset.locationState || '',
                        city: panel.dataset.locationCity || ''
                    },
                    general,
                    specific: {}
                };

                const type = detail.type;

                if (type === 'residencial') {
                    detail.specific = {
                        bedrooms: panel.querySelector('[data-characteristic-bedrooms]')?.value.trim(),
                        bathrooms: panel.querySelector('[data-characteristic-bathrooms]')?.value.trim(),
                        halfBathrooms: panel.querySelector('[data-characteristic-half-bathrooms]')?.value.trim(),
                        parking: panel.querySelector('[data-characteristic-parking]')?.value.trim(),
                        equippedKitchen: panel.querySelector('[data-characteristic-equipped-kitchen]')?.checked || false,
                        livingRoom: panel.querySelector('[data-characteristic-living-room]')?.checked || false,
                        diningRoom: panel.querySelector('[data-characteristic-dining-room]')?.checked || false,
                        terrace: panel.querySelector('[data-characteristic-terrace]')?.checked || false,
                        garden: panel.querySelector('[data-characteristic-garden]')?.checked || false,
                        pool: panel.querySelector('[data-characteristic-pool]')?.checked || false,
                        privateSecurity: panel.querySelector('[data-characteristic-private-security]')?.checked || false,
                        furnished: panel.querySelector('[data-characteristic-furnished]')?.checked || false,
                        ac: panel.querySelector('[data-characteristic-ac]')?.checked || false,
                        walkIn: panel.querySelector('[data-characteristic-walkin]')?.checked || false,
                        laundry: panel.querySelector('[data-characteristic-laundry]')?.checked || false,
                        pets: panel.querySelector('[data-characteristic-pets]')?.checked || false
                    };
                }

                if (type === 'terrenos') {
                    detail.specific = {
                        landUse: panel.querySelector('[data-characteristic-land-use]')?.value.trim(),
                        access: panel.querySelector('[data-characteristic-land-access]')?.value.trim(),
                        subdivision: panel.querySelector('[data-characteristic-land-subdivision]')?.value.trim(),
                        interestPoints: panel.querySelector('[data-characteristic-land-interest]')?.value.trim()
                    };
                }

                if (type === 'comercial') {
                    detail.specific = {
                        levels: panel.querySelector('[data-characteristic-commercial-levels]')?.value.trim(),
                        bathrooms: panel.querySelector('[data-characteristic-commercial-bathrooms]')?.value.trim(),
                        parking: panel.querySelector('[data-characteristic-commercial-parking]')?.value.trim(),
                        air: panel.querySelector('[data-characteristic-commercial-air]')?.value.trim(),
                        accessibility: panel.querySelector('[data-characteristic-commercial-accessibility]')?.value.trim(),
                        front: panel.querySelector('[data-characteristic-commercial-front]')?.value.trim(),
                        reception: panel.querySelector('[data-characteristic-commercial-reception]')?.checked || false,
                        warehouse: panel.querySelector('[data-characteristic-commercial-warehouse]')?.checked || false,
                        permits: panel.querySelector('[data-characteristic-commercial-permits]')?.checked || false,
                        security: panel.querySelector('[data-characteristic-commercial-security]')?.checked || false
                    };
                }

                if (type === 'industrial') {
                    detail.specific = {
                        height: panel.querySelector('[data-characteristic-industrial-height]')?.value.trim(),
                        floorCapacity: panel.querySelector('[data-characteristic-industrial-floor]')?.value.trim(),
                        docks: panel.querySelector('[data-characteristic-industrial-docks]')?.value.trim(),
                        offices: panel.querySelector('[data-characteristic-industrial-offices]')?.value.trim(),
                        fireSystem: panel.querySelector('[data-characteristic-industrial-fire]')?.value.trim(),
                        power: panel.querySelector('[data-characteristic-industrial-power]')?.checked || false,
                        crane: panel.querySelector('[data-characteristic-industrial-crane]')?.checked || false,
                        trailers: panel.querySelector('[data-characteristic-industrial-trailers]')?.checked || false,
                        zoning: panel.querySelector('[data-characteristic-industrial-zoning]')?.checked || false,
                        security: panel.querySelector('[data-characteristic-industrial-security]')?.checked || false
                    };
                }

                if (type === 'especiales') {
                    detail.specific = {
                        paths: panel.querySelector('[data-characteristic-special-paths]')?.value.trim(),
                        certificates: panel.querySelector('[data-characteristic-special-certificates]')?.value.trim(),
                        tourism: panel.querySelector('[data-characteristic-special-tourism]')?.value.trim(),
                        production: panel.querySelector('[data-characteristic-special-production]')?.value.trim(),
                        animals: panel.querySelector('[data-characteristic-special-animals]')?.value.trim(),
                        distance: panel.querySelector('[data-characteristic-special-distance]')?.value.trim()
                    };
                }

                if (type === 'desarrollos') {
                    detail.specific = {
                        units: panel.querySelector('[data-characteristic-development-units]')?.value.trim(),
                        status: panel.querySelector('[data-characteristic-development-status]')?.value.trim(),
                        amenities: panel.querySelector('[data-characteristic-development-amenities]')?.value.trim(),
                        unitTypes: panel.querySelector('[data-characteristic-development-unit-types]')?.value.trim(),
                        masterplan: panel.querySelector('[data-characteristic-development-masterplan]')?.value.trim(),
                        permits: panel.querySelector('[data-characteristic-development-permits]')?.value.trim(),
                        builder: panel.querySelector('[data-characteristic-development-builder]')?.value.trim(),
                        progress: panel.querySelector('[data-characteristic-development-progress]')?.value.trim()
                    };
                }

                document.dispatchEvent(new CustomEvent('publish:characteristics:complete', { detail }));
            });
        }

        panel.addEventListener('publish-characteristics:open', (event) => {
            const detail = event.detail || {};

            panel.dataset.publishPurposeLabel = detail.purposeLabel || panel.dataset.publishPurposeLabel || '';
            panel.dataset.publishTypeLabel = detail.typeLabel || panel.dataset.publishTypeLabel || '';
            panel.dataset.publishType = detail.type || panel.dataset.publishType || '';
            panel.dataset.publishSubtype = detail.subtype || panel.dataset.publishSubtype || '';
            panel.dataset.publishTitle = detail.title || panel.dataset.publishTitle || '';
            panel.dataset.locationCountry = (detail.location && detail.location.country) || panel.dataset.locationCountry || '';
            panel.dataset.locationStreet = (detail.location && detail.location.street) || panel.dataset.locationStreet || '';
            panel.dataset.locationState = (detail.location && detail.location.state) || panel.dataset.locationState || '';
            panel.dataset.locationCity = (detail.location && detail.location.city) || panel.dataset.locationCity || '';

            applyCharacteristicsContext(detail);
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        applyCharacteristicsContext({
            purposeLabel: panel.dataset.publishPurposeLabel,
            typeLabel: panel.dataset.publishTypeLabel,
            type: panel.dataset.publishType,
            subtype: panel.dataset.publishSubtype,
            title: panel.dataset.publishTitle,
            location: {
                country: panel.dataset.locationCountry,
                street: panel.dataset.locationStreet,
                state: panel.dataset.locationState,
                city: panel.dataset.locationCity
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
