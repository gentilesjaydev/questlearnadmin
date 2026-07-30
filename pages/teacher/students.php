<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Roster - QuestLearn</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="<?php echo $base; ?>assets/css/style.css?v=<?php echo time(); ?>">
    <link rel="icon" type="image/png" href="<?php echo $base; ?>assets/images/logo.png">
</head>
<body>
    <div class="d-flex">
        <?php include $base . 'includes/components/sidebar.php'; ?>
        <div id="content">
            <?php include $base . 'includes/components/navbar.php'; ?>
            <div class="container-fluid p-4 p-md-5">
                <div class="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 class="fw-bolder mb-1" style="color: var(--text-main); letter-spacing: -1.5px; font-size: 2.2rem;">Student Management</h2>
                        <p class="text-muted mb-0" style="font-size: 1.05rem; font-weight: 500;"><i class="fa-solid fa-circle-dot text-success me-2"></i> Live connection to Firebase database</p>
                    </div>
                    <div class="d-flex gap-3">
                        <input type="text" class="form-control" placeholder="Search by name or ID..." style="border-radius: 12px; width: 250px; border: 2px solid var(--card-border); background-color: var(--bg-light); color: var(--text-main); font-weight: 500;">
                        <button class="btn btn-primary px-4">
                            Search
                        </button>
                    </div>
                </div>
                
                <div class="card dashboard-card p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 align-middle">
                            <thead class="bg-light">
                                <tr>
                                    <th class="px-4 py-3 text-muted">Student Name</th>
                                    <th class="px-4 py-3 text-muted">Gamification Rank</th>
                                    <th class="px-4 py-3 text-muted">Total XP</th>
                                    <th class="px-4 py-3 text-muted text-end">Profile Details</th>
                                </tr>
                            </thead>
                            <!-- This body is dynamically injected with Firebase data -->
                            <tbody id="studentTableBody">
                            </tbody>
                        </table>
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
                                    <span class="fw-bold text-danger" id="studentHpDisplay"></span>
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
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="<?php echo $base; ?>assets/js/main.js?v=<?php echo time(); ?>"></script>

    <!-- Firebase SDK Setup -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    
    <!-- Config and Real-time Fetch Logic -->
    <script src="<?php echo $base; ?>backend/config/firebase.js"></script>
    <script src="<?php echo $base; ?>assets/js/students.js?v=<?php echo time(); ?>"></script>
</body>
</html>
