<?php
include 'includes/config.php';

// Obtener los valores de los filtros, incluyendo el nuevo campo de búsqueda
$listing_type = isset($_GET['listing_type']) ? $_GET['listing_type'] : 'venta';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$category = isset($_GET['category']) ? $_GET['category'] : '';
$location = isset($_GET['location']) ? $_GET['location'] : '';
$min_price = isset($_GET['min_price']) && is_numeric($_GET['min_price']) ? $_GET['min_price'] : null;
$max_price = isset($_GET['max_price']) && is_numeric($_GET['max_price']) ? $_GET['max_price'] : null;


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
if ($min_price !== null) {
    $sql .= " AND price >= :min_price";
    $params[':min_price'] = $min_price;
}
if ($max_price !== null) {
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
    <title>Propiedades - CedralSales</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body class="properties-page">
    <?php include 'includes/header_properties.php'; ?>
    <nav>
        <ul>
            <li class="menu-header">
                <span class="menu-title">Tu propiedad ideal</span>
                <span class="close-menu">✕</span>
            </li>

            <li><a href="index.php"><img src="assets/images/iconcaracteristic/home-icon.png" alt="Inicio Icon" class="nav-icon">Inicio</a></li>
            <li><a href="properties.php"><img src="assets/images/iconcaracteristic/properties-icon.png" alt="Propiedades Icon" class="nav-icon">Propiedades</a></li>
            <li><a href="contact.php"><img src="assets/images/iconcaracteristic/contact-icon.png" alt="Contacto Icon" class="nav-icon">Contacto</a></li>
            <li><a href="about.php"><img src="assets/images/iconcaracteristic/about-icon.png" alt="Sobre Nosotros Icon" class="nav-icon">Sobre Nosotros</a></li>
            <li><a href="join.php"><img src="assets/images/iconcaracteristic/join-icon.png" alt="Únete a Nosotros Icon" class="nav-icon">Únete a Nosotros</a></li>
            <li><a href="admin/index.php"><img src="assets/images/iconcaracteristic/account-icon.png" alt="Mi Cuenta Icon" class="nav-icon">Mi Cuenta</a></li>
        </ul>
    </nav>
    <div id="page-overlay"></div>
    
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
                    <p>No se encontraron propiedades con los filtros seleccionados.</p>
                <?php endif; ?>
            </div>
        </div>
    </section>
    
    <?php include 'includes/footer.php'; ?>
    <script src="assets/js/main.js"></script>
</body>
</html>