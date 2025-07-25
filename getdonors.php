<?php
header('Content-Type: application/json');


$servername = "localhost";
$username = "root";
$password = "";
$dbname = "savelife";

//making connection
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  
  echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
  exit();
}

$bloodType = isset($_GET['bloodType']) ? $_GET['bloodType'] : 'all';


$sql = "SELECT 
            name AS donor_name, 
            bloodType AS blood_type, 
            donor_lat, 
            donor_lng 
        FROM donors 
        WHERE donor_lat IS NOT NULL AND donor_lng IS NOT NULL";



if ($bloodType != 'all') {
    $sql .= " AND bloodType = ?"; 
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $bloodType);
} else {
    
    $stmt = $conn->prepare($sql);
}


$stmt->execute();
$result = $stmt->get_result();
$donors = array(); 


if ($result && $result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    $row['donor_lat'] = (float)$row['donor_lat'];
    $row['donor_lng'] = (float)$row['donor_lng'];
    $donors[] = $row;
  }
}
echo json_encode($donors);
$conn->close();
?>