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

    // =======================================================
    // === LÓGICA PARA FILTRO DE PRECIOS (VERSIÓN FINAL) ===
    // =======================================================
    const priceFilterBtn = document.getElementById('price-filter-btn');
    const pricePopover = document.getElementById('price-filter-popover');
    const priceSliderEl = document.getElementById('price-slider');
    const minPriceInput = document.getElementById('min-price-input');
    const maxPriceInput = document.getElementById('max-price-input');
    const minPriceHidden = document.getElementById('min_price_hidden');
    const maxPriceHidden = document.getElementById('max_price_hidden');
    const applyPriceBtn = document.querySelector('.price-filter__apply-btn');
    const filtersForm = document.getElementById('filters-form');

    if (priceSliderEl) {
        // Objeto para dar formato de moneda
        const mxnCurrencyFormat = {
            to: (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value),
            from: (value) => Number(String(value).replace(/[^0-9.-]+/g, ""))
        };
        
        // Define los puntos de inicio del slider
        const startMin = php_min_price_selected !== '' ? Number(php_min_price_selected) : php_min_price_available;
        const startMax = php_max_price_selected !== '' ? Number(php_max_price_selected) : php_max_price_available;

        // El rango siempre usa los valores GLOBALES para no "atascarse"
        const range = {
            'min': [php_min_price_available],
            'max': [php_max_price_available]
        };

        const priceSlider = noUiSlider.create(priceSliderEl, {
            start: [startMin, startMax],
            connect: true,
            range: range,
            format: { // Usamos un formato numérico interno para el slider
                to: value => Math.round(value),
                from: value => Number(value)
            }
        });

        // Evento que se dispara MIENTRAS se desliza
        priceSlider.on('slide', function (values, handle) {
            const [min, max] = values;
            // Actualiza los campos de texto con formato de moneda
            minPriceInput.value = mxnCurrencyFormat.to(min);
            maxPriceInput.value = mxnCurrencyFormat.to(max);
        });
        
        // Se activa cuando el usuario termina de escribir (al hacer clic fuera o presionar Enter)
        minPriceInput.addEventListener('change', function () {
            const numericValue = mxnCurrencyFormat.from(this.value);
            priceSlider.set([numericValue, null]);
        });
        
        maxPriceInput.addEventListener('change', function () {
            const numericValue = mxnCurrencyFormat.from(this.value);
            priceSlider.set([null, numericValue]);
        });
        
        // **NUEVO: Formatea el texto MIENTRAS el usuario escribe**
        [minPriceInput, maxPriceInput].forEach(input => {
            input.addEventListener('input', function(e) {
                const numericValue = mxnCurrencyFormat.from(e.target.value);
                if (!isNaN(numericValue)) {
                    // Guarda la posición del cursor
                    let cursorPos = e.target.selectionStart;
                    const originalLength = e.target.value.length;
                    
                    // Reformatea el valor
                    e.target.value = mxnCurrencyFormat.to(numericValue);
                    
                    // Restaura la posición del cursor de forma inteligente
                    const newLength = e.target.value.length;
                    cursorPos += (newLength - originalLength);
                    e.target.setSelectionRange(cursorPos, cursorPos);
                }
            });
            // Al enfocar, selecciona todo el texto para facilitar la escritura
            input.addEventListener('focus', function(e) {
                e.target.select();
            });
        });


        // Lógica para mostrar/ocultar el panel
        const headerBottom = document.querySelector('.header-properties__bottom'); // <-- AÑADIMOS ESTA LÍNEA

        priceFilterBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            pricePopover.classList.toggle('active');
            priceFilterBtn.parentElement.classList.toggle('active');
            if (headerBottom) headerBottom.classList.toggle('overflow-visible'); // <-- AÑADIMOS ESTA LÍNEA
        
            // Al abrir, asegura que los inputs reflejen el estado actual del slider
            if (pricePopover.classList.contains('active')) {
                const [min, max] = priceSlider.get();
                minPriceInput.value = mxnCurrencyFormat.to(min);
                maxPriceInput.value = mxnCurrencyFormat.to(max);
            }
        });

        // Cierra el panel al hacer clic fuera
        document.addEventListener('click', (event) => {
            if (pricePopover.classList.contains('active') && !pricePopover.contains(event.target) && !priceFilterBtn.contains(event.target)) {
                pricePopover.classList.remove('active');
                priceFilterBtn.parentElement.classList.remove('active');
                if (headerBottom) headerBottom.classList.remove('overflow-visible'); // <-- AÑADIMOS ESTA LÍNEA
            }
        });

        // Lógica del botón "Aplicar"
        if (applyPriceBtn) {
            applyPriceBtn.addEventListener('click', () => {
                const [min, max] = priceSlider.get();
                minPriceHidden.value = min;
                maxPriceHidden.value = max;
                filtersForm.submit();
            });
        }
    }
    // =======================================================
    // === LÓGICA PARA ROTACIÓN DE FLECHAS EN FILTROS SELECT ===
    // =======================================================
    const filterGroups = document.querySelectorAll('.header-properties__filters-wrapper .header-properties__filter-group');

    filterGroups.forEach(group => {
        const select = group.querySelector('select');
        if (select) {
            // Cuando el usuario hace clic en el select
            select.addEventListener('focus', () => {
                group.classList.add('active');
            });

            // Cuando el usuario selecciona una opción o hace clic fuera
            select.addEventListener('blur', () => {
                group.classList.remove('active');
            });
        }
    });

    // =======================================================
    // === LÓGICA PARA OCULTAR HEADER CON INTERSECTION OBSERVER ===
    // === Alternativa de alto rendimiento para eliminar vibración ===
    // =======================================================
    if (document.body.classList.contains('properties-page')) {
        const header = document.querySelector('.header-properties');
        const scrollTrigger = document.getElementById('header-scroll-trigger');
        const pricePopover = document.getElementById('price-filter-popover');

        if (header && scrollTrigger) {
            // La función que se ejecuta cuando el "trigger" entra o sale de la pantalla
            const observerCallback = (entries) => {
                const [entry] = entries; // Solo observamos un elemento

                // Si el popover de precios está abierto, no hacemos nada
                if (pricePopover && pricePopover.classList.contains('active')) {
                    return;
                }

                // Solo para móvil
                if (window.innerWidth <= 768) {
                    // Si el trigger NO está en la pantalla (hemos bajado)
                    if (!entry.isIntersecting) {
                        header.classList.add('header-properties--collapsed');
                    } else {
                        // Si el trigger SÍ está en la pantalla (estamos arriba)
                        header.classList.remove('header-properties--collapsed');
                    }
                } else {
                    // En escritorio, siempre mostrar
                    header.classList.remove('header-properties--collapsed');
                }
            };

            // Creamos el observador
            const observer = new IntersectionObserver(observerCallback);
            
            // Le decimos al observador que empiece a vigilar nuestro "trigger"
            observer.observe(scrollTrigger);
        }
    }
    // ============================================================
    // === LÓGICA PARA LIGHTBOX V3 (MOSAICO Y SLIDER) ===
    // ============================================================
    const lightbox = document.getElementById('property-lightbox');

    if (lightbox && typeof propertyImages !== 'undefined' && propertyImages.length > 0) {
        const galleryItems = document.querySelectorAll('.gallery__item');
        const openBtn = document.querySelector('.gallery__open-btn');
        const mainLightboxImage = document.getElementById('lightbox-main-image');
        const closeBtns = lightbox.querySelectorAll('.lightbox__close');
        const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
        const nextBtn = lightbox.querySelector('.lightbox__nav--next');
        const counter = document.getElementById('lightbox-counter');
        const gridContainer = document.getElementById('lightbox-grid-container');
        const backToGridBtn = document.getElementById('lightbox-slider-back');
        const backFromGridBtn = document.getElementById('lightbox-grid-back');

        let currentIndex = 0;

        function showImage(index) {
            currentIndex = (index + propertyImages.length) % propertyImages.length;
            mainLightboxImage.src = propertyImages[currentIndex];
            counter.textContent = `${currentIndex + 1} / ${propertyImages.length}`;
        }

        function populateGrid() {
            gridContainer.innerHTML = ''; // Limpiar para evitar duplicados
            propertyImages.forEach((src, index) => {
                const gridItem = document.createElement('div');
                gridItem.className = 'lightbox__grid-item';
                gridItem.dataset.index = index;

                const img = document.createElement('img');
                img.src = src;
                img.alt = `Propiedad imagen ${index + 1}`;

                gridItem.appendChild(img);
                gridContainer.appendChild(gridItem);

                gridItem.addEventListener('click', () => {
                    switchToSliderView(index);
                });
            });
        }

        function switchToSliderView(index) {
            showImage(index);
            lightbox.classList.add('lightbox--slider-active');
        }

        function switchToGridView() {
            lightbox.classList.remove('lightbox--slider-active');
        }

        function openLightbox() {
            document.body.classList.add('lightbox-active');
            populateGrid();
            lightbox.classList.add('active');
            // Asegurarse de que siempre inicie en la vista de grid
            switchToGridView(); 
        }

        function closeLightbox() {
            document.body.classList.remove('lightbox-active');
            lightbox.classList.remove('active');
        }

        // --- Event Listeners ---
        galleryItems.forEach(item => {
            item.addEventListener('click', openLightbox);
        });

        if (openBtn) {
            openBtn.addEventListener('click', openLightbox);
        }

        closeBtns.forEach(btn => btn.addEventListener('click', closeLightbox));
        backToGridBtn.addEventListener('click', switchToGridView);
        backFromGridBtn.addEventListener('click', () => {
            // Simula el comportamiento de "volver" en un navegador
            // En este caso, simplemente cerramos el lightbox.
            closeLightbox();
        });

        nextBtn.addEventListener('click', () => showImage(currentIndex + 1));
        prevBtn.addEventListener('click', () => showImage(currentIndex - 1));

        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('active')) {
                if (e.key === 'Escape') {
                    // Si estamos en el slider, vuelve al grid. Si no, cierra.
                    if (lightbox.classList.contains('lightbox--slider-active')) {
                        switchToGridView();
                    } else {
                        closeLightbox();
                    }
                }
                // Navegación con flechas solo en la vista de slider
                if (lightbox.classList.contains('lightbox--slider-active')) {
                    if (e.key === 'ArrowRight') nextBtn.click();
                    if (e.key === 'ArrowLeft') prevBtn.click();
                }
            }
        });
    }
});