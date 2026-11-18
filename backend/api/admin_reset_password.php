<?php
header('Content-Type: application/json');
require_once __DIR__ . '/firebase_admin.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$newPassword = $input['password'] ?? 'teacher123';

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email address is required.']);
    exit;
}

try {
    $result = setFirebaseUserPassword($email, $newPassword);
    echo json_encode([
        'success' => true,
        'message' => "Password for {$email} has been reset to {$newPassword} in Firebase Authentication.",
        'details' => $result
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
