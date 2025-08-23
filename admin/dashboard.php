<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <?php
    session_start();
    // La lógica de seguridad de la sesión de PHP se mantiene,
    // ya que esta página aún debe ser protegida.
    if (!isset($_SESSION['admin_id'])) {
        header('Location: index.php');
        exit;
    }
    ?>
    <section class="admin-dashboard">
        <div class="container">
            <h2 class="fade-in">Panel de Administración</h2>
            <div class="admin-dashboard__actions">
                <a href="add_property.php" class="btn btn-primary">Agregar Propiedad</a>
                <a href="manage_hero.php" class="btn btn-primary">Gestionar Hero</a>
                <a href="manage_admins.php" class="btn btn-primary">Gestionar Administradores</a>
                <a href="messages.php" class="btn btn-primary">Mensajes</a>
                <a href="manage_news.php" class="btn btn-primary">Gestionar Noticias</a>
                <a href="manage_locations.php" class="btn btn-primary">Gestionar Ubicaciones</a>
                <a href="manage_experiences.php" class="btn btn-primary">Gestionar Experiencias</a>
            </div>
            <h3 class="fade-in">Propiedades</h3>
            <div class="table-wrapper">
                <table class="admin-dashboard__table">
                    <thead>
                        <tr>
                            <th class="admin-dashboard__table-header">ID</th>
                            <th class="admin-dashboard__table-header">Título</th>
                            <th class="admin-dashboard__table-header">Categoría</th>
                            <th class="admin-dashboard__table-header">Tipo</th>
                            <th class="admin-dashboard__table-header">Ubicación</th>
                            <th class="admin-dashboard__table-header">Precio</th>
                            <th class="admin-dashboard__table-header">Estado</th>
                            <th class="admin-dashboard__table-header">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="properties-tbody">
                        <tr>
                            <td colspan="8" style="text-align: center;">Cargando propiedades...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <a href="logout.php" class="btn btn-secondary">Cerrar Sesión</a>
        </div>
    </section>

    <script>
    // Nos aseguramos de que el script se ejecute solo después de que toda la página se haya cargado.
    document.addEventListener('DOMContentLoaded', () => {
        const tbody = document.getElementById('properties-tbody');

        // Función para cargar y mostrar las propiedades en la tabla
        const fetchProperties = () => {
            fetch('http://localhost:3000/api/properties')
                .then(response => {
                    if (!response.ok) throw new Error('La respuesta de la red no fue correcta');
                    return response.json();
                })
                .then(properties => {
                    tbody.innerHTML = '';
                    if (properties.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No se encontraron propiedades.</td></tr>';
                        return;
                    }
                    properties.forEach(property => {
                        const price = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(property.price);

                        // CAMBIO IMPORTANTE:
                        // El botón de eliminar ya no es un enlace <a>. Es un <button>
                        // con un atributo "data-id" para saber qué propiedad borrar.
                        const row = `
                            <tr id="property-row-${property.id}">
                                <td class="admin-dashboard__table-cell">${property.id}</td>
                                <td class="admin-dashboard__table-cell">${escapeHTML(property.title)}</td>
                                <td class="admin-dashboard__table-cell">${capitalizeFirstLetter(property.category)}</td>
                                <td class="admin-dashboard__table-cell">${capitalizeFirstLetter(property.listing_type)}</td>
                                <td class="admin-dashboard__table-cell">${escapeHTML(property.location)}</td>
                                <td class="admin-dashboard__table-cell">${price}</td>
                                <td class="admin-dashboard__table-cell">${capitalizeFirstLetter(property.status)}</td>
                                <td class="admin-dashboard__table-cell">
                                    <a href="edit_property.php?id=${property.id}" class="btn btn-secondary">Editar</a>
                                    <button class="btn btn-danger delete-btn" data-id="${property.id}">Eliminar</button>
                                </td>
                            </tr>
                        `;
                        tbody.innerHTML += row;
                    });
                })
                .catch(error => {
                    console.error('Error al cargar las propiedades:', error);
                    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Error al cargar las propiedades. Asegúrate de que el servidor de Node.js esté funcionando.</td></tr>';
                });
        };

        // --- NUEVA LÓGICA PARA ELIMINAR ---
        // Escuchamos los clics en todo el cuerpo de la tabla.
        tbody.addEventListener('click', (event) => {
            // Verificamos si el clic fue en un botón con la clase 'delete-btn'.
            if (event.target.classList.contains('delete-btn')) {
                const propertyId = event.target.dataset.id;

                if (confirm(`¿Estás seguro de eliminar la propiedad con ID ${propertyId}?`)) {
                    // Hacemos la petición a la API, pero esta vez con el método 'DELETE'.
                    fetch(`http://localhost:3000/api/properties/${propertyId}`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('No se pudo eliminar la propiedad.');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log(data.message); // Muestra el mensaje de éxito en la consola.
                        // Eliminamos la fila de la tabla visualmente, ¡sin recargar la página!
                        const rowToRemove = document.getElementById(`property-row-${propertyId}`);
                        if (rowToRemove) {
                            rowToRemove.remove();
                        }
                    })
                    .catch(error => {
                        console.error('Error al eliminar:', error);
                        alert('Hubo un error al eliminar la propiedad.');
                    });
                }
            }
        });

        // --- Funciones auxiliares (sin cambios) ---
        function capitalizeFirstLetter(string) { /* ... */ }
        function escapeHTML(str) { /* ... */ }

        // Carga inicial de las propiedades
        fetchProperties();
    });
    </script>
</body>
</html>