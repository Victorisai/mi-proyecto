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

    // =============================
    // === AUTENTICACIÓN (HOME) ===
    // =============================
    const AUTH_STORAGE_KEY = 'domablyAuthState';

    const authModal = document.getElementById('auth-modal');
    const authOverlay = document.getElementById('auth-modal-overlay');
    const authTabs = document.querySelectorAll('[data-auth-tab]');
    const authTriggers = document.querySelectorAll('[data-auth-trigger]');
    const authCloseTriggers = document.querySelectorAll('[data-auth-close]');
    const authFormsContainer = document.querySelectorAll('[data-auth-controls]');
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const authMessage = document.getElementById('auth-form-message');

    const decodeJwt = (token) => {
        if (!token || typeof token !== 'string') return null;

        const parts = token.split('.');
        if (parts.length !== 3) return null;

        try {
            const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const decodedPayload = atob(payload);
            return JSON.parse(decodedPayload);
        } catch (error) {
            console.error('Error al decodificar el token JWT:', error);
            return null;
        }
    };

    const storeAuthState = (data) => {
        try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('No se pudo almacenar el estado de autenticación:', error);
        }
    };

    const clearAuthState = () => {
        try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (error) {
            console.error('No se pudo limpiar el estado de autenticación:', error);
        }
    };

    const getStoredAuthState = () => {
        try {
            const rawState = localStorage.getItem(AUTH_STORAGE_KEY);
            return rawState ? JSON.parse(rawState) : null;
        } catch (error) {
            console.error('No se pudo leer el estado de autenticación:', error);
            return null;
        }
    };

    const setAuthMessage = (message, type = '') => {
        if (!authMessage) return;

        authMessage.textContent = message || '';
        authMessage.classList.remove('auth-modal__message--error', 'auth-modal__message--success');

        if (type === 'error') {
            authMessage.classList.add('auth-modal__message--error');
        } else if (type === 'success') {
            authMessage.classList.add('auth-modal__message--success');
        }
    };

    const toggleAuthForms = (target = 'login') => {
        if (!loginForm || !registerForm) return;

        const showLogin = target !== 'register';
        loginForm.hidden = !showLogin;
        registerForm.hidden = showLogin;

        authTabs.forEach((tab) => {
            const tabTarget = tab.getAttribute('data-auth-tab');
            tab.classList.toggle('auth-modal__tab--active', tabTarget === target);
        });

        const focusTarget = showLogin ? loginForm.querySelector('input') : registerForm.querySelector('input');
        if (focusTarget) {
            focusTarget.focus();
        }
    };

    const closeAuthModal = () => {
        if (!authModal) return;

        authModal.classList.remove('auth-modal--visible');
        authModal.setAttribute('aria-hidden', 'true');
        if (authOverlay) authOverlay.classList.remove('auth-modal__overlay--visible');
        document.body.classList.remove('auth-modal-open');
        setAuthMessage('');
    };

    const openAuthModal = (target = 'login') => {
        if (!authModal) return;

        toggleAuthForms(target);
        setAuthMessage('');
        authModal.classList.add('auth-modal--visible');
        authModal.setAttribute('aria-hidden', 'false');
        if (authOverlay) authOverlay.classList.add('auth-modal__overlay--visible');
        document.body.classList.add('auth-modal-open');
    };

    const applyAuthStateToUI = (authData = null) => {
        authFormsContainer.forEach((container) => {
            const triggers = container.querySelectorAll('[data-auth-trigger]');
            const profileLink = container.querySelector('[data-auth-profile]');
            const logoutLink = container.querySelector('[data-auth-logout]');

            if (authData && authData.token) {
                triggers.forEach((trigger) => {
                    trigger.hidden = true;
                });

                if (profileLink) {
                    const isAdmin = authData.role === 'admin';
                    profileLink.hidden = false;
                    profileLink.textContent = isAdmin ? 'Panel Admin' : 'Mi perfil';
                    profileLink.setAttribute('href', isAdmin ? 'admin/index.php' : 'feed.html');
                }

                if (logoutLink) {
                    logoutLink.hidden = false;
                }
            } else {
                triggers.forEach((trigger) => {
                    trigger.hidden = false;
                });

                if (profileLink) {
                    profileLink.hidden = true;
                }

                if (logoutLink) {
                    logoutLink.hidden = true;
                }
            }
        });
    };

    const buildAuthState = (token, extra = {}) => {
        const payload = decodeJwt(token);
        if (!payload || !payload.user) {
            throw new Error('Token de autenticación inválido.');
        }

        const exp = payload.exp ? payload.exp * 1000 : null;
        if (exp && Date.now() > exp) {
            throw new Error('La sesión ha expirado, por favor vuelve a iniciar sesión.');
        }

        return {
            token,
            role: payload.user.role || 'user',
            userId: payload.user.id || null,
            ...extra
        };
    };

    const authenticateUser = async (email, password) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'No fue posible iniciar sesión.');
        }

        if (!data.token) {
            throw new Error('No se recibió el token de autenticación.');
        }

        const authState = buildAuthState(data.token, { email });
        storeAuthState(authState);
        applyAuthStateToUI(authState);

        return authState;
    };

    authTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            closeNav();
            const target = trigger.getAttribute('data-auth-trigger');
            openAuthModal(target === 'register' ? 'register' : 'login');
        });
    });

    authCloseTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            closeAuthModal();
        });
    });

    if (authOverlay) {
        authOverlay.addEventListener('click', closeAuthModal);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && authModal && authModal.classList.contains('auth-modal--visible')) {
            closeAuthModal();
        }
    });

    authTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-auth-tab');
            toggleAuthForms(target || 'login');
        });
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = (loginForm.email?.value || '').trim();
            const password = loginForm.password?.value || '';

            if (!email || !password) {
                setAuthMessage('Por favor, completa todos los campos requeridos.', 'error');
                return;
            }

            const submitButton = loginForm.querySelector('.auth-form__submit');
            if (submitButton) submitButton.disabled = true;
            setAuthMessage('');

            try {
                await authenticateUser(email, password);
                setAuthMessage('¡Has iniciado sesión correctamente!', 'success');
                loginForm.reset();
                setTimeout(() => {
                    closeAuthModal();
                }, 900);
            } catch (error) {
                console.error('Error en el inicio de sesión:', error);
                setAuthMessage(error.message || 'No fue posible iniciar sesión.', 'error');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(registerForm);
            const name = (formData.get('name') || '').toString().trim();
            const email = (formData.get('email') || '').toString().trim();
            const phone = (formData.get('phone') || '').toString().trim();
            const birthDate = (formData.get('birth_date') || '').toString().trim();
            const password = (formData.get('password') || '').toString();
            const passwordConfirm = (formData.get('password_confirm') || '').toString();

            if (!name || !email || !password) {
                setAuthMessage('Por favor, completa los campos obligatorios.', 'error');
                return;
            }

            if (password.length < 6) {
                setAuthMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
                return;
            }

            if (password !== passwordConfirm) {
                setAuthMessage('Las contraseñas no coinciden.', 'error');
                return;
            }

            const submitButton = registerForm.querySelector('.auth-form__submit');
            if (submitButton) submitButton.disabled = true;
            setAuthMessage('');

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        phone: phone || null,
                        birth_date: birthDate || null
                    })
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(data.message || 'No fue posible completar el registro.');
                }

                setAuthMessage('Cuenta creada con éxito. Iniciando sesión...', 'success');

                await authenticateUser(email, password);
                registerForm.reset();
                if (loginForm) loginForm.reset();

                setTimeout(() => {
                    closeAuthModal();
                }, 900);
            } catch (error) {
                console.error('Error en el registro:', error);
                setAuthMessage(error.message || 'No fue posible completar el registro.', 'error');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    const logoutLinks = document.querySelectorAll('[data-auth-logout]');
    logoutLinks.forEach((logoutLink) => {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            clearAuthState();
            applyAuthStateToUI(null);
            closeAuthModal();
            setAuthMessage('');
            closeNav();
        });
    });

    const initialState = (() => {
        const stored = getStoredAuthState();
        if (!stored || !stored.token) return null;

        try {
            return buildAuthState(stored.token, {
                email: stored.email || null
            });
        } catch (error) {
            console.warn('El token almacenado no es válido o expiró:', error.message);
            clearAuthState();
            return null;
        }
    })();

    applyAuthStateToUI(initialState);

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