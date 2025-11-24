(function () {
    const onPanelReady = (panel) => {
        if (!panel) {
            return;
        }
        const event = new CustomEvent('profile:panel-ready', {
            detail: { section: panel.dataset.section || null }
        });
        panel.dispatchEvent(event);
    };

    const initializePanelFeatures = (panel) => {
        if (!panel) {
            return;
        }

        const section = panel.dataset.section;

        if (section === 'propiedades' && window.ProfileProperties && typeof window.ProfileProperties.init === 'function') {
            window.ProfileProperties.init(panel);
        }

        if (section === 'leads' && window.ProfileLeads && typeof window.ProfileLeads.init === 'function') {
            window.ProfileLeads.init(panel);
        }

        if (section === 'mensajes' && window.ProfileMessages && typeof window.ProfileMessages.init === 'function') {
            window.ProfileMessages.init(panel);
        }

        if (section === 'mi-perfil' && window.ProfileMyProfile && typeof window.ProfileMyProfile.init === 'function') {
            window.ProfileMyProfile.init(panel);
        }
    };

    const renderPanelError = (panel) => {
        if (!panel) {
            return;
        }
        panel.innerHTML = '<p class="panel__error">No se pudo cargar el contenido. Intenta recargar la página.</p>';
        panel.dataset.loaded = 'error';
    };

    const loadPanelContent = (panel) => {
        if (!panel) {
            return;
        }

        if (panel.dataset.loaded === 'true') {
            initializePanelFeatures(panel);
            onPanelReady(panel);
            return;
        }

        const source = panel.dataset.src;

        if (!source) {
            panel.dataset.loaded = 'true';
            initializePanelFeatures(panel);
            onPanelReady(panel);
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
                initializePanelFeatures(panel);
                onPanelReady(panel);
            })
            .catch((error) => {
                console.error(error);
                renderPanelError(panel);
            })
            .finally(() => {
                delete panel.dataset.loading;
            });
    };

    document.addEventListener('DOMContentLoaded', () => {
        const menuLinks = document.querySelectorAll('.sidebar__menu-link[data-section]');
        const panels = document.querySelectorAll('.profile__panel');
        const mobileMenu = document.querySelector('.profile__mobile-menu');
        const menuToggle = document.querySelector('.profile__mobile-menu-toggle');
        const publishPanel = document.querySelector('.profile__panel[data-section="publicacion"]');

        const menuLinksArray = Array.from(menuLinks);
        const panelsArray = Array.from(panels);
        let publishSelection = null;

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

        const populateSubtypeSelect = (panel) => {
            if (!panel) {
                return;
            }

            const subtypeSelect = panel.querySelector('#property-subtype');
            if (!subtypeSelect) {
                return;
            }

            const selectedType = publishSelection?.type;
            const options = subtypeOptions[selectedType] || [];

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

        const setMobileMenuState = (isOpen) => {
            if (!mobileMenu || !menuToggle) {
                return;
            }

            mobileMenu.classList.toggle('profile__mobile-menu--open', isOpen);
            menuToggle.classList.toggle('is-active', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            mobileMenu.setAttribute('aria-hidden', String(!isOpen));
            document.body.classList.toggle('profile-menu-open', isOpen);
        };

        const closeMobileMenu = () => setMobileMenuState(false);
        const toggleMobileMenu = () => {
            if (!menuToggle) {
                return;
            }

            const isActive = menuToggle.classList.contains('is-active');
            setMobileMenuState(!isActive);
        };

        const renderPublishSelection = (panel) => {
            if (!panel) {
                return;
            }

            const purposeText = publishSelection?.purposeLabel || 'Propósito sin definir';
            const typeText = publishSelection?.typeLabel || 'Tipo sin definir';

            const purposeTargets = panel.querySelectorAll('[data-publish-summary="purpose"]');
            const typeTargets = panel.querySelectorAll('[data-publish-summary="type"]');

            purposeTargets.forEach((element) => {
                element.textContent = purposeText;
            });

            typeTargets.forEach((element) => {
                element.textContent = typeText;
            });

            populateSubtypeSelect(panel);
        };

        const activateSection = (targetSection, options = {}) => {
            const { skipMenuUpdate = false } = options;

            if (!targetSection) {
                return;
            }

            const targetPanel = panelsArray.find((panel) => panel.dataset.section === targetSection);

            if (!targetPanel) {
                return;
            }

            if (!skipMenuUpdate) {
                menuLinksArray.forEach((menuLink) => {
                    const isActiveLink = menuLink.dataset.section === targetSection;
                    menuLink.classList.toggle('sidebar__menu-link--active', isActiveLink);
                });
            }

            panelsArray.forEach((panel) => {
                const isActive = panel === targetPanel;
                panel.classList.toggle('profile__panel--active', isActive);

                if (!isActive) {
                    return;
                }

                const hasContent = panel.innerHTML.trim().length > 0;
                const isLoaded = panel.dataset.loaded === 'true';
                const isLoading = panel.dataset.loading === 'true';

                if (isLoaded) {
                    initializePanelFeatures(panel);
                    onPanelReady(panel);
                    return;
                }

                if (!hasContent || !isLoaded) {
                    if (!isLoading) {
                        loadPanelContent(panel);
                    }
                    return;
                }

                panel.dataset.loaded = 'true';
                initializePanelFeatures(panel);
                onPanelReady(panel);
            });
        };

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', (event) => {
                event.stopPropagation();
                toggleMobileMenu();
            });

            mobileMenu.addEventListener('click', (event) => {
                if (event.target === mobileMenu) {
                    closeMobileMenu();
                }
            });
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMobileMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                closeMobileMenu();
            }
        });

        panelsArray.forEach((panel) => loadPanelContent(panel));

        if (publishPanel) {
            publishPanel.addEventListener('profile:panel-ready', () => renderPublishSelection(publishPanel));
        }

        menuLinksArray.forEach((link) => {
            link.addEventListener('click', (event) => {
                const targetSection = link.dataset.section;
                if (!targetSection) {
                    return;
                }

                event.preventDefault();

                activateSection(targetSection);

                closeMobileMenu();
            });
        });

        document.addEventListener('properties:publish:continue', (event) => {
            publishSelection = {
                purposeLabel: event.detail?.purposeLabel || '',
                typeLabel: event.detail?.typeLabel || '',
                type: event.detail?.type || ''
            };

            if (publishPanel) {
                renderPublishSelection(publishPanel);
            }

            activateSection('publicacion', { skipMenuUpdate: true });
            closeMobileMenu();
        });
    });
})();
