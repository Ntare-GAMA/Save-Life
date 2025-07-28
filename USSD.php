<?php

header('Content-type: text/plain');

file_put_contents("debug.txt", print_r($_POST, true), FILE_APPEND);

$sessionId   = $_POST["sessionId"] ?? '';
$serviceCode = $_POST["serviceCode"] ?? '';
$phoneNumber = $_POST["phoneNumber"] ?? '';
$text        = $_POST["text"] ?? '';

$levels = explode("*", $text);

// Blood types
$bloodTypes = [
    "1" => "A+", "2" => "A-", "3" => "B+",
    "4" => "B-", "5" => "AB+", "6" => "AB-",
    "7" => "O+", "8" => "O-"
];

switch (count($levels)) {
    case 1:
        if ($text === "") {
            echo "Welcome to SaveLife 🩸\n";
            echo "Join our life-saving donor network.\n";
            echo "1. Register as Donor\n";
            echo "2. Exit";
        } elseif ($text === "1") {
            echo "CON Enter your full name:";
        } elseif ($text === "2") {
            echo "END Thank you for visiting SaveLife.";
        } else {
            echo "END Invalid option.";
        }
        break;

    case 2:
        echo "CON Select your blood type:\n";
        foreach ($bloodTypes as $key => $value) {
            echo "$key. $value\n";
        }
        break;

    case 3:
        $blood = $bloodTypes[$levels[2]] ?? null;
        if ($blood) {
            echo "CON Enter your location (e.g. Kigali, Kicukiro):";
        } else {
            echo "END Invalid blood type.";
        }
        break;

    case 4:
        $name     = trim($levels[1]);
        $blood    = $bloodTypes[$levels[2]] ?? 'Unknown';
        $location = trim($levels[3]);

        $entry = "Name: $name | Phone: $phoneNumber | Blood Type: $blood | Location: $location\n";
        $file = "donors.txt";

        if (is_writable(dirname(__FILE__))) {
            file_put_contents($file, $entry, FILE_APPEND);
            echo "END Thank you $name ($blood)!\nYou’re now registered with SaveLife 🩸";
        } else {
            echo "END System error: Cannot save info. Please try again later.";
        }

        break;

    default:
        echo "Something went wrong. Please try again.";
        break;
}
?>