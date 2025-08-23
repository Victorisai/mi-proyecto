<?php
session_start();
// La seguridad de la sesión de PHP se mantiene.
if (!isset($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}
// Ya no necesitamos la conexión a la BD aquí.
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Propiedad - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="edit-property">
        <div class="container">
            <h2>Editar Propiedad</h2>
            <form id="edit-property-form" class="admin-form">
                <div class="form-group">
                    <label for="title">Título</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" name="description" required></textarea>
                </div>
                 <div class="form-group">
                    <label for="price">Precio (MXN)</label>
                    <input type="number" id="price" name="price" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="category">Categoría</label>
                    <select id="category" name="category" required>
                        <option value="casas">Casas</option>
                        <option value="departamentos">Departamentos</option>
                        <option value="terrenos">Terrenos</option>
                        <option value="desarrollos">Desarrollos</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="listing_type">Tipo de Listado</label>
                    <select id="listing_type" name="listing_type" required>
                        <option value="venta">Venta</option>
                        <option value="renta">Renta</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="location">Ubicación (Municipio)</label>
                     <select id="location" name="location" required>
                        <option value="Cozumel">Cozumel</option>
                        <option value="Felipe Carrillo Puerto">Felipe Carrillo Puerto</option>
                        <option value="Isla Mujeres">Isla Mujeres</option>
                        <option value="Othón P. Blanco">Othón P. Blanco</option>
                        <option value="Benito Juárez">Benito Juárez</option>
                        <option value="José María Morelos">José María Morelos</option>
                        <option value="Lázaro Cárdenas">Lázaro Cárdenas</option>
                        <option value="Playa del Carmen">Playa del Carmen</option>
                        <option value="Tulum">Tulum</option>
                        <option value="Bacalar">Bacalar</option>
                        <option value="Puerto Morelos">Puerto Morelos</option>
                    </select>
                </div>

                <div id="features-casas" class="features-group">
                    </div>
                <div id="features-departamentos" class="features-group">
                    </div>
                 <div id="features-terrenos" class="features-group">
                    </div>
                <div id="features-desarrollos" class="features-group">
                    </div>

                <div class="form-group">
                    <label for="status">Estado</label>
                    <select id="status" name="status" required>
                        <option value="disponible">Disponible</option>
                        <option value="vendido">Vendido</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Actualizar Propiedad</button>
            </form>
            <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
        </div>
    </section>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        // Obtenemos el ID de la propiedad desde la URL.
        const params = new URLSearchParams(window.location.search);
        const propertyId = params.get('id');
        const form = document.getElementById('edit-property-form');

        if (!propertyId) {
            alert('No se especificó un ID de propiedad.');
            window.location.href = 'dashboard.php';
            return;
        }

        // 1. OBTENER DATOS Y RELLENAR EL FORMULARIO
        fetch(`http://localhost:3000/api/properties/${propertyId}`)
            .then(response => {
                if (!response.ok) throw new Error('Propiedad no encontrada');
                return response.json();
            })
            .then(property => {
                // Rellenamos los campos principales del formulario.
                form.title.value = property.title;
                form.description.value = property.description;
                form.price.value = property.price;
                form.category.value = property.category;
                form.listing_type.value = property.listing_type;
                form.location.value = property.location;
                form.status.value = property.status;

                // El campo 'features' es un string JSON, lo convertimos a objeto.
                const features = JSON.parse(property.features || '{}');
                // Aquí podrías añadir la lógica para mostrar y rellenar los campos de características
                // según la categoría, similar a como lo hacías en el PHP original.
                // Por simplicidad, este ejemplo se enfoca en la actualización.
            })
            .catch(error => {
                console.error('Error al cargar la propiedad:', error);
                alert('No se pudo cargar la información de la propiedad.');
            });

        // 2. MANEJAR EL ENVÍO DEL FORMULARIO
        form.addEventListener('submit', (event) => {
            // Prevenimos el comportamiento por defecto del formulario (que recargaría la página).
            event.preventDefault();

            // Creamos un objeto con todos los datos del formulario.
            const formData = {
                title: form.title.value,
                description: form.description.value,
                price: parseFloat(form.price.value),
                category: form.category.value,
                listing_type: form.listing_type.value,
                location: form.location.value,
                status: form.status.value,
                features: {} // Aquí recolectarías los datos de las características.
            };

            // Enviamos los datos actualizados a nuestra API.
            fetch(`http://localhost:3000/api/properties/${propertyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), // Convertimos nuestro objeto a un string JSON.
            })
            .then(response => {
                if (!response.ok) throw new Error('Error al actualizar');
                return response.json();
            })
            .then(data => {
                alert(data.message); // Mostramos el mensaje de éxito de la API.
                window.location.href = 'dashboard.php'; // Redirigimos al dashboard.
            })
            .catch(error => {
                console.error('Error al actualizar la propiedad:', error);
                alert('Hubo un problema al guardar los cambios.');
            });
        });
    });
    </script>
</body>
</html>