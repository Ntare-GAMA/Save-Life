<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for CORS and content type
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get POST data
    $email = $_POST['email'] ?? '';
    $question = $_POST['question'] ?? '';
    
    // Validate input
    if (empty($email) || empty($question)) {
        throw new Exception('Email and question are required');
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Sanitize input to prevent any potential issues
    $email = trim(strip_tags($email));
    $question = trim(strip_tags($question));

    // Check for reasonable length limits
    if (strlen($email) > 255) {
        throw new Exception('Email address is too long');
    }

    if (strlen($question) > 5000) {
        throw new Exception('Question is too long (maximum 5000 characters)');
    }

    if (strlen($question) < 10) {
        throw new Exception('Question is too short (minimum 10 characters)');
    }
    
    // Create complaints directory if it doesn't exist
    $complaintsDir = 'complaints';
    if (!is_dir($complaintsDir)) {
        if (!mkdir($complaintsDir, 0755, true)) {
            throw new Exception('Failed to create complaints directory');
        }
    }
    
    // Generate timestamp for filename and content
    $timestamp = date('Y-m-d_H-i-s');
    $readableTimestamp = date('Y-m-d H:i:s');
    
    // Create filename with timestamp
    $filename = "help_request_{$timestamp}.txt";
    $filepath = $complaintsDir . '/' . $filename;
    
    // Prepare content for the file
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
    $content .= "User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown') . "\n";
    $content .= "=== END OF RECORD ===\n";
    
    // Save to file
    $result = file_put_contents($filepath, $content);
    
    if ($result === false) {
        throw new Exception('Failed to save help request to file');
    }
    
    // Update the index file for administrative review
    updateHelpRequestIndex($filename, $email, $readableTimestamp, $question);

    // Log the submission for debugging
    error_log("Help request saved: {$filepath} - Email: {$email}");

    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Help request submitted successfully',
        'filename' => $filename,
        'timestamp' => $readableTimestamp
    ]);
    
} catch (Exception $e) {
    // Log error
    error_log("Help request submission error: " . $e->getMessage());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

/**
 * Update the help request index file for administrative review
 */
if (!function_exists('updateHelpRequestIndex')) {
    function updateHelpRequestIndex($filename, $email, $timestamp, $question) {
    $indexFile = 'complaints/help_requests_index.txt';

    // Create header if file doesn't exist
    if (!file_exists($indexFile)) {
        $header = "=== HELP REQUESTS INDEX ===\n";
        $header .= "Generated: " . date('Y-m-d H:i:s') . "\n";
        $header .= "Format: [Timestamp] | Email | Filename | Preview\n";
        $header .= str_repeat("=", 80) . "\n\n";
        file_put_contents($indexFile, $header);
    }

    // Create preview (first 100 characters of question)
    $preview = strlen($question) > 100 ? substr($question, 0, 100) . '...' : $question;
    $preview = str_replace(["\n", "\r"], ' ', $preview); // Remove line breaks

    // Create index entry
    $indexEntry = "[{$timestamp}] | {$email} | {$filename} | {$preview}\n";

    // Append to index file
    file_put_contents($indexFile, $indexEntry, FILE_APPEND | LOCK_EX);
    }
}
?>
