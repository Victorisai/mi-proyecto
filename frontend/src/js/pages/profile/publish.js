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

    const state = {
        latestDetail: null
    };

    const fillSelectOptions = (select, type) => {
        if (!select) {
            return;
        }

        const options = subtypeCatalog[type] || [];
        select.innerHTML = '<option value="">Selecciona el subtipo</option>';

        options.forEach((label) => {
            const option = document.createElement('option');
            option.value = label;
            option.textContent = label;
            select.appendChild(option);
        });
    };

    const updateSummary = (panel, detail) => {
        if (!panel) {
            return;
        }

        const purposeChip = panel.querySelector('[data-publish-purpose-chip]');
        const typeChip = panel.querySelector('[data-publish-type-chip]');
        const contextText = panel.querySelector('[data-publish-context]');
        const subtypeHelper = panel.querySelector('[data-subtype-helper]');

        if (purposeChip) {
            purposeChip.textContent = detail.purposeLabel || 'Publicación';
        }

        if (typeChip) {
            typeChip.textContent = detail.typeLabel || '';
        }

        if (contextText) {
            const purposeText = detail.purposeLabel ? detail.purposeLabel.toLowerCase() : 'publicar';
            const typeText = detail.typeLabel ? detail.typeLabel.toLowerCase() : 'tu propiedad';
            contextText.textContent = `Configura los datos iniciales para ${purposeText} una propiedad ${typeText}.`;
        }

        if (subtypeHelper) {
            if (subtypeCatalog[detail.type] && subtypeCatalog[detail.type].length) {
                subtypeHelper.textContent = 'Selecciona el subtipo que mejor describa tu inmueble.';
            } else {
                subtypeHelper.textContent = 'No hay subtipos configurados para este tipo; revisa la selección previa.';
            }
        }
    };

    const toggleButtons = (panel, isValid) => {
        const continueButton = panel.querySelector('[data-publish-continue]');
        if (continueButton) {
            continueButton.disabled = !isValid;
        }
    };

    const activatePanel = (panel, detail) => {
        const main = document.querySelector('.profile__main-content');
        if (!main || !panel) {
            return;
        }

        document.querySelectorAll('.profile__panel').forEach((panelItem) => {
            panelItem.classList.toggle('profile__panel--active', panelItem === panel);
        });

        document.querySelectorAll('.sidebar__menu-link').forEach((link) => {
            link.classList.remove('sidebar__menu-link--active');
        });

        fillSelectOptions(panel.querySelector('[data-subtype-select]'), detail.type);
        updateSummary(panel, detail);
        toggleButtons(panel, false);
    };

    const init = (panel) => {
        if (!panel || panel.dataset.section !== 'publicacion' || panel.dataset.publishInitialized === 'true') {
            return;
        }

        panel.dataset.publishInitialized = 'true';

        const select = panel.querySelector('[data-subtype-select]');
        const continueButton = panel.querySelector('[data-publish-continue]');
        const draftButton = panel.querySelector('[data-publish-draft]');

        if (select) {
            select.addEventListener('change', () => {
                toggleButtons(panel, Boolean(select.value));
            });
        }

        if (continueButton) {
            continueButton.addEventListener('click', (event) => {
                event.preventDefault();
                if (continueButton.disabled) {
                    return;
                }
                // Aquí se integrarán los siguientes pasos del flujo de publicación.
                continueButton.textContent = 'Continuando...';
                setTimeout(() => {
                    continueButton.textContent = 'Continuar';
                }, 1200);
            });
        }

        if (draftButton) {
            draftButton.addEventListener('click', (event) => {
                event.preventDefault();
                draftButton.textContent = 'Guardado';
                setTimeout(() => {
                    draftButton.textContent = 'Guardar borrador';
                }, 1200);
            });
        }

        if (state.latestDetail) {
            activatePanel(panel, state.latestDetail);
        }
    };

    const handlePublishFlow = (detail) => {
        const main = document.querySelector('.profile__main-content');
        const publishPanel = main ? main.querySelector('[data-section="publicacion"]') : null;

        if (!publishPanel) {
            return;
        }

        state.latestDetail = detail;

        const ensureReady = () => {
            activatePanel(publishPanel, detail);
        };

        if (publishPanel.dataset.loaded === 'true') {
            ensureReady();
            return;
        }

        const onReady = (event) => {
            if (event?.detail?.section !== 'publicacion') {
                return;
            }
            publishPanel.removeEventListener('profile:panel-ready', onReady);
            ensureReady();
        };

        publishPanel.addEventListener('profile:panel-ready', onReady);
    };

    document.addEventListener('properties:publish:continue', (event) => {
        if (!event.detail) {
            return;
        }
        handlePublishFlow(event.detail);
    });

    global.ProfilePublish = { init };
})(window);
