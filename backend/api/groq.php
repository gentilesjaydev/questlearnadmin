<?php
error_reporting(0); // Suppress PHP errors from breaking JSON output
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../../secrets.php';
$GROQ_API_KEY = GROQ_API_KEY_MAIN;

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['text'])) {
    echo json_encode(['error' => 'No text provided']);
    exit;
}

$moduleText = $input['text'];
$category = $input['category'] ?? 'grammar'; // e.g., grammar, reading, boss_battle

$systemPrompt = "You are an expert game designer and educator. You will read the provided educational module text and generate RPG-style quiz questions.
You must output ONLY a valid JSON object. NO markdown formatting, NO conversational text.

The JSON MUST strictly follow this exact structure:
{
  \"questions\": [
    {
      \"id\": \"generated_id_1\",
      \"question\": \"What is the main topic of the module?\",
      \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],
      \"correctOption\": 0,
      \"type\": \"multiple_choice\",
      \"level\": 1,
      \"xpReward\": 10,
      \"goldReward\": 5
    }
  ]
}

INSTRUCTIONS:
1. Generate exactly 5 questions for Level 1, 5 for Level 2, 3 for Level 3, and 2 for Level 4 based on the text below.
2. Level 1: Basic definitions/recall.
3. Level 2: Application.
4. Level 3: Analysis.
5. Level 4 (Boss): Complex problem solving.
6. The output MUST be a JSON object containing a 'questions' array.";

$data = [
    "model" => "llama-3.1-8b-instant",
    "messages" => [
        [
            "role" => "system",
            "content" => $systemPrompt
        ],
        [
            "role" => "user",
            "content" => "Here is the module text. Generate the questions in pure JSON format:\n\n" . substr($moduleText, 0, 15000)
        ]
    ],
    "temperature" => 0.2,
    "response_format" => ["type" => "json_object"]
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

file_put_contents('debug.txt', "HTTP CODE: $httpCode\nRESPONSE: $response\n"); // Log it for debugging

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
        
        // Ensure we parse the string content as JSON
        $jsonOutput = json_decode($content, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo json_encode(['success' => true, 'data' => $jsonOutput]);
        } else {
            echo json_encode(['error' => 'Failed to parse AI output as JSON', 'raw' => $content]);
        }
    }
}

curl_close($ch);
?>
