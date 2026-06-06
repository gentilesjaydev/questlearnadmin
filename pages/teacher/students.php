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
    </div>
    
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
