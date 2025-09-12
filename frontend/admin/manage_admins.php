<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestionar Administradores - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <?php
    session_start();
    include '../includes/config.php';

    if (!isset($_SESSION['admin_id'])) {
        header('Location: index.php');
        exit;
    }

    // Agregar un nuevo administrador
    if (isset($_POST['add_admin'])) {
        $new_username = filter_input(INPUT_POST, 'new_username', FILTER_SANITIZE_STRING);
        $new_password = filter_input(INPUT_POST, 'new_password', FILTER_SANITIZE_STRING);

        if ($new_username && $new_password) {
            $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
            try {
                $stmt = $pdo->prepare("INSERT INTO admins (username, password) VALUES (:username, :password)");
                $stmt->execute([
                    ':username' => $new_username,
                    ':password' => $hashed_password
                ]);
                $success_message = "Administrador '$new_username' agregado con éxito.";
            } catch (PDOException $e) {
                $error_message = "Error al agregar administrador: " . $e->getMessage();
            }
        } else {
            $error_message = "Por favor, completa todos los campos.";
        }
    }

    // Modificar contraseña de un administrador existente
    if (isset($_POST['change_password'])) {
        $admin_id = filter_input(INPUT_POST, 'admin_id', FILTER_SANITIZE_NUMBER_INT);
        $new_password = filter_input(INPUT_POST, 'change_password_new', FILTER_SANITIZE_STRING);

        if ($admin_id && $new_password) {
            $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("UPDATE admins SET password = :password WHERE id = :id");
            $stmt->execute([
                ':password' => $hashed_password,
                ':id' => $admin_id
            ]);
            $success_message = "Contraseña actualizada con éxito.";
        } else {
            $error_message = "Por favor, selecciona un administrador y proporciona una nueva contraseña.";
        }
    }

    // Obtener lista de administradores
    $stmt = $pdo->prepare("SELECT * FROM admins");
    $stmt->execute();
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    ?>
    <section class="manage-admins">
        <div class="container">
            <h2 class="fade-in">Gestionar Administradores</h2>

            <!-- Mensajes de éxito o error -->
            <?php if (isset($success_message)): ?>
                <p class="fade-in success"><?php echo $success_message; ?></p>
            <?php endif; ?>
            <?php if (isset($error_message)): ?>
                <p class="fade-in error"><?php echo $error_message; ?></p>
            <?php endif; ?>

            <!-- Formulario para agregar administrador -->
            <h3 class="fade-in">Agregar Nuevo Administrador</h3>
            <form class="admin-form fade-in" method="POST">
                <div class="form-group">
                    <label for="new_username">Usuario</label>
                    <input type="text" id="new_username" name="new_username" required>
                </div>
                <div class="form-group">
                    <label for="new_password">Contraseña</label>
                    <input type="password" id="new_password" name="new_password" required>
                </div>
                <button type="submit" name="add_admin" class="btn btn-primary">Agregar Administrador</button>
            </form>

            <!-- Lista de administradores y cambio de contraseña -->
            <h3 class="fade-in">Administradores Existentes</h3>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($admins as $admin): ?>
                        <tr>
                            <td><?php echo $admin['id']; ?></td>
                            <td><?php echo htmlspecialchars($admin['username']); ?></td>
                            <td>
                                <form method="POST" style="display:inline;">
                                    <input type="hidden" name="admin_id" value="<?php echo $admin['id']; ?>">
                                    <input type="password" name="change_password_new" placeholder="Nueva contraseña" required>
                                    <button type="submit" name="change_password" class="btn btn-secondary">Cambiar Contraseña</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
        </div>
    </section>
</body>
</html>