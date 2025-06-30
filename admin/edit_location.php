<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit;
}
require_once '../includes/config.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $pdo->prepare("SELECT * FROM locations WHERE id = :id");
$stmt->execute(['id' => $id]);
$location = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$location) {
    header("Location: manage_locations.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $municipality = filter_input(INPUT_POST, 'municipality', FILTER_SANITIZE_STRING);

    if ($name && $municipality) {
        $stmt = $pdo->prepare("UPDATE locations SET name = :name, municipality = :municipality WHERE id = :id");
        $stmt->execute(['name' => $name, 'municipality' => $municipality, 'id' => $id]);
        header("Location: manage_locations.php");
        exit;
    } else {
        echo '<div class="error">Por favor, completa todos los campos.</div>';
    }
}

// List of municipalities
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
    <title>Editar Ubicación - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="edit-property">
        <div class="container">
            <h2>Editar Ubicación</h2>
            <form action="edit_location.php?id=<?php echo $id; ?>" method="post">
                <div class="form-group">
                    <label for="name">Nombre de la Ubicación</label>
                    <input type="text" id="name" name="name" value="<?php echo htmlspecialchars($location['name']); ?>" required>
                </div>
                <div class="form-group">
                    <label for="municipality">Municipio</label>
                    <select id="municipality" name="municipality" required>
                        <?php foreach ($municipalities as $mun): ?>
                            <option value="<?php echo $mun; ?>" <?php if ($mun == $location['municipality']) echo 'selected'; ?>><?php echo $mun; ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Actualizar Ubicación</button>
                <a href="manage_locations.php" class="btn btn-secondary">Cancelar</a>
            </form>
        </div>
    </section>
    <script src="../assets/js/main.js"></script>
</body>
</html>