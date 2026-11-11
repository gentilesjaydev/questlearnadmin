<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Competency Tracking - QuestLearn</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="<?php echo $base; ?>assets/css/style.css?v=<?php echo time(); ?>">
    <link rel="icon" type="image/png" href="<?php echo $base; ?>assets/images/logo.png">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
    <div class="d-flex">
        <?php include $base . 'includes/components/sidebar.php'; ?>
        <div id="content">
            <?php include $base . 'includes/components/navbar.php'; ?>
            
            <div class="container-fluid px-3 px-md-4 py-4">
                <!-- Header -->
                <div class="row align-items-center mb-4 gy-3">
                    <div class="col-12 col-xl-6">
                        <div class="d-flex align-items-center gap-2 gap-sm-3 flex-wrap">
                            <h2 class="fw-bolder mb-0" style="color: var(--text-main); letter-spacing: -1px; font-size: 1.85rem;">Competency Tracking</h2>
                            <span id="competencyCountBadge" class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1.5 rounded-pill fw-bold small">
                                <i class="fa-solid fa-award me-1"></i> NATG6 Standardized
                            </span>
                        </div>
                        <p class="text-muted mb-0 mt-1 small" style="font-weight: 500;">
                            <i class="fa-solid fa-circle-check text-success me-1.5"></i> Track student mastery across core language competencies, assessment scores, and progress statuses.
                        </p>
                    </div>
                    <div class="col-12 col-xl-6">
                        <div class="d-flex flex-wrap justify-content-xl-end align-items-center gap-2">
                            <!-- Class Section Filter -->
                            <div class="input-group" style="width: auto; min-width: 170px;">
                                <span class="input-group-text bg-light border" style="border-radius: 10px 0 0 10px;">
                                    <i class="fa-solid fa-layer-group text-primary"></i>
                                </span>
                                <select id="compSectionSelect" class="form-select border" style="border-radius: 0 10px 10px 0; font-weight: 600; font-size: 0.88rem;">
                                    <option value="ALL">All Grade 6 Sections</option>
                                </select>
                            </div>

                            <!-- Status Filter -->
                            <div class="input-group" style="width: auto; min-width: 160px;">
                                <span class="input-group-text bg-light border" style="border-radius: 10px 0 0 10px;">
                                    <i class="fa-solid fa-filter text-muted"></i>
                                </span>
                                <select id="compStatusFilter" class="form-select border" style="border-radius: 0 10px 10px 0; font-weight: 600; font-size: 0.88rem;">
                                    <option value="ALL">All Statuses</option>
                                    <option value="Competent">Competent (≥ 75%)</option>
                                    <option value="In Progress">In Progress (60 - 74%)</option>
                                    <option value="Needs Improvement">Needs Improvement (50 - 59%)</option>
                                    <option value="Not Yet Competent">Not Yet Competent (< 50%)</option>
                                    <option value="Not Started">Not Started</option>
                                </select>
                            </div>

                            <!-- Search Input -->
                            <div class="input-group flex-grow-1 flex-md-grow-0" style="min-width: 180px; max-width: 220px;">
                                <span class="input-group-text bg-light border" style="border-radius: 10px 0 0 10px;">
                                    <i class="fa-solid fa-magnifying-glass text-muted"></i>
                                </span>
                                <input type="text" id="compSearchInput" class="form-control border" placeholder="Search learner..." style="border-radius: 0 10px 10px 0; font-weight: 500; font-size: 0.88rem;">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Competency KPI Status Cards -->
                <div class="row g-3 mb-4">
                    <div class="col-6 col-lg-2">
                        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white border-top border-primary border-3">
                            <small class="text-muted fw-bold text-uppercase" style="font-size: 0.7rem;">Total Assessed</small>
                            <h3 class="fw-bolder mb-0 mt-1 text-dark" id="statTotalStudents">0</h3>
                            <small class="text-muted" style="font-size: 0.72rem;">Grade 6 Learners</small>
                        </div>
                    </div>
                    <div class="col-6 col-lg-2">
                        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white border-top border-info border-3">
                            <small class="text-muted fw-bold text-uppercase" style="font-size: 0.7rem;">Competency Index</small>
                            <h3 class="fw-bolder mb-0 mt-1 text-info" id="statAvgAccuracy">0%</h3>
                            <small class="text-muted" style="font-size: 0.72rem;">Overall Cohort Avg</small>
                        </div>
                    </div>
                    <div class="col-6 col-lg-2">
                        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white border-top border-success border-3">
                            <div class="d-flex align-items-center justify-content-between">
                                <small class="text-success fw-bold text-uppercase" style="font-size: 0.7rem;">Competent</small>
                                <span class="badge bg-success bg-opacity-10 text-success rounded-pill" style="font-size: 0.65rem;">≥ 75%</span>
                            </div>
                            <h3 class="fw-bolder mb-0 mt-1 text-success" id="statCompetentCount">0</h3>
                            <small class="text-muted" id="statCompetentPct" style="font-size: 0.72rem;">0% of cohort</small>
                        </div>
                    </div>
                    <div class="col-6 col-lg-2">
                        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white border-top border-primary border-3">
                            <div class="d-flex align-items-center justify-content-between">
                                <small class="text-primary fw-bold text-uppercase" style="font-size: 0.7rem;">In Progress</small>
                                <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill" style="font-size: 0.65rem;">60-74%</span>
                            </div>
                            <h3 class="fw-bolder mb-0 mt-1 text-primary" id="statInProgressCount">0</h3>
                            <small class="text-muted" id="statInProgressPct" style="font-size: 0.72rem;">0% of cohort</small>
                        </div>
                    </div>
                    <div class="col-6 col-lg-2">
                        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white border-top border-warning border-3">
                            <div class="d-flex align-items-center justify-content-between">
                                <small class="text-warning fw-bold text-uppercase" style="font-size: 0.7rem;">Needs Imprv.</small>
                                <span class="badge bg-warning bg-opacity-10 text-dark rounded-pill" style="font-size: 0.65rem;">50-59%</span>
                            </div>
                            <h3 class="fw-bolder mb-0 mt-1 text-warning" id="statNeedsImprovementCount">0</h3>
                            <small class="text-muted" id="statNeedsImprovementPct" style="font-size: 0.72rem;">0% of cohort</small>
                        </div>
                    </div>
                    <div class="col-6 col-lg-2">
                        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white border-top border-danger border-3">
                            <div class="d-flex align-items-center justify-content-between">
                                <small class="text-danger fw-bold text-uppercase" style="font-size: 0.7rem;">Not Yet Comp.</small>
                                <span class="badge bg-danger bg-opacity-10 text-danger rounded-pill" style="font-size: 0.65rem;">< 50%</span>
                            </div>
                            <h3 class="fw-bolder mb-0 mt-1 text-danger" id="statNotYetCompetentCount">0</h3>
                            <small class="text-muted" id="statNotYetCompetentPct" style="font-size: 0.72rem;">0% of cohort</small>
                        </div>
                    </div>
                </div>

                <!-- Competency Breakdown Chart Card -->
                <div class="card border-0 shadow-sm rounded-4 mb-4">
                    <div class="card-body p-4">
                        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
                            <div>
                                <h5 class="fw-bold text-dark mb-0">
                                    <i class="fa-solid fa-chart-column text-primary me-2"></i> Class Competency Mastery Across NATG6 Core Standards
                                </h5>
                                <small class="text-muted">Aggregated performance across 5 fundamental English competencies based on First-Attempt diagnostic records.</small>
                            </div>
                            <span class="badge bg-light text-muted border px-3 py-1.5 rounded-pill small">
                                <i class="fa-solid fa-bullseye text-primary me-1"></i> DepEd MPL Passing Standard: 60%
                            </span>
                        </div>
                        <div style="position: relative; height: 180px;">
                            <canvas id="classCompetencyBarChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Student Competency Tracking Table -->
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                            <h5 class="fw-bold text-dark mb-0">Student Competency Progress Matrix</h5>
                            <small class="text-muted">Individual mastery scores, diagnostic status badges, and recommended remediation remarks.</small>
                        </div>
                        <span id="filteredStudentCount" class="badge bg-light text-dark border px-3 py-1.5 rounded-pill small fw-bold">Showing 0 learners</span>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th class="px-3 py-3 text-muted text-nowrap" style="width: 20%;">Student Name</th>
                                    <th class="px-3 py-3 text-muted text-nowrap" style="width: 14%;">Linguistic Prof.</th>
                                    <th class="px-3 py-3 text-muted text-nowrap" style="width: 14%;">Comprehension</th>
                                    <th class="px-3 py-3 text-muted text-nowrap" style="width: 14%;">Critical Thinking</th>
                                    <th class="px-3 py-3 text-muted text-nowrap" style="width: 14%;">Info Literacy</th>
                                    <th class="px-3 py-3 text-muted text-center text-nowrap" style="width: 10%;">Score</th>
                                    <th class="px-3 py-3 text-muted text-center text-nowrap" style="width: 14%;">Status</th>
                                    <th class="px-3 py-3 text-muted text-end text-nowrap" style="width: 10%;">Details</th>
                                </tr>
                            </thead>
                            <tbody id="competencyTableBody">
                                <tr>
                                    <td colspan="8" class="text-center text-muted py-5">
                                        <i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>
                                        Loading student competency telemetry...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Student Detail Competency Modal -->
    <div class="modal fade" id="studentDetailModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header bg-light border-0 px-4 py-3">
                    <div>
                        <h5 class="modal-title fw-bold text-dark mb-0" id="detailModalName">Student Competency Breakdown</h5>
                        <small class="text-muted" id="detailModalSection">Grade 6</small>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="row g-4 mb-4">
                        <div class="col-md-5 text-center">
                            <div style="position: relative; height: 210px;">
                                <canvas id="detailModalRadarChart"></canvas>
                            </div>
                        </div>
                        <div class="col-md-7">
                            <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                <span class="badge px-3 py-1.5 rounded-pill fw-bold" id="detailModalStatusBadge">Status</span>
                                <span class="badge bg-light text-dark border px-3 py-1.5 rounded-pill fw-bold" id="detailModalScoreBadge">0% Accuracy</span>
                            </div>
                            <h6 class="fw-bold text-dark mt-3 mb-1">Diagnostic Remarks & Assessment Feedback:</h6>
                            <p class="text-muted small mb-3" id="detailModalRemarks" style="line-height: 1.6;">No remarks available.</p>
                            
                            <div class="p-3 bg-light rounded-3 border small">
                                <div class="fw-bold text-dark mb-1"><i class="fa-solid fa-shield-halved text-primary me-1"></i> Assessment Telemetry Basis</div>
                                <div class="text-muted">Total Questions Attempted: <strong id="detailTotalAnswers" class="text-dark">0</strong> | Correct: <strong id="detailCorrectAnswers" class="text-success">0</strong> | Wrong: <strong id="detailWrongAnswers" class="text-danger">0</strong></div>
                            </div>
                        </div>
                    </div>

                    <h6 class="fw-bold text-dark mb-3 text-uppercase small"><i class="fa-solid fa-list-check text-primary me-1.5"></i> Detailed Competency Scores</h6>
                    <div id="detailCompetencyBars" class="d-flex flex-column gap-2">
                        <!-- Injected by JS -->
                    </div>
                </div>
                <div class="modal-footer bg-light border-0 px-4 py-3">
                    <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Close</button>
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

    <!-- Main script and Competency Tracking script -->
    <script src="<?php echo $base; ?>assets/js/main.js?v=<?php echo time(); ?>"></script>
    <script src="<?php echo $base; ?>assets/js/competency_tracking.js?v=<?php echo time(); ?>"></script>
</body>
</html>

