<?php
$sessionId   = $_POST["sessionId"];
$serviceCode = $_POST["serviceCode"];
$phoneNumber = $_POST["phoneNumber"];
$text        = $_POST["text"];

$levels = explode("*", $text);

switch (count($levels)) {
    case 1:
        if ($text == "") {
            echo "CON Welcome to SaveLife 🩸\n";
            echo "Join our life-saving donor network.\n";
            echo "1. Register as Donor\n";
            echo "2. Exit";
        } elseif ($text == "1") {
            echo "CON Enter your full name:";
        } elseif ($text == "2") {
            echo "END Thank you for visiting SaveLife.";
        } else {
            echo "END Invalid input.";
        }
        break;

    case 2:
        echo "CON Select your blood type:\n";
        echo "1. A+\n2. A-\n3. B+\n4. B-\n5. AB+\n6. AB-\n7. O+\n8. O-";
        break;

    case 3:
        $bloodTypes = ["1" => "A+", "2" => "A-", "3" => "B+", "4" => "B-", "5" => "AB+", "6" => "AB-", "7" => "O+", "8" => "O-"];
        $blood = $bloodTypes[$levels[2]] ?? null;
        if ($blood) {
            echo "CON Enter your location (e.g. Kigali, Kicukiro):";
        } else {
            echo "END Invalid blood type selection.";
        }
        break;

    case 4:
        $name = $levels[1];
        $blood = $bloodTypes[$levels[2]];
        $location = $levels[3];

        // Save to a file or database
        $entry = "Name: $name | Phone: $phoneNumber | Blood Type: $blood | Location: $location\n";
        file_put_contents("donors.txt", $entry, FILE_APPEND);

        echo "END Thank you $name ($blood)!\nYou're now registered with SaveLife 🩸";
        break;

    default:
        echo "END Invalid input.";
}
?>
