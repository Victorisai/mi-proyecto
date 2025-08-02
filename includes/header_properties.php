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
$min_price = isset($_GET['min_price']) ? $_GET['min_price'] : '';
$max_price = isset($_GET['max_price']) ? $_GET['max_price'] : '';

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
                <input type="hidden" name="category" value="<?php echo htmlspecialchars($category); ?>">
                <input type="hidden" name="location" value="<?php echo htmlspecialchars($location); ?>">
                <input type="hidden" name="min_price" value="<?php echo htmlspecialchars($min_price); ?>">
                <input type="hidden" name="max_price" value="<?php echo htmlspecialchars($max_price); ?>">
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
                <a href="?listing_type=venta&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($category); ?>&location=<?php echo urlencode($location); ?>&min_price=<?php echo urlencode($min_price); ?>&max_price=<?php echo urlencode($max_price); ?>" class="header-properties__button <?php echo $listing_type === 'venta' ? 'active' : ''; ?>">Comprar</a>
                <a href="?listing_type=renta&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($category); ?>&location=<?php echo urlencode($location); ?>&min_price=<?php echo urlencode($min_price); ?>&max_price=<?php echo urlencode($max_price); ?>" class="header-properties__button <?php echo $listing_type === 'renta' ? 'active' : ''; ?>">Rentar</a>
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

                <div class="header-properties__filter-group header-properties__filter-group--price">
                    <button type="button" class="header-properties__price-toggle">Precios</button>
                    <div class="header-properties__price-dropdown">
                        <div class="header-properties__price-inputs">
                            <input type="number" name="min_price" id="min-price-input" class="header-properties__price-input" placeholder="Mín" value="<?php echo htmlspecialchars($min_price); ?>" min="0" step="1000">
                            <input type="number" name="max_price" id="max-price-input" class="header-properties__price-input" placeholder="Máx" value="<?php echo htmlspecialchars($max_price); ?>" min="0" step="1000">
                        </div>
                        <div class="header-properties__price-sliders">
                            <input type="range" id="price-min-range" class="header-properties__price-slider" min="0" max="10000000" step="1000" value="<?php echo $min_price !== '' ? htmlspecialchars($min_price) : 0; ?>">
                            <input type="range" id="price-max-range" class="header-properties__price-slider" min="0" max="10000000" step="1000" value="<?php echo $max_price !== '' ? htmlspecialchars($max_price) : 10000000; ?>">
                        </div>
                        <button type="submit" class="header-properties__price-apply">Aplicar</button>
                    </div>
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