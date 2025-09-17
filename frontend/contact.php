<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contacto - CedralSales</title>
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

    <section class="contact">
        <div class="container">
            <h2 class="fade-in">Contacto</h2>
            <p class="fade-in">Envíanos tu mensaje y nos pondremos en contacto contigo.</p>
            <?php
            include 'includes/config.php';

            if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
                $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
                $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
                $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

                if ($name && $email && $phone && $message) {
                    $stmt = $pdo->prepare("INSERT INTO contacts (name, email, phone, message) VALUES (:name, :email, :phone, :message)");
                    $stmt->execute([
                        ':name' => $name,
                        ':email' => $email,
                        ':phone' => $phone,
                        ':message' => $message
                    ]);
                    echo '<p class="success fade-in">Mensaje enviado con éxito. Te contactaremos pronto.</p>';
                } else {
                    echo '<p class="error fade-in">Por favor, completa todos los campos.</p>';
                }
            }
            ?>
            <form class="contact-form fade-in" method="POST">
                <div class="contact-form__group">
                    <label class="contact-form__label" for="name">Nombre</label>
                    <input class="contact-form__input" type="text" id="name" name="name" required>
                </div>
                <div class="contact-form__group">
                    <label class="contact-form__label" for="email">Email</label>
                    <input class="contact-form__input" type="email" id="email" name="email" required>
                </div>
                <div class="contact-form__group">
                    <label class="contact-form__label" for="phone">Número de Teléfono</label>
                    <input class="contact-form__input" type="tel" id="phone" name="phone" required>
                </div>
                <div class="contact-form__group">
                    <label class="contact-form__label" for="message">Mensaje</label>
                    <textarea class="contact-form__input" id="message" name="message" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Enviar</button>
            </form>
        </div>
    </section>

    <!-- Pie de Página -->
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