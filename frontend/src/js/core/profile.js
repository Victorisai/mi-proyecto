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
        const profileLayout = document.querySelector('.profile');
        const menuToggle = document.querySelector('.profile__menu-toggle');
        const menuOverlay = document.querySelector('[data-menu-overlay]');

        const closeMobileMenu = () => {
            document.body.classList.remove('profile-menu-open');

            if (!profileLayout) {
                return;
            }

            profileLayout.classList.remove('profile--menu-open');

            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        };

        const openMobileMenu = () => {
            if (!profileLayout) {
                return;
            }

            profileLayout.classList.add('profile--menu-open');
            document.body.classList.add('profile-menu-open');

            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'true');
            }
        };

        const toggleMobileMenu = () => {
            if (!profileLayout) {
                return;
            }

            if (profileLayout.classList.contains('profile--menu-open')) {
                closeMobileMenu();
                return;
            }

            openMobileMenu();
        };

        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMobileMenu);
        }

        if (menuOverlay) {
            menuOverlay.addEventListener('click', closeMobileMenu);
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
