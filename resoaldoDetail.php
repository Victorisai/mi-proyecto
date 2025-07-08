<?php
include 'includes/config.php';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $pdo->prepare("SELECT * FROM properties WHERE id = :id AND status = 'disponible'");
$stmt->bindParam(':id', $id);
$stmt->execute();
$property = $stmt->fetch(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $property ? htmlspecialchars($property['title']) : 'Propiedad no encontrada'; ?> - CedralSales</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <?php include 'includes/header.php'; ?>
    <section class="property-detail">
        <div class="container">
            <?php if ($property) { ?>
                <div class="property-gallery">
                    <img src="<?php echo htmlspecialchars($property['main_image']); ?>" alt="<?php echo htmlspecialchars($property['title']); ?>" class="main-image">
                    <div class="thumbnail-grid">
                        <?php
                        $thumbnails = [$property['thumbnail1'], $property['thumbnail2'], $property['thumbnail3']];
                        foreach ($thumbnails as $thumbnail) {
                            if ($thumbnail) {
                                echo '<img src="' . htmlspecialchars($thumbnail) . '" alt="Miniatura">';
                            }
                        }
                        ?>
                    </div>
                </div>
                <div class="property-info">
                    <h2><?php echo htmlspecialchars($property['title']); ?></h2>
                    <p class="price">$<?php echo number_format($property['price'], 2); ?> MXN</p>
                    <p class="category"><?php echo htmlspecialchars(ucfirst($property['category'])); ?></p>
                    <p class="description"><?php echo htmlspecialchars($property['description']); ?></p>
                    <h3>Características</h3>
                    <ul class="features-grid">
                        <?php
                        $features = json_decode($property['features'], true) ?: [];
                        if ($property['category'] === 'casas') {
                            if (!empty($features['recamaras'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_bed.png" alt="Recámaras"> Recámaras: ' . htmlspecialchars($features['recamaras']) . '</li>';
                            if (!empty($features['banos'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_bath.png" alt="Baños"> Baños: ' . htmlspecialchars($features['banos']) . '</li>';
                            if (!empty($features['estacionamientos'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_parking.png" alt="Estacionamientos"> Estacionamientos: ' . htmlspecialchars($features['estacionamientos']) . '</li>';
                            if (!empty($features['superficie_total'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_total_area.png" alt="Superficie Total"> Superficie Total: ' . htmlspecialchars($features['superficie_total']) . ' m²</li>';
                            if (!empty($features['superficie_construida'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_built_area.png" alt="Superficie Construida"> Superficie Construida: ' . htmlspecialchars($features['superficie_construida']) . ' m²</li>';
                            if (!empty($features['niveles'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_floors.png" alt="Niveles"> Niveles: ' . htmlspecialchars($features['niveles']) . '</li>';
                            if (!empty($features['terraza']) && $features['terraza'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_terrace.png" alt="Terraza"> Terraza/Balcón: Sí</li>';
                            if (!empty($features['alberca']) && $features['alberca'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_pool.png" alt="Alberca"> Alberca: Sí</li>';
                            if (!empty($features['amueblada']) && $features['amueblada'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_furniture.png" alt="Amueblada"> Amueblada: Sí</li>';
                        } elseif ($property['category'] === 'departamentos') {
                            if (!empty($features['recamaras'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_bed.png" alt="Recámaras"> Recámaras: ' . htmlspecialchars($features['recamaras']) . '</li>';
                            if (!empty($features['banos'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_bath.png" alt="Baños"> Baños: ' . htmlspecialchars($features['banos']) . '</li>';
                            if (!empty($features['estacionamientos'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_parking.png" alt="Estacionamientos"> Estacionamientos: ' . htmlspecialchars($features['estacionamientos']) . '</li>';
                            if (!empty($features['superficie_total'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_total_area.png" alt="Superficie Total"> Superficie Total: ' . htmlspecialchars($features['superficie_total']) . ' m²</li>';
                            if (!empty($features['piso'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_elevator.png" alt="Piso"> Piso: ' . htmlspecialchars($features['piso']) . '</li>';
                            if (!empty($features['terraza']) && $features['terraza'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_terrace.png" alt="Terraza"> Balcón/Terraza: Sí</li>';
                            if (!empty($features['amenidades'])) {
                                if ($features['amenidades']['gimnasio'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_gym.png" alt="Gimnasio"> Gimnasio: Sí</li>';
                                if ($features['amenidades']['alberca'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_pool.png" alt="Alberca"> Alberca: Sí</li>';
                                if ($features['amenidades']['salon_eventos'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_event_hall.png" alt="Salón de Eventos"> Salón de Eventos: Sí</li>';
                            }
                            if (!empty($features['elevador']) && $features['elevador'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_elevator.png" alt="Elevador"> Elevador: Sí</li>';
                        } elseif ($property['category'] === 'terrenos') {
                            if (!empty($features['superficie_total'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_total_area.png" alt="Superficie Total"> Superficie Total: ' . htmlspecialchars($features['superficie_total']) . '</li>';
                            if (!empty($features['tipo_suelo'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_soil.png" alt="Tipo de Suelo"> Tipo de Suelo: ' . htmlspecialchars($features['tipo_suelo']) . '</li>';
                            if (!empty($features['servicios'])) {
                                if ($features['servicios']['luz'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_electricity.png" alt="Luz"> Luz: Sí</li>';
                                if ($features['servicios']['agua'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_water.png" alt="Agua"> Agua: Sí</li>';
                                if ($features['servicios']['drenaje'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_drainage.png" alt="Drenaje"> Drenaje: Sí</li>';
                            }
                            if (!empty($features['frente'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_dimensions.png" alt="Frente"> Frente: ' . htmlspecialchars($features['frente']) . ' m</li>';
                            if (!empty($features['fondo'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_dimensions.png" alt="Fondo"> Fondo: ' . htmlspecialchars($features['fondo']) . ' m</li>';
                            if (!empty($features['tipo_propiedad'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_property_type.png" alt="Tipo de Propiedad"> Tipo de Propiedad: ' . htmlspecialchars($features['tipo_propiedad']) . '</li>';
                        } elseif ($property['category'] === 'desarrollos') {
                            if (!empty($features['num_unidades'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_units.png" alt="Número de Unidades"> Número de Unidades: ' . htmlspecialchars($features['num_unidades']) . '</li>';
                            if (!empty($features['superficie_min'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_total_area.png" alt="Superficie Mínima"> Superficie Mínima: ' . htmlspecialchars($features['superficie_min']) . ' m²</li>';
                            if (!empty($features['superficie_max'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_total_area.png" alt="Superficie Máxima"> Superficie Máxima: ' . htmlspecialchars($features['superficie_max']) . ' m²</li>';
                            if (!empty($features['rango_recamaras'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_bed.png" alt="Rango de Recámaras"> Rango de Recámaras: ' . htmlspecialchars($features['rango_recamaras']) . '</li>';
                            if (!empty($features['rango_banos'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_bath.png" alt="Rango de Baños"> Rango de Baños: ' . htmlspecialchars($features['rango_banos']) . '</li>';
                            if (!empty($features['etapas'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_timeline.png" alt="Etapas"> Etapas: ' . htmlspecialchars($features['etapas']) . '</li>';
                            if (!empty($features['amenidades'])) {
                                if ($features['amenidades']['alberca'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_pool.png" alt="Alberca"> Alberca: Sí</li>';
                                if ($features['amenidades']['areas_verdes'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_green_areas.png" alt="Áreas Verdes"> Áreas Verdes: Sí</li>';
                                if ($features['amenidades']['gimnasio'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_gym.png" alt="Gimnasio"> Gimnasio: Sí</li>';
                            }
                            if (!empty($features['pet_friendly']) && $features['pet_friendly'] == 'Sí') echo '<li><img src="../assets/images/iconcaracteristic/icon_pet_friendly.png" alt="Pet Friendly"> Pet Friendly: Sí</li>';
                            if (!empty($features['entrega_estimada'])) echo '<li><img src="../assets/images/iconcaracteristic/icon_calendar.png" alt="Entrega Estimada"> Entrega Estimada: ' . htmlspecialchars($features['entrega_estimada']) . '</li>';
                        }
                        ?>
                    </ul>
                    <a href="contact.php" class="btn btn-primary">Contactar</a>
                </div>
                <div class="property-map">
                    <h3>Ubicación</h3>
                    <?php if ($property['latitude'] && $property['longitude']) { ?>
                        <iframe
                            width="100%"
                            height="400"
                            frameborder="0"
                            style="border:0"
                            src="https://www.google.com/maps/embed/v1/place?q=<?php echo $property['latitude']; ?>,<?php echo $property['longitude']; ?>&key=AIzaSyBFw0Qbyq9zTFTd0CC1e0vSk5F3e2f0c4"
                            allowfullscreen>
                        </iframe>
                    <?php } else { ?>
                        <p>No hay coordenadas disponibles para esta propiedad.</p>
                    <?php } ?>
                </div>
            <?php } else { ?>
                <p class="error">Propiedad no encontrada o no disponible.</p>
            <?php } ?>
        </div>
    </section>
    <?php include 'includes/footer.php'; ?>
    <script src="assets/js/main.js"></script>
</body>
</html>