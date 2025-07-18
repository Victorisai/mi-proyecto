<header class="header-props">
    <div class="header-props__top">
        <div class="container">
            <div class="header-props__left">
                <div class="header-props__toggle">
                    <span class="header-props__toggle-line"></span>
                    <span class="header-props__toggle-line"></span>
                    <span class="header-props__toggle-line"></span>
                </div>
                <div class="header-props__logo">
                    <a href="index.php">
                        <img src="assets/images/iconcaracteristic/logo-dark.png" alt="Logo DOMABLY" class="header-props__logo-img">
                    </a>
                </div>
            </div>
            <div class="header-props__center">
            <div class="header-props__search-bar">
                <input type="text" placeholder="Buscar..." class="header-props__search-input">
                <button class="header-props__search-button">
                <img src="assets/images/iconcaracteristic/search-icon.png" alt="Buscar">
                </button>
            </div>
            </div>
        </div>
    </div>
    <div class="header-props__bottom">
        <div class="container">
            <div class="header-props__filters">
                <div class="header-props__filter-group">
                    <a href="?listing_type=venta" class="header-props__filter-button <?php echo (!isset($_GET['listing_type']) || $_GET['listing_type'] == 'venta') ? 'header-props__filter-button--active' : ''; ?>">Comprar</a>
                    <a href="?listing_type=renta" class="header-props__filter-button <?php echo (isset($_GET['listing_type']) && $_GET['listing_type'] == 'renta') ? 'header-props__filter-button--active' : ''; ?>">Rentar</a>
                </div>
                <div class="header-props__filter-group">
                    <select class="header-props__filter-select" onchange="location = this.value;">
                        <option value="properties.php">Tipo de propiedad</option>
                        <option value="properties.php?category=casas">Casa</option>
                        <option value="properties.php?category=departamentos">Departamento</option>
                        <option value="properties.php?category=terrenos">Terreno</option>
                    </select>
                </div>
                <div class="header-props__filter-group">
                    <select class="header-props__filter-select" onchange="location = this.value;">
                        <option value="properties.php">Ubicación</option>
                        <option value="properties.php?location=Benito Juárez">Cancún</option>
                        <option value="properties.php?location=Playa del Carmen">Playa del Carmen</option>
                        <option value="properties.php?location=Tulum">Tulum</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
    <nav class="mobile-nav">
        <ul class="mobile-nav__list">
            <li class="mobile-nav__header">
                <span class="mobile-nav__title">Tu propiedad ideal</span>
                <span class="mobile-nav__close-button">✕</span>
            </li>

            <li class="mobile-nav__item"><a class="mobile-nav__link" href="index.php"><img src="assets/images/iconcaracteristic/home-icon.png" alt="Inicio Icon" class="mobile-nav__icon">Inicio</a></li>
            <li class="mobile-nav__item"><a class="mobile-nav__link" href="properties.php"><img src="assets/images/iconcaracteristic/properties-icon.png" alt="Propiedades Icon" class="mobile-nav__icon">Propiedades</a></li>
            <li class="mobile-nav__item"><a class="mobile-nav__link" href="contact.php"><img src="assets/images/iconcaracteristic/contact-icon.png" alt="Contacto Icon" class="mobile-nav__icon">Contacto</a></li>
            <li class="mobile-nav__item"><a class="mobile-nav__link" href="about.php"><img src="assets/images/iconcaracteristic/about-icon.png" alt="Sobre Nosotros Icon" class="mobile-nav__icon">Sobre Nosotros</a></li>
            <li class="mobile-nav__item"><a class="mobile-nav__link" href="join.php"><img src="assets/images/iconcaracteristic/join-icon.png" alt="Únete a Nosotros Icon" class="mobile-nav__icon">Únete a Nosotros</a></li>
            <li class="mobile-nav__item"><a class="mobile-nav__link" href="admin/index.php"><img src="assets/images/iconcaracteristic/account-icon.png" alt="Mi Cuenta Icon" class="mobile-nav__icon">Mi Cuenta</a></li>
        </ul>
    </nav>
    <div class="mobile-nav__overlay"></div>
</header>