<?php
// Asegurarse de que la sesión esté iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($pdo)) {
    include 'config.php';
}

// --- Lógica de Filtros ---
// Obtener los valores actuales de los filtros de la URL para mantener el estado
$listing_type = isset($_GET['listing_type']) ? $_GET['listing_type'] : 'venta';
$category = isset($_GET['category']) ? $_GET['category'] : '';
$location = isset($_GET['location']) ? $_GET['location'] : '';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

// Obtener todas las ubicaciones (municipios) de la base de datos para el dropdown
$locations_stmt = $pdo->query("SELECT DISTINCT location FROM properties WHERE status = 'disponible' ORDER BY location ASC");
$available_locations = $locations_stmt->fetchAll(PDO::FETCH_COLUMN);
?>
<header class="header-properties">
    <div class="header-properties__top">
        <div class="header__toggle">
            <span class="header__toggle-line"></span>
            <span class="header__toggle-line"></span>
            <span class="header__toggle-line"></span>
        </div>
        <div class="header__logo">
            <a href="index.php">
                <img src="assets/images/iconcaracteristic/logo-dark.png" alt="Logo DOMABLY" class="header__logo--dark">
            </a>
        </div>
        <div class="header-properties__search-container">
            <form action="properties.php" method="GET" class="header-properties__search-form">
                <input type="hidden" name="listing_type" value="<?php echo htmlspecialchars($listing_type); ?>">
                <input type="text" name="search" class="header-properties__search-input" placeholder="Buscar por título, descripción..." value="<?php echo htmlspecialchars($search); ?>">
                <button type="submit" class="header-properties__search-button">
                    <img src="assets/images/iconcaracteristic/search-icon.png" alt="Buscar">
                </button>
            </form>
        </div>
    </div>

    <hr class="header-properties__divider">

    <div class="header-properties__bottom">
        <form action="properties.php" method="GET" class="header-properties__filters-form">
            <div class="header-properties__listing-type">
                <a href="?listing_type=venta&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($category); ?>&location=<?php echo urlencode($location); ?>" class="header-properties__button <?php echo $listing_type === 'venta' ? 'active' : ''; ?>">Comprar</a>
                <a href="?listing_type=renta&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($category); ?>&location=<?php echo urlencode($location); ?>" class="header-properties__button <?php echo $listing_type === 'renta' ? 'active' : ''; ?>">Rentar</a>
            </div>

            <div class="header-properties__filters-scroll">
                <div class="header-properties__filter-group">
                    <label for="category-select" class="sr-only">Tipo de Propiedad</label>
                    <select name="category" id="category-select" class="header-properties__select" onchange="this.form.submit()">
                        <option value="">Tipo de Propiedad</option>
                        <option value="casas" <?php if ($category == 'casas') echo 'selected'; ?>>Casas</option>
                        <option value="departamentos" <?php if ($category == 'departamentos') echo 'selected'; ?>>Departamentos</option>
                        <option value="terrenos" <?php if ($category == 'terrenos') echo 'selected'; ?>>Terrenos</option>
                        <option value="desarrollos" <?php if ($category == 'desarrollos') echo 'selected'; ?>>Desarrollos</option>
                    </select>
                </div>

                <div class="header-properties__filter-group">
                    <label for="location-select" class="sr-only">Ubicación</label>
                    <select name="location" id="location-select" class="header-properties__select" onchange="this.form.submit()">
                        <option value="">Ubicación</option>
                        <?php foreach ($available_locations as $loc): ?>
                            <option value="<?php echo htmlspecialchars($loc); ?>" <?php if ($location == $loc) echo 'selected'; ?>>
                                <?php echo htmlspecialchars($loc); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            <input type="hidden" name="search" value="<?php echo htmlspecialchars($search); ?>">
            <input type="hidden" name="listing_type" value="<?php echo htmlspecialchars($listing_type); ?>">
        </form>
    </div>
</header>

<nav class="mobile-nav">
    <ul class="mobile-nav__list">
        <li class="mobile-nav__header">
            <span class="mobile-nav__title">Tu propiedad ideal</span>
            <span class="mobile-nav__close-button">✕</span>
        </li>
        <li class="mobile-nav__item"><a class="mobile-nav__link" href="index.php"><img src="assets/images/iconcaracteristic/home-icon.png" alt="Inicio Icon" class="mobile-nav__icon">Inicio</a></li>
        <li class="mobile-nav__item"><a class="mobile-nav__link" href="properties.php"><img src="assets/images/iconcaracteristic/properties-icon.png" alt="Propiedades Icon" class="mobile-nav__icon">Propiedades</a></li>
        <li class="mobile-nav__item"><a class="mobile-nav__link" href="contact.php"><img src="assets/images/iconcaracteristic/contact-icon.png" alt="Contacto Icon" class="mobile-nav__icon">Contacto</a></li>
        <li class="mobile-nav__item"><a class="mobile-nav__link" href="admin/index.php"><img src="assets/images/iconcaracteristic/account-icon.png" alt="Mi Cuenta Icon" class="mobile-nav__icon">Mi Cuenta</a></li>
    </ul>
</nav>
<div class="mobile-nav__overlay"></div>