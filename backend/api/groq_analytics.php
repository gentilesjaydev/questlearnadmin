<?php
error_reporting(0); // Suppress PHP errors from breaking JSON output
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// New API Key for Analytics
require_once __DIR__ . '/../../secrets.php';
$GROQ_API_KEY = GROQ_API_KEY_ANALYTICS;

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['stats'])) {
    echo json_encode(['error' => 'No stats provided']);
    exit;
}

$statsData = json_encode($input['stats']);
$scope = $input['scope'] ?? 'class';

if ($scope === 'individual') {
    $systemPrompt = "You are an expert educational data analyst and game designer. You will analyze the provided OFFICIAL FIRST-ATTEMPT performance statistics for a SINGLE student from an RPG gamified learning platform.
Note: The official record represents the student's IMMUTABLE FIRST ATTEMPT (initial baseline performance before retries). Based on this data (HP, XP, First-Attempt Accuracy, Level, Correct/Wrong counts, Category Breakdown, Primary Struggle Category, and Practice Retry Count), provide actionable diagnostic insights, explicitly identify the subject categories (Grammar, Vocabulary, Reading, Spelling, Information Literacy) where the student initially struggled, and suggest targeted learning interventions or quest assignments.
Output MUST be formatted as a professional HTML string snippet (using <ul>, <li>, <strong>, <p>, etc.) that can be directly injected into a dashboard. Keep it concise but insightful. Do NOT wrap it in ```html markdown block. Just pure HTML.";
} else {
    $systemPrompt = "You are an expert educational data analyst and game designer. You will analyze the provided OFFICIAL FIRST-ATTEMPT student performance statistics from an RPG gamified learning platform.
Note: The official statistics represent the students' IMMUTABLE FIRST ATTEMPTS (initial baseline performance before retries). Based on this data (including first-attempt category breakdowns, initial category struggles, and class-wide baseline averages), provide actionable diagnostic insights, identify struggling students, highlight top performers, evaluate initial class-wide category bottlenecks (Grammar, Vocabulary, Reading, Spelling, Information Literacy), and suggest specific curriculum adjustments or game design tweaks.
Output MUST be formatted as a professional HTML string snippet (using <ul>, <li>, <strong>, <p>, etc.) that can be directly injected into a dashboard. Do NOT wrap it in ```html markdown block. Just pure HTML.";
}

$data = [
    "model" => "llama-3.1-8b-instant",
    "messages" => [
        [
            "role" => "system",
            "content" => $systemPrompt
        ],
        [
            "role" => "user",
            "content" => "Here is the raw performance data in JSON format:\n\n" . substr($statsData, 0, 15000)
        ]
    ],
    "temperature" => 0.5
];

$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $GROQ_API_KEY,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo json_encode(['error' => curl_error($ch)]);
} else {
    if ($httpCode !== 200) {
        $errData = json_decode($response, true);
        if ($httpCode === 429) {
            echo json_encode(['error' => 'Rate Limit Exceeded. Please wait 1 minute before generating again.', 'details' => $errData]);
        } else {
            echo json_encode(['error' => 'API Error', 'details' => $errData]);
        }
    } else {
        $result = json_decode($response, true);
        $content = $result['choices'][0]['message']['content'];
        echo json_encode(['success' => true, 'data' => $content]);
    }
}

curl_close($ch);
