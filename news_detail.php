<?php
include 'includes/config.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

$stmt = $pdo->prepare("SELECT * FROM news WHERE id = :id");
$stmt->bindParam(':id', $id);
$stmt->execute();

$news = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$news) {
    header("HTTP/1.0 404 Not Found");
    echo '<div class="error">Noticia no encontrada.</div>';
    exit;
}

$images = json_decode($news['images'], true) ?: [];
$main_image = array_shift($images);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($news['title']); ?> - DOMABLY</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <?php include 'includes/header.php'; ?>

    <main class="news-article-page">
        <div class="container">
            <article class="news-article">
                
                <h1 class="article-title"><?php echo htmlspecialchars($news['title']); ?></h1>
                <p class="article-meta">Publicado el <time datetime="<?php echo $news['date']; ?>"><?php echo date('d M Y', strtotime($news['date'])); ?></time></p>

                <?php if ($main_image): ?>
                <figure class="article-main-image">
                    <img src="<?php echo htmlspecialchars($main_image); ?>" alt="<?php echo htmlspecialchars($news['title']); ?>">
                </figure>
                <?php endif; ?>

                <div class="article-content">
                    <?php echo nl2br(htmlspecialchars($news['information'])); ?>
                </div>

                <?php if (!empty($images)): ?>
                    <section class="article-gallery">
                        <h3 class="gallery-title">Galería de Imágenes</h3>
                        <div class="gallery-grid">
                            <?php foreach ($images as $image): ?>
                                <figure class="gallery-item">
                                    <img src="<?php echo htmlspecialchars($image); ?>" alt="Imagen de la noticia">
                                </figure>
                            <?php endforeach; ?>
                        </div>
                    </section>
                <?php endif; ?>
                
                <?php if (!empty($news['sources'])): ?>
                <footer class="article-footer">
                    <h3 class="sources-title">Fuentes</h3>
                    <div class="sources-content">
                        <?php echo nl2br(htmlspecialchars($news['sources'])); ?>
                    </div>
                </footer>
                <?php endif; ?>

            </article>
        </div>
    </main>

    <?php include 'includes/footer.php'; ?>
    <script src="assets/js/main.js"></script>
</body>
</html>