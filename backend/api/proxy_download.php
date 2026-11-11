<?php
/**
 * proxy_download.php
 * Streams a Cloudinary file through the server so the browser
 * receives it as a forced Content-Disposition: attachment download
 * from the same origin — works on both localhost and production hosting.
 *
 * Usage: GET backend/api/proxy_download.php?url=<url>&filename=<name>
 */

require_once __DIR__ . '/../../secrets.php';

// ── Security: only allow Cloudinary URLs ─────────────────────────────────────
$allowedHosts = ['res.cloudinary.com'];

$rawUrl = isset($_GET['url']) ? trim($_GET['url']) : '';

if (empty($rawUrl)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'missing_param', 'message' => 'Missing url parameter.']);
    exit;
}

$parsed = parse_url($rawUrl);
$host   = $parsed['host'] ?? '';

if (!in_array($host, $allowedHosts, true)) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'forbidden', 'message' => 'Only Cloudinary URLs are allowed.']);
    exit;
}

// ── Sanitise filename ─────────────────────────────────────────────────────────
$filename = isset($_GET['filename']) ? trim($_GET['filename']) : '';
if (empty($filename)) {
    $filename = basename($parsed['path'] ?? 'module.pdf');
}
$filename = preg_replace('/[^a-zA-Z0-9\-_\. ]/', '_', $filename);
if (empty($filename)) $filename = 'module.pdf';

// ── Strip any fl_attachment transformation from URL ───────────────────────────
$fetchUrl = preg_replace('#/fl_attachment:[^/]*/|/fl_attachment/#', '/upload/', $rawUrl);
$fetchUrl = preg_replace('#/upload/upload/#', '/upload/', $fetchUrl);

// ── Helper to fetch remote content ────────────────────────────────────────────
function fetchUrlContent($url) {
    if (!function_exists('curl_init')) return null;
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 5,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_USERAGENT      => 'QuestLearnAdmin/1.0',
        CURLOPT_SSL_VERIFYPEER => false, // Bypasses local XAMPP CA cert issues on Windows
        CURLOPT_SSL_VERIFYHOST => 0,
        CURLOPT_ENCODING       => '',
    ]);
    $body = curl_exec($ch);
    $info = curl_getinfo($ch);
    $err  = curl_error($ch);
    curl_close($ch);
    
    return [
        'code'        => (int)($info['http_code'] ?? 0),
        'contentType' => $info['content_type'] ?? '',
        'body'        => $body,
        'error'       => $err
    ];
}

// ── 1. Primary Attempt ────────────────────────────────────────────────────────
$res = fetchUrlContent($fetchUrl);

