<?php
include 'includes/config.php';

$category = isset($_GET['category']) ? $_GET['category'] : '';
$location = isset($_GET['location']) ? $_GET['location'] : '';

$sql = "SELECT * FROM properties WHERE status = 'disponible'";
$params = [];
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
    <section class="filters">
        <div class="container">
            <h2>Encuentra tu Propiedad Ideal</h2>
            <form class="filter-form" method="GET" action="properties.php">
                <div class="form-group">
                    <label for="category">Categoría</label>
                    <select name="category" id="category">
                        <option value="">Todas las Categorías</option>
                        <option value="terrenos" <?php if ($category == 'terrenos') echo 'selected'; ?>>Terrenos</option>
                        <option value="casas" <?php if ($category == 'casas') echo 'selected'; ?>>Casas</option>
                        <option value="departamentos" <?php if ($category == 'departamentos') echo 'selected'; ?>>Departamentos</option>
                        <option value="desarrollos" <?php if ($category == 'desarrollos') echo 'selected'; ?>>Desarrollos</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="location">Ubicación (Municipio)</label>
                    <select name="location" id="location">
                        <option value="">Todos los Municipios</option>
                        <option value="Cozumel" <?php if ($location == 'Cozumel') echo 'selected'; ?>>Cozumel</option>
                        <option value="Felipe Carrillo Puerto" <?php if ($location == 'Felipe Carrillo Puerto') echo 'selected'; ?>>Felipe Carrillo Puerto</option>
                        <option value="Isla Mujeres" <?php if ($location == 'Isla Mujeres') echo 'selected'; ?>>Isla Mujeres</option>
                        <option value="Othón P. Blanco" <?php if ($location == 'Othón P. Blanco') echo 'selected'; ?>>Othón P. Blanco</option>
                        <option value="Benito Juárez" <?php if ($location == 'Benito Juárez') echo 'selected'; ?>>Benito Juárez</option>
                        <option value="José María Morelos" <?php if ($location == 'José María Morelos') echo 'selected'; ?>>José María Morelos</option>
                        <option value="Lázaro Cárdenas" <?php if ($location == 'Lázaro Cárdenas') echo 'selected'; ?>>Lázaro Cárdenas</option>
                        <option value="Playa del Carmen" <?php if ($location == 'Playa del Carmen') echo 'selected'; ?>>Playa del Carmen</option>
                        <option value="Tulum" <?php if ($location == 'Tulum') echo 'selected'; ?>>Tulum</option>
                        <option value="Bacalar" <?php if ($location == 'Bacalar') echo 'selected'; ?>>Bacalar</option>
                        <option value="Puerto Morelos" <?php if ($location == 'Puerto Morelos') echo 'selected'; ?>>Puerto Morelos</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Filtrar</button>
            </form>
        </div>
    </section>
    <section class="properties">
        <div class="container">
            <div class="property-grid">
                <?php if (count($properties) > 0): ?>
                    <?php foreach ($properties as $property): ?>
                        <div class="property-card">
                            <img src="<?php echo htmlspecialchars($property['main_image']); ?>" alt="<?php echo htmlspecialchars($property['title']); ?>">
                            <h3><?php echo htmlspecialchars($property['title']); ?></h3>
                            <p><strong>Ubicación:</strong> <?php echo htmlspecialchars($property['location']); ?></p>
                            <p><strong>Precio:</strong> $<?php echo number_format($property['price'], 2); ?> MXN</p>
                            <p><strong>Categoría:</strong> <?php echo htmlspecialchars(ucfirst($property['category'])); ?></p>
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