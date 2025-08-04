<?php
// victorisai/mi-proyecto/mi-proyecto-0515720bd1e04444b2689a864b97f3bce45533b8/includes/header_properties.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($pdo)) {
    include 'config.php';
}

// --- Lógica de Filtros (sin cambios) ---
$listing_type = isset($_GET['listing_type']) ? $_GET['listing_type'] : 'venta';
$category = isset($_GET['category']) ? $_GET['category'] : '';
$location = isset($_GET['location']) ? $_GET['location'] : '';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$min_price = isset($_GET['min_price']) && is_numeric($_GET['min_price']) ? $_GET['min_price'] : '';
$max_price = isset($_GET['max_price']) && is_numeric($_GET['max_price']) ? $_GET['max_price'] : '';


$locations_stmt = $pdo->query("SELECT DISTINCT location FROM properties WHERE status = 'disponible' ORDER BY location ASC");
$available_locations = $locations_stmt->fetchAll(PDO::FETCH_COLUMN);
?>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.7.1/nouislider.min.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.7.1/nouislider.min.js"></script>
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
                <button type="submit" class="header-properties__search-button" aria-label="Buscar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </form>
        </div>
    </div>

    <hr class="header-properties__divider">

    <div class="header-properties__bottom">
        <form action="properties.php" method="GET" class="header-properties__filters-form" id="filters-form">
            <div class="header-properties__listing-type">
                <a href="?listing_type=venta&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($category); ?>&location=<?php echo urlencode($location); ?>" class="header-properties__button <?php echo $listing_type === 'venta' ? 'active' : ''; ?>">Comprar</a>
                <a href="?listing_type=renta&search=<?php echo urlencode($search); ?>&category=<?php echo urlencode($category); ?>&location=<?php echo urlencode($location); ?>" class="header-properties__button <?php echo $listing_type === 'renta' ? 'active' : ''; ?>">Rentar</a>
            </div>

            <button type="button" class="header-properties__filter-toggle" id="filter-toggle-btn">Filtros</button>

            <div class="header-properties__filters-wrapper" id="filters-wrapper">
                <div class="header-properties__filter-group">
                    <select name="category" class="header-properties__select" onchange="this.form.submit()">
                        <option value="">Tipo de Propiedad</option>
                        <option value="casas" <?php if ($category == 'casas') echo 'selected'; ?>>Casas</option>
                        <option value="departamentos" <?php if ($category == 'departamentos') echo 'selected'; ?>>Departamentos</option>
                        <option value="terrenos" <?php if ($category == 'terrenos') echo 'selected'; ?>>Terrenos</option>
                        <option value="desarrollos" <?php if ($category == 'desarrollos') echo 'selected'; ?>>Desarrollos</option>
                    </select>
                </div>

                <div class="header-properties__filter-group">
                    <select name="location" class="header-properties__select" onchange="this.form.submit()">
                        <option value="">Ubicación</option>
                        <?php foreach ($available_locations as $loc): ?>
                            <option value="<?php echo htmlspecialchars($loc); ?>" <?php if ($location == $loc) echo 'selected'; ?>><?php echo htmlspecialchars($loc); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div class="header-properties__filter-group header-properties__filter-group--price">
                    <button type="button" id="price-filter-btn" class="header-properties__select">
                        <?php echo ($min_price !== '' && $max_price !== '') ? '$' . number_format($min_price) . ' - $' . number_format($max_price) : 'Rango de Precios'; ?>
                    </button>
                    <div class="price-filter__popover" id="price-filter-popover">
                        <div class="price-filter__inputs">
                            <div class="price-filter__input-group">
                                <label for="min-price-input">Mínimo</label>
                                <input type="text" id="min-price-input" placeholder="$0">
                            </div>
                            <span>-</span>
                            <div class="price-filter__input-group">
                                <label for="max-price-input">Máximo</label>
                                <input type="text" id="max-price-input" placeholder="$50,000,000+">
                            </div>
                        </div>
                        <div class="price-filter__slider" id="price-slider"></div>
                        <button type="submit" class="btn btn-primary price-filter__apply-btn">Aplicar</button>
                    </div>
                </div>
            </div>
            
            <input type="hidden" name="search" value="<?php echo htmlspecialchars($search); ?>">
            <input type="hidden" name="listing_type" value="<?php echo htmlspecialchars($listing_type); ?>">
            <input type="hidden" name="min_price" id="min_price_hidden" value="<?php echo htmlspecialchars($min_price); ?>">
            <input type="hidden" name="max_price" id="max_price_hidden" value="<?php echo htmlspecialchars($max_price); ?>">
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

<script>
    const php_min_price_available = <?php echo json_encode($global_min_price); ?>;
    const php_max_price_available = <?php echo json_encode($global_max_price); ?>;
    const php_min_price_selected = <?php echo json_encode($min_price); ?>;
    const php_max_price_selected = <?php echo json_encode($max_price); ?>;

    // CAMBIO: Añadimos un pequeño script para el nuevo botón
    document.addEventListener('DOMContentLoaded', () => {
        const filterToggleBtn = document.getElementById('filter-toggle-btn');
        const filtersWrapper = document.getElementById('filters-wrapper');

        if (filterToggleBtn && filtersWrapper) {
            filterToggleBtn.addEventListener('click', () => {
                filtersWrapper.classList.toggle('active');
            });
        }
    });
</script>