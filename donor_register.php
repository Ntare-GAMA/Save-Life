<?php
// --- 1. DATABASE CONNECTION ---
$conn = new mysqli("localhost", "root", "", "savelife");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// --- 2. RETRIEVE FORM DATA ---
$name = $_POST['name'];
$phone = $_POST['phone'];
$whatsapp = $_POST['whatsapp'];
$bloodType = $_POST['bloodType'];
$locationText = $_POST['location']; // We get the donor's address text
$registeredAt = date('Y-m-d H:i:s');

// --- 3. GEOCODING LOGIC ---
// This section converts the address text into latitude and longitude

$latitude = null;  // Default to null if not found
$longitude = null; // Default to null if not found

if (!empty($locationText)) {
    // A. Prepare the address for the API URL
    $fullAddress = urlencode($locationText);

    // B. Build the API URL for Nominatim (a free geocoding service)
    // IMPORTANT: Nominatim requires a custom User-Agent header.
    $apiUrl = "https://nominatim.openstreetmap.org/search?q={$fullAddress}&format=json&limit=1";
    $options = [
        'http' => [
            'header' => "User-Agent: SaveLifeApp/1.0 (contact@yourapp.com)\r\n"
        ]
    ];
    $context = stream_context_create($options);

    // C. Call the API and get the results
    $response = file_get_contents($apiUrl, false, $context);
    $data = json_decode($response, true);

    // D. Extract the coordinates from the response if found
    if (!empty($data)) {
        $latitude = (float) $data[0]['lat'];
        $longitude = (float) $data[0]['lon'];
    }
}

// --- 4. SECURE DATABASE INSERT (Using Prepared Statements) ---
// This is much safer than the old method. It prevents SQL injection.

// A. The SQL query with placeholders (?)
$sql = "INSERT INTO donors (name, phone, whatsapp, bloodType, location, registeredAt, donor_lat, donor_lng)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

// B. Prepare the statement
$stmt = $conn->prepare($sql);

// C. Bind the variables to the placeholders
// The "sssssidd" tells MySQL the data type for each variable:
// s = string, i = integer, d = double (for our lat/lng)
$stmt->bind_param("ssssssdd", $name, $phone, $whatsapp, $bloodType, $locationText, $registeredAt, $latitude, $longitude);

// D. Execute the query and check for success
if ($stmt->execute()) {
    echo "success";
} else {
    echo "Error: " . $stmt->error;
}

// E. Close the statement and the connection
$stmt->close();
$conn->close();
?>