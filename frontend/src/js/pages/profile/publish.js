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

    const setActivePanel = (publishPanel) => {
        const panels = document.querySelectorAll('.profile__panel');
        panels.forEach((panel) => {
            panel.classList.toggle('profile__panel--active', panel === publishPanel);
        });

        const propertiesMenuLink = document.querySelector('.sidebar__menu-link[data-section="propiedades"]');
        if (propertiesMenuLink) {
            document.querySelectorAll('.sidebar__menu-link[data-section]').forEach((link) => {
                link.classList.toggle('sidebar__menu-link--active', link === propertiesMenuLink);
            });
        }
    };

    const renderSubtypes = (elements, typeKey, typeLabel, state) => {
        if (!elements || !elements.optionsContainer) {
            return;
        }

        elements.optionsContainer.innerHTML = '';
        state.subtype = null;
        if (elements.continueButton) {
            elements.continueButton.disabled = true;
        }

        const subtypes = subtypeCatalog[typeKey] || [];

        if (!subtypes.length) {
            elements.optionsContainer.innerHTML = '<p class="publish-template__empty">Selecciona un tipo de propiedad válido para mostrar subtipos.</p>';
            return;
        }

        const helperText = typeLabel ? `Subtipos para ${typeLabel}` : 'Subtipos disponibles';
        if (elements.typeContext) {
            elements.typeContext.textContent = helperText;
        }

        subtypes.forEach((subtype) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'publish-template__chip';
            button.textContent = subtype;
            button.setAttribute('role', 'option');
            button.setAttribute('aria-selected', 'false');

            button.addEventListener('click', () => {
                state.subtype = subtype;

                const chips = elements.optionsContainer.querySelectorAll('.publish-template__chip');
                chips.forEach((chip) => {
                    const isActive = chip === button;
                    chip.classList.toggle('is-selected', isActive);
                    chip.setAttribute('aria-selected', String(isActive));
                });

                if (elements.continueButton && elements.titleInput) {
                    elements.continueButton.disabled = elements.titleInput.value.trim().length === 0;
                }
            });

            elements.optionsContainer.appendChild(button);
        });
    };

    const createPublishController = (panel) => {
        const elements = {
            purposeLabel: panel.querySelector('[data-publish-purpose-label]'),
            typeLabel: panel.querySelector('[data-publish-type-label]'),
            typeContext: panel.querySelector('[data-publish-type-context]'),
            optionsContainer: panel.querySelector('[data-subtype-options]'),
            titleInput: panel.querySelector('#publish-title'),
            descriptionInput: panel.querySelector('#publish-description'),
            continueButton: panel.querySelector('[data-continue-publish]'),
            draftButton: panel.querySelector('[data-save-draft]')
        };

        const state = {
            subtype: null,
            selection: {
                purposeLabel: '',
                typeLabel: '',
                typeKey: ''
            }
        };

        const updateSummary = () => {
            if (elements.purposeLabel) {
                elements.purposeLabel.textContent = state.selection.purposeLabel || 'Propósito';
            }
            if (elements.typeLabel) {
                elements.typeLabel.textContent = state.selection.typeLabel || 'Tipo';
            }
        };

        const updateContinueState = () => {
            if (!elements.continueButton || !elements.titleInput) {
                return;
            }

            const hasSubtype = Boolean(state.subtype);
            const hasTitle = Boolean(elements.titleInput.value.trim());
            elements.continueButton.disabled = !(hasSubtype && hasTitle);
        };

        if (elements.titleInput) {
            elements.titleInput.addEventListener('input', updateContinueState);
        }

        if (elements.draftButton) {
            elements.draftButton.addEventListener('click', () => {
                elements.draftButton.classList.add('is-highlighted');
                elements.draftButton.textContent = 'Borrador guardado';
                setTimeout(() => {
                    elements.draftButton.classList.remove('is-highlighted');
                    elements.draftButton.textContent = 'Guardar borrador';
                }, 1800);
            });
        }

        if (elements.continueButton) {
            elements.continueButton.addEventListener('click', () => {
                elements.continueButton.blur();
            });
        }

        const applyDetail = (detail) => {
            state.selection = {
                purposeLabel: detail?.purposeLabel || '',
                typeLabel: detail?.typeLabel || '',
                typeKey: detail?.type || ''
            };

            state.subtype = null;
            if (elements.titleInput) {
                elements.titleInput.value = '';
            }
            if (elements.descriptionInput) {
                elements.descriptionInput.value = '';
            }

            if (elements.continueButton) {
                elements.continueButton.disabled = true;
            }

            updateSummary();
            renderSubtypes(elements, state.selection.typeKey, state.selection.typeLabel, state);
        };

        return {
            applyDetail
        };
    };

    const ensurePanelContent = (panel) => new Promise((resolve, reject) => {
        if (!panel) {
            reject(new Error('No se encontró el panel de publicación'));
            return;
        }

        if (panel.dataset.loaded === 'true') {
            resolve(panel);
            return;
        }

        const source = panel.dataset.src;
        if (!source) {
            panel.dataset.loaded = 'true';
            resolve(panel);
            return;
        }

        panel.dataset.loading = 'true';
        fetch(source)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`No se pudo cargar el contenido de ${source}`);
                }
                return response.text();
            })
            .then((html) => {
                panel.innerHTML = html;
                panel.dataset.loaded = 'true';
                resolve(panel);
            })
            .catch((error) => {
                panel.innerHTML = '<p class="panel__error">No se pudo cargar la plantilla de publicación.</p>';
                reject(error);
            })
            .finally(() => {
                delete panel.dataset.loading;
            });
    });

    const handlePublishFlow = (detail) => {
        const publishPanel = document.querySelector('.profile__panel[data-section="publicacion"]');
        if (!publishPanel) {
            return;
        }

        ensurePanelContent(publishPanel)
            .then((panel) => {
                if (!panel.publishController) {
                    panel.publishController = createPublishController(panel);
                }
                panel.publishController.applyDetail(detail);
                setActivePanel(panel);
            })
            .catch((error) => console.error(error));
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.addEventListener('properties:publish:continue', (event) => {
            handlePublishFlow(event.detail || {});
        });
    });

    global.ProfilePublish = { handlePublishFlow };
})(window);
