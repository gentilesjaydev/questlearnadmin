<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Admin Hub - QuestLearn</title>
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
                
                <!-- Page Header -->
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-3">
                            <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold border border-primary border-opacity-25">
                                <i class="fa-solid fa-shield-halved me-1"></i> Master Control Panel
                            </span>
                            <div id="systemStatusBadge">
                                <span class="badge bg-secondary bg-opacity-10 text-secondary border px-3 py-1.5 rounded-pill">
                                    <i class="fa-solid fa-circle-notch fa-spin me-1"></i> Checking...
                                </span>
                            </div>
                        </div>
                        <h2 class="fw-bolder mb-1" style="color: var(--text-main); letter-spacing: -1.5px; font-size: 2.2rem;">Super Admin Hub</h2>
                        <p class="text-muted" style="font-size: 1.05rem; font-weight: 500;">High-level institutional management, teacher allocation, and platform access control.</p>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        <a href="teachers" class="btn btn-primary px-3 py-2 rounded-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2">
                            <i class="fa-solid fa-user-plus"></i> Manage Teachers
                        </a>
                        <a href="schools" class="btn btn-outline-primary px-3 py-2 rounded-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2">
                            <i class="fa-solid fa-school"></i> Schools & Sections
                        </a>
                        <a href="<?php echo $base; ?>index" class="btn btn-light border px-3 py-2 rounded-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2">
                            <i class="fa-solid fa-chart-line"></i> Dashboard Overview
                        </a>
                    </div>
                </div>
                
                <!-- Live Administrative Metrics Grid -->
                <div class="row g-4 mb-5">
                    <div class="col-xl-3 col-md-6">
                        <a href="teachers" class="text-decoration-none">
                            <div class="card dashboard-card p-4 h-100 border-top border-4 border-primary">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <div class="icon-box icon-purple"><i class="fa-solid fa-chalkboard-user"></i></div>
                                    <span class="badge bg-primary bg-opacity-10 text-primary fw-semibold rounded-pill px-2.5 py-1 small">Faculty</span>
                                </div>
                                <h3 class="stat-value mb-1" id="activeTeachersStat">0</h3>
                                <span class="stat-label">Active Teachers</span>
                            </div>
                        </a>
                    </div>
                    <div class="col-xl-3 col-md-6">
                        <a href="schools" class="text-decoration-none">
                            <div class="card dashboard-card p-4 h-100 border-top border-4 border-success">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <div class="icon-box icon-green"><i class="fa-solid fa-school"></i></div>
                                    <span class="badge bg-success bg-opacity-10 text-success fw-semibold rounded-pill px-2.5 py-1 small">Campuses</span>
                                </div>
                                <h3 class="stat-value mb-1" id="totalSchoolsStat">0</h3>
                                <span class="stat-label">Registered Schools</span>
                            </div>
                        </a>
                    </div>
                    <div class="col-xl-3 col-md-6">
                        <a href="schools" class="text-decoration-none">
                            <div class="card dashboard-card p-4 h-100 border-top border-4 border-warning">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <div class="icon-box icon-orange"><i class="fa-solid fa-layer-group"></i></div>
                                    <span class="badge bg-warning bg-opacity-10 text-warning fw-semibold rounded-pill px-2.5 py-1 small">Grade 6</span>
                                </div>
                                <h3 class="stat-value mb-1" id="totalSectionsStat">0</h3>
                                <span class="stat-label">Class Sections</span>
                            </div>
                        </a>
                    </div>
                    <div class="col-xl-3 col-md-6">
                        <a href="<?php echo $base; ?>pages/teacher/students" class="text-decoration-none">
                            <div class="card dashboard-card p-4 h-100 border-top border-4 border-info">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <div class="icon-box icon-blue"><i class="fa-solid fa-user-graduate"></i></div>
                                    <span class="badge bg-info bg-opacity-10 text-info fw-semibold rounded-pill px-2.5 py-1 small">Learners</span>
                                </div>
                                <h3 class="stat-value mb-1" id="totalStudentsStat">0</h3>
                                <span class="stat-label">Enrolled Students</span>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- Two-Column Operational Layout -->
                <div class="row g-4 mb-5">
                    <!-- Left Column: Faculty & Teacher Accounts -->
                    <div class="col-lg-7">
                        <div class="card dashboard-card p-0 shadow-sm border overflow-hidden h-100">
                            <div class="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-chalkboard-user text-primary me-2"></i> Faculty Roster</h5>
                                    <small class="text-muted">Registered teachers and section assignments</small>
                                </div>
                                <a href="teachers" class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold">
                                    View All <i class="fa-solid fa-arrow-right ms-1"></i>
                                </a>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover mb-0 align-middle">
                                    <thead class="bg-light">
                                        <tr>
                                            <th class="px-4 py-3 text-muted text-nowrap">Teacher</th>
                                            <th class="px-4 py-3 text-muted text-nowrap">Assigned Campus</th>
                                            <th class="px-4 py-3 text-muted text-nowrap">Class Scope</th>
                                            <th class="px-4 py-3 text-muted text-center text-nowrap">Status</th>
                                            <th class="px-4 py-3 text-muted text-end text-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="teachersRosterBody">
                                        <tr>
                                            <td colspan="5" class="text-center py-4 text-muted">
                                                <i class="fa-solid fa-circle-notch fa-spin me-2 text-primary"></i> Loading faculty data...
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Institutional Campuses -->
                    <div class="col-lg-5">
                        <div class="card dashboard-card p-0 shadow-sm border overflow-hidden h-100">
                            <div class="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-building-columns text-primary me-2"></i> Deployed Campuses</h5>
                                    <small class="text-muted">Schools participating in gamified testing</small>
                                </div>
                                <a href="schools" class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold">
                                    Manage <i class="fa-solid fa-arrow-right ms-1"></i>
                                </a>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover mb-0 align-middle">
                                    <thead class="bg-light">
                                        <tr>
                                            <th class="px-4 py-3 text-muted text-nowrap">School Campus</th>
                                            <th class="px-4 py-3 text-muted text-nowrap">Division</th>
                                            <th class="px-4 py-3 text-muted text-center text-nowrap">Faculty</th>
                                            <th class="px-4 py-3 text-muted text-end text-nowrap"></th>
                                        </tr>
                                    </thead>
                                    <tbody id="schoolsOverviewBody">
                                        <tr>
                                            <td colspan="4" class="text-center py-4 text-muted">
                                                <i class="fa-solid fa-circle-notch fa-spin me-2 text-primary"></i> Loading schools...
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- System Governance & Security Architecture -->
                <div class="card dashboard-card p-4 border-start border-4 border-primary">
                    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <h5 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-shield-virus text-primary me-2"></i> Role-Based Access Control (RBAC) Governance</h5>
                                <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1 small">
                                    <i class="fa-solid fa-lock me-1"></i> Strict Scoping Active
                                </span>
                            </div>
                            <p class="text-muted small mb-0">
                                Teachers are restricted exclusively to their assigned Grade 6 section's student roster and analytics. System administrators possess global multi-campus visibility across Davao City divisions.
                            </p>
                        </div>
                        <div class="text-md-end text-nowrap">
                            <small class="text-muted d-block">Master Administrator</small>
                            <span class="fw-bold text-primary" id="currentAdminEmail">Loading Admin...</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <!-- Firebase SDK Compat -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    <script src="<?php echo $base; ?>backend/config/firebase.js"></script>
    
    <script src="<?php echo $base; ?>assets/js/main.js?v=<?php echo time(); ?>"></script>
    <script src="<?php echo $base; ?>assets/js/admin_dashboard.js?v=<?php echo time(); ?>"></script>
</body>
</html>
