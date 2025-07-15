<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contacto - CedralSales</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <!-- Encabezado -->
    <?php include 'includes/header.php'; ?>

    <section class="contact">
        <div class="container">
            <h2 class="fade-in">Contacto</h2>
            <p class="fade-in">Envíanos tu mensaje y nos pondremos en contacto contigo.</p>
            <?php
            include 'includes/config.php';

            if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
                $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
                $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
                $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

                if ($name && $email && $phone && $message) {
                    $stmt = $pdo->prepare("INSERT INTO contacts (name, email, phone, message) VALUES (:name, :email, :phone, :message)");
                    $stmt->execute([
                        ':name' => $name,
                        ':email' => $email,
                        ':phone' => $phone,
                        ':message' => $message
                    ]);
                    echo '<p class="contact__message--success fade-in">Mensaje enviado con éxito. Te contactaremos pronto.</p>';
                } else {
                    echo '<p class="contact__message--error fade-in">Por favor, completa todos los campos.</p>';
                }
            }
            ?>
            <form class="contact__form fade-in" method="POST">
                <div class="contact__form-group">
                    <label for="name">Nombre</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="contact__form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="contact__form-group">
                    <label for="phone">Número de Teléfono</label>
                    <input type="tel" id="phone" name="phone" required>
                </div>
                <div class="contact__form-group">
                    <label for="message">Mensaje</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Enviar</button>
            </form>
        </div>
    </section>

    <!-- Pie de Página -->
    <?php include 'includes/footer.php'; ?>

    <script src="assets/js/main.js"></script>
</body>
</html>