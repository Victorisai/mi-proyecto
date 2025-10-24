<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mensajes - CedralSales</title>
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

    // Obtener mensajes de la base de datos
    $stmt = $pdo->prepare("SELECT * FROM contacts ORDER BY created_at DESC");
    $stmt->execute();
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    ?>
    <section class="dashboard">
        <div class="container">
            <h2 class="fade-in">Mensajes</h2>
            <div class="table-wrapper">
                <table class="property-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Mensaje</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        foreach ($messages as $message) {
                            ?>
                            <tr>
                                <td><?php echo $message['id']; ?></td>
                                <td><?php echo htmlspecialchars($message['name']); ?></td>
                                <td><?php echo htmlspecialchars($message['email']); ?></td>
                                <td><?php echo htmlspecialchars($message['phone']); ?></td>
                                <td><?php echo htmlspecialchars($message['message']); ?></td>
                                <td><?php echo $message['created_at']; ?></td>
                            </tr>
                            <?php
                        }
                        if (empty($messages)) {
                            echo '<tr><td colspan="6">No hay mensajes disponibles.</td></tr>';
                        }
                        ?>
                    </tbody>
                </table>
            </div>
            <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
        </div>
    </section>
</body>
</html>