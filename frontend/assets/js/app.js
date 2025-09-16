document.addEventListener('DOMContentLoaded', () => {
    // URL base de tu API en Node.js (cámbiala si es necesario)
    const API_URL = 'http://localhost:3000/api';
    const HERO_PLACEHOLDER_IMAGES = [
        'assets/images/hero/placeholder.jpg',
        'assets/images/hero/placeholder2.jpg',
        'assets/images/hero/placeholder3.jpg'
    ];

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
            carousel.innerHTML = ''; // Limpiar el carrusel

            properties.forEach(prop => {
                const price = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(prop.price);
                const priceSuffix = listingType === 'renta' ? ' / Mes' : ' MXN';

                carousel.innerHTML += `
                    <div class="property-showcase__slide-card" data-category="${prop.category}">
                        <a href="property_detail.php?id=${prop.id}">
                            <div class="property-showcase__category-badge">${prop.category.charAt(0).toUpperCase() + prop.category.slice(1)}</div>
                            <img src="${prop.main_image}" alt="${prop.title}">
                            <div class="property-showcase__slide-card-info">
                                <p class="price">${price}${priceSuffix}</p>
                                <p class="title">${prop.title}</p>
                            </div>
                        </a>
                    </div>`;
            });
        } catch (error) {
            console.error(`Error al cargar propiedades en ${listingType}:`, error);
        }
    }

    /**
     * Obtiene las últimas noticias
     */
    async function fetchNews() {
        try {
            const response = await fetch(`${API_URL}/news?limit=5`);
            if (!response.ok) throw new Error('No se pudieron cargar las noticias');
            const newsArticles = await response.json();

            if (newsArticles.length === 0) return;

            const newsGrid = document.getElementById('news-grid');
            newsGrid.innerHTML = ''; // Limpiar

            // Noticia Principal
            const mainNews = newsArticles[0];
            const mainNewsImage = JSON.parse(mainNews.images)[0];
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
                            <p>${mainNews.information.substring(0, 150)}...</p>
                        </div>
                    </a>
                </div>`;

            // Noticias Secundarias
            const secondaryNews = newsArticles.slice(1);
            const secondaryNewsGrid = document.createElement('div');
            secondaryNewsGrid.className = 'secondary-news-grid';

            secondaryNews.forEach(news => {
                const newsImage = JSON.parse(news.images)[0];
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
                                <p class="secondary-news-excerpt">${news.information.substring(0, 80)}...</p>
                            </div>
                        </a>
                    </div>`;
            });
            newsGrid.appendChild(secondaryNewsGrid);
        } catch (error) {
            console.error('Error al cargar las noticias:', error);
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
