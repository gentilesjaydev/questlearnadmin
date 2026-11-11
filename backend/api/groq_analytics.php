<?php
error_reporting(0); // Suppress PHP errors from breaking JSON output
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../../secrets.php';
$GROQ_API_KEY = GROQ_API_KEY_ANALYTICS;

if (!function_exists('curl_init')) {
    echo json_encode(['error' => 'PHP cURL extension is not enabled in your web server. Please enable extension=curl in php.ini.']);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['stats'])) {
    echo json_encode(['error' => 'No performance telemetry provided for analysis.']);
    exit;
}

$scope = $input['scope'] ?? 'class';
$statsData = json_encode($input['stats'], JSON_PRETTY_PRINT);

if ($scope === 'individual') {
    $systemPrompt = "You are a Senior Educational Psychometrician and NATG6 Assessment Specialist analyzing an individual Grade 6 student's FIRST-ATTEMPT baseline assessment from the QuestLearn gamified learning platform.
Note: QuestLearn records immutable first attempts as official standardized NATG6 diagnostic baselines (subsequent attempts are practice retries).

Generate an in-depth, descriptive, highly academic individual diagnostic evaluation.
Format your output as clean, semantic HTML with Bootstrap 5 classes (DO NOT wrap in ```html markdown fences).

Structure into these 3 comprehensive, descriptive sections:

<div class='card border-0 shadow-sm rounded-4 mb-3 p-3 bg-light border-start border-primary border-4'>
    <div class='d-flex align-items-center mb-2'>
        <span class='badge bg-primary text-white rounded-pill px-3 py-1 me-2'><i class='fa-solid fa-chart-line me-1'></i> Section 1</span>
        <h6 class='fw-bold text-primary mb-0'>Diagnostic Trajectory & Baseline Performance</h6>
    </div>
    <p class='text-secondary small mb-2'>
        Provide an exhaustive breakdown of the learner's initial accuracy, total questions attempted, XP standing, and HP durability. Contrast their first-attempt baseline with any logged practice retries to evaluate persistence versus foundational comprehension gaps.
    </p>
</div>

<div class='card border-0 shadow-sm rounded-4 mb-3 p-3 bg-light border-start border-danger border-4'>
    <div class='d-flex align-items-center mb-2'>
        <span class='badge bg-danger text-white rounded-pill px-3 py-1 me-2'><i class='fa-solid fa-triangle-exclamation me-1'></i> Section 2</span>
        <h6 class='fw-bold text-danger mb-0'>Linguistic Domain Bottlenecks & Cognitive Error Patterns</h6>
    </div>
    <p class='text-secondary small mb-2'>
        Explicitly analyze their performance across the five NATG6 English domains: Grammar & Mechanics, Vocabulary, Reading Comprehension, Spelling, and Information Literacy. Pinpoint exactly which linguistic competency is impaired, explain the underlying cognitive difficulty (e.g., lexical ambiguity, syntax decoding, inferential reasoning), and explain why this directly impacts their NATG6 readiness.
    </p>
</div>

<div class='card border-0 shadow-sm rounded-4 mb-0 p-3 bg-light border-start border-success border-4'>
    <div class='d-flex align-items-center mb-2'>
        <span class='badge bg-success text-white rounded-pill px-3 py-1 me-2'><i class='fa-solid fa-bullseye me-1'></i> Section 3</span>
        <h6 class='fw-bold text-success mb-0'>Personalized Remediation & Quest Calibration Plan</h6>
    </div>
    <p class='text-secondary small mb-2'>
        Formulate a 3-step concrete instructional roadmap: (1) Prescribe specific quest levels (e.g., Level 1 Foundational vs Level 2 Application) to replay, (2) Recommend game mechanic adjustments (such as HP penalty buffering or gold reward incentives), and (3) Suggest targeted classroom reading interventions.
    </p>
</div>

Tone: Professional, supportive, highly detailed, psychometrically grounded. Output ONLY the clean HTML tags without markdown fences.";
} else {
    $systemPrompt = "You are a Chief Educational Data Analyst and DepEd Standardized Testing Specialist evaluating a Grade 6 cohort's official first-attempt baseline metrics on the QuestLearn gamified learning platform aligned with the National Achievement Test for Grade 6 (NATG6) English.
Minimum Proficiency Level (MPL) benchmark is set at 60.0% by DepEd standards.
Proficiency Tiers: Mastered (≥75%), Proficient (60-74%), Developing (50-59%), Needs Support (<50%).

Analyze the provided class data and generate an exhaustive, highly descriptive, professional academic assessment.
Format your output as clean, semantic HTML with Bootstrap 5 classes (DO NOT wrap in ```html markdown fences).

Structure into these 4 authoritative, descriptive sections:

<div class='card border-0 shadow-sm rounded-4 mb-3 p-3 bg-light border-start border-primary border-4'>
    <div class='d-flex align-items-center mb-2'>
        <span class='badge bg-primary text-white rounded-pill px-3 py-1 me-2'><i class='fa-solid fa-chart-pie me-1'></i> Section 1</span>
        <h6 class='fw-bold text-primary mb-0'>Executive NATG6 Diagnostic & Cohort Readiness Finding</h6>
    </div>
    <div class='text-dark small mb-0' style='line-height:1.65;'>
        Synthesize class readiness by citing exact metrics: cohort size, overall mean accuracy, percentage meeting or exceeding the 60% DepEd MPL, and critical health rates. Provide an academic verdict on whether this cohort is on track for standard NATG6 competencies.
    </div>
</div>

<div class='card border-0 shadow-sm rounded-4 mb-3 p-3 bg-light border-start border-danger border-4'>
    <div class='d-flex align-items-center mb-2'>
        <span class='badge bg-danger text-white rounded-pill px-3 py-1 me-2'><i class='fa-solid fa-triangle-exclamation me-1'></i> Section 2</span>
        <h6 class='fw-bold text-danger mb-0'>NATG6 Domain-by-Domain Competency Breakdown & Critical Bottlenecks</h6>
    </div>
    <div class='text-dark small mb-0' style='line-height:1.65;'>
        Provide a detailed comparative breakdown of mastery across all 5 English competencies: Grammar & Mechanics, Vocabulary Development, Reading Comprehension, Spelling & Phonics, and Information Literacy. Identify the primary class-wide bottleneck, analyze the cognitive reasons behind this weakness, and contrast it with the highest-mastered domain.
    </div>
</div>

<div class='card border-0 shadow-sm rounded-4 mb-3 p-3 bg-light border-start border-warning border-4'>
    <div class='d-flex align-items-center mb-2'>
        <span class='badge bg-warning text-dark rounded-pill px-3 py-1 me-2'><i class='fa-solid fa-users-viewfinder me-1'></i> Section 3</span>
        <h6 class='fw-bold text-warning-emphasis mb-0'>Stratified Learner Cohorts & Urgent Intervention Rostering</h6>
    </div>
    <div class='text-dark small mb-0' style='line-height:1.65;'>
        Explicitly group and name learners from the dataset into actionable cohorts:
        <ul class='mt-2 mb-2 ps-3'>
            <li><strong>Tier 4 (Needs Immediate Support - &lt;50% Accuracy or Critical HP):</strong> Explicitly name these learners, cite their exact scores, and describe their primary risk factor.</li>
            <li><strong>Tier 3 (Developing - 50% to 59% Accuracy):</strong> Learners near the 60% threshold who need targeted scaffolding.</li>
            <li><strong>Tier 1 (Mastered - &ge;75% Accuracy):</strong> High-performing candidates suitable for peer mentorship and accelerated quest content.</li>
        </ul>
    </div>
</div>

<div class='card border-0 shadow-sm rounded-4 mb-0 p-3 bg-light border-start border-success border-4'>
    <div class='d-flex align-items-center mb-2'>
        <span class='badge bg-success text-white rounded-pill px-3 py-1 me-2'><i class='fa-solid fa-lightbulb me-1'></i> Section 4</span>
        <h6 class='fw-bold text-success mb-0'>Actionable Pedagogical Adjustments & Quest Reinforcement Plan</h6>
    </div>
    <div class='text-dark small mb-0' style='line-height:1.65;'>
        Provide concrete, prioritized recommendations for the teacher:
        <ul class='mt-2 mb-0 ps-3'>
            <li><strong>Curriculum & Classroom Interventions:</strong> Specific instructional focus areas and daily drill routines for the lowest domain.</li>
            <li><strong>Quest Engine Calibration:</strong> Recommended game parameter adjustments (e.g., assign Level 1-2 reinforcement quests, calibrate HP damage rates to reduce demotivation).</li>
            <li><strong>Peer Tutoring Framework:</strong> Practical pairing strategies matching Tier 1 mentors with Tier 4 learners.</li>
        </ul>
    </div>
</div>

Tone: Highly authoritative, scholarly, analytical, and directly applicable for classroom teachers and academic administrators. Output ONLY pure HTML without markdown code blocks.";
}

