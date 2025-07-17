<?php
$conn = new mysqli("localhost", "root", "", "savelife");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$name = $_POST['name'];
$phone = $_POST['phone'];
$whatsapp = $_POST['whatsapp'];
$bloodType = $_POST['bloodType'];
$location = $_POST['location'];
$registeredAt = date('Y-m-d H:i:s');

$sql = "INSERT INTO donors (name, phone, whatsapp, bloodType, location, registeredAt)
        VALUES ('$name', '$phone', '$whatsapp', '$bloodType', '$location', '$registeredAt')";

if ($conn->query($sql) === TRUE) {
    echo "success";
} else {
    echo "Error: " . $conn->error;
}
$conn->close();
?>
