(function (global) {
    const init = (panel) => {
        if (!panel || panel.dataset.section !== 'ubicacion' || panel.dataset.locationInitialized === 'true') {
            return;
        }

        panel.dataset.locationInitialized = 'true';

        const heading = panel.querySelector('[data-location-heading]');
        const purposeLabel = panel.querySelector('[data-location-purpose-label]');
        const typeLabel = panel.querySelector('[data-location-type-label]');
        const subtypeLabel = panel.querySelector('[data-location-subtype-label]');
        const titlePreview = panel.querySelector('[data-location-title]');
        const descriptionPreview = panel.querySelector('[data-location-description]');

        const withFallback = (value, fallback) => (value && value.trim().length ? value : fallback);

        const applyDetail = (detail = {}) => {
            if (heading) {
                heading.textContent = detail.typeLabel ? `Ubicación para ${detail.typeLabel.toLowerCase()}` : 'Confirma la ubicación de tu propiedad';
            }

            if (purposeLabel) {
                purposeLabel.textContent = withFallback(detail.purposeLabel, 'Propósito no definido');
            }

            if (typeLabel) {
                typeLabel.textContent = withFallback(detail.typeLabel, 'Tipo no definido');
            }

            if (subtypeLabel) {
                subtypeLabel.textContent = withFallback(detail.subtypeLabel, 'Subtipo no definido');
            }

            if (titlePreview) {
                titlePreview.textContent = withFallback(detail.title, 'Sin título');
            }

            if (descriptionPreview) {
                descriptionPreview.textContent = withFallback(detail.description, 'Sin descripción');
            }
        };

        panel.addEventListener('location:open', (event) => {
            applyDetail(event.detail || {});
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        applyDetail({
            purposeLabel: panel.dataset.locationPurposeLabel,
            typeLabel: panel.dataset.locationTypeLabel,
            subtypeLabel: panel.dataset.locationSubtypeLabel,
            title: panel.dataset.locationTitle,
            description: panel.dataset.locationDescription
        });
    };

    global.ProfileLocation = { init };
})(window);
