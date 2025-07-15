<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit;
}
require_once '../includes/config.php';

// Fetch all locations
$stmt = $pdo->query("SELECT * FROM locations ORDER BY name");
$locations = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestionar Ubicaciones - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="dashboard">
        <div class="container">
            <h2>Gestionar Ubicaciones</h2>
            <div class="dashboard__actions">
                <a href="add_location.php" class="btn btn-primary">Agregar Nueva Ubicación</a>
                <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
            </div>
            <div class="dashboard__table-wrapper">
                <table class="property-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Municipio</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (count($locations) > 0): ?>
                            <?php foreach ($locations as $location): ?>
                                <tr>
                                    <td><?php echo $location['id']; ?></td>
                                    <td><?php echo htmlspecialchars($location['name']); ?></td>
                                    <td><?php echo htmlspecialchars($location['municipality']); ?></td>
                                    <td>
                                        <a href="edit_location.php?id=<?php echo $location['id']; ?>" class="btn btn-primary">Editar</a>
                                        <a href="delete_location.php?id=<?php echo $location['id']; ?>" class="btn btn-danger" onclick="return confirm('¿Estás seguro de eliminar esta ubicación?');">Eliminar</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr><td colspan="4">No hay ubicaciones disponibles.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
    <script src="../assets/js/main.js"></script>
</body>
</html>