<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CedralSales - Venta de Propiedades</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body class="home">
    <!-- Encabezado -->
    <?php include 'includes/header.php'; ?>

    <!-- Banner Principal -->
<section class="hero">
    <div class="hero-slideshow">
        <div class="hero-slide" style="background-image: url('assets/images/hero/placeholder.jpg');"></div>
        <div class="hero-slide" style="background-image: url('assets/images/hero/placeholder2.jpg');"></div>
        <div class="hero-slide" style="background-image: url('assets/images/hero/placeholder3.jpg');"></div>
        <div class="hero-slide" style="background-image: url('assets/images/hero/placeholder4.jpg');"></div>
        <div class="hero-slide" style="background-image: url('assets/images/hero/placeholder5.jpg');"></div>
    </div>
    <div class="hero-content">
        <h1>Encuentra la <br> Propiedad de tus Sueños</h1>
        <p>Explora terrenos, casas, departamentos y desarrollos en CedralSales</p>
        <a href="properties.php" class="btn btn-primary">Ver Propiedades</a>
    </div>
    <div class="progress-container">
        <div class="progress-bar"><div class="progress-bar-fill"></div></div>
        <div class="progress-bar"><div class="progress-bar-fill"></div></div>
        <div class="progress-bar"><div class="progress-bar-fill"></div></div>
        <div class="progress-bar"><div class="progress-bar-fill"></div></div>
        <div class="progress-bar"><div class="progress-bar-fill"></div></div>
    </div>