// ── 2. Fallback Candidates if 404 (handles raw vs image, docx vs pdf) ─────────
$publicId = '';
if (!$res || $res['code'] !== 200) {
    $path = $parsed['path'] ?? '';
    
    if (preg_match('#/(image|raw|video)/upload/(?:(v\d+)/)?([^/]+)$#', $path, $m)) {
        $currentType     = $m[1];
        $version         = $m[2] ?? '';
        $filenameWithExt = $m[3];
        $publicId        = preg_replace('/\.[^.]+$/', '', $filenameWithExt);
        $vPrefix         = $version ? "{$version}/" : '';
        $cloud           = defined('CLOUDINARY_CLOUD_NAME') ? CLOUDINARY_CLOUD_NAME : 'dghen22jr';
        
        $candidates = [];
        
        // Check other resource types (raw vs image)
        $otherTypes = ($currentType === 'image') ? ['raw'] : ['image'];
        foreach ($otherTypes as $ot) {
            $candidates[] = "https://res.cloudinary.com/{$cloud}/{$ot}/upload/{$vPrefix}{$publicId}.docx";
            $candidates[] = "https://res.cloudinary.com/{$cloud}/{$ot}/upload/{$vPrefix}{$publicId}.pdf";
            $candidates[] = "https://res.cloudinary.com/{$cloud}/{$ot}/upload/{$vPrefix}{$publicId}";
            $candidates[] = "https://res.cloudinary.com/{$cloud}/{$ot}/upload/{$publicId}.docx";
            $candidates[] = "https://res.cloudinary.com/{$cloud}/{$ot}/upload/{$publicId}.pdf";
            $candidates[] = "https://res.cloudinary.com/{$cloud}/{$ot}/upload/{$publicId}";
        }
        
        // Check current resource type with alternate extensions
        $candidates[] = "https://res.cloudinary.com/{$cloud}/{$currentType}/upload/{$vPrefix}{$publicId}.docx";
        $candidates[] = "https://res.cloudinary.com/{$cloud}/{$currentType}/upload/{$vPrefix}{$publicId}.pdf";
        $candidates[] = "https://res.cloudinary.com/{$cloud}/{$currentType}/upload/{$vPrefix}{$publicId}";
        $candidates[] = "https://res.cloudinary.com/{$cloud}/{$currentType}/upload/{$publicId}.docx";
        $candidates[] = "https://res.cloudinary.com/{$cloud}/{$currentType}/upload/{$publicId}.pdf";
        $candidates[] = "https://res.cloudinary.com/{$cloud}/{$currentType}/upload/{$publicId}";

        foreach ($candidates as $candUrl) {
            if ($candUrl === $fetchUrl) continue;
            $candRes = fetchUrlContent($candUrl);
            if ($candRes && $candRes['code'] === 200 && !empty($candRes['body'])) {
                $res = $candRes;
                break;
            }
        }
    }
}

// ── 3. Cloudinary Admin API Lookup if still 404 ───────────────────────────────
if ((!$res || $res['code'] !== 200) && defined('CLOUDINARY_API_KEY') && defined('CLOUDINARY_API_SECRET')) {
    if (!empty($publicId)) {
        foreach (['raw', 'image'] as $resType) {
            $apiEndpoint = "https://api.cloudinary.com/v1_1/" . CLOUDINARY_CLOUD_NAME . "/resources/{$resType}/upload/{$publicId}";
            $apiCh = curl_init($apiEndpoint);
            curl_setopt_array($apiCh, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_USERPWD        => CLOUDINARY_API_KEY . ':' . CLOUDINARY_API_SECRET,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_TIMEOUT        => 8
            ]);
            $apiOut    = curl_exec($apiCh);
            $apiStatus = curl_getinfo($apiCh, CURLINFO_HTTP_CODE);
            curl_close($apiCh);

            if ($apiStatus === 200) {
                $apiJson = json_decode($apiOut, true);
                if (!empty($apiJson['secure_url'])) {
                    $foundUrl = $apiJson['secure_url'];
                    $candRes  = fetchUrlContent($foundUrl);
                    if ($candRes && $candRes['code'] === 200 && !empty($candRes['body'])) {
                        $res = $candRes;
                        break;
                    }
                }
            }
        }
    }
}

// ── 4. If completely unavailable ──────────────────────────────────────────────
if (!$res || $res['code'] !== 200 || empty($res['body'])) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode([
        'error'   => 'not_found',
        'message' => 'This module file is no longer available on cloud storage. It may have been deleted or expired.'
    ]);
    exit;
}

// ── 5. Determine Content Type ─────────────────────────────────────────────────
$ct = $res['contentType'] ?? '';
$ct = explode(';', $ct)[0];
$ct = trim($ct);

if (empty($ct) || $ct === 'application/octet-stream') {
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $mimeMap = [
        'pdf'  => 'application/pdf',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc'  => 'application/msword',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
    ];
    $ct = $mimeMap[$ext] ?? 'application/octet-stream';
}

// ── 6. Stream Response as Attachment ──────────────────────────────────────────
while (ob_get_level()) ob_end_clean();

header('Content-Type: '        . $ct);
header('Content-Disposition: attachment; filename="' . str_replace('"', '\\"', $filename) . '"');
header('Content-Length: '      . strlen($res['body']));
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');

echo $res['body'];
exit;
