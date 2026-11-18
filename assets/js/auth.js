document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');

    // Toggle password visibility
    if(togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Forgot Password Handler (No email: directs teacher to admin for default password)
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Forgot Password?',
                    html: `
                        <div class="text-start">
                            <p class="mb-3 text-secondary">Automated email reset is disabled for institutional account privacy.</p>
                            <div class="p-3 bg-light rounded-3 border mb-3">
                                <div class="d-flex align-items-center mb-1 text-primary fw-bold">
                                    <i class="fa-solid fa-user-shield me-2"></i> Contact Your Administrator
                                </div>
                                <p class="small text-muted mb-0">
                                    Please notify your <strong>School Administrator</strong> to reset your access. The administrator will grant and provide you with the standard password (<code>teacher123</code>) privately.
                                </p>
                            </div>
                        </div>
                    `,
                    icon: 'info',
                    confirmButtonColor: '#4f46e5',
                    confirmButtonText: '<i class="fa-solid fa-check me-1"></i> Understood'
                });
            } else {
                alert("Please contact your School Administrator to reset your password to the default teacher password.");
            }
        });
    }

    if(loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;
            
            // UI Loading state
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
            loginBtn.disabled = true;
            loginError.classList.add('d-none');

            try {
                let userCredential = null;

                // 1. Attempt standard Firebase sign-in
                try {
                    userCredential = await auth.signInWithEmailAndPassword(email, password);
                } catch (signInErr) {
                    // Check if this is an unregistered/legacy account attempting first-time login
                    if (signInErr.code === 'auth/invalid-login-credentials' || signInErr.code === 'auth/user-not-found') {
                        try {
                            // Attempt to initialize Auth account with the entered credentials
                            userCredential = await auth.createUserWithEmailAndPassword(email, password);
                        } catch (createErr) {
                            if (createErr.code === 'auth/email-already-in-use') {
                                throw new Error("Incorrect password. Please check your password or contact your administrator.");
                            } else {
                                throw signInErr;
                            }
                        }
                    } else {
                        throw signInErr;
                    }
                }

                const user = userCredential.user;

                // 2. Fetch user profile from Realtime Database
                let snapshot = await db.ref('users/' + user.uid).once('value');
                let userData = snapshot.val();

                // If not found by UID, search by email (for legacy push-ID teacher records)
                if (!userData) {
                    const allUsersSnap = await db.ref('users').once('value');
                    const allUsers = allUsersSnap.val() || {};
                    let legacyKey = null;

                    Object.keys(allUsers).forEach(k => {
                        const u = allUsers[k];
                        if (u && u.email && u.email.toLowerCase() === email.toLowerCase()) {
                            legacyKey = k;
                            userData = u;
                        }
                    });

                    if (userData && legacyKey) {
                        // Migrate legacy record to the proper Firebase Auth UID
                        userData.uid = user.uid;
                        await db.ref('users/' + user.uid).set(userData);
                        if (legacyKey !== user.uid) {
                            await db.ref('users/' + legacyKey).remove();
                        }
                    }
                }

                // If still no database record found, account is unauthorized
                if (!userData) {
                    await auth.signOut();
                    throw new Error("No authorized school record found for this email. Contact your administrator.");
                }

                const role = userData.role || 'teacher'; // Expected: 'admin' or 'teacher'
                const fName = userData.firstName || '';
                const lName = userData.lastName || '';
                const displayName = (fName + ' ' + lName).trim() || userData.displayName || userData.name || user.email;

                // Save role & scoped class credentials for session
                sessionStorage.setItem('userRole', role);
                sessionStorage.setItem('userName', displayName);
                sessionStorage.setItem('userEmail', user.email);
                sessionStorage.setItem('userUid', user.uid);
                sessionStorage.setItem('teacherGrade', userData.grade || '');
                sessionStorage.setItem('teacherSection', userData.section || '');
                sessionStorage.setItem('teacherSchool', userData.school || '');
                sessionStorage.setItem('teacherDept', userData.department || '');

                // Smart Routing based on Role
                if (role === 'admin' || role === 'teacher') {
                    if (typeof Swal !== 'undefined') {
                        const isAdmin = role === 'admin';
                        Swal.fire({
                            icon: 'success',
                            title: isAdmin ? 'Welcome back, Admin! 👑' : 'Welcome back, Teacher! 🎓',
                            text: `Good to see you, ${displayName}!`,
                            showConfirmButton: false,
                            timer: 1800,
                            timerProgressBar: true
                        }).then(() => {
                            window.location.href = isAdmin ? '../../pages/admin/dashboard' : '../../index';
                        });
                    } else {
                        window.location.href = role === 'admin' ? '../../pages/admin/dashboard' : '../../index';
                    }
                } else {
                    await auth.signOut();
                    throw new Error("Unauthorized role detected. Access Denied.");
                }
            } catch (error) {
                showError(error.message);
            }

            function showError(msg) {
                loginError.textContent = msg;
                loginError.classList.remove('d-none');
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        });
    }
});
