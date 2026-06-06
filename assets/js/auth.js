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
                            const role = userData.role; // Expected: 'admin' or 'teacher'
                            
                            // Save role securely for routing
                            sessionStorage.setItem('userRole', role);
                            sessionStorage.setItem('userName', userData.name || user.email);
                            
                            // Smart Routing based on Role
                            if(role === 'admin' || role === 'teacher') {
                                if(typeof Swal !== 'undefined') {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Login Successful',
                                        text: 'Welcome back to QuestLearn!',
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
