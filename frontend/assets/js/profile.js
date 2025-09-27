document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.sidebar__menu-link[data-section]');
    const panels = document.querySelectorAll('.profile__panel');

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
                if (panel.dataset.section === 'propiedades') {
                    if (window.PropertyWizard) {
                        window.PropertyWizard.autoInit(panel);
                    }
                }
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
        });
    });
});
