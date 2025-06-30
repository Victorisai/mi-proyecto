<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit;
}
require_once '../includes/config.php';

if (isset($_GET['location_id'])) {
    $location_id = (int)$_GET['location_id'];
    $stmt = $pdo->prepare("SELECT * FROM locations WHERE id = :id");
    $stmt->execute(['id' => $location_id]);
    $location = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$location) {
        header("Location: manage_experiences.php");
        exit;
    }
    $stmt = $pdo->prepare("SELECT * FROM experiences WHERE location_id = :location_id ORDER BY created_at DESC");
    $stmt->execute(['location_id' => $location_id]);
    $experiences = $stmt->fetchAll(PDO::FETCH_ASSOC);
} else {
    $stmt = $pdo->query("SELECT * FROM locations ORDER BY name");
    $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestionar Experiencias - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="dashboard">
        <div class="container">
            <?php if (isset($location)): ?>
                <h2>Experiencias en <?php echo htmlspecialchars($location['name']); ?></h2>
                <div class="dashboard-actions">
                    <a href="add_experience.php?location_id=<?php echo $location_id; ?>" class="btn btn-primary">Agregar Nueva Experiencia</a>
                    <a href="manage_experiences.php" class="btn btn-secondary">Volver a Lista de Ubicaciones</a>
                </div>
                <div class="table-wrapper">
                    <table class="property-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Título</th>
                                <th>Descripción</th>
                                <th>Imagen</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (count($experiences) > 0): ?>
                                <?php foreach ($experiences as $experience): ?>
                                    <tr>
                                        <td><?php echo $experience['id']; ?></td>
                                        <td><?php echo htmlspecialchars($experience['title']); ?></td>
                                        <td><?php echo htmlspecialchars($experience['description']); ?></td>
                                        <td><img src="<?php echo htmlspecialchars($experience['image']); ?>" alt="Imagen" width="100"></td>
                                        <td>
                                            <a href="edit_experience.php?id=<?php echo $experience['id']; ?>" class="btn btn-primary">Editar</a>
                                            <a href="delete_experience.php?id=<?php echo $experience['id']; ?>" class="btn btn-danger" onclick="return confirm('¿Estás seguro de eliminar esta experiencia?');">Eliminar</a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr><td colspan="5">No hay experiencias disponibles.</td></tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            <?php else: ?>
                <h2>Gestionar Experiencias por Ubicación</h2>
                <ul>
                    <?php if (count($locations) > 0): ?>
                        <?php foreach ($locations as $location): ?>
                            <li>
                                <a href="manage_experiences.php?location_id=<?php echo $location['id']; ?>" class="btn btn-primary"><?php echo htmlspecialchars($location['name']); ?></a>
                            </li>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <li>No hay ubicaciones disponibles. <a href="manage_locations.php">Agrega una ubicación</a>.</li>
                    <?php endif; ?>
                </ul>
                <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
            <?php endif; ?>
        </div>
    </section>
    <script src="../assets/js/main.js"></script>
</body>
</html>