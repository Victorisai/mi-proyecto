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
    // === AUTENTICACIÓN (USUARIOS) ===
    // ==================================
    const AUTH_TOKEN_KEY = 'domablyToken';
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const modalOverlay = document.getElementById('auth-modal-overlay');
    const authModals = [loginModal, registerModal].filter(Boolean);
    const authGuestElements = document.querySelectorAll('[data-auth-visible="guest"]');
    const authUserElements = document.querySelectorAll('[data-auth-visible="authenticated"]');
    const accountLinks = document.querySelectorAll('[data-account-link]');

    let activeAuthModal = null;
    let authenticatedUser = null;

    accountLinks.forEach(link => {
        if (!link.dataset.defaultLabel) {
            link.dataset.defaultLabel = link.textContent.trim();
        }
    });

    const decodeTokenPayload = (token) => {
        if (!token || typeof token !== 'string') return null;
        const segments = token.split('.');
        if (segments.length < 2) return null;
        try {
            const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
            const json = atob(padded);
            return JSON.parse(json);
        } catch (error) {
            console.error('No se pudo decodificar el token JWT:', error);
            return null;
        }
    };

    const getUserFromToken = (token) => {
        const payload = decodeTokenPayload(token);
        if (!payload || !payload.user) {
            return null;
        }

        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp <= currentTimestamp) {
            return null;
        }

        return {
            id: payload.user.id,
            role: payload.user.role || 'user',
        };
    };

    const resolveAccountHref = (link, role = 'user') => {
        if (!link) return null;
        const adminHref = link.dataset.accountHrefAdmin;
        const userHref = link.dataset.accountHrefUser;
        if (role === 'admin') {
            return adminHref || userHref || link.getAttribute('href');
        }
        return userHref || adminHref || link.getAttribute('href');
    };

    const updateAuthUI = (user) => {
        const isAuthenticated = Boolean(user);

        authGuestElements.forEach(element => {
            if (!element) return;
            if (isAuthenticated) {
                element.setAttribute('hidden', '');
            } else {
                element.removeAttribute('hidden');
            }
        });

        authUserElements.forEach(element => {
            if (!element) return;
            if (isAuthenticated) {
                element.removeAttribute('hidden');
            } else {
                element.setAttribute('hidden', '');
            }
        });

        if (!isAuthenticated) {
            return;
        }

        accountLinks.forEach(link => {
            if (!link) return;
            const href = resolveAccountHref(link, user.role || 'user');
            if (href) {
                link.setAttribute('href', href);
            }
            if (link.dataset.defaultLabel) {
                link.textContent = link.dataset.defaultLabel;
            }
        });
    };

    const setFormFeedback = (element, message = '', type = 'info') => {
        if (!element) return;
        element.textContent = message;
        element.classList.remove('auth-modal__message--error', 'auth-modal__message--success');
        element.removeAttribute('role');
        element.removeAttribute('aria-live');

        if (!message) {
            return;
        }

        if (type === 'error') {
            element.classList.add('auth-modal__message--error');
            element.setAttribute('role', 'alert');
            element.setAttribute('aria-live', 'assertive');
        } else {
            element.classList.add('auth-modal__message--success');
            element.setAttribute('role', 'status');
            element.setAttribute('aria-live', 'polite');
        }
    };

    const setSubmitLoading = (button, isLoading) => {
        if (!button) return;
        if (isLoading) {
            if (!button.dataset.originalText) {
                button.dataset.originalText = button.textContent.trim();
            }
            button.textContent = 'Procesando...';
        } else if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
        }
        button.disabled = isLoading;
    };

    const showOverlay = () => {
        if (!modalOverlay) return;
        modalOverlay.hidden = false;
        requestAnimationFrame(() => modalOverlay.classList.add('is-active'));
        document.body.classList.add('no-scroll');
    };

    const hideOverlay = () => {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('is-active');
        const onTransitionEnd = () => {
            modalOverlay.hidden = true;
            modalOverlay.removeEventListener('transitionend', onTransitionEnd);
        };
        modalOverlay.addEventListener('transitionend', onTransitionEnd, { once: true });
        document.body.classList.remove('no-scroll');
    };

    const resetAuthModal = (modal) => {
        if (!modal) return;
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        const messageElement = modal.querySelector('.auth-modal__message');
        if (messageElement) {
            setFormFeedback(messageElement, '');
        }
    };

    const closeAuthModal = (modal, { reset = true, preserveOverlay = false } = {}) => {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');

        if (reset) {
            resetAuthModal(modal);
        }

        if (activeAuthModal === modal) {
            activeAuthModal = null;
        }

        if (preserveOverlay) {
            return;
        }

        const anyModalOpen = authModals.some(item => item && item.classList.contains('is-open'));
        if (!anyModalOpen) {
            hideOverlay();
        }
    };

    const openAuthModal = (modal) => {
        if (!modal || !modalOverlay) return;
        if (activeAuthModal && activeAuthModal !== modal) {
            closeAuthModal(activeAuthModal, { preserveOverlay: true });
        }
        activeAuthModal = modal;
        showOverlay();
        modal.classList.add('is-open');
        modal.removeAttribute('aria-hidden');
        if (typeof modal.focus === 'function') {
            modal.focus();
        }
    };

    const setAuthenticatedUser = (user) => {
        authenticatedUser = user;
        updateAuthUI(user);
        window.dispatchEvent(new CustomEvent('domably:auth-changed', { detail: { user } }));
    };

    const initializeAuthState = () => {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!storedToken) {
            setAuthenticatedUser(null);
            return;
        }

        const user = getUserFromToken(storedToken);
        if (user) {
            setAuthenticatedUser(user);
        } else {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            setAuthenticatedUser(null);
        }
    };

    initializeAuthState();

    const loginTriggers = document.querySelectorAll('[data-auth-trigger="login"]');
    const registerTriggers = document.querySelectorAll('[data-auth-trigger="register"]');

    const closeMobileNavIfOpen = () => {
        if (typeof closeNav === 'function') {
            closeNav();
        }
    };

    if (loginModal) {
        loginTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                closeMobileNavIfOpen();
                openAuthModal(loginModal);
            });
        });
    }

    if (registerModal) {
        registerTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                closeMobileNavIfOpen();
                openAuthModal(registerModal);
            });
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            if (activeAuthModal) {
                closeAuthModal(activeAuthModal);
            }
        });
    }

    document.querySelectorAll('[data-modal-close]').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.auth-modal');
            closeAuthModal(modal);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && activeAuthModal) {
            closeAuthModal(activeAuthModal);
        }
    });

    document.querySelectorAll('[data-switch-modal]').forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.switchModal;
            if (target === 'register' && registerModal) {
                closeAuthModal(loginModal, { preserveOverlay: true });
                openAuthModal(registerModal);
            } else if (target === 'login' && loginModal) {
                closeAuthModal(registerModal, { preserveOverlay: true });
                openAuthModal(loginModal);
            }
        });
    });

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMessage = loginForm ? loginForm.querySelector('.auth-modal__message') : null;
    const registerMessage = registerForm ? registerForm.querySelector('.auth-modal__message') : null;
    const loginSubmitButton = loginForm ? loginForm.querySelector('.auth-modal__submit') : null;
    const registerSubmitButton = registerForm ? registerForm.querySelector('.auth-modal__submit') : null;

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = loginForm.email.value.trim();
            const password = loginForm.password.value.trim();

            if (!email || !password) {
                setFormFeedback(loginMessage, 'Por favor, completa tu correo y contraseña.', 'error');
                return;
            }

            setFormFeedback(loginMessage, '');
            setSubmitLoading(loginSubmitButton, true);

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(data.message || 'No se pudo iniciar sesión.');
                }

                if (!data.token) {
                    throw new Error('El servidor no devolvió un token válido.');
                }

                localStorage.setItem(AUTH_TOKEN_KEY, data.token);
                const user = getUserFromToken(data.token);
                if (!user) {
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    throw new Error('No se pudo validar la sesión. Intenta nuevamente.');
                }
                setAuthenticatedUser(user);

                setFormFeedback(loginMessage, 'Inicio de sesión exitoso. ¡Bienvenido de nuevo!', 'success');

                setTimeout(() => {
                    closeAuthModal(loginModal);
                }, 900);
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                setFormFeedback(loginMessage, error.message || 'No se pudo iniciar sesión.', 'error');
            } finally {
                setSubmitLoading(loginSubmitButton, false);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = registerForm.name.value.trim();
            const email = registerForm.email.value.trim();
            const phone = registerForm.phone.value.trim();
            const birthDate = registerForm.birth_date.value;
            const password = registerForm.password.value.trim();
            const confirmPassword = registerForm.confirm_password.value.trim();

            if (!name || !email || !password || !confirmPassword) {
                setFormFeedback(registerMessage, 'Por favor, completa los campos obligatorios.', 'error');
                return;
            }

            if (password.length < 6) {
                setFormFeedback(registerMessage, 'La contraseña debe tener al menos 6 caracteres.', 'error');
                return;
            }

            if (password !== confirmPassword) {
                setFormFeedback(registerMessage, 'Las contraseñas no coinciden.', 'error');
                return;
            }

            const payload = {
                name,
                email,
                password,
            };

            if (phone) {
                payload.phone = phone;
            }
            if (birthDate) {
                payload.birth_date = birthDate;
            }

            setFormFeedback(registerMessage, '');
            setSubmitLoading(registerSubmitButton, true);

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(data.message || 'No se pudo crear la cuenta.');
                }

                const successMessage = data.message || '¡Tu cuenta se creó con éxito! Ahora puedes iniciar sesión.';
                setFormFeedback(registerMessage, successMessage, 'success');

                setTimeout(() => {
                    if (registerModal && loginModal) {
                        closeAuthModal(registerModal, { preserveOverlay: true });
                        openAuthModal(loginModal);
                        if (loginMessage) {
                            setFormFeedback(loginMessage, 'Cuenta creada. Ingresa tus datos para comenzar.', 'success');
                        }
                    } else if (registerModal) {
                        closeAuthModal(registerModal);
                    }
                }, 1200);
            } catch (error) {
                console.error('Error al registrar usuario:', error);
                setFormFeedback(registerMessage, error.message || 'No se pudo crear la cuenta.', 'error');
            } finally {
                setSubmitLoading(registerSubmitButton, false);
            }
        });
    }

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