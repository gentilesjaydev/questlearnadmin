<?php
header('Content-Type: application/json');
require_once '../../secrets.php';

$cloudName = CLOUDINARY_CLOUD_NAME;
$apiKey = CLOUDINARY_API_KEY;
$apiSecret = CLOUDINARY_API_SECRET;

$url = "https://api.cloudinary.com/v1_1/{$cloudName}/resources/search";
$payload = json_encode([
    'expression' => 'format:pdf', // Fetch all PDFs across any resource type
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

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo json_encode(['error' => curl_error($ch)]);
} else {
    if ($httpCode >= 400) {
        // If the Search API fails, fallback to standard resources list (images only as fallback)
        curl_close($ch);
        
        $fallbackUrl = "https://api.cloudinary.com/v1_1/{$cloudName}/resources/image?max_results=100";
        $ch2 = curl_init();
        curl_setopt($ch2, CURLOPT_URL, $fallbackUrl);
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch2, CURLOPT_USERPWD, $apiKey . ':' . $apiSecret);
        $result2 = curl_exec($ch2);
        
        if (curl_errno($ch2)) {
            echo json_encode(['error' => curl_error($ch2)]);
        } else {
            // Need to filter fallback results to PDFs manually just in case
            $data = json_decode($result2, true);
            if(isset($data['resources'])) {
                $filtered = array_filter($data['resources'], function($item) {
                    return isset($item['format']) && $item['format'] === 'pdf';
                });
                $data['resources'] = array_values($filtered);
                echo json_encode($data);
            } else {
                echo $result2;
            }
        }
        curl_close($ch2);
    } else {
        echo $result;
        curl_close($ch);
    }
}
?>
