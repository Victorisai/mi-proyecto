<?php
include 'includes/config.php';

// Se obtienen todas las noticias de la base de datos, ordenadas por fecha más reciente
$stmt = $pdo->prepare("SELECT * FROM news ORDER BY date DESC");
$stmt->execute();
$all_news = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Noticias - DOMABLY</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <!-- Encabezado -->
<header>
    <div class="container">
        <div class="header__top">
            <!-- Icono de menú hamburguesa -->
            <div class="header__toggle">
                <span class="header__toggle-line"></span>
                <span class="header__toggle-line"></span>
                <span class="header__toggle-line"></span>
            </div>
            <!-- Logo -->
            <div class="header__logo">
                <a href="index.php">
                    <img src="assets/images/iconcaracteristic/logo-light.png" alt="Logo DOMABLY" class="header__logo--light">
                    <img src="assets/images/iconcaracteristic/logo-dark.png" alt="Logo DOMABLY" class="header__logo--dark">
                    <h1 class="header__title sr-only">DOMABLY</h1>
                </a>
            </div>
        </div>
                <!-- Línea separadora -->
        <hr class="header__divider">
        <!-- Nueva lista de navegación para enlaces fuera del menú hamburguesa -->
        <ul class="header__nav">
            <li class="header__nav-item"><a class="header__nav-link" href="properties.html?category=terrenos">Terrenos</a></li>
            <li class="header__nav-item"><a class="header__nav-link" href="properties.html?category=casas">Casas</a></li>
            <li class="header__nav-item"><a class="header__nav-link" href="properties.html?category=departamentos">Departamentos</a></li>
            <li class="header__nav-item"><a class="header__nav-link" href="properties.html?category=desarrollos">Desarrollos</a></li>
            <li class="header__nav-item"><a class="header__nav-link" href="properties.html?location=Benito Juárez">Cancun</a></li>
            <li class="header__nav-item"><a class="header__nav-link" href="properties.html?location=Tulum">Tulum</a></li>
            <li class="header__nav-item"><a class="header__nav-link" href="properties.html?location=Lázaro Cárdenas">Lázaro Cárdenas</a></li>
            <li class="header__nav-item"><a class="header__nav-link" href="properties.html?location=Playa del Carmen">Playa del Carmen</a></li>
        </ul>
        <hr class="header__divider">
            <nav class="mobile-nav">
                <ul class="mobile-nav__list">
                    <li class="mobile-nav__header">
                        <span class="mobile-nav__title">Tu propiedad ideal</span>
                        <span class="mobile-nav__close-button">✕</span>
                    </li>

                    <li class="mobile-nav__item"><a class="mobile-nav__link" href="index.php"><img src="assets/images/iconcaracteristic/home-icon.png" alt="Inicio Icon" class="mobile-nav__icon">Inicio</a></li>
                    <li class="mobile-nav__item"><a class="mobile-nav__link" href="properties.html"><img src="assets/images/iconcaracteristic/properties-icon.png" alt="Propiedades Icon" class="mobile-nav__icon">Propiedades</a></li>
                    <li class="mobile-nav__item"><a class="mobile-nav__link" href="contact.php"><img src="assets/images/iconcaracteristic/contact-icon.png" alt="Contacto Icon" class="mobile-nav__icon">Contacto</a></li>
                    <li class="mobile-nav__item"><a class="mobile-nav__link" href="about.php"><img src="assets/images/iconcaracteristic/about-icon.png" alt="Sobre Nosotros Icon" class="mobile-nav__icon">Sobre Nosotros</a></li>
                    <li class="mobile-nav__item"><a class="mobile-nav__link" href="join.php"><img src="assets/images/iconcaracteristic/join-icon.png" alt="Únete a Nosotros Icon" class="mobile-nav__icon">Únete a Nosotros</a></li>
                    <li class="mobile-nav__item"><a class="mobile-nav__link" href="admin/index.php"><img src="assets/images/iconcaracteristic/account-icon.png" alt="Mi Cuenta Icon" class="mobile-nav__icon">Mi Cuenta</a></li>
                </ul>
            </nav>
    </div>
    <div class="mobile-nav__overlay"></div>
</header>

    <main class="all-news-page">
        <div class="container">
            <div class="page-header">
                <h1>Noticias y Actualidad</h1>
                <p>Mantente informado con las últimas novedades del sector inmobiliario y de la región.</p>
            </div>

            <?php if (count($all_news) > 0): ?>
                <div class="news-grid-container">
                    <?php foreach ($all_news as $news): ?>
                        <?php
                        // Decodifica las imágenes y usa la primera como principal
                        $images = json_decode($news['images'], true) ?: [];
                        $main_image = !empty($images) ? $images[0] : 'assets/images/hero/placeholder.jpg'; // Imagen por defecto si no hay
                        ?>
                        <div class="news-list-card">
                            <a href="news_detail.php?id=<?php echo $news['id']; ?>">
                                <div class="news-card-image">
                                    <img src="<?php echo htmlspecialchars($main_image); ?>" alt="<?php echo htmlspecialchars($news['title']); ?>">
                                </div>
                                <div class="news-card-content">
                                    <span class="news-card-date"><?php echo date('d M Y', strtotime($news['date'])); ?></span>
                                    <h3 class="news-card-title"><?php echo htmlspecialchars($news['title']); ?></h3>
                                    <p class="news-card-excerpt"><?php echo substr(htmlspecialchars($news['information']), 0, 100) . '...'; ?></p>
                                    <span class="read-more-link">Leer más &rarr;</span>
                                </div>
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <p style="text-align: center;">No hay noticias disponibles en este momento.</p>
            <?php endif; ?>
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
                    <li><a href="properties.html?category=terrenos">Terrenos</a></li>
                    <li><a href="properties.html?category=casas">Casas</a></li>
                    <li><a href="properties.html?category=departamentos">Departamentos</a></li>
                    <li><a href="properties.html?category=desarrollos">Desarrollos</a></li>
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