<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assessment Reporting - QuestLearn</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="<?php echo $base; ?>assets/css/style.css?v=<?php echo time(); ?>">
    <link rel="icon" type="image/png" href="<?php echo $base; ?>assets/images/logo.png">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <style>
        @media print {
            body { background: #fff !important; }
            #sidebar, #navbar, .no-print, .btn, .input-group { display: none !important; }
            #content { width: 100% !important; margin: 0 !important; padding: 0 !important; }
            .container-fluid { padding: 0 !important; max-width: 100% !important; }
            .card { border: none !important; box-shadow: none !important; }
            .print-only-header { display: block !important; }
            .table { font-size: 11pt !important; }
        }
        .print-only-header { display: none; }
    </style>
</head>
<body>
    <div class="d-flex">
        <?php include $base . 'includes/components/sidebar.php'; ?>
        <div id="content">
            <?php include $base . 'includes/components/navbar.php'; ?>
            
            <div class="container-fluid px-3 px-md-4 py-4">
                <!-- Screen Header & Actions -->
                <div class="row align-items-center mb-4 gy-3 no-print">
                    <div class="col-12 col-xl-6">
                        <div class="d-flex align-items-center gap-2 gap-sm-3 flex-wrap">
                            <h2 class="fw-bolder mb-0" style="color: var(--text-main); letter-spacing: -1px; font-size: 1.85rem;">Assessment Reporting</h2>
                            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1.5 rounded-pill fw-bold small">
                                <i class="fa-solid fa-file-invoice me-1"></i> DepEd NATG6 Standards
                            </span>
                        </div>
                        <p class="text-muted mb-0 mt-1 small" style="font-weight: 500;">
                            <i class="fa-solid fa-square-poll-vertical text-primary me-1.5"></i> Comprehensive assessment results, diagnostic telemetry, and official report generation.
                        </p>
                    </div>
                    <div class="col-12 col-xl-6">
                        <div class="d-flex flex-wrap justify-content-xl-end align-items-center gap-2">
                            <button onclick="window.printAssessmentReport()" class="btn btn-primary rounded-pill px-3.5 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-1.5" style="font-size: 0.88rem;">
                                <i class="fa-solid fa-print"></i> Print / Save PDF
                            </button>
                            <button onclick="window.exportAssessmentCsv()" class="btn btn-outline-success bg-white rounded-pill px-3.5 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-1.5" style="font-size: 0.88rem;">
                                <i class="fa-solid fa-file-excel"></i> Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Print-Only Official Report Header -->
                <div class="print-only-header text-center pb-4 mb-4 border-bottom border-2 border-dark">
                    <h3 class="fw-bold mb-1 text-uppercase">Republic of the Philippines &bull; Department of Education</h3>
                    <h4 class="fw-bolder mb-1">QuestLearn NATG6 English Assessment Report</h4>
                    <p class="small text-muted mb-2">Standardized Diagnostic Assessment Telemetry & Competency Documentation &bull; Grade 6</p>
                    <div class="d-flex justify-content-between small text-muted px-2">
                        <span><strong>Generated On:</strong> <?php echo date('F d, Y - h:i A'); ?></span>
                        <span><strong>Evaluation Benchmark:</strong> NATG6 Minimum Proficiency Level (60%)</span>
                    </div>
                </div>

                <!-- KPI Summary Cards -->
                <div class="row g-3 mb-4 no-print">
                    <div class="col-6 col-md-3">
                        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-top border-primary border-3 h-100">
                            <small class="text-muted fw-bold text-uppercase" style="font-size: 0.7rem;">Assessed Learners</small>
                            <h3 class="fw-bolder mb-0 mt-1 text-dark" id="kpiTotalStudents">0</h3>
                            <small class="text-muted" style="font-size: 0.72rem;">Active Grade 6 Cohort</small>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-top border-success border-3 h-100">
                            <small class="text-muted fw-bold text-uppercase" style="font-size: 0.7rem;">MPL Passing Rate</small>
                            <h3 class="fw-bolder mb-0 mt-1 text-success" id="kpiPassingRate">0%</h3>
                            <small class="text-muted" style="font-size: 0.72rem;">Score &ge; 60% Benchmark</small>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-top border-info border-3 h-100">
                            <small class="text-muted fw-bold text-uppercase" style="font-size: 0.7rem;">Mean Diagnostic Score</small>
                            <h3 class="fw-bolder mb-0 mt-1 text-info" id="kpiMeanScore">0%</h3>
                            <small class="text-muted" style="font-size: 0.72rem;">Average First-Attempt Accuracy</small>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-top border-warning border-3 h-100">
                            <small class="text-muted fw-bold text-uppercase" style="font-size: 0.7rem;">Total Questions Evaluated</small>
                            <h3 class="fw-bolder mb-0 mt-1 text-dark" id="kpiTotalQuestions">0</h3>
                            <small class="text-muted" style="font-size: 0.72rem;">Diagnostic Questions Answered</small>
                        </div>
                    </div>
                </div>

                <!-- Filter Controls (Screen Only) -->
                <div class="card border-0 shadow-sm rounded-4 p-3 mb-4 no-print bg-light border">
                    <div class="row g-2 align-items-center">
                        <div class="col-12 col-md-3">
                            <label class="form-label text-muted small fw-bold mb-1">Section Filter</label>
                            <select id="reportSectionSelect" class="form-select border shadow-none" style="border-radius: 10px; font-size: 0.88rem; font-weight: 600;">
                                <option value="ALL">All Grade 6 Sections</option>
                            </select>
                        </div>
                        <div class="col-12 col-md-3">
                            <label class="form-label text-muted small fw-bold mb-1">Result / Tier Filter</label>
                            <select id="reportTierSelect" class="form-select border shadow-none" style="border-radius: 10px; font-size: 0.88rem; font-weight: 600;">
                                <option value="ALL">All Diagnostic Results</option>
                                <option value="Mastered">Mastered (≥ 75%)</option>
                                <option value="Proficient">Proficient (60 - 74%)</option>
                                <option value="Developing">Developing (50 - 59%)</option>
                                <option value="Needs Support">Needs Support (< 50%)</option>
                            </select>
                        </div>
                        <div class="col-12 col-md-3">
                            <label class="form-label text-muted small fw-bold mb-1">Competency Domain</label>
                            <select id="reportDomainSelect" class="form-select border shadow-none" style="border-radius: 10px; font-size: 0.88rem; font-weight: 600;">
                                <option value="ALL">All Curriculum Domains</option>
                                <option value="grammar">Grammar & Structure</option>
                                <option value="vocabulary">Vocabulary & Meaning</option>
                                <option value="reading">Reading Comprehension</option>
                                <option value="information_literacy">Information Literacy</option>
                            </select>
                        </div>
                        <div class="col-12 col-md-3">
                            <label class="form-label text-muted small fw-bold mb-1">Search Student</label>
                            <input type="text" id="reportSearchInput" class="form-control border shadow-none" placeholder="Search learner name..." style="border-radius: 10px; font-size: 0.88rem;">
                        </div>
                    </div>
                </div>

                <!-- Assessment Report Table -->
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                    <div class="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                            <h5 class="fw-bold text-dark mb-0">Diagnostic Assessment Telemetry Records</h5>
                            <small class="text-muted">Filtered official records showing individual student performance, scores, and NATG6 competency remarks.</small>
                        </div>
                        <span id="reportRecordCountBadge" class="badge bg-light text-dark border px-3 py-1.5 rounded-pill small fw-bold no-print">0 Assessment Records</span>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0" id="assessmentReportTable">
                            <thead class="bg-light">
                                <tr>
                                    <th class="px-3 py-3 text-muted text-nowrap" style="width: 22%;">Student</th>
                                    <th class="px-3 py-3 text-muted text-nowrap" style="width: 14%;">Section</th>
                                    <th class="px-3 py-3 text-muted text-nowrap" style="width: 14%;">Assessment Target</th>
                                    <th class="px-3 py-3 text-muted text-center text-nowrap" style="width: 12%;">Score / Items</th>
                                    <th class="px-3 py-3 text-muted text-center text-nowrap" style="width: 10%;">Accuracy</th>
                                    <th class="px-3 py-3 text-muted text-center text-nowrap" style="width: 13%;">Diagnostic Result</th>
                                    <th class="px-3 py-3 text-muted text-nowrap" style="width: 15%;">Remarks</th>
                                </tr>
                            </thead>
                            <tbody id="assessmentReportTableBody">
                                <tr>
                                    <td colspan="7" class="text-center text-muted py-5">
                                        <i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>
                                        Loading assessment report records...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Print-Only Signature Section -->
                <div class="print-only-header mt-5 pt-4">
                    <div class="row text-center">
                        <div class="col-6">
                            <div style="border-top: 1px solid #000; width: 75%; margin: 40px auto 5px auto;"></div>
                            <strong class="d-block">Assessing Teacher / Proposer</strong>
                            <small class="text-muted">Grade 6 English Department</small>
                        </div>
                        <div class="col-6">
                            <div style="border-top: 1px solid #000; width: 75%; margin: 40px auto 5px auto;"></div>
                            <strong class="d-block">School Head / Academic Coordinator</strong>
                            <small class="text-muted">Curriculum Assessment Division</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Firebase SDK Setup -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    <script src="<?php echo $base; ?>backend/config/firebase.js"></script>

    <!-- Main and Assessment Reporting script -->
    <script src="<?php echo $base; ?>assets/js/main.js?v=<?php echo time(); ?>"></script>
    <script src="<?php echo $base; ?>assets/js/assessment_reporting.js?v=<?php echo time(); ?>"></script>
</body>
</html>

