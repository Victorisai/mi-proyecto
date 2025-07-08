<?php
session_start();
include '../includes/config.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: index.php');
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

    // Insertar la propiedad sin imágenes primero para obtener el ID
    $stmt = $pdo->prepare("INSERT INTO properties (title, description, price, category, listing_type, location, latitude, longitude, features, status) VALUES (:title, :description, :price, :category, :listing_type, :location, :latitude, :longitude, :features, :status)");
    try {
        $stmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':price' => $price,
            ':category' => $category,
            ':listing_type' => $listing_type,
            ':location' => $location,
            ':latitude' => $latitude ?: null,
            ':longitude' => $longitude ?: null,
            ':features' => json_encode($features),
            ':status' => $status
        ]);
    } catch (PDOException $e) {
        echo '<div class="error">Error al insertar la propiedad: ' . htmlspecialchars($e->getMessage()) . '</div>';
        exit;
    }

    // Obtener el ID de la propiedad recién insertada
    $property_id = $pdo->lastInsertId();

    // Crear la carpeta para las imágenes de la propiedad
    $upload_dir = "../assets/images/property_$property_id/";
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // Procesar imágenes
    $main_image = '';
    $thumbnails = array_fill(1, 15, ''); // Inicializar array para 15 miniaturas

    if ($_FILES['main_image']['name']) {
        $main_image_name = basename($_FILES['main_image']['name']);
        $main_image = $upload_dir . $main_image_name;
        move_uploaded_file($_FILES['main_image']['tmp_name'], $main_image);
        $main_image = "assets/images/property_$property_id/$main_image_name"; // Ruta relativa para la base de datos
    }

    for ($i = 1; $i <= 15; $i++) {
        $thumb_key = "thumbnail$i";
        if ($_FILES[$thumb_key]['name']) {
            $thumb_name = basename($_FILES[$thumb_key]['name']);
            $thumbnails[$i] = $upload_dir . $thumb_name;
            move_uploaded_file($_FILES[$thumb_key]['tmp_name'], $thumbnails[$i]);
            $thumbnails[$i] = "assets/images/property_$property_id/$thumb_name"; // Ruta relativa para la base de datos
        }
    }

    // Actualizar la propiedad con las rutas de las imágenes
    $stmt = $pdo->prepare("UPDATE properties SET main_image = :main_image, " . implode(', ', array_map(fn($i) => "thumbnail$i = :thumbnail$i", range(1, 15))) . " WHERE id = :id");
    $params = [':id' => $property_id, ':main_image' => $main_image];
    for ($i = 1; $i <= 15; $i++) {
        $params[":thumbnail$i"] = $thumbnails[$i];
    }
    $stmt->execute($params);

    echo '<div class="success">Propiedad agregada con éxito.</div>';
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agregar Propiedad - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="add-property">
        <div class="container">
            <h2>Agregar Propiedad</h2>
            <form action="add_property.php" method="POST" enctype="multipart/form-data" class="admin-form">
                <div class="form-group">
                    <label for="title">Título</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label for="price">Precio (MXN)</label>
                    <input type="number" id="price" name="price" step="0.01" min="0.01" max="9999999999.99" required>
                </div>
                <div class="form-group">
                    <label for="category">Categoría</label>
                    <select id="category" name="category" required onchange="updateFeaturesForm()">
                        <option value="casas">Casas</option>
                        <option value="departamentos">Departamentos</option>
                        <option value="terrenos">Terrenos</option>
                        <option value="desarrollos">Desarrollos</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="listing_type">Tipo de Listado</label>
                    <select id="listing_type" name="listing_type" required>
                        <option value="venta">Venta</option>
                        <option value="renta">Renta</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="location">Ubicación (Municipio)</label>
                    <select id="location" name="location" required>
                        <option value="Cozumel">Cozumel</option>
                        <option value="Felipe Carrillo Puerto">Felipe Carrillo Puerto</option>
                        <option value="Isla Mujeres">Isla Mujeres</option>
                        <option value="Othón P. Blanco">Othón P. Blanco</option>
                        <option value="Benito Juárez">Benito Juárez</option>
                        <option value="José María Morelos">José María Morelos</option>
                        <option value="Lázaro Cárdenas">Lázaro Cárdenas</option>
                        <option value="Playa del Carmen">Playa del Carmen</option>
                        <option value="Tulum">Tulum</option>
                        <option value="Bacalar">Bacalar</option>
                        <option value="Puerto Morelos">Puerto Morelos</option>
                    </select>
                </div>
                <div id="features-casas" class="features-group">
                    <div class="form-group">
                        <label for="recamaras_casas">Recámaras</label>
                        <input type="number" id="recamaras_casas" name="recamaras_casas">
                    </div>
                    <div class="form-group">
                        <label for="banos_casas">Baños</label>
                        <input type="number" id="banos_casas" name="banos_casas">
                    </div>
                    <div class="form-group">
                        <label for="estacionamientos_casas">Estacionamientos</label>
                        <input type="number" id="estacionamientos_casas" name="estacionamientos_casas">
                    </div>
                    <div class="form-group">
                        <label for="superficie_total_casas">Superficie Total (m²)</label>
                        <input type="text" id="superficie_total_casas" name="superficie_total_casas">
                    </div>
                    <div class="form-group">
                        <label for="superficie_construida_casas">Superficie Construida (m²)</label>
                        <input type="text" id="superficie_construida_casas" name="superficie_construida_casas">
                    </div>
                    <div class="form-group">
                        <label for="niveles_casas">Niveles/Pisos</label>
                        <input type="number" id="niveles_casas" name="niveles_casas">
                    </div>
                    <div class="form-group">
                        <label for="terraza_casas">Terraza/Balcón</label>
                        <input type="checkbox" id="terraza_casas" name="terraza_casas">
                    </div>
                    <div class="form-group">
                        <label for="alberca_casas">Alberca</label>
                        <input type="checkbox" id="alberca_casas" name="alberca_casas">
                    </div>
                    <div class="form-group">
                        <label for="amueblada_casas">Amueblada</label>
                        <input type="checkbox" id="amueblada_casas" name="amueblada_casas">
                    </div>
                </div>
                <div id="features-departamentos" class="features-group" style="display: none;">
                    <div class="form-group">
                        <label for="recamaras_departamentos">Recámaras</label>
                        <input type="number" id="recamaras_departamentos" name="recamaras_departamentos">
                    </div>
                    <div class="form-group">
                        <label for="banos_departamentos">Baños</label>
                        <input type="number" id="banos_departamentos" name="banos_departamentos">
                    </div>
                    <div class="form-group">
                        <label for="estacionamientos_departamentos">Estacionamientos</label>
                        <input type="number" id="estacionamientos_departamentos" name="estacionamientos_departamentos">
                    </div>
                    <div class="form-group">
                        <label for="superficie_total_departamentos">Superficie Total (m²)</label>
                        <input type="text" id="superficie_total_departamentos" name="superficie_total_departamentos">
                    </div>
                    <div class="form-group">
                        <label for="piso_departamentos">Piso</label>
                        <input type="number" id="piso_departamentos" name="piso_departamentos">
                    </div>
                    <div class="form-group">
                        <label for="terraza_departamentos">Balcón/Terraza</label>
                        <input type="checkbox" id="terraza_departamentos" name="terraza_departamentos">
                    </div>
                    <div class="form-group">
                        <label>Amenidades</label>
                        <label><input type="checkbox" name="gimnasio_departamentos"> Gimnasio</label>
                        <label><input type="checkbox" name="alberca_departamentos"> Alberca</label>
                        <label><input type="checkbox" name="salon_eventos_departamentos"> Salón de Eventos</label>
                    </div>
                    <div class="form-group">
                        <label for="elevador_departamentos">Elevador</label>
                        <input type="checkbox" id="elevador_departamentos" name="elevador_departamentos">
                    </div>
                </div>
                <div id="features-terrenos" class="features-group" style="display: none;">
                    <div class="form-group">
                        <label for="superficie_total_terrenos">Superficie Total (m² o ha)</label>
                        <input type="text" id="superficie_total_terrenos" name="superficie_total_terrenos">
                    </div>
                    <div class="form-group">
                        <label for="tipo_suelo_terrenos">Tipo de Suelo</label>
                        <input type="text" id="tipo_suelo_terrenos" name="tipo_suelo_terrenos">
                    </div>
                    <div class="form-group">
                        <label>Servicios</label>
                        <label><input type="checkbox" name="luz_terrenos"> Luz</label>
                        <label><input type="checkbox" name="agua_terrenos"> Agua</label>
                        <label><input type="checkbox" name="drenaje_terrenos"> Drenaje</label>
                    </div>
                    <div class="form-group">
                        <label for="frente_terrenos">Frente (m)</label>
                        <input type="text" id="frente_terrenos" name="frente_terrenos">
                    </div>
                    <div class="form-group">
                        <label for="fondo_terrenos">Fondo (m)</label>
                        <input type="text" id="fondo_terrenos" name="fondo_terrenos">
                    </div>
                    <div class="form-group">
                        <label for="tipo_propiedad_terrenos">Tipo de Propiedad</label>
                        <select id="tipo_propiedad_terrenos" name="tipo_propiedad_terrenos">
                            <option value="privada">Privada</option>
                            <option value="ejidal">Ejidal</option>
                        </select>
                    </div>
                </div>
                <div id="features-desarrollos" class="features-group" style="display: none;">
                    <div class="form-group">
                        <label for="num_unidades_desarrollos">Número de Unidades</label>
                        <input type="number" id="num_unidades_desarrollos" name="num_unidades_desarrollos">
                    </div>
                    <div class="form-group">
                        <label for="superficie_min_desarrollos">Superficie Mínima (m²)</label>
                        <input type="text" id="superficie_min_desarrollos" name="superficie_min_desarrollos">
                    </div>
                    <div class="form-group">
                        <label for="superficie_max_notebook">Superficie Máxima (m²)</label>
                        <input type="text" id="superficie_max_desarrollos" name="superficie_max_desarrollos">
                    </div>
                    <div class="form-group">
                        <label for="rango_recamaras_desarrollos">Rango de Recámaras</label>
                        <input type="text" id="rango_recamaras_desarrollos" name="rango_recamaras_desarrollos">
                    </div>
                    <div class="form-group">
                        <label for="rango_banos_desarrollos">Rango de Baños</label>
                        <input type="text" id="rango_banos_desarrollos" name="rango_banos_desarrollos">
                    </div>
                    <div class="form-group">
                        <label for="etapas_desarrollos">Etapas</label>
                        <select id="etapas_desarrollos" name="etapas_desarrollos">
                            <option value="preventa">Preventa</option>
                            <option value="en_construccion">En Construcción</option>
                            <option value="entregada">Entregada</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Amenidades</label>
                        <label><input type="checkbox" name="alberca_desarrollos"> Alberca</label>
                        <label><input type="checkbox" name="areas_verdes_desarrollos"> Áreas Verdes</label>
                        <label><input type="checkbox" name="gimnasio_desarrollos"> Gimnasio</label>
                    </div>
                    <div class="form-group">
                        <label for="pet_friendly_desarrollos">Pet Friendly</label>
                        <input type="checkbox" id="pet_friendly_desarrollos" name="pet_friendly_desarrollos">
                    </div>
                    <div class="form-group">
                        <label for="entrega_estimada_desarrollos">Entrega Estimada</label>
                        <input type="text" id="entrega_estimada_desarrollos" name="entrega_estimada_desarrollos">
                    </div>
                </div>
                <div class="form-group">
                    <label for="main_image">Imagen Principal</label>
                    <input type="file" id="main_image" name="main_image" accept="image/*" required>
                </div>
                <?php for ($i = 1; $i <= 15; $i++) { ?>
                    <div class="form-group">
                        <label for="thumbnail<?php echo $i; ?>">Miniatura <?php echo $i; ?></label>
                        <input type="file" id="thumbnail<?php echo $i; ?>" name="thumbnail<?php echo $i; ?>" accept="image/*">
                    </div>
                <?php } ?>
                <div class="form-group">
                    <label for="latitude">Latitud</label>
                    <input type="number" id="latitude" name="latitude" step="any">
                </div>
                <div class="form-group">
                    <label for="longitude">Longitud</label>
                    <input type="number" id="longitude" name="longitude" step="any">
                </div>
                <div class="form-group">
                    <label for="status">Estado</label>
                    <select id="status" name="status" required>
                        <option value="disponible">Disponible</option>
                        <option value="vendido">Vendido</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Agregar Propiedad</button>
            </form>
            <a href="dashboard.php" class="btn btn-secondary">Inicio</a>
        </div>
    </section>
    <script src="../assets/js/main.js"></script>
</body>
</html>