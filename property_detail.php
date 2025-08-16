<?php
include 'includes/config.php';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $pdo->prepare("SELECT * FROM properties WHERE id = :id AND status = 'disponible'");
$stmt->bindParam(':id', $id);
$stmt->execute();
$property = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$property) {
    header("Location: properties.php");
    exit;
}

// Recolectar todas las imágenes disponibles en un array limpio
$images = [];
if ($property['main_image']) {
    $images[] = $property['main_image'];
}
for ($i = 1; $i <= 15; $i++) {
    if (!empty($property["thumbnail$i"])) {
        $images[] = $property["thumbnail$i"];
    }
}
$main_gallery_images = array_slice($images, 0, 5);
$total_images = count($images);

// --- Lógica para Propiedades Similares ---
$similar_stmt = $pdo->prepare("SELECT * FROM properties WHERE category = :category AND id != :id AND status = 'disponible' ORDER BY RAND() LIMIT 3");
$similar_stmt->execute(['category' => $property['category'], 'id' => $id]);
$similar_properties = $similar_stmt->fetchAll(PDO::FETCH_ASSOC);

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($property['title']); ?> - DOMABLY</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body class="property-detail-page">
    <?php include 'includes/header.php'; ?>

    <main class="property-detail">
        <div class="container">
            <div class="property-detail__header">
                <a href="javascript:history.back()" class="property-detail__back-link">← Volver a la búsqueda</a>
            </div>

            <?php if (!empty($main_gallery_images)): ?>
            <section class="gallery">
                <div class="gallery__layout">
                    <?php foreach($main_gallery_images as $index => $image_src): ?>
                        <div class="gallery__item <?php if($index == 0) echo 'gallery__item--large'; else echo 'gallery__item--thumb'; ?>" data-index="<?php echo $index; ?>">
                            <img src="<?php echo htmlspecialchars($image_src); ?>" alt="Vista <?php echo $index + 1; ?> de <?php echo htmlspecialchars($property['title']); ?>" class="gallery__image">
                            <?php if ($index === count($main_gallery_images) - 1 && $total_images > count($main_gallery_images)): ?>
                                <div class="gallery__overlay">
                                <div class="gallery__photo-count">
                                    <?php // --- INICIO DEL CAMBIO --- ?>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-camera"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                    <span><?php echo $total_images; ?> Fotos</span>
                                </div>
                                </div>
                            <?php endif; ?>  
                        </div>
                    <?php endforeach; ?>
                </div>
                <div class="gallery__actions">
                    <button class="btn btn-secondary">Guardar</button>
                    <button class="btn btn-secondary">Compartir</button>
                </div>
            </section>
            <?php endif; ?>

            <div class="property-detail__main-content">
                <article class="property-detail__info-wrapper">
                    <div class="property-info">
                        <div class="property-info__header">
                            <h1 class="property-info__title"><?php echo htmlspecialchars($property['title']); ?></h1>
                            <p class="property-info__location">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
                                <?php echo htmlspecialchars($property['location']); ?>
                            </p>
                        </div>
                        <p class="property-info__price">
                            $<?php echo number_format($property['price'], 2); ?> MXN
                            <?php if ($property['listing_type'] == 'renta'): ?>
                                <span class="property-info__price-period">/ Mes</span>
                            <?php endif; ?>
                        </p>
                        <div class="property-info__description">
                            <h3>Descripción</h3>
                            <p><?php echo nl2br(htmlspecialchars($property['description'])); ?></p>
                        </div>
                        <div class="property-info__features">
                            <h3>Características</h3>
                            <ul class="property-info__features-list">
                                <?php
                                $features = json_decode($property['features'], true) ?: [];

                                // --- Lógica para CASAS ---
                                if ($property['category'] === 'casas') {
                                    if (!empty($features['recamaras'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_bed.png" alt="Recámaras"><span>' . htmlspecialchars($features['recamaras']) . ' Recámaras</span></li>';
                                    if (!empty($features['banos'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_bath.png" alt="Baños"><span>' . htmlspecialchars($features['banos']) . ' Baños</span></li>';
                                    if (!empty($features['estacionamientos'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_parking.png" alt="Estacionamientos"><span>' . htmlspecialchars($features['estacionamientos']) . ' Estacionamientos</span></li>';
                                    if (!empty($features['superficie_construida'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_built_area.png" alt="Construcción"><span>' . htmlspecialchars($features['superficie_construida']) . ' m² Construidos</span></li>';
                                    if (!empty($features['superficie_total'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_total_area.png" alt="Terreno"><span>' . htmlspecialchars($features['superficie_total']) . ' m² Terreno</span></li>';
                                    if (!empty($features['niveles'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_floors.png" alt="Niveles"><span>' . htmlspecialchars($features['niveles']) . ' Niveles</span></li>';
                                    if (!empty($features['terraza']) && $features['terraza'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_terrace.png" alt="Terraza"><span>Terraza</span></li>';
                                    if (!empty($features['alberca']) && $features['alberca'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_pool.png" alt="Alberca"><span>Alberca</span></li>';
                                    if (!empty($features['amueblada']) && $features['amueblada'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_furniture.png" alt="Amueblada"><span>Amueblada</span></li>';
                                }
                                // --- Lógica para DEPARTAMENTOS ---
                                elseif ($property['category'] === 'departamentos') {
                                    if (!empty($features['recamaras'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_bed.png" alt="Recámaras"><span>' . htmlspecialchars($features['recamaras']) . ' Recámaras</span></li>';
                                    if (!empty($features['banos'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_bath.png" alt="Baños"><span>' . htmlspecialchars($features['banos']) . ' Baños</span></li>';
                                    if (!empty($features['estacionamientos'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_parking.png" alt="Estacionamientos"><span>' . htmlspecialchars($features['estacionamientos']) . ' Estacionamientos</span></li>';
                                    if (!empty($features['superficie_total'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_built_area.png" alt="Construcción"><span>' . htmlspecialchars($features['superficie_total']) . ' m² Totales</span></li>';
                                    if (!empty($features['piso'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_floors.png" alt="Piso"><span>Piso ' . htmlspecialchars($features['piso']) . '</span></li>';
                                    if (!empty($features['elevador']) && $features['elevador'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_elevator.png" alt="Elevador"><span>Elevador</span></li>';
                                    if (!empty($features['amenidades']['gimnasio']) && $features['amenidades']['gimnasio'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_gym.png" alt="Gimnasio"><span>Gimnasio</span></li>';
                                    if (!empty($features['amenidades']['alberca']) && $features['amenidades']['alberca'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_pool.png" alt="Alberca"><span>Alberca</span></li>';
                                    if (!empty($features['amenidades']['salon_eventos']) && $features['amenidades']['salon_eventos'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_event_hall.png" alt="Salón de Eventos"><span>Salón de Eventos</span></li>';
                                }
                                // --- Lógica para TERRENOS ---
                                elseif ($property['category'] === 'terrenos') {
                                    if (!empty($features['superficie_total'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_total_area.png" alt="Superficie"><span>' . htmlspecialchars($features['superficie_total']) . '</span></li>';
                                    if (!empty($features['frente'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_dimensions.png" alt="Frente"><span>' . htmlspecialchars($features['frente']) . 'm de Frente</span></li>';
                                    if (!empty($features['fondo'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_dimensions.png" alt="Fondo"><span>' . htmlspecialchars($features['fondo']) . 'm de Fondo</span></li>';
                                    if (!empty($features['tipo_suelo'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_soil.png" alt="Tipo de Suelo"><span>Suelo: ' . htmlspecialchars($features['tipo_suelo']) . '</span></li>';
                                    if (!empty($features['tipo_propiedad'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_property_type.png" alt="Tipo de Propiedad"><span>Propiedad ' . ucfirst(htmlspecialchars($features['tipo_propiedad'])) . '</span></li>';
                                    if (!empty($features['servicios']['luz']) && $features['servicios']['luz'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_electricity.png" alt="Luz"><span>Servicio de Luz</span></li>';
                                    if (!empty($features['servicios']['agua']) && $features['servicios']['agua'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_water.png" alt="Agua"><span>Servicio de Agua</span></li>';
                                    if (!empty($features['servicios']['drenaje']) && $features['servicios']['drenaje'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_drainage.png" alt="Drenaje"><span>Drenaje</span></li>';
                                }
                                // --- Lógica para DESARROLLOS ---
                                elseif ($property['category'] === 'desarrollos') {
                                    if (!empty($features['num_unidades'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_units.png" alt="Unidades"><span>' . htmlspecialchars($features['num_unidades']) . ' Unidades</span></li>';
                                    if (!empty($features['superficie_min'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_total_area.png" alt="Superficie Mínima"><span>Desde ' . htmlspecialchars($features['superficie_min']) . ' m²</span></li>';
                                    if (!empty($features['superficie_max'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_total_area.png" alt="Superficie Máxima"><span>Hasta ' . htmlspecialchars($features['superficie_max']) . ' m²</span></li>';
                                    if (!empty($features['rango_recamaras'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_bed.png" alt="Recámaras"><span>' . htmlspecialchars($features['rango_recamaras']) . ' Recámaras</span></li>';
                                    if (!empty($features['rango_banos'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_bath.png" alt="Baños"><span>' . htmlspecialchars($features['rango_banos']) . ' Baños</span></li>';
                                    if (!empty($features['etapas'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_timeline.png" alt="Etapa"><span>Etapa: ' . ucfirst(str_replace('_', ' ', htmlspecialchars($features['etapas']))) . '</span></li>';
                                    if (!empty($features['entrega_estimada'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_calendar.png" alt="Entrega"><span>Entrega: ' . htmlspecialchars($features['entrega_estimada']) . '</span></li>';
                                    if (!empty($features['pet_friendly']) && $features['pet_friendly'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_pet_friendly.png" alt="Pet Friendly"><span>Pet Friendly</span></li>';
                                    if (!empty($features['amenidades']['alberca']) && $features['amenidades']['alberca'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_pool.png" alt="Alberca"><span>Alberca</span></li>';
                                    if (!empty($features['amenidades']['areas_verdes']) && $features['amenidades']['areas_verdes'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_green_areas.png" alt="Áreas Verdes"><span>Áreas Verdes</span></li>';
                                    if (!empty($features['amenidades']['gimnasio']) && $features['amenidades']['gimnasio'] === 'Sí') echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_gym.png" alt="Gimnasio"><span>Gimnasio</span></li>';
                                }
                                ?>
                            </ul>
                        </div>
                    </div>
                </article>
                
                <aside class="property-detail__contact-wrapper">
                    <div class="contact-card">
                        <div class="contact-card__form-section">
                            <h3 class="contact-card__title">Contacta al anunciante</h3>
                            <form action="contact.php" method="POST" class="contact-card__form">
                                <input type="hidden" name="property_id" value="<?php echo $property['id']; ?>">
                                <input type="hidden" name="property_title" value="<?php echo htmlspecialchars($property['title']); ?>">
                                            
                                <div class="contact-card__form-group">
                                    <label for="contact-name" class="sr-only">Nombre</label>
                                    <input type="text" id="contact-name" name="name" placeholder="Nombre" required class="contact-card__input">
                                </div>
                                <div class="contact-card__form-group">
                                    <label for="contact-email" class="sr-only">Email</label>
                                    <input type="email" id="contact-email" name="email" placeholder="Email" required class="contact-card__input">
                                </div>
                                <div class="contact-card__form-group">
                                    <label for="contact-phone" class="sr-only">Teléfono</label>
                                    <input type="tel" id="contact-phone" name="phone" placeholder="Teléfono" required class="contact-card__input">
                                </div>
                                <div class="contact-card__form-group">
                                    <label for="contact-message" class="sr-only">Mensaje</label>
                                    <textarea id="contact-message" name="message" rows="4" required class="contact-card__textarea"><?php echo "¡Hola! Quiero que se comuniquen conmigo por este inmueble: " . htmlspecialchars($property['title']) . ". Gracias."; ?></textarea>
                                </div>
                                            
                                <button type="submit" class="btn btn-primary contact-card__button">
                                    Contactar
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                </button>
                            </form>
                                            
                            <a href="https://wa.me/5219997632818?text=Estoy%20interesado%20en%20la%20propiedad:%20<?php echo urlencode($property['title']); ?>" class="btn btn-whatsapp contact-card__button" target="_blank">
                                Contactar por WhatsApp
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.96c.25.13.43.2.5.25.13.06.16.19.16.38 0 .13-.03.25-.09.38-.19.31-.44.56-.75.75-.31.19-.69.28-1.13.28-.25 0-.5-.06-.75-.19-.5-.25-.94-.59-1.31-1.03-.44-.44-.81-.94-1.13-1.5-.31-.56-.47-1.16-.47-1.78 0-.25.03-.5.09-.75.06-.25.16-.47.28-.66.13-.19.28-.31.47-.38.19-.06.31-.09.38-.09.25 0 .47.03.66.09.19.06.31.19.38.31s.09.31.09.53c0 .06-.01.16-.03.25-.01.1-.03.19-.06.28-.03.09-.06.16-.09.22a.86.86 0 00-.19.28c-.06.13-.09.22-.09.28 0 .13.03.22.09.28.16.19.38.35.66.5.28.16.5.28.75.38.25.09.44.13.56.13.13 0 .25-.01.38-.03a.88.88 0 00.28-.16c.09-.06.16-.09.22-.09.16-.06.28-.09.31-.09.25-.03.5-.03.75.03.25.06.44.13.56.19zM12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18.13a8.13 8.13 0 118.13-8.13A8.14 8.14 0 0112 20.13z"></path></svg>
                            </a>
                            <p class="contact-card__legal">Al enviar estás aceptando los Términos y condiciones de Uso y la Política de Privacidad.</p>
                        </div>
                                            
                        <div class="contact-card__agent-section">
                            <img src="assets/images/iconcaracteristic/icono_doma.png" alt="Logo Domably" class="contact-card__agent-logo">
                            <div class="contact-card__agent-details">
                                <p class="contact-card__agent-name">Domably</p>
                                <div class="contact-card__phone-wrapper" id="phone-wrapper">
                                    <span class="contact-card__phone-number" data-full-number="999-763-2818">999-XXX-XX18</span>
                                    <button type="button" class="contact-card__phone-reveal-btn" id="reveal-phone-btn">
                                        Ver teléfono
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <?php if ($property['latitude'] && $property['longitude']): ?>
            <section class="property-detail__map">
                <h3>Ubicación</h3>
                <iframe src="https://maps.google.com/maps?q=<?php echo urlencode($property['latitude'] . ',' . $property['longitude']); ?>&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
            </section>
            <?php endif; ?>

            <?php if (!empty($similar_properties)): ?>
            <section class="recommendations">
                <h2 class="recommendations__title">Propiedades Similares</h2>
                <div class="recommendations__grid">
                    <?php foreach ($similar_properties as $similar_property): ?>
                        <div class="property-card">
                            <a href="property_detail.php?id=<?php echo $similar_property['id']; ?>" class="property-card__link">
                                <div class="property-card__image-container">
                                    <img class="property-card__image" src="<?php echo htmlspecialchars($similar_property['main_image']); ?>" alt="<?php echo htmlspecialchars($similar_property['title']); ?>">
                                </div>
                                <div class="property-card__content">
                                    <h3 class="property-card__title"><?php echo htmlspecialchars($similar_property['title']); ?></h3>
                                </div>
                                <div class="property-card__footer">
                                    <p class="property-card__price">$<?php echo number_format($similar_property['price'], 2); ?> MXN</p>
                                </div>
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>
            <?php endif; ?>
        </div>
    </main>

    <div class="lightbox" id="property-lightbox">
        <div class="lightbox__overlay"></div>
        <div class="lightbox__container">
            <div class="lightbox__grid-view" id="lightbox-grid-view">
                <div class="lightbox__header">
                    <button class="lightbox__back-button" id="lightbox-grid-back">← Volver</button>
                    <h3>Todas las fotos</h3>
                    <button class="lightbox__close" aria-label="Cerrar">×</button>
                </div>
                <div class="lightbox__grid-container" id="lightbox-grid-container">
                    </div>
            </div>

            <div class="lightbox__slider-view" id="lightbox-slider-view">
                <div class="lightbox__header">
                    <button class="lightbox__back-button" id="lightbox-slider-back">← Ver todas</button>
                    <button class="lightbox__close" aria-label="Cerrar">×</button>
                </div>
                <div class="lightbox__image-container">
                    <img src="" alt="Vista ampliada de la propiedad" id="lightbox-main-image">
                </div>
                <span class="lightbox__counter" id="lightbox-counter"></span>
                                
                <button class="lightbox__nav lightbox__nav--prev" aria-label="Anterior">❮</button>
                <button class="lightbox__nav lightbox__nav--next" aria-label="Siguiente">❯</button>
            </div>
        </div>
    </div>
    <?php include 'includes/footer.php'; ?>

    <script>
        const propertyImages = <?php echo json_encode($images); ?>;
    </script>
    <script src="assets/js/main.js"></script>
</body>
</html>