</section>

    <!-- Propiedades Destacadas -->
    <div class="carousel-wrapper">

        <section class="property-showcase">
            <div class="container">
                <div class="showcase-header">
                    <h2>Propiedades Destacadas</h2>
                    <a href="properties.php?listing_type=venta" class="view-all-link view-all-mobile">Ver todos</a>
                </div>
                <div class="carousel-nav">
                    <a href="properties.php?listing_type=venta" class="view-all-link view-all-desktop">Ver todos</a>
                    <button class="carousel-arrow prev-arrow" id="destacadas-prev">&lt;</button>
                    <button class="carousel-arrow next-arrow" id="destacadas-next">&gt;</button>
                </div>
                <div class="property-carousel" id="destacadas-carousel">
                    <?php
                    include 'includes/config.php';
                    // Obtener hasta 10 propiedades en venta
                    $stmt_sale = $pdo->prepare("SELECT * FROM properties WHERE status = 'disponible' AND listing_type = 'venta' ORDER BY created_at DESC LIMIT 10");
                    $stmt_sale->execute();
                    $sale_properties = $stmt_sale->fetchAll(PDO::FETCH_ASSOC);

                    foreach ($sale_properties as $property) {
                        ?>
                        <div class="property-slide-card">
                            <a href="property_detail.php?id=<?php echo $property['id']; ?>">
                                <div class="property-category-badge"><?php echo ucfirst($property['category']); ?></div>
                                <img src="<?php echo htmlspecialchars($property['main_image']); ?>" alt="<?php echo htmlspecialchars($property['title']); ?>">
                                <div class="slide-card-info">
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
        </section>
        <section class="property-showcase">
            <div class="container">
                <div class="showcase-header">
                    <h2>Propiedades en Renta</h2>
                    <a href="properties.php?listing_type=renta" class="view-all-link view-all-mobile">Ver todos</a>
                </div>
                <div class="carousel-nav">
                    <a href="properties.php?listing_type=renta" class="view-all-link view-all-desktop">Ver todos</a>
                    <button class="carousel-arrow prev-arrow" id="renta-prev">&lt;</button>
                    <button class="carousel-arrow next-arrow" id="renta-next">&gt;</button>
                </div>
                <div class="property-carousel" id="renta-carousel">
                    <?php
                    // Obtener hasta 10 propiedades en renta
                    $stmt_rent = $pdo->prepare("SELECT * FROM properties WHERE status = 'disponible' AND listing_type = 'renta' ORDER BY created_at DESC LIMIT 10");
                    $stmt_rent->execute();
                    $rent_properties = $stmt_rent->fetchAll(PDO::FETCH_ASSOC);

                    foreach ($rent_properties as $property) {
                        ?>
                        <div class="property-slide-card">
                            <a href="property_detail.php?id=<?php echo $property['id']; ?>">
                                <div class="property-category-badge"><?php echo ucfirst($property['category']); ?></div>
                                <img src="<?php echo htmlspecialchars($property['main_image']); ?>" alt="<?php echo htmlspecialchars($property['title']); ?>">
                                <div class="slide-card-info">
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
        </section>

    </div>

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
<section id="experiences" class="experiences-section">
    <div class="container">
        <h2>Experiencias Locales</h2>

        <div class="experiences-tabs-container">
            <div class="tabs" id="location-tabs">
                <?php foreach ($locations as $index => $location): ?>
                    <button class="tab-button <?php echo $index == 0 ? 'active' : ''; ?>" data-location="location-<?php echo $location['id']; ?>">
                        <?php echo htmlspecialchars($location['name']); ?>
                    </button>
                <?php endforeach; ?>
            </div>
            <select id="location-select" class="location-select">
                <?php foreach ($locations as $location): ?>
                    <option value="location-<?php echo $location['id']; ?>"><?php echo htmlspecialchars($location['name']); ?></option>
                <?php endforeach; ?>
            </select>
        </div>

        <div class="tab-content" id="tab-content">
            <?php foreach ($locations as $index => $location): ?>
                <div id="location-<?php echo $location['id']; ?>" class="location-content <?php echo $index == 0 ? 'active' : ''; ?>">
                    <div class="experiences-carousel-wrapper">
                        <button class="arrow arrow-left">&lt;</button>
                        
                        <div class="experiences-grid">
                            <?php foreach ($experiences[$location['id']] as $experience): ?>
                                <a href="properties.php?location=<?php echo urlencode($location['municipality']); ?>" class="experience-card-link">
                                    <div class="experience-card">
                                        <img src="<?php echo htmlspecialchars($experience['image']); ?>" alt="<?php echo htmlspecialchars($experience['title']); ?>">
                                        <div class="experience-card-overlay">
                                            <h3><?php echo htmlspecialchars($experience['title']); ?></h3>
                                            <p><?php echo htmlspecialchars($experience['description']); ?></p>
                                        </div>
                                    </div>
                                </a>
                            <?php endforeach; ?>
                        </div>
                        
                        <button class="arrow arrow-right">&gt;</button>
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

<section class="news-section-v2">
    <div class="container-v2">
        <div class="section-header">
            <h2>Al Día</h2>
            <a href="#" class="view-all-button">Ver todas las noticias</a>
        </div>
        
        <?php if ($main_news): ?>
        <div class="news-layout-grid">
            <div class="main-news-card">
                <a href="news_detail.php?id=<?php echo $main_news['id']; ?>">
                    <div class="image-container">
                        <img src="<?php echo htmlspecialchars(json_decode($main_news['images'])[0]); ?>" alt="<?php echo htmlspecialchars($main_news['title']); ?>">
                    </div>
                    <div class="content-overlay">
                        <span class="news-date"><?php echo date('d M Y', strtotime($main_news['date'])); ?></span>
                        <h3><?php echo htmlspecialchars($main_news['title']); ?></h3>
                        <p><?php echo substr(htmlspecialchars($main_news['information']), 0, 150) . '...'; ?></p>
                    </div>
                </a>
            </div>

            <div class="secondary-news-grid">
                <?php foreach ($secondary_news as $news): ?>
                <div class="secondary-news-card">
                    <a href="news_detail.php?id=<?php echo $news['id']; ?>">
                        <div class="image-container">
                            <img src="<?php echo htmlspecialchars(json_decode($news['images'])[0]); ?>" alt="<?php echo htmlspecialchars($news['title']); ?>">
                        </div>
                        <div class="content">
                            <span class="news-date"><?php echo date('d M Y', strtotime($news['date'])); ?></span>
                            <h4><?php echo htmlspecialchars($news['title']); ?></h4>
                            <p class="secondary-news-excerpt"><?php echo substr(htmlspecialchars($news['information']), 0, 80) . '...'; ?></p>
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
