<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Domably - Venta de Propiedades</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body class="home">
    <!-- Encabezado -->
    <?php include 'includes/header.php'; ?>

    <!-- Banner Principal -->
<section class="hero">
    <?php
    if (!isset($pdo)) {
        include 'includes/config.php';
    }
    $stmt = $pdo->prepare("SELECT * FROM hero_images ORDER BY display_order ASC, id DESC");
    $stmt->execute();
    $hero_images = $stmt->fetchAll(PDO::FETCH_ASSOC);
    ?>

    <div class="hero__slideshow">
        <?php foreach ($hero_images as $image): ?>
            <div class="hero__slide" style="background-image: url('<?php echo htmlspecialchars($image['image_path']); ?>');"></div>
        <?php endforeach; ?>
    </div>
    
    <div class="hero__content">
        <h1>Encuentra la <br> Propiedad de tus Sueños</h1>
        <p>Explora terrenos, casas, departamentos y desarrollos en Domably</p>
        <a href="properties.php" class="btn btn-primary">Ver Propiedades</a>
    </div>
    <div class="hero__progress-container">
        <?php foreach ($hero_images as $image): ?>
            <div class="hero__progress-bar"><div class="hero__progress-bar-fill"></div></div>
        <?php endforeach; ?>
    </div>
</section>

    <!-- Propiedades Destacadas -->
    <div class="carousel-wrapper">

    <section class="property-showcase" id="destacadas-showcase">
        <div class="container">
            <div class="property-showcase__header">
                <h2>Propiedades Destacadas</h2>
                <div class="property-showcase__carousel-nav">
                    <a href="properties.php?listing_type=venta" class="view-all-link">Ver todas</a>
                    <button class="property-showcase__carousel-arrow prev-arrow" id="destacadas-prev">&lt;</button>
                    <button class="property-showcase__carousel-arrow next-arrow" id="destacadas-next">&gt;</button>
                </div>
            </div>
            <div class="property-showcase__wrapper">
                <aside class="property-showcase__filter-aside">
                    <h4>Categorías</h4>
                    <ul>
                        <li><a href="#" class="property-showcase__filter-link active" data-category="all">Todas</a></li>
                        <li><a href="#" class="property-showcase__filter-link" data-category="casas">Casas</a></li>
                        <li><a href="#" class="property-showcase__filter-link" data-category="departamentos">Departamentos</a></li>
                        <li><a href="#" class="property-showcase__filter-link" data-category="terrenos">Terrenos</a></li>
                        <li><a href="#" class="property-showcase__filter-link" data-category="desarrollos">Desarrollos</a></li>
                    </ul>
                </aside>
                <div class="property-showcase__carousel" id="destacadas-carousel">
                    <?php
                    include 'includes/config.php';
                    // Obtener hasta 10 propiedades en venta
                    $stmt_sale = $pdo->prepare("SELECT * FROM properties WHERE status = 'disponible' AND listing_type = 'venta' ORDER BY created_at DESC LIMIT 10");
                    $stmt_sale->execute();
                    $sale_properties = $stmt_sale->fetchAll(PDO::FETCH_ASSOC);

                    foreach ($sale_properties as $property) {
                        ?>
                        <div class="property-showcase__slide-card" data-category="<?php echo htmlspecialchars($property['category']); ?>">
                            <a href="property_detail.php?id=<?php echo $property['id']; ?>">
                                <div class="property-showcase__category-badge"><?php echo ucfirst($property['category']); ?></div>
                                <img src="<?php echo htmlspecialchars($property['main_image']); ?>" alt="<?php echo htmlspecialchars($property['title']); ?>">
                                <div class="property-showcase__slide-card-info">
                                    <p class="price">$<?php echo number_format($property['price'], 0); ?> MXN</p>
                                    <p class="title"><?php echo htmlspecialchars($property['title']); ?></p>
                                </div>
                            </a>
                        </div>
                        <?php
                    }
                    ?>
                </div>
            </div>
        </div>
    </section>

    <section class="property-showcase" id="renta-showcase">
        <div class="container">
            <div class="property-showcase__header">
                <h2>Propiedades en Renta</h2>
                <div class="property-showcase__carousel-nav">
                    <a href="properties.php?listing_type=renta" class="view-all-link">Ver todas</a>
                    <button class="property-showcase__carousel-arrow prev-arrow" id="renta-prev">&lt;</button>
                    <button class="property-showcase__carousel-arrow next-arrow" id="renta-next">&gt;</button>
                </div>
            </div>
            <div class="property-showcase__wrapper">
                <aside class="property-showcase__filter-aside">
                    <h4>Categorías</h4>
                    <ul>
                        <li><a href="#" class="property-showcase__filter-link active" data-category="all">Todas</a></li>
                        <li><a href="#" class="property-showcase__filter-link" data-category="casas">Casas</a></li>
                        <li><a href="#" class="property-showcase__filter-link" data-category="departamentos">Departamentos</a></li>
                        <li><a href="#" class="property-showcase__filter-link" data-category="terrenos">Terrenos</a></li>
                        <li><a href="#" class="property-showcase__filter-link" data-category="desarrollos">Desarrollos</a></li>
                    </ul>
                </aside>
                <div class="property-showcase__carousel" id="renta-carousel">
                    <?php
                    // Obtener hasta 10 propiedades en renta
                    $stmt_rent = $pdo->prepare("SELECT * FROM properties WHERE status = 'disponible' AND listing_type = 'renta' ORDER BY created_at DESC LIMIT 10");
                    $stmt_rent->execute();
                    $rent_properties = $stmt_rent->fetchAll(PDO::FETCH_ASSOC);

                    foreach ($rent_properties as $property) {
                        ?>
                        <div class="property-showcase__slide-card" data-category="<?php echo htmlspecialchars($property['category']); ?>">
                            <a href="property_detail.php?id=<?php echo $property['id']; ?>">
                                <div class="property-showcase__category-badge"><?php echo ucfirst($property['category']); ?></div>
                                <img src="<?php echo htmlspecialchars($property['main_image']); ?>" alt="<?php echo htmlspecialchars($property['title']); ?>">
                                <div class="property-showcase__slide-card-info">
                                    <p class="price">$<?php echo number_format($property['price'], 0); ?> MXN / Mes</p>
                                    <p class="title"><?php echo htmlspecialchars($property['title']); ?></p>
                                </div>
                            </a>
                        </div>
                        <?php
                    }
                    ?>
                </div>
            </div>
        </div>
    </section>

    </div>

    <!-- Sección de Informacion de la Plataforma -->

