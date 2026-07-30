<?php
if (!isset($_GET['url'])) {
    die("No URL provided");
}

$url = $_GET['url'];

// Basic validation to ensure it's a cloudinary URL
if (strpos($url, 'cloudinary.com') === false) {
    die("Invalid URL");
}

require_once __DIR__ . '/../../secrets.php';

$apiKey = CLOUDINARY_API_KEY;
$apiSecret = CLOUDINARY_API_SECRET;

// Fetch the file from Cloudinary
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Referer: https://console.cloudinary.com/',
    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
]);

$data = curl_exec($ch);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 400 || !$data) {
    die("Failed to fetch PDF from Cloudinary. HTTP Code: " . $httpCode . " | Response: " . htmlspecialchars(strip_tags($data)));
}

// Force the correct headers for PDF viewing
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="module.pdf"');
header('Cache-Control: public, max-age=3600');
header('Content-Length: ' . strlen($data));

echo $data;
exit;
?>
