(function (global) {
    const PUBLISH_SECTION = 'publicacion';

    const togglePanelVisibility = (targetPanel) => {
        const panels = document.querySelectorAll('.profile__panel');
        panels.forEach((panel) => {
            const isActive = panel === targetPanel;
            panel.classList.toggle('profile__panel--active', isActive);
        });
    };

    const setMenuContext = () => {
        const menuLinks = document.querySelectorAll('.sidebar__menu-link[data-section]');
        menuLinks.forEach((link) => {
            const isProperties = link.dataset.section === 'propiedades';
            link.classList.toggle('sidebar__menu-link--active', isProperties);
        });
    };

    const ensurePanelContent = (panel) => {
        if (!panel || panel.dataset.loaded === 'true') {
            return Promise.resolve(panel);
        }

        const source = panel.dataset.src;
        if (!source) {
            panel.dataset.loaded = 'true';
            return Promise.resolve(panel);
        }

        panel.dataset.loading = 'true';

        return fetch(source)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`No se pudo cargar el contenido de ${source}`);
                }
                return response.text();
            })
            .then((html) => {
                panel.innerHTML = html;
                panel.dataset.loaded = 'true';
                return panel;
            })
            .catch((error) => {
                console.error(error);
                panel.innerHTML = '<p class="panel__error">No se pudo cargar el formulario de publicación.</p>';
                panel.dataset.loaded = 'error';
                return panel;
            })
            .finally(() => {
                delete panel.dataset.loading;
            });
    };

    const updateSummary = (panel, detail) => {
        const purpose = panel.querySelector('[data-publish-summary-purpose]');
        const type = panel.querySelector('[data-publish-summary-type]');

        if (purpose) {
            purpose.textContent = detail?.purposeLabel || 'Selecciona en el paso anterior';
        }
        if (type) {
            type.textContent = detail?.typeLabel || 'Selecciona en el paso anterior';
        }
    };

    const setupSubtypes = (panel, onChange) => {
        const subtypesContainer = panel.querySelector('[data-publish-subtypes]');
        if (!subtypesContainer) {
            return () => {};
        }

        const chips = Array.from(subtypesContainer.querySelectorAll('[data-subtype]'));

        const toggleSelection = (chip) => {
            chips.forEach((element) => {
                const isActive = element === chip;
                element.classList.toggle('is-selected', isActive);
                element.setAttribute('aria-pressed', String(isActive));
            });
            onChange(chip?.dataset.subtype || null);
        };

        const listeners = new Map();

        chips.forEach((chip) => {
            const handleClick = () => toggleSelection(chip);
            const handleKeydown = (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleSelection(chip);
                }
            };

            listeners.set(chip, { handleClick, handleKeydown });

            chip.setAttribute('role', 'button');
            chip.setAttribute('aria-pressed', 'false');
            chip.addEventListener('click', handleClick);
            chip.addEventListener('keydown', handleKeydown);
        });

        return () => {
            listeners.forEach((handlers, chip) => {
                chip.removeEventListener('click', handlers.handleClick);
                chip.removeEventListener('keydown', handlers.handleKeydown);
            });
            listeners.clear();
        };
    };

    const validateForm = (state, nextButton, feedback) => {
        const isValid = Boolean(state.subtype && state.title.trim() && state.description.trim());
        if (nextButton) {
            nextButton.disabled = !isValid;
        }

        if (feedback) {
            feedback.textContent = isValid ? '' : 'Completa el subtipo, título y descripción para continuar.';
        }
    };

    const initPublishForm = (panel, detail) => {
        if (!panel || panel.dataset.publishFormInitialized === 'true') {
            return;
        }

        const titleInput = panel.querySelector('[data-publish-title]');
        const descriptionInput = panel.querySelector('[data-publish-description]');
        const draftButton = panel.querySelector('[data-publish-draft]');
        const nextButton = panel.querySelector('[data-publish-next]');
        const feedback = panel.querySelector('[data-publish-feedback]');

        const state = {
            subtype: null,
            title: '',
            description: ''
        };

        const updateStateAndValidate = () => validateForm(state, nextButton, feedback);

        const cleanupSubtypes = setupSubtypes(panel, (value) => {
            state.subtype = value;
            updateStateAndValidate();
        });

        if (titleInput) {
            titleInput.addEventListener('input', () => {
                state.title = titleInput.value || '';
                updateStateAndValidate();
            });
        }

        if (descriptionInput) {
            descriptionInput.addEventListener('input', () => {
                state.description = descriptionInput.value || '';
                updateStateAndValidate();
            });
        }

        if (draftButton) {
            draftButton.addEventListener('click', () => {
                if (feedback) {
                    feedback.textContent = 'Borrador guardado temporalmente. Podrás retomarlo más tarde.';
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (nextButton.disabled) {
                    return;
                }
                if (feedback) {
                    feedback.textContent = 'Guardando información inicial...';
                }
            });
        }

        updateSummary(panel, detail);
        updateStateAndValidate();
        panel.dataset.publishFormInitialized = 'true';

        return () => {
            cleanupSubtypes();
        };
    };

    const handlePublishContinue = (detail) => {
        const panel = document.querySelector(`.profile__panel[data-section="${PUBLISH_SECTION}"]`);
        if (!panel) {
            return;
        }

        setMenuContext();
        togglePanelVisibility(panel);
        ensurePanelContent(panel).then(() => {
            updateSummary(panel, detail);
            initPublishForm(panel, detail);
        });
    };

    const init = () => {
        document.addEventListener('properties:publish:continue', (event) => {
            handlePublishContinue(event.detail);
        });
    };

    document.addEventListener('DOMContentLoaded', init);

    global.ProfilePublish = {
        show: handlePublishContinue
    };
})(window);
