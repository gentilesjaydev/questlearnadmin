<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../secrets.php';

if (!function_exists('curl_init')) {
    echo json_encode(['error' => 'PHP cURL extension is not enabled in your web server. Please enable extension=curl in php.ini.']);
    exit;
}

$cloudName = CLOUDINARY_CLOUD_NAME;
$apiKey = CLOUDINARY_API_KEY;
$apiSecret = CLOUDINARY_API_SECRET;

$url = "https://api.cloudinary.com/v1_1/{$cloudName}/resources/search";
$payload = json_encode([
    'expression' => 'resource_type:image OR resource_type:raw',
    'max_results' => 100,
    'sort_by' => [['created_at' => 'desc']],
    'with_field' => ['context', 'tags', 'metadata']
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_USERPWD, $apiKey . ':' . $apiSecret);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$searchData = json_decode($result, true);

if ($httpCode === 200 && isset($searchData['resources']) && count($searchData['resources']) > 0) {
    echo $result;
    exit;
}

// Fallback: Query both /resources/image and /resources/raw
function fetchCloudinaryResourceType($cloudName, $apiKey, $apiSecret, $type) {
    $url = "https://api.cloudinary.com/v1_1/{$cloudName}/resources/{$type}?max_results=100";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERPWD, $apiKey . ':' . $apiSecret);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $res = curl_exec($ch);
    curl_close($ch);
    $json = json_decode($res, true);
    return (isset($json['resources']) && is_array($json['resources'])) ? $json['resources'] : [];
}

$imageResources = fetchCloudinaryResourceType($cloudName, $apiKey, $apiSecret, 'image');
$rawResources = fetchCloudinaryResourceType($cloudName, $apiKey, $apiSecret, 'raw');

$all = array_merge($imageResources, $rawResources);
echo json_encode(['resources' => $all]);
?>
