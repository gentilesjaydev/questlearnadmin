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
                    <p class="text-muted mb-0" style="font-size: 1rem; font-weight: 500;">Manage your personal account credentials, email, and security settings.</p>
                </div>

                <div class="row g-4">
                    <!-- Left Column: User Card -->
                    <div class="col-lg-4">
                        <div class="card dashboard-card p-4 text-center h-100 shadow-sm border">
                            <div class="mb-4">
                                <img id="profileAvatarImg" src="https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff&size=120" class="rounded-circle shadow-sm border border-3 border-light" alt="Profile" width="120" height="120">
                            </div>
                            <h4 class="fw-bold mb-1" id="profileName">Loading...</h4>
                            <p class="text-muted mb-3 text-capitalize" id="profileRole">Role</p>
                            
                            <div class="p-3 bg-light rounded-3 text-start mb-3 border">
                                <div class="small text-muted mb-1"><i class="fa-solid fa-envelope me-1 text-primary"></i> Current Login Email:</div>
                                <div class="fw-bold small text-dark text-break" id="profileEmailBadge">-</div>
                            </div>

                            <div class="alert alert-info border-0 rounded-3 text-start small mb-0 py-2.5">
                                <i class="fa-solid fa-circle-info me-1 text-primary"></i>
                                You can update your first name, last name, email address, and account password on the right.
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Column: Edit Form -->
                    <div class="col-lg-8">
                        <div class="card dashboard-card p-4 p-md-5 h-100 shadow-sm border">
                            <h5 class="fw-bold mb-4 text-dark"><i class="fa-solid fa-user-pen text-primary me-2"></i> Personal Information</h5>
                            
                            <form id="profileForm" onsubmit="event.preventDefault(); saveProfile();">
                                <div class="row g-3 mb-4">
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">First Name <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control bg-light py-2" id="profileFirstName" placeholder="Enter first name" required style="border-radius: 8px;">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">Last Name</label>
                                        <input type="text" class="form-control bg-light py-2" id="profileLastName" placeholder="Enter last name" style="border-radius: 8px;">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label text-muted small fw-bold">Email Address <span class="text-danger">*</span></label>
                                        <input type="email" class="form-control bg-light py-2" id="profileEmail" placeholder="e.g. name@domain.com" required style="border-radius: 8px;">
                                        <small class="text-muted d-block mt-1" style="font-size: 0.8rem;">
                                            <i class="fa-solid fa-triangle-exclamation text-warning me-1"></i>
                                            Changing your email updates your login credentials across QuestLearn. You will need to confirm your current password below.
                                        </small>
                                    </div>
                                </div>
                                
                                <hr class="my-4 text-muted opacity-25">

                                <h5 class="fw-bold mb-4 text-dark"><i class="fa-solid fa-shield-halved text-primary me-2"></i> Security & Password Settings</h5>
                                
                                <div class="row g-3">
                                    <div class="col-12">
                                        <label class="form-label text-muted small fw-bold">Current Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control bg-light py-2" id="currentPassword" placeholder="Enter current password (required only to change email or password)" style="border-radius: 8px 0 0 8px;">
                                            <button class="btn btn-light border" type="button" onclick="togglePasswordVisibility('currentPassword', this)" style="border-radius: 0 8px 8px 0;">
                                                <i class="fa-regular fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">New Password (optional)</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control bg-light py-2" id="newPassword" placeholder="Minimum 6 characters" style="border-radius: 8px 0 0 8px;">
                                            <button class="btn btn-light border" type="button" onclick="togglePasswordVisibility('newPassword', this)" style="border-radius: 0 8px 8px 0;">
                                                <i class="fa-regular fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">Confirm New Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control bg-light py-2" id="confirmPassword" placeholder="Re-type new password" style="border-radius: 8px 0 0 8px;">
                                            <button class="btn btn-light border" type="button" onclick="togglePasswordVisibility('confirmPassword', this)" style="border-radius: 0 8px 8px 0;">
                                                <i class="fa-regular fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mt-5 text-end">
                                    <button type="submit" class="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm" id="saveProfileBtn">
                                        <i class="fa-solid fa-floppy-disk me-1.5"></i> Save Changes
                                    </button>
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
        let originalEmail = '';

        document.addEventListener("DOMContentLoaded", function() {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    originalEmail = user.email || '';
                    document.getElementById('profileEmail').value = originalEmail;
                    document.getElementById('profileEmailBadge').innerText = originalEmail;
                    
                    // Fetch profile record from Realtime Database
                    db.ref('users/' + user.uid).once('value').then((snap) => {
                        const data = snap.val() || {};
                        const fName = data.firstName || '';
                        const lName = data.lastName || '';
                        const role = data.role || sessionStorage.getItem('userRole') || 'admin';
                        const displayName = (fName + ' ' + lName).trim() || data.displayName || data.name || user.email;

                        document.getElementById('profileFirstName').value = fName;
                        document.getElementById('profileLastName').value = lName;
                        document.getElementById('profileName').innerText = displayName;
                        
                        let roleLabel = 'Super Administrator';
                        if (role === 'teacher') roleLabel = 'Teacher Account';
                        else if (role === 'student') roleLabel = 'Student Learner';
                        document.getElementById('profileRole').innerText = roleLabel;

                        const avatarImg = document.getElementById('profileAvatarImg');
                        if (avatarImg) {
                            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff&size=120`;
                        }
                    }).catch(err => {
                        console.error("Error reading profile data:", err);
                    });
                } else {
                    window.location.href = '../auth/login';
                }
            });
        });

        function togglePasswordVisibility(inputId, btn) {
            const input = document.getElementById(inputId);
            const icon = btn.querySelector('i');
            if (!input || !icon) return;

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }

        async function saveProfile() {
            const user = auth.currentUser;
            if (!user) {
                Swal.fire('Session Expired', 'Please log in again.', 'warning');
                return;
            }

            const fName = document.getElementById('profileFirstName').value.trim();
            const lName = document.getElementById('profileLastName').value.trim();
            const email = document.getElementById('profileEmail').value.trim();
            const curPass = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;
            const saveBtn = document.getElementById('saveProfileBtn');
            let verificationSent = false;

            if (!fName) {
                Swal.fire('First Name Required', 'Please provide a first name.', 'warning');
                return;
            }

            if (!email) {
                Swal.fire('Email Required', 'Please enter a valid email address.', 'warning');
                return;
            }

            // Check if password change is requested
            if (newPass) {
                if (newPass.length < 6) {
                    Swal.fire('Invalid Password', 'New password must be at least 6 characters long.', 'warning');
                    return;
                }
                if (newPass !== confirmPass) {
                    Swal.fire('Password Mismatch', 'New password and confirm password do not match.', 'warning');
                    return;
                }
                if (!curPass) {
                    Swal.fire('Current Password Required', 'Please enter your current password to authorize password update.', 'warning');
                    return;
                }
            }

            // Check if email change is requested
            const emailChanged = email.toLowerCase() !== originalEmail.toLowerCase();
            if (emailChanged && !curPass) {
                Swal.fire('Current Password Required', 'Please enter your current password to authorize changing your email address.', 'warning');
                return;
            }

            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-2"></i> Saving Updates...';

            try {
                // 1. Re-authenticate if sensitive credentials (email or password) are being updated
                if (emailChanged || newPass) {
                    const credential = firebase.auth.EmailAuthProvider.credential(user.email, curPass);
                    await user.reauthenticateWithCredential(credential);

                    // 2. Update Firebase Auth Email
                    if (emailChanged) {
                        try {
                            await user.updateEmail(email);
                            originalEmail = email;
                        } catch (emailErr) {
                            if (emailErr.code === 'auth/operation-not-allowed' || (emailErr.message && emailErr.message.toLowerCase().includes('verify'))) {
                                if (typeof user.verifyBeforeUpdateEmail === 'function') {
                                    await user.verifyBeforeUpdateEmail(email);
                                    verificationSent = true;
                                } else {
                                    throw emailErr;
                                }
                            } else {
                                throw emailErr;
                            }
                        }
                    }

                    // 3. Update Firebase Auth Password
                    if (newPass) {
                        await user.updatePassword(newPass);
                    }
                }

                // 4. Update Realtime Database user profile record
                const fullName = (fName + ' ' + lName).trim() || email;
                const dbUpdates = {
                    firstName: fName,
                    lastName: lName,
                    email: email,
                    updatedAt: Date.now()
                };

                await db.ref('users/' + user.uid).update(dbUpdates);

                // 5. Update Local Session Storage
                sessionStorage.setItem('userName', fullName);
                sessionStorage.setItem('userEmail', email);

                // 6. Update UI in real-time
                document.getElementById('profileName').innerText = fullName;
                document.getElementById('profileEmailBadge').innerText = email;
                const avatarImg = document.getElementById('profileAvatarImg');
                if (avatarImg) {
                    avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4f46e5&color=fff&size=120`;
                }
                
                const navUserName = document.getElementById('navUserName');
                if (navUserName) navUserName.innerText = fullName;
                const navUserAvatar = document.getElementById('navUserAvatar');
                if (navUserAvatar) {
                    const initials = ((fName[0] || '') + (lName[0] || '')).toUpperCase() || 'AD';
                    navUserAvatar.innerText = initials;
                }

                // Clear sensitive password inputs
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';

                if (verificationSent) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Verification Link Sent',
                        html: `Firebase has sent a confirmation link to <b>${email}</b>.<br><br>Please open your email and click the confirmation link to complete the change.<br><br><small class="text-muted">To allow instant email changes without sending verification emails, disable <i>"Verify new email before changing"</i> in Firebase Console → Authentication → Settings.</small>`,
                        confirmButtonColor: '#4f46e5',
                        confirmButtonText: 'Understood'
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Profile Saved!',
                        html: emailChanged 
                            ? `Your details and login email have been updated to <b>${email}</b>.<br><small class="text-muted">Use this email for your next login.</small>`
                            : 'Your name and profile information have been updated successfully.',
                        confirmButtonColor: '#4f46e5',
                        confirmButtonText: 'Done'
                    });
                }
            } catch (err) {
                console.error("Save profile error:", err);
                let errorMsg = err.message;
                if (err.code === 'auth/wrong-password') {
                    errorMsg = 'Incorrect current password. Please re-enter your current password.';
                } else if (err.code === 'auth/email-already-in-use') {
                    errorMsg = 'This email address is already registered to another account.';
                } else if (err.code === 'auth/invalid-email') {
                    errorMsg = 'Please enter a valid email address.';
                } else if (err.code === 'auth/requires-recent-login') {
                    errorMsg = 'Security timeout. Please sign out and sign back in to modify email or password.';
                }
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: errorMsg,
                    confirmButtonColor: '#ef4444'
                });
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk me-1.5"></i> Save Changes';
            }
        }
    </script>
</body>
</html>
