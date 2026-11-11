<?php 
$base = '../../'; 
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learning Pattern Analysis – Methodology - QuestLearn</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="icon" type="image/png" href="<?php echo $base; ?>assets/images/logo.png">
    <link rel="stylesheet" href="<?php echo $base; ?>assets/css/style.css?v=<?php echo time(); ?>">
    <style>
        .methodology-step-card {
            border-radius: 16px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            background: #ffffff;
        }
        .methodology-step-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
        }
        .flow-node {
            background: #ffffff;
            border: 2px solid #A594F9;
            border-radius: 14px;
            padding: 18px 22px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(165, 148, 249, 0.15);
            min-height: 110px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
        }
        .flow-arrow-down {
            color: #A594F9;
            font-size: 1.6rem;
            text-align: center;
            padding: 8px 0;
        }
        .flow-step-num {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            background: #A594F9;
            color: #ffffff;
            border-radius: 50%;
            font-size: 0.82rem;
            font-weight: 700;
            margin-bottom: 6px;
        }
        .mpl-pill-mastered { background: rgba(34, 197, 94, 0.12); color: #166534; border: 1px solid rgba(34, 197, 94, 0.3); }
        .mpl-pill-proficient { background: rgba(59, 130, 246, 0.12); color: #1e40af; border: 1px solid rgba(59, 130, 246, 0.3); }
        .mpl-pill-developing { background: rgba(245, 158, 11, 0.12); color: #92400e; border: 1px solid rgba(245, 158, 11, 0.3); }
        .mpl-pill-needs-support { background: rgba(239, 68, 68, 0.12); color: #991b1b; border: 1px solid rgba(239, 68, 68, 0.3); }
    </style>
</head>
<body>
    <div class="d-flex">
        <?php include $base . 'includes/components/sidebar.php'; ?>
        <div id="content">
            <?php include $base . 'includes/components/navbar.php'; ?>

            <div class="container-fluid p-4 p-md-5">
                <!-- Page Header -->
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 rounded-pill small fw-bold">
                                <i class="fa-solid fa-graduation-cap me-1"></i> Technical Documentation
                            </span>
                            <span class="text-muted small">&bull; Performance Analytics Subsystem</span>
                        </div>
                        <h2 class="fw-bolder mb-1" style="color: var(--text-main); letter-spacing: -1px; font-size: 2.1rem;">
                            Learning Pattern Analysis – Methodology
                        </h2>
                        <p class="text-muted mb-0" style="font-size: 1.02rem;">
                            Formal technical explanation of QuestLearn's assessment processing, classification standards, and diagnostic analytics pipeline.
                        </p>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                        <a href="<?php echo $base; ?>pages/teacher/performance" class="btn btn-outline-primary px-3 py-2 rounded-pill shadow-sm fw-bold bg-white">
                            <i class="fa-solid fa-chart-pie me-1.5"></i> Back to Performance Analytics
                        </a>
                        <a href="<?php echo $base; ?>pages/teacher/competency-tracking" class="btn btn-outline-secondary px-3 py-2 rounded-pill shadow-sm fw-bold bg-white text-dark">
                            <i class="fa-solid fa-award me-1.5 text-warning"></i> COMPETENCY TRACKING
                        </a>
                        <a href="<?php echo $base; ?>pages/teacher/assessment-reporting" class="btn btn-outline-secondary px-3 py-2 rounded-pill shadow-sm fw-bold bg-white text-dark">
                            <i class="fa-solid fa-file-invoice me-1.5 text-info"></i> ASSESSMENT REPORTING
                        </a>
                    </div>
                </div>

                <!-- Executive Summary Notice -->
                <div class="alert alert-light border border-primary border-opacity-25 rounded-4 shadow-sm p-3.5 mb-5 d-flex align-items-center gap-3">
                    <div class="p-2.5 rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0" style="width: 44px; height: 44px;">
                        <i class="fa-solid fa-info fa-lg"></i>
                    </div>
                    <div class="small">
                        <strong class="text-dark d-block mb-0.5">Methodology Overview: How QuestLearn Analyzes Learning Patterns</strong>
                        QuestLearn integrates DepEd National Achievement Test for Grade 6 (NATG6) standards into gamified formative and summative assessments. 
                        This document details the actual system process used to capture student responses, calculate diagnostic accuracy, classify mastery according to DepEd Minimum Proficiency Levels (MPL), and identify actionable learning patterns.
                    </div>
                </div>

                <!-- SECTION: Visual System Process Flowchart -->
                <div class="card methodology-step-card mb-5">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex align-items-center gap-2 mb-3">
                            <span class="badge bg-primary text-white rounded-circle p-2" style="width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;">
                                <i class="fa-solid fa-diagram-project"></i>
                            </span>
                            <h4 class="fw-bold mb-0 text-dark">System Process Flowchart</h4>
                        </div>
                        <p class="text-muted small mb-4">
                            The sequential data pipeline from student gameplay interaction to teacher-facing analytics dashboard:
                        </p>

                        <!-- Flowchart Nodes -->
                        <div class="row g-3 align-items-center justify-content-center">
                            <!-- Step 1 -->
                            <div class="col-12 col-md-4 col-lg-2">
                                <div class="flow-node">
                                    <span class="flow-step-num">1</span>
                                    <div class="fw-bold text-dark small mb-1">Student Interaction</div>
                                    <div class="text-muted" style="font-size: 0.75rem;">Student answers assessment questions in quest dungeons</div>
                                </div>
                            </div>
                            <div class="col-12 col-md-auto text-center d-none d-lg-block">
                                <i class="fa-solid fa-arrow-right text-primary fa-lg"></i>
                            </div>
                            <div class="col-12 d-block d-lg-none text-center">
                                <i class="fa-solid fa-arrow-down text-primary"></i>
                            </div>

                            <!-- Step 2 -->
                            <div class="col-12 col-md-4 col-lg-2">
                                <div class="flow-node">
                                    <span class="flow-step-num">2</span>
                                    <div class="fw-bold text-dark small mb-1">Baseline Recording</div>
                                    <div class="text-muted" style="font-size: 0.75rem;">System records immutable first attempts in Firebase</div>
                                </div>
                            </div>
                            <div class="col-12 col-md-auto text-center d-none d-lg-block">
                                <i class="fa-solid fa-arrow-right text-primary fa-lg"></i>
                            </div>
                            <div class="col-12 d-block d-lg-none text-center">
                                <i class="fa-solid fa-arrow-down text-primary"></i>
                            </div>

                            <!-- Step 3 -->
                            <div class="col-12 col-md-4 col-lg-2">
                                <div class="flow-node">
                                    <span class="flow-step-num">3</span>
                                    <div class="fw-bold text-dark small mb-1">Accuracy Calculation</div>
                                    <div class="text-muted" style="font-size: 0.75rem;">System computes domain & competency accuracy %</div>
                                </div>
                            </div>
                            <div class="col-12 col-md-auto text-center d-none d-lg-block">
                                <i class="fa-solid fa-arrow-right text-primary fa-lg"></i>
                            </div>
                            <div class="col-12 d-block d-lg-none text-center">
                                <i class="fa-solid fa-arrow-down text-primary"></i>
                            </div>

                            <!-- Step 4 -->
                            <div class="col-12 col-md-4 col-lg-2">
                                <div class="flow-node">
                                    <span class="flow-step-num">4</span>
                                    <div class="fw-bold text-dark small mb-1">Performance Classification</div>
                                    <div class="text-muted" style="font-size: 0.75rem;">DepEd 4-Tier MPL standards applied (Mastered to Needs Support)</div>
                                </div>
                            </div>
                            <div class="col-12 col-md-auto text-center d-none d-lg-block">
                                <i class="fa-solid fa-arrow-right text-primary fa-lg"></i>
                            </div>
                            <div class="col-12 d-block d-lg-none text-center">
                                <i class="fa-solid fa-arrow-down text-primary"></i>
                            </div>

                            <!-- Step 5 -->
                            <div class="col-12 col-md-4 col-lg-2">
                                <div class="flow-node">
                                    <span class="flow-step-num">5</span>
                                    <div class="fw-bold text-dark small mb-1">Pattern Identification</div>
                                    <div class="text-muted" style="font-size: 0.75rem;">Identifies strengths (&ge;75%) and weaknesses (&lt;60%)</div>
                                </div>
                            </div>
                            <div class="col-12 col-md-auto text-center d-none d-lg-block">
                                <i class="fa-solid fa-arrow-right text-primary fa-lg"></i>
                            </div>
                            <div class="col-12 d-block d-lg-none text-center">
                                <i class="fa-solid fa-arrow-down text-primary"></i>
                            </div>

                            <!-- Step 6 -->
                            <div class="col-12 col-md-4 col-lg-2">
                                <div class="flow-node" style="border-color: #22c55e; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.15);">
                                    <span class="flow-step-num" style="background:#22c55e;">6</span>
                                    <div class="fw-bold text-dark small mb-1">Dashboard Reporting</div>
                                    <div class="text-muted" style="font-size: 0.75rem;">Results appear in Analytics Dashboard & Reports</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECTION 1: DATA COLLECTION -->
                <div class="card methodology-step-card mb-4" id="section-data-collection">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-3 p-2.5">
                                <i class="fa-solid fa-database fa-lg"></i>
                            </span>
                            <div>
                                <h4 class="fw-bold mb-0 text-dark">1. Data Collection</h4>
                                <span class="text-muted small">Real-time student telemetry and assessment schema</span>
                            </div>
                        </div>
                        <p class="text-secondary mb-3">
                            QuestLearn collects student interaction telemetry directly from the Unity-based game client into Firebase Realtime Database. The system operates strictly on existing data structures without artificial or synthetic fields:
                        </p>

                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <div class="p-3 rounded-3 bg-light border">
                                    <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-user-check text-primary me-2"></i> Student Account Telemetry</h6>
                                    <ul class="small text-muted mb-0 ps-3">
                                        <li><strong>Account Identification:</strong> Unique UID, student full name, username, and role (<code>student</code>).</li>
                                        <li><strong>Gamification Parameters:</strong> Current Level, Experience Points (XP), Health Points (HP: 0-100), and Account creation/update timestamps.</li>
                                        <li><strong>Telemetry Timestamps:</strong> <code>lastActive</code>, <code>lastPlayed</code>, and session logs.</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="p-3 rounded-3 bg-light border">
                                    <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-book-bookmark text-primary me-2"></i> Assessment Question Schema</h6>
                                    <ul class="small text-muted mb-0 ps-3">
                                        <li><strong>Curriculum Domain:</strong> <code>grammar</code>, <code>vocabulary</code>, <code>reading</code>, or <code>information_literacy</code>.</li>
                                        <li><strong>Cognitive Taxonomy:</strong> Bloom's cognitive taxonomy level (<code>Remembering</code>, <code>Understanding</code>, <code>Applying</code>, <code>Analyzing</code>, <code>Evaluating</code>, <code>Creating</code>).</li>
                                        <li><strong>Difficulty Level:</strong> Level 1 (Easy), Level 2 (Medium), Level 3 (Hard), Level 4 (Boss / Creative).</li>
                                        <li><strong>Question Attributes:</strong> Prompt question text, multiple choice options (A, B, C, D), correct answer key, and specific MELC competency label.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="p-3 rounded-3 bg-light border">
                            <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-shield-halved text-success me-2"></i> Assessment Attempt Data Structure</h6>
                            <p class="small text-muted mb-2">
                                When a learner answers questions during dungeon battles, two distinct nodes in Firebase record their interactions:
                            </p>
                            <ul class="small text-muted mb-0 ps-3">
                                <li><code>users/{uid}/firstAttempts/{levelId}</code>: The official baseline attempt. Stores the question ID, the student's chosen answer, correctness boolean (<code>isCorrect</code>), category, and timestamp.</li>
                                <li><code>users/{uid}/firstAttemptStats</code>: Pre-aggregated diagnostic counter storing <code>totalAnswers</code>, <code>totalCorrect</code>, <code>totalWrong</code>, and breakdown by category.</li>
                                <li><code>users/{uid}/attempts/{attemptId}</code>: Formative practice logs from repeat play sessions, deliberately isolated from diagnostic baseline scoring.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- SECTION 2: DATA PREPROCESSING -->
                <div class="card methodology-step-card mb-4" id="section-data-preprocessing">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-3 p-2.5">
                                <i class="fa-solid fa-sliders fa-lg"></i>
                            </span>
                            <div>
                                <h4 class="fw-bold mb-0 text-dark">2. Data Preprocessing</h4>
                                <span class="text-muted small">Diagnostic baseline isolation and accuracy calculations</span>
                            </div>
                        </div>
                        <p class="text-secondary mb-3">
                            Before performance metrics appear on teacher dashboards, raw telemetry undergo structured preprocessing in accordance with educational measurement standards:
                        </p>

                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <div class="p-3 rounded-3 bg-light border h-100">
                                    <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-lock text-warning me-2"></i> First Attempts vs. Retries (Practice Isolation)</h6>
                                    <p class="small text-muted mb-2">
                                        In gamified environments, students repeatedly play quest levels to earn gold, unlock cosmetics, and gain XP. However, counting retries in standardized diagnostics creates severe artificial grade inflation.
                                    </p>
                                    <p class="small text-muted mb-0">
                                        <strong>Implementation Rule:</strong> QuestLearn isolates the student's <strong>First Attempt</strong> for all diagnostic calculations. Practice retries reward in-game items and combat buffs, but only the unassisted initial attempt is compiled into the official proficiency score.
                                    </p>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="p-3 rounded-3 bg-light border h-100">
                                    <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-calculator text-primary me-2"></i> Accuracy Calculation Formula</h6>
                                    <p class="small text-muted mb-2">
                                        Overall diagnostic accuracy and domain-specific accuracies are calculated using exact mathematical ratios:
                                    </p>
                                    <div class="p-2.5 rounded-2 bg-white border text-center font-monospace small mb-2 text-primary fw-bold">
                                        Accuracy (%) = round( (Total Correct First Attempts / Total First Attempt Questions) &times; 100 )
                                    </div>
                                    <p class="small text-muted mb-0">
                                        If a student has zero recorded first attempts, the system preserves integrity by returning <code>0%</code> and displaying a <em>"Not Started"</em> diagnostic status.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="p-3 rounded-3 bg-light border">
                            <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-layer-group text-info me-2"></i> Competency-Level Aggregation</h6>
                            <p class="small text-muted mb-0">
                                As implemented in <code>assets/js/performance.js</code> and <code>assets/js/competency_tracking.js</code>, answers are grouped by curriculum category keys (<code>grammar</code>, <code>vocabulary</code>, <code>reading</code>, <code>information_literacy</code>) and sub-competency MELC identifiers. The system sums correct responses over total attempted items per competency to calculate discrete mastery percentages.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- SECTION 3: CLASSIFICATION -->
                <div class="card methodology-step-card mb-4" id="section-classification">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-3 p-2.5">
                                <i class="fa-solid fa-scale-balanced fa-lg"></i>
                            </span>
                            <div>
                                <h4 class="fw-bold mb-0 text-dark">3. Performance Classification</h4>
                                <span class="text-muted small">DepEd Minimum Proficiency Level (MPL) standard benchmarks</span>
                            </div>
                        </div>
                        <p class="text-secondary mb-3">
                            QuestLearn evaluates student accuracy strictly against the <strong>DepEd 4-Tier Minimum Proficiency Level (MPL)</strong> standards established for the Grade 6 National Achievement Test (NATG6):
                        </p>

                        <div class="table-responsive mb-3">
                            <table class="table table-bordered align-middle">
                                <thead class="table-light small">
                                    <tr>
                                        <th style="width: 22%;">Classification Tier</th>
                                        <th style="width: 18%;">Accuracy Range</th>
                                        <th style="width: 22%;">DepEd MPL Status</th>
                                        <th>Pedagogical Meaning & Action Plan</th>
                                    </tr>
                                </thead>
                                <tbody class="small">
                                    <tr>
                                        <td>
                                            <span class="badge mpl-pill-mastered px-2.5 py-1.5 rounded-pill fw-bold">
                                                <i class="fa-solid fa-crown me-1"></i> Mastered
                                            </span>
                                        </td>
                                        <td class="fw-bold text-success">&ge; 75%</td>
                                        <td><span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Exceeds Benchmark</span></td>
                                        <td class="text-muted">Demonstrates comprehensive mastery of NATG6 English competencies. Ready for creative synthesis and peer tutoring roles.</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span class="badge mpl-pill-proficient px-2.5 py-1.5 rounded-pill fw-bold">
                                                <i class="fa-solid fa-circle-check me-1"></i> Proficient
                                            </span>
                                        </td>
                                        <td class="fw-bold text-primary">60% – 74%</td>
                                        <td><span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">Meets MPL (Passing)</span></td>
                                        <td class="text-muted">Meets DepEd Minimum Proficiency Level passing criteria (60%). Possesses functional competency with minor gaps in complex syntax or inference.</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span class="badge mpl-pill-developing px-2.5 py-1.5 rounded-pill fw-bold">
                                                <i class="fa-solid fa-clock-rotate-left me-1"></i> Developing
                                            </span>
                                        </td>
                                        <td class="fw-bold text-warning">50% – 59%</td>
                                        <td><span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">Below Passing</span></td>
                                        <td class="text-muted">Approaching the MPL threshold but requires guided review quests, targeted vocabulary practice, or reading scaffold exercises.</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span class="badge mpl-pill-needs-support px-2.5 py-1.5 rounded-pill fw-bold">
                                                <i class="fa-solid fa-triangle-exclamation me-1"></i> Needs Support
                                            </span>
                                        </td>
                                        <td class="fw-bold text-danger">&lt; 50%</td>
                                        <td><span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">Critical Alert</span></td>
                                        <td class="text-muted">Significant competency deficits. Student is automatically flagged in the at-risk registry for intensive individualized teacher intervention.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="alert alert-warning border-warning border-opacity-25 rounded-3 p-3 small mb-0">
                            <i class="fa-solid fa-circle-info text-warning me-2"></i>
                            <strong>Official Benchmark Reference:</strong> In <code>assets/js/performance.js</code> (lines 400–417), the exact code logic verifies:
                            <code>if (acc &gt;= 75) tier = 'mastered'; else if (acc &gt;= 60) tier = 'proficient'; else if (acc &gt;= 50) tier = 'developing'; else tier = 'needs_support';</code>.
                        </div>
                    </div>
                </div>

                <!-- SECTION 4: PATTERN IDENTIFICATION -->
                <div class="card methodology-step-card mb-4" id="section-pattern-identification">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-3 p-2.5">
                                <i class="fa-solid fa-magnifying-glass-chart fa-lg"></i>
                            </span>
                            <div>
                                <h4 class="fw-bold mb-0 text-dark">4. Pattern Identification</h4>
                                <span class="text-muted small">Algorithmic detection of learning strengths, weaknesses, and cognitive trends</span>
                            </div>
                        </div>
                        <p class="text-secondary mb-3">
                            QuestLearn identifies specific learning patterns using deterministic rule-based algorithms implemented in <code>assets/js/performance.js</code> (function <code>getStudentCategoryStruggles</code>):
                        </p>

                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <div class="p-3 rounded-3 bg-light border h-100">
                                    <h6 class="fw-bold text-success mb-2"><i class="fa-solid fa-arrow-trend-up me-2"></i> Identifying Strengths (Mastered Domains)</h6>
                                    <ul class="small text-muted mb-0 ps-3">
                                        <li><strong>Standard Criterion:</strong> Any curriculum domain or specific competency where first-attempt accuracy is <strong>&ge; 75%</strong>.</li>
                                        <li><strong>Display in System:</strong> Classified as <em>Excelling</em> in the Subject & Game Mode Mastery Matrix with green badge highlights.</li>
                                        <li><strong>Action Generated:</strong> AI recommends extension activities, boss challenges, and peer mentoring.</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="p-3 rounded-3 bg-light border h-100">
                                    <h6 class="fw-bold text-danger mb-2"><i class="fa-solid fa-arrow-trend-down me-2"></i> Identifying Weaknesses (Struggling Domains)</h6>
                                    <ul class="small text-muted mb-0 ps-3">
                                        <li><strong>Standard Criterion:</strong> Any curriculum domain or competency where first-attempt accuracy falls below the passing line (<strong>&lt; 60%</strong>).</li>
                                        <li><strong>Primary Bottleneck:</strong> The system sorts all domain scores ascendingly and tags the absolute lowest as <code>primaryStruggleCategory</code>.</li>
                                        <li><strong>Display in System:</strong> Highlighted in red/amber on the individual student card and flagged in cohort diagnostic reports.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="p-3 rounded-3 bg-light border">
                            <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-brain text-primary me-2"></i> Cognitive Taxonomy & Engagement Pattern Correlation</h6>
                            <p class="small text-muted mb-2">
                                Beyond simple percentages, the pattern analysis inspects cognitive dimensions:
                            </p>
                            <ul class="small text-muted mb-0 ps-3">
                                <li><strong>Bloom's Taxonomy Breakdown:</strong> Checks whether mistakes cluster in lower-order recall (Remembering/Understanding) or higher-order synthesis (Evaluating/Creating).</li>
                                <li><strong>Health Point (HP) Depletion Triggers:</strong> Students whose in-game HP drops to &le; 20 are correlated with repeated incorrect submissions, triggering real-time teacher alert notifications.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- SECTION 5: ANALYSIS RESULTS IN DASHBOARDS -->
                <div class="card methodology-step-card mb-4" id="section-analysis-results">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-3 p-2.5">
                                <i class="fa-solid fa-chart-column fa-lg"></i>
                            </span>
                            <div>
                                <h4 class="fw-bold mb-0 text-dark">5. Analysis Results in Dashboards & Reports</h4>
                                <span class="text-muted small">Translation of processed data into teacher-facing insights</span>
                            </div>
                        </div>
                        <p class="text-secondary mb-3">
                            The processed results from steps 1–4 are directly rendered across the admin portal's dedicated reporting and tracking views:
                        </p>

                        <div class="row g-3">
                            <div class="col-md-4">
                                <div class="p-3 rounded-3 bg-light border h-100">
                                    <div class="d-flex align-items-center gap-2 mb-2">
                                        <i class="fa-solid fa-gauge-high text-primary"></i>
                                        <h6 class="fw-bold text-dark mb-0">Analytics Dashboard</h6>
                                    </div>
                                    <p class="small text-muted mb-2">
                                        Displays top-level macro metrics: Total Students, Average Cohort XP, Grade 6 Score Distribution, and At-Risk Registry (HP &le; 20 or Accuracy &lt; 50%).
                                    </p>
                                    <a href="<?php echo $base; ?>index" class="small fw-bold text-decoration-none">Open Dashboard &rarr;</a>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="p-3 rounded-3 bg-light border h-100">
                                    <div class="d-flex align-items-center gap-2 mb-2">
                                        <i class="fa-solid fa-award text-warning"></i>
                                        <h6 class="fw-bold text-dark mb-0">COMPETENCY TRACKING</h6>
                                    </div>
                                    <p class="small text-muted mb-2">
                                        Provides granular per-student competency status cards, competency radar visualizations, and real-time status badges (Mastered, Proficient, Developing, Needs Support).
                                    </p>
                                    <a href="<?php echo $base; ?>pages/teacher/competency-tracking" class="small fw-bold text-decoration-none">Open Competency Tracking &rarr;</a>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="p-3 rounded-3 bg-light border h-100">
                                    <div class="d-flex align-items-center gap-2 mb-2">
                                        <i class="fa-solid fa-file-invoice text-info"></i>
                                        <h6 class="fw-bold text-dark mb-0">ASSESSMENT REPORTING</h6>
                                    </div>
                                    <p class="small text-muted mb-2">
                                        Generates official NATG6 assessment summaries, domain filterable tables, printable official transcripts, and CSV exports for DepEd administrative compliance.
                                    </p>
                                    <a href="<?php echo $base; ?>pages/teacher/assessment-reporting" class="small fw-bold text-decoration-none">Open Assessment Reporting &rarr;</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    <script src="<?php echo $base; ?>backend/config/firebase.js"></script>
    <script src="<?php echo $base; ?>assets/js/main.js?v=<?php echo time(); ?>"></script>
</body>
</html>