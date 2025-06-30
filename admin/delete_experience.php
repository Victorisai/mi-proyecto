<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit;
}
require_once '../includes/config.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $pdo->prepare("SELECT location_id, image FROM experiences WHERE id = :id");
$stmt->execute(['id' => $id]);
$experience = $stmt->fetch(PDO::FETCH_ASSOC);

if ($experience) {
    $location_id = $experience['location_id'];
    if (file_exists('../' . $experience['image'])) {
        unlink('../' . $experience['image']);
    }
    $stmt = $pdo->prepare("DELETE FROM experiences WHERE id = :id");
    $stmt->execute(['id' => $id]);
    header("Location: manage_experiences.php?location_id=$location_id");
} else {
    header("Location: manage_experiences.php");
}
exit;
?>