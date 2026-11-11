<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Account Management - QuestLearn</title>
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
            <div class="container-fluid px-3 px-md-4 py-4">
                <div class="row align-items-center mb-4 gy-3">
                    <div class="col-12 col-xl-5">
                        <div class="d-flex align-items-center gap-2 gap-sm-3 flex-wrap">
                            <h2 class="fw-bolder mb-0" style="color: var(--text-main); letter-spacing: -1px; font-size: 1.85rem;">Student Account Management</h2>
                            <span id="studentCountBadge" class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1.5 rounded-pill fw-bold small">
                                <i class="fa-solid fa-users me-1"></i> Syncing...
                            </span>
                        </div>
                        <p class="text-muted mb-0 mt-1 small" style="font-weight: 500;"><i class="fa-solid fa-circle-dot text-success me-1.5"></i> Manage learner accounts, NATG6 section assignments, and diagnostic telemetry</p>
                    </div>
                    <div class="col-12 col-xl-7">
                        <div class="d-flex flex-wrap justify-content-xl-end align-items-center gap-2">
                            <!-- Class Section Filter Dropdown -->
                            <div class="input-group" style="width: auto; min-width: 175px;">
                                <span class="input-group-text bg-light border" style="border-radius: 10px 0 0 10px;">
                                    <i class="fa-solid fa-layer-group text-primary"></i>
                                </span>
                                <select id="sectionFilterSelect" class="form-select border" style="border-radius: 0 10px 10px 0; font-weight: 600; font-size: 0.88rem;">
                                    <option value="ALL">All Grade 6 Sections</option>
                                </select>
                            </div>

                            <!-- Live Search Input -->
                            <div class="input-group flex-grow-1 flex-md-grow-0" style="min-width: 190px; max-width: 250px;">
                                <span class="input-group-text bg-light border" style="border-radius: 10px 0 0 10px;">
                                    <i class="fa-solid fa-magnifying-glass text-muted"></i>
                                </span>
                                <input type="text" id="studentSearchInput" class="form-control border" placeholder="Search students..." style="border-radius: 0 10px 10px 0; font-weight: 500; font-size: 0.88rem;">
                            </div>

                            <!-- Register New Student Button -->
                            <button class="btn btn-primary px-3 rounded-3 fw-bold d-inline-flex align-items-center gap-2 shadow-sm text-nowrap" data-bs-toggle="modal" data-bs-target="#registerStudentModal" id="openRegisterBtn" style="font-size: 0.88rem; padding-top: 0.55rem; padding-bottom: 0.55rem;">
                                <i class="fa-solid fa-user-plus"></i> Register Student
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="card dashboard-card p-0 shadow-sm border overflow-hidden">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 align-middle">
                            <thead class="bg-light">
                                <tr>
                                    <th class="px-3 py-3 text-muted text-nowrap">Student Name</th>
                                    <th class="px-3 py-3 text-muted text-nowrap">Grade 6 Section</th>
                                    <th class="px-3 py-3 text-muted text-nowrap">Gamification Rank</th>
                                    <th class="px-3 py-3 text-muted text-nowrap">Recent Play Attempt</th>
                                    <th class="px-3 py-3 text-muted text-nowrap">Total XP</th>
                                    <th class="px-3 py-3 text-muted text-end text-nowrap" style="min-width: 120px;">Actions</th>
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

    <!-- Register New Student Modal (FR 1) -->
    <div class="modal fade" id="registerStudentModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header bg-light border-0 px-4 py-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-10 text-primary p-2.5 rounded-3 me-3">
                            <i class="fa-solid fa-user-plus fa-lg"></i>
                        </div>
                        <div>
                            <h5 class="modal-title fw-bold mb-0 text-dark">Register New Student</h5>
                            <small class="text-muted">Create a learner account with NATG6 class section assignment</small>
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeRegisterModalBtn"></button>
                </div>
                <form id="registerStudentForm">
                    <div class="modal-body p-4">
                        <div id="registerErrorAlert" class="alert alert-danger d-none rounded-3 py-2 px-3 small mb-3">
                            <i class="fa-solid fa-triangle-exclamation me-1"></i> <span id="registerErrorMsg"></span>
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label class="form-label text-muted small fw-bold mb-1">First Name <span class="text-danger">*</span></label>
                                <input type="text" id="regFirstName" class="form-control" placeholder="e.g. Juan" required style="border-radius: 10px;">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-muted small fw-bold mb-1">Last Name <span class="text-danger">*</span></label>
                                <input type="text" id="regLastName" class="form-control" placeholder="e.g. Dela Cruz" required style="border-radius: 10px;">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold mb-1">Email Address <span class="text-danger">*</span></label>
                            <input type="email" id="regEmail" class="form-control" placeholder="e.g. juan.delacruz@school.edu.ph" required style="border-radius: 10px;">
                            <small class="text-muted" style="font-size: 0.75rem;">Used for mobile app login credentials.</small>
                        </div>

                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold mb-1">Password <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <input type="password" id="regPassword" class="form-control" placeholder="Minimum 6 characters" minlength="6" required style="border-radius: 10px 0 0 10px;">
                                <button class="btn btn-outline-secondary" type="button" id="toggleRegPassword" style="border-radius: 0 10px 10px 0;">
                                    <i class="fa-solid fa-eye" id="toggleRegPasswordIcon"></i>
                                </button>
                            </div>
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-md-5">
                                <label class="form-label text-muted small fw-bold mb-1">Grade Level</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border"><i class="fa-solid fa-graduation-cap text-primary"></i></span>
                                    <input type="text" id="regGrade" class="form-control bg-light fw-bold text-dark" value="Grade 6" readonly style="border-radius: 0 10px 10px 0;">
                                </div>
                                <small class="text-muted" style="font-size: 0.72rem;">NATG6 Target Cohort</small>
                            </div>
                            <div class="col-md-7">
                                <label class="form-label text-muted small fw-bold mb-1">Class Section <span class="text-danger">*</span></label>
                                <select id="regSectionSelect" class="form-select" style="border-radius: 10px;" required>
                                    <option value="" disabled selected>Select Section...</option>
                                    <option value="Acacia">Acacia</option>
                                    <option value="Mabini">Mabini</option>
                                    <option value="Rizal">Rizal</option>
                                    <option value="Custom">+ Type custom section</option>
                                </select>
                                <input type="text" id="regSectionCustom" class="form-control mt-2 d-none" placeholder="Enter section name..." style="border-radius: 10px;">
                            </div>
                        </div>

                        <div class="p-3 bg-light rounded-3 border small text-muted">
                            <div class="d-flex align-items-center mb-1 text-primary fw-bold">
                                <i class="fa-solid fa-shield-halved me-1.5"></i> Gamification Baseline
                            </div>
                            Starting baseline: <strong>Level 1</strong>, <strong>0 XP</strong>, <strong>❤️ 100/100 HP</strong>. Initial test attempts are automatically tracked as immutable NATG6 baseline telemetry.
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0 px-4 py-3">
                        <button type="button" class="btn btn-light rounded-pill px-4 fw-medium" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" id="submitRegisterBtn">
                            <i class="fa-solid fa-circle-check me-1.5"></i> Create Student Account
                        </button>
                    </div>
                </form>
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
                        <button class="btn btn-link nav-link fw-bold text-muted pb-2 me-4" id="modal-tab-skills" onclick="switchModalTab('skills')" style="text-decoration: none; border-radius: 0; border: none; background: none;">Cognitive & Skills Breakdown</button>
                        <button class="btn btn-link nav-link fw-bold text-muted pb-2" id="modal-tab-history" onclick="switchModalTab('history')" style="text-decoration: none; border-radius: 0; border: none; background: none;"><i class="fa-solid fa-clock-rotate-left me-1.5"></i> Play Attempt History</button>
                    </div>

                    <div id="modal-content-overview">
                        <div class="row mb-4">
                            <div class="col-md-6 text-center">
                                <canvas id="studentPieChart" height="200"></canvas>
                            </div>
                            <div class="col-md-6 d-flex flex-column justify-content-center">
                                <h4 id="studentNameDisplay" class="fw-bolder mb-3 text-dark"></h4>
                                <div class="d-flex align-items-center mb-2 flex-wrap gap-2">
                                    <span class="badge bg-light text-dark border px-3 py-2 rounded-pill me-2" id="studentClassDisplay"><i class="fa-solid fa-graduation-cap me-1 text-primary"></i> Grade 6</span>
                                    <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill me-2" id="studentLevelDisplay"></span>
                                    <span class="text-success fw-bold me-2" id="studentXpDisplay"></span>
                                    <span class="fw-bold text-danger" id="studentHpDisplay"></span>
                                </div>
                                <div class="d-flex align-items-center mb-2 flex-wrap gap-2">
                                    <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 rounded-pill small" id="studentAttemptBadge"><i class="fa-solid fa-bookmark me-1"></i>1st Attempt Diagnostic</span>
                                    <span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2.5 py-1 rounded-pill small" id="studentRetriesBadge"><i class="fa-solid fa-rotate-right me-1"></i><span id="studentRetriesCount">0</span> Practice Retries</span>
                                </div>

                                <!-- Recent Play Attempt Display in Modal -->
                                <div class="p-3 rounded-3 bg-light border my-2">
                                    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <div>
                                            <small class="text-muted text-uppercase fw-bold" style="font-size:0.72rem;">
                                                <i class="fa-solid fa-clock-rotate-left text-primary me-1"></i> Most Recent Play Attempt
                                            </small>
                                            <div id="studentLastPlayedDisplay" class="fw-bold text-dark mt-0.5" style="font-size: 0.95rem;">
                                                <!-- Exact Date & Time injected here -->
                                            </div>
                                        </div>
                                        <span id="studentLastPlayedTimeAgo" class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1.5 rounded-pill small fw-bold"></span>
                                    </div>
                                </div>

                                <p class="text-muted small mt-2">Generate a personalized AI insight to understand this student's specific pain points and strengths.</p>
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

                    <!-- Play Attempt History Tab -->
                    <div id="modal-content-history" class="d-none">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h6 class="fw-bold text-dark mb-0"><i class="fa-solid fa-clock-rotate-left text-primary me-2"></i>Play & Assessment Session Log</h6>
                                <small class="text-muted">Chronological record of gameplay sessions, quiz completions, and timestamps</small>
                                <div class="d-flex align-items-center gap-2 mt-1.5 flex-wrap">
                                    <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5 rounded-pill" style="font-size:0.7rem;"><i class="fa-solid fa-bookmark me-1"></i>1st Attempt (Assessment Baseline)</span>
                                    <span class="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-0.5 rounded-pill" style="font-size:0.7rem;"><i class="fa-solid fa-rotate-right me-1"></i>Practice Replay (Excluded from Score)</span>
                                </div>
                            </div>
                            <span id="historyCountBadge" class="badge bg-light text-dark border px-3 py-1.5 rounded-pill small"></span>
                        </div>
                        <div class="table-responsive rounded-3 border" style="max-height: 380px; overflow-y: auto;">
                            <table class="table table-hover mb-0 align-middle small">
                                <thead class="bg-light sticky-top">
                                    <tr>
                                        <th class="px-3 py-2.5 text-muted text-nowrap">Exact Date & Time</th>
                                        <th class="px-3 py-2.5 text-muted text-nowrap">Quest / Floor Title</th>
                                        <th class="px-3 py-2.5 text-muted text-nowrap">Level / Mode</th>
                                        <th class="px-3 py-2.5 text-muted text-nowrap">Session Result</th>
                                        <th class="px-3 py-2.5 text-muted text-end text-nowrap">XP Earned</th>
                                        <th class="px-3 py-2.5 text-muted text-end text-nowrap">HP After</th>
                                    </tr>
                                </thead>
                                <tbody id="studentHistoryTableBody">
                                    <tr><td colspan="6" class="text-center text-muted py-4">Loading session history...</td></tr>
                                </tbody>
                            </table>
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
