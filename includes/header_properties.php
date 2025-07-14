<?php
// Lógica inicial para obtener los valores de los filtros del URL
$listing_type = isset($_GET['listing_type']) ? $_GET['listing_type'] : 'venta';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$category = isset($_GET['category']) ? $_GET['category'] : '';
$location = isset($_GET['location']) ? $_GET['location'] : '';
$min_price = isset($_GET['min_price']) ? $_GET['min_price'] : '';
$max_price = isset($_GET['max_price']) ? $_GET['max_price'] : '';
?>
<header class="properties-header">
    <div class="header-properties-top">
        <div class="header-group-left">
            <div class="menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="logo">
                <a href="index.php">
                    <img src="assets/images/iconcaracteristic/logo-dark.png" alt="Logo DOMABLY" class="logo-dark">
                </a>
            </div>
        </div>
        <div class="search-bar-container">
            <form action="properties.php" method="GET" class="search-form">
                <input type="hidden" name="listing_type" value="<?php echo htmlspecialchars($listing_type); ?>">
                <input type="text" name="search" placeholder="Buscar por título o descripción..." value="<?php echo htmlspecialchars($search); ?>">
                <button type="submit"><i class="fa fa-search"></i></button>
            </form>
        </div>
    </div>
    <div class="header-properties-bottom">
        <form action="properties.php" method="GET" class="filter-form-bottom">
            <div class="filter-tabs">
                <a href="?listing_type=venta" class="tab-link <?php echo ($listing_type === 'venta') ? 'active' : ''; ?>">Comprar</a>
                <a href="?listing_type=renta" class="tab-link <?php echo ($listing_type === 'renta') ? 'active' : ''; ?>">Rentar</a>
            </div>

            <div class="filter-group">
                <label for="category-select">Tipo de Propiedad</label>
                <select name="category" id="category-select">
                    <option value="">Cualquiera</option>
                    <option value="casas" <?php if ($category == 'casas') echo 'selected'; ?>>Casas</option>
                    <option value="departamentos" <?php if ($category == 'departamentos') echo 'selected'; ?>>Departamentos</option>
                    <option value="terrenos" <?php if ($category == 'terrenos') echo 'selected'; ?>>Terrenos</option>
                    <option value="desarrollos" <?php if ($category == 'desarrollos') echo 'selected'; ?>>Desarrollos</option>
                </select>
            </div>

            <div class="filter-group price-filter">
                <label>Rango de Precio</label>
                <div class="price-display">
                    <span id="price-range-label">Cualquiera</span>
                </div>
                <div class="price-slider-container">
                    <div class="price-inputs">
                        <input type="number" name="min_price" id="min-price" placeholder="Mínimo" value="<?php echo htmlspecialchars($min_price); ?>">
                        <input type="number" name="max_price" id="max-price" placeholder="Máximo" value="<?php echo htmlspecialchars($max_price); ?>">
                    </div>
                </div>
            </div>

            <div class="filter-group">
                <button type="submit" class="btn-search-main">Buscar</button>
            </div>
        </form>
    </div>
</header>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">