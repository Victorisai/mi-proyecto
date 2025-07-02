document.addEventListener('DOMContentLoaded', () => {
    console.log('main.js cargado'); // Depuración
    // Menú hamburguesa
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    const closeMenu = document.querySelector('.close-menu');
    if (closeMenu && navMenu) {
    closeMenu.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
    }

    // Asignar retrasos a las tarjetas de propiedades
    const propertyCards = document.querySelectorAll('.property-card');
    propertyCards.forEach((card, index) => {
        card.style.setProperty('--i', index + 1);
    });

    // Galería de imágenes en detalle de propiedad
    const mainImage = document.querySelector('.main-image');
    const thumbnails = document.querySelectorAll('.thumbnail-grid img');
    if (mainImage && thumbnails) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                mainImage.src = thumbnail.src;
                mainImage.alt = thumbnail.alt;
            });
        });
    }

    // Mostrar campos de características según la categoría seleccionada
    window.updateFeaturesForm = function() {
        console.log('updateFeaturesForm ejecutada'); // Depuración
        const categorySelect = document.getElementById('category');
        if (!categorySelect) {
            console.error('Elemento con id="category" no encontrado');
            return;
        }

        const category = categorySelect.value;
        console.log('Categoría seleccionada:', category); // Depuración
        const featureGroups = document.querySelectorAll('.features-group');
        console.log('Grupos de características encontrados:', featureGroups.length); // Depuración
        featureGroups.forEach(group => {
            const isVisible = group.id === `features-${category}`;
            group.style.display = isVisible ? 'block' : 'none';
            console.log(`Grupo ${group.id}: ${isVisible ? 'visible' : 'oculto'}`); // Depuración
        });
    };

    // Configurar el formulario al cargar y al cambiar la categoría
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        console.log('Select de categoría encontrado, inicializando...'); // Depuración
        updateFeaturesForm(); // Inicializar al cargar
        categorySelect.addEventListener('change', updateFeaturesForm); // Actualizar al cambiar
    } else {
        console.warn('Select de categoría no encontrado en la página'); // Depuración
    }

    // Validación opcional del formulario antes de enviar
    const form = document.querySelector('.admin-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            const category = document.getElementById('category').value;
            const activeGroup = document.querySelector(`#features-${category}`);
            if (!activeGroup || activeGroup.style.display === 'none') {
                e.preventDefault();
                alert('Error: Los campos de características no están visibles para la categoría seleccionada.');
            }
        });
    }

    // Vista previa de imágenes cargadas
    const imageInputs = document.querySelectorAll('input[type="file"][accept="image/*"]');
    imageInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const preview = document.createElement('img');
                    preview.src = event.target.result;
                    preview.style.maxWidth = '150px';
                    preview.style.marginTop = '10px';
                    const existingPreview = input.parentElement.querySelector('img.preview');
                    if (existingPreview) existingPreview.remove();
                    preview.classList.add('preview');
                    input.parentElement.appendChild(preview);
                };
                reader.readAsDataURL(file);
            }
        });
    });
});

