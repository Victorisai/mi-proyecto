(function () {
    document.addEventListener('DOMContentLoaded', () => {
        if (!document.body.classList.contains('property-detail-page')) {
            return;
        }

        const API_BASE_URL = 'http://localhost:3000/api';
        const PLACEHOLDER_IMAGE = 'assets/images/hero/placeholder.jpg';
        const currencyFormatter = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const urlParams = new URLSearchParams(window.location.search);
        const propertyIdParam = urlParams.get('id');
        const propertyId = Number.parseInt(propertyIdParam ?? '', 10);

        const contentContainer = document.getElementById('property-content');
        const gallerySection = document.getElementById('gallery-section');
        const galleryLayout = document.getElementById('gallery-layout');
        const breadcrumbListing = document.getElementById('breadcrumb-listing');
        const breadcrumbLocation = document.getElementById('breadcrumb-location');
        const breadcrumbCategory = document.getElementById('breadcrumb-category');
        const propertyTitleEl = document.getElementById('property-title');
        const propertyLocationEl = document.getElementById('property-location');
        const propertyPriceEl = document.getElementById('property-price');
        const propertyDescriptionEl = document.getElementById('property-description');
        const propertyFeaturesSection = document.getElementById('property-features-section');
        const propertyFeaturesList = document.getElementById('property-features');
        const propertyCodeEl = document.getElementById('property-code');
        const mapSection = document.getElementById('property-map-section');
        const mapFrame = document.getElementById('property-map-frame');
        const similarSection = document.getElementById('similar-section');
        const similarGrid = document.getElementById('similar-grid');
        const similarCarouselWrapper = document.getElementById('similar-carousel-wrapper');
        const footerYear = document.getElementById('footer-year');
        const errorContainer = document.getElementById('property-error');
        const errorMessageEl = document.getElementById('property-error-message');
        const contactPropertyId = document.getElementById('contact-property-id');
        const contactPropertyTitle = document.getElementById('contact-property-title');
        const contactMessage = document.getElementById('contact-message');
        const contactWhatsapp = document.getElementById('contact-whatsapp');

        updateFooterYear(footerYear);

        if (contentContainer) {
            contentContainer.hidden = true;
        }

        if (!Number.isInteger(propertyId) || propertyId <= 0) {
            showError('Propiedad no encontrada.', contentContainer, errorContainer, errorMessageEl, similarSection);
            return;
        }

        fetchProperty(propertyId);

        async function fetchProperty(id) {
            try {
                const response = await fetch(`${API_BASE_URL}/properties/${id}`);
                if (!response.ok) {
                    throw new Error('No se encontró la propiedad');
                }
                const data = await response.json();
                renderProperty(data);
            } catch (error) {
                console.error('Error al cargar la propiedad:', error);
                showError('No se pudo cargar la propiedad solicitada.', contentContainer, errorContainer, errorMessageEl, similarSection);
            }
        }

        function renderProperty(data) {
            const property = data?.property ?? null;
            const images = Array.isArray(data?.images) ? data.images : [];
            const similarProperties = Array.isArray(data?.similarProperties) ? data.similarProperties : [];

            if (!property) {
                showError('Propiedad no encontrada.', contentContainer, errorContainer, errorMessageEl, similarSection);
                return;
            }

            const title = sanitizeString(property.title) || 'Propiedad sin título';
            document.title = `${title} - DOMABLY`;

            if (propertyTitleEl) {
                propertyTitleEl.textContent = title;
            }

            if (propertyLocationEl) {
                const locationText = sanitizeString(property.location) || 'Ubicación no disponible';
                propertyLocationEl.textContent = locationText;
            }

            if (propertyPriceEl) {
                if (property.price !== null && property.price !== undefined && property.price !== '') {
                    const formattedPrice = currencyFormatter.format(Number(property.price));
                    const listingType = sanitizeString(property.listing_type).toLowerCase();
                    let priceHtml = `${formattedPrice} MXN`;
                    if (listingType === 'renta') {
                        priceHtml += ' <span class="property-info__price-period">/ Mes</span>';
                    }
                    propertyPriceEl.innerHTML = priceHtml;
                } else {
                    propertyPriceEl.textContent = 'Precio no disponible';
                }
            }

            if (propertyDescriptionEl) {
                const descriptionText = sanitizeString(property.description) || 'No hay descripción disponible.';
                propertyDescriptionEl.innerHTML = formatMultiline(descriptionText);
            }

            const parsedFeatures = parseFeatures(property.features);
            renderFeatures(property.category, parsedFeatures, propertyFeaturesSection, propertyFeaturesList);

            if (propertyCodeEl) {
                propertyCodeEl.textContent = property.id ?? '';
            }

            if (contactPropertyId) {
                contactPropertyId.value = property.id ?? '';
            }

            if (contactPropertyTitle) {
                contactPropertyTitle.value = title;
            }

            if (contactMessage) {
                contactMessage.value = `¡Hola! Quiero que se comuniquen conmigo por este inmueble: ${title}. Gracias.`;
            }

            if (contactWhatsapp) {
                const whatsappText = `Estoy interesado en la propiedad: ${title}`;
                contactWhatsapp.href = `https://wa.me/5219997632818?text=${encodeURIComponent(whatsappText)}`;
            }

            renderBreadcrumbs(property, breadcrumbListing, breadcrumbLocation, breadcrumbCategory);
            renderGallery(images, title, gallerySection, galleryLayout);
            renderMap(property, mapSection, mapFrame);
            renderSimilarProperties(similarProperties, similarSection, similarGrid, similarCarouselWrapper, currencyFormatter, PLACEHOLDER_IMAGE);

            if (contentContainer) {
                contentContainer.hidden = false;
            }

            if (errorContainer) {
                errorContainer.hidden = true;
            }
        }
    });

    function renderBreadcrumbs(property, listingEl, locationEl, categoryEl) {
        const listingType = sanitizeString(property?.listing_type).toLowerCase();
        const listingLabel = listingType ? capitalizeFirst(listingType) : 'Propiedades';
        const location = sanitizeString(property?.location);
        const category = sanitizeString(property?.category);

        if (listingEl) {
            listingEl.textContent = listingLabel;
            listingEl.href = listingType ? `properties.html?listing_type=${encodeURIComponent(listingType)}` : 'properties.html';
        }

        if (locationEl) {
            locationEl.textContent = location || 'Ubicación';
            locationEl.href = location ? `properties.html?location=${encodeURIComponent(location)}` : 'properties.html';
        }

        if (categoryEl) {
            const categoryLower = category ? category.toLowerCase() : '';
            categoryEl.textContent = category ? capitalizeFirst(categoryLower) : 'Categoría';
            categoryEl.href = categoryLower ? `properties.html?category=${encodeURIComponent(categoryLower)}` : 'properties.html';
        }
    }

    function renderGallery(images, title, gallerySection, galleryLayout) {
        if (!gallerySection || !galleryLayout) {
            return;
        }

        galleryLayout.innerHTML = '';

        if (!Array.isArray(images) || images.length === 0) {
            gallerySection.hidden = true;
            window.propertyImages = [];
            return;
        }

        const mainGalleryImages = images.slice(0, 5);
        const totalImages = images.length;

        mainGalleryImages.forEach((imageSrc, index) => {
            const item = document.createElement('div');
            item.className = `gallery__item ${index === 0 ? 'gallery__item--large' : 'gallery__item--thumb'}`;
            item.dataset.index = String(index);

            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = `Vista ${index + 1} de ${title}`;
            img.className = 'gallery__image';
            item.appendChild(img);

            if (index === mainGalleryImages.length - 1 && totalImages > mainGalleryImages.length) {
                const overlay = document.createElement('div');
                overlay.className = 'gallery__overlay';
                overlay.innerHTML = `
                    <div class="gallery__photo-count">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-camera"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        <span>${totalImages} Fotos</span>
                    </div>`;
                item.appendChild(overlay);
            }

            galleryLayout.appendChild(item);
        });

        gallerySection.hidden = false;
        window.propertyImages = [...images];
        document.dispatchEvent(new CustomEvent('propertyImagesLoaded', { detail: { images: [...images] } }));
    }

    function renderMap(property, mapSection, mapFrame) {
        if (!mapSection || !mapFrame) {
            return;
        }

        const latitude = parseFloat(property?.latitude);
        const longitude = parseFloat(property?.longitude);

        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            const coords = `${latitude},${longitude}`;
            mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(coords)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
            mapSection.hidden = false;
        } else {
            mapFrame.src = '';
            mapSection.hidden = true;
        }
    }

    function renderSimilarProperties(similarProperties, similarSection, similarGrid, carouselWrapper, currencyFormatter, placeholderImage) {
        if (!similarSection || !similarGrid || !carouselWrapper) {
            return;
        }

        similarGrid.innerHTML = '';

        if (!Array.isArray(similarProperties) || similarProperties.length === 0) {
            similarSection.hidden = true;
            return;
        }

        similarProperties.forEach((property) => {
            const card = document.createElement('div');
            card.className = 'property-card';

            const link = document.createElement('a');
            link.href = `property_detail.html?id=${property.id}`;
            link.className = 'property-card__link';

            const imageContainer = document.createElement('div');
            imageContainer.className = 'property-card__image-container';

            const image = document.createElement('img');
            image.className = 'property-card__image';
            image.src = typeof property.main_image === 'string' && property.main_image.trim().length > 0 ? property.main_image : placeholderImage;
            image.alt = sanitizeString(property.title) || 'Propiedad similar';
            imageContainer.appendChild(image);

            const listingBadge = document.createElement('div');
            listingBadge.className = 'property-card__badge property-card__badge--listing';
            listingBadge.textContent = capitalizeFirst(sanitizeString(property.listing_type).toLowerCase());
            imageContainer.appendChild(listingBadge);

            const categoryBadge = document.createElement('div');
            categoryBadge.className = 'property-card__badge property-card__badge--category';
            categoryBadge.textContent = capitalizeFirst(sanitizeString(property.category).toLowerCase());
            imageContainer.appendChild(categoryBadge);

            const content = document.createElement('div');
            content.className = 'property-card__content';
            const title = document.createElement('h3');
            title.className = 'property-card__title';
            title.textContent = sanitizeString(property.title) || 'Propiedad';
            content.appendChild(title);

            const footer = document.createElement('div');
            footer.className = 'property-card__footer';
            const price = document.createElement('p');
            price.className = 'property-card__price';
            if (property.price !== null && property.price !== undefined && property.price !== '') {
                price.textContent = `${currencyFormatter.format(Number(property.price))} MXN`;
            } else {
                price.textContent = 'Consultar precio';
            }
            footer.appendChild(price);

            link.appendChild(imageContainer);
            link.appendChild(content);
            link.appendChild(footer);
            card.appendChild(link);
            similarGrid.appendChild(card);
        });

        similarSection.hidden = false;
        carouselWrapper.scrollLeft = 0;

        const prevBtn = document.getElementById('similar-prev');
        const nextBtn = document.getElementById('similar-next');
        const firstCard = carouselWrapper.querySelector('.property-card');

        if (!firstCard || !prevBtn || !nextBtn) {
            return;
        }

        const scrollAmount = firstCard.offsetWidth + 30;
        prevBtn.onclick = () => {
            carouselWrapper.scrollLeft -= scrollAmount;
        };
        nextBtn.onclick = () => {
            carouselWrapper.scrollLeft += scrollAmount;
        };
    }

    function parseFeatures(features) {
        if (!features) {
            return {};
        }
        if (typeof features === 'string') {
            try {
                const parsed = JSON.parse(features);
                return typeof parsed === 'object' && parsed !== null ? parsed : {};
            } catch (error) {
                return {};
            }
        }
        if (typeof features === 'object') {
            return features;
        }
        return {};
    }

    function renderFeatures(category, features, sectionEl, listEl) {
        if (!sectionEl || !listEl) {
            return;
        }

        listEl.innerHTML = '';
        const normalizedCategory = sanitizeString(category).toLowerCase();
        const featureItems = [];

        const addFeature = (condition, icon, alt, label) => {
            if (!condition) {
                return;
            }
            featureItems.push({ icon, alt, label });
        };

        const hasValue = (value) => {
            if (value === null || value === undefined) {
                return false;
            }
            const stringValue = String(value).trim();
            return stringValue.length > 0 && stringValue !== '0';
        };

        const isAffirmative = (value) => {
            if (typeof value !== 'string') {
                return false;
            }
            const normalized = value.trim().toLowerCase();
            return normalized === 'sí' || normalized === 'si' || normalized === 'yes';
        };

        const featuresData = features ?? {};

        if (normalizedCategory === 'casas') {
            addFeature(hasValue(featuresData.recamaras), 'assets/images/iconcaracteristic/icon_bed.png', 'Recámaras', `${featuresData.recamaras} Recámaras`);
            addFeature(hasValue(featuresData.banos), 'assets/images/iconcaracteristic/icon_bath.png', 'Baños', `${featuresData.banos} Baños`);
            addFeature(hasValue(featuresData.estacionamientos), 'assets/images/iconcaracteristic/icon_parking.png', 'Estacionamientos', `${featuresData.estacionamientos} Estacionamientos`);
            addFeature(hasValue(featuresData.superficie_construida), 'assets/images/iconcaracteristic/icon_built_area.png', 'Construcción', `${featuresData.superficie_construida} m² Construidos`);
            addFeature(hasValue(featuresData.superficie_total), 'assets/images/iconcaracteristic/icon_total_area.png', 'Terreno', `${featuresData.superficie_total} m² Terreno`);
            addFeature(hasValue(featuresData.niveles), 'assets/images/iconcaracteristic/icon_floors.png', 'Niveles', `${featuresData.niveles} Niveles`);
            addFeature(isAffirmative(featuresData.terraza), 'assets/images/iconcaracteristic/icon_terrace.png', 'Terraza', 'Terraza');
            addFeature(isAffirmative(featuresData.alberca), 'assets/images/iconcaracteristic/icon_pool.png', 'Alberca', 'Alberca');
            addFeature(isAffirmative(featuresData.amueblada), 'assets/images/iconcaracteristic/icon_furniture.png', 'Amueblada', 'Amueblada');
        } else if (normalizedCategory === 'departamentos') {
            addFeature(hasValue(featuresData.recamaras), 'assets/images/iconcaracteristic/icon_bed.png', 'Recámaras', `${featuresData.recamaras} Recámaras`);
            addFeature(hasValue(featuresData.banos), 'assets/images/iconcaracteristic/icon_bath.png', 'Baños', `${featuresData.banos} Baños`);
            addFeature(hasValue(featuresData.estacionamientos), 'assets/images/iconcaracteristic/icon_parking.png', 'Estacionamientos', `${featuresData.estacionamientos} Estacionamientos`);
            addFeature(hasValue(featuresData.superficie_total), 'assets/images/iconcaracteristic/icon_built_area.png', 'Superficie total', `${featuresData.superficie_total} m² Totales`);
            addFeature(hasValue(featuresData.piso), 'assets/images/iconcaracteristic/icon_floors.png', 'Piso', `Piso ${featuresData.piso}`);
            addFeature(isAffirmative(featuresData.elevador), 'assets/images/iconcaracteristic/icon_elevator.png', 'Elevador', 'Elevador');
            addFeature(isAffirmative(featuresData?.amenidades?.gimnasio), 'assets/images/iconcaracteristic/icon_gym.png', 'Gimnasio', 'Gimnasio');
            addFeature(isAffirmative(featuresData?.amenidades?.alberca), 'assets/images/iconcaracteristic/icon_pool.png', 'Alberca', 'Alberca');
            addFeature(isAffirmative(featuresData?.amenidades?.salon_eventos), 'assets/images/iconcaracteristic/icon_event_hall.png', 'Salón de eventos', 'Salón de Eventos');
        } else if (normalizedCategory === 'terrenos') {
            addFeature(hasValue(featuresData.superficie_total), 'assets/images/iconcaracteristic/icon_total_area.png', 'Superficie', `${featuresData.superficie_total}`);
            addFeature(hasValue(featuresData.frente), 'assets/images/iconcaracteristic/icon_dimensions.png', 'Frente', `${featuresData.frente}m de Frente`);
            addFeature(hasValue(featuresData.fondo), 'assets/images/iconcaracteristic/icon_dimensions.png', 'Fondo', `${featuresData.fondo}m de Fondo`);
            addFeature(hasValue(featuresData.tipo_suelo), 'assets/images/iconcaracteristic/icon_soil.png', 'Tipo de suelo', `Suelo: ${featuresData.tipo_suelo}`);
            addFeature(hasValue(featuresData.tipo_propiedad), 'assets/images/iconcaracteristic/icon_property_type.png', 'Tipo de propiedad', `Propiedad ${capitalizeFirst(String(featuresData.tipo_propiedad))}`);
            addFeature(isAffirmative(featuresData?.servicios?.luz), 'assets/images/iconcaracteristic/icon_electricity.png', 'Servicio de luz', 'Servicio de Luz');
            addFeature(isAffirmative(featuresData?.servicios?.agua), 'assets/images/iconcaracteristic/icon_water.png', 'Servicio de agua', 'Servicio de Agua');
            addFeature(isAffirmative(featuresData?.servicios?.drenaje), 'assets/images/iconcaracteristic/icon_drainage.png', 'Drenaje', 'Drenaje');
        } else if (normalizedCategory === 'desarrollos') {
            addFeature(hasValue(featuresData.num_unidades), 'assets/images/iconcaracteristic/icon_units.png', 'Unidades', `${featuresData.num_unidades} Unidades`);
            addFeature(hasValue(featuresData.superficie_min), 'assets/images/iconcaracteristic/icon_total_area.png', 'Superficie mínima', `Desde ${featuresData.superficie_min} m²`);
            addFeature(hasValue(featuresData.superficie_max), 'assets/images/iconcaracteristic/icon_total_area.png', 'Superficie máxima', `Hasta ${featuresData.superficie_max} m²`);
            addFeature(hasValue(featuresData.rango_recamaras), 'assets/images/iconcaracteristic/icon_bed.png', 'Recámaras', `${featuresData.rango_recamaras} Recámaras`);
            addFeature(hasValue(featuresData.rango_banos), 'assets/images/iconcaracteristic/icon_bath.png', 'Baños', `${featuresData.rango_banos} Baños`);
            if (hasValue(featuresData.etapas)) {
                const etapa = String(featuresData.etapas).replace(/_/g, ' ');
                addFeature(true, 'assets/images/iconcaracteristic/icon_timeline.png', 'Etapa', `Etapa: ${capitalizeFirst(etapa)}`);
            }
            addFeature(hasValue(featuresData.entrega_estimada), 'assets/images/iconcaracteristic/icon_calendar.png', 'Entrega estimada', `Entrega: ${featuresData.entrega_estimada}`);
            addFeature(isAffirmative(featuresData.pet_friendly), 'assets/images/iconcaracteristic/icon_pet_friendly.png', 'Pet friendly', 'Pet Friendly');
            addFeature(isAffirmative(featuresData?.amenidades?.alberca), 'assets/images/iconcaracteristic/icon_pool.png', 'Alberca', 'Alberca');
            addFeature(isAffirmative(featuresData?.amenidades?.areas_verdes), 'assets/images/iconcaracteristic/icon_green_areas.png', 'Áreas verdes', 'Áreas Verdes');
            addFeature(isAffirmative(featuresData?.amenidades?.gimnasio), 'assets/images/iconcaracteristic/icon_gym.png', 'Gimnasio', 'Gimnasio');
        }

        if (featureItems.length === 0) {
            sectionEl.hidden = true;
            return;
        }

        sectionEl.hidden = false;
        featureItems.forEach((item) => {
            const listItem = document.createElement('li');
            listItem.className = 'property-info__feature-item';

            const icon = document.createElement('img');
            icon.src = item.icon;
            icon.alt = item.alt;
            listItem.appendChild(icon);

            const text = document.createElement('span');
            text.textContent = item.label;
            listItem.appendChild(text);

            listEl.appendChild(listItem);
        });
    }

    function sanitizeString(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value).trim();
    }

    function capitalizeFirst(value) {
        if (!value) {
            return '';
        }
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    function formatMultiline(text) {
        return escapeHtml(text).replace(/\r?\n/g, '<br>');
    }

    function escapeHtml(text) {
        if (typeof text !== 'string') {
            return '';
        }
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function showError(message, contentContainer, errorContainer, errorMessageEl, similarSection) {
        if (contentContainer) {
            contentContainer.hidden = true;
        }
        if (similarSection) {
            similarSection.hidden = true;
        }
        if (errorContainer) {
            errorContainer.hidden = false;
        }
        if (errorMessageEl) {
            errorMessageEl.textContent = message;
        }
        document.title = 'Propiedad no encontrada - DOMABLY';
    }

    function updateFooterYear(footerYearEl) {
        if (footerYearEl) {
            footerYearEl.textContent = String(new Date().getFullYear());
        }
    }
})();
