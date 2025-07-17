<?php
$conn = new mysqli("localhost", "root", "", "savelife");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$email = $_POST['email'];
$password = $_POST['password'];

$sql = "SELECT * FROM hospitals WHERE email='$email' AND password='$password' AND approved=1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "success";
} else {
    echo "fail";
}
$conn->close();
?>
