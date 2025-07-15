<?php
session_start();
include '../includes/config.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $pdo->prepare("SELECT * FROM properties WHERE id = :id");
$stmt->bindParam(':id', $id);
$stmt->execute();
$property = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$property) {
    echo '<div class="error">Propiedad no encontrada.</div>';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = filter_input(INPUT_POST, 'title', FILTER_SANITIZE_STRING);
    $description = filter_input(INPUT_POST, 'description', FILTER_SANITIZE_STRING);
    $price = filter_input(INPUT_POST, 'price', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    $category = filter_input(INPUT_POST, 'category', FILTER_SANITIZE_STRING);
    $listing_type = filter_input(INPUT_POST, 'listing_type', FILTER_SANITIZE_STRING);
    $location = filter_input(INPUT_POST, 'location', FILTER_SANITIZE_STRING);
    $latitude = filter_input(INPUT_POST, 'latitude', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    $longitude = filter_input(INPUT_POST, 'longitude', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    $status = filter_input(INPUT_POST, 'status', FILTER_SANITIZE_STRING);

    // Validar precio
    if (!is_numeric($price) || $price <= 0) {
        echo '<div class="error">El precio debe ser un número positivo válido.</div>';
        exit;
    }
    $max_price = 9999999999.99; // Para DECIMAL(12,2)
    if ($price > $max_price) {
        echo '<div class="error">El precio excede el valor máximo permitido (' . number_format($max_price, 2) . ').</div>';
        exit;
    }

    // Validar ubicación
    $valid_locations = ['Cozumel', 'Felipe Carrillo Puerto', 'Isla Mujeres', 'Othón P. Blanco', 'Benito Juárez', 'José María Morelos', 'Lázaro Cárdenas', 'Playa del Carmen', 'Tulum', 'Bacalar', 'Puerto Morelos'];
    if (!in_array($location, $valid_locations)) {
        echo '<div class="error">Ubicación no válida. Por favor selecciona un municipio válido de Quintana Roo.</div>';
        exit;
    }

    // Procesar características según categoría
    $features = [];
    if ($category === 'casas') {
        $features = [
            'recamaras' => filter_input(INPUT_POST, 'recamaras_casas', FILTER_SANITIZE_NUMBER_INT),
            'banos' => filter_input(INPUT_POST, 'banos_casas', FILTER_SANITIZE_NUMBER_INT),
            'estacionamientos' => filter_input(INPUT_POST, 'estacionamientos_casas', FILTER_SANITIZE_NUMBER_INT),
            'superficie_total' => filter_input(INPUT_POST, 'superficie_total_casas', FILTER_SANITIZE_STRING),
            'superficie_construida' => filter_input(INPUT_POST, 'superficie_construida_casas', FILTER_SANITIZE_STRING),
            'niveles' => filter_input(INPUT_POST, 'niveles_casas', FILTER_SANITIZE_NUMBER_INT),
            'terraza' => filter_input(INPUT_POST, 'terraza_casas', FILTER_SANITIZE_STRING) ? 'Sí' : 'No',
            'alberca' => filter_input(INPUT_POST, 'alberca_casas', FILTER_SANITIZE_STRING) ? 'Sí' : 'No',
            'amueblada' => filter_input(INPUT_POST, 'amueblada_casas', FILTER_SANITIZE_STRING) ? 'Sí' : 'No'
        ];
    } elseif ($category === 'departamentos') {
        $features = [
            'recamaras' => filter_input(INPUT_POST, 'recamaras_departamentos', FILTER_SANITIZE_NUMBER_INT),
            'banos' => filter_input(INPUT_POST, 'banos_departamentos', FILTER_SANITIZE_NUMBER_INT),
            'estacionamientos' => filter_input(INPUT_POST, 'estacionamientos_departamentos', FILTER_SANITIZE_NUMBER_INT),
            'superficie_total' => filter_input(INPUT_POST, 'superficie_total_departamentos', FILTER_SANITIZE_STRING),
            'piso' => filter_input(INPUT_POST, 'piso_departamentos', FILTER_SANITIZE_NUMBER_INT),
            'terraza' => filter_input(INPUT_POST, 'terraza_departamentos', FILTER_SANITIZE_STRING) ? 'Sí' : 'No',
            'amenidades' => [
                'gimnasio' => filter_input(INPUT_POST, 'gimnasio_departamentos', FILTER_SANITIZE_STRING) ? 'Sí' : 'No',
                'alberca' => filter_input(INPUT_POST, 'alberca_departamentos', FILTER_SANITIZE_STRING) ? 'Sí' : 'No',
                'salon_eventos' => filter_input(INPUT_POST, 'salon_eventos_departamentos', FILTER_SANITIZE_STRING) ? 'Sí' : 'No'
            ],
            'elevador' => filter_input(INPUT_POST, 'elevador_departamentos', FILTER_SANITIZE_STRING) ? 'Sí' : 'No'
        ];
    } elseif ($category === 'terrenos') {
        $features = [
            'superficie_total' => filter_input(INPUT_POST, 'superficie_total_terrenos', FILTER_SANITIZE_STRING),
            'tipo_suelo' => filter_input(INPUT_POST, 'tipo_suelo_terrenos', FILTER_SANITIZE_STRING),
            'servicios' => [
                'luz' => filter_input(INPUT_POST, 'luz_terrenos', FILTER_SANITIZE_STRING) ? 'Sí' : 'No',
                'agua' => filter_input(INPUT_POST, 'agua_terrenos', FILTER_SANITIZE_STRING) ? 'Sí' : 'No',
                'drenaje' => filter_input(INPUT_POST, 'drenaje_terrenos', FILTER_SANITIZE_STRING) ? 'Sí' : 'No'
            ],
            'frente' => filter_input(INPUT_POST, 'frente_terrenos', FILTER_SANITIZE_STRING),
            'fondo' => filter_input(INPUT_POST, 'fondo_terrenos', FILTER_SANITIZE_STRING),
            'tipo_propiedad' => filter_input(INPUT_POST, 'tipo_propiedad_terrenos', FILTER_SANITIZE_STRING)
        ];
    } elseif ($category === 'desarrollos') {
        $features = [
            'num_unidades' => filter_input(INPUT_POST, 'num_unidades_desarrollos', FILTER_SANITIZE_NUMBER_INT),
            'superficie_min' => filter_input(INPUT_POST, 'superficie_min_desarrollos', FILTER_SANITIZE_STRING),
            'superficie_max' => filter_input(INPUT_POST, 'superficie_max_desarrollos', FILTER_SANITIZE_STRING),
            'rango_recamaras' => filter_input(INPUT_POST, 'rango_recamaras_desarrollos', FILTER_SANITIZE_STRING),
            'rango_banos' => filter_input(INPUT_POST, 'rango_banos_desarrollos', FILTER_SANITIZE_STRING),
            'etapas' => filter_input(INPUT_POST, 'etapas_desarrollos', FILTER_SANITIZE_STRING),
            'amenidades' => [
                'alberca' => filter_input(INPUT_POST, 'alberca_desarrollos', FILTER_SANITIZE_STRING) ? 'Sí' : 'No',
                'areas_verdes' => filter_input(INPUT_POST, 'areas_verdes_desarrollos', FILTER_SANITIZE_STRING) ? 'Sí' : 'No',
                'gimnasio' => filter_input(INPUT_POST, 'gimnasio_desarrollos', FILTER_SANITIZE_STRING) ? 'Sí' : 'No'
            ],
            'pet_friendly' => filter_input(INPUT_POST, 'pet_friendly_desarrollos', FILTER_SANITIZE_STRING) ? 'Sí' : 'No',
            'entrega_estimada' => filter_input(INPUT_POST, 'entrega_estimada_desarrollos', FILTER_SANITIZE_STRING)
        ];
    }

    // Definir la carpeta para las imágenes de la propiedad
    $upload_dir = "../assets/images/property_$id/";
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // Procesar imágenes
    $main_image = $property['main_image'];
    $thumbnails = [];
    for ($i = 1; $i <= 15; $i++) {
        $thumbnails["thumbnail$i"] = $property["thumbnail$i"] ?? '';
    }

    if ($_FILES['main_image']['name']) {
        $main_image_name = basename($_FILES['main_image']['name']);
        $main_image = $upload_dir . $main_image_name;
        move_uploaded_file($_FILES['main_image']['tmp_name'], $main_image);
        $main_image = "assets/images/property_$id/$main_image_name"; // Ruta relativa para la base de datos
    }

    for ($i = 1; $i <= 15; $i++) {
        $thumb_key = "thumbnail$i";
        if ($_FILES[$thumb_key]['name']) {
            $thumb_name = basename($_FILES[$thumb_key]['name']);
            $thumbnails[$thumb_key] = $upload_dir . $thumb_name;
            move_uploaded_file($_FILES[$thumb_key]['tmp_name'], $thumbnails[$thumb_key]);
            $thumbnails[$thumb_key] = "assets/images/property_$id/$thumb_name"; // Ruta relativa para la base de datos
        }
    }

    $stmt = $pdo->prepare("UPDATE properties SET title = :title, description = :description, price = :price, category = :category, listing_type = :listing_type, main_image = :main_image, " . implode(', ', array_map(fn($i) => "thumbnail$i = :thumbnail$i", range(1, 15))) . ", location = :location, latitude = :latitude, longitude = :longitude, features = :features, status = :status WHERE id = :id");
    $params = [
        ':id' => $id,
        ':title' => $title,
        ':description' => $description,
        ':price' => $price,
        ':category' => $category,
        ':listing_type' => $listing_type,
        ':main_image' => $main_image,
        ':location' => $location,
        ':latitude' => $latitude ?: null,
        ':longitude' => $longitude ?: null,
        ':features' => json_encode($features),
        ':status' => $status
    ];
    for ($i = 1; $i <= 15; $i++) {
        $params[":thumbnail$i"] = $thumbnails["thumbnail$i"];
    }
    $stmt->execute($params);

    echo '<div class="success">Propiedad actualizada con éxito.</div>';
}

$features = json_decode($property['features'], true) ?: [];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Propiedad - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="edit-property">
        <div class="container">
            <h2>Editar Propiedad</h2>
            <form action="edit_property.php?id=<?php echo $id; ?>" method="POST" enctype="multipart/form-data" class="admin-form">
                <div class="form-group">
                    <label for="title">Título</label>
                    <input type="text" id="title" name="title" value="<?php echo htmlspecialchars($property['title']); ?>" required>
                </div>
                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" name="description" required><?php echo htmlspecialchars($property['description']); ?></textarea>
                </div>
                <div class="form-group">
                    <label for="price">Precio (MXN)</label>
                    <input type="number" id="price" name="price" step="0.01" value="<?php echo htmlspecialchars($property['price']); ?>" required>
                </div>
                <div class="form-group">
                    <label for="category">Categoría</label>
                    <select id="category" name="category" required onchange="updateFeaturesForm()">
                        <option value="casas" <?php if ($property['category'] == 'casas') echo 'selected'; ?>>Casas</option>
                        <option value="departamentos" <?php if ($property['category'] == 'departamentos') echo 'selected'; ?>>Departamentos</option>
                        <option value="terrenos" <?php if ($property['category'] == 'terrenos') echo 'selected'; ?>>Terrenos</option>
                        <option value="desarrollos" <?php if ($property['category'] == 'desarrollos') echo 'selected'; ?>>Desarrollos</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="listing_type">Tipo de Listado</label>
                    <select id="listing_type" name="listing_type" required>
                        <option value="venta" <?php if ($property['listing_type'] == 'venta') echo 'selected'; ?>>Venta</option>
                        <option value="renta" <?php if ($property['listing_type'] == 'renta') echo 'selected'; ?>>Renta</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="location">Ubicación (Municipio)</label>
                    <select id="location" name="location" required>
                        <option value="Cozumel" <?php if ($property['location'] == 'Cozumel') echo 'selected'; ?>>Cozumel</option>
                        <option value="Felipe Carrillo Puerto" <?php if ($property['location'] == 'Felipe Carrillo Puerto') echo 'selected'; ?>>Felipe Carrillo Puerto</option>
                        <option value="Isla Mujeres" <?php if ($property['location'] == 'Isla Mujeres') echo 'selected'; ?>>Isla Mujeres</option>
                        <option value="Othón P. Blanco" <?php if ($property['location'] == 'Othón P. Blanco') echo 'selected'; ?>>Othón P. Blanco</option>
                        <option value="Benito Juárez" <?php if ($property['location'] == 'Benito Juárez') echo 'selected'; ?>>Benito Juárez</option>
                        <option value="José María Morelos" <?php if ($property['location'] == 'José María Morelos') echo 'selected'; ?>>José María Morelos</option>
                        <option value="Lázaro Cárdenas" <?php if ($property['location'] == 'Lázaro Cárdenas') echo 'selected'; ?>>Lázaro Cárdenas</option>
                        <option value="Playa del Carmen" <?php if ($property['location'] == 'Playa del Carmen') echo 'selected'; ?>>Playa del Carmen</option>
                        <option value="Tulum" <?php if ($property['location'] == 'Tulum') echo 'selected'; ?>>Tulum</option>
                        <option value="Bacalar" <?php if ($property['location'] == 'Bacalar') echo 'selected'; ?>>Bacalar</option>
                        <option value="Puerto Morelos" <?php if ($property['location'] == 'Puerto Morelos') echo 'selected'; ?>>Puerto Morelos</option>
                    </select>
                </div>
                <div id="features-casas" class="form__features-group" style="<?php echo $property['category'] == 'casas' ? '' : 'display: none;'; ?>">
                    <div class="form-group">
                        <label for="recamaras_casas">Recámaras</label>
                        <input type="number" id="recamaras_casas" name="recamaras_casas" value="<?php echo htmlspecialchars($features['recamaras'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="banos_casas">Baños</label>
                        <input type="number" id="banos_casas" name="banos_casas" value="<?php echo htmlspecialchars($features['banos'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="estacionamientos_casas">Estacionamientos</label>
                        <input type="number" id="estacionamientos_casas" name="estacionamientos_casas" value="<?php echo htmlspecialchars($features['estacionamientos'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="superficie_total_casas">Superficie Total (m²)</label>
                        <input type="text" id="superficie_total_casas" name="superficie_total_casas" value="<?php echo htmlspecialchars($features['superficie_total'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="superficie_construida_casas">Superficie Construida (m²)</label>
                        <input type="text" id="superficie_construida_casas" name="superficie_construida_casas" value="<?php echo htmlspecialchars($features['superficie_construida'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="niveles_casas">Niveles/Pisos</label>
                        <input type="number" id="niveles_casas" name="niveles_casas" value="<?php echo htmlspecialchars($features['niveles'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="terraza_casas">Terraza/Balcón</label>
                        <input type="checkbox" id="terraza_casas" name="terraza_casas" <?php if (isset($features['terraza']) && $features['terraza'] == 'Sí') echo 'checked'; ?>>
                    </div>
                    <div class="form-group">
                        <label for="alberca_casas">Alberca</label>
                        <input type="checkbox" id="alberca_casas" name="alberca_casas" <?php if (isset($features['alberca']) && $features['alberca'] == 'Sí') echo 'checked'; ?>>
                    </div>
                    <div class="form-group">
                        <label for="amueblada_casas">Amueblada</label>
                        <input type="checkbox" id="amueblada_casas" name="amueblada_casas" <?php if (isset($features['amueblada']) && $features['amueblada'] == 'Sí') echo 'checked'; ?>>
                    </div>
                </div>
                <div id="features-departamentos" class="form__features-group" style="<?php echo $property['category'] == 'departamentos' ? '' : 'display: none;'; ?>">
                    <div class="form-group">
                        <label for="recamaras_departamentos">Recámaras</label>
                        <input type="number" id="recamaras_departamentos" name="recamaras_departamentos" value="<?php echo htmlspecialchars($features['recamaras'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="banos_departamentos">Baños</label>
                        <input type="number" id="banos_departamentos" name="banos_departamentos" value="<?php echo htmlspecialchars($features['banos'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="estacionamientos_departamentos">Estacionamientos</label>
                        <input type="number" id="estacionamientos_departamentos" name="estacionamientos_departamentos" value="<?php echo htmlspecialchars($features['estacionamientos'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="superficie_total_departamentos">Superficie Total (m²)</label>
                        <input type="text" id="superficie_total_departamentos" name="superficie_total_departamentos" value="<?php echo htmlspecialchars($features['superficie_total'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="piso_departamentos">Piso</label>
                        <input type="number" id="piso_departamentos" name="piso_departamentos" value="<?php echo htmlspecialchars($features['piso'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="terraza_departamentos">Balcón/Terraza</label>
                        <input type="checkbox" id="terraza_departamentos" name="terraza_departamentos" <?php if (isset($features['terraza']) && $features['terraza'] == 'Sí') echo 'checked'; ?>>
                    </div>
                    <div class="form-group">
                        <label>Amenidades</label>
                        <label><input type="checkbox" name="gimnasio_departamentos" <?php if (isset($features['amenidades']['gimnasio']) && $features['amenidades']['gimnasio'] == 'Sí') echo 'checked'; ?>> Gimnasio</label>
                        <label><input type="checkbox" name="alberca_departamentos" <?php if (isset($features['amenidades']['alberca']) && $features['amenidades']['alberca'] == 'Sí') echo 'checked'; ?>> Alberca</label>
                        <label><input type="checkbox" name="salon_eventos_departamentos" <?php if (isset($features['amenidades']['salon_eventos']) && $features['amenidades']['salon_eventos'] == 'Sí') echo 'checked'; ?>> Salón de Eventos</label>
                    </div>
                    <div class="form-group">
                        <label for="elevador_departamentos">Elevador</label>
                        <input type="checkbox" id="elevador_departamentos" name="elevador_departamentos" <?php if (isset($features['elevador']) && $features['elevador'] == 'Sí') echo 'checked'; ?>>
                    </div>
                </div>
                <div id="features-terrenos" class="form__features-group" style="<?php echo $property['category'] == 'terrenos' ? '' : 'display: none;'; ?>">
                    <div class="form-group">
                        <label for="superficie_total_terrenos">Superficie Total (m² o ha)</label>
                        <input type="text" id="superficie_total_terrenos" name="superficie_total_terrenos" value="<?php echo htmlspecialchars($features['superficie_total'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="tipo_suelo_terrenos">Tipo de Suelo</label>
                        <input type="text" id="tipo_suelo_terrenos" name="tipo_suelo_terrenos" value="<?php echo htmlspecialchars($features['tipo_suelo'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label>Servicios</label>
                        <label><input type="checkbox" name="luz_terrenos" <?php if (isset($features['servicios']['luz']) && $features['servicios']['luz'] == 'Sí') echo 'checked'; ?>> Luz</label>
                        <label><input type="checkbox" name="agua_terrenos" <?php if (isset($features['servicios']['agua']) && $features['servicios']['agua'] == 'Sí') echo 'checked'; ?>> Agua</label>
                        <label><input type="checkbox" name="drenaje_terrenos" <?php if (isset($features['servicios']['drenaje']) && $features['servicios']['drenaje'] == 'Sí') echo 'checked'; ?>> Drenaje</label>
                    </div>
                    <div class="form-group">
                        <label for="frente_terrenos">Frente (m)</label>
                        <input type="text" id="frente_terrenos" name="frente_terrenos" value="<?php echo htmlspecialchars($features['frente'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="fondo_terrenos">Fondo (m)</label>
                        <input type="text" id="fondo_terrenos" name="fondo_terrenos" value="<?php echo htmlspecialchars($features['fondo'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="tipo_propiedad_terrenos">Tipo de Propiedad</label>
                        <select id="tipo_propiedad_terrenos" name="tipo_propiedad_terrenos">
                            <option value="privada" <?php if (isset($features['tipo_propiedad']) && $features['tipo_propiedad'] == 'privada') echo 'selected'; ?>>Privada</option>
                            <option value="ejidal" <?php if (isset($features['tipo_propiedad']) && $features['tipo_propiedad'] == 'ejidal') echo 'selected'; ?>>Ejidal</option>
                        </select>
                    </div>
                </div>
                <div id="features-desarrollos" class="form__features-group" style="<?php echo $property['category'] == 'desarrollos' ? '' : 'display: none;'; ?>">
                    <div class="form-group">
                        <label for="num_unidades_desarrollos">Número de Unidades</label>
                        <input type="number" id="num_unidades_desarrollos" name="num_unidades_desarrollos" value="<?php echo htmlspecialchars($features['num_unidades'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="superficie_min_desarrollos">Superficie Mínima (m²)</label>
                        <input type="text" id="superficie_min_desarrollos" name="superficie_min_desarrollos" value="<?php echo htmlspecialchars($features['superficie_min'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="superficie_max_desarrollos">Superficie Máxima (m²)</label>
                        <input type="text" id="superficie_max_desarrollos" name="superficie_max_desarrollos" value="<?php echo htmlspecialchars($features['superficie_max'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="rango_recamaras_desarrollos">Rango de Recámaras</label>
                        <input type="text" id="rango_recamaras_desarrollos" name="rango_recamaras_desarrollos" value="<?php echo htmlspecialchars($features['rango_recamaras'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="rango_banos_desarrollos">Rango de Baños</label>
                        <input type="text" id="rango_banos_desarrollos" name="rango_banos_desarrollos" value="<?php echo htmlspecialchars($features['rango_banos'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="etapas_desarrollos">Etapas</label>
                        <select id="etapas_desarrollos" name="etapas_desarrollos">
                            <option value="preventa" <?php if (isset($features['etapas']) && $features['etapas'] == 'preventa') echo 'selected'; ?>>Preventa</option>
                            <option value="en_construccion" <?php if (isset($features['etapas']) && $features['etapas'] == 'en_construccion') echo 'selected'; ?>>En Construcción</option>
                            <option value="entregada" <?php if (isset($features['etapas']) && $features['etapas'] == 'entregada') echo 'selected'; ?>>Entregada</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Amenidades</label>
                        <label><input type="checkbox" name="alberca_desarrollos" <?php if (isset($features['amenidades']['alberca']) && $features['amenidades']['alberca'] == 'Sí') echo 'checked'; ?>> Alberca</label>
                        <label><input type="checkbox" name="areas_verdes_desarrollos" <?php if (isset($features['amenidades']['areas_verdes']) && $features['amenidades']['areas_verdes'] == 'Sí') echo 'checked'; ?>> Áreas Verdes</label>
                        <label><input type="checkbox" name="gimnasio_desarrollos" <?php if (isset($features['amenidades']['gimnasio']) && $features['amenidades']['gimnasio'] == 'Sí') echo 'checked'; ?>> Gimnasio</label>
                    </div>
                    <div class="form-group">
                        <label for="pet_friendly_desarrollos">Pet Friendly</label>
                        <input type="checkbox" id="pet_friendly_desarrollos" name="pet_friendly_desarrollos" <?php if (isset($features['pet_friendly']) && $features['pet_friendly'] == 'Sí') echo 'checked'; ?>>
                    </div>
                    <div class="form-group">
                        <label for="entrega_estimada_desarrollos">Entrega Estimada</label>
                        <input type="text" id="entrega_estimada_desarrollos" name="entrega_estimada_desarrollos" value="<?php echo htmlspecialchars($features['entrega_estimada'] ?? ''); ?>">
                    </div>
                </div>
                <div class="form-group">
                    <label for="main_image">Imagen Principal</label>
                    <input type="file" id="main_image" name="main_image" accept="image/*">
                    <p>Actual: <img src="<?php echo htmlspecialchars($property['main_image']); ?>" alt="Imagen actual" width="150"></p>
                </div>
                <?php for ($i = 1; $i <= 15; $i++) { ?>
                    <div class="form-group">
                        <label for="thumbnail<?php echo $i; ?>">Miniatura <?php echo $i; ?></label>
                        <input type="file" id="thumbnail<?php echo $i; ?>" name="thumbnail<?php echo $i; ?>" accept="image/*">
                        <?php if ($property["thumbnail$i"]) { ?>
                            <p>Actual: <img src="<?php echo htmlspecialchars($property["thumbnail$i"]); ?>" alt="Miniatura <?php echo $i; ?> actual" width="150"></p>
                        <?php } ?>
                    </div>
                <?php } ?>
                <div class="form-group">
                    <label for="latitude">Latitud</label>
                    <input type="number" id="latitude" name="latitude" step="any" value="<?php echo htmlspecialchars($property['latitude'] ?? ''); ?>">
                </div>
                <div class="form-group">
                    <label for="longitude">Longitud</label>
                    <input type="number" id="longitude" name="longitude" step="any" value="<?php echo htmlspecialchars($property['longitude'] ?? ''); ?>">
                </div>
                <div class="form-group">
                    <label for="status">Estado</label>
                    <select id="status" name="status" required>
                        <option value="disponible" <?php if ($property['status'] == 'disponible') echo 'selected'; ?>>Disponible</option>
                        <option value="vendido" <?php if ($property['status'] == 'vendido') echo 'selected'; ?>>Vendido</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Actualizar Propiedad</button>
            </form>
            <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
        </div>
    </section>
    <script src="../assets/js/main.js"></script>
</body>
</html>