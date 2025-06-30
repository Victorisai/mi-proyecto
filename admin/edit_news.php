<?php
session_start();
include '../includes/config.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $pdo->prepare("SELECT * FROM news WHERE id = :id");
$stmt->execute(['id' => $id]);
$news = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$news) {
    echo '<div class="error">Noticia no encontrada.</div>';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'];
    $date = $_POST['date'];
    $information = $_POST['information'];
    $sources = $_POST['sources'];
    $images = json_encode(array_filter([$_POST['image1'], $_POST['image2'], $_POST['image3']]));

    $stmt = $pdo->prepare("UPDATE news SET title = :title, date = :date, images = :images, information = :information, sources = :sources WHERE id = :id");
    $stmt->execute(['title' => $title, 'date' => $date, 'images' => $images, 'information' => $information, 'sources' => $sources, 'id' => $id]);
    header('Location: manage_news.php');
    exit;
}

$images = json_decode($news['images'], true) ?: [];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Noticia</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="edit-news">
        <div class="container">
            <h2>Editar Noticia</h2>
            <form action="edit_news.php?id=<?php echo $id; ?>" method="POST">
                <div class="form-group">
                    <label for="title">Título</label>
                    <input type="text" id="title" name="title" value="<?php echo htmlspecialchars($news['title']); ?>" required>
                </div>
                <div class="form-group">
                    <label for="date">Fecha</label>
                    <input type="date" id="date" name="date" value="<?php echo $news['date']; ?>" required>
                </div>
                <div class="form-group">
                    <label for="image1">Imagen 1 (URL)</label>
                    <input type="url" id="image1" name="image1" value="<?php echo htmlspecialchars($images[0] ?? ''); ?>">
                </div>
                <div class="form-group">
                    <label for="image2">Imagen 2 (URL)</label>
                    <input type="url" id="image2" name="image2" value="<?php echo htmlspecialchars($images[1] ?? ''); ?>">
                </div>
                <div class="form-group">
                    <label for="image3">Imagen 3 (URL)</label>
                    <input type="url" id="image3" name="image3" value="<?php echo htmlspecialchars($images[2] ?? ''); ?>">
                </div>
                <div class="form-group">
                    <label for="information">Información</label>
                    <textarea id="information" name="information" required><?php echo htmlspecialchars($news['information']); ?></textarea>
                </div>
                <div class="form-group">
                    <label for="sources">Fuentes</label>
                    <textarea id="sources" name="sources"><?php echo htmlspecialchars($news['sources']); ?></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Actualizar Noticia</button>
            </form>
        </div>
    </section>
</body>
</html>