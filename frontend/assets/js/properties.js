(function () {
    document.addEventListener('DOMContentLoaded', () => {
        if (!document.body.classList.contains('properties-page')) {
            return;
        }

        const API_BASE_URL = 'http://localhost:3000/api';
        const PLACEHOLDER_IMAGE = 'assets/images/hero/placeholder.jpg';
        const currencyFormatter = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        const urlParams = new URLSearchParams(window.location.search);
        const listingParam = urlParams.get('listing_type');
        const listingType = listingParam === 'renta' ? 'renta' : 'venta';
        const searchParam = (urlParams.get('search') || '').trim();
        const categoryParam = urlParams.get('category') || '';
        const locationParam = urlParams.get('location') || '';
        const minPriceParam = sanitizeNumberParam(urlParams.get('min_price'));
        const maxPriceParam = sanitizeNumberParam(urlParams.get('max_price'));

        const searchForm = document.getElementById('search-form');
        const filtersForm = document.getElementById('filters-form');
        const searchInput = document.getElementById('search-input');
        const searchListingHidden = document.getElementById('search-listing-type');
        const filtersSearchHidden = document.getElementById('filters-search');
        const filtersListingHidden = document.getElementById('filters-listing-type');
        const categorySelect = document.getElementById('category-select');
        const locationSelect = document.getElementById('location-select');
        const propertyGrid = document.getElementById('property-grid');
        const resultsCount = document.getElementById('results-count');
        const noResultsMessage = document.getElementById('no-results-message');
        const listingTypeButtons = document.querySelectorAll('[data-listing-type]');
        const filterToggleBtn = document.getElementById('filter-toggle-btn');
        const filtersWrapper = document.getElementById('filters-wrapper');
        const priceFilterBtn = document.getElementById('price-filter-btn');
        const pricePopover = document.getElementById('price-filter-popover');
        const priceSliderEl = document.getElementById('price-slider');
        const minPriceInput = document.getElementById('min-price-input');
        const maxPriceInput = document.getElementById('max-price-input');
        const minPriceHidden = document.getElementById('min_price_hidden');
        const maxPriceHidden = document.getElementById('max_price_hidden');
        const applyPriceBtn = document.querySelector('.price-filter__apply-btn');
        const headerBottom = document.querySelector('.header-properties__bottom');

        if (searchInput) {
            searchInput.value = searchParam;
            searchInput.addEventListener('input', () => {
                if (filtersSearchHidden) {
                    filtersSearchHidden.value = searchInput.value.trim();
                }
            });
        }
        if (categorySelect) {
            categorySelect.value = categoryParam;
        }
        if (filtersSearchHidden) {
            filtersSearchHidden.value = searchParam;
        }
        if (searchListingHidden) {
            searchListingHidden.value = listingType;
        }
        if (filtersListingHidden) {
            filtersListingHidden.value = listingType;
        }
        if (minPriceHidden) {
            minPriceHidden.value = minPriceParam ?? '';
        }
        if (maxPriceHidden) {
            maxPriceHidden.value = maxPriceParam ?? '';
        }

        setupFilterToggle();
        setupListingTypeButtons();
        setupSelectSubmit(categorySelect);
        setupSelectSubmit(locationSelect);
        setupFormSanitizers();
        setupIntersectionObserver();
        updateFooterYear();

        loadProperties();

        function sanitizeNumberParam(value) {
            if (value === null || value === undefined || value === '') {
                return null;
            }
            const numericValue = Number(value);
            return Number.isFinite(numericValue) ? numericValue : null;
        }

        function setupFilterToggle() {
            if (!filterToggleBtn || !filtersWrapper) {
                return;
            }
            filterToggleBtn.addEventListener('click', () => {
                filtersWrapper.classList.toggle('active');
            });
        }

        function setupListingTypeButtons() {
            if (!listingTypeButtons) {
                return;
            }
            listingTypeButtons.forEach((button) => {
                const buttonType = button.dataset.listingType;
                if (!buttonType) {
                    return;
                }
                const params = new URLSearchParams(window.location.search);
                params.set('listing_type', buttonType);
                const queryString = params.toString();
                const url = queryString ? `properties.html?${queryString}` : 'properties.html';
                button.href = url;
                if (buttonType === listingType) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    window.location.href = button.href;
                });
            });
        }

        function setupSelectSubmit(selectElement) {
            if (!selectElement || !filtersForm) {
                return;
            }
            selectElement.addEventListener('change', () => {
                filtersForm.submit();
            });
        }

        function setupFormSanitizers() {
            if (!filtersForm) {
                return;
            }
            filtersForm.addEventListener('submit', () => {
                if (minPriceHidden && !minPriceHidden.value) {
                    minPriceHidden.disabled = true;
                } else if (minPriceHidden) {
                    minPriceHidden.disabled = false;
                }
                if (maxPriceHidden && !maxPriceHidden.value) {
                    maxPriceHidden.disabled = true;
                } else if (maxPriceHidden) {
                    maxPriceHidden.disabled = false;
                }
            });
        }

        async function loadProperties() {
            if (resultsCount) {
                resultsCount.textContent = 'Cargando propiedades...';
            }
            const query = new URLSearchParams();
            query.set('listing_type', listingType);
            if (searchParam) {
                query.set('search', searchParam);
            }
            if (categoryParam) {
                query.set('category', categoryParam);
            }
            if (locationParam) {
                query.set('location', locationParam);
            }
            if (minPriceParam !== null) {
                query.set('min_price', String(minPriceParam));
            }
            if (maxPriceParam !== null) {
                query.set('max_price', String(maxPriceParam));
            }

            try {
                const response = await fetch(`${API_BASE_URL}/properties?${query.toString()}`);
                if (!response.ok) {
                    throw new Error(`Error ${response.status}`);
                }
                const data = await response.json();
                const properties = Array.isArray(data.properties) ? data.properties : [];
                const total = typeof data.total === 'number' ? data.total : properties.length;
                const filters = data.filters || {};
                const locations = Array.isArray(filters.locations) ? filters.locations : [];
                const priceRange = filters.priceRange || {};

                renderLocations(locations);
                renderProperties(properties);
                updateResults(total);
                setupPriceFilter(priceRange);
            } catch (error) {
                console.error('Error al cargar propiedades:', error);
                if (propertyGrid) {
                    propertyGrid.innerHTML = '';
                }
                if (resultsCount) {
                    resultsCount.textContent = 'No se pudieron cargar las propiedades.';
                }
                if (noResultsMessage) {
                    noResultsMessage.hidden = false;
                    noResultsMessage.textContent = 'Ocurrió un error al cargar las propiedades. Intenta nuevamente.';
                }
            }
        }

        function renderLocations(locations) {
            if (!locationSelect) {
                return;
            }
            locationSelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Ubicación';
            locationSelect.appendChild(defaultOption);
            locations.forEach((location) => {
                if (!location) {
                    return;
                }
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                if (location === locationParam) {
                    option.selected = true;
                }
                locationSelect.appendChild(option);
            });
        }

        function renderProperties(properties) {
            if (!propertyGrid) {
                return;
            }
            propertyGrid.innerHTML = '';
            if (!Array.isArray(properties) || properties.length === 0) {
                if (noResultsMessage) {
                    noResultsMessage.hidden = false;
                }
                return;
            }
            if (noResultsMessage) {
                noResultsMessage.hidden = true;
            }
            properties.forEach((property) => {
                const card = document.createElement('div');
                card.className = 'property-card';
                const imageSrc = typeof property.main_image === 'string' && property.main_image.trim().length > 0
                    ? property.main_image
                    : PLACEHOLDER_IMAGE;
                const propertyId = property?.id !== undefined && property?.id !== null
                    ? encodeURIComponent(property.id)
                    : '';
                const listingText = typeof property.listing_type === 'string'
                    ? capitalize(property.listing_type)
                    : '';
                const categoryText = typeof property.category === 'string'
                    ? capitalize(property.category)
                    : '';
                const locationText = property.location || '';
                const price = typeof property.price === 'number'
                    ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(property.price)
                    : '';
                card.innerHTML = `
                    <a href="property_detail.php?id=${propertyId}" class="property-card__link">
                        <div class="property-card__image-container">
                            <img class="property-card__image" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(property.title || 'Propiedad')}">
                            <div class="property-card__badge property-card__badge--listing">${listingText}</div>
                            <div class="property-card__badge property-card__badge--category">${categoryText}</div>
                        </div>
                        <div class="property-card__content">
                            <h3 class="property-card__title">${escapeHtml(property.title || 'Propiedad sin título')}</h3>
                            <p class="property-card__location">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                </svg>
                                ${escapeHtml(locationText)}
                            </p>
                        </div>
                        <div class="property-card__footer">
                            <p class="property-card__price">${price} MXN</p>
                            <span class="property-card__details-button">Ver detalles &rarr;</span>
                        </div>
                    </a>
                `;
                propertyGrid.appendChild(card);
            });
        }

        function escapeHtml(value) {
            if (value === null || value === undefined) {
                return '';
            }
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function capitalize(value) {
            if (typeof value !== 'string' || value.length === 0) {
                return '';
            }
            const lower = value.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        }

        function updateResults(total) {
            if (!resultsCount) {
                return;
            }
            const safeTotal = Number.isFinite(total) ? total : 0;
            const label = safeTotal === 1 ? 'resultado' : 'resultados';
            resultsCount.textContent = `${safeTotal} ${label} que podrían interesarte`;
        }

        function setupPriceFilter(priceRange) {
            if (!priceSliderEl || typeof noUiSlider === 'undefined') {
                return;
            }
            const availableMin = Number(priceRange.min) || 0;
            let availableMax = Number(priceRange.max) || 0;
            if (availableMax <= availableMin) {
                availableMax = availableMin + 1000;
            }
            if (availableMax === 0) {
                availableMax = 50000000;
            }

            const startMin = clampValue(minPriceParam ?? availableMin, availableMin, availableMax);
            const startMax = clampValue(maxPriceParam ?? availableMax, availableMin, availableMax);

            const slider = noUiSlider.create(priceSliderEl, {
                start: [startMin, startMax],
                connect: true,
                range: {
                    min: availableMin,
                    max: availableMax
                },
                format: {
                    to: value => Math.round(value),
                    from: value => Number(value)
                }
            });

            updatePriceInputs(startMin, startMax);
            updatePriceButtonLabel(startMin, startMax, availableMin, availableMax);

            slider.on('slide', (values) => {
                const [min, max] = values.map(Number);
                updatePriceInputs(min, max);
            });

            minPriceInput?.addEventListener('change', () => {
                const numeric = parseCurrency(minPriceInput.value);
                if (Number.isFinite(numeric)) {
                    slider.set([numeric, null]);
                }
            });

            maxPriceInput?.addEventListener('change', () => {
                const numeric = parseCurrency(maxPriceInput.value);
                if (Number.isFinite(numeric)) {
                    slider.set([null, numeric]);
                }
            });

            [minPriceInput, maxPriceInput].forEach((input) => {
                if (!input) {
                    return;
                }
                input.addEventListener('input', (event) => {
                    const target = event.target;
                    if (!(target instanceof HTMLInputElement)) {
                        return;
                    }
                    const numericValue = parseCurrency(target.value);
                    if (Number.isFinite(numericValue)) {
                        const previousLength = target.value.length;
                        target.value = currencyFormatter.format(numericValue);
                        const newLength = target.value.length;
                        const cursorPos = (target.selectionStart || 0) + (newLength - previousLength);
                        target.setSelectionRange(cursorPos, cursorPos);
                    }
                });
                input.addEventListener('focus', (event) => {
                    const target = event.target;
                    if (target instanceof HTMLInputElement) {
                        target.select();
                    }
                });
            });

            priceFilterBtn?.addEventListener('click', (event) => {
                event.stopPropagation();
                pricePopover?.classList.toggle('active');
                priceFilterBtn.parentElement?.classList.toggle('active');
                if (headerBottom) {
                    headerBottom.classList.toggle('overflow-visible');
                }
                if (pricePopover?.classList.contains('active')) {
                    const [min, max] = slider.get().map(Number);
                    updatePriceInputs(min, max);
                }
            });

            document.addEventListener('click', (event) => {
                if (!pricePopover?.classList.contains('active')) {
                    return;
                }
                if (pricePopover.contains(event.target) || priceFilterBtn?.contains(event.target)) {
                    return;
                }
                pricePopover.classList.remove('active');
                priceFilterBtn?.parentElement?.classList.remove('active');
                if (headerBottom) {
                    headerBottom.classList.remove('overflow-visible');
                }
            });

            applyPriceBtn?.addEventListener('click', () => {
                const [min, max] = slider.get().map((value) => Math.round(Number(value)));
                if (minPriceHidden) {
                    minPriceHidden.disabled = false;
                    minPriceHidden.value = String(min);
                }
                if (maxPriceHidden) {
                    maxPriceHidden.disabled = false;
                    maxPriceHidden.value = String(max);
                }
                filtersForm?.submit();
            });

            slider.on('change', (values) => {
                const [min, max] = values.map(Number);
                updatePriceButtonLabel(min, max, availableMin, availableMax);
            });
        }

        function updatePriceInputs(min, max) {
            if (minPriceInput) {
                minPriceInput.value = currencyFormatter.format(min);
            }
            if (maxPriceInput) {
                maxPriceInput.value = currencyFormatter.format(max);
            }
        }

        function updatePriceButtonLabel(min, max, availableMin, availableMax) {
            if (!priceFilterBtn) {
                return;
            }
            if (Number.isFinite(min) && Number.isFinite(max) && (min !== availableMin || max !== availableMax)) {
                priceFilterBtn.textContent = `${currencyFormatter.format(min)} - ${currencyFormatter.format(max)}`;
            } else {
                priceFilterBtn.textContent = 'Rango de Precios';
            }
        }

        function clampValue(value, min, max) {
            if (!Number.isFinite(value)) {
                return min;
            }
            if (value < min) {
                return min;
            }
            if (value > max) {
                return max;
            }
            return value;
        }

        function parseCurrency(value) {
            if (typeof value !== 'string') {
                return NaN;
            }
            const numeric = Number(value.replace(/[^0-9.-]+/g, ''));
            return numeric;
        }

        function setupIntersectionObserver() {
            const header = document.querySelector('.header-properties');
            const scrollTrigger = document.getElementById('header-scroll-trigger');
            if (!header || !scrollTrigger) {
                return;
            }
            const observer = new IntersectionObserver((entries) => {
                const [entry] = entries;
                if (!entry) {
                    return;
                }
                if (pricePopover?.classList.contains('active')) {
                    return;
                }
                if (window.innerWidth <= 768) {
                    if (!entry.isIntersecting) {
                        header.classList.add('header-properties--collapsed');
                    } else {
                        header.classList.remove('header-properties--collapsed');
                    }
                } else {
                    header.classList.remove('header-properties--collapsed');
                }
            });
            observer.observe(scrollTrigger);
        }

        function updateFooterYear() {
            const yearSpan = document.getElementById('year');
            if (yearSpan) {
                yearSpan.textContent = String(new Date().getFullYear());
            }
        }
    });
})();
