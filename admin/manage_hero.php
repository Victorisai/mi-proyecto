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
    <title>Gestionar Imágenes del Hero - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <style>
        .hero-image-item { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .hero-image-item img { max-width: 200px; border-radius: 5px; }
        .hero-image-details { flex-grow: 1; }
    </style>
</head>
<body>
    <section class="dashboard">
        <div class="container">
            <h2 class="fade-in">Gestionar Imágenes del Hero</h2>

            <h3 class="fade-in">Agregar Nueva Imagen</h3>
            <form id="add-hero-form" class="admin-form fade-in">
                <div class="form-group">
                    <label for="hero_image">Archivo de Imagen</label>
                    <input type="file" id="hero_image" name="hero_image" accept="image/*" required>
                </div>
                <div class="form-group">
                    <label for="display_order">Orden</label>
                    <input type="number" id="display_order" name="display_order" value="0">
                </div>
                <button type="submit" class="btn btn-primary">Agregar Imagen</button>
            </form>

            <h3 class="fade-in">Imágenes Actuales</h3>
            <div id="hero-images-list" class="hero-images-list">
                </div>

            <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
        </div>
    </section>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const imageListDiv = document.getElementById('hero-images-list');
        const addForm = document.getElementById('add-hero-form');
        const API_URL = 'http://localhost:3000/api/hero-images';

        // FUNCIÓN PARA CARGAR LAS IMÁGENES
        const fetchHeroImages = async () => {
            const response = await fetch(API_URL);
            const images = await response.json();
            
            imageListDiv.innerHTML = '';
            images.forEach(image => {
                const item = `
                    <div class="hero-image-item">
                        <img src="/mi-proyecto/${image.image_path}" alt="Imagen del Hero">
                        <div class="hero-image-details">
                            <p><strong>Ruta:</strong> ${image.image_path}</p>
                            <p><strong>Orden:</strong> ${image.display_order}</p>
                        </div>
                        <button class="btn btn-danger delete-btn" data-id="${image.id}">Eliminar</button>
                    </div>
                `;
                imageListDiv.innerHTML += item;
            });
        };

        // EVENT LISTENER PARA AÑADIR IMAGEN
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addForm);

            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                addForm.reset();
                fetchHeroImages();
            } else {
                alert('Error al subir la imagen.');
            }
        });

        // EVENT LISTENER PARA ELIMINAR IMAGEN
        imageListDiv.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const id = e.target.dataset.id;
                if (confirm('¿Estás seguro de eliminar esta imagen?')) {
                    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    fetchHeroImages();
                }
            }
        });

        // Carga inicial
        fetchHeroImages();
    });
    </script>
</body>
</html>