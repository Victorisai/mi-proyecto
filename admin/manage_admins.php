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
    <title>Gestionar Administradores - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="manage-admins">
        <div class="container">
            <h2 class="fade-in">Gestionar Administradores</h2>
            <div id="messages"></div> <h3 class="fade-in">Agregar Nuevo Administrador</h3>
            <form id="add-admin-form" class="admin-form fade-in">
                <div class="form-group">
                    <label for="new_username">Usuario</label>
                    <input type="text" id="new_username" name="new_username" required>
                </div>
                <div class="form-group">
                    <label for="new_password">Contraseña</label>
                    <input type="password" id="new_password" name="new_password" required>
                </div>
                <button type="submit" class="btn btn-primary">Agregar Administrador</button>
            </form>

            <h3 class="fade-in">Administradores Existentes</h3>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="admins-tbody">
                    </tbody>
            </table>
            <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
        </div>
    </section>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const tbody = document.getElementById('admins-tbody');
        const addForm = document.getElementById('add-admin-form');
        const messagesDiv = document.getElementById('messages');
        const API_URL = 'http://localhost:3000/api/admins';

        const showMessage = (text, type = 'success') => {
            messagesDiv.innerHTML = `<p class="fade-in ${type}">${text}</p>`;
            setTimeout(() => messagesDiv.innerHTML = '', 3000);
        };
        
        // CARGAR ADMINISTRADORES
        const fetchAdmins = async () => {
            const response = await fetch(API_URL);
            const admins = await response.json();
            tbody.innerHTML = '';
            admins.forEach(admin => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${admin.id}</td>
                    <td>${admin.username}</td>
                    <td>
                        <form class="change-password-form" data-id="${admin.id}">
                            <input type="password" name="new_password" placeholder="Nueva contraseña" required>
                            <button type="submit" class="btn btn-secondary">Cambiar Contraseña</button>
                        </form>
                    </td>
                `;
                tbody.appendChild(row);
            });
        };

        // AÑADIR NUEVO ADMIN
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                username: addForm.new_username.value,
                password: addForm.new_password.value
            };
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                showMessage(result.message, 'success');
                addForm.reset();
                fetchAdmins();
            } else {
                showMessage(result.error, 'error');
            }
        });
        
        // CAMBIAR CONTRASEÑA
        tbody.addEventListener('submit', async (e) => {
            if (e.target.classList.contains('change-password-form')) {
                e.preventDefault();
                const form = e.target;
                const id = form.dataset.id;
                const password = form.new_password.value;
                
                const response = await fetch(`${API_URL}/${id}/password`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const result = await response.json();
                showMessage(result.message, 'success');
                form.reset();
            }
        });
        
        // Carga inicial
        fetchAdmins();
    });
    </script>
</body>
</html>