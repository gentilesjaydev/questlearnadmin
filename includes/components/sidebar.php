<?php 
if(!isset($base)) $base = ''; 
$current_page = basename($_SERVER['PHP_SELF']);
?>
<nav id="sidebar">
    <div class="sidebar-header">
        <h3 class="d-flex align-items-center text-white">
            <img src="<?php echo $base; ?>assets/images/logo.png" alt="QuestLearn Logo" width="38" height="38" class="me-3 rounded-3 shadow-sm border border-light border-opacity-25"> 
            QuestLearn
        </h3>
    </div>

    <ul class="list-unstyled components">
        <li class="<?php echo ($current_page == 'index.php') ? 'active' : ''; ?>">
            <a href="<?php echo $base; ?>index"><i class="fa-solid fa-chart-line"></i> Analytics Dashboard</a>
        </li>
        <li class="<?php echo ($current_page == 'students.php' || $current_page == 'performance.php') ? 'active' : ''; ?>">
            <a href="#studentSubmenu" data-bs-toggle="collapse" aria-expanded="<?php echo ($current_page == 'students.php' || $current_page == 'performance.php') ? 'true' : 'false'; ?>" class="dropdown-toggle d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center"><i class="fa-solid fa-users"></i> Student Management</div>
            </a>
            <ul class="collapse list-unstyled <?php echo ($current_page == 'students.php' || $current_page == 'performance.php') ? 'show' : ''; ?>" id="studentSubmenu">
                <li class="<?php echo ($current_page == 'students.php') ? 'active' : ''; ?>"><a href="<?php echo $base; ?>pages/teacher/students"><i class="fa-solid fa-address-book"></i> View Roster</a></li>
                <li class="<?php echo ($current_page == 'performance.php') ? 'active' : ''; ?>"><a href="<?php echo $base; ?>pages/teacher/performance"><i class="fa-solid fa-chart-pie"></i> Performance Analytics</a></li>
            </ul>
        </li>
        <li class="<?php echo ($current_page == 'quests.php') ? 'active' : ''; ?>">
            <a href="<?php echo $base; ?>pages/teacher/quests"><i class="fa-solid fa-list-ul"></i> Quest Curriculum</a>
        </li>
        <li class="<?php echo ($current_page == 'modules.php') ? 'active' : ''; ?>">
            <a href="<?php echo $base; ?>pages/teacher/modules"><i class="fa-solid fa-folder-open"></i> Modules Library</a>
        </li>
        
        <hr class="mx-4 my-3" style="border-color: rgba(255,255,255,0.2); opacity: 1;">
        <li class="px-4 pt-2 pb-2 text-uppercase" style="font-size: 0.7rem; color: rgba(255, 255, 255, 0.6); font-weight: 800; letter-spacing: 1.5px;">Administration</li>
        
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
</nav>
