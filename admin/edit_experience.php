<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit;
}
require_once '../includes/config.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $pdo->prepare("SELECT * FROM experiences WHERE id = :id");
$stmt->execute(['id' => $id]);
$experience = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$experience) {
    header("Location: manage_experiences.php");
    exit;
}

$location_id = $experience['location_id'];
$stmt = $pdo->prepare("SELECT * FROM locations WHERE id = :id");
$stmt->execute(['id' => $location_id]);
$location = $stmt->fetch(PDO::FETCH_ASSOC);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $title = filter_input(INPUT_POST, 'title', FILTER_SANITIZE_STRING);
    $description = filter_input(INPUT_POST, 'description', FILTER_SANITIZE_STRING);
    $image = $experience['image'];

    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $upload_dir = '../assets/images/experiences/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        $image_name = time() . '_' . basename($_FILES['image']['name']);
        $image_path = $upload_dir . $image_name;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $image_path)) {
            $image = 'assets/images/experiences/' . $image_name;
            if (file_exists('../' . $experience['image'])) {
                unlink('../' . $experience['image']);
            }
        }
    }

    if ($title && $description) {
        $stmt = $pdo->prepare("UPDATE experiences SET title = :title, description = :description, image = :image WHERE id = :id");
        $stmt->execute([
            'title' => $title,
            'description' => $description,
            'image' => $image,
            'id' => $id
        ]);
        header("Location: manage_experiences.php?location_id=$location_id");
        exit;
    } else {
        echo '<div class="error">Por favor, completa todos los campos.</div>';
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Experiencia - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="edit-property">
        <div class="container">
            <h2>Editar Experiencia en <?php echo htmlspecialchars($location['name']); ?></h2>
            <form action="edit_experience.php?id=<?php echo $id; ?>" method="post" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="title">Título</label>
                    <input type="text" id="title" name="title" value="<?php echo htmlspecialchars($experience['title']); ?>" required>
                </div>
                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" name="description" required><?php echo htmlspecialchars($experience['description']); ?></textarea>
                </div>
                <div class="form-group">
                    <label for="image">Imagen Actual</label>
                    <img src="<?php echo htmlspecialchars($experience['image']); ?>" alt="Imagen Actual" width="100">
                    <label for="image">Nueva Imagen (dejar en blanco para mantener la actual)</label>
                    <input type="file" id="image" name="image" accept="image/*">
                </div>
                <button type="submit" class="btn btn-primary">Actualizar Experiencia</button>
                <a href="manage_experiences.php?location_id=<?php echo $location_id; ?>" class="btn btn-secondary">Cancelar</a>
            </form>
        </div>
    </section>
    <script src="../assets/js/main.js"></script>
</body>
</html>