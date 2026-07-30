<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modules Library - QuestLearn</title>
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
                <div class="mb-5">
                    <h2 class="fw-bolder mb-1" style="color: var(--text-main); letter-spacing: -1.5px; font-size: 2.2rem;">Reference Modules Library</h2>
                    <p class="text-muted" style="font-size: 1.05rem; font-weight: 500;">View all PDF modules uploaded to Cloudinary.</p>
                </div>

                <div class="mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
                    <div>
                        <h5 class="fw-bold mb-0" style="color: var(--text-main); font-size: 1.25rem;"><i class="fa-solid fa-book-open text-primary me-2"></i> Uploaded Modules</h5>
                        <p class="text-muted small mt-1 mb-0">Browse your Cloudinary modules visually.</p>
                    </div>
                    
                    <div class="d-flex align-items-center gap-3 bg-light px-3 py-2 rounded-3 border">
                        <div class="form-check mb-0">
                            <input class="form-check-input border-secondary cursor-pointer" type="checkbox" id="selectAllModules">
                            <label class="form-check-label fw-medium cursor-pointer user-select-none" for="selectAllModules">
                                Select All
                            </label>
                        </div>
                        <div class="vr"></div>
                        <button id="deleteSelectedBtn" class="btn btn-sm btn-danger px-3 shadow-sm" disabled>
                            <i class="fa-solid fa-trash-can me-1"></i> Delete Selected (<span id="selectedCount">0</span>)
                        </button>
                    </div>
                </div>
                
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4" id="modulesGridContainer">
                    <div class="col-12 text-center text-muted py-5 w-100">
                        <i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>Loading visual previews...
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- PDF Viewer Modal -->
    <div class="modal fade" id="pdfViewerModal" tabindex="-1" aria-labelledby="pdfViewerModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content" style="height: 85vh;">
                <div class="modal-header bg-light">
                    <h5 class="modal-title fw-bold" id="pdfViewerModalLabel"><i class="fa-solid fa-file-pdf text-danger me-2"></i> Document Viewer</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-0" id="pdfModalBody" style="min-height: 80vh;">
                    <!-- PDF Object will be dynamically injected here to prevent browser rendering bugs -->
                </div>
            </div>
        </div>
    </div>

    <!-- Firebase SDK Setup -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    <script src="<?php echo $base; ?>backend/config/firebase.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="<?php echo $base; ?>assets/js/main.js?v=<?php echo time(); ?>"></script>
    <script src="<?php echo $base; ?>assets/js/admin_modules.js?v=<?php echo time(); ?>"></script>
</body>
</html>
