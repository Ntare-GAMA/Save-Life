<?php
$conn = new mysqli("localhost", "root", "", "savelife");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$id = $_POST['id'];

$sql = "UPDATE hospitals SET approved=1 WHERE id=$id";

if ($conn->query($sql) === TRUE) {
    echo "success";
} else {
    echo "Error: " . $conn->error;
}
$conn->close();
?>
