<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mensajes - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <?php
    session_start();
    if (!isset($_SESSION['admin_id'])) {
        header('Location: index.php');
        exit;
    }
    ?>
    <section class="dashboard">
        <div class="container">
            <h2 class="fade-in">Mensajes</h2>
            <div class="table-wrapper">
                <table class="property-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Mensaje</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody id="messages-tbody">
                        <tr><td colspan="6" style="text-align: center;">Cargando mensajes...</td></tr>
                    </tbody>
                </table>
            </div>
            <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
        </div>
    </section>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const tbody = document.getElementById('messages-tbody');

        fetch('http://localhost:3000/api/messages')
            .then(response => response.json())
            .then(messages => {
                tbody.innerHTML = '';
                if (messages.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay mensajes disponibles.</td></tr>';
                    return;
                }

                messages.forEach(message => {
                    // Formateamos la fecha para que sea más legible
                    const formattedDate = new Date(message.created_at).toLocaleString('es-MX');
                    const row = `
                        <tr>
                            <td>${message.id}</td>
                            <td>${escapeHTML(message.name)}</td>
                            <td>${escapeHTML(message.email)}</td>
                            <td>${escapeHTML(message.phone)}</td>
                            <td>${escapeHTML(message.message)}</td>
                            <td>${formattedDate}</td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            })
            .catch(error => {
                console.error('Error al cargar los mensajes:', error);
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Error al cargar los mensajes.</td></tr>';
            });

        function escapeHTML(str) {
            if (!str) return '';
            return str.replace(/[&<>'"]/g, tag => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[tag] || tag));
        }
    });
    </script>
</body>
</html>