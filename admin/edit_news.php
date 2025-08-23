<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}
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
            <form id="edit-news-form">
                <div class="form-group"><label for="title">Título</label><input type="text" id="title" name="title" required></div>
                <div class="form-group"><label for="date">Fecha</label><input type="date" id="date" name="date" required></div>
                <div class="form-group"><label for="image1">Imagen 1 (URL)</label><input type="url" id="image1" name="image1"></div>
                <div class="form-group"><label for="image2">Imagen 2 (URL)</label><input type="url" id="image2" name="image2"></div>
                <div class="form-group"><label for="image3">Imagen 3 (URL)</label><input type="url" id="image3" name="image3"></div>
                <div class="form-group"><label for="information">Información</label><textarea id="information" name="information" required></textarea></div>
                <div class="form-group"><label for="sources">Fuentes</label><textarea id="sources" name="sources"></textarea></div>
                <button type="submit" class="btn btn-primary">Actualizar Noticia</button>
            </form>
        </div>
    </section>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('edit-news-form');
        const params = new URLSearchParams(window.location.search);
        const newsId = params.get('id');

        if (!newsId) {
            window.location.href = 'manage_news.php';
            return;
        }

        // 1. CARGAR DATOS DE LA NOTICIA
        fetch(`http://localhost:3000/api/news/${newsId}`)
            .then(res => res.json())
            .then(news => {
                form.title.value = news.title;
                form.date.value = news.date;
                form.information.value = news.information;
                form.sources.value = news.sources;

                const images = JSON.parse(news.images || '[]');
                form.image1.value = images[0] || '';
                form.image2.value = images[1] || '';
                form.image3.value = images[2] || '';
            });

        // 2. GUARDAR CAMBIOS
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {
                title: formData.get('title'),
                date: formData.get('date'),
                information: formData.get('information'),
                sources: formData.get('sources'),
                images: [formData.get('image1'), formData.get('image2'), formData.get('image3')].filter(Boolean)
            };

            await fetch(`http://localhost:3000/api/news/${newsId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            alert('Noticia actualizada');
            window.location.href = 'manage_news.php';
        });
    });
    </script>
</body>
</html>