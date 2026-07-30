document.addEventListener("DOMContentLoaded", function() {
    const gridContainer = document.getElementById('modulesGridContainer');
    
    // Bulk selection state
    window.selectedModules = new Set();
    const selectAllBtn = document.getElementById('selectAllModules');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const selectedCountSpan = document.getElementById('selectedCount');

    if (gridContainer) {
        // Authenticate with Firebase for security
        if (typeof firebase !== 'undefined') {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    fetchCloudinaryModules();
                } else {
                    window.location.href = '../auth/login';
                }
            });
        } else {
            fetchCloudinaryModules();
        }
    }
    
    function updateBulkUI() {
        if (!selectAllBtn || !deleteSelectedBtn || !selectedCountSpan) return;
        
        const totalCards = document.querySelectorAll('.module-checkbox').length;
        const selectedCount = window.selectedModules.size;
        
        selectedCountSpan.textContent = selectedCount;
        deleteSelectedBtn.disabled = selectedCount === 0;
        
        if (totalCards > 0) {
            selectAllBtn.checked = selectedCount === totalCards;
            selectAllBtn.indeterminate = selectedCount > 0 && selectedCount < totalCards;
        } else {
            selectAllBtn.checked = false;
            selectAllBtn.indeterminate = false;
        }
    }
    
    if (selectAllBtn) {
        selectAllBtn.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.module-checkbox');
            window.selectedModules.clear();
            
            if (this.checked) {
                checkboxes.forEach(cb => {
                    cb.checked = true;
                    window.selectedModules.add(cb.value);
                });
            } else {
                checkboxes.forEach(cb => cb.checked = false);
            }
            updateBulkUI();
        });
    }
    
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', async function() {
            if (window.selectedModules.size === 0) return;
            
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: `You are about to permanently delete ${window.selectedModules.size} selected module(s) from Cloudinary. This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete them!'
            });
            
            if (!result.isConfirmed) return;
            
            const publicIdsArray = Array.from(window.selectedModules);
            
            try {
                document.body.style.cursor = 'wait';
                deleteSelectedBtn.disabled = true;
                deleteSelectedBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-1"></i> Deleting...';
                
                const response = await fetch('../../backend/api/delete_cloudinary_module.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ public_ids: publicIdsArray, resource_type: 'image' }) // fallback to image type for legacy bulk
                });
                
                const data = await response.json();
                document.body.style.cursor = 'default';
                deleteSelectedBtn.innerHTML = `<i class="fa-solid fa-trash-can me-1"></i> Delete Selected (<span id="selectedCount">0</span>)`;
                
                if (response.ok && data.success) {
                    Swal.fire('Deleted!', `Successfully processed deletion for ${publicIdsArray.length} module(s).`, 'success');
                    window.selectedModules.clear();
                    fetchCloudinaryModules();
                } else {
                    Swal.fire('Error', "Error deleting modules: " + (data.error || "Unknown error"), 'error');
                    updateBulkUI();
                }
            } catch (err) {
                document.body.style.cursor = 'default';
                deleteSelectedBtn.innerHTML = `<i class="fa-solid fa-trash-can me-1"></i> Delete Selected (<span id="selectedCount">${window.selectedModules.size}</span>)`;
                console.error("Bulk Delete error:", err);
                Swal.fire('Error', "A network error occurred while trying to delete the modules.", 'error');
                updateBulkUI();
            }
        });
    }
    
    // Attach toggle function for individual cards
    window.toggleModuleSelection = function(checkbox, publicId) {
        if (checkbox.checked) {
            window.selectedModules.add(publicId);
        } else {
            window.selectedModules.delete(publicId);
        }
        updateBulkUI();
    };

    async function fetchCloudinaryModules() {
        try {
            const response = await fetch('../../backend/api/get_cloudinary_modules.php');
            const data = await response.json();
            
            gridContainer.innerHTML = '';
            window.selectedModules.clear();
            updateBulkUI();
            
            if (data.resources && data.resources.length > 0) {
                const modulesArray = data.resources;
                
                modulesArray.forEach(module => {
                    let title = 'Untitled Module';
                    if (module.context && module.context.custom && module.context.custom.caption) {
                        title = module.context.custom.caption;
                    } else if (module.context && module.context.custom && module.context.custom.alt) {
                        title = module.context.custom.alt;
                    } else if (module.display_name) {
                        title = module.display_name;
                    } else {
                        title = module.original_filename || module.filename || module.public_id || 'Untitled Module';
                    }
                    
                    if (title.length > 45) title = title.substring(0, 45) + '...';
                    
                    let category = 'UNCATEGORIZED';
                    if (module.tags && module.tags.length > 0) {
                        category = module.tags[0].replace('_', ' ').toUpperCase();
                    }
                    
                    let fileUrl = module.secure_url || '#';
                    
                    let thumbnailUrl = fileUrl;
                    if (thumbnailUrl.toLowerCase().endsWith('.pdf')) {
                        thumbnailUrl = thumbnailUrl.substring(0, thumbnailUrl.length - 4) + '.jpg';
                    }
                    
                    let dateStr = 'Unknown Date';
                    if (module.created_at) {
                        const date = new Date(module.created_at);
                        dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    }
                    
                    const categoryColor = getCategoryBadgeColor(category);
                    
                    const cardHtml = `
                    <div class="col">
                        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative" style="transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 0.125rem 0.25rem rgba(0,0,0,0.075)'">
                            <div class="position-absolute top-0 start-0 m-2 z-3 bg-white rounded-circle p-1 shadow-sm d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                                <input class="form-check-input m-0 module-checkbox cursor-pointer" type="checkbox" value="${module.public_id}" onchange="toggleModuleSelection(this, '${module.public_id}')" style="width: 1.2rem; height: 1.2rem;">
                            </div>
                            <div class="position-relative bg-light" style="height: 220px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                <img src="${thumbnailUrl}" class="img-fluid" alt="Module Preview" style="width: 100%; height: 100%; object-fit: cover; object-position: top;" onerror="this.src='../../assets/images/placeholder.png'; this.style.objectFit='contain';">
                                <div class="position-absolute top-0 end-0 m-2">
                                    <span class="badge bg-${categoryColor} shadow-sm px-2 py-1 rounded-pill">${category}</span>
                                </div>
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h6 class="card-title fw-bold text-dark mb-1" style="font-size: 1rem; line-height: 1.4;">${title}</h6>
                                <p class="card-text text-muted small mb-3"><i class="fa-regular fa-calendar me-1"></i> ${dateStr}</p>
                                <div class="mt-auto d-flex gap-2">
                                    <button onclick="openPdfViewer('${fileUrl}', ${module.pages || 1})" class="btn btn-primary flex-grow-1 rounded-pill shadow-sm" style="font-weight: 500;">
                                        <i class="fa-solid fa-eye me-1"></i> View
                                    </button>
                                    <button onclick="deleteModule('${module.public_id}', '${module.resource_type || 'image'}')" class="btn btn-outline-danger rounded-pill shadow-sm px-3" style="font-weight: 500;" title="Delete Module">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                    gridContainer.innerHTML += cardHtml;
                });
            } else {
                gridContainer.innerHTML = `
                <div class="col-12 text-center text-muted py-5 w-100">
                    <i class="fa-solid fa-folder-open fa-3x mb-3 text-secondary opacity-50"></i>
                    <h5>No Modules Uploaded</h5>
                    <p class="mb-0">There are no PDF files found in your Cloudinary account.</p>
                </div>`;
            }
        } catch (err) {
            console.error("Error fetching Cloudinary modules:", err);
            gridContainer.innerHTML = `
            <div class="col-12 text-center text-danger py-5 w-100">
                <i class="fa-solid fa-circle-exclamation fa-3x mb-3"></i>
                <h5>Connection Error</h5>
                <p class="mb-0">Failed to connect to Cloudinary. Please check your API credentials.</p>
            </div>`;
        }
    }
    
    // Attach fetchCloudinaryModules to window so it can be called after deletion
    window.refreshModules = fetchCloudinaryModules;
    
    function getCategoryBadgeColor(category) {
        if (!category) return 'secondary';
        const cat = category.toLowerCase();
        if (cat.includes('grammar')) return 'primary';
        if (cat.includes('vocabulary')) return 'success';
        if (cat.includes('reading')) return 'warning';
        if (cat.includes('boss')) return 'danger';
        return 'info';
    }
});

