<?php
$password = 'veikor28'; // Cambia esto por la contraseña que quieras
$hashed_password = password_hash($password, PASSWORD_BCRYPT);
echo $hashed_password;
?>