// Cerrar el menú al hacer clic en un enlace
const navLinks = document.querySelectorAll('nav ul li a');
if (navLinks) {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// Cambiar clase del encabezado al deslizar solo en la página de inicio
if (document.body.classList.contains('home')) {
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) { // Activa después de deslizar 50px
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

// Carrusel para el Hero
const slides = document.querySelectorAll('.hero-slide');
const progressBars = document.querySelectorAll('.progress-bar');
let currentSlide = 0;

function showSlide(index) {
    // Actualizar diapositivas
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    // Reiniciar todas las barras de progreso
    progressBars.forEach((bar) => {
        bar.classList.remove('active');
        const fill = bar.querySelector('.progress-bar-fill');
        fill.style.transition = 'none'; // Desactivar transición para reinicio instantáneo
        fill.style.width = '0'; // Reiniciar a 0
    });

    // Activar la barra de progreso correspondiente
    const currentBar = progressBars[index];
    currentBar.classList.add('active');
    const currentFill = currentBar.querySelector('.progress-bar-fill');
    
    // Forzar reflujo para reiniciar la animación
    currentFill.offsetWidth; // Esto asegura que la animación se reinicie
    
    // Iniciar la animación de llenado con transición
    currentFill.style.transition = 'width 5s linear';
    currentFill.style.width = '100%';
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Iniciar el carrusel
showSlide(currentSlide);
setInterval(nextSlide, 5000); // Cambiar cada 5 segundos
}

document.addEventListener('DOMContentLoaded', () => {
    // Manejo de pestañas, desplegable y flechas para experiencias
    const tabs = document.querySelectorAll('.tab-button');
    const select = document.querySelector('#location-select');
    const contents = document.querySelectorAll('.location-content');
    const arrows = document.querySelectorAll('.arrow');

// Función para actualizar la alineación y visibilidad de flechas
function updateExperiencesAlignment(locationId) {
    console.log('Actualizando alineación para:', locationId); // Depuración
    const experiences = document.querySelector(`#${locationId} .experiences`);
    if (!experiences) {
        console.error('Contenedor .experiences no encontrado para', locationId);
        return;
    }
    const wrapper = experiences.closest('.experiences-wrapper');
    const experienceCount = experiences.querySelectorAll('.experience').length;
    console.log('Número de experiencias:', experienceCount); // Depuración
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // En móvil, activar desplazamiento táctil solo con más de 1 experiencia
        if (experienceCount <= 1) {
            experiences.classList.add('center-experiences');
            experiences.classList.remove('scrollable');
            wrapper.classList.add('no-scroll');
        } else {
            experiences.classList.remove('center-experiences');
            experiences.classList.add('scrollable');
            wrapper.classList.remove('no-scroll');
        }
    } else {
        // En escritorio, centrar siempre, pero activar desplazamiento con más de 2 experiencias
        experiences.classList.add('center-experiences');
        if (experienceCount > 2) {
            experiences.classList.add('scrollable');
            wrapper.classList.remove('no-scroll');
        } else {
            experiences.classList.remove('scrollable');
            wrapper.classList.add('no-scroll');
        }
    }
}

    // Función para cambiar la ubicación activa
    function setActiveLocation(locationId) {
        console.log('Cambiando ubicación a:', locationId); // Depuración
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.location === locationId);
        });
        contents.forEach(content => {
            content.classList.toggle('active', content.id === locationId);
        });
        if (select) {
            select.value = locationId;
        }
        // Reset scroll position for the new location
        const activeContent = document.querySelector(`#${locationId} .experiences`);
        if (activeContent) {
            activeContent.scrollLeft = 0;
            console.log('Contenedor .experiences encontrado, scroll reiniciado');
            updateExperiencesAlignment(locationId);
        } else {
            console.error('Contenedor .experiences no encontrado para', locationId);
        }
    }

    // Evento para pestañas
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setActiveLocation(tab.dataset.location);
        });
    });

    // Evento para desplegable
    if (select) {
        select.addEventListener('change', () => {
            setActiveLocation(select.value);
        });
    }

    // Establecer ubicación inicial
    const initialTab = document.querySelector('.tab-button.active');
    if (initialTab) {
        setActiveLocation(initialTab.dataset.location);
    } else if (select) {
        setActiveLocation(select.value);
    }

    // Manejo de flechas de navegación
    if (arrows.length > 0) {
        console.log('Flechas encontradas:', arrows.length); // Depuración
        arrows.forEach(arrow => {
            arrow.addEventListener('click', () => {
                const direction = arrow.classList.contains('arrow-left') ? 'Izquierda' : 'Derecha';
                const locationId = arrow.dataset.location;
                console.log(`Flecha clicada: ${direction}, Location: ${locationId}`); // Depuración
                const experiences = document.querySelector(`#${locationId} .experiences`);
                if (!experiences) {
                    console.error('Contenedor .experiences no encontrado para', locationId);
                    return;
                }
                const scrollAmount = 320; // Ancho de una experiencia (300px) + gap (20px)
                const currentScroll = experiences.scrollLeft;
                const scrollWidth = experiences.scrollWidth;
                const clientWidth = experiences.closest('.experiences-wrapper').clientWidth;
                console.log('Posición actual del scroll:', currentScroll, 'ScrollWidth:', scrollWidth, 'ClientWidth:', clientWidth); // Depuración
                if (arrow.classList.contains('arrow-left')) {
                    experiences.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                    console.log('Desplazando a la izquierda', -scrollAmount);
                } else if (arrow.classList.contains('arrow-right')) {
                    experiences.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    console.log('Desplazando a la derecha', scrollAmount);
                }
            });
        });
    } else {
        console.warn('No se encontraron flechas con la clase .arrow');
    }

    // Resetear scroll y actualizar alineación al redimensionar la ventana
    window.addEventListener('resize', () => {
        const activeContent = document.querySelector('.location-content.active .experiences');
        if (activeContent) {
            activeContent.scrollLeft = 0;
            const locationId = activeContent.closest('.location-content').id;
            console.log('Scroll reiniciado al redimensionar ventana para', locationId);
            updateExperiencesAlignment(locationId);
        }
    });
    // Manejo del modal para experiencias
    const experienceLinks = document.querySelectorAll('.experience-link');
    const modal = document.getElementById('experience-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeModal = document.querySelector('.close-modal');
    let hoverTimer;

    // Función para abrir el modal
    function openModal(link) {
        const imageSrc = link.querySelector('img').src;
        const title = link.querySelector('h3').textContent;
        const description = link.querySelector('p').textContent;
        modalImage.src = imageSrc;
        modalImage.alt = title;
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modal.style.display = 'flex';
    }

    // Solo activar hover en computadoras (pantallas > 768px)
    if (window.matchMedia("(min-width: 769px)").matches) {
        experienceLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimer);
                hoverTimer = setTimeout(() => {
                    openModal(link);
                }, 2000);
            });

            link.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimer);
                // No cerrar el modal para permitir lectura
            });
        });
    }

    // Manejo del botón "Ver más"
    const viewMoreButtons = document.querySelectorAll('.view-more');
    viewMoreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const link = button.closest('.experience-link');
            openModal(link);
        });
    });

    // Cerrar modal al hacer clic en el botón de cierre
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cerrar modal al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
});
// ==================
// LÓGICA PARA PESTAÑAS DE FILTROS (COMPRAR/RENTAR)
// ==================
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    // 'venta' es el valor por defecto si no se especifica el parámetro
    const currentListingType = params.get('listing_type') || 'venta'; 

    const tabLinks = document.querySelectorAll('.tab-link');

    tabLinks.forEach(link => {
        if (link.dataset.listing === currentListingType) {
            link.classList.add('active');
        }
    });
});
// ==================
// LÓGICA PARA LOS CARRUSELES DE PROPIEDADES
// ==================
document.addEventListener('DOMContentLoaded', () => {
    function setupCarousel(carouselId, prevBtnId, nextBtnId) {
        const carousel = document.getElementById(carouselId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);

        if (!carousel || !prevBtn || !nextBtn) {
            return; // No hacer nada si los elementos no existen
        }

        const card = carousel.querySelector('.property-slide-card');
        if (!card) return;

        // Calcula cuánto desplazar (ancho de la tarjeta + gap)
        const scrollAmount = card.offsetWidth + 20;

        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    // Inicializar ambos carruseles
    setupCarousel('destacadas-carousel', 'destacadas-prev', 'destacadas-next');
    setupCarousel('renta-carousel', 'renta-prev', 'renta-next');
});