<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>School & Class Management - QuestLearn</title>
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
                
                <!-- Page Header -->
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                    <div>
                        <div class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold mb-3 border border-primary border-opacity-25">
                            <i class="fa-solid fa-building-columns me-1"></i> Institution Hierarchy
                        </div>
                        <h2 class="fw-bolder mb-1" style="color: var(--text-main); letter-spacing: -1.5px; font-size: 2.2rem;">School & Section Management</h2>
                        <p class="text-muted" style="font-size: 1.05rem; font-weight: 500;">Configure institutional campuses and Grade 6 advisory sections for teacher assignments.</p>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#addSchoolModal">
                            <i class="fa-solid fa-school"></i> Add School
                        </button>
                        <button class="btn btn-outline-primary px-4 py-2 rounded-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#addSectionModal">
                            <i class="fa-solid fa-layer-group"></i> Add Section
                        </button>
                        <button class="btn btn-outline-secondary px-4 py-2 rounded-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2" onclick="seedDefaults()" title="Seed default school and sections">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Seed Defaults
                        </button>
                    </div>
                </div>

                <div class="row g-4">
                    <!-- Schools Column -->
                    <div class="col-lg-7">
                        <div class="card dashboard-card p-0 shadow-sm border overflow-hidden h-100">
                            <div class="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-school text-primary me-2"></i> Registered Elementary Schools</h5>
                                    <small class="text-muted">Campuses where QuestLearn NATG6 gamified testing is deployed</small>
                                </div>
                                <span class="badge bg-primary rounded-pill px-3 py-2" id="schoolCountBadge">0 Schools</span>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover mb-0 align-middle">
                                    <thead class="bg-light">
                                        <tr>
                                            <th class="px-4 py-3 text-muted text-nowrap">School Campus Name</th>
                                            <th class="px-4 py-3 text-muted text-nowrap">Division / District</th>
                                            <th class="px-4 py-3 text-muted text-center text-nowrap">Teachers</th>
                                            <th class="px-4 py-3 text-muted text-end text-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="schoolsTableBody">
                                        <tr>
                                            <td colspan="4" class="text-center py-5 text-muted">
                                                <i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i>
                                                <p class="mb-0">Loading schools...</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Sections Column -->
                    <div class="col-lg-5">
                        <div class="card dashboard-card p-0 shadow-sm border overflow-hidden h-100">
                            <div class="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-layer-group text-primary me-2"></i> Class Sections</h5>
                                    <small class="text-muted">Grade 6 advisory cohorts</small>
                                </div>
                                <span class="badge bg-primary rounded-pill px-3 py-2" id="sectionCountBadge">0 Sections</span>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover mb-0 align-middle">
                                    <thead class="bg-light">
                                        <tr>
                                            <th class="px-4 py-3 text-muted text-nowrap">Section Name</th>
                                            <th class="px-4 py-3 text-muted text-center text-nowrap">Students</th>
                                            <th class="px-4 py-3 text-muted text-end text-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="sectionsTableBody">
                                        <tr>
                                            <td colspan="3" class="text-center py-5 text-muted">
                                                <i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i>
                                                <p class="mb-0">Loading sections...</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Add School Modal -->
    <div class="modal fade" id="addSchoolModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header bg-light border-0 px-4 py-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-10 text-primary p-2.5 rounded-3 me-3">
                            <i class="fa-solid fa-school fa-lg"></i>
                        </div>
                        <div>
                            <h5 class="modal-title fw-bold mb-0 text-dark">Add Elementary School</h5>
                            <small class="text-muted">Register a new campus to the institution list</small>
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeSchoolModalBtn"></button>
                </div>
                <form id="addSchoolForm">
                    <div class="modal-body p-4">
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold mb-1">School Name <span class="text-danger">*</span></label>
                            <input type="text" id="newSchoolName" class="form-control" placeholder="e.g. Davao Central Elementary School" required style="border-radius: 10px;">
                        </div>
                        <div class="mb-2">
                            <label class="form-label text-muted small fw-bold mb-1">District / Division</label>
                            <input type="text" id="newSchoolDistrict" class="form-control" placeholder="e.g. District I, Davao City Division" value="Davao City Division" style="border-radius: 10px;">
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0 px-4 py-3">
                        <button type="button" class="btn btn-light rounded-pill px-4 fw-medium" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" id="submitSchoolBtn">
                            <i class="fa-solid fa-plus me-1.5"></i> Add School
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Add Section Modal -->
    <div class="modal fade" id="addSectionModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header bg-light border-0 px-4 py-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-10 text-primary p-2.5 rounded-3 me-3">
                            <i class="fa-solid fa-layer-group fa-lg"></i>
                        </div>
                        <div>
                            <h5 class="modal-title fw-bold mb-0 text-dark">Add Class Section</h5>
                            <small class="text-muted">Register a new Grade 6 advisory section</small>
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeSectionModalBtn"></button>
                </div>
                <form id="addSectionForm">
                    <div class="modal-body p-4">
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold mb-1">Grade Level</label>
                            <input type="text" class="form-control bg-light fw-bold" value="Grade 6" readonly style="border-radius: 10px;">
                        </div>
                        <div class="mb-2">
                            <label class="form-label text-muted small fw-bold mb-1">Section Name <span class="text-danger">*</span></label>
                            <input type="text" id="newSectionName" class="form-control" placeholder="e.g. Narra, Molave, Apitong" required style="border-radius: 10px;">
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0 px-4 py-3">
                        <button type="button" class="btn btn-light rounded-pill px-4 fw-medium" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" id="submitSectionBtn">
                            <i class="fa-solid fa-plus me-1.5"></i> Add Section
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
    <script src="<?php echo $base; ?>assets/js/schools.js?v=<?php echo time(); ?>"></script>
</body>
</html>