<section class="info">
    <div class="container">
        <div class="info__header">
            <h2>Domably: Tu Ecosistema Inmobiliario</h2>
        </div>
        <div class="info__grid">
            <div class="info__column">
                <img src="assets/images/iconcaracteristic/infoicon1.png" alt="Icono de propiedades" class="info__icon">
                <div class="info__text-content">
                    <h3>Un Universo de Propiedades</h3>
                    <p>Reunimos en un solo lugar las mejores propiedades de agencias inmobiliarias, brokers y vendedores independientes. Explora un inventario diverso y en constante crecimiento, todo al alcance de tu mano.</p>
                </div>
            </div>
            <div class="info__column">
                <img src="assets/images/iconcaracteristic/infoicon2.png" alt="Icono de búsqueda" class="info__icon">
                <div class="info__text-content">
                    <h3>Descubrimiento Inteligente</h3>
                    <p>Nuestra plataforma te permite filtrar y encontrar tu hogar o inversión ideal de manera rápida y sencilla. Busca por tipo de propiedad, compara opciones y guarda tus favoritas para tomar la mejor decisión.</p>
                </div>
            </div>
            <div class="info__column">
                <img src="assets/images/iconcaracteristic/infoicon3.png" alt="Icono de contacto" class="info__icon">
                <div class="info__text-content">
                    <h3>Conexión Directa con Profesionales</h3>
                    <p>Publica tus propiedades o encuentra la que buscas. Domably te conecta directamente con una amplia red de profesionales y clientes potenciales, facilitando una comunicación transparente y efectiva.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Sección de Experiencias Locales Curadas -->
<?php
require_once 'includes/config.php';

