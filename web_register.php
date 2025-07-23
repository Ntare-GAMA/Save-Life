<?php

header('Content-Type: application/json');

// Get values
$phoneNumber = $_POST['phoneNumber'] ?? null;
$idType = $_POST['idType'] ?? null;
$idNumber = $_POST['idNumber'] ?? null;

// Check all are present
if ($phoneNumber && $idType && $idNumber) {
    // Success response
    echo json_encode([
        'status' => 'success',
        'message' => 'User registered successfully!',
        'data' => [
            'phoneNumber' => $phoneNumber,
            'idType' => $idType,
            'idNumber' => $idNumber
        ]
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing parameters.'
    ]);
}
?>
