<?php
header('Content-Type: application/json');
require_once '../../secrets.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$public_ids = [];

if (isset($input['public_ids']) && is_array($input['public_ids'])) {
    $public_ids = $input['public_ids'];
} else if (isset($input['public_id'])) {
    $public_ids = [$input['public_id']];
}

$resource_type = $input['resource_type'] ?? 'image'; // defaults to image since legacy files were uploaded as images

if (empty($public_ids)) {
    http_response_code(400);
    echo json_encode(['error' => 'public_id or public_ids array is required']);
    exit;
}

$cloudName = CLOUDINARY_CLOUD_NAME;
$apiKey = CLOUDINARY_API_KEY;
$apiSecret = CLOUDINARY_API_SECRET;

// Cloudinary Admin API endpoint for deleting resources
$url = "https://api.cloudinary.com/v1_1/{$cloudName}/resources/{$resource_type}/upload";

$payload = json_encode([
    'public_ids' => $public_ids
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_USERPWD, $apiKey . ':' . $apiSecret);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 400) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete from Cloudinary', 'details' => json_decode($result)]);
} else {
    echo json_encode(['success' => true, 'result' => json_decode($result)]);
}
?>
