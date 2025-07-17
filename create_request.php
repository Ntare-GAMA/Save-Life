<?php
$conn = new mysqli("localhost", "root", "", "savelife");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$hospitalEmail = $_POST['hospitalEmail'];
$bloodType = $_POST['bloodType'];
$urgency = $_POST['urgency'];
$quantity = $_POST['quantity'];
$notes = $_POST['notes'];
$createdAt = date('Y-m-d H:i:s');
$status = 'pending';

$sql = "INSERT INTO blood_requests (hospitalEmail, bloodType, urgency, quantity, notes, createdAt, status)
        VALUES ('$hospitalEmail', '$bloodType', '$urgency', $quantity, '$notes', '$createdAt', '$status')";

if ($conn->query($sql) === TRUE) {
    echo "success";
} else {
    echo "Error: " . $conn->error;
}
$conn->close();
?>
