<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contacto - CedralSales</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <?php include 'includes/header.php'; ?>

    <section class="contact">
        <div class="container">
            <h2 class="fade-in">Contacto</h2>
            <p class="fade-in">Envíanos tu mensaje y nos pondremos en contacto contigo.</p>

            <div id="form-messages"></div>

            <form id="contact-form" class="contact-form fade-in">
                <div class="contact-form__group">
                    <label class="contact-form__label" for="name">Nombre</label>
                    <input class="contact-form__input" type="text" id="name" name="name" required>
                </div>
                <div class="contact-form__group">
                    <label class="contact-form__label" for="email">Email</label>
                    <input class="contact-form__input" type="email" id="email" name="email" required>
                </div>
                <div class="contact-form__group">
                    <label class="contact-form__label" for="phone">Número de Teléfono</label>
                    <input class="contact-form__input" type="tel" id="phone" name="phone" required>
                </div>
                <div class="contact-form__group">
                    <label class="contact-form__label" for="message">Mensaje</label>
                    <textarea class="contact-form__input" id="message" name="message" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Enviar</button>
            </form>
        </div>
    </section>

    <?php include 'includes/footer.php'; ?>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('contact-form');
        const messagesDiv = document.getElementById('form-messages');

        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Evitamos que el formulario se envíe de la forma tradicional.

            // Recolectamos los datos del formulario.
            const formData = {
                name: form.name.value,
                email: form.email.value,
                phone: form.phone.value,
                message: form.message.value,
            };

            // Hacemos la petición POST a nuestra API.
            fetch('http://localhost:3000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                // Si la respuesta no es OK, lanzamos un error para que lo capture el .catch()
                if (!response.ok) {
                     return response.json().then(err => { throw new Error(err.error || 'Error desconocido') });
                }
                return response.json();
            })
            .then(data => {
                // Si todo sale bien, mostramos un mensaje de éxito y reseteamos el formulario.
                messagesDiv.innerHTML = `<p class="success fade-in">Mensaje enviado con éxito. Te contactaremos pronto.</p>`;
                form.reset();
            })
            .catch(error => {
                // Si hay un error, lo mostramos.
                console.error('Error al enviar el mensaje:', error);
                messagesDiv.innerHTML = `<p class="error fade-in">Error: ${error.message}. Por favor, inténtalo de nuevo.</p>`;
            });
        });
    });
    </script>
    <script src="assets/js/main.js"></script>
</body>
</html>