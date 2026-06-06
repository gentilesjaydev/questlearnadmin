<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Teachers - QuestLearn</title>
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
                        <h2 class="fw-bolder mb-1" style="color: var(--text-main); letter-spacing: -1.5px; font-size: 2.2rem;">Manage Teachers</h2>
                        <p class="text-muted" style="font-size: 1.05rem; font-weight: 500;">Add, remove, or modify teacher accounts and permissions.</p>
                    </div>
                    <button id="registerTeacherBtn" class="btn btn-primary px-4 py-2">
                        <i class="fa-solid fa-user-plus me-2"></i> Register Teacher
                    </button>
                </div>
                
                <div class="card dashboard-card p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 align-middle">
                            <thead class="bg-light">
                                <tr>
                                    <th class="px-4 py-3 text-muted">Teacher Name</th>
                                    <th class="px-4 py-3 text-muted">Email Address</th>
                                    <th class="px-4 py-3 text-muted">Assigned Dept.</th>
                                    <th class="px-4 py-3 text-muted">Account Status</th>
                                    <th class="px-4 py-3 text-muted text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="teachersTableBody">
                                <tr>
                                    <td colspan="5" class="text-center py-5 text-muted">
                                        <i class="fa-solid fa-users-slash fa-2x mb-3 text-opacity-50"></i>
                                        <p class="mb-0">No teachers registered yet.</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Firebase SDK Setup -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    <script src="<?php echo $base; ?>backend/config/firebase.js"></script>
    
    <script src="<?php echo $base; ?>assets/js/main.js?v=<?php echo time(); ?>"></script>
    <script src="<?php echo $base; ?>assets/js/teachers.js?v=<?php echo time(); ?>"></script>
</body>
</html>
