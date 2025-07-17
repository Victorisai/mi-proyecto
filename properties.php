<?php
include 'includes/config.php';

// Obtener los valores de los filtros, incluyendo el nuevo campo de búsqueda
$listing_type = isset($_GET['listing_type']) ? $_GET['listing_type'] : 'venta';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$category = isset($_GET['category']) ? $_GET['category'] : '';
$location = isset($_GET['location']) ? $_GET['location'] : '';

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
    <title>Propiedades - CedralSales</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <?php include 'includes/header.php'; ?>
<section class="filters-section-v2">
    <div class="container">
        <div class="filters-container">
            <div class="filter-tabs">
                <a href="properties.php?listing_type=venta" class="tab-link" data-listing="venta">Comprar</a>
                <a href="properties.php?listing_type=renta" class="tab-link" data-listing="renta">Rentar</a>
            </div>

            <form class="horizontal-filter-form" method="GET" action="properties.php">
                <input type="hidden" name="listing_type" value="<?php echo htmlspecialchars($listing_type); ?>">
                <div class="form-control-group">
                    <label for="category-select" class="sr-only">Tipo de Propiedad</label>
                    <select name="category" id="category-select">
                        <option value="">Tipo de Propiedad</option>
                        <option value="casas" <?php if (($category ?? '') == 'casas') echo 'selected'; ?>>Casas</option>
                        <option value="departamentos" <?php if (($category ?? '') == 'departamentos') echo 'selected'; ?>>Departamentos</option>
                        <option value="terrenos" <?php if (($category ?? '') == 'terrenos') echo 'selected'; ?>>Terrenos</option>
                        <option value="desarrollos" <?php if (($category ?? '') == 'desarrollos') echo 'selected'; ?>>Desarrollos</option>
                    </select>
                </div>
                <div class="form-control-group search-input-group">
                    <label for="search-input" class="sr-only">Ubicación o características</label>
                    <input type="text" id="search-input" name="search" placeholder="Ingresa ubicaciones o características (ej: casa)" value="<?php echo htmlspecialchars($search ?? ''); ?>">
                </div>
                <div class="form-control-group">
                    <button type="submit" class="btn-search-main">Buscar</button>
                </div>
            </form>
        </div>
    </div>
</section>
    <section class="properties">
        <div class="container">
            <div class="property-grid">
                <?php if (count($properties) > 0): ?>
                    <?php foreach ($properties as $property): ?>
                        <div class="property-card">
                            <img class="property-card__image" src="<?php echo htmlspecialchars($property['main_image']); ?>" alt="<?php echo htmlspecialchars($property['title']); ?>">
                            <h3 class="property-card__title"><?php echo htmlspecialchars($property['title']); ?></h3>
                            <p class="property-card__location"><strong>Ubicación:</strong> <?php echo htmlspecialchars($property['location']); ?></p>
                            <p class="property-card__price"><strong>Precio:</strong> $<?php echo number_format($property['price'], 2); ?> MXN</p>
                            <p class="property-card__category"><strong>Categoría:</strong> <?php echo htmlspecialchars(ucfirst($property['category'])); ?></p>
                            <a href="property_detail.php?id=<?php echo $property['id']; ?>" class="btn btn-primary">Ver Detalles</a>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p>No se encontraron propiedades disponibles.</p>
                <?php endif; ?>
            </div>
        </div>
    </section>
    <?php include 'includes/footer.php'; ?>
    <script src="assets/js/main.js"></script>
</body>
</html>