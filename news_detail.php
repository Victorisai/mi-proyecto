<?php
include 'includes/config.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $pdo->prepare("SELECT * FROM news WHERE id = :id");
$stmt->bindParam(':id', $id);
$stmt->execute();
$news = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$news) {
    echo '<div class="error">Noticia no encontrada.</div>';
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($news['title']); ?> - CedralSales</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <?php include 'includes/header.php'; ?>
    <section class="news-detail">
        <div class="container">
            <h2><?php echo htmlspecialchars($news['title']); ?></h2>
            <span class="news-date"><?php echo date('d M Y', strtotime($news['date'])); ?></span>
            <div class="news-images">
                <?php
                $images = json_decode($news['images'], true);
                if ($images) {
                    foreach ($images as $image) {
                        echo '<img src="' . htmlspecialchars($image) . '" alt="Imagen de la noticia">';
                    }
                }
                ?>
            </div>
            <div class="news-information">
                <?php echo nl2br(htmlspecialchars($news['information'])); ?>
            </div>
            <div class="news-sources">
                <h3>Fuentes</h3>
                <?php echo nl2br(htmlspecialchars($news['sources'])); ?>
            </div>
        </div>
    </section>
    <?php include 'includes/footer.php'; ?>
    <script src="assets/js/main.js"></script>
</body>
</html>