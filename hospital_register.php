<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to plain text for better debugging
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Debug: Log the request
error_log("Hospital registration request received at " . date('Y-m-d H:i:s'));

try {
    // Debug: Log POST data (without password)
    error_log("POST data received: " . json_encode(array_merge($_POST, ['password' => '[HIDDEN]'])));
    error_log("FILES data: " . json_encode($_FILES));

    $conn = new mysqli("localhost", "root", "", "savelife");

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Check required fields
    if (empty($_POST['name']) || empty($_POST['email']) || empty($_POST['password']) || empty($_POST['location'])) {
        $missing = [];
        if (empty($_POST['name'])) $missing[] = 'name';
        if (empty($_POST['email'])) $missing[] = 'email';
        if (empty($_POST['password'])) $missing[] = 'password';
        if (empty($_POST['location'])) $missing[] = 'location';
        throw new Exception("Missing required form data: " . implode(', ', $missing));
    }
    
    $name = mysqli_real_escape_string($conn, trim($_POST['name']));
    $email = mysqli_real_escape_string($conn, trim($_POST['email']));
    $password = mysqli_real_escape_string($conn, trim($_POST['password']));
    $location = mysqli_real_escape_string($conn, trim($_POST['location']));
    $approved = 0;
    $registeredAt = date('Y-m-d H:i:s');
    
  

    $checkEmail = $conn->prepare("SELECT id FROM hospitals WHERE email = ?");
    $checkEmail->bind_param("s", $email);
    $checkEmail->execute();
    $result = $checkEmail->get_result();
    
    if ($result->num_rows > 0) {
        throw new Exception("Email already registered");
    }
    

    $certificateFileName = '';
    if (isset($_FILES['certificate']) && $_FILES['certificate']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/certificates/';
        

        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                throw new Exception("Failed to create upload directory");
            }
        }
        

        $originalName = $_FILES['certificate']['name'];
        $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        

        if (!in_array($fileExtension, $allowedExtensions)) {
            throw new Exception("Only PDF, JPG, and PNG files are allowed");
        }
        

        if ($_FILES['certificate']['size'] > 5 * 1024 * 1024) {
            throw new Exception("File size must be less than 5MB");
        }
        
    
        $certificateFileName = uniqid() . '_' . time() . '.' . $fileExtension;
        $targetPath = $uploadDir . $certificateFileName;
        
 
        if (!move_uploaded_file($_FILES['certificate']['tmp_name'], $targetPath)) {
            throw new Exception("Failed to upload certificate file");
        }
        
    } else {
    
        $uploadErrors = [
            UPLOAD_ERR_INI_SIZE => 'File too large (exceeds upload_max_filesize)',
            UPLOAD_ERR_FORM_SIZE => 'File too large (exceeds MAX_FILE_SIZE)',
            UPLOAD_ERR_PARTIAL => 'File partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'No temporary directory',
            UPLOAD_ERR_CANT_WRITE => 'Cannot write to disk',
            UPLOAD_ERR_EXTENSION => 'Upload stopped by extension'
        ];
        
        $errorCode = isset($_FILES['certificate']['error']) ? $_FILES['certificate']['error'] : UPLOAD_ERR_NO_FILE;
        $errorMessage = $uploadErrors[$errorCode] ?? 'Unknown upload error';
        throw new Exception($errorMessage);
    }
    

    $sql = "INSERT INTO hospitals (name, email, password, location, certificate, approved, registeredAt) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Database prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("sssssss", $name, $email, $password, $location, $certificateFileName, $approved, $registeredAt);
    
    if ($stmt->execute()) {
        echo "success";
    } else {
        // Clean up uploaded file if database insert fails
        if (isset($targetPath) && file_exists($targetPath)) {
            unlink($targetPath);
        }
        throw new Exception("Database insert failed: " . $stmt->error);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>