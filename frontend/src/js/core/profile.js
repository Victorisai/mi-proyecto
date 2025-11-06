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
        const desktopMenu = document.querySelector('.sidebar__menu');
        const mobileMenuNav = document.querySelector('.profile__mobile-nav');

        if (desktopMenu && mobileMenuNav) {
            mobileMenuNav.innerHTML = '';
            const mobileMenuList = desktopMenu.cloneNode(true);
            mobileMenuList.classList.add('profile__mobile-menu-list');
            mobileMenuNav.appendChild(mobileMenuList);
        }

        const mobilePanel = document.querySelector('.profile__mobile-panel');
        const menuToggle = document.querySelector('.profile__menu-toggle');
        const mobileCloseButton = mobilePanel ? mobilePanel.querySelector('.profile__mobile-close') : null;
        const mobilePanelContent = mobilePanel ? mobilePanel.querySelector('.profile__mobile-panel-content') : null;
        let lastFocusedElement = null;

        const setMobileMenuState = (isOpen) => {
            if (mobilePanel) {
                mobilePanel.classList.toggle('is-open', isOpen);
                mobilePanel.setAttribute('aria-hidden', String(!isOpen));
            }

            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', String(isOpen));
            }

            document.body.classList.toggle('no-scroll', Boolean(isOpen));
        };

        const focusFirstMobileElement = () => {
            if (!mobilePanel) {
                return;
            }

            const focusable = mobilePanel.querySelector('a, button, [tabindex="0"]');

            if (focusable instanceof HTMLElement) {
                focusable.focus();
                return;
            }

            if (mobilePanelContent instanceof HTMLElement) {
                mobilePanelContent.focus();
            }
        };

        const openMobileMenu = () => {
            if (!mobilePanel || !menuToggle) {
                return;
            }

            lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            setMobileMenuState(true);

            const focusCallback = () => {
                focusFirstMobileElement();
            };

            if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
                window.requestAnimationFrame(focusCallback);
            } else {
                setTimeout(focusCallback, 0);
            }
        };

        const closeMobileMenu = ({ returnFocus = true } = {}) => {
            setMobileMenuState(false);

            if (returnFocus) {
                if (menuToggle instanceof HTMLElement) {
                    menuToggle.focus();
                    return;
                }

                if (lastFocusedElement instanceof HTMLElement) {
                    lastFocusedElement.focus();
                }
            }

            lastFocusedElement = null;
        };

        if (menuToggle && mobilePanel) {
            menuToggle.addEventListener('click', () => {
                const isOpen = mobilePanel.classList.contains('is-open');
                if (isOpen) {
                    closeMobileMenu();
                    return;
                }
                openMobileMenu();
            });
        }

        if (mobileCloseButton) {
            mobileCloseButton.addEventListener('click', () => closeMobileMenu());
        }

        if (mobilePanel) {
            mobilePanel.addEventListener('click', (event) => {
                if (event.target === mobilePanel) {
                    closeMobileMenu();
                }
            });
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                closeMobileMenu({ returnFocus: false });
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && mobilePanel && mobilePanel.classList.contains('is-open')) {
                closeMobileMenu();
            }
        });

        if (mobilePanel) {
            setMobileMenuState(false);
        }

        const menuLinks = document.querySelectorAll('.sidebar__menu-link[data-section]');
        const panels = document.querySelectorAll('.profile__panel');

        panels.forEach((panel) => loadPanelContent(panel));

        menuLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                const targetSection = link.dataset.section;
                const isMobileLink = Boolean(link.closest('.profile__mobile-panel'));

                if (!targetSection) {
                    if (isMobileLink) {
                        closeMobileMenu();
                    }
                    return;
                }

                event.preventDefault();

                menuLinks.forEach((menuLink) => menuLink.classList.remove('sidebar__menu-link--active'));
                document
                    .querySelectorAll(`.sidebar__menu-link[data-section="${targetSection}"]`)
                    .forEach((menuLink) => menuLink.classList.add('sidebar__menu-link--active'));

                if (isMobileLink) {
                    closeMobileMenu();
                }

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
            });
        });
    });
})();
