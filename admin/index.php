<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Administrador - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="login">
        <div class="container">
            <h2 class="fade-in">Iniciar Sesión</h2>
            <?php
            session_start();
            include '../includes/config.php';

            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
                $password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING);

                $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = :username");
                $stmt->bindParam(':username', $username);
                $stmt->execute();
                $admin = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($admin && password_verify($password, $admin['password'])) {
                    $_SESSION['admin_id'] = $admin['id'];
                    header('Location: dashboard.php');
                    exit;
                } else {
                    echo '<p class="fade-in error">Usuario o contraseña incorrectos.</p>';
                }
            }
            ?>
            <form class="login__form fade-in" method="POST">
                <div class="form-group">
                    <label for="username">Usuario</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
            </form>
        </div>
    </section>
</body>
</html>