<?php if(!isset($base)) $base = ''; ?>
<nav class="navbar navbar-expand-lg navbar-custom w-100">
    <div class="container-fluid px-0">
        <!-- Sidebar Toggle -->
        <button type="button" id="sidebarCollapse" class="btn-toggle me-3">
            <i class="fa-solid fa-bars-staggered"></i>
        </button>

        <!-- Search Bar (SaaS Feel) -->
        <div class="d-none d-md-flex align-items-center position-relative w-25">
            <i class="fa-solid fa-magnifying-glass position-absolute text-muted ms-3"></i>
            <input type="text" class="form-control bg-light border-0 shadow-none py-2 rounded-pill" style="padding-left: 42px !important;" placeholder="Search students, quests...">
        </div>

        <!-- Right Side Nav -->
        <div class="d-flex align-items-center ms-auto gap-4">
            
            <!-- Notifications -->
            <a href="#" class="position-relative text-muted text-decoration-none fs-5 hover-primary transition-base">
                <i class="fa-regular fa-bell"></i>
                <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-white rounded-circle">
                    <span class="visually-hidden">New alerts</span>
                </span>
            </a>
            
            <div class="vr bg-secondary opacity-25" style="height: 24px;"></div>
            
            <!-- User Profile Dropdown -->
            <div class="dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center px-2 py-1 rounded-3 hover-bg-light transition-base text-dark" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="https://ui-avatars.com/api/?name=Admin&background=A594F9&color=fff&bold=true" alt="User" class="rounded-circle me-2 shadow-sm" width="36" height="36">
                    <div class="d-none d-md-block text-start lh-sm">
                        <div class="fw-semibold fs-6 text-dark">Admin User</div>
                        <div class="small text-muted fw-medium">System Access</div>
                    </div>
                </a>
                <ul class="dropdown-menu dropdown-menu-end border-0 shadow mt-2 rounded-4 p-2">
                    <li><a class="dropdown-item rounded-3 py-2 fw-medium" href="<?php echo $base; ?>pages/auth/profile"><i class="fa-regular fa-user me-2 text-primary"></i> My Profile</a></li>
                    <li><hr class="dropdown-divider my-2"></li>
                    <li><a class="dropdown-item rounded-3 py-2 fw-medium text-danger" href="#" onclick="handleLogout(event)"><i class="fa-solid fa-arrow-right-from-bracket me-2"></i> Logout</a></li>
                </ul>
            </div>
        </div>
    </div>
</nav>
