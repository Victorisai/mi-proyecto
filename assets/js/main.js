document.addEventListener('DOMContentLoaded', () => {
    console.log('main.js unificado cargado'); // Mensaje de depuración

    // ===================================
    // === LÓGICA DEL MENÚ HAMBURGUESA ===
    // ===================================
    const menuToggle = document.querySelector('.header__toggle');
    const navMenu = document.querySelector('.mobile-nav__list');
    const closeMenu = document.querySelector('.mobile-nav__close-button');
    const pageOverlay = document.querySelector('.mobile-nav__overlay');
    const navLinks = document.querySelectorAll('.mobile-nav__list li a');

    const openNav = () => {
        if (navMenu) navMenu.classList.add('active');
        if (pageOverlay) pageOverlay.classList.add('active');
    };

    const closeNav = () => {
        if (navMenu) navMenu.classList.remove('active');
        if (pageOverlay) pageOverlay.classList.remove('active');
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', openNav);
    }
    if (closeMenu) {
        closeMenu.addEventListener('click', closeNav);
    }
    if (pageOverlay) {
        pageOverlay.addEventListener('click', closeNav);
    }
    navLinks.forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // ==================================
    // === LÓGICA DEL PANEL DE ADMIN ===
    // ==================================
    // Mostrar campos de características según la categoría
    window.updateFeaturesForm = function() {
        const categorySelect = document.getElementById('category');
        if (!categorySelect) return;

        const category = categorySelect.value;
        const featureGroups = document.querySelectorAll('.add-property-form__features-group');
        featureGroups.forEach(group => {
            group.style.display = (group.id === `features-${category}`) ? 'block' : 'none';
        });
    };

    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        updateFeaturesForm(); // Inicializar al cargar
        categorySelect.addEventListener('change', updateFeaturesForm);
    }
    
    // Vista previa de imágenes cargadas en el admin
    const imageInputs = document.querySelectorAll('input[type="file"][accept="image/*"]');
    imageInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    let preview = input.parentElement.querySelector('img.preview');
                    if (!preview) {
                        preview = document.createElement('img');
                        preview.classList.add('preview');
                        input.parentElement.appendChild(preview);
                    }
                    preview.src = event.target.result;
                    preview.style.maxWidth = '150px';
                    preview.style.marginTop = '10px';
                };
                reader.readAsDataURL(file);
            }
        });
    });


    // ===============================
    // === LÓGICA DE PÁGINA DE INICIO (HOME) ===
    // ===============================
    if (document.body.classList.contains('home')) {
        // Cambiar clase del encabezado al deslizar
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (window.scrollY > 50) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }
        });

        // Carrusel para el Hero
        const slides = document.querySelectorAll('.hero__slide');
        const progressBars = document.querySelectorAll('.hero__progress-bar');
        const heroContent = document.querySelector('.hero__content');
        const heroTitle = heroContent.querySelector('h1');
        const heroSubtitle = heroContent.querySelector('p');

        let currentSlide = 0;

        if (slides.length > 0) {
            function showSlide(index) {
                slides.forEach((slide, i) => slide.classList.toggle('hero__slide--active', i === index));

                progressBars.forEach(bar => {
                    bar.classList.remove('hero__progress-bar--active');
                    const fill = bar.querySelector('.hero__progress-bar-fill');
                    fill.style.transition = 'none';
                    fill.style.width = '0';
                });
                
                const currentBar = progressBars[index];
                if (currentBar) {
                    currentBar.classList.add('hero__progress-bar--active');
                    const currentFill = currentBar.querySelector('.hero__progress-bar-fill');
                    setTimeout(() => { 
                        currentFill.style.transition = 'width 5s linear';
                        currentFill.style.width = '100%';
                    }, 50);
                }
            }

            function nextSlide() {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            }

            showSlide(currentSlide);
            setInterval(nextSlide, 5000);
        }
    }

// ===================================================
// === LÓGICA PARA EXPERIENCIAS LOCALES (CARRUSEL) ===
// ===================================================
const expTabs = document.querySelectorAll('.experiences-section .tab-button');
const expSelect = document.querySelector('.experiences-section #location-select');
const expContents = document.querySelectorAll('.experiences-section .location-content');

function setActiveLocation(locationId) {
    expTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.location === locationId));
    expContents.forEach(content => content.classList.toggle('active', content.id === locationId));
    
    if (expSelect) {
        expSelect.value = locationId;
    }

    setupExperienceCarousel(document.querySelector(`#${locationId}`));
}