// Global function to delete a module (single)
window.deleteModule = async function(publicId, resourceType) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You are about to permanently delete this module from Cloudinary. This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) return;
    
    try {
        document.body.style.cursor = 'wait';
        
        const response = await fetch('../../backend/api/delete_cloudinary_module.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ public_id: publicId, resource_type: resourceType })
        });
        
        const data = await response.json();
        document.body.style.cursor = 'default';
        
        if (response.ok && data.success) {
            Swal.fire('Deleted!', 'Module deleted successfully.', 'success');
            if (window.refreshModules) window.refreshModules();
        } else {
            Swal.fire('Error', "Error deleting module: " + (data.error || "Unknown error"), 'error');
        }
    } catch (err) {
        document.body.style.cursor = 'default';
        console.error("Delete error:", err);
        Swal.fire('Error', "A network error occurred while trying to delete the module.", 'error');
    }
};

// Global function to open the PDF viewer modal
window.openPdfViewer = function(url, pagesCount = 10) { // Default to 10 pages if count unknown
    if (url && url !== '#') {
        const modalEl = document.getElementById('pdfViewerModal');
        const modalBody = document.getElementById('pdfModalBody');
        
        let pdfModal = bootstrap.Modal.getInstance(modalEl);
        if (!pdfModal) {
            pdfModal = new bootstrap.Modal(modalEl);
        }
        
        // Show loading spinner
        modalBody.innerHTML = `
            <div class="d-flex flex-column justify-content-center align-items-center h-100" style="min-height: 80vh;">
                <i class="fa-solid fa-circle-notch fa-spin fa-3x text-primary mb-3"></i>
                <h5 class="text-muted">Loading Document...</h5>
            </div>
        `;
        
        // Show modal first
        pdfModal.show();
        
        // We create a custom scrolling image viewer to bypass the Cloudinary PDF block entirely.
        setTimeout(() => {
            let htmlContent = '<div class="text-center bg-dark p-3" style="min-height: 80vh; overflow-y: auto;">';
            
            const urlParts = url.split('/upload/');
            if (urlParts.length === 2) {
                const prefix = urlParts[0] + '/upload/';
                let suffix = urlParts[1];
                
                // Ensure it's a JPG thumbnail
                if (suffix.toLowerCase().endsWith('.pdf')) {
                    suffix = suffix.substring(0, suffix.length - 4) + '.jpg';
                }
                
                // We attempt to load up to 25 pages. If a page doesn't exist, the onerror removes it cleanly.
                for (let i = 1; i <= 25; i++) {
                    const pageUrl = prefix + (i > 1 ? `pg_${i}/` : '') + suffix;
                    htmlContent += `
                        <img src="${pageUrl}" class="img-fluid shadow mb-3" alt="Page ${i}" 
                             style="max-width: 100%; border: 1px solid #444;" 
                             onerror="this.style.display='none';">
                    `;
                }
            } else {
                // Fallback for non-standard URLs
                let fallbackUrl = url;
                if (fallbackUrl.toLowerCase().endsWith('.pdf')) {
                    fallbackUrl = fallbackUrl.substring(0, fallbackUrl.length - 4) + '.jpg';
                }
                htmlContent += `<img src="${fallbackUrl}" class="img-fluid shadow" alt="Document Preview">`;
            }
            
            htmlContent += `
                <div class="mt-4">
                    <p class="text-white-50 small mb-2"><i class="fa-solid fa-info-circle me-1"></i> Multi-Page Image Viewer (Bypassing PDF Block)</p>
                </div>
            </div>`;
            
            modalBody.innerHTML = htmlContent;
        }, 400);
    }
};
