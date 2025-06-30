<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit;
}
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $municipality = filter_input(INPUT_POST, 'municipality', FILTER_SANITIZE_STRING);

    if ($name && $municipality) {
        $stmt = $pdo->prepare("INSERT INTO locations (name, municipality) VALUES (:name, :municipality)");
        $stmt->execute(['name' => $name, 'municipality' => $municipality]);
        header("Location: manage_locations.php");
        exit;
    } else {
        echo '<div class="error">Por favor, completa todos los campos.</div>';
    }
}

// List of municipalities from properties enum
$municipalities = [
    'Cozumel', 'Felipe Carrillo Puerto', 'Isla Mujeres', 'Othón P. Blanco', 'Benito Juárez',
    'José María Morelos', 'Lázaro Cárdenas', 'Playa del Carmen', 'Tulum', 'Bacalar', 'Puerto Morelos'
];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agregar Ubicación - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="add-property">
        <div class="container">
            <h2>Agregar Ubicación</h2>
            <form action="add_location.php" method="post">
                <div class="form-group">
                    <label for="name">Nombre de la Ubicación</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="municipality">Municipio</label>
                    <select id="municipality" name="municipality" required>
                        <?php foreach ($municipalities as $mun): ?>
                            <option value="<?php echo $mun; ?>"><?php echo $mun; ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Agregar Ubicación</button>
                <a href="manage_locations.php" class="btn btn-secondary">Cancelar</a>
            </form>
        </div>
    </section>
    <script src="../assets/js/main.js"></script>
</body>
</html>