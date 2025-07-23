<?php
// This first line is very important. It tells the browser that this file will send back JSON data,

header('Content-Type: application/json');

//DATABASE CONNECTION

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "savelife";

// Create the connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check for connection errors
if ($conn->connect_error) {
  // If it fails, send back a JSON error message and stop.
  echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
  exit();
}

// --- 2. GET THE FILTER FROM THE URL ---
// This checks if the URL has something like "?bloodType=A+" at the end.
// If not, it defaults to 'all'.
$bloodType = isset($_GET['bloodType']) ? $_GET['bloodType'] : 'all';

// --- 3. BUILD THE SQL QUERY ---
// This query selects the data we need for the map.
// CRITICAL: We only select donors who actually have coordinates!
$sql = "SELECT 
            name AS donor_name, 
            bloodType AS blood_type, 
            donor_lat, 
            donor_lng 
        FROM donors 
        WHERE donor_lat IS NOT NULL AND donor_lng IS NOT NULL";

// If the user filtered by a specific blood type (e.g., "A+"),
// we add that condition to our SQL query.
if ($bloodType != 'all') {
    $sql .= " AND bloodType = ?"; // Append the filter condition
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $bloodType); // Safely bind the blood type
} else {
    // If we want all donors, we just prepare the original query.
    $stmt = $conn->prepare($sql);
}

// --- 4. EXECUTE THE QUERY AND FETCH THE DATA ---
$stmt->execute();
$result = $stmt->get_result();
$donors = array(); // Create an empty array to hold our donors

// Check if the query returned any results
if ($result && $result->num_rows > 0) {
  // Loop through each row of the results
  while($row = $result->fetch_assoc()) {
    // Make sure lat/lng are numbers, not text
    $row['donor_lat'] = (float)$row['donor_lat'];
    $row['donor_lng'] = (float)$row['donor_lng'];
    // Add the donor to our array
    $donors[] = $row;
  }
}

// --- 5. SEND THE RESPONSE ---
// This is the final step. json_encode() converts our PHP array into a JSON string.
// This is the data that gets sent back to the map's JavaScript.
echo json_encode($donors);

// Close the database connection to free up resources.
$conn->close();
?>