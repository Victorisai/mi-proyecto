<?php
session_start();
include '../includes/config.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $pdo->prepare("DELETE FROM properties WHERE id = :id");
$stmt->bindParam(':id', $id);
$stmt->execute();

header('Location: dashboard.php');
exit;
?>