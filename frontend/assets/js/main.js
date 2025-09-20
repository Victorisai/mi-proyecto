document.addEventListener('DOMContentLoaded', () => {
    console.log('main.js unificado cargado'); // Mensaje de depuración

    const API_BASE_URL = 'http://localhost:3000/api';
    const AUTH_TOKEN_KEY = 'domablyAuthToken';

    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const loginFeedback = document.getElementById('login-feedback');
    const loginTriggers = document.querySelectorAll('[data-login-trigger]');
    const authStateElements = document.querySelectorAll('[data-auth-state]');

    let tokenExpiryTimeoutId;

    const decodeToken = (token) => {
        try {
            const payloadPart = token.split('.')[1];
            if (!payloadPart) return null;
            const decoded = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch (error) {
            console.warn('No se pudo decodificar el token JWT:', error);
            return null;
        }
    };

    const isTokenValid = (token) => {
        if (!token) return false;
        const payload = decodeToken(token);
        if (!payload?.exp) return true;
        const expiresAt = payload.exp * 1000;
        return expiresAt > Date.now();
    };

    const getStoredToken = () => {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (storedToken && isTokenValid(storedToken)) {
            return storedToken;
        }
        if (storedToken) {
            localStorage.removeItem(AUTH_TOKEN_KEY);
        }
        return null;
    };

    const handleLogout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        updateAuthState(null);
    };

    const scheduleTokenExpiryCheck = (token) => {
        if (tokenExpiryTimeoutId) {
            clearTimeout(tokenExpiryTimeoutId);
            tokenExpiryTimeoutId = undefined;
        }

        const payload = decodeToken(token);
        if (!payload?.exp) {
            return;
        }

        const millisecondsToExpire = payload.exp * 1000 - Date.now();
        if (millisecondsToExpire <= 0) {
            handleLogout();
            return;
        }

        tokenExpiryTimeoutId = setTimeout(handleLogout, millisecondsToExpire);
    };

    function updateAuthState(token) {
        const isAuthenticated = Boolean(token);

        authStateElements.forEach((element) => {
            const state = element.getAttribute('data-auth-state');
            if (state === 'authenticated') {
                element.classList.toggle('is-hidden', !isAuthenticated);
            }
            if (state === 'guest') {
                element.classList.toggle('is-hidden', isAuthenticated);
            }
        });

        if (isAuthenticated) {
            scheduleTokenExpiryCheck(token);
        } else if (tokenExpiryTimeoutId) {
            clearTimeout(tokenExpiryTimeoutId);
            tokenExpiryTimeoutId = undefined;
        }
    }

    const storedToken = getStoredToken();
    if (storedToken) {
        updateAuthState(storedToken);
    } else {
        updateAuthState(null);
    }

    const openLoginModal = () => {
        if (!loginModal) return;
        loginModal.classList.add('is-open');
        loginModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (loginForm) {
            const emailInput = loginForm.querySelector('input[type="email"]');
            if (emailInput) {
                setTimeout(() => emailInput.focus(), 150);
            }
        }
    };

    const closeLoginModal = () => {
        if (!loginModal) return;
        loginModal.classList.remove('is-open');
        loginModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (loginForm) {
            loginForm.reset();
        }
        if (loginFeedback) {
            loginFeedback.textContent = '';
            loginFeedback.classList.remove('auth-modal__feedback--success');
        }
    };

    if (loginModal) {
        loginTriggers.forEach(trigger => {
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                openLoginModal();
            });
        });

        const modalCloseButtons = loginModal.querySelectorAll('[data-login-close]');
        modalCloseButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                closeLoginModal();
            });
        });

        loginModal.addEventListener('click', (event) => {
            if (event.target === loginModal) {
                closeLoginModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && loginModal.classList.contains('is-open')) {
                closeLoginModal();
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = loginForm.email?.value.trim();
            const password = loginForm.password?.value.trim();
            const submitButton = loginForm.querySelector('.auth-modal__submit');

            if (!email || !password) {
                if (loginFeedback) {
                    loginFeedback.textContent = 'Por favor ingresa correo y contraseña.';
                    loginFeedback.classList.remove('auth-modal__feedback--success');
                }
                return;
            }

            if (loginFeedback) {
                loginFeedback.textContent = '';
                loginFeedback.classList.remove('auth-modal__feedback--success');
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Ingresando…';
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorMessage = data?.message || 'No se pudo iniciar sesión. Verifica tus datos.';
                    throw new Error(errorMessage);
                }

                if (!data?.token) {
                    throw new Error('La respuesta del servidor no contiene un token válido.');
                }

                localStorage.setItem(AUTH_TOKEN_KEY, data.token);
                updateAuthState(data.token);

                if (loginFeedback) {
                    loginFeedback.textContent = 'Inicio de sesión exitoso. Redirigiendo…';
                    loginFeedback.classList.add('auth-modal__feedback--success');
                }

                setTimeout(() => {
                    closeLoginModal();
                }, 600);
            } catch (error) {
                console.error('Error durante el inicio de sesión:', error);
                if (loginFeedback) {
                    loginFeedback.textContent = error.message || 'Ocurrió un error inesperado.';
                    loginFeedback.classList.remove('auth-modal__feedback--success');
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Ingresar';
                }
            }
        });
    }

    window.addEventListener('storage', (event) => {
        if (event.key === AUTH_TOKEN_KEY) {
            const refreshedToken = getStoredToken();
            updateAuthState(refreshedToken);
        }
    });

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
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (window.scrollY > 50) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }
        });

        const heroSliderState = {
            interval: null,
            nextHandler: null,
            prevHandler: null,
        };

        const setupHeroSlideshow = () => {
            const slides = document.querySelectorAll('.hero__slide');
            const progressBarsMobile = document.querySelectorAll('.hero__progress-bar');
            const progressBarsDesktop = document.querySelectorAll('.hero-nav__bar');
            const prevArrowDesktop = document.querySelector('.hero-nav__arrow--prev');
            const nextArrowDesktop = document.querySelector('.hero-nav__arrow--next');

            if (slides.length === 0) {
                if (heroSliderState.interval) {
                    clearInterval(heroSliderState.interval);
                    heroSliderState.interval = null;
                }
                if (prevArrowDesktop && heroSliderState.prevHandler) {
                    prevArrowDesktop.removeEventListener('click', heroSliderState.prevHandler);
                }
                if (nextArrowDesktop && heroSliderState.nextHandler) {
                    nextArrowDesktop.removeEventListener('click', heroSliderState.nextHandler);
                }
                return;
            }

            let currentSlide = 0;

            const showSlide = (index) => {
                currentSlide = (index + slides.length) % slides.length;
                slides.forEach((slide, i) => {
                    slide.classList.toggle('hero__slide--active', i === currentSlide);
                });

                progressBarsMobile.forEach((bar, i) => {
                    const fill = bar.querySelector('.hero__progress-bar-fill');
                    if (!fill) return;
                    fill.style.transition = 'none';
                    fill.style.width = '0';
                    if (i === currentSlide) {
                        setTimeout(() => {
                            fill.style.transition = 'width 5s linear';
                            fill.style.width = '100%';
                        }, 50);
                    }
                });

                progressBarsDesktop.forEach((bar, i) => {
                    const fill = bar.querySelector('.hero-nav__bar-fill');
                    if (!fill) return;
                    fill.style.transition = 'none';
                    fill.style.width = '0';
                    bar.classList.toggle('hero-nav__bar--active', i === currentSlide);
                    if (i === currentSlide) {
                        setTimeout(() => {
                            fill.style.transition = 'width 5s linear';
                            fill.style.width = '100%';
                        }, 50);
                    }
                });
            };

            const nextSlide = () => showSlide(currentSlide + 1);
            const prevSlide = () => showSlide(currentSlide - 1);

            const startSlideshow = () => {
                if (heroSliderState.interval) {
                    clearInterval(heroSliderState.interval);
                }
                showSlide(currentSlide);
                heroSliderState.interval = setInterval(nextSlide, 5000);
            };

            if (nextArrowDesktop && heroSliderState.nextHandler) {
                nextArrowDesktop.removeEventListener('click', heroSliderState.nextHandler);
            }
            if (prevArrowDesktop && heroSliderState.prevHandler) {
                prevArrowDesktop.removeEventListener('click', heroSliderState.prevHandler);
            }

            heroSliderState.nextHandler = () => {
                nextSlide();
                startSlideshow();
            };
            heroSliderState.prevHandler = () => {
                prevSlide();
                startSlideshow();
            };

            if (nextArrowDesktop) {
                nextArrowDesktop.addEventListener('click', heroSliderState.nextHandler);
            }
            if (prevArrowDesktop) {
                prevArrowDesktop.addEventListener('click', heroSliderState.prevHandler);
            }

            startSlideshow();
        };

        setupHeroSlideshow();
        document.addEventListener('heroImagesLoaded', setupHeroSlideshow);
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

        const applyFilter = (category) => {
            const normalizedCategory = (category || '').toLowerCase();
            const propertyCards = showcase.querySelectorAll('.property-showcase__slide-card');

            propertyCards.forEach(card => {
                const cardCategory = (card.dataset.category || '').toLowerCase();

                if (normalizedCategory === 'all' || normalizedCategory === '' || cardCategory === normalizedCategory) {
                    card.classList.remove('property-showcase__slide-card--hidden');
                } else {
                    card.classList.add('property-showcase__slide-card--hidden');
                }
            });
        };

        filterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                filterLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                applyFilter(link.dataset.category);
            });
        });

        const handlePropertiesLoaded = (event) => {
            const { carouselId, showcaseId: loadedShowcaseId } = event.detail || {};

            let targetShowcaseId = loadedShowcaseId || null;
            if (!targetShowcaseId && carouselId) {
                const carousel = document.querySelector(carouselId);
                const parentShowcase = carousel ? carousel.closest('.property-showcase') : null;
                targetShowcaseId = parentShowcase ? parentShowcase.id : null;
            }

            if (targetShowcaseId !== showcaseId) {
                return;
            }

            const activeLink = showcase.querySelector('.property-showcase__filter-link.active')
                || showcase.querySelector('.property-showcase__filter-link[data-category="all"]');

            if (activeLink) {
                applyFilter(activeLink.dataset.category);
            }
        };

        document.addEventListener('propertiesLoaded', handlePropertiesLoaded);

        const initialActiveLink = showcase.querySelector('.property-showcase__filter-link.active');
        if (initialActiveLink) {
            applyFilter(initialActiveLink.dataset.category);
        }
    }

    setupCategoryFilter('destacadas-showcase');
    setupCategoryFilter('renta-showcase');

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

    // ============================================================
    // === LÓGICA PARA LIGHTBOX V3 (MOSAICO Y SLIDER) ===
    // ============================================================
    const lightbox = document.getElementById('property-lightbox');
    let lightboxInitialized = false;

    function initializeLightbox(images) {
        if (lightboxInitialized || !lightbox || !Array.isArray(images) || images.length === 0) {
            return;
        }

        lightboxInitialized = true;
        window.propertyImages = [...images];

        const propertyImagesList = window.propertyImages;
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

        if (!mainLightboxImage || !counter || !gridContainer) {
            return;
        }

        let currentIndex = 0;

        function showImage(index) {
            currentIndex = (index + propertyImagesList.length) % propertyImagesList.length;
            mainLightboxImage.src = propertyImagesList[currentIndex];
            counter.textContent = `${currentIndex + 1} / ${propertyImagesList.length}`;
        }

        function populateGrid() {
            gridContainer.innerHTML = '';
            propertyImagesList.forEach((src, index) => {
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
            switchToGridView();
        }

        function closeLightbox() {
            document.body.classList.remove('lightbox-active');
            lightbox.classList.remove('active');
        }

        galleryItems.forEach(item => {
            item.addEventListener('click', openLightbox);
        });

        if (openBtn) {
            openBtn.addEventListener('click', openLightbox);
        }

        closeBtns.forEach(btn => btn.addEventListener('click', closeLightbox));

        if (backToGridBtn) {
            backToGridBtn.addEventListener('click', switchToGridView);
        }

        if (backFromGridBtn) {
            backFromGridBtn.addEventListener('click', () => {
                closeLightbox();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => showImage(currentIndex + 1));
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
        }

        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('active')) {
                if (e.key === 'Escape') {
                    if (lightbox.classList.contains('lightbox--slider-active')) {
                        switchToGridView();
                    } else {
                        closeLightbox();
                    }
                }
                if (lightbox.classList.contains('lightbox--slider-active')) {
                    if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
                    if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
                }
            }
        });

        gridContainer.addEventListener('click', (event) => {
            const item = event.target.closest('.lightbox__grid-item');
            if (!item) return;
            const index = parseInt(item.dataset.index, 10);
            if (Number.isInteger(index)) {
                switchToSliderView(index);
            }
        });
    }

    if (lightbox && Array.isArray(window.propertyImages) && window.propertyImages.length > 0) {
        initializeLightbox(window.propertyImages);
    }

    document.addEventListener('propertyImagesLoaded', (event) => {
        const images = event?.detail?.images;
        if (Array.isArray(images) && images.length > 0) {
            initializeLightbox(images);
        }
    });
