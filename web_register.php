<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $phone = $_POST['phoneNumber'] ?? '';
    $idType = $_POST['idType'] ?? '';
    $idNumber = $_POST['idNumber'] ?? '';

    if ($phone && $idType && $idNumber) {
        // Simulate registration and response
        echo json_encode([
            "status" => "success",
            "message" => "User registered successfully.",
            "data" => [
                "phone" => $phone,
                "idType" => $idType,
                "idNumber" => $idNumber
            ]
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Missing parameters."
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request method."
    ]);
}
?>