// Fetch all locations
$stmt = $pdo->query("SELECT * FROM locations ORDER BY name");
$locations = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Fetch experiences for each location
$experiences = [];
foreach ($locations as $location) {
    $stmt = $pdo->prepare("SELECT * FROM experiences WHERE location_id = :location_id ORDER BY created_at DESC");
    $stmt->execute(['location_id' => $location['id']]);
    $experiences[$location['id']] = $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>

<!-- Sección de Experiencias Locales Curadas -->
<section id="experiences" class="experiences">
    <div class="container">
        <h2>Experiencias Locales</h2>

        <div class="experiences__tabs-container">
            <div class="experiences__tabs" id="location-tabs">
                <?php foreach ($locations as $index => $location): ?>
                    <button class="experiences__tab-button <?php echo $index == 0 ? 'active' : ''; ?>" data-location="location-<?php echo $location['id']; ?>">
                        <?php echo htmlspecialchars($location['name']); ?>
                    </button>
                <?php endforeach; ?>
            </div>
            <select id="location-select" class="experiences__location-select">
                <?php foreach ($locations as $location): ?>
                    <option value="location-<?php echo $location['id']; ?>"><?php echo htmlspecialchars($location['name']); ?></option>
                <?php endforeach; ?>
            </select>
        </div>

        <div class="experiences__tab-content" id="tab-content">
            <?php foreach ($locations as $index => $location): ?>
                <div id="location-<?php echo $location['id']; ?>" class="experiences__location-content <?php echo $index == 0 ? 'active' : ''; ?>">
                    <div class="experiences__carousel-wrapper">
                        <button class="experiences__arrow experiences__arrow--left">&lt;</button>
                        
                        <div class="experiences__grid">
                            <?php foreach ($experiences[$location['id']] as $experience): ?>
                                <a href="properties.php?location=<?php echo urlencode($location['municipality']); ?>" class="experience-card">
                                    <div class="experience-card__content">
                                        <img src="<?php echo htmlspecialchars($experience['image']); ?>" alt="<?php echo htmlspecialchars($experience['title']); ?>">
                                        <div class="experience-card__overlay">
                                            <h3><?php echo htmlspecialchars($experience['title']); ?></h3>
                                            <p><?php echo htmlspecialchars($experience['description']); ?></p>
                                        </div>
                                    </div>
                                </a>
                            <?php endforeach; ?>
                        </div>
                        
                        <button class="experiences__arrow experiences__arrow--right">&gt;</button>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

    <!-- Modal para experiencias -->
    <div id="experience-modal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img id="modal-image" src="" alt="">
            <h3 id="modal-title"></h3>
            <p id="modal-description"></p>
        </div>
    </div>

        <!-- SECCION NOTICIAS -->

<?php
// CAMBIO: Obtenemos 5 noticias en lugar de 4
$stmt = $pdo->prepare("SELECT * FROM news ORDER BY display_order ASC LIMIT 5");
$stmt->execute();
$news_articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!empty($news_articles)) {
    $main_news = $news_articles[0]; 
    $secondary_news = array_slice($news_articles, 1, 4); 
} else {
    $main_news = null;
    $secondary_news = [];
}
?>

<section class="news">
    <div class="container container--v2">
        <div class="news__header">
            <h2>Al Día</h2>
            <a href="news.php" class="news__view-all">Ver todas las noticias</a>
        </div>
        
        <?php if ($main_news): ?>
        <div class="news__layout-grid">
            <div class="news-card news-card--main">
                <a href="news_detail.php?id=<?php echo $main_news['id']; ?>">
                    <div class="news-card__image-container">
                        <img src="<?php echo htmlspecialchars(json_decode($main_news['images'])[0]); ?>" alt="<?php echo htmlspecialchars($main_news['title']); ?>">
                    </div>
                    <div class="news-card__content-overlay">
                        <span class="news-card__date"><?php echo date('d M Y', strtotime($main_news['date'])); ?></span>
                        <h3><?php echo htmlspecialchars($main_news['title']); ?></h3>
                        <p><?php echo substr(htmlspecialchars($main_news['information']), 0, 150) . '...'; ?></p>
                    </div>
                </a>
            </div>

            <div class="news__secondary-grid">
                <?php foreach ($secondary_news as $news): ?>
                <div class="news-card news-card--secondary">
                    <a href="news_detail.php?id=<?php echo $news['id']; ?>">
                        <div class="news-card__image-container">
                            <img src="<?php echo htmlspecialchars(json_decode($news['images'])[0]); ?>" alt="<?php echo htmlspecialchars($news['title']); ?>">
                        </div>
                        <div class="news-card__content">
                            <span class="news-card__date"><?php echo date('d M Y', strtotime($news['date'])); ?></span>
                            <h4><?php echo htmlspecialchars($news['title']); ?></h4>
                            <p class="news-card__excerpt"><?php echo substr(htmlspecialchars($news['information']), 0, 80) . '...'; ?></p>
                        </div>
                    </a>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endif; ?>
    </div>
</section>

    <!-- Pie de Página -->
    <?php include 'includes/footer.php'; ?>

    <script src="assets/js/main.js"></script>
</body>
</html>
