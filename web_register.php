<?php

header('Content-Type: application/json');

$phoneNumber = $_POST['phoneNumber'] ?? null;
$idType = $_POST['idType'] ?? null;
$idNumber = $_POST['idNumber'] ?? null;

if ($phoneNumber && $idType && $idNumber) {
    
    $logEntry = "$phoneNumber | $idType | $idNumber\n";
    file_put_contents("registrations.txt", $logEntry, FILE_APPEND);

    echo json_encode([
        'status' => 'success',
        'message' => 'Registration complete. SMS sent to user!',
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
