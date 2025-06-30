<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit;
}
require_once '../includes/config.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $pdo->prepare("DELETE FROM locations WHERE id = :id");
$stmt->execute(['id' => $id]);

header("Location: manage_locations.php");
exit;
?>