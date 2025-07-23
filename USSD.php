<?php
// Simulate SMS sending function
function send_sms($phoneNumber, $message) {
    // In real implementation: use Twilio, Africa's Talking, etc.
    // Example: send to both donor and RBC
    file_put_contents("sms_log.txt", "To: $phoneNumber - $message\n", FILE_APPEND);
}

// Collect USSD input
$sessionId   = $_POST["sessionId"];
$serviceCode = $_POST["serviceCode"];
$phoneNumber = $_POST["phoneNumber"];
$text        = $_POST["text"];

$input = explode("*", $text);
$level = count($input);

if ($text == "") {
    echo "CON Welcome to Save Life USSD\n";
    echo "1. Register as Donor\n";
    echo "2. Exit";
}
elseif ($input[0] == "1") {
    if ($level == 1) {
        echo "CON Choose ID type:\n";
        echo "1. National ID\n";
        echo "2. Passport";
    } elseif ($level == 2) {
        echo "CON Enter your ID number:";
    } elseif ($level == 3) {
        $idType = $input[1] == "1" ? "National ID" : "Passport";
        $idNumber = $input[2];

        // Basic validation
        if ($input[1] == "1" && strlen($idNumber) != 16) {
            echo "END Invalid National ID. It must be 16 digits.";
        } else {
            // Simulate saving to DB here
            // You can use mysqli_query(...) to store it in a real DB

            // Send SMS to user and RBC
            $message = "Save Life: You ($idType: $idNumber) have been registered as a blood donor.";
            send_sms($phoneNumber, $message);
            send_sms("+250788000000", "New Donor Registered: $phoneNumber - $idType $idNumber (Notify RBC)");

            echo "END Thank you. You are now registered as a blood donor.\n";
            echo "An SMS has been sent to you and RBC.";
        }
    }
} elseif ($input[0] == "2") {
    echo "END Thank you for using Save Life.";
} else {
    echo "END Invalid option.";
}
?>

