<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Help Requests - Save Life Admin</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #e74c3c;
            border-bottom: 3px solid #e74c3c;
            padding-bottom: 10px;
        }
        .request-item {
            background: #f8f9fa;
            margin: 15px 0;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .request-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .email {
            font-weight: bold;
            color: #2c3e50;
        }
        .timestamp {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        .filename {
            color: #27ae60;
            font-size: 0.8em;
            font-family: monospace;
        }
        .message {
            background: white;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
            line-height: 1.6;
        }
        .no-requests {
            text-align: center;
            color: #7f8c8d;
            padding: 40px;
        }
        .stats {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .btn {
            display: inline-block;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
            border: 2px solid transparent;
            cursor: pointer;
        }
        .btn-primary {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }
        .btn-primary:hover {
            background: #2980b9;
            border-color: #2980b9;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }
        .btn-secondary {
            background: #e74c3c;
            color: white;
            border-color: #e74c3c;
        }
        .btn-secondary:hover {
            background: #c0392b;
            border-color: #c0392b;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }
        @media (max-width: 600px) {
            .btn {
                width: 100%;
                max-width: 250px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Help Requests Dashboard</h1>
        
        <?php
        $complaintsDir = 'complaints';
        $files = glob($complaintsDir . '/help_request_*.txt');
        
        if (empty($files)) {
            echo '<div class="no-requests">No help requests found.</div>';
        } else {
            // Sort files by modification time (newest first)
            usort($files, function($a, $b) {
                return filemtime($b) - filemtime($a);
            });
            
            echo '<div class="stats">';
            echo '<strong>Total Help Requests:</strong> ' . count($files);
            echo ' | <strong>Latest:</strong> ' . date('Y-m-d H:i:s', filemtime($files[0]));
            echo '</div>';
            
            foreach ($files as $file) {
                $content = file_get_contents($file);
                
                // Parse the file content
                preg_match('/Submission Date: (.+)/', $content, $dateMatch);
                preg_match('/User Email: (.+)/', $content, $emailMatch);
                preg_match('/--- USER MESSAGE ---\s*(.+?)\s*--- END OF MESSAGE ---/s', $content, $messageMatch);
                
                $date = $dateMatch[1] ?? 'Unknown';
                $email = $emailMatch[1] ?? 'Unknown';
                $message = $messageMatch[1] ?? 'No message found';
                $filename = basename($file);
                
                echo '<div class="request-item">';
                echo '<div class="request-header">';
                echo '<span class="email">' . htmlspecialchars($email) . '</span>';
                echo '<span class="timestamp">' . htmlspecialchars($date) . '</span>';
                echo '</div>';
                echo '<div class="filename">File: ' . htmlspecialchars($filename) . '</div>';
                echo '<div class="message">' . nl2br(htmlspecialchars(trim($message))) . '</div>';
                echo '</div>';
            }
        }
        ?>
        
        <div style="margin-top: 30px; text-align: center;">
            <a href="Index.html" class="btn btn-primary">
                <i class="fas fa-arrow-left" style="margin-right: 8px;"></i>Back to Save Life
            </a>
        </div>
    </div>
</body>
</html>
