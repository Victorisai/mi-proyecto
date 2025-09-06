<?php
include 'includes/config.php';

// Obtener los valores de los filtros
$listing_type = isset($_GET['listing_type']) ? $_GET['listing_type'] : 'venta';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$category = isset($_GET['category']) ? $_GET['category'] : '';
$location = isset($_GET['location']) ? $_GET['location'] : '';
$min_price = isset($_GET['min_price']) && is_numeric($_GET['min_price']) ? $_GET['min_price'] : '';
$max_price = isset($_GET['max_price']) && is_numeric($_GET['max_price']) ? $_GET['max_price'] : '';
$price_range_sql = "SELECT MIN(price) as min_val, MAX(price) as max_val FROM properties WHERE status = 'disponible' AND listing_type = :listing_type";
$price_stmt = $pdo->prepare($price_range_sql);
$price_stmt->execute([':listing_type' => $listing_type]);
$price_range = $price_stmt->fetch(PDO::FETCH_ASSOC);
$global_min_price = $price_range['min_val'] ? floor($price_range['min_val']) : 0;
$global_max_price = $price_range['max_val'] ? ceil($price_range['max_val']) : 50000000;
// Si solo hay un precio, añade un margen para que el slider funcione
if ($global_min_price === $global_max_price) {
    $global_max_price += 1000;
}


// Construir la consulta SQL base para FILTRAR las propiedades
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

<!-- ENCABEZADO -->
<?php
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
    
    <div id="header-scroll-trigger"></div> <main class="properties">
        <div class="container">
            <div class="properties-header">
                <h1 class="properties-header__main-title">Navega nuevas opciones</h1>
                <h2 class="properties-header__title"><?php echo count($properties); ?> resultados que podrían interesarte</h2>
            </div>
            <div class="property-grid">
                <?php if (count($properties) > 0): ?>
                    <?php foreach ($properties as $property): ?>
                        <div class="property-card">
                            <a href="property_detail.php?id=<?php echo $property['id']; ?>" class="property-card__link">
                                <div class="property-card__image-container">
                                    <img class="property-card__image" src="<?php echo htmlspecialchars($property['main_image']); ?>" alt="<?php echo htmlspecialchars($property['title']); ?>">
                                    <div class="property-card__badge property-card__badge--listing"><?php echo htmlspecialchars(ucfirst($property['listing_type'])); ?></div>
                                    <div class="property-card__badge property-card__badge--category"><?php echo htmlspecialchars(ucfirst($property['category'])); ?></div>
                                </div>
                                <div class="property-card__content">
                                    <h3 class="property-card__title"><?php echo htmlspecialchars($property['title']); ?></h3>
                                    <p class="property-card__location">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                        </svg>
                                        <?php echo htmlspecialchars($property['location']); ?>
                                    </p>
                                </div>
                                <div class="property-card__footer">
                                    <p class="property-card__price">$<?php echo number_format($property['price'], 2); ?> MXN</p>
                                    <span class="property-card__details-button">Ver detalles &rarr;</span>
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

<!-- FOOTER -->
<footer class="site-footer">
    <div class="container">
        <div class="site-footer__grid">
            <div class="site-footer__column">
                <h3 class="site-footer__logo">DOMABLY</h3>
                <p>Encuentra la propiedad de tus sueños. Te acompañamos en cada paso del camino.</p>
            </div>

            <div class="site-footer__column">
                <h4>Explora</h4>
                <ul>
                    <li><a href="properties.php?category=terrenos">Terrenos</a></li>
                    <li><a href="properties.php?category=casas">Casas</a></li>
                    <li><a href="properties.php?category=departamentos">Departamentos</a></li>
                    <li><a href="properties.php?category=desarrollos">Desarrollos</a></li>
                    <li><a href="contact.php">Contacto</a></li>
                </ul>
            </div>

            <div class="site-footer__column">
                <h4>Contáctanos</h4>
                <p><i class="icon-phone"></i> (52) 999-763-2818</p>
                <p><i class="icon-email"></i> <a href="mailto:info@cedralsales.com">info@cedralsales.com</a></p>
                <p><i class="icon-location"></i> Cancún, Quintana Roo, México</p>
            </div>

            <div class="site-footer__column">
                <h4>Síguenos</h4>
                <div class="site-footer__socials">
                    <a href="#" class="site-footer__social-link" target="_blank"><img src="assets/images/iconcaracteristic/facebook-icon.png" alt="Facebook"></a>
                    <a href="#" class="site-footer__social-link" target="_blank"><img src="assets/images/iconcaracteristic/instagram-icon.png" alt="Instagram"></a>
                    <a href="#" class="site-footer__social-link" target="_blank"><img src="assets/images/iconcaracteristic/twitter-icon.png" alt="Twitter"></a>
                </div>
            </div>
        </div>
    </div>
    <div class="site-footer__bottom">
        <p>&copy; <?php echo date("Y"); ?> DOMABLY. Todos los derechos reservados.</p>
    </div>
</footer>
    <script src="assets/js/main.js"></script>
</body>
</html>