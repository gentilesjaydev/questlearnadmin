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
                <div class="mb-5">
                    <h2 class="fw-bolder mb-1" style="color: var(--text-main); letter-spacing: -1.5px; font-size: 2.2rem;">Super Admin Hub</h2>
                    <p class="text-muted" style="font-size: 1.05rem; font-weight: 500;">High-level system management and user access control.</p>
                </div>
                
                <div class="row g-4 mb-5">
                    <div class="col-xl-4 col-md-6">
                        <div class="card dashboard-card p-4 h-100">
                            <div class="d-flex align-items-center">
                                <div class="icon-box icon-purple me-4"><i class="fa-solid fa-chalkboard-user"></i></div>
                                <div><h3 class="stat-value mb-1" id="activeTeachersStat">0</h3><span class="stat-label">Active Teachers</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-md-6">
                        <div class="card dashboard-card p-4 h-100">
                            <div class="d-flex align-items-center">
                                <div class="icon-box icon-green me-4"><i class="fa-solid fa-server"></i></div>
                                <div><h3 class="stat-value mb-1" id="systemUptimeStat">-</h3><span class="stat-label">System Uptime</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-md-6">
                        <div class="card dashboard-card p-4 h-100">
                            <div class="d-flex align-items-center">
                                <div class="icon-box icon-orange me-4"><i class="fa-solid fa-shield-halved"></i></div>
                                <div><h3 class="stat-value mb-1" id="adminsOnlineStat">0</h3><span class="stat-label">Admins Online</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card dashboard-card p-4 border-start border-4" style="border-color: var(--primary-color) !important;">
                    <h5 class="fw-bold mb-4" style="color: var(--text-main); font-size: 1.25rem;">System Alerts</h5>
                    <div class="text-muted"><i class="fa-solid fa-check-circle me-2 text-success"></i> No active system alerts at this time.</div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="<?php echo $base; ?>assets/js/main.js?v=<?php echo time(); ?>"></script>
</body>
</html>
