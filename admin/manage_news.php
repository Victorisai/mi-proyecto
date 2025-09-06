<?php
session_start();
include '../includes/config.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}

// Handle deletion of news articles
if (isset($_POST['delete_news'])) {
    $news_id = $_POST['news_id'];
    $stmt = $pdo->prepare("DELETE FROM news WHERE id = :id");
    $stmt->execute(['id' => $news_id]);
    header('Location: manage_news.php');
    exit;
}

// Handle order update
if (isset($_POST['update_order'])) {
    $order = json_decode($_POST['order'], true);
    foreach ($order as $position => $id) {
        $stmt = $pdo->prepare("UPDATE news SET display_order = :position WHERE id = :id");
        $stmt->execute(['position' => $position + 1, 'id' => $id]);
    }
    header('Location: manage_news.php');
    exit;
}

// Fetch existing news articles ordered by display_order
$stmt = $pdo->prepare("SELECT * FROM news ORDER BY display_order ASC");
$stmt->execute();
$news_articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Handle form submissions for adding news
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['delete_news']) && !isset($_POST['update_order'])) {
    $title = $_POST['title'];
    $date = $_POST['date'];
    $information = $_POST['information'];
    $sources = $_POST['sources'];
    $images = json_encode(array_filter([$_POST['image1'], $_POST['image2'], $_POST['image3']]));

    // Insert new news with a high display_order (will be at the end)
    $stmt = $pdo->prepare("INSERT INTO news (title, date, images, information, sources, display_order) VALUES (:title, :date, :images, :information, :sources, 999)");
    $stmt->execute(['title' => $title, 'date' => $date, 'images' => $images, 'information' => $information, 'sources' => $sources]);
    header('Location: manage_news.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestionar Noticias - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    <style>
        .news-item { padding: 10px; border: 1px solid #ccc; margin: 5px 0; background: #f9f9f9; }
        .btn { margin-right: 5px; }
    </style>
</head>
<body>
    <section class="manage-news">
        <div class="container">
            <h2>Gestionar Noticias</h2>
            
            <!-- Formulario para agregar noticias -->
            <form action="manage_news.php" method="POST">
                <h3>Agregar Noticia</h3>
                <div class="form-group">
                    <label for="title">Título</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="date">Fecha</label>
                    <input type="date" id="date" name="date" required>
                </div>
                <div class="form-group">
                    <label for="image1">Imagen 1 (URL)</label>
                    <input type="url" id="image1" name="image1">
                </div>
                <div class="form-group">
                    <label for="image2">Imagen 2 (URL)</label>
                    <input type="url" id="image2" name="image2">
                </div>
                <div class="form-group">
                    <label for="image3">Imagen 3 (URL)</label>
                    <input type="url" id="image3" name="image3">
                </div>
                <div class="form-group">
                    <label for="information">Información</label>
                    <textarea id="information" name="information" required></textarea>
                </div>
                <div class="form-group">
                    <label for="sources">Fuentes</label>
                    <textarea id="sources" name="sources"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Guardar Noticia</button>
            </form>

            <!-- Lista de noticias para reordenar -->
            <h3>Noticias Existentes (Arrastra para reordenar)</h3>
            <p>La primera noticia será la principal, la segunda será la segunda en importancia, y así sucesivamente.</p>
            <div id="news-list">
                <?php foreach ($news_articles as $index => $news): ?>
                    <div class="news-item" data-id="<?php echo $news['id']; ?>">
                        <h4><?php echo htmlspecialchars($news['title']); ?></h4>
                        <p>Posición actual: <?php echo $index == 0 ? 'Principal' : 'Posición ' . $index; ?></p>
                        <a href="edit_news.php?id=<?php echo $news['id']; ?>" class="btn btn-secondary">Editar</a>
                        <form action="manage_news.php" method="POST" style="display:inline;">
                            <input type="hidden" name="news_id" value="<?php echo $news['id']; ?>">
                            <button type="submit" name="delete_news" class="btn btn-danger" onclick="return confirm('¿Estás seguro de eliminar esta noticia?');">Eliminar</button>
                        </form>
                    </div>
                <?php endforeach; ?>
            </div>
            <form id="order-form" action="manage_news.php" method="POST">
                <input type="hidden" name="order" id="order-input">
                <button type="submit" name="update_order" class="btn btn-primary">Guardar Orden</button>
            </form>
                <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
        </div>
    </section>

    <!-- Script para habilitar el arrastrar y soltar -->
    <script>
        const newsList = document.getElementById('news-list');
        Sortable.create(newsList, {
            animation: 150,
            onEnd: function (evt) {
                const order = Array.from(newsList.children).map(item => item.dataset.id);
                document.getElementById('order-input').value = JSON.stringify(order);
            }
        });
    </script>
</body>
</html>