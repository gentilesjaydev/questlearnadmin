<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Analytics - QuestLearn</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="<?php echo $base; ?>assets/css/style.css?v=<?php echo time(); ?>">
    <link rel="icon" type="image/png" href="<?php echo $base; ?>assets/images/logo.png">
</head>

<body>
    <div class="d-flex">
        <?php include $base . 'includes/components/sidebar.php'; ?>
        <div id="content">
            <?php include $base . 'includes/components/navbar.php'; ?>

            <div class="container-fluid p-4 p-md-5">
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <div>
                        <h2 class="fw-bolder mb-1" style="color: var(--text-main); letter-spacing: -1.5px; font-size: 2.2rem;">Performance Analytics & Reporting</h2>
                        <p class="text-muted mb-0" style="font-size: 1.05rem; font-weight: 500;">NATG6 standardized assessment diagnostics, competency tracking, and official reporting.</p>
                    </div>
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                        <a href="<?php echo $base; ?>pages/teacher/competency-tracking" class="btn btn-outline-secondary px-3 py-2 rounded-pill shadow-sm fw-bold bg-white text-dark">
                            <i class="fa-solid fa-award me-1.5 text-warning"></i> COMPETENCY TRACKING
                        </a>
                        <a href="<?php echo $base; ?>pages/teacher/assessment-reporting" class="btn btn-outline-secondary px-3 py-2 rounded-pill shadow-sm fw-bold bg-white text-dark">
                            <i class="fa-solid fa-file-invoice me-1.5 text-info"></i> ASSESSMENT REPORTING
                        </a>
                        <a href="<?php echo $base; ?>pages/teacher/learning-pattern-methodology" class="btn btn-outline-primary px-3 py-2 rounded-pill shadow-sm fw-bold bg-white">
                            <i class="fa-solid fa-brain me-1.5 text-primary"></i> Learning Pattern Methodology
                        </a>
                        <button onclick="openOfficialReportModal()" class="btn btn-outline-primary px-4 py-2 rounded-pill shadow-sm fw-bold bg-white">
                            <i class="fa-solid fa-file-invoice me-2 text-primary"></i> Official Assessment Report
                        </button>
                        <button id="aiInsightsBtn" class="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-bold">
                            <i class="fa-solid fa-wand-magic-sparkles me-2"></i> Generate AI Insights
                        </button>
                    </div>
                </div>

                <!-- DepEd 4-Tier Proficiency Level Benchmark Summary -->
                <div class="card border-0 shadow-sm rounded-4 mb-4">
                    <div class="card-body p-4">
                        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                            <div>
                                <h5 class="fw-bold text-dark mb-1">
                                    <i class="fa-solid fa-shield-halved text-primary me-2"></i> NATG6 Official Proficiency Distribution (DepEd Standards)
                                </h5>
                                <small class="text-muted">Standards-based classification across all assessed Grade 6 learners based on official First Attempts.</small>
                            </div>
                            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-bold">
                                <i class="fa-solid fa-circle-check me-1"></i> MPL Passing Benchmark: 60% Accuracy
                            </span>
                        </div>
                        
                        <div class="row g-3 text-center" id="proficiencyBenchmarkCards">
                            <div class="col-6 col-md-3">
                                <div class="p-3 rounded-4 bg-success bg-opacity-10 border border-success border-opacity-25 h-100">
                                    <div class="d-flex align-items-center justify-content-center mb-1">
                                        <span class="badge bg-success text-white px-2 py-0.5 rounded-pill small me-1.5">&ge; 75%</span>
                                        <h6 class="fw-bold text-success mb-0">Mastered</h6>
                                    </div>
                                    <h3 class="fw-bolder text-success mb-0" id="tierMasteredCount">0</h3>
                                    <small class="text-muted fw-medium" id="tierMasteredPct">0% of cohort</small>
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 h-100">
                                    <div class="d-flex align-items-center justify-content-center mb-1">
                                        <span class="badge bg-primary text-white px-2 py-0.5 rounded-pill small me-1.5">60 - 74%</span>
                                        <h6 class="fw-bold text-primary mb-0">Proficient</h6>
                                    </div>
                                    <h3 class="fw-bolder text-primary mb-0" id="tierProficientCount">0</h3>
                                    <small class="text-muted fw-medium" id="tierProficientPct">0% of cohort</small>
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="p-3 rounded-4 bg-warning bg-opacity-10 border border-warning border-opacity-25 h-100">
                                    <div class="d-flex align-items-center justify-content-center mb-1">
                                        <span class="badge bg-warning text-dark px-2 py-0.5 rounded-pill small me-1.5">50 - 59%</span>
                                        <h6 class="fw-bold text-warning mb-0">Developing</h6>
                                    </div>
                                    <h3 class="fw-bolder text-warning mb-0" id="tierDevelopingCount">0</h3>
                                    <small class="text-muted fw-medium" id="tierDevelopingPct">0% of cohort</small>
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="p-3 rounded-4 bg-danger bg-opacity-10 border border-danger border-opacity-25 h-100">
                                    <div class="d-flex align-items-center justify-content-center mb-1">
                                        <span class="badge bg-danger text-white px-2 py-0.5 rounded-pill small me-1.5">&lt; 50%</span>
                                        <h6 class="fw-bold text-danger mb-0">Needs Support</h6>
                                    </div>
                                    <h3 class="fw-bolder text-danger mb-0" id="tierNeedsSupportCount">0</h3>
                                    <small class="text-muted fw-medium" id="tierNeedsSupportPct">0% of cohort</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- General Stats Cards -->
                <div class="row g-4 mb-4" id="generalStatsBox">
                    <div class="col-12 text-center text-muted">
                        <i class="fa-solid fa-circle-notch fa-spin"></i> Loading stats...
                    </div>
                </div>

                <!-- Overall Charts -->
                <div class="row g-4 mb-4">
                    <div class="col-md-8">
                        <div class="card border-0 shadow-sm rounded-4 h-100 border-top border-primary border-4" style="box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02) !important;">
                            <div class="card-body p-4">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-2">
                                        <i class="fa-solid fa-chart-bar"></i>
                                    </div>
                                    <h6 class="fw-bold text-dark mb-0 text-uppercase" style="letter-spacing:0.5px; font-size: 0.85rem;">Student Accuracy Rates</h6>
                                </div>
                                <canvas id="classAccuracyChart" height="100"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card border-0 shadow-sm rounded-4 h-100 border-top border-primary border-4" style="box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02) !important;">
                            <div class="card-body p-4 text-center">
                                <div class="d-flex align-items-center justify-content-center mb-3">
                                    <div class="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-2">
                                        <i class="fa-solid fa-chart-pie"></i>
                                    </div>
                                    <h6 class="fw-bold text-dark mb-0 text-uppercase" style="letter-spacing:0.5px; font-size: 0.85rem;">Performance Overview</h6>
                                </div>
                                <canvas id="overallPieChart" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Cognitive and Curriculum Analytics -->
                <div class="row g-4 mb-4">
                    <div class="col-xl-4 col-md-6">
                        <div class="card border-0 shadow-sm rounded-4 h-100 border-top border-info border-4" style="box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02) !important;">
                            <div class="card-body p-4">
                                <div class="d-flex align-items-center mb-2">
                                    <div class="bg-info bg-opacity-10 text-info p-2 rounded-3 me-2">
                                        <i class="fa-solid fa-list-check"></i>
                                    </div>
                                    <h6 class="fw-bold text-dark mb-0 text-uppercase" style="letter-spacing:0.5px; font-size: 0.85rem;">Performance by Category</h6>
                                </div>
                                <p class="text-muted small mb-4">Average correct answers based on learning topics.</p>
                                <div style="position: relative; height: 260px;">
                                    <canvas id="categoryChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-md-6">
                        <div class="card border-0 shadow-sm rounded-4 h-100 border-top border-warning border-4" style="box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02) !important;">
                            <div class="card-body p-4">
                                <div class="d-flex align-items-center mb-2">
                                    <div class="bg-warning bg-opacity-10 text-warning p-2 rounded-3 me-2">
                                        <i class="fa-solid fa-brain"></i>
                                    </div>
                                    <h6 class="fw-bold text-dark mb-0 text-uppercase" style="letter-spacing:0.5px; font-size: 0.85rem;">Cognitive Levels (Bloom's)</h6>
                                </div>
                                <p class="text-muted small mb-4">Mastery across lower and higher cognitive domains.</p>
                                <div style="position: relative; height: 260px;">
                                    <canvas id="bloomChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-md-12">
                        <div class="card border-0 shadow-sm rounded-4 h-100 border-top border-success border-4" style="box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02) !important;">
                            <div class="card-body p-4">
                                <div class="d-flex align-items-center mb-2">
                                    <div class="bg-success bg-opacity-10 text-success p-2 rounded-3 me-2">
                                        <i class="fa-solid fa-award"></i>
                                    </div>
                                    <h6 class="fw-bold text-dark mb-0 text-uppercase" style="letter-spacing:0.5px; font-size: 0.85rem;">Core Competencies Mastery</h6>
                                </div>
                                <p class="text-muted small mb-4">Skill levels indexed by key language benchmarks.</p>
                                <div style="position: relative; height: 260px;">
                                    <canvas id="competencyChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Insights Container -->
                <div id="aiInsightsResult" class="d-none bg-white p-4 rounded-4 shadow-sm border border-light mb-4">
                    <!-- AI Content injected here -->
                </div>

                <!-- Detailed Subject & Game Mode Mastery Matrix -->
                <div class="card border-0 shadow-sm rounded-4 mb-4">
                    <div class="card-body p-4">
                        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
                            <div class="d-flex align-items-center mb-2 mb-md-0">
                                <div class="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-2">
                                    <i class="fa-solid fa-layer-group"></i>
                                </div>
                                <div>
                                    <h5 class="fw-bold text-dark mb-0">Subject & Game Mode Mastery Matrix</h5>
                                    <small class="text-muted">Structured diagnostic analysis: identify who excels (&ge;75%) and who struggles (&lt;60%) per topic and mode.</small>
                                </div>
                            </div>
                            <div class="btn-group btn-group-sm rounded-pill p-1 bg-light border" role="group" id="matrixTypeToggle">
                                <button type="button" class="btn btn-primary rounded-pill px-3 fw-bold active" id="matrixBtnTopics" onclick="switchMatrixType('topics')">
                                    <i class="fa-solid fa-book-open me-1"></i> Subject Topics
                                </button>
                                <button type="button" class="btn btn-light text-muted rounded-pill px-3 fw-bold" id="matrixBtnModes" onclick="switchMatrixType('modes')">
                                    <i class="fa-solid fa-gamepad me-1"></i> RPG Game Modes
                                </button>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="bg-light">
                                    <tr>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0" style="width: 22%;">Domain / Topic</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0 text-center" style="width: 15%;">Class Avg Score</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0" style="width: 28%;">⭐ Excelling Students (&ge;75%)</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0" style="width: 25%;">⚠️ Struggling Students (&lt;60%)</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0 text-end" style="width: 10%;">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="categoryModeMatrixBody" class="border-top-0">
                                    <!-- Populated dynamically by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Student Leaderboard / Analytics Table -->
                <div class="card border-0 shadow-sm rounded-4">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-4">
                            <div class="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-2">
                                <i class="fa-solid fa-ranking-star"></i>
                            </div>
                            <h5 class="fw-bold text-dark mb-0">Student Performance Roster</h5>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="bg-light">
                                    <tr>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Student Name</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Current Level</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Total XP</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Health (HP)</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Accuracy Rate</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Category Struggles</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0 text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="analyticsTableBody" class="border-top-0">
                                    <!-- Populated by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Official Assessment & Diagnostic Report Modal -->
    <div class="modal fade" id="officialReportModal" tabindex="-1" aria-labelledby="officialReportModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header bg-light border-0 d-flex justify-content-between align-items-center p-4">
                    <div>
                        <h5 class="modal-title fw-bold text-dark mb-0" id="officialReportModalLabel">
                            <i class="fa-solid fa-file-invoice text-primary me-2"></i> Official NATG6 English Assessment Report
                        </h5>
                        <small class="text-muted">Standardized competency diagnostics and performance documentation.</small>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <button onclick="printOfficialReport()" class="btn btn-sm btn-primary rounded-pill px-3 shadow-sm fw-bold">
                            <i class="fa-solid fa-print me-1"></i> Print / Save PDF
                        </button>
                        <button onclick="exportReportCsv()" class="btn btn-sm btn-outline-success rounded-pill px-3 shadow-sm fw-bold bg-white">
                            <i class="fa-solid fa-file-excel me-1"></i> Export CSV
                        </button>
                        <button type="button" class="btn-close ms-2" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                </div>
                <div class="modal-body p-4 p-md-5" id="printableReportArea">
                    <!-- Report Header -->
                    <div class="text-center pb-4 mb-4 border-bottom border-2 border-dark">
                        <div class="d-flex justify-content-center align-items-center gap-3 mb-2">
                            <img src="<?php echo $base; ?>assets/images/logo.png" alt="Logo" width="48" height="48" class="rounded-3 shadow-sm">
                            <div class="text-start">
                                <h4 class="fw-bolder mb-0 text-dark" style="letter-spacing: -0.5px;">QUESTLEARN GAMIFIED LEARNING SYSTEM</h4>
                                <p class="text-muted small mb-0 fw-semibold text-uppercase" style="letter-spacing: 1px;">NATG6 English Competency Diagnostic & Assessment Report</p>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between text-muted small mt-3 px-2">
                            <span><strong>Target Assessment:</strong> Grade 6 National Achievement Test (NATG6)</span>
                            <span><strong>Date Generated:</strong> <span id="reportGeneratedDate">-</span></span>
                            <span><strong>Cohort:</strong> Elementary English Grade 6</span>
                        </div>
                    </div>

                    <!-- 1. Executive Performance Summary -->
                    <div class="mb-4">
                        <h6 class="fw-bold text-dark text-uppercase small mb-3">
                            <i class="fa-solid fa-chart-simple text-primary me-2"></i> 1. Executive Performance Summary
                        </h6>
                        <div class="row g-3 text-center">
                            <div class="col-md-3 col-6">
                                <div class="p-3 bg-light rounded-3 border">
                                    <small class="text-muted text-uppercase fw-semibold" style="font-size:0.75rem;">Total Learners</small>
                                    <h3 class="fw-bold text-dark mb-0 mt-1" id="repTotalStudents">0</h3>
                                    <small class="text-muted" style="font-size:0.75rem;">Assessed cohort</small>
                                </div>
                            </div>
                            <div class="col-md-3 col-6">
                                <div class="p-3 bg-light rounded-3 border">
                                    <small class="text-muted text-uppercase fw-semibold" style="font-size:0.75rem;">Mean Class Accuracy</small>
                                    <h3 class="fw-bold text-primary mb-0 mt-1" id="repMeanAccuracy">0%</h3>
                                    <small class="text-muted" style="font-size:0.75rem;">Official first attempts</small>
                                </div>
                            </div>
                            <div class="col-md-3 col-6">
                                <div class="p-3 bg-light rounded-3 border">
                                    <small class="text-muted text-uppercase fw-semibold" style="font-size:0.75rem;">Meeting MPL (&ge;60%)</small>
                                    <h3 class="fw-bold text-success mb-0 mt-1" id="repPassingRate">0%</h3>
                                    <small class="text-muted" style="font-size:0.75rem;" id="repPassingCount">0 learners</small>
                                </div>
                            </div>
                            <div class="col-md-3 col-6">
                                <div class="p-3 bg-light rounded-3 border">
                                    <small class="text-muted text-uppercase fw-semibold" style="font-size:0.75rem;">Critical / At-Risk</small>
                                    <h3 class="fw-bold text-danger mb-0 mt-1" id="repAtRiskCount">0</h3>
                                    <small class="text-muted" style="font-size:0.75rem;">Needs immediate support</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. DepEd 4-Tier Proficiency Distribution -->
                    <div class="mb-4">
                        <h6 class="fw-bold text-dark text-uppercase small mb-3">
                            <i class="fa-solid fa-layer-group text-primary me-2"></i> 2. DepEd Standards-Based Proficiency Distribution
                        </h6>
                        <div class="table-responsive">
                            <table class="table table-bordered align-middle mb-0 text-center">
                                <thead class="table-light">
                                    <tr>
                                        <th class="py-2 text-start">Proficiency Classification</th>
                                        <th class="py-2">Benchmark Range</th>
                                        <th class="py-2">Student Count</th>
                                        <th class="py-2">% of Cohort</th>
                                        <th class="py-2 text-start">Prescribed Educational Intervention</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="text-start fw-bold text-success"><i class="fa-solid fa-circle-check me-2"></i>Mastered</td>
                                        <td>75% – 100%</td>
                                        <td id="tableMasteredCount" class="fw-bold">0</td>
                                        <td id="tableMasteredPct">0%</td>
                                        <td class="text-start small">Advanced enrichment, Level 4 boss challenges, and peer tutoring leads.</td>
                                    </tr>
                                    <tr>
                                        <td class="text-start fw-bold text-primary"><i class="fa-solid fa-check me-2"></i>Proficient</td>
                                        <td>60% – 74%</td>
                                        <td id="tableProficientCount" class="fw-bold">0</td>
                                        <td id="tableProficientPct">0%</td>
                                        <td class="text-start small">Standard curricular pacing; Level 2-3 dungeon quests reinforcement.</td>
                                    </tr>
                                    <tr>
                                        <td class="text-start fw-bold text-warning"><i class="fa-solid fa-triangle-exclamation me-2"></i>Developing</td>
                                        <td>50% – 59%</td>
                                        <td id="tableDevelopingCount" class="fw-bold">0</td>
                                        <td id="tableDevelopingPct">0%</td>
                                        <td class="text-start small">Targeted review sessions, vocabulary expansion, and guided practice.</td>
                                    </tr>
                                    <tr>
                                        <td class="text-start fw-bold text-danger"><i class="fa-solid fa-circle-exclamation me-2"></i>Needs Support</td>
                                        <td>Below 50% / Crit. HP</td>
                                        <td id="tableNeedsSupportCount" class="fw-bold">0</td>
                                        <td id="tableNeedsSupportPct">0%</td>
                                        <td class="text-start small text-danger fw-semibold">Mandatory remedial intervention, modified quest difficulty, HP incentives.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 3. NATG6 Domain Competency Scorecard -->
                    <div class="mb-4">
                        <h6 class="fw-bold text-dark text-uppercase small mb-3">
                            <i class="fa-solid fa-list-check text-primary me-2"></i> 3. NATG6 English Competency Domain Scorecard
                        </h6>
                        <div class="table-responsive">
                            <table class="table table-bordered align-middle mb-0 text-center">
                                <thead class="table-light">
                                    <tr>
                                        <th class="py-2 text-start">NATG6 Competency Domain</th>
                                        <th class="py-2">Class Mean Score</th>
                                        <th class="py-2">Domain Status</th>
                                        <th class="py-2">Struggling Learners (&lt;60%)</th>
                                        <th class="py-2 text-start">Diagnostic Finding</th>
                                    </tr>
                                </thead>
                                <tbody id="reportDomainTableBody">
                                    <!-- Populated by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 4. Individual Student Performance Master Roster -->
                    <div class="mb-4">
                        <h6 class="fw-bold text-dark text-uppercase small mb-3">
                            <i class="fa-solid fa-users text-primary me-2"></i> 4. Individual Learner Assessment Roster
                        </h6>
                        <div class="table-responsive">
                            <table class="table table-bordered align-middle mb-0">
                                <thead class="table-light text-center">
                                    <tr>
                                        <th class="py-2 text-start">Learner Name</th>
                                        <th class="py-2">Level</th>
                                        <th class="py-2">Total XP</th>
                                        <th class="py-2">Health (HP)</th>
                                        <th class="py-2">First-Attempt Accuracy</th>
                                        <th class="py-2">Proficiency Tier</th>
                                        <th class="py-2 text-start">Identified Struggle Category</th>
                                    </tr>
                                </thead>
                                <tbody id="reportStudentTableBody">
                                    <!-- Populated by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 5. AI Heuristic Pedagogical Intervention Plan -->
                    <div class="mb-4" id="reportAiPlanSection">
                        <h6 class="fw-bold text-dark text-uppercase small mb-3">
                            <i class="fa-solid fa-wand-magic-sparkles text-primary me-2"></i> 5. AI Heuristic Pedagogical Remediation Plan
                        </h6>
                        <div id="reportAiPlanContent" class="bg-light p-4 rounded-3 border">
                            <p class="text-muted small mb-0"><i class="fa-solid fa-info-circle me-1"></i> Generate AI Insights on the analytics dashboard to automatically attach detailed machine-learning pedagogical recommendations to this report.</p>
                        </div>
                    </div>

                    <!-- 6. Formal Sign-off Block -->
                    <div class="mt-5 pt-4 border-top">
                        <div class="row text-center mt-4 g-4">
                            <div class="col-4">
                                <div class="border-top border-dark pt-2 mx-auto" style="max-width: 200px;">
                                    <p class="fw-bold mb-0 text-dark small">Subject Teacher</p>
                                    <small class="text-muted">Prepared By</small>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="border-top border-dark pt-2 mx-auto" style="max-width: 200px;">
                                    <p class="fw-bold mb-0 text-dark small">English Dept. Coordinator</p>
                                    <small class="text-muted">Reviewed By</small>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="border-top border-dark pt-2 mx-auto" style="max-width: 200px;">
                                    <p class="fw-bold mb-0 text-dark small">School Principal / Head</p>
                                    <small class="text-muted">Approved By</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer bg-light border-0 d-flex justify-content-between p-3">
                    <small class="text-muted"><i class="fa-solid fa-shield-check text-success me-1"></i> Formatted in compliance with NATG6 DepEd Table of Specifications</small>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-secondary px-4 rounded-pill" data-bs-dismiss="modal">Close</button>
                        <button onclick="exportReportCsv()" class="btn btn-outline-success px-4 rounded-pill fw-bold bg-white"><i class="fa-solid fa-file-excel me-1"></i> Export CSV</button>
                        <button onclick="printOfficialReport()" class="btn btn-primary px-4 rounded-pill fw-bold"><i class="fa-solid fa-print me-1"></i> Print / Save PDF</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Student Analytics Modal -->
    <div class="modal fade" id="studentAnalyticsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header bg-light border-0">
                    <h5 class="modal-title fw-bold" id="studentModalTitle">Student Analysis</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="d-flex border-bottom mb-4">
                        <button class="btn btn-link nav-link active fw-bold text-primary pb-2 me-4 border-bottom border-primary border-3" id="modal-tab-overview" onclick="switchModalTab('overview')" style="text-decoration: none; border-radius: 0; border: none; background: none;">Overview</button>
                        <button class="btn btn-link nav-link fw-bold text-muted pb-2" id="modal-tab-skills" onclick="switchModalTab('skills')" style="text-decoration: none; border-radius: 0; border: none; background: none;">Cognitive & Skills Breakdown</button>
                    </div>

                    <div id="modal-content-overview">
                        <div class="row mb-4">
                            <div class="col-md-6 text-center">
                                <canvas id="studentPieChart" height="200"></canvas>
                            </div>
                            <div class="col-md-6 d-flex flex-column justify-content-center">
                                <h4 id="studentNameDisplay" class="fw-bolder mb-3 text-dark"></h4>
                                <div class="d-flex align-items-center mb-2 flex-wrap gap-2">
                                    <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill me-2" id="studentLevelDisplay"></span>
                                    <span class="text-success fw-bold me-2" id="studentXpDisplay"></span>
                                    <span class="fw-bold" id="studentHpDisplay"></span>
                                </div>
                                <div id="studentStruggleBadgeDisplay" class="my-2"></div>
                                <p class="text-muted small mt-1 mb-2">Generate a personalized AI insight to understand this student's specific pain points and strengths.</p>
                                <button id="studentAiBtn" class="btn btn-outline-primary fw-bold mt-1 align-self-start">
                                    <i class="fa-solid fa-brain me-2"></i> Analyze Student
                                </button>
                            </div>
                        </div>
                        <div id="studentAiResult" class="bg-light p-3 rounded-3 d-none" style="font-size: 0.9rem; line-height: 1.6;">
                            <!-- Student AI Insight Here -->
                        </div>
                    </div>

                    <div id="modal-content-skills" class="d-none">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <h6 class="fw-bold text-muted mb-3 text-uppercase" style="font-size: 0.8rem;">Category Performance</h6>
                                <div style="position: relative; height: 180px;">
                                    <canvas id="studentCategoryChart"></canvas>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold text-muted mb-3 text-uppercase" style="font-size: 0.8rem;">Cognitive Skills (Bloom's)</h6>
                                <div style="position: relative; height: 180px;">
                                    <canvas id="studentBloomChart"></canvas>
                                </div>
                            </div>
                            <div class="col-12 mt-3">
                                <h6 class="fw-bold text-muted mb-3 text-uppercase" style="font-size: 0.8rem;">Core Competencies Mastery</h6>
                                <div style="position: relative; height: 155px;">
                                    <canvas id="studentCompetencyChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Firebase SDK Setup -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>

    <!-- Config and Real-time Fetch Logic -->
    <script src="<?php echo $base; ?>backend/config/firebase.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="<?php echo $base; ?>assets/js/main.js?v=<?php echo time(); ?>"></script>
    <script src="<?php echo $base; ?>assets/js/performance.js?v=<?php echo time(); ?>"></script>
</body>

</html>