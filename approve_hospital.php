<?php
$conn = new mysqli("localhost", "root", "", "savelife");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$id = $_POST['id'] ?? '';
if (!is_numeric($id)) {
    echo "Invalid ID";
    exit;
}

$stmt = $conn->prepare("UPDATE hospitals SET approved = 1 WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo "success";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
