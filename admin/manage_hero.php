<?php
session_start();
include '../includes/config.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}

// Lógica para manejar la subida de nuevas imágenes
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_hero_image'])) {
    $display_order = filter_input(INPUT_POST, 'display_order', FILTER_SANITIZE_NUMBER_INT);

    $image_path = '';
    if (isset($_FILES['hero_image']) && $_FILES['hero_image']['error'] == 0) {
        $upload_dir = '../assets/images/hero/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        $image_name = time() . '_' . basename($_FILES['hero_image']['name']);
        $target_file = $upload_dir . $image_name;
        if (move_uploaded_file($_FILES['hero_image']['tmp_name'], $target_file)) {
            $image_path = 'assets/images/hero/' . $image_name;
        }
    }

    if ($image_path) {
        // ACTUALIZAMOS LA CONSULTA SQL
        $stmt = $pdo->prepare("INSERT INTO hero_images (image_path, display_order) VALUES (:path, :order)");
        $stmt->execute(['path' => $image_path, ':order' => $display_order]);
        header('Location: manage_hero.php');
        exit;
    }
}

// Lógica para eliminar imágenes
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_hero_image'])) {
    $id_to_delete = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_NUMBER_INT);
    // Opcional: eliminar el archivo del servidor
    $stmt = $pdo->prepare("SELECT image_path FROM hero_images WHERE id = :id");
    $stmt->execute(['id' => $id_to_delete]);
    $image = $stmt->fetch();
    if ($image && file_exists('../' . $image['image_path'])) {
        unlink('../' . $image['image_path']);
    }
    // Eliminar de la base de datos
    $stmt = $pdo->prepare("DELETE FROM hero_images WHERE id = :id");
    $stmt->execute(['id' => $id_to_delete]);
    header('Location: manage_hero.php');
    exit;
}


// Obtener las imágenes actuales
$stmt = $pdo->prepare("SELECT * FROM hero_images ORDER BY display_order ASC");
$stmt->execute();
$hero_images = $stmt->fetchAll(PDO::FETCH_ASSOC);

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestionar Imágenes del Hero - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <style>
        .hero-image-item { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; display: flex; align-items: center; gap: 20px; }
        .hero-image-item img { max-width: 200px; border-radius: 5px; }
        .hero-image-details { flex-grow: 1; }
    </style>
</head>
<body>
    <section class="dashboard">
        <div class="container">
            <h2 class="fade-in">Gestionar Imágenes del Hero</h2>

            <h3 class="fade-in">Agregar Nueva Imagen</h3>
            <form class="admin-form fade-in" method="POST" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="hero_image">Archivo de Imagen</label>
                    <input type="file" id="hero_image" name="hero_image" accept="image/*" required>
                </div>
                <div class="form-group">
                    <label for="display_order">Orden</label>
                    <input type="number" id="display_order" name="display_order" value="0">
                </div>
                <button type="submit" name="add_hero_image" class="btn btn-primary">Agregar Imagen</button>
            </form>

            <h3 class="fade-in">Imágenes Actuales</h3>
            <div class="hero-images-list">
                <?php foreach ($hero_images as $image): ?>
                        <div class="hero-image-item">
                            <img src="../<?php echo htmlspecialchars($image['image_path']); ?>" alt="Imagen del Hero">
                            <div class="hero-image-details">
                                <p><strong>Ruta:</strong> ../<?php echo htmlspecialchars($image['image_path']); ?></p>
                                <p><strong>Orden:</strong> <?php echo htmlspecialchars($image['display_order']); ?></p>
                            </div>
                            <form method="POST" onsubmit="return confirm('¿Estás seguro de eliminar esta imagen?');">
                                <input type="hidden" name="id" value="<?php echo $image['id']; ?>">
                                <button type="submit" name="delete_hero_image" class="btn btn-danger">Eliminar</button>
                            </form>
                        </div>
                <?php endforeach; ?>
            </div>

            <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
        </div>
    </section>
</body>
</html>