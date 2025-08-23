<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit;
}
// Lista de municipios, la mantenemos aquí para poblar el <select> fácilmente.
$municipalities = [
    'Cozumel', 'Felipe Carrillo Puerto', 'Isla Mujeres', 'Othón P. Blanco', 'Benito Juárez',
    'José María Morelos', 'Lázaro Cárdenas', 'Playa del Carmen', 'Tulum', 'Bacalar', 'Puerto Morelos'
];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestionar Ubicaciones - CedralSales</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
    <section class="dashboard">
        <div class="container">
            <h2>Gestionar Ubicaciones</h2>

            <div id="form-container" style="display: none; margin-bottom: 20px;">
                <h3 id="form-title">Agregar Nueva Ubicación</h3>
                <form id="location-form" class="admin-form">
                    <input type="hidden" id="location-id" name="id">
                    <div class="form-group">
                        <label for="name">Nombre de la Ubicación</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="municipality">Municipio</label>
                        <select id="municipality" name="municipality" required>
                            <?php foreach ($municipalities as $mun): ?>
                                <option value="<?php echo $mun; ?>"><?php echo $mun; ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                    <button type="button" id="cancel-btn" class="btn btn-secondary">Cancelar</button>
                </form>
            </div>

            <div class="dashboard-actions">
                <button id="add-new-btn" class="btn btn-primary">Agregar Nueva Ubicación</button>
                <a href="dashboard.php" class="btn btn-secondary">Volver al Panel</a>
            </div>
            <div class="table-wrapper">
                <table class="property-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Municipio</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="locations-tbody">
                        </tbody>
                </table>
            </div>
        </div>
    </section>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const tbody = document.getElementById('locations-tbody');
        const formContainer = document.getElementById('form-container');
        const locationForm = document.getElementById('location-form');
        const formTitle = document.getElementById('form-title');
        const addNewBtn = document.getElementById('add-new-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        
        const API_URL = 'http://localhost:3000/api/locations';

        // FUNCIÓN PARA CARGAR LAS UBICACIONES
        const fetchLocations = async () => {
            const response = await fetch(API_URL);
            const locations = await response.json();
            tbody.innerHTML = '';
            locations.forEach(location => {
                const row = `
                    <tr>
                        <td>${location.id}</td>
                        <td>${location.name}</td>
                        <td>${location.municipality}</td>
                        <td>
                            <button class="btn btn-primary edit-btn" data-id="${location.id}" data-name="${location.name}" data-municipality="${location.municipality}">Editar</button>
                            <button class="btn btn-danger delete-btn" data-id="${location.id}">Eliminar</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        };

        // MOSTRAR/OCULTAR FORMULARIO
        const showForm = (isEdit = false, data = {}) => {
            formTitle.textContent = isEdit ? 'Editar Ubicación' : 'Agregar Nueva Ubicación';
            locationForm.reset();
            locationForm['location-id'].value = data.id || '';
            locationForm.name.value = data.name || '';
            locationForm.municipality.value = data.municipality || 'Cozumel';
            formContainer.style.display = 'block';
            addNewBtn.style.display = 'none';
        };
        const hideForm = () => {
            formContainer.style.display = 'none';
            addNewBtn.style.display = 'inline-block';
        };

        addNewBtn.addEventListener('click', () => showForm());
        cancelBtn.addEventListener('click', hideForm);

        // EVENT LISTENER PARA GUARDAR (AÑADIR O EDITAR)
        locationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = locationForm['location-id'].value;
            const isEdit = !!id;
            
            const data = {
                name: locationForm.name.value,
                municipality: locationForm.municipality.value
            };

            await fetch(isEdit ? `${API_URL}/${id}` : API_URL, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            hideForm();
            fetchLocations();
        });
        
        // EVENT LISTENER PARA BOTONES DE LA TABLA (EDITAR Y ELIMINAR)
        tbody.addEventListener('click', async (e) => {
            const target = e.target;
            const id = target.dataset.id;

            if (target.classList.contains('edit-btn')) {
                showForm(true, { 
                    id, 
                    name: target.dataset.name, 
                    municipality: target.dataset.municipality 
                });
            }

            if (target.classList.contains('delete-btn')) {
                if (confirm('¿Estás seguro de eliminar esta ubicación?')) {
                   const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                   if (!response.ok) {
                       const errorData = await response.json();
                       alert(`Error: ${errorData.error}`);
                   }
                   fetchLocations();
                }
            }
        });

        // Carga inicial
        fetchLocations();
    });
    </script>
</body>
</html>