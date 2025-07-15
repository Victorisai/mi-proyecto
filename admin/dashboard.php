<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <?php
    session_start();
    include '../includes/config.php';

    // Verificar si el administrador está autenticado
    if (!isset($_SESSION['admin_id'])) {
        header('Location: index.php');
        exit;
    }
    ?>
    <section class="dashboard">
        <div class="container">
            <h2 class="fade-in">Panel de Administración</h2>
            <div class="dashboard__actions">
                <a href="add_property.php" class="btn btn-primary">Agregar Propiedad</a>
                <a href="manage_hero.php" class="btn btn-primary">Gestionar Hero</a>
                <a href="manage_admins.php" class="btn btn-primary">Gestionar Administradores</a>
                <a href="messages.php" class="btn btn-primary">Mensajes</a>
                <a href="manage_news.php" class="btn btn-primary">Gestionar Noticias</a>
                <a href="manage_locations.php" class="btn btn-primary">Gestionar Ubicaciones</a>
                <a href="manage_experiences.php" class="btn btn-primary">Gestionar Experiencias</a>
            </div>
            <h3 class="fade-in">Propiedades</h3>
            <div class="dashboard__table-wrapper">
                <table class="property-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Categoría</th>
                            <th>Tipo</th>
                            <th>Ubicación</th>
                            <th>Precio</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $stmt = $pdo->prepare("SELECT * FROM properties ORDER BY created_at DESC");
                        $stmt->execute();
                        $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

                        foreach ($properties as $property) {
                            ?>
                            <tr>
                                <td><?php echo $property['id']; ?></td>
                                <td><?php echo htmlspecialchars($property['title']); ?></td>
                                <td><?php echo ucfirst($property['category']); ?></td>
                                <td><?php echo ucfirst($property['listing_type']); ?></td>
                                <td><?php echo htmlspecialchars($property['location']); ?></td>
                                <td>$<?php echo number_format($property['price'], 2); ?> MXN</td>
                                <td><?php echo ucfirst($property['status']); ?></td>
                                <td>
                                    <a href="edit_property.php?id=<?php echo $property['id']; ?>" class="btn btn-secondary">Editar</a>
                                    <a href="delete_property.php?id=<?php echo $property['id']; ?>" class="btn btn-danger" onclick="return confirm('¿Estás seguro de eliminar esta propiedad?');">Eliminar</a>
                                </td>
                            </tr>
                            <?php
                        }
                        ?>
                    </tbody>
                </table>
            </div>
            <a href="logout.php" class="btn btn-secondary">Cerrar Sesión</a>
        </div>
    </section>
</body>
</html>