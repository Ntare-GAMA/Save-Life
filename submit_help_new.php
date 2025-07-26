<?php
// New simplified help request submission
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get POST data
    $email = trim($_POST['email'] ?? '');
    $question = trim($_POST['question'] ?? '');
    
    // Log for debugging
    error_log("Help request received - Email: '$email', Question length: " . strlen($question));
    
    // Validate input
    if (empty($email)) {
        throw new Exception('Email is required');
    }
    
    if (empty($question)) {
        throw new Exception('Question is required');
    }
    
    if (strlen($question) < 10) {
        throw new Exception('Please provide a more detailed question (minimum 10 characters)');
    }
    
    if (strlen($question) > 5000) {
        throw new Exception('Question is too long (maximum 5000 characters)');
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Please enter a valid email address');
    }
    
    // Create complaints directory if needed
    $complaintsDir = 'complaints';
    if (!is_dir($complaintsDir)) {
        if (!mkdir($complaintsDir, 0755, true)) {
            throw new Exception('Unable to create storage directory');
        }
    }
    
    // Generate unique filename
    $timestamp = date('Y-m-d_H-i-s');
    $readableTimestamp = date('Y-m-d H:i:s');
    $filename = "help_request_{$timestamp}.txt";
    $filepath = $complaintsDir . '/' . $filename;
    
    // Create file content
    $content = "=== HELP REQUEST SUBMISSION ===\n";
    $content .= "Submission Date: {$readableTimestamp}\n";
    $content .= "User Email: {$email}\n";
    $content .= "Request Type: Help/Support\n";
    $content .= "Status: New\n";
    $content .= "\n--- USER MESSAGE ---\n";
    $content .= $question . "\n";
    $content .= "\n--- END OF MESSAGE ---\n";
    $content .= "\nFile Generated: {$filename}\n";
    $content .= "Server IP: " . ($_SERVER['SERVER_ADDR'] ?? 'Unknown') . "\n";
    $content .= "User IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "\n";
    $content .= "=== END OF RECORD ===\n";
    
    // Save the file
    if (file_put_contents($filepath, $content) === false) {
        throw new Exception('Unable to save help request');
    }
    
    // Update index file
    $indexFile = $complaintsDir . '/help_requests_index.txt';
    
    // Create index header if file doesn't exist
    if (!file_exists($indexFile)) {
        $header = "=== HELP REQUESTS INDEX ===\n";
        $header .= "Generated: " . date('Y-m-d H:i:s') . "\n";
        $header .= "Format: [Timestamp] | Email | Filename | Preview\n";
        $header .= str_repeat("=", 80) . "\n\n";
        file_put_contents($indexFile, $header);
    }
    
    // Add entry to index
    $preview = strlen($question) > 100 ? substr($question, 0, 100) . '...' : $question;
    $preview = str_replace(["\n", "\r", "\t"], ' ', $preview);
    $indexEntry = "[{$readableTimestamp}] | {$email} | {$filename} | {$preview}\n";
    
    file_put_contents($indexFile, $indexEntry, FILE_APPEND | LOCK_EX);
    
    // Log success
    error_log("Help request saved successfully: {$filepath}");
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Help request submitted successfully',
        'filename' => $filename,
        'timestamp' => $readableTimestamp
    ]);
    
} catch (Exception $e) {
    // Log the error
    error_log("Help request error: " . $e->getMessage());
    
    // Return error response
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
