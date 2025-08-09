<?php
include 'includes/config.php';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $pdo->prepare("SELECT * FROM properties WHERE id = :id AND status = 'disponible'");
$stmt->bindParam(':id', $id);
$stmt->execute();
$property = $stmt->fetch(PDO::FETCH_ASSOC);

// Si la propiedad no se encuentra, redirigir o mostrar un mensaje.
if (!$property) {
    // Redirigir a la página de propiedades podría ser una buena opción.
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
$main_gallery_images = array_slice($images, 0, 5); // Tomamos las primeras 5 para la galería principal

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
                <a href="javascript:history.back()" class="property-detail__back-link">&larr; Volver a la búsqueda</a>
            </div>

            <?php if (!empty($main_gallery_images)): ?>
                <section class="gallery">
                    <div class="gallery__layout">
                        <div class="gallery__item gallery__item--large">
                            <img src="<?php echo htmlspecialchars($main_gallery_images[0]); ?>" alt="Vista principal de <?php echo htmlspecialchars($property['title']); ?>" class="gallery__image" id="main-gallery-image">
                        </div>
                        <?php for ($i = 1; $i < count($main_gallery_images); $i++): ?>
                            <div class="gallery__item gallery__item--thumb">
                                <img src="<?php echo htmlspecialchars($main_gallery_images[$i]); ?>" alt="Miniatura <?php echo $i; ?>" class="gallery__image gallery__thumbnail">
                            </div>
                        <?php endfor; ?>
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
                                // Agrega aquí la lógica para mostrar las características como en tu código original
                                if ($property['category'] === 'casas') {
                                    if (!empty($features['recamaras'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_bed.png" alt="Recámaras"><span>' . htmlspecialchars($features['recamaras']) . ' Recámaras</span></li>';
                                    if (!empty($features['banos'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_bath.png" alt="Baños"><span>' . htmlspecialchars($features['banos']) . ' Baños</span></li>';
                                    if (!empty($features['estacionamientos'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_parking.png" alt="Estacionamientos"><span>' . htmlspecialchars($features['estacionamientos']) . ' Estacionamientos</span></li>';
                                    if (!empty($features['superficie_construida'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_built_area.png" alt="Construcción"><span>' . htmlspecialchars($features['superficie_construida']) . ' m² Construidos</span></li>';
                                } elseif ($property['category'] === 'departamentos') {
                                    if (!empty($features['recamaras'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_bed.png" alt="Recámaras"><span>' . htmlspecialchars($features['recamaras']) . ' Recámaras</span></li>';
                                    if (!empty($features['banos'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_bath.png" alt="Baños"><span>' . htmlspecialchars($features['banos']) . ' Baños</span></li>';
                                    if (!empty($features['superficie_total'])) echo '<li class="property-info__feature-item"><img src="assets/images/iconcaracteristic/icon_total_area.png" alt="Superficie"><span>' . htmlspecialchars($features['superficie_total']) . ' m² Totales</span></li>';
                                } // Agrega más 'elseif' para otras categorías si es necesario
                                ?>
                            </ul>
                        </div>
                    </div>
                </article>
                
                <aside class="property-detail__contact-wrapper">
                    <div class="contact-card">
                        <h3 class="contact-card__title">¿Te interesa esta propiedad?</h3>
                        <p class="contact-card__subtitle">Contacta al anunciante para más información.</p>
                        <a href="contact.php?property_id=<?php echo $id; ?>" class="btn btn-primary contact-card__button">Contactar por Correo</a>
                        <a href="https://wa.me/5219997632818?text=Estoy%20interesado%20en%20la%20propiedad:%20<?php echo urlencode($property['title']); ?>" class="btn btn-whatsapp contact-card__button" target="_blank">Contactar por WhatsApp</a>
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
                                    <div class="property-card__badge property-card__badge--listing"><?php echo htmlspecialchars(ucfirst($similar_property['listing_type'])); ?></div>
                                    <div class="property-card__badge property-card__badge--category"><?php echo htmlspecialchars(ucfirst($similar_property['category'])); ?></div>
                                </div>
                                <div class="property-card__content">
                                    <h3 class="property-card__title"><?php echo htmlspecialchars($similar_property['title']); ?></h3>
                                    <p class="property-card__location">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
                                        <?php echo htmlspecialchars($similar_property['location']); ?>
                                    </p>
                                </div>
                                <div class="property-card__footer">
                                    <p class="property-card__price">$<?php echo number_format($similar_property['price'], 2); ?> MXN</p>
                                    <span class="property-card__details-button">Ver detalles &rarr;</span>
                                </div>
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>
            <?php endif; ?>
        </div>
    </main>
    
    <?php include 'includes/footer.php'; ?>
    <script src="assets/js/main.js"></script>
</body>
</html>