(function (global) {
    const subtypeOptions = {
        residencial: [
            { value: 'casa', label: 'Casa' },
            { value: 'departamento-apartamento', label: 'Departamento / Apartamento' },
            { value: 'estudio', label: 'Estudio' },
            { value: 'loft', label: 'Loft' },
            { value: 'duplex-townhouse', label: 'Dúplex / Townhouse' },
            { value: 'villa', label: 'Villa' },
            { value: 'penthouse', label: 'Penthouse' },
            { value: 'cabana-chalet', label: 'Cabaña / Chalet' },
            { value: 'casa-condominio', label: 'Casa en condominio' },
            { value: 'casa-campo-quinta', label: 'Casa de campo / Quinta' },
            { value: 'residencia-lujo', label: 'Residencia de lujo' },
            { value: 'tiny-house', label: 'Tiny House' },
            { value: 'rancho-hacienda-habitacional', label: 'Rancho / Hacienda habitacional' }
        ],
        terrenos: [
            { value: 'terreno-urbano', label: 'Terreno urbano' },
            { value: 'terreno-rustico-ejidal', label: 'Terreno rústico / ejidal' },
            { value: 'lote-residencial', label: 'Lote residencial' },
            { value: 'terreno-comercial', label: 'Terreno comercial' },
            { value: 'terreno-industrial', label: 'Terreno industrial' },
            { value: 'lote-desarrollo', label: 'Lote dentro de desarrollo' },
            { value: 'macrolote', label: 'Macrolote' },
            { value: 'terreno-frente-mar', label: 'Terreno frente al mar / beachfront' }
        ],
        comercial: [
            { value: 'local-comercial', label: 'Local comercial' },
            { value: 'oficina', label: 'Oficina' },
            { value: 'coworking', label: 'Coworking' },
            { value: 'bodega-almacenamiento', label: 'Bodega / Almacenamiento' },
            { value: 'plaza-comercial', label: 'Plaza comercial' },
            { value: 'hotel-hostal', label: 'Hotel / Hostal' },
            { value: 'restaurante-bar', label: 'Restaurante / Bar' },
            { value: 'consultorio-clinica', label: 'Consultorio / Clínica' },
            { value: 'terreno-comercial', label: 'Terreno comercial' },
            { value: 'centro-distribucion-warehouse', label: 'Centro de distribución / Warehouse' }
        ],
        industrial: [
            { value: 'nave-industrial', label: 'Nave industrial' },
            { value: 'bodega-industrial', label: 'Bodega industrial' },
            { value: 'parque-industrial', label: 'Parque industrial' },
            { value: 'terreno-industrial', label: 'Terreno industrial' },
            { value: 'centro-logistico', label: 'Centro logístico' },
            { value: 'planta-produccion', label: 'Planta de producción' },
            { value: 'almacen-gran-escala', label: 'Almacén a gran escala' }
        ],
        especiales: [
            { value: 'eco-cabanas', label: 'Eco-cabañas' },
            { value: 'glamping-domos', label: 'Glamping / Domos' },
            { value: 'propiedad-turistica', label: 'Propiedad turística' },
            { value: 'finca-agricola', label: 'Finca agrícola' },
            { value: 'parcela-agricola', label: 'Parcela agrícola' },
            { value: 'rancho-ganadero', label: 'Rancho ganadero' },
            { value: 'reserva-ecologica', label: 'Reserva ecológica' },
            { value: 'isla-privada', label: 'Isla privada' },
            { value: 'propiedad-frente-mar', label: 'Propiedad frente al mar' }
        ],
        desarrollos: [
            { value: 'desarrollo-horizontal', label: 'Desarrollo horizontal' },
            { value: 'desarrollo-vertical', label: 'Desarrollo vertical' },
            { value: 'preventas', label: 'Preventas' },
            { value: 'masterplan', label: 'Masterplan' },
            { value: 'condo-hotel', label: 'Condo-hotel' },
            { value: 'fraccionamiento-loteo-residencial', label: 'Fraccionamiento / Loteo residencial' },
            { value: 'macrodesarrollo', label: 'Macrodesarrollo' }
        ]
    };

    const defaultLabels = {
        purpose: 'Propósito sin definir',
        type: 'Tipo sin definir'
    };

    let selection = {
        purposeLabel: '',
        typeLabel: '',
        type: ''
    };

    let panelRef = null;

    const populateSubtypeSelect = (panel) => {
        if (!panel) {
            return;
        }

        const subtypeSelect = panel.querySelector('#property-subtype');
        if (!subtypeSelect) {
            return;
        }

        const options = subtypeOptions[selection.type] || [];

        subtypeSelect.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecciona una opción';
        defaultOption.selected = true;
        subtypeSelect.appendChild(defaultOption);

        options.forEach(({ value, label }) => {
            const optionElement = document.createElement('option');
            optionElement.value = value;
            optionElement.textContent = label;
            subtypeSelect.appendChild(optionElement);
        });

        subtypeSelect.disabled = options.length === 0;
    };

    const renderSelection = () => {
        if (!panelRef) {
            return;
        }

        const purposeText = selection.purposeLabel || defaultLabels.purpose;
        const typeText = selection.typeLabel || defaultLabels.type;

        const purposeTargets = panelRef.querySelectorAll('[data-publish-summary="purpose"]');
        const typeTargets = panelRef.querySelectorAll('[data-publish-summary="type"]');

        purposeTargets.forEach((element) => {
            element.textContent = purposeText;
        });

        typeTargets.forEach((element) => {
            element.textContent = typeText;
        });

        populateSubtypeSelect(panelRef);
    };

    const setSelection = (nextSelection = {}) => {
        selection = {
            ...selection,
            purposeLabel: nextSelection.purposeLabel || '',
            typeLabel: nextSelection.typeLabel || '',
            type: nextSelection.type || ''
        };

        renderSelection();
    };

    const init = (panel) => {
        if (!panel || panel.dataset.publicationInitialized === 'true') {
            return;
        }

        panel.dataset.publicationInitialized = 'true';
        panelRef = panel;
        renderSelection();
    };

    global.ProfilePublication = global.ProfilePublication || {
        init,
        setSelection
    };
})(window);
