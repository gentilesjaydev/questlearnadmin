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
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;
            
            // UI Loading state
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
            loginBtn.disabled = true;
            loginError.classList.add('d-none');

            // Firebase Authentication Process
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    
                    // Fetch user role from Realtime Database
                    db.ref('users/' + user.uid).once('value').then((snapshot) => {
                        if(snapshot.exists()) {
                            const userData = snapshot.val();
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
                            if(role === 'admin' || role === 'teacher') {
                                if(typeof Swal !== 'undefined') {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Login Successful',
                                        text: `Welcome back, ${displayName}!`,
                                        showConfirmButton: false,
                                        timer: 1500
                                    }).then(() => {
                                        window.location.href = role === 'admin' ? '../../pages/admin/dashboard' : '../../index';
                                    });
                                } else {
                                    window.location.href = role === 'admin' ? '../../pages/admin/dashboard' : '../../index';
                                }
                            } else {
                                throw new Error("Unauthorized role detected. Access Denied.");
                            }
                        } else {
                            throw new Error("No database record found for this account. Contact System Admin.");
                        }
                    }).catch(err => {
                        auth.signOut();
                        showError(err.message);
                    });
                })
                .catch((error) => {
                    // Show exactly why Firebase rejected the login to help debug
                    showError("Firebase Error: " + error.message);
                });
                
            function showError(msg) {
                loginError.textContent = msg;
                loginError.classList.remove('d-none');
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        });
    }
});
