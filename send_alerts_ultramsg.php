<?php

header('Content-Type: application/json');

// This is the api configuration 
$instanceId = "134304";
$token = "o8kxdoeyj9j38600";
$apiUrl = "https://api.ultramsg.com/{$instanceId}/messages/chat";
$distanceLimitKm = 10;


// The Database connection
$conn = mysqli_connect("localhost", "root", "", "savelife");
if (!$conn) {
    http_response_code(500);
    echo json_encode(["error" => "MySQL connection failed."]);
    exit;
}


$data = json_decode(file_get_contents("php://input"), true);
$bloodType = $data['bloodType'];
$location = $data['location'];
//$hospitalLat = floatval($data['lat']);
//$hospitalLon = floatval($data['lon']);
$hospitalName = $data['name'];

/*
function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371;
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    $a = sin($dLat / 2) ** 2 +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon / 2) ** 2;
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    return $earthRadius * $c;
} */

if (!$bloodType || !$location || !$hospitalName) {
    http_response_code(400);
    echo json_encode(["error" => "Missing blood_type, location, or hospital_name."]);
    exit;
}

// Query donors
$query = "SELECT * FROM donors WHERE bloodType = ? AND location = ?";
$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, "ss", $bloodType,$location);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);


$notified = [];
$errors = [];

while ($row = mysqli_fetch_assoc($result)) {
    $phone = $row['whatsapp'];
    $message = "🩸 Urgent: {$bloodType} blood needed at {$hospitalName} ({$locationName}). Can you donate today?";

    $postData = http_build_query([
        "token" => $token,
        "to" => $phone,
        "body" => $message
    ]);

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/x-www-form-urlencoded"]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode == 200 && strpos($response, '"sent":true') !== false) {
        $notified[] = $phone;
    } else {
        $errors[] = ["phone" => $phone, "response" => $response];
    }
}

// Return status report to frontend
echo json_encode([
    "status" => count($notified) > 0 ? "success" : "no_alerts_sent",
    "recipients" => $notified,
    "failed" => $errors,
    "count" => count($notified)
]);
?>
