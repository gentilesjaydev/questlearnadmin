<?php if(!isset($base)) $base = ''; ?>
<script>
  // Injected by navbar.php — always correct regardless of page depth
  window.PROXY_DOWNLOAD_URL = '<?php echo rtrim($base, '/'); ?>/backend/api/proxy_download.php';
</script>
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
            
            <!-- Notifications Bell Dropdown -->
            <div class="dropdown">
                <a href="#" class="position-relative text-muted text-decoration-none fs-5 hover-primary transition-base" id="notifBell" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                    <i class="fa-regular fa-bell"></i>
                    <span id="notifDot" class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-white rounded-circle d-none">
                        <span class="visually-hidden">New alerts</span>
                    </span>
                </a>
                <div class="dropdown-menu dropdown-menu-end border-0 shadow rounded-4 p-0" id="notifDropdown" style="width: 340px; max-height: 440px; overflow: hidden;">
                    <div class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light rounded-top-4">
                        <span class="fw-bold text-dark fs-6"><i class="fa-regular fa-bell text-primary me-2"></i>Notifications</span>
                        <button class="btn btn-link btn-sm text-muted text-decoration-none p-0 fw-medium" id="markAllReadBtn" style="font-size:0.8rem;">Mark all read</button>
                    </div>
                    <ul class="list-unstyled mb-0" id="notifList" style="max-height: 360px; overflow-y: auto;">
                        <li class="text-center text-muted py-4 px-3" id="notifEmpty">
                            <i class="fa-regular fa-bell-slash fa-2x mb-2 opacity-50 d-block"></i>
                            <span class="small">No new notifications</span>
                        </li>
                    </ul>
                </div>
            </div>
            
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
