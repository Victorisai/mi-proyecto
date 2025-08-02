<?php
include 'includes/config.php';

// Obtener los valores de los filtros, incluyendo el nuevo campo de búsqueda
$listing_type = isset($_GET['listing_type']) ? $_GET['listing_type'] : 'venta';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$category = isset($_GET['category']) ? $_GET['category'] : '';
$location = isset($_GET['location']) ? $_GET['location'] : '';
$min_price = isset($_GET['min_price']) && $_GET['min_price'] !== '' ? (float)$_GET['min_price'] : '';
$max_price = isset($_GET['max_price']) && $_GET['max_price'] !== '' ? (float)$_GET['max_price'] : '';

// Construir la consulta SQL base
$sql = "SELECT * FROM properties WHERE status = 'disponible' AND listing_type = :listing_type";
$params = [':listing_type' => $listing_type];

// Añadir condiciones a la consulta si los filtros están activos
if ($search) {
    $sql .= " AND (title LIKE :search OR description LIKE :search)";
    $params[':search'] = '%' . $search . '%';
}
if ($category) {
    $sql .= " AND category = :category";
    $params[':category'] = $category;
}
if ($location) {
    $sql .= " AND location = :location";
    $params[':location'] = $location;
}
if ($min_price !== '') {
    $sql .= " AND price >= :min_price";
    $params[':min_price'] = $min_price;
}
if ($max_price !== '') {
    $sql .= " AND price <= :max_price";
    $params[':max_price'] = $max_price;
}

$sql .= " ORDER BY created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$properties = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Propiedades - DOMABLY</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body class="properties-page">
    <?php include 'includes/header_properties.php'; ?>
    
    <main class="properties">
        <div class="container">
            <div class="property-grid">
                <?php if (count($properties) > 0): ?>
                    <?php foreach ($properties as $property): ?>
                        <div class="property-card">
                            <a href="property_detail.php?id=<?php echo $property['id']; ?>" class="property-card__link">
                                <img class="property-card__image" src="<?php echo htmlspecialchars($property['main_image']); ?>" alt="<?php echo htmlspecialchars($property['title']); ?>">
                                <div class="property-card__info">
                                    <h3 class="property-card__title"><?php echo htmlspecialchars($property['title']); ?></h3>
                                    <p class="property-card__location"><?php echo htmlspecialchars($property['location']); ?></p>
                                    <p class="property-card__price">$<?php echo number_format($property['price'], 2); ?> MXN</p>
                                    <span class="property-card__category"><?php echo htmlspecialchars(ucfirst($property['category'])); ?></span>
                                </div>
                            </a>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p class="properties__no-results">No se encontraron propiedades que coincidan con tu búsqueda.</p>
                <?php endif; ?>
            </div>
        </div>
    </main>

    <?php include 'includes/footer.php'; ?>
    <script src="assets/js/main.js"></script>
</body>
</html>