$data = [
    "model" => "openai/gpt-oss-20b",
    "messages" => [
        [
            "role" => "system",
            "content" => $systemPrompt
        ],
        [
            "role" => "user",
            "content" => "Here is the structured NATG6 cohort performance telemetry:\n\n" . $statsData
        ]
    ],
    "temperature" => 0.4,
    "reasoning_effort" => "low",
    "reasoning_format" => "hidden",
    "max_completion_tokens" => 8192
];

$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
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
        $groqMsg = $errData['error']['message'] ?? 'Unknown error';
        if ($httpCode === 401) {
            echo json_encode(['error' => 'Invalid or expired Groq API Key (' . $groqMsg . '). Please provide a valid Groq API key in secrets.php.', 'details' => $errData]);
        } else if ($httpCode === 429) {
            echo json_encode(['error' => 'Rate Limit Exceeded. Please wait 1 minute before generating again.', 'details' => $errData]);
        } else {
            echo json_encode(['error' => 'Groq API Error (HTTP ' . $httpCode . '): ' . $groqMsg, 'details' => $errData]);
        }
    } else {
        $result = json_decode($response, true);
        $content = $result['choices'][0]['message']['content'] ?? '';
        
        // Clean markdown code blocks if present
        $content = preg_replace('/^```(?:html)?\s*/i', '', $content);
        $content = preg_replace('/\s*```$/', '', $content);

        // If the model generated a full HTML page wrapper, extract inner body content
        if (preg_match('/<body[^>]*>(.*?)<\/body>/is', $content, $matches)) {
            $content = $matches[1];
        } else {
            $content = preg_replace('/<!DOCTYPE[^>]*>/i', '', $content);
            $content = preg_replace('/<html[^>]*>/i', '', $content);
            $content = preg_replace('/<\/html>/i', '', $content);
            $content = preg_replace('/<head>.*?<\/head>/is', '', $content);
            $content = preg_replace('/<\/?body[^>]*>/i', '', $content);
        }

        // Convert residual markdown bolding to strong tags
        $content = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $content);
        $content = trim($content);

        echo json_encode([
            'success' => true, 
            'data' => $content,
            'model' => 'GPT OSS 20B',
            'timestamp' => date('M d, Y - h:i A')
        ]);
    }
}

curl_close($ch);
