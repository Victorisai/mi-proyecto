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
    <section class="featured-properties">
        <h2 class="fade-in">Propiedades Destacadas</h2>
        <div class="property-grid">
            <?php
            include 'includes/config.php';

            // Obtener las 3 propiedades más recientes
            $stmt = $pdo->prepare("SELECT * FROM properties WHERE status = 'disponible' AND listing_type = 'venta' ORDER BY created_at DESC LIMIT 3");
            $stmt->execute();
            $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($properties as $index => $property) {
                ?>
                <div class="property-card fade-in">
                    <img src="<?php echo htmlspecialchars($property['main_image']); ?>" alt="<?php echo htmlspecialchars($property['title']); ?>">
                    <h3><?php echo htmlspecialchars($property['title']); ?></h3>
                    <p>$<?php echo number_format($property['price'], 2); ?> MXN</p>
                    <a href="property_detail.php?id=<?php echo $property['id']; ?>" class="btn btn-secondary">Ver Detalles</a>
                </div>
                <?php
            }
            ?>
        </div>
    </section>
    <section class="featured-properties">
    <div class="container">
        <h2 class="fade-in">Propiedades en Renta</h2>
        <div class="property-grid">
            <?php
            // Obtener las 3 propiedades más recientes en renta
            $stmt_rent = $pdo->prepare("SELECT * FROM properties WHERE status = 'disponible' AND listing_type = 'renta' ORDER BY created_at DESC LIMIT 3");
            $stmt_rent->execute();
            $rent_properties = $stmt_rent->fetchAll(PDO::FETCH_ASSOC);

            if (count($rent_properties) > 0) {
                foreach ($rent_properties as $property) {
                    ?>
                    <div class="property-card fade-in">
                        <img src="<?php echo htmlspecialchars($property['main_image']); ?>" alt="<?php echo htmlspecialchars($property['title']); ?>">
                        <h3><?php echo htmlspecialchars($property['title']); ?></h3>
                        <p>$<?php echo number_format($property['price'], 2); ?> MXN / Mes</p>
                        <a href="property_detail.php?id=<?php echo $property['id']; ?>" class="btn btn-secondary">Ver Detalles</a>
                    </div>
                    <?php
                }
            } else {
                echo '<p>No hay propiedades en renta disponibles por el momento.</p>';
            }
            ?>
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
<section id="experiences">
    <div class="container">
        <h2>Experiencias Locales</h2>
        <!-- Pestañas para escritorio -->
        <div class="tabs" id="location-tabs">
            <?php foreach ($locations as $index => $location): ?>
                <button class="tab-button <?php echo $index == 0 ? 'active' : ''; ?>" data-location="location-<?php echo $location['id']; ?>">
                    <?php echo htmlspecialchars($location['name']); ?>
                </button>
            <?php endforeach; ?>
        </div>
        <!-- Desplegable para móvil -->
        <select id="location-select" class="location-select">
            <?php foreach ($locations as $location): ?>
                <option value="location-<?php echo $location['id']; ?>"><?php echo htmlspecialchars($location['name']); ?></option>
            <?php endforeach; ?>
        </select>
        <!-- Contenido de experiencias -->
        <div class="tab-content" id="tab-content">
            <?php foreach ($locations as $index => $location): ?>
                <div id="location-<?php echo $location['id']; ?>" class="location-content <?php echo $index == 0 ? 'active' : ''; ?>">
                    <div class="experiences-wrapper">
                        <button class="arrow arrow-left" data-location="location-<?php echo $location['id']; ?>">&lt;</button>
                        <div class="experiences">
                                <?php foreach ($experiences[$location['id']] as $exp_index => $experience): ?>
                                    <a href="properties.php?location=<?php echo urlencode($location['municipality']); ?>" class="experience-link">
                                        <div class="experience">
                                            <img src="<?php echo htmlspecialchars($experience['image']); ?>" alt="<?php echo htmlspecialchars($experience['title']); ?>">
                                            <h3><?php echo htmlspecialchars($experience['title']); ?></h3>
                                            <p><?php echo htmlspecialchars($experience['description']); ?></p>
                                            <button class="view-more">Ver más</button>
                                        </div>
                                    </a>
                                <?php endforeach; ?>
                        </div>
                        <button class="arrow arrow-right" data-location="location-<?php echo $location['id']; ?>">&gt;</button>
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
$stmt = $pdo->prepare("SELECT * FROM news ORDER BY display_order ASC LIMIT 4");
$stmt->execute();
$news_articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!empty($news_articles)) {
    $main_news = $news_articles[0]; // La primera noticia es la principal
    $secondary_news = array_slice($news_articles, 1, 3); // Las siguientes tres son secundarias
} else {
    $main_news = null;
    $secondary_news = [];
}
?>

<section class="news-section">
        <h2>Al día</h2>
    <div class="container">
        <div class="news-grid">
            <div class="main-news">
                <?php if ($main_news): ?>
                    <a href="news_detail.php?id=<?php echo $main_news['id']; ?>">
                    <img src="<?php echo htmlspecialchars(json_decode($main_news['images'])[0]); ?>" alt="<?php echo htmlspecialchars($main_news['title']); ?>">
                    <div class="news-content">
                        <span class="news-date"><?php echo date('d M Y', strtotime($main_news['date'])); ?></span>
                        <h3><?php echo htmlspecialchars($main_news['title']); ?></h3>
                        <p><?php echo substr(htmlspecialchars($main_news['information']), 0, 100) . '...'; ?></p>
                    </div>
                <?php endif; ?>
                            </a>
            </div>

            <div class="secondary-news">
                <?php foreach ($secondary_news as $news): ?>
                    <div class="news-item">
                        <a href="news_detail.php?id=<?php echo $news['id']; ?>">
                        <img src="<?php echo htmlspecialchars(json_decode($news['images'])[0]); ?>" alt="<?php echo htmlspecialchars($news['title']); ?>">
                        <div class="news-content">
                            <span class="news-date"><?php echo date('d M Y', strtotime($news['date'])); ?></span>
                            <h4><?php echo htmlspecialchars($news['title']); ?></h4>
                            <p><?php echo substr(htmlspecialchars($news['information']), 0, 50) . '...'; ?></p>
                            </a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</section>

    <!-- Pie de Página -->
    <?php include 'includes/footer.php'; ?>

    <script src="assets/js/main.js"></script>
</body>
</html>
