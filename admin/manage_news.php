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
    <title>Gestionar Noticias - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    <style>
        .news-item { padding: 10px; border: 1px solid #ccc; margin: 5px 0; background: #f9f9f9; cursor: grab; }
        .btn { margin-right: 5px; }
    </style>
</head>
<body>
    <section class="manage-news">
        <div class="container">
            <h2>Gestionar Noticias</h2>

            <form id="add-news-form">
                <h3>Agregar Noticia</h3>
                <div class="form-group"><label for="title">Título</label><input type="text" id="title" name="title" required></div>
                <div class="form-group"><label for="date">Fecha</label><input type="date" id="date" name="date" required></div>
                <div class="form-group"><label for="image1">Imagen 1 (URL)</label><input type="url" id="image1" name="image1"></div>
                <div class="form-group"><label for="image2">Imagen 2 (URL)</label><input type="url" id="image2" name="image2"></div>
                <div class="form-group"><label for="image3">Imagen 3 (URL)</label><input type="url" id="image3" name="image3"></div>
                <div class="form-group"><label for="information">Información</label><textarea id="information" name="information" required></textarea></div>
                <div class="form-group"><label for="sources">Fuentes</label><textarea id="sources" name="sources"></textarea></div>
                <button type="submit" class="btn btn-primary">Guardar Noticia</button>
            </form>

            <h3>Noticias Existentes (Arrastra para reordenar)</h3>
            <div id="news-list-container">
                <p>La primera noticia será la principal, la segunda será la segunda en importancia, y así sucesivamente.</p>
                <div id="news-list">
                    </div>
                <button id="save-order-btn" class="btn btn-primary">Guardar Orden</button>
            </div>
            <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
        </div>
    </section>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const newsList = document.getElementById('news-list');
        const addForm = document.getElementById('add-news-form');
        const saveOrderBtn = document.getElementById('save-order-btn');
        let sortableInstance = null;

        // FUNCIÓN PARA CARGAR LAS NOTICIAS
        const fetchNews = async () => {
            const response = await fetch('http://localhost:3000/api/news');
            const newsArticles = await response.json();

            newsList.innerHTML = ''; // Limpiar la lista
            newsArticles.forEach((news, index) => {
                const positionText = index === 0 ? 'Principal' : `Posición ${index + 1}`;
                const item = document.createElement('div');
                item.className = 'news-item';
                item.dataset.id = news.id;
                item.innerHTML = `
                    <h4>${news.title}</h4>
                    <p>Posición actual: ${positionText}</p>
                    <a href="edit_news.php?id=${news.id}" class="btn btn-secondary">Editar</a>
                    <button class="btn btn-danger delete-btn" data-id="${news.id}">Eliminar</button>
                `;
                newsList.appendChild(item);
            });
        };

        // INICIALIZAR LA LIBRERÍA DE DRAG-AND-DROP
        sortableInstance = Sortable.create(newsList, { animation: 150 });

        // EVENT LISTENER PARA AÑADIR NOTICIA
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addForm);
            const data = {
                title: formData.get('title'),
                date: formData.get('date'),
                information: formData.get('information'),
                sources: formData.get('sources'),
                images: [formData.get('image1'), formData.get('image2'), formData.get('image3')].filter(Boolean)
            };

            await fetch('http://localhost:3000/api/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            addForm.reset();
            fetchNews(); // Recargar la lista
        });

        // EVENT LISTENER PARA ELIMINAR Y EDITAR (usando delegación)
        newsList.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const id = e.target.dataset.id;
                if (confirm('¿Estás seguro de eliminar esta noticia?')) {
                    await fetch(`http://localhost:3000/api/news/${id}`, { method: 'DELETE' });
                    fetchNews(); // Recargar
                }
            }
        });

        // EVENT LISTENER PARA GUARDAR EL ORDEN
        saveOrderBtn.addEventListener('click', async () => {
            const order = sortableInstance.toArray(); // Obtiene el array de IDs en el nuevo orden
            await fetch('http://localhost:3000/api/news/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: order })
            });
            alert('Orden guardado exitosamente');
            fetchNews(); // Recargar para ver los textos "Posición X" actualizados
        });

        // Carga inicial
        fetchNews();
    });
    </script>
</body>
</html>