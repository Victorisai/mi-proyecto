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

        if (section === 'publicar' && window.ProfilePublish && typeof window.ProfilePublish.init === 'function') {
            window.ProfilePublish.init(panel);
        }

        if (section === 'ubicacion' && window.ProfileLocation && typeof window.ProfileLocation.init === 'function') {
            window.ProfileLocation.init(panel);
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
        const publishPanel = document.querySelector('.profile__panel[data-section="publicar"]');
        const locationPanel = document.querySelector('.profile__panel[data-section="ubicacion"]');

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

        const activatePublishPanel = (detail = {}) => {
            if (!publishPanel) {
                return;
            }

            panels.forEach((panel) => {
                const isActive = panel === publishPanel;
                panel.classList.toggle('profile__panel--active', isActive);
            });

            menuLinks.forEach((menuLink) => menuLink.classList.remove('sidebar__menu-link--active'));

            publishPanel.dataset.publishPurpose = detail.purpose || '';
            publishPanel.dataset.publishPurposeLabel = detail.purposeLabel || '';
            publishPanel.dataset.publishType = detail.type || '';
            publishPanel.dataset.publishTypeLabel = detail.typeLabel || '';

            const emitOpen = () => publishPanel.dispatchEvent(new CustomEvent('publish:open', { detail }));

            if (publishPanel.dataset.loaded === 'true') {
                emitOpen();
                return;
            }

            const handleReady = () => {
                publishPanel.removeEventListener('profile:panel-ready', handleReady);
                emitOpen();
            };

            publishPanel.addEventListener('profile:panel-ready', handleReady);
        };

        const activateLocationPanel = (detail = {}) => {
            if (!locationPanel) {
                return;
            }

            panels.forEach((panel) => {
                const isActive = panel === locationPanel;
                panel.classList.toggle('profile__panel--active', isActive);
            });

            menuLinks.forEach((menuLink) => menuLink.classList.remove('sidebar__menu-link--active'));

            locationPanel.dataset.locationPurpose = detail.purpose || '';
            locationPanel.dataset.locationPurposeLabel = detail.purposeLabel || '';
            locationPanel.dataset.locationType = detail.type || '';
            locationPanel.dataset.locationTypeLabel = detail.typeLabel || '';
            locationPanel.dataset.locationSubtype = detail.subtype || '';
            locationPanel.dataset.locationSubtypeLabel = detail.subtypeLabel || '';
            locationPanel.dataset.locationTitle = detail.title || '';
            locationPanel.dataset.locationDescription = detail.description || '';

            const emitOpen = () => locationPanel.dispatchEvent(new CustomEvent('location:open', { detail }));

            if (locationPanel.dataset.loaded === 'true') {
                emitOpen();
                return;
            }

            if (locationPanel.dataset.loaded === 'error') {
                return;
            }

            const handleReady = () => {
                locationPanel.removeEventListener('profile:panel-ready', handleReady);
                emitOpen();
            };

            locationPanel.addEventListener('profile:panel-ready', handleReady);
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

        panels.forEach((panel) => loadPanelContent(panel));

        document.addEventListener('properties:publish:continue', (event) => {
            activatePublishPanel(event.detail || {});
            closeMobileMenu();
        });

        document.addEventListener('publish:continue', (event) => {
            activateLocationPanel(event.detail || {});
            closeMobileMenu();
        });

        menuLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                const targetSection = link.dataset.section;
                if (!targetSection) {
                    return;
                }

                event.preventDefault();

                menuLinks.forEach((menuLink) => menuLink.classList.remove('sidebar__menu-link--active'));
                link.classList.add('sidebar__menu-link--active');

                panels.forEach((panel) => {
                    const isActive = panel.dataset.section === targetSection;
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

                closeMobileMenu();
            });
        });
    });
})();
