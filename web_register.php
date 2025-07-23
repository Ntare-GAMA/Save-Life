<?php

header('Content-Type: application/json');

// Get values
$phoneNumber = $_POST['phoneNumber'] ?? null;
$idType = $_POST['idType'] ?? null;
$idNumber = $_POST['idNumber'] ?? null;

// Check all are present
if ($phoneNumber && $idType && $idNumber) {
    // ✅ Save to text file
    $logEntry = "$phoneNumber | $idType | $idNumber\n";
    file_put_contents("registrations.txt", $logEntry, FILE_APPEND);

    // 📩 Simulate SMS notification (this is just part of the response, no real SMS sent)
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
