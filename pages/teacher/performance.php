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
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="fw-bolder mb-1" style="color: var(--text-main); letter-spacing: -1.5px; font-size: 2.2rem;">Performance Analytics</h2>
                        <p class="text-muted" style="font-size: 1.05rem; font-weight: 500;">Deep dive into student gamification metrics and progress.</p>
                    </div>
                    <div>
                        <button id="aiInsightsBtn" class="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-bold">
                            <i class="fa-solid fa-wand-magic-sparkles me-2"></i> Generate AI Insights
                        </button>
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
                        <div class="card border-0 shadow-sm rounded-4 h-100">
                            <div class="card-body p-4">
                                <h6 class="fw-bold text-muted mb-4 text-uppercase">Class Accuracy Distribution</h6>
                                <canvas id="classAccuracyChart" height="100"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card border-0 shadow-sm rounded-4 h-100">
                            <div class="card-body p-4 text-center">
                                <h6 class="fw-bold text-muted mb-4 text-uppercase">Overall Class Performance</h6>
                                <canvas id="overallPieChart" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Insights Container -->
                <div id="aiInsightsResult" class="d-none bg-white p-4 rounded-4 shadow-sm border border-light mb-4">
                    <!-- AI Content injected here -->
                </div>

                <!-- Student Leaderboard / Analytics Table -->
                <div class="card border-0 shadow-sm rounded-4">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="bg-light">
                                    <tr>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Student Name</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Current Level</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Total XP</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Health (HP)</th>
                                        <th class="px-4 py-3 text-muted small text-uppercase fw-bold border-bottom-0">Accuracy Rate</th>
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

    <!-- Student Analytics Modal -->
    <div class="modal fade" id="studentAnalyticsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header bg-light border-0">
                    <h5 class="modal-title fw-bold" id="studentModalTitle">Student Analysis</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="row mb-4">
                        <div class="col-md-6 text-center">
                            <canvas id="studentPieChart" height="200"></canvas>
                        </div>
                        <div class="col-md-6 d-flex flex-column justify-content-center">
                            <h4 id="studentNameDisplay" class="fw-bolder mb-3 text-dark"></h4>
                            <div class="d-flex align-items-center mb-2">
                                <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill me-2" id="studentLevelDisplay"></span>
                                <span class="text-success fw-bold me-2" id="studentXpDisplay"></span>
                                <span class="fw-bold" id="studentHpDisplay"></span>
                            </div>
                            <p class="text-muted small mt-2">Generate a personalized AI insight to understand this student's specific pain points and strengths.</p>
                            <button id="studentAiBtn" class="btn btn-outline-primary fw-bold mt-2 align-self-start">
                                <i class="fa-solid fa-brain me-2"></i> Analyze Student
                            </button>
                        </div>
                    </div>
                    <div id="studentAiResult" class="bg-light p-3 rounded-3 d-none" style="font-size: 0.9rem; line-height: 1.6;">
                        <!-- Student AI Insight Here -->
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
