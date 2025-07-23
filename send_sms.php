<?php
require 'vendor/autoload.php'; 

use AfricasTalking\SDK\AfricasTalking;

$username = 'sandbox';
$apiKey   = 'atsk_03f0fca0c6de0964cf5967280203940e815eeaa22ba3450f2031cb0365087bc2c07aba20';

$AT = new AfricasTalking($username, $apiKey);
$sms = $AT->sms();

$phone = $_POST['phone'] ?? '';
$message = $_POST['message'] ?? '';

if ($phone && $message) {
    try {
        $result = $sms->send([
            'to' => $phone,
            'message' => $message
        ]);
        echo 'SMS sent';
    } catch (Exception $e) {
        echo 'SMS error: ' . $e->getMessage();
    }
} else {
    echo 'Missing phone or message';
}
?>
