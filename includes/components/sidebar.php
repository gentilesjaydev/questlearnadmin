<?php 
if(!isset($base)) $base = ''; 
$current_page = basename($_SERVER['PHP_SELF']);
?>
<nav id="sidebar">
    <!-- Brand Header -->
    <div class="sidebar-header">
        <a href="<?php echo $base; ?>index" class="text-decoration-none">
            <div class="d-flex align-items-center mb-1">
                <div class="brand-icon-wrapper me-2.5">
                    <img src="<?php echo $base; ?>assets/images/logo.png" alt="QuestLearn Logo" width="36" height="36" class="rounded-3 shadow-sm">
                </div>
                <div>
                    <h3 class="d-flex align-items-center text-white mb-0" style="font-size: 1.45rem; font-weight: 800; letter-spacing: -0.5px;">
                        QuestLearn
                        <span class="badge bg-white bg-opacity-25 text-white rounded-pill px-2 py-0.5 ms-2 fw-bold" style="font-size: 0.62rem; letter-spacing: 0.5px;">PORTAL</span>
                    </h3>
                </div>
            </div>
            <div class="small text-white text-opacity-75" style="font-size: 0.72rem; font-weight: 500; padding-left: 2px;">
                <i class="fa-solid fa-graduation-cap me-1"></i> NATG6 Standardized English RPG
            </div>
        </a>
    </div>

    <!-- Navigation Menu Wrapper -->
    <div class="sidebar-menu-wrapper">
        <ul class="list-unstyled components">
            <li class="<?php echo ($current_page == 'index.php') ? 'active' : ''; ?>">
                <a href="<?php echo $base; ?>index"><i class="fa-solid fa-chart-line"></i> Analytics Dashboard</a>
            </li>
            <?php 
            $is_student_active = in_array($current_page, ['students.php', 'competency-tracking.php', 'assessment-reporting.php', 'performance.php', 'learning-pattern-methodology.php']);
            ?>
            <li class="<?php echo $is_student_active ? 'active' : ''; ?>">
                <a href="#studentSubmenu" data-bs-toggle="collapse" aria-expanded="<?php echo $is_student_active ? 'true' : 'false'; ?>" class="dropdown-toggle d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center"><i class="fa-solid fa-users"></i> Student Account Management</div>
                </a>
                <ul class="collapse list-unstyled <?php echo $is_student_active ? 'show' : ''; ?>" id="studentSubmenu">
                    <li class="<?php echo ($current_page == 'students.php') ? 'active' : ''; ?>">
                        <a href="<?php echo $base; ?>pages/teacher/students"><i class="fa-solid fa-address-book text-warning"></i> Student Accounts</a>
                    </li>
                    <li class="<?php echo ($current_page == 'competency-tracking.php') ? 'active' : ''; ?>">
                        <a href="<?php echo $base; ?>pages/teacher/competency-tracking"><i class="fa-solid fa-award text-warning"></i> Competency Tracking</a>
                    </li>
                    <li class="<?php echo ($current_page == 'assessment-reporting.php') ? 'active' : ''; ?>">
                        <a href="<?php echo $base; ?>pages/teacher/assessment-reporting"><i class="fa-solid fa-file-invoice text-info"></i> Assessment Reporting</a>
                    </li>
                    <li class="<?php echo ($current_page == 'performance.php') ? 'active' : ''; ?>">
                        <a href="<?php echo $base; ?>pages/teacher/performance"><i class="fa-solid fa-chart-pie text-success"></i> Performance Analytics</a>
                    </li>
                    <li class="<?php echo ($current_page == 'learning-pattern-methodology.php') ? 'active' : ''; ?>">
                        <a href="<?php echo $base; ?>pages/teacher/learning-pattern-methodology"><i class="fa-solid fa-brain text-light"></i> Learning Pattern Methodology</a>
                    </li>
                </ul>
            </li>
            <li class="<?php echo ($current_page == 'quests.php') ? 'active' : ''; ?>">
                <a href="<?php echo $base; ?>pages/teacher/quests"><i class="fa-solid fa-list-ul"></i> Quest Curriculum</a>
            </li>
            <li class="<?php echo ($current_page == 'modules.php') ? 'active' : ''; ?>">
                <a href="<?php echo $base; ?>pages/teacher/modules"><i class="fa-solid fa-folder-open"></i> Modules Library</a>
            </li>
            
            <hr class="sidebar-divider">
            <li class="sidebar-section-title">Administration</li>
            
            <li class="<?php echo ($current_page == 'dashboard.php') ? 'active' : ''; ?>">
                <a href="<?php echo $base; ?>pages/admin/dashboard"><i class="fa-solid fa-shield-halved"></i> Super Admin Hub</a>
            </li>
            <li class="<?php echo ($current_page == 'teachers.php') ? 'active' : ''; ?>">
                <a href="<?php echo $base; ?>pages/admin/teachers"><i class="fa-solid fa-chalkboard-user"></i> Manage Teachers</a>
            </li>
            <li class="<?php echo ($current_page == 'settings.php') ? 'active' : ''; ?>">
                <a href="<?php echo $base; ?>pages/admin/settings"><i class="fa-solid fa-gear"></i> System Settings</a>
            </li>
        </ul>
    </div>

    <!-- Engaging Bottom Status Card -->
    <div class="sidebar-footer">
        <div class="sidebar-status-card">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                    <span class="sidebar-pulse-dot"></span>
                    <span class="status-title">DIAGNOSTIC ENGINE</span>
                </div>
                <span class="badge status-badge">Live Sync</span>
            </div>
            <div class="status-desc mb-2">
                <i class="fa-solid fa-gamepad text-warning me-1"></i> Grade 6 NATG6 Telemetry Active
            </div>
            <a href="<?php echo $base; ?>pages/teacher/quests" class="btn btn-sm status-action-btn">
                <i class="fa-solid fa-wand-magic-sparkles text-warning me-1"></i> AI Curriculum Quests
            </a>
        </div>
    </div>
</nav>
