<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Teachers - QuestLearn</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="<?php echo $base; ?>assets/css/style.css?v=<?php echo time(); ?>">
    <link rel="icon" type="image/png" href="<?php echo $base; ?>assets/images/logo.png">
</head>
<body>
    <div class="d-flex">
        <?php include $base . 'includes/components/sidebar.php'; ?>
        <div id="content">
            <?php include $base . 'includes/components/navbar.php'; ?>
            <div class="container-fluid p-4 p-md-5">
                <div class="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 class="fw-bolder mb-1" style="color: var(--text-main); letter-spacing: -1.5px; font-size: 2.2rem;">Manage Teachers</h2>
                        <p class="text-muted" style="font-size: 1.05rem; font-weight: 500;">Add, remove, or modify teacher accounts and permissions.</p>
                    </div>
                    <button id="registerTeacherBtn" class="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#registerTeacherModal">
                        <i class="fa-solid fa-user-plus"></i> Register Teacher
                    </button>
                </div>
                
                <div class="card dashboard-card p-0 shadow-sm border overflow-hidden">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 align-middle">
                            <thead class="bg-light">
                                <tr>
                                    <th class="px-4 py-3 text-muted text-nowrap">Teacher Name</th>
                                    <th class="px-4 py-3 text-muted text-nowrap">Email Address</th>
                                    <th class="px-4 py-3 text-muted text-nowrap">Assigned School</th>
                                    <th class="px-4 py-3 text-muted text-nowrap">Grade & Section</th>
                                    <th class="px-4 py-3 text-muted text-nowrap">Account Status</th>
                                    <th class="px-4 py-3 text-muted text-end text-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="teachersTableBody">
                                <tr>
                                    <td colspan="6" class="text-center py-5 text-muted">
                                        <i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i>
                                        <p class="mb-0">Loading teacher accounts...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Register New Teacher Modal -->
    <div class="modal fade" id="registerTeacherModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header bg-light border-0 px-4 py-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-10 text-primary p-2.5 rounded-3 me-3">
                            <i class="fa-solid fa-chalkboard-user fa-lg"></i>
                        </div>
                        <div>
                            <h5 class="modal-title fw-bold mb-0 text-dark">Register New Teacher</h5>
                            <small class="text-muted">Create educator login with class section scoping</small>
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeTeacherModalBtn"></button>
                </div>
                <form id="registerTeacherForm">
                    <div class="modal-body p-4">
                        <div id="teacherRegisterErrorAlert" class="alert alert-danger d-none rounded-3 py-2 px-3 small mb-3">
                            <i class="fa-solid fa-triangle-exclamation me-1"></i> <span id="teacherRegisterErrorMsg"></span>
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label class="form-label text-muted small fw-bold mb-1">First Name <span class="text-danger">*</span></label>
                                <input type="text" id="teacherRegFirstName" class="form-control" placeholder="e.g. Maria" required style="border-radius: 10px;">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-muted small fw-bold mb-1">Last Name <span class="text-danger">*</span></label>
                                <input type="text" id="teacherRegLastName" class="form-control" placeholder="e.g. Santos" required style="border-radius: 10px;">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold mb-1">Email Address <span class="text-danger">*</span></label>
                            <input type="email" id="teacherRegEmail" class="form-control" placeholder="e.g. maria.santos@school.edu.ph" required style="border-radius: 10px;">
                            <small class="text-muted" style="font-size: 0.75rem;">Used for dashboard login credentials.</small>
                        </div>

                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold mb-1">Password <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <input type="password" id="teacherRegPassword" class="form-control" placeholder="Minimum 6 characters" minlength="6" required style="border-radius: 10px 0 0 10px;">
                                <button class="btn btn-outline-secondary" type="button" id="toggleTeacherRegPassword" style="border-radius: 0 10px 10px 0;">
                                    <i class="fa-solid fa-eye" id="toggleTeacherRegPasswordIcon"></i>
                                </button>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold mb-1"><i class="fa-solid fa-school text-primary me-1"></i> Assigned School <span class="text-danger">*</span></label>
                            <input type="text" id="teacherRegSchool" class="form-control" placeholder="e.g. Davao Central Elementary School" value="Central Elementary School" required style="border-radius: 10px;">
                            <small class="text-muted" style="font-size: 0.72rem;">DepEd District / Elementary School Campus</small>
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-md-5">
                                <label class="form-label text-muted small fw-bold mb-1">Grade Level <span class="text-danger">*</span></label>
                                <select id="teacherRegGradeSelect" class="form-select" style="border-radius: 10px;" required>
                                    <option value="Grade 6" selected>Grade 6</option>
                                    <option value="grade 7">Grade 7</option>
                                    <option value="Grade 9">Grade 9</option>
                                </select>
                            </div>
                            <div class="col-md-7">
                                <label class="form-label text-muted small fw-bold mb-1">Assigned Section <span class="text-danger">*</span></label>
                                <select id="teacherRegSectionSelect" class="form-select" style="border-radius: 10px;" required>
                                    <option value="" disabled selected>Select Section...</option>
                                    <option value="Apitong">Apitong</option>
                                    <option value="Acacia">Acacia</option>
                                    <option value="Mahogany">Mahogany</option>
                                    <option value="Mabini">Mabini</option>
                                    <option value="Rizal">Rizal</option>
                                    <option value="Custom">+ Type custom section</option>
                                </select>
                                <input type="text" id="teacherRegSectionCustom" class="form-control mt-2 d-none" placeholder="Enter section name..." style="border-radius: 10px;">
                            </div>
                        </div>

                        <div class="mb-2">
                            <label class="form-label text-muted small fw-bold mb-1">Department / Subject</label>
                            <input type="text" id="teacherRegDept" class="form-control" placeholder="e.g. English / NATG6" value="English" style="border-radius: 10px;">
                        </div>

                        <div class="p-3 bg-light rounded-3 border small text-muted mt-3">
                            <div class="d-flex align-items-center mb-1 text-primary fw-bold">
                                <i class="fa-solid fa-user-shield me-1.5"></i> Scoped Class Dashboard Access
                            </div>
                            This teacher will automatically have their dashboard, student rosters, and NATG6 analytics scoped strictly to their assigned class section.
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0 px-4 py-3">
                        <button type="button" class="btn btn-light rounded-pill px-4 fw-medium" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" id="submitTeacherRegisterBtn">
                            <i class="fa-solid fa-circle-check me-1.5"></i> Create Teacher Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Firebase SDK Setup -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    <script src="<?php echo $base; ?>backend/config/firebase.js"></script>
    
    <script src="<?php echo $base; ?>assets/js/main.js?v=<?php echo time(); ?>"></script>
    <script src="<?php echo $base; ?>assets/js/teachers.js?v=<?php echo time(); ?>"></script>
</body>
</html>
