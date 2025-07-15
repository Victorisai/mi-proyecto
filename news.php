<?php
include 'includes/config.php';

// Se obtienen todas las noticias de la base de datos, ordenadas por fecha más reciente
$stmt = $pdo->prepare("SELECT * FROM news ORDER BY date DESC");
$stmt->execute();
$all_news = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Noticias - DOMABLY</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <?php include 'includes/header.php'; ?>

    <main class="news-archive">
        <div class="container">
            <div class="news-archive__header">
                <h1>Noticias y Actualidad</h1>
                <p>Mantente informado con las últimas novedades del sector inmobiliario y de la región.</p>
            </div>

            <?php if (count($all_news) > 0): ?>
                <div class="news-archive__grid">
                    <?php foreach ($all_news as $news): ?>
                        <?php
                        // Decodifica las imágenes y usa la primera como principal
                        $images = json_decode($news['images'], true) ?: [];
                        $main_image = !empty($images) ? $images[0] : 'assets/images/hero/placeholder.jpg'; // Imagen por defecto si no hay
                        ?>
                        <div class="news-card news-card--list">
                            <a href="news_detail.php?id=<?php echo $news['id']; ?>">
                                <div class="news-card__image-container">
                                    <img src="<?php echo htmlspecialchars($main_image); ?>" alt="<?php echo htmlspecialchars($news['title']); ?>">
                                </div>
                                <div class="news-card__content">
                                    <span class="news-card__date"><?php echo date('d M Y', strtotime($news['date'])); ?></span>
                                    <h3 class="news-card__title"><?php echo htmlspecialchars($news['title']); ?></h3>
                                    <p class="news-card__excerpt"><?php echo substr(htmlspecialchars($news['information']), 0, 100) . '...'; ?></p>
                                    <span class="news-card__read-more">Leer más &rarr;</span>
                                </div>
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <p style="text-align: center;">No hay noticias disponibles en este momento.</p>
            <?php endif; ?>
        </div>
    </main>

    <?php include 'includes/footer.php'; ?>
    <script src="assets/js/main.js"></script>
</body>
</html>