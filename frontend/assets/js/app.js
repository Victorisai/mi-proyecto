document.addEventListener('DOMContentLoaded', () => {
    // URL base de tu API en Node.js (cámbiala si es necesario)
    const API_URL = 'http://localhost:3000/api';
    const HERO_PLACEHOLDER_IMAGES = [
        'assets/images/hero/placeholder.jpg',
        'assets/images/hero/placeholder2.jpg',
        'assets/images/hero/placeholder3.jpg'
    ];
    const NEWS_PLACEHOLDER_IMAGE = 'assets/images/hero/placeholder.jpg';

    // Funciones para cargar el contenido dinámico
    fetchHeroImages();
    fetchProperties('venta', '#destacadas-carousel');
    fetchProperties('renta', '#renta-carousel');
    fetchNews();
    updateYear();

    /**
     * Obtiene las imágenes del carrusel principal (hero)
     */
    async function fetchHeroImages() {
        const slideshow = document.getElementById('hero-slideshow');
        const progressContainer = document.getElementById('hero-progress-container');
        const navProgress = document.getElementById('hero-nav-progress');

        if (!slideshow || !progressContainer || !navProgress) {
            return;
        }

        const renderHeroSlides = (images) => {
            slideshow.innerHTML = '';
            progressContainer.innerHTML = '';
            navProgress.innerHTML = '';

            let hasSlides = false;

            images.forEach(image => {
                const imagePath = typeof image === 'string' ? image : image?.image_path;
                if (!imagePath) return;

                hasSlides = true;
                slideshow.innerHTML += `<div class="hero__slide" style="background-image: url('${imagePath}');"></div>`;
                progressContainer.innerHTML += `
                    <div class="hero__progress-bar">
                        <div class="hero__progress-bar-fill"></div>
                    </div>`;
                navProgress.innerHTML += `
                    <div class="hero-nav__bar">
                        <div class="hero-nav__bar-fill"></div>
                    </div>`;
            });

            if (!hasSlides) {
                return;
            }

            const firstSlide = slideshow.querySelector('.hero__slide');
            if (firstSlide) {
                firstSlide.classList.add('hero__slide--active');
            }

            const firstMobileFill = progressContainer.querySelector('.hero__progress-bar-fill');
            if (firstMobileFill) {
                firstMobileFill.style.width = '100%';
            }

            const firstDesktopBar = navProgress.querySelector('.hero-nav__bar');
            if (firstDesktopBar) {
                firstDesktopBar.classList.add('hero-nav__bar--active');
                const fill = firstDesktopBar.querySelector('.hero-nav__bar-fill');
                if (fill) {
                    fill.style.width = '100%';
                }
            }

            document.dispatchEvent(new CustomEvent('heroImagesLoaded'));
        };

        const fallbackImages = HERO_PLACEHOLDER_IMAGES.map(path => ({ image_path: path }));

        try {
            const response = await fetch(`${API_URL}/hero-images`);
            if (!response.ok) throw new Error('No se pudieron cargar las imágenes del carrusel');
            const images = await response.json();
            if (Array.isArray(images) && images.length > 0) {
                renderHeroSlides(images);
            } else {
                renderHeroSlides(fallbackImages);
            }
        } catch (error) {
            console.error('Error al cargar imágenes del carrusel:', error);
            renderHeroSlides(fallbackImages);
        }
    }

    /**
     * Obtiene las propiedades (en venta o renta)
     * @param {string} listingType - 'venta' o 'renta'
     * @param {string} carouselId - El ID del contenedor del carrusel
     */
    async function fetchProperties(listingType, carouselId) {
        try {
            const response = await fetch(`${API_URL}/properties?listing_type=${listingType}&limit=10`);
            if (!response.ok) throw new Error(`No se pudieron cargar las propiedades en ${listingType}`);
            const properties = await response.json();

            const carousel = document.querySelector(carouselId);
            if (!carousel) {
                console.warn(`No se encontró el carrusel con el selector ${carouselId}`);
                return;
            }

            carousel.innerHTML = ''; // Limpiar el carrusel

            properties.forEach(prop => {
                const price = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(prop.price);
                const priceSuffix = listingType === 'renta' ? ' / Mes' : ' MXN';

                const rawCategory = typeof prop.category === 'string' ? prop.category : '';
                const normalizedCategory = rawCategory.toLowerCase();
                const displayCategory = rawCategory
                    ? rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase()
                    : '';

                carousel.innerHTML += `
                    <div class="property-showcase__slide-card" data-category="${normalizedCategory}">
                        <a href="property_detail.html?id=${prop.id}">
                            <div class="property-showcase__category-badge">${displayCategory}</div>
                            <img src="${prop.main_image}" alt="${prop.title}">
                            <div class="property-showcase__slide-card-info">
                                <p class="price">${price}${priceSuffix}</p>
                                <p class="title">${prop.title}</p>
                            </div>
                        </a>
                    </div>`;
            });

            const parentShowcase = carousel.closest('.property-showcase');
            document.dispatchEvent(new CustomEvent('propertiesLoaded', {
                detail: {
                    listingType,
                    carouselId,
                    showcaseId: parentShowcase ? parentShowcase.id : null,
                }
            }));
        } catch (error) {
            console.error(`Error al cargar propiedades en ${listingType}:`, error);
        }
    }

    /**
     * Obtiene las últimas noticias
     */
    async function fetchNews() {
        const newsGrid = document.getElementById('news-grid');
        if (!newsGrid) {
            return;
        }

        const parseImages = (imagesField) => {
            if (!imagesField) return [];
            if (Array.isArray(imagesField)) return imagesField;
            try {
                const parsed = JSON.parse(imagesField);
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                return [];
            }
        };

        const getFirstImage = (imagesField) => {
            const images = parseImages(imagesField);
            return images.length > 0 ? images[0] : NEWS_PLACEHOLDER_IMAGE;
        };

        const createExcerpt = (text, maxLength) => {
            if (!text) return '';
            const plainText = text.replace(/<[^>]*>/g, '').trim();
            if (plainText.length <= maxLength) {
                return plainText;
            }
            return `${plainText.substring(0, maxLength).trim()}...`;
        };

        try {
            const response = await fetch(`${API_URL}/news?limit=5`);
            if (!response.ok) throw new Error('No se pudieron cargar las noticias');

            const newsArticles = await response.json();
            if (!Array.isArray(newsArticles) || newsArticles.length === 0) {
                newsGrid.innerHTML = '<p class="news-section__empty">No hay noticias disponibles en este momento.</p>';
                return;
            }

            newsGrid.innerHTML = '';

            const mainNews = newsArticles[0];
            const mainNewsImage = getFirstImage(mainNews.images);
            const mainNewsDate = new Date(mainNews.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

            newsGrid.innerHTML += `
                <div class="main-news-card">
                    <a href="news_detail.php?id=${mainNews.id}">
                        <div class="main-news-card__image-container">
                            <img src="${mainNewsImage}" alt="${mainNews.title}">
                        </div>
                        <div class="main-news-card__content-overlay">
                            <span class="news-date">${mainNewsDate}</span>
                            <h3>${mainNews.title}</h3>
                            <p>${createExcerpt(mainNews.information, 150)}</p>
                        </div>
                    </a>
                </div>`;

            const secondaryNews = newsArticles.slice(1);
            if (secondaryNews.length > 0) {
                const secondaryNewsGrid = document.createElement('div');
                secondaryNewsGrid.className = 'secondary-news-grid';

                secondaryNews.forEach((news) => {
                    const newsImage = getFirstImage(news.images);
                    const newsDate = new Date(news.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

                    secondaryNewsGrid.innerHTML += `
                        <div class="secondary-news-card">
                            <a href="news_detail.php?id=${news.id}">
                                <div class="secondary-news-card__image-container">
                                    <img src="${newsImage}" alt="${news.title}">
                                </div>
                                <div class="secondary-news-card__content">
                                    <span class="news-date">${newsDate}</span>
                                    <h4>${news.title}</h4>
                                    <p class="secondary-news-excerpt">${createExcerpt(news.information, 80)}</p>
                                </div>
                            </a>
                        </div>`;
                });

                newsGrid.appendChild(secondaryNewsGrid);
            }
        } catch (error) {
            console.error('Error al cargar las noticias:', error);
            newsGrid.innerHTML = '<p class="news-section__empty">No se pudieron cargar las noticias en este momento.</p>';
        }
    }

    /**
     * Actualiza el año en el footer
     */
    function updateYear() {
        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }
});
