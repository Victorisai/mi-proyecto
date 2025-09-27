document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.sidebar__menu-link[data-section]');
    const panels = document.querySelectorAll('.profile__panel');
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.profile__menu-toggle');
    const menuOverlay = document.querySelector('.profile__menu-overlay');
    const profileBody = document.body.classList.contains('profile-page') ? document.body : null;

    const setMenuState = (isOpen) => {
        if (!sidebar) {
            return;
        }

        sidebar.classList.toggle('sidebar--open', isOpen);

        if (menuOverlay) {
            menuOverlay.classList.toggle('profile__menu-overlay--visible', isOpen);
        }

        if (menuToggle) {
            menuToggle.classList.toggle('profile__menu-toggle--active', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        }

        if (profileBody) {
            profileBody.classList.toggle('profile-page--menu-open', isOpen);
        }
    };

    const closeMenuOnLargeScreens = () => {
        if (window.matchMedia('(min-width: 993px)').matches) {
            setMenuState(false);
        }
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isOpen = sidebar ? sidebar.classList.contains('sidebar--open') : false;
            setMenuState(!isOpen);
        });
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => setMenuState(false));
    }

    window.addEventListener('resize', closeMenuOnLargeScreens);

    const loadPanelContent = (panel) => {
        const source = panel.dataset.src;
        if (!source) {
            return;
        }

        fetch(source)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`No se pudo cargar el contenido de ${source}`);
                }
                return response.text();
            })
            .then(html => {
                panel.innerHTML = html;
            })
            .catch(error => {
                console.error(error);
                panel.innerHTML = '<p class="panel__error">No se pudo cargar el contenido. Intenta recargar la página.</p>';
            });
    };

    panels.forEach(loadPanelContent);

    menuLinks.forEach(link => {
        link.addEventListener('click', event => {
            const targetSection = link.dataset.section;
            if (!targetSection) {
                return;
            }

            event.preventDefault();

            menuLinks.forEach(menuLink => menuLink.classList.remove('sidebar__menu-link--active'));
            link.classList.add('sidebar__menu-link--active');

            panels.forEach(panel => {
                const isActive = panel.dataset.section === targetSection;
                panel.classList.toggle('profile__panel--active', isActive);
            });

            if (window.matchMedia('(max-width: 992px)').matches) {
                setMenuState(false);
            }
        });
    });
});
