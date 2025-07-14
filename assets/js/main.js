document.addEventListener('DOMContentLoaded', () => {
    console.log('main.js unificado cargado'); // Mensaje de depuración

    // ===================================
    // === LÓGICA DEL MENÚ HAMBURGUESA ===
    // ===================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');
    const closeMenu = document.querySelector('.close-menu');
    const pageOverlay = document.getElementById('page-overlay');
    const navLinks = document.querySelectorAll('nav ul li a');

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
        const featureGroups = document.querySelectorAll('.features-group');
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
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // Carrusel para el Hero
        const slides = document.querySelectorAll('.hero-slide');
        const progressBars = document.querySelectorAll('.progress-bar');
        const heroContent = document.querySelector('.hero-content');
        const heroTitle = heroContent.querySelector('h1');
        const heroSubtitle = heroContent.querySelector('p');

        let currentSlide = 0;

        if (slides.length > 0) {
            function showSlide(index) {
                slides.forEach((slide, i) => slide.classList.toggle('active', i === index));

                progressBars.forEach(bar => {
                    bar.classList.remove('active');
                    const fill = bar.querySelector('.progress-bar-fill');
                    fill.style.transition = 'none';
                    fill.style.width = '0';
                });
                
                const currentBar = progressBars[index];
                if (currentBar) {
                    currentBar.classList.add('active');
                    const currentFill = currentBar.querySelector('.progress-bar-fill');
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
            const card = carousel.querySelector('.property-slide-card:not(.hidden-property)');
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

        const filterLinks = showcase.querySelectorAll('.filter-link');
        const propertyCards = showcase.querySelectorAll('.property-slide-card');

        filterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                filterLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                const category = link.dataset.category;

                propertyCards.forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.classList.remove('hidden-property');
                    } else {
                        card.classList.add('hidden-property');
                    }
                });
            });
        });
    }

    setupCategoryFilter('destacadas-showcase');
    setupCategoryFilter('renta-showcase');

// ===============================================
// === LÓGICA PARA HEADER DE PÁGINA DE PROPIEDADES ===
// ===============================================
const priceFilter = document.querySelector('.price-filter');

if (priceFilter) {
    const priceDisplay = document.getElementById('price-range-label');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const priceSliderElement = document.getElementById('price-slider');

    // --- Lógica para abrir/cerrar el desplegable de precios ---
    priceFilter.addEventListener('click', (e) => {
        // Solo alterna la clase si el clic NO es dentro del contenedor del slider
        if (!e.target.closest('.price-slider-container')) {
            priceFilter.classList.toggle('active');
        }
    });

    document.addEventListener('click', (e) => {
        // Cierra el desplegable si se hace clic fuera del filtro de precios
        if (!priceFilter.contains(e.target)) {
            priceFilter.classList.remove('active');
        }
    });

    // --- Lógica para formatear números como moneda ---
    const formatToCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(value);
    
    // --- Lógica de noUiSlider ---
    if (priceSliderElement) {
        // Valores iniciales (si no hay, usamos un rango por defecto)
        const initialMin = parseFloat(minPriceInput.value) || 50000;
        const initialMax = parseFloat(maxPriceInput.value) || 10000000;

        noUiSlider.create(priceSliderElement, {
            start: [initialMin, initialMax],
            connect: true,
            step: 10000,
            range: {
                'min': 0,
                'max': 20000000 // Precio máximo del slider
            },
            format: {
                to: function (value) {
                    return Math.round(value);
                },
                from: function (value) {
                    return Number(value);
                }
            }
        });

        // --- Sincronización: Slider -> Inputs y Etiqueta ---
        priceSliderElement.noUiSlider.on('update', (values) => {
            const [minVal, maxVal] = values;
            
            minPriceInput.value = minVal;
            maxPriceInput.value = maxVal;

            // Actualizar la etiqueta principal
            let label = 'Cualquiera';
            if (minVal > 0 || maxVal < 20000000) {
                label = `${formatToCurrency(minVal)} - ${formatToCurrency(maxVal)}`;
            }
            priceDisplay.textContent = label;
        });

        // --- Sincronización: Inputs -> Slider ---
        minPriceInput.addEventListener('change', () => {
            priceSliderElement.noUiSlider.set([minPriceInput.value, null]);
        });
        maxPriceInput.addEventListener('change', () => {
            priceSliderElement.noUiSlider.set([null, maxPriceInput.value]);
        });
    }
}

// Agregar clase al body si estamos en properties.php
if(window.location.pathname.endsWith('properties.php')) {
    document.body.classList.add('properties-page');
}
});