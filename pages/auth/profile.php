<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuestLearn - Profile Settings</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="<?php echo $base; ?>assets/css/style.css?v=<?php echo time(); ?>">
    <link rel="icon" type="image/png" href="<?php echo $base; ?>assets/images/logo.png">
</head>
<body>

    <div class="d-flex">
        <!-- Sidebar -->
        <?php include '../../includes/components/sidebar.php'; ?>

        <!-- Page Content -->
        <div id="content">
            <!-- Navbar -->
            <?php include '../../includes/components/navbar.php'; ?>

            <!-- Main Container -->
            <div class="container-fluid p-4 p-md-5">
                
                <div class="mb-5">
                    <h2 class="fw-bold mb-1" style="color: var(--text-main); letter-spacing: -1px;">Profile Settings</h2>
                    <p class="text-muted mb-0" style="font-size: 1rem; font-weight: 500;">Manage your account details and security.</p>
                </div>

                <div class="row g-4">
                    <div class="col-lg-4">
                        <div class="card dashboard-card p-4 text-center h-100">
                            <div class="mb-4">
                                <img src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=120" class="rounded-circle shadow-sm" alt="Profile">
                            </div>
                            <h4 class="fw-bold mb-1" id="profileName">Loading...</h4>
                            <p class="text-muted mb-4 text-capitalize" id="profileRole">Role</p>
                            
                            <button class="btn btn-outline-primary w-100 mb-2">Upload Photo</button>
                            <button class="btn btn-light w-100 text-danger border-0">Remove Photo</button>
                        </div>
                    </div>
                    
                    <div class="col-lg-8">
                        <div class="card dashboard-card p-4 p-md-5 h-100">
                            <h5 class="fw-bold mb-4">Personal Information</h5>
                            
                            <form>
                                <div class="row g-3 mb-4">
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">First Name</label>
                                        <input type="text" class="form-control bg-light border-0 py-2" value="Admin">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">Last Name</label>
                                        <input type="text" class="form-control bg-light border-0 py-2" value="User">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label text-muted small fw-bold">Email Address</label>
                                        <input type="email" class="form-control bg-light border-0 py-2" id="profileEmail" readonly>
                                    </div>
                                </div>
                                
                                <h5 class="fw-bold mb-4 mt-5">Security Settings</h5>
                                <div class="row g-3">
                                    <div class="col-12">
                                        <label class="form-label text-muted small fw-bold">Current Password</label>
                                        <input type="password" class="form-control bg-light border-0 py-2" placeholder="Enter current password">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">New Password</label>
                                        <input type="password" class="form-control bg-light border-0 py-2" placeholder="New password">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">Confirm Password</label>
                                        <input type="password" class="form-control bg-light border-0 py-2" placeholder="Confirm password">
                                    </div>
                                </div>
                                
                                <div class="mt-5 text-end">
                                    <button type="button" class="btn btn-primary px-4" onclick="saveProfile()">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <!-- Firebase SDK Setup -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    <script src="../../backend/config/firebase.js"></script>
    
    <!-- Custom JS -->
    <script src="../../assets/js/main.js?v=<?php echo time(); ?>"></script>
    
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    document.getElementById('profileEmail').value = user.email;
                    document.getElementById('profileName').innerText = sessionStorage.getItem('userName') || user.email;
                    document.getElementById('profileRole').innerText = sessionStorage.getItem('userRole') || 'User';
                } else {
                    window.location.href = 'login';
                }
            });
        });

        function saveProfile() {
            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your settings have been saved successfully.',
                timer: 2000,
                showConfirmButton: false
            });
        }
    </script>
</body>
</html>
