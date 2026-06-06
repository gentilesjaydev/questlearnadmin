<?php $base = ''; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuestLearn - Teacher & Admin Dashboard</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="<?php echo $base; ?>assets/images/logo.png">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css?v=<?php echo time(); ?>">
    <link rel="icon" type="image/png" href="<?php echo $base; ?>assets/images/logo.png">
</head>
<body>

    <div class="d-flex">
        <!-- Sidebar -->
        <?php include 'includes/components/sidebar.php'; ?>

        <!-- Page Content -->
        <div id="content">
            <!-- Navbar -->
            <?php include 'includes/components/navbar.php'; ?>

            <!-- Main Container -->
            <div class="container-fluid p-4 p-md-5">
                
                <!-- Page Header -->
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 pb-3 border-bottom border-light gap-3">
                    <div>
                        <div class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold mb-3 border border-primary border-opacity-25">
                            <i class="fa-solid fa-bolt me-1"></i> Live Metrics
                        </div>
                        <h2 class="mb-2">Analytics Overview</h2>
                        <p class="text-muted mb-0">Monitor student performance and game engagement in real-time.</p>
                    </div>
                    <button onclick="generateReport()" class="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 shadow-sm">
                        <i class="fa-solid fa-cloud-arrow-down"></i> Download Report
                    </button>
                </div>

                <!-- Stats Grid -->
                <div class="row g-4 mb-5">
                    <div class="col-xl-3 col-md-6">
                        <div class="card dashboard-card h-100 p-4 border-top border-primary border-4">
                            <div class="d-flex justify-content-between align-items-start mb-4">
                                <div class="icon-box icon-purple">
                                    <i class="fa-solid fa-user-graduate"></i>
                                </div>
                                <span class="badge bg-success bg-opacity-10 text-success fw-bold"><i class="fa-solid fa-arrow-trend-up"></i> +4%</span>
                            </div>
                            <h3 class="stat-value" id="totalStudentsStat">0</h3>
                            <span class="stat-label">Total Students Enrolled</span>
                        </div>
                    </div>
                    <div class="col-xl-3 col-md-6">
                        <div class="card dashboard-card h-100 p-4 border-top border-success border-4">
                            <div class="d-flex justify-content-between align-items-start mb-4">
                                <div class="icon-box icon-green">
                                    <i class="fa-solid fa-star"></i>
                                </div>
                                <span class="badge bg-success bg-opacity-10 text-success fw-bold"><i class="fa-solid fa-arrow-trend-up"></i> +12%</span>
                            </div>
                            <h3 class="stat-value" id="avgCompletionStat">0 XP</h3>
                            <span class="stat-label">Average Student XP</span>
                        </div>
                    </div>
                    <div class="col-xl-3 col-md-6">
                        <div class="card dashboard-card h-100 p-4 border-top border-warning border-4">
                            <div class="d-flex justify-content-between align-items-start mb-4">
                                <div class="icon-box icon-orange">
                                    <i class="fa-solid fa-layer-group"></i>
                                </div>
                                <span class="badge bg-primary bg-opacity-10 text-primary fw-bold">Active</span>
                            </div>
                            <h3 class="stat-value" id="activeQuestsStat">0</h3>
                            <span class="stat-label">Game Categories Live</span>
                        </div>
                    </div>
                    <div class="col-xl-3 col-md-6">
                        <div class="card dashboard-card h-100 p-4 border-top border-danger border-4">
                            <div class="d-flex justify-content-between align-items-start mb-4">
                                <div class="icon-box icon-red">
                                    <i class="fa-solid fa-triangle-exclamation"></i>
                                </div>
                                <span class="badge bg-danger bg-opacity-10 text-danger fw-bold">Action Needed</span>
                            </div>
                            <h3 class="stat-value" id="atRiskStat">0</h3>
                            <span class="stat-label">At-Risk Students</span>
                        </div>
                    </div>
                </div>

                <!-- Main Data Dashboards -->
                <div class="row g-4 mb-4">
                    <!-- Leaderboard Chart -->
                    <div class="col-lg-8">
                        <div class="card dashboard-card h-100 p-4">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h5 class="mb-1">XP Leaderboard Tracker</h5>
                                    <p class="text-muted small mb-0">Top performing students across all modes</p>
                                </div>
                                <select class="form-select form-select-sm w-auto shadow-none text-muted fw-medium rounded-3">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                            <div class="p-2" style="position: relative; height: 320px; width: 100%;">
                                <canvas id="performanceChart"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Distribution Chart -->
                    <div class="col-lg-4">
                        <div class="card dashboard-card h-100 p-4">
                            <div class="mb-4">
                                <h5 class="mb-1">Class Level Distribution</h5>
                                <p class="text-muted small mb-0">Student breakdown by RPG level</p>
                            </div>
                            <div class="p-2" style="position: relative; height: 320px; width: 100%; display: flex; justify-content: center; align-items: center;">
                                <canvas id="distributionChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Secondary Data Row -->
                <div class="row g-4">
                    <!-- Engagement Chart -->
                    <div class="col-lg-8">
                        <div class="card dashboard-card h-100 p-4">
                            <div class="mb-4">
                                <h5 class="mb-1">Game Mode Engagement</h5>
                                <p class="text-muted small mb-0">Which categories students interact with most</p>
                            </div>
                            <div class="p-2" style="position: relative; height: 300px; width: 100%;">
                                <canvas id="engagementChart"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Live Feed -->
                    <div class="col-lg-4">
                        <div class="card dashboard-card h-100 p-0">
                            <div class="p-4 border-bottom border-light bg-light rounded-top">
                                <h5 class="mb-1">Live Database Activity</h5>
                                <p class="text-muted small mb-0">Real-time Firebase operations</p>
                            </div>
                            <div class="p-4 d-flex flex-column gap-3 overflow-auto" id="recentActivityFeed" style="height: 300px;">
                                <div class="text-center text-muted py-5 my-auto">
                                    <i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i>
                                    <p class="small fw-medium">Syncing data streams...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <!-- Firebase SDK Setup -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    <script src="backend/config/firebase.js"></script>
    
    <!-- Custom JS -->
    <script src="assets/js/main.js?v=<?php echo time(); ?>"></script>
    <script src="assets/js/dashboard.js?v=<?php echo time(); ?>"></script>
    
    <script>
        // SweetAlert function for the Report button
        function generateReport() {
            Swal.fire({
                title: 'Generating Report...',
                text: 'Compiling latest analytics data into PDF format.',
                icon: 'info',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                didClose: () => {
                    Toast.fire({
                        icon: 'success',
                        title: 'Report successfully downloaded!'
                    });
                }
            });
        }

    </script>
</body>
</html>
