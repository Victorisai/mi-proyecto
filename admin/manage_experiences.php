<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestionar Experiencias - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="dashboard">
        <div class="container">
            <h2>Gestionar Experiencias por Ubicación</h2>
            
            <div class="form-group">
                <label for="location-select">Selecciona una Ubicación</label>
                <select id="location-select" class="form-control">
                    <option value="">-- Cargar Ubicaciones --</option>
                </select>
            </div>

            <div id="experiences-container" style="display: none;">
                <h3 id="experiences-title"></h3>
                <div class="dashboard-actions">
                    <button id="add-experience-btn" class="btn btn-primary">Agregar Nueva Experiencia</button>
                </div>

                <form id="add-experience-form" style="display: none; margin-bottom: 20px;" class="admin-form">
                    <h4>Nueva Experiencia</h4>
                    <div class="form-group"><label>Título</label><input type="text" name="title" required></div>
                    <div class="form-group"><label>Descripción</label><textarea name="description" required></textarea></div>
                    <div class="form-group"><label>Imagen</label><input type="file" name="image" accept="image/*" required></div>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                    <button type="button" id="cancel-add-btn" class="btn btn-secondary">Cancelar</button>
                </form>

                <div class="table-wrapper">
                    <table class="property-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Título</th>
                                <th>Imagen</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="experiences-tbody"></tbody>
                    </table>
                </div>
            </div>
             <a href="dashboard.php" class="btn btn-secondary" style="margin-top: 20px;">Volver al Panel</a>
        </div>
    </section>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const locationSelect = document.getElementById('location-select');
        const experiencesContainer = document.getElementById('experiences-container');
        const experiencesTitle = document.getElementById('experiences-title');
        const experiencesTbody = document.getElementById('experiences-tbody');
        const addExperienceBtn = document.getElementById('add-experience-btn');
        const addExperienceForm = document.getElementById('add-experience-form');
        const cancelAddBtn = document.getElementById('cancel-add-btn');

        // Cargar las ubicaciones en el select
        fetch('http://localhost:3000/api/locations')
            .then(res => res.json())
            .then(locations => {
                locationSelect.innerHTML = '<option value="">-- Selecciona una Ubicación --</option>';
                locations.forEach(loc => {
                    locationSelect.innerHTML += `<option value="${loc.id}">${loc.name}</option>`;
                });
            });

        // Evento cuando se selecciona una ubicación
        locationSelect.addEventListener('change', async () => {
            const locationId = locationSelect.value;
            if (!locationId) {
                experiencesContainer.style.display = 'none';
                return;
            }
            
            const selectedLocationName = locationSelect.options[locationSelect.selectedIndex].text;
            experiencesTitle.textContent = `Experiencias en ${selectedLocationName}`;
            
            // Cargar experiencias para esa ubicación
            const response = await fetch(`http://localhost:3000/api/locations/${locationId}/experiences`);
            const experiences = await response.json();
            
            experiencesTbody.innerHTML = '';
            if (experiences.length > 0) {
                 experiences.forEach(exp => {
                    const row = `
                        <tr>
                            <td>${exp.id}</td>
                            <td>${exp.title}</td>
                            <td><img src="/mi-proyecto/${exp.image}" alt="${exp.title}" width="100"></td>
                            <td>
                                <button class="btn btn-danger delete-btn" data-id="${exp.id}">Eliminar</button>
                            </td>
                        </tr>
                    `;
                    experiencesTbody.innerHTML += row;
                });
            } else {
                 experiencesTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay experiencias para esta ubicación.</td></tr>';
            }
            experiencesContainer.style.display = 'block';
        });
        
        // Mostrar/ocultar formulario de añadir
        addExperienceBtn.addEventListener('click', () => addExperienceForm.style.display = 'block');
        cancelAddBtn.addEventListener('click', () => addExperienceForm.style.display = 'none');

        // Enviar formulario para AÑADIR experiencia
        addExperienceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('location_id', locationSelect.value);
            formData.append('title', addExperienceForm.querySelector('[name="title"]').value);
            formData.append('description', addExperienceForm.querySelector('[name="description"]').value);
            formData.append('image', addExperienceForm.querySelector('[name="image"]').files[0]);

            await fetch('http://localhost:3000/api/experiences', {
                method: 'POST',
                body: formData // No se pone 'Content-Type', el navegador lo hace solo con FormData
            });

            addExperienceForm.reset();
            addExperienceForm.style.display = 'none';
            locationSelect.dispatchEvent(new Event('change')); // Recargar la tabla
        });
        
        // ELIMINAR experiencia
        experiencesTbody.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const id = e.target.dataset.id;
                if (confirm('¿Seguro que quieres eliminar esta experiencia?')) {
                    await fetch(`http://localhost:3000/api/experiences/${id}`, { method: 'DELETE' });
                    locationSelect.dispatchEvent(new Event('change')); // Recargar
                }
            }
        });
    });
    </script>
</body>
</html>