// =======================================================
// === LÓGICA PARA REVELAR TELÉFONO EN TARJETA DE CONTACTO ===
// =======================================================
const revealPhoneBtn = document.getElementById('reveal-phone-btn');
if (revealPhoneBtn) {
    revealPhoneBtn.addEventListener('click', () => {
        const phoneWrapper = document.getElementById('phone-wrapper');
        const phoneNumberSpan = phoneWrapper.querySelector('.contact-card__phone-number');
        const fullNumber = phoneNumberSpan.dataset.fullNumber;

        // Reemplaza el contenido del wrapper con el número completo y enlazado
        phoneWrapper.innerHTML = `<a href="tel:+52${fullNumber.replace(/-/g, '')}" class="contact-card__phone-number">${fullNumber}</a>`;
    });
}

// === LÓGICA PARA CARRUSEL DE PROPIEDADES SIMILARES ===
    const similarCarouselWrapper = document.getElementById('similar-carousel-wrapper');
    if (similarCarouselWrapper) {
        const prevBtn = document.getElementById('similar-prev');
        const nextBtn = document.getElementById('similar-next');
        const firstCard = similarCarouselWrapper.querySelector('.property-card');

        if(firstCard) {
            const scrollAmount = firstCard.offsetWidth + 30; // Ancho de la tarjeta + el gap

            prevBtn.addEventListener('click', () => {
                similarCarouselWrapper.scrollLeft -= scrollAmount;
            });

            nextBtn.addEventListener('click', () => {
                similarCarouselWrapper.scrollLeft += scrollAmount;
            });
        }
    }
});