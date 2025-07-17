<?php
$conn = new mysqli("localhost", "root", "", "savelife");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$data = [];

$data['donors'] = [];
$result = $conn->query("SELECT * FROM donors");
while ($row = $result->fetch_assoc()) {
    $data['donors'][] = $row;
}

$data['hospitals'] = [];
$result = $conn->query("SELECT * FROM hospitals WHERE approved=1");
while ($row = $result->fetch_assoc()) {
    $data['hospitals'][] = $row;
}

$data['pendingHospitals'] = [];
$result = $conn->query("SELECT * FROM hospitals WHERE approved=0");
while ($row = $result->fetch_assoc()) {
    $data['pendingHospitals'][] = $row;
}

$data['bloodRequests'] = [];
$result = $conn->query("SELECT * FROM blood_requests");
while ($row = $result->fetch_assoc()) {
    $data['bloodRequests'][] = $row;
}

header('Content-Type: application/json');
echo json_encode($data);

$conn->close();
?>
