<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit;
}
require_once '../includes/config.php';

$location_id = isset($_GET['location_id']) ? (int)$_GET['location_id'] : 0;
$stmt = $pdo->prepare("SELECT * FROM locations WHERE id = :id");
$stmt->execute(['id' => $location_id]);
$location = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$location) {
    header("Location: manage_experiences.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $title = filter_input(INPUT_POST, 'title', FILTER_SANITIZE_STRING);
    $description = filter_input(INPUT_POST, 'description', FILTER_SANITIZE_STRING);
    $image = '';

    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $upload_dir = '../assets/images/experiences/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        $image_name = time() . '_' . basename($_FILES['image']['name']);
        $image_path = $upload_dir . $image_name;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $image_path)) {
            $image = 'assets/images/experiences/' . $image_name;
        }
    }

    if ($title && $description && $image) {
        $stmt = $pdo->prepare("INSERT INTO experiences (location_id, title, description, image) VALUES (:location_id, :title, :description, :image)");
        $stmt->execute([
            'location_id' => $location_id,
            'title' => $title,
            'description' => $description,
            'image' => $image
        ]);
        header("Location: manage_experiences.php?location_id=$location_id");
        exit;
    } else {
        echo '<div class="error">Por favor, completa todos los campos y sube una imagen.</div>';
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agregar Experiencia - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="add-property">
        <div class="container">
            <h2>Agregar Experiencia en <?php echo htmlspecialchars($location['name']); ?></h2>
            <form action="add_experience.php?location_id=<?php echo $location_id; ?>" method="post" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="title">Título</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label for="image">Imagen</label>
                    <input type="file" id="image" name="image" accept="image/*" required>
                </div>
                <button type="submit" class="btn btn-primary">Agregar Experiencia</button>
                <a href="manage_experiences.php?location_id=<?php echo $location_id; ?>" class="btn btn-secondary">Cancelar</a>
            </form>
        </div>
    </section>
    <script src="../assets/js/main.js"></script>
</body>
</html>