function setupExperienceCarousel(locationContent) {
    if (!locationContent) return;

    const grid = locationContent.querySelector('.experiences-grid');
    const leftArrow = locationContent.querySelector('.arrow-left');
    const rightArrow = locationContent.querySelector('.arrow-right');
    
    if (!grid || !leftArrow || !rightArrow) return;

    const card = grid.querySelector('.experience-card-link');
    if (!card) return;
    const scrollAmount = card.offsetWidth + 20;

    leftArrow.addEventListener('click', () => {
        grid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
        grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
}

expTabs.forEach(tab => {
    tab.addEventListener('click', () => setActiveLocation(tab.dataset.location));
});

if (expSelect) {
    expSelect.addEventListener('change', () => setActiveLocation(expSelect.value));
}

const initialTab = document.querySelector('.experiences-section .tab-button.active');
if (initialTab) {
    setActiveLocation(initialTab.dataset.location);
} else if (expSelect) {
    setActiveLocation(expSelect.value);
}

    // =======================================================
    // === LÓGICA PARA PÁGINA DE PROPIEDADES (PROPERTIES.PHP) ===
    // =======================================================
    const params = new URLSearchParams(window.location.search);
    const currentListingType = params.get('listing_type') || 'venta';
    const filterTabLinks = document.querySelectorAll('.tab-link');
    filterTabLinks.forEach(link => {
        if (link.dataset.listing === currentListingType) {
            link.classList.add('active');
        }
    });

    // ============================================
    // === LÓGICA PARA CARRUSELES DE PROPIEDADES ===
    // ============================================
    function setupCarousel(carouselId, prevBtnId, nextBtnId) {
        const carousel = document.getElementById(carouselId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        if (!carousel || !prevBtn || !nextBtn) return;
        
        const scrollHandler = () => {
            const card = carousel.querySelector('.property-showcase__slide-card:not(.property-showcase__slide-card--hidden)');
            if (!card) return;
            const scrollAmount = card.offsetWidth + 20;
            return scrollAmount;
        };

        prevBtn.addEventListener('click', () => carousel.scrollBy({ left: -scrollHandler(), behavior: 'smooth' }));
        nextBtn.addEventListener('click', () => carousel.scrollBy({ left: scrollHandler(), behavior: 'smooth' }));
    }
    
    setupCarousel('destacadas-carousel', 'destacadas-prev', 'destacadas-next');
    setupCarousel('renta-carousel', 'renta-prev', 'renta-next');

    // ================================================
    // === NUEVA LÓGICA PARA FILTRADO POR CATEGORÍA ===
    // ================================================
    function setupCategoryFilter(showcaseId) {
        const showcase = document.getElementById(showcaseId);
        if (!showcase) return;

        const filterLinks = showcase.querySelectorAll('.property-showcase__filter-link');
        const propertyCards = showcase.querySelectorAll('.property-showcase__slide-card');

        filterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                filterLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                const category = link.dataset.category;

                propertyCards.forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.classList.remove('property-showcase__slide-card--hidden');
                    } else {
                        card.classList.add('property-showcase__slide-card--hidden');
                    }
                });
            });
        });
    }

    setupCategoryFilter('destacadas-showcase');
    setupCategoryFilter('renta-showcase');

// ===============================================
// === LÓGICA PARA FILTRO DE PRECIOS DINÁMICO ===
// ===============================================
const priceFilterBtn = document.getElementById('price-filter-btn');
const pricePopover = document.getElementById('price-filter-popover');
const priceSliderEl = document.getElementById('price-slider');
const minPriceInput = document.getElementById('min-price-input');
const maxPriceInput = document.getElementById('max-price-input');
const minPriceHidden = document.getElementById('min_price_hidden');
const maxPriceHidden = document.getElementById('max_price_hidden');
const filtersForm = document.getElementById('filters-form');

if (priceSliderEl) {
    // 1. Inicializar la barra deslizante (Slider)
    const priceSlider = noUiSlider.create(priceSliderEl, {
        start: [minPriceHidden.value || 0, maxPriceHidden.value || 50000000],
        connect: true,
        range: {
            'min': 0,
            'max': 50000000
        },
        step: 100000,
        format: {
            to: function (value) {
                return Math.round(value);
            },
            from: function (value) {
                return Number(value);
            }
        }
    });

    // 2. Sincronizar Slider con Inputs
    priceSlider.on('update', function (values, handle) {
        if (handle === 0) {
            minPriceInput.value = values[0];
            minPriceHidden.value = values[0];
        } else {
            maxPriceInput.value = values[1];
            maxPriceHidden.value = values[1];
        }
    });

    // 3. Sincronizar Inputs con Slider
    minPriceInput.addEventListener('change', function () {
        priceSlider.set([this.value, null]);
    });
    maxPriceInput.addEventListener('change', function () {
        priceSlider.set([null, this.value]);
    });

    // 4. Lógica para mostrar/ocultar el panel
    priceFilterBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Evita que el clic se propague al 'document'
        pricePopover.classList.toggle('active');
    });

    // Cierra el panel si se hace clic fuera de él
    document.addEventListener('click', (event) => {
        if (pricePopover && !pricePopover.contains(event.target) && !priceFilterBtn.contains(event.target)) {
            pricePopover.classList.remove('active');
        }
    });

    // 5. Pre-rellenar los inputs si ya hay valores en la URL
    if (minPriceHidden.value) {
        minPriceInput.value = minPriceHidden.value;
    }
    if (maxPriceHidden.value) {
        maxPriceInput.value = maxPriceHidden.value;
    }
}
});