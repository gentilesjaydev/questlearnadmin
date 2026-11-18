<?php
/**
 * Firebase Admin Helper via Google Cloud OAuth2 & Identity Toolkit REST API
 * Pure PHP - No Node.js or composer dependencies required. Works on XAMPP and InfinityFree!
 */

function getFirebaseAdminAccessToken() {
    $keyPath = __DIR__ . '/../config/serviceAccountKey.json';
    if (!file_exists($keyPath)) {
        throw new Exception("serviceAccountKey.json not found in backend/config/");
    }

    $keyData = json_decode(file_get_contents($keyPath), true);
    if (!$keyData || empty($keyData['private_key']) || empty($keyData['client_email'])) {
        throw new Exception("Invalid serviceAccountKey.json format.");
    }

    $now = time();
    $header = ['alg' => 'RS256', 'typ' => 'JWT'];
    $claims = [
        'iss'   => $keyData['client_email'],
        'sub'   => $keyData['client_email'],
        'aud'   => 'https://oauth2.googleapis.com/token',
        'iat'   => $now,
        'exp'   => $now + 3600,
        'scope' => 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/firebase'
    ];

    $b64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($header)));
    $b64Claims = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($claims)));
    $sigInput  = $b64Header . '.' . $b64Claims;

    $privateKey = openssl_pkey_get_private($keyData['private_key']);
    if (!$privateKey) {
        throw new Exception("Failed to load private key from serviceAccountKey.json");
    }

    $signature = '';
    if (!openssl_sign($sigInput, $signature, $privateKey, OPENSSL_ALGO_SHA256)) {
        throw new Exception("OpenSSL signing failed.");
    }
    $b64Sig = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    $jwt = $sigInput . '.' . $b64Sig;

    // Exchange JWT for Access Token
    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt
        ]),
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
        CURLOPT_TIMEOUT => 15
    ]);
    $res = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) throw new Exception("OAuth2 token request failed: " . $err);
    $resData = json_decode($res, true);
    if (empty($resData['access_token'])) {
        throw new Exception("Failed to obtain OAuth2 token: " . ($resData['error_description'] ?? $res));
    }

    return [
        'token' => $resData['access_token'],
        'project_id' => $keyData['project_id']
    ];
}

/**
 * Directly updates a user's password in Firebase Authentication by email
 */
function setFirebaseUserPassword($email, $newPassword) {
    $auth = getFirebaseAdminAccessToken();
    $token = $auth['token'];
    $projectId = $auth['project_id'];

    // 1. Lookup User by Email to get UID
    $lookupUrl = "https://identitytoolkit.googleapis.com/v1/projects/{$projectId}/accounts:lookup";
    $ch = curl_init($lookupUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$token}",
            "Content-Type: application/json"
        ],
        CURLOPT_POSTFIELDS => json_encode(['email' => [$email]]),
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
        CURLOPT_TIMEOUT => 15
    ]);
    $lookupRes = curl_exec($ch);
    curl_close($ch);

    $lookupData = json_decode($lookupRes, true);
    if (empty($lookupData['users'][0]['localId'])) {
        // If user doesn't exist in Auth, create them!
        $createUrl = "https://identitytoolkit.googleapis.com/v1/projects/{$projectId}/accounts";
        $ch = curl_init($createUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer {$token}",
                "Content-Type: application/json"
            ],
            CURLOPT_POSTFIELDS => json_encode([
                'email' => $email,
                'password' => $newPassword,
                'returnSecureToken' => false
            ]),
            CURLOPT_TIMEOUT => 15
        ]);
        $createRes = curl_exec($ch);
        curl_close($ch);
        $createData = json_decode($createRes, true);
        if (!empty($createData['error'])) {
            throw new Exception("Create user failed: " . ($createData['error']['message'] ?? json_encode($createData)));
        }
        return [
            'success' => true,
            'action'  => 'created',
            'uid'     => $createData['localId'] ?? 'new_user',
            'email'   => $email
        ];
    }

    $uid = $lookupData['users'][0]['localId'];

    // 2. Update password for UID
    $updateUrl = "https://identitytoolkit.googleapis.com/v1/projects/{$projectId}/accounts:update";
    $ch = curl_init($updateUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$token}",
            "Content-Type: application/json"
        ],
        CURLOPT_POSTFIELDS => json_encode([
            'localId'  => $uid,
            'password' => $newPassword
        ]),
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
        CURLOPT_TIMEOUT => 15
    ]);
    $updateRes = curl_exec($ch);
    curl_close($ch);

    $updateData = json_decode($updateRes, true);
    if (!empty($updateData['error'])) {
        throw new Exception("Update password failed: " . ($updateData['error']['message'] ?? json_encode($updateData)));
    }

    return [
        'success' => true,
        'action'  => 'updated',
        'uid'     => $uid,
        'email'   => $email
    ];
}
