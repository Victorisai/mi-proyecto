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

    const init = (panel) => {
        if (!panel || panel.dataset.section !== 'publicar' || panel.dataset.publishInitialized === 'true') {
            return;
        }

        panel.dataset.publishInitialized = 'true';

        const selectionState = {
            purpose: panel.dataset.publishPurpose || '',
            purposeLabel: panel.dataset.publishPurposeLabel || '',
            type: panel.dataset.publishType || '',
            typeLabel: panel.dataset.publishTypeLabel || ''
        };

        const formatSelection = (value, fallback) => (value && value.trim().length ? value : fallback);

        const updateSubtypePreview = (root) => {
            const subtypeSelect = root.querySelector('[data-publish-subtype]');
            const subtypePreview = root.querySelector('[data-publish-subtype-preview]');

            if (!subtypePreview) {
                return;
            }

            const currentOption = subtypeSelect ? subtypeSelect.options[subtypeSelect.selectedIndex] : null;
            const previewText = currentOption && currentOption.value ? currentOption.textContent : 'Pendiente de selección';
            subtypePreview.textContent = previewText;
        };

        const populateSubtypeOptions = (typeKey, root) => {
            const subtypeSelect = root.querySelector('[data-publish-subtype]');
            const subtypeHelper = root.querySelector('[data-publish-subtype-helper]');

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
                updateSubtypePreview(root);
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
            updateSubtypePreview(root);
        };

        const applySelection = (root = panel) => {
            const purposeLabels = root.querySelectorAll('[data-publish-purpose-label]');
            const typeLabels = root.querySelectorAll('[data-publish-type-label]');
            const selectedTypeTag = root.querySelector('[data-publish-selected-type]');
            const heading = root.querySelector('[data-publish-heading]');

            const purposeText = formatSelection(selectionState.purposeLabel, 'Propósito no definido');
            const typeText = formatSelection(selectionState.typeLabel, 'Tipo de propiedad no definido');

            purposeLabels.forEach((element) => {
                element.textContent = purposeText;
            });

            typeLabels.forEach((element) => {
                element.textContent = typeText;
            });

            if (selectedTypeTag) {
                selectedTypeTag.textContent = selectionState.typeLabel
                    ? `Tipo: ${selectionState.typeLabel}`
                    : 'Define el tipo desde el modal';
            }

            if (heading) {
                heading.textContent = selectionState.typeLabel
                    ? `Publicando ${selectionState.typeLabel.toLowerCase()}`
                    : 'Configura tu anuncio';
            }

            populateSubtypeOptions(selectionState.type, root);
        };

        const loadStage = (source, onReady) => {
            if (!source) {
                return;
            }

            fetch(source)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`No se pudo cargar el contenido de ${source}`);
                    }
                    return response.text();
                })
                .then((html) => {
                    panel.innerHTML = html;
                    if (typeof onReady === 'function') {
                        onReady();
                    }
                    applySelection(panel);
                })
                .catch((error) => console.error(error));
        };

        const setupLocationStage = () => {
            const backButton = panel.querySelector('[data-location-back]');
            const continueButton = panel.querySelector('[data-location-continue]');
            const detailsSource = panel.dataset.src || 'assets/templates/profile/publicar.html';

            if (backButton) {
                backButton.addEventListener('click', () => loadStage(detailsSource, setupDetailStage));
            }

            if (continueButton) {
                continueButton.addEventListener('click', () => {
                    continueButton.textContent = 'Ubicación guardada';
                    continueButton.disabled = true;
                });
            }
        };

        const setupDetailStage = () => {
            const stage = panel.querySelector('[data-publish-stage="details"]') || panel;
            const subtypeSelect = stage.querySelector('[data-publish-subtype]');
            const continueButton = stage.querySelector('[data-publish-continue]');
            const locationSource = stage.dataset.locationSrc || 'assets/templates/profile/publicar_location.html';

            if (subtypeSelect) {
                subtypeSelect.addEventListener('change', () => updateSubtypePreview(stage));
            }

            if (continueButton) {
                continueButton.addEventListener('click', () => loadStage(locationSource, setupLocationStage));
            }

            applySelection(stage);
        };

        panel.addEventListener('publish:open', (event) => {
            const detail = event.detail || {};
            selectionState.purpose = detail.purpose || selectionState.purpose;
            selectionState.purposeLabel = detail.purposeLabel || selectionState.purposeLabel;
            selectionState.type = detail.type || selectionState.type;
            selectionState.typeLabel = detail.typeLabel || selectionState.typeLabel;

            applySelection(panel);
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        selectionState.purpose = panel.dataset.publishPurpose || selectionState.purpose;
        selectionState.purposeLabel = panel.dataset.publishPurposeLabel || selectionState.purposeLabel;
        selectionState.type = panel.dataset.publishType || selectionState.type;
        selectionState.typeLabel = panel.dataset.publishTypeLabel || selectionState.typeLabel;

        setupDetailStage();
    };

    global.ProfilePublish = { init };
})(window);
