<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuestLearn - Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="icon" type="image/png" href="../../assets/images/logo.png">
    <link rel="stylesheet" href="../../assets/css/auth.css?v=<?php echo time(); ?>">
</head>
<body>
    <div class="auth-wrapper">
        
        <!-- Welcome Note -->
        <div class="auth-note d-none d-lg-block">
            <div class="badge rounded-pill mb-4 shadow-sm">
                <i class="fa-solid fa-wand-magic-sparkles text-warning me-2"></i> Version 2.0 Now Live
            </div>
            <h1>Empower Your<br>Digital Classroom.</h1>
            <p>QuestLearn is the premier gamified administration platform. Manage RPG rewards, monitor student analytics, and build engaging curriculums in real-time.</p>
        </div>

        <div class="login-container shadow-lg">
            <div class="brand-header">
                <img src="../../assets/images/logo.png" alt="QuestLearn Logo">
                <h1>QuestLearn</h1>
            </div>
            
            <h2>Welcome Back</h2>
            <p>Access your administrative dashboard.</p>

            <form id="loginForm">
                <div class="form-floating mb-4">
                    <input type="email" class="form-control" id="email" placeholder="name@example.com" required>
                    <label for="email"><i class="fa-regular fa-envelope me-2"></i>Email Address</label>
                </div>
                
                <div class="form-floating mb-4 position-relative">
                    <input type="password" class="form-control" id="password" placeholder="Password" required>
                    <label for="password"><i class="fa-solid fa-lock me-2"></i>Password</label>
                    <i class="fa-regular fa-eye-slash toggle-password" id="togglePassword"></i>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-4 px-1">
                    <div class="form-check">
                        <input class="form-check-input shadow-none" type="checkbox" id="rememberMe">
                        <label class="form-check-label text-muted fw-medium" for="rememberMe" style="font-size: 0.9rem;">Remember me</label>
                    </div>
                    <a href="#" class="forgot-link">Forgot password?</a>
                </div>

                <button type="submit" class="btn w-100 login-btn d-flex justify-content-center align-items-center gap-2" id="loginBtn">
                    Sign In <i class="fa-solid fa-arrow-right"></i>
                </button>
                
                <div id="loginError" class="alert alert-danger mt-4 d-none text-center rounded-3 border-0 bg-danger bg-opacity-10 text-danger fw-bold" style="font-size: 0.9rem;"></div>
            </form>

            <div class="mt-5 text-center text-muted" style="font-size: 0.8rem; font-weight: 500;">
                &copy; 2026 QuestLearn Administration
            </div>
        </div>
    </div>

    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <!-- Firebase SDK Setup -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    
    <!-- Config and Auth Logic -->
    <script src="../../backend/config/firebase.js"></script>
    <script src="../../assets/js/auth.js?v=<?php echo time(); ?>"></script>
</body>
</html>
