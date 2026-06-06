<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Settings - QuestLearn</title>
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
                        <h2 class="fw-bolder mb-1" style="color: var(--text-main); letter-spacing: -1.5px; font-size: 2.2rem;">System Settings</h2>
                        <p class="text-muted" style="font-size: 1.05rem; font-weight: 500;">Configure global application parameters and security constraints.</p>
                    </div>
                </div>
                
                <div class="row g-4 mb-4">
                    <div class="col-12">
                        <div class="dashboard-card p-5 text-center">
                            <i class="fa-solid fa-server fa-4x text-muted opacity-50 mb-4"></i>
                            <h3 class="fw-bolder" style="color: var(--text-main); font-size: 1.8rem;">Configuration Panel Restricted</h3>
                            <p class="text-muted mx-auto" style="max-width: 500px; font-size: 1.05rem; line-height: 1.6;">System Settings are currently locked by the master administrator. Configuration requires command-line access or deployment via the CI/CD pipeline to ensure stability.</p>
                            <a href="<?php echo $base; ?>pages/admin/dashboard" class="btn btn-primary mt-3 px-4 py-2">Return to Admin Dashboard</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="<?php echo $base; ?>assets/js/main.js?v=<?php echo time(); ?>"></script>
</body>
</html>
