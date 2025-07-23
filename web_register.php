<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    print_r($_POST); // í±ˆ This will help you debug

    $phoneNumber = $_POST['phoneNumber'] ?? null;
    $idType = $_POST['idType'] ?? null;
    $idNumber = $_POST['idNumber'] ?? null;

    if (!$phoneNumber || !$idType || !$idNumber) {
        echo json_encode(["status" => "error", "message" => "Missing parameters."]);
        exit;
    }

    // Continue with registration logic...
}
?>
