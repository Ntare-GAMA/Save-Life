<?php

$response_html = '';

//DATABASE CONNECTION ---
$conn = new mysqli("localhost", "root", "", "savelife");

if ($conn->connect_error) {
    $response_html = "<h1>Connection Error</h1><p>There was a problem connecting to the database. Please try again later.</p>";
} else {
    $hospitalEmail = $_POST['hospitalEmail'] ?? '';
    $bloodType = $_POST['bloodType'] ?? '';
    $urgency = $_POST['urgency'] ?? '';
    $quantity = $_POST['quantity'] ?? 0;
    $notes = $_POST['notes'] ?? '';
    $createdAt = date('Y-m-d H:i:s');
    $status = 'pending';
    $insertSql = "INSERT INTO blood_requests (hospitalEmail, bloodType, urgency, quantity, notes, createdAt, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $insertStmt = $conn->prepare($insertSql);


    if ($insertStmt === false) {
        $response_html = "<div style='background-color: #ffcccc; border: 2px solid red; padding: 20px;'><h1>CRITICAL SQL ERROR</h1><p>The `prepare()` statement failed. This means your SQL query has a syntax error, or the table name `blood_requests` is wrong.</p><p><strong>Database Error:</strong> " . htmlspecialchars($conn->error) . "</p></div>";
    } else {
        $insertStmt->bind_param("sssisss", $hospitalEmail, $bloodType, $urgency, $quantity, $notes, $createdAt, $status);

        if ($insertStmt->execute()) {
            // SUCCESS: The request was saved
            $response_html .= "<h1>Blood Request Submitted Successfully!</h1>";
            $response_html .= "<p>Your request has been logged. We are now identifying potential donors.</p><hr>";

            // Log to file
            $logMessage = "SUCCESS: Blood request from [$hospitalEmail] for [$quantity] unit(s) of [$bloodType] on [$createdAt]\n";
            file_put_contents("blood_requests.log", $logMessage, FILE_APPEND | LOCK_EX);

    
            $hospitalName = "The Hospital";
            $hospitalLocation = "an unknown location";
            $hospitalContactEmail = $hospitalEmail; 

            // Get full details from 'hospitals' table.
            $hospitalSql = "SELECT name, location, email FROM hospitals WHERE email = ? LIMIT 1";
            $hospitalStmt = $conn->prepare($hospitalSql);
            $hospitalStmt->bind_param("s", $hospitalEmail);
            if ($hospitalStmt->execute()) {
                $hospitalResult = $hospitalStmt->get_result();
                if ($hospitalResult->num_rows > 0) {
                    $hospital = $hospitalResult->fetch_assoc();
                    $hospitalName = $hospital['name'];
                    $hospitalLocation = $hospital['location'];
                    $hospitalContactEmail = $hospital['email'];
                }
            }
            $hospitalStmt->close();

            $donorSql = "SELECT name, phone FROM donors WHERE bloodType = ?";
            $donorStmt = $conn->prepare($donorSql);
            $donorStmt->bind_param("s", $bloodType);
            $donorStmt->execute();
            $result = $donorStmt->get_result();

            if ($result->num_rows > 0) {
                $response_html .= "<h2>Potential Donors Found</h2>";
                
                // MESSAGE:  includes the hospital's location AND contact email.
                $messageToDonor = "Hello! An urgent blood donation is needed at <strong>" . htmlspecialchars($hospitalName) . "</strong> (located at: <strong>" . htmlspecialchars($hospitalLocation) . "</strong>). Your blood type, <strong>" . htmlspecialchars($bloodType) . "</strong>, is in high demand. For more information, please contact the hospital directly at: <strong>" . htmlspecialchars($hospitalContactEmail) . "</strong>. Please consider donating and saving a life.";

                $response_html .= "<ul class='donor-list'>";
                while ($donor = $result->fetch_assoc()) {
                    $response_html .= "<li><strong>Name:</strong> " . htmlspecialchars($donor['name']) . "<br><strong>Phone:</strong> " . htmlspecialchars($donor['phone']) . "<br><div class='message'><strong>Message:</strong> " . $messageToDonor . "</div></li>";
                }
                $response_html .= "</ul>";
            } else {
                $response_html .= "<h2>No Donors Found</h2><p>Unfortunately, no donors were found with the blood type: <strong>" . htmlspecialchars($bloodType) . "</strong>.</p>";
            }
            $donorStmt->close();

        } else {
            // This will show the exact reason, If the insert failed.
            $response_html = "<div style='background-color: #ffcccc; border: 2px solid red; padding: 20px; color: #333;'>";
            $response_html .= "<h1>ERROR: FAILED TO SAVE TO DATABASE</h1>";
            $response_html .= "<p>The request could not be saved. This is almost always a mismatch between the column names in the code and your database table.</p>";
            $response_html .= "<p><strong>Your Code is Using:</strong> `hospitalEmail`, `bloodType`, `urgency`, `quantity`, `notes`, `createdAt`, `status`</p>";
            $response_html .= "<hr>";
            $response_html .= "<h3>Exact Database Error Message:</h3>";
            $response_html .= "<pre style='background-color:#fff; padding:10px; border:1px solid #ccc; font-weight:bold; color:red;'>" . htmlspecialchars($insertStmt->error) . "</pre>";
            $response_html .= "<hr><p><strong>ACTION:</strong> Compare the column list above with a screenshot of your `blood_requests` table structure. The error message will tell you which one is wrong.</p>";
            $response_html .= "</div>";
        }
        $insertStmt->close();
    }
    $conn->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Request Status</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f4f4f9; color: #333; margin: 20px; }
        .container { background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 800px; margin: auto; border-top: 5px solid #d9534f; }
        h1, h2 { color: #d9534f; }
        hr { border: 0; height: 1px; background-color: #eee; margin: 20px 0; }
        .donor-list { list-style-type: none; padding: 0; }
        .donor-list li { background-color: #fdfdfd; border: 1px solid #e9e9e9; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
        .message { margin-top: 10px; padding: 10px; background-color: #fff9e6; border-left: 3px solid #f0ad4e; color: #8a6d3b; }
        .close-button { display: inline-block; margin-top: 25px; padding: 12px 25px; background-color: #5cb85c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <?php echo $response_html; ?>
    
        <a onclick="window.close();" class="close-button">Done! Close This Tab</a>
    </div>
</body>
</html>