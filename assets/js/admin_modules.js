document.addEventListener("DOMContentLoaded", function() {
    const gridContainer = document.getElementById('modulesGridContainer');
    
    // Bulk selection state
    window.selectedModules = new Set();
    window.moduleMetaMap = {}; // Maps publicId -> { firebaseKey, resourceType }
    
    const selectAllBtn = document.getElementById('selectAllModules');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const selectedCountSpan = document.getElementById('selectedCount');
    const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');
    const downloadSelectedCount = document.getElementById('downloadSelectedCount');

    if (gridContainer) {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    fetchCurriculumModules();
                } else {
                    window.location.href = '../auth/login';
                }
            });
        } else {
            fetchCurriculumModules();
        }
    }
    
    function updateBulkUI() {
        if (!selectAllBtn) return;
        
        const totalCards = document.querySelectorAll('.module-checkbox').length;
        const selectedCount = window.selectedModules.size;
        
        if (selectedCountSpan) selectedCountSpan.textContent = selectedCount;
        if (downloadSelectedCount) downloadSelectedCount.textContent = selectedCount;
        if (deleteSelectedBtn) deleteSelectedBtn.disabled = selectedCount === 0;
        if (downloadSelectedBtn) downloadSelectedBtn.disabled = selectedCount === 0;
        
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
                title: 'Delete Selected Modules?',
                text: `You are about to delete ${window.selectedModules.size} selected module(s). This will remove them from the library and cloud storage.`,
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
                
                // 1. Delete from Firebase RTDB for any items that have a Firebase key
                if (typeof db !== 'undefined') {
                    for (const pubId of publicIdsArray) {
                        const meta = window.moduleMetaMap[pubId];
                        if (meta && meta.firebaseKey) {
                            try {
                                await db.ref('quests/modules/' + meta.firebaseKey).remove();
                            } catch (fbErr) {
                                console.warn("Failed removing from Firebase:", fbErr);
                            }
                        }
                    }
                }
                
                // 2. Delete from Cloudinary
                const validCloudinaryIds = publicIdsArray.filter(id => id && !id.startsWith('-Ou'));
                if (validCloudinaryIds.length > 0) {
                    try {
                        await fetch('../../backend/api/delete_cloudinary_module.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ public_ids: validCloudinaryIds, resource_type: 'image' })
                        });
                    } catch (cloudErr) {
                        console.warn("Cloudinary delete batch warning:", cloudErr);
                    }
                }
                
                document.body.style.cursor = 'default';
                deleteSelectedBtn.innerHTML = `<i class="fa-solid fa-trash-can me-1"></i> Delete Selected (<span id="selectedCount">0</span>)`;
                
                Swal.fire('Deleted!', `Successfully deleted ${publicIdsArray.length} module(s).`, 'success');
                window.selectedModules.clear();
                fetchCurriculumModules();
            } catch (err) {
                document.body.style.cursor = 'default';
                deleteSelectedBtn.innerHTML = `<i class="fa-solid fa-trash-can me-1"></i> Delete Selected (<span id="selectedCount">${window.selectedModules.size}</span>)`;
                console.error("Bulk Delete error:", err);
                Swal.fire('Error', "A network error occurred while trying to delete the modules.", 'error');
                updateBulkUI();
            }
        });
    }

    if (downloadSelectedBtn) {
        downloadSelectedBtn.addEventListener('click', async function() {
            if (window.selectedModules.size === 0) return;
            const publicIdsArray = Array.from(window.selectedModules);
            
            const originalHtml = downloadSelectedBtn.innerHTML;
            downloadSelectedBtn.disabled = true;
            downloadSelectedBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-1"></i> Downloading...';
            
            for (let i = 0; i < publicIdsArray.length; i++) {
                const pubId = publicIdsArray[i];
                const meta = window.moduleMetaMap[pubId];
                if (meta && meta.fileUrl) {
                    await window.downloadModuleFile(meta.fileUrl, meta.title);
                    if (i < publicIdsArray.length - 1) {
                        await new Promise(res => setTimeout(res, 600));
                    }
                }
            }
            
            downloadSelectedBtn.innerHTML = originalHtml;
            downloadSelectedBtn.disabled = false;
        });
    }
    
    window.toggleModuleSelection = function(checkbox, publicId) {
        if (checkbox.checked) {
            window.selectedModules.add(publicId);
        } else {
            window.selectedModules.delete(publicId);
        }
        updateBulkUI();
    };

    // Only fetch modules that were uploaded and are actively used as questions in the curriculum
    async function fetchCurriculumModules() {
        if (!gridContainer) return;
        gridContainer.innerHTML = `
            <div class="col-12 text-center text-muted py-5 w-100">
                <i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>Loading curriculum modules...
            </div>
        `;
        window.selectedModules.clear();
        window.moduleMetaMap = {};
        updateBulkUI();

        let modulesList = [];

        try {
            if (typeof db !== 'undefined') {
                const questsSnapshot = await db.ref('quests').once('value');
                if (questsSnapshot.exists()) {
                    const questsData = questsSnapshot.val() || {};
                    const modulesMap = questsData.modules || {};
                    
                    // 1. Tally active questions per sourceModuleId across all game categories
                    const moduleQuestionCounts = {};
                    Object.keys(questsData).forEach(catKey => {
                        if (catKey === 'modules') return;
                        const catNode = questsData[catKey];
                        if (!catNode || typeof catNode !== 'object') return;
                        
                        // Check questions list/dict
                        if (catNode.questions && typeof catNode.questions === 'object') {
                            Object.values(catNode.questions).forEach(q => {
                                if (q && q.sourceModuleId) {
                                    moduleQuestionCounts[q.sourceModuleId] = (moduleQuestionCounts[q.sourceModuleId] || 0) + 1;
                                }
                            });
                        }
                        
                        // Check boss attacks if applicable
                        if (catNode.bosses && typeof catNode.bosses === 'object') {
                            Object.values(catNode.bosses).forEach(boss => {
                                if (boss && boss.attacks && typeof boss.attacks === 'object') {
                                    Object.values(boss.attacks).forEach(atk => {
                                        if (atk && atk.sourceModuleId) {
                                            moduleQuestionCounts[atk.sourceModuleId] = (moduleQuestionCounts[atk.sourceModuleId] || 0) + 1;
                                        }
                                    });
                                }
                            });
                        }
                    });
                    
                    // 2. Only include modules registered in quests/modules
                    Object.keys(modulesMap).forEach(key => {
                        const m = modulesMap[key];
                        if (!m) return;
                        
                        let pubId = key;
                        let fileUrl = m.fileUrl || '';
                        if (fileUrl) {
                            const match = fileUrl.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
                            if (match && match[1]) pubId = match[1];
                        }
                        
                        const qCount = (moduleQuestionCounts[key] || 0) + (pubId !== key ? (moduleQuestionCounts[pubId] || 0) : 0);
                        
                        modulesList.push({
                            public_id: pubId,
                            firebaseKey: key,
                            title: m.title || 'Untitled Module',
                            category: (m.category || 'GENERAL').toUpperCase(),
                            fileUrl: fileUrl,
                            created_at: m.uploadedAt || m.createdAt || null,
                            questionCount: qCount,
                            resource_type: 'image',
                            source: 'firebase'
                        });
                        
                        window.moduleMetaMap[pubId] = { 
                            firebaseKey: key, 
                            resource_type: 'image',
                            fileUrl: fileUrl,
                            title: m.title || 'Untitled Module'
                        };
                    });
                }
            }
        } catch (fbErr) {
            console.error("Error reading curriculum modules:", fbErr);
        }

        gridContainer.innerHTML = '';

        if (modulesList.length > 0) {
            // Sort by latest created first
            modulesList.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            });

            modulesList.forEach(module => {
                let displayTitle = module.title || 'Untitled Module';
                const safeTitle = (module.title || 'Module').replace(/'/g, "\\'");
                if (displayTitle.length > 42) displayTitle = displayTitle.substring(0, 42) + '...';
                
                let dateStr = 'Recently Uploaded';
                if (module.created_at) {
                    const date = new Date(module.created_at);
                    if (!isNaN(date.getTime())) {
                        dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    }
                }
                
                const categoryColor = getCategoryBadgeColor(module.category);
                const fileUrl = module.fileUrl || '#';
                
                // Formulate thumbnail URL (if PDF, Cloudinary automatically renders page 1 as .jpg)
                let thumbnailUrl = fileUrl;
                if (thumbnailUrl.toLowerCase().endsWith('.pdf')) {
                    thumbnailUrl = thumbnailUrl.substring(0, thumbnailUrl.length - 4) + '.jpg';
                }
                
                const questionBadge = module.questionCount > 0 
                    ? `<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 rounded-pill small fw-bold"><i class="fa-solid fa-gamepad me-1"></i> ${module.questionCount} Questions In-Game</span>`
                    : `<span class="badge bg-secondary bg-opacity-10 text-secondary border px-2.5 py-1 rounded-pill small"><i class="fa-solid fa-file me-1"></i> Reference Module</span>`;
                
                const cardHtml = `
                <div class="col">
                    <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative" style="transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 0.125rem 0.25rem rgba(0,0,0,0.075)'">
                        <div class="position-absolute top-0 start-0 m-2 z-3 bg-white rounded-circle p-1 shadow-sm d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                            <input class="form-check-input m-0 module-checkbox cursor-pointer" type="checkbox" value="${module.public_id}" onchange="toggleModuleSelection(this, '${module.public_id}')" style="width: 1.2rem; height: 1.2rem;">
                        </div>
                        <div class="position-relative bg-light" style="height: 200px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                            ${fileUrl && fileUrl.toLowerCase().endsWith('.pdf') ? `
                                <img src="${thumbnailUrl}" class="img-fluid" alt="Module Preview" style="width: 100%; height: 100%; object-fit: cover; object-position: top;" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\\'text-center p-4\\\'><i class=\\\'fa-solid fa-file-pdf text-danger fa-4x mb-2\\\'></i><p class=\\\'text-muted small mb-0 fw-bold\\\'>PDF Document</p></div>';">
                            ` : `
                                <div class="text-center p-4">
                                    <i class="fa-solid fa-file-lines text-primary fa-4x mb-2"></i>
                                    <p class="text-muted small mb-0 fw-bold">Educational Module</p>
                                </div>
                            `}
                            <div class="position-absolute top-0 end-0 m-2">
                                <span class="badge bg-${categoryColor} shadow-sm px-2.5 py-1 rounded-pill">${module.category}</span>
                            </div>
                        </div>
                        <div class="card-body d-flex flex-column p-3">
                            <h6 class="card-title fw-bold text-dark mb-1" style="font-size: 0.95rem; line-height: 1.4;" title="${module.title}">${displayTitle}</h6>
                            <p class="card-text text-muted small mb-2"><i class="fa-regular fa-calendar me-1"></i> ${dateStr}</p>
                            <div class="mb-3">
                                ${questionBadge}
                            </div>
                            <div class="mt-auto d-flex gap-2 align-items-center">
                                <button onclick="openPdfViewer('${fileUrl}', '${safeTitle}')" class="btn btn-sm btn-outline-primary flex-fill rounded-pill shadow-sm py-1.5 fw-bold" ${!fileUrl || fileUrl === '#' ? 'disabled' : ''}>
                                    <i class="fa-solid fa-eye me-1"></i> View
                                </button>
                                <button onclick="downloadModuleFile('${fileUrl}', '${safeTitle}', event)" class="btn btn-sm btn-primary flex-fill rounded-pill shadow-sm py-1.5 fw-bold" ${!fileUrl || fileUrl === '#' ? 'disabled' : ''} title="Download Original Module">
                                    <i class="fa-solid fa-cloud-arrow-down me-1"></i> Download
                                </button>
                                <button onclick="deleteModule('${module.public_id}', '${module.resource_type || 'image'}', '${module.firebaseKey || ''}')" class="btn btn-sm btn-outline-danger rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 34px; height: 34px; flex-shrink: 0;" title="Delete Module">
                                    <i class="fa-solid fa-trash" style="font-size: 0.8rem;"></i>
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
                <h5 class="fw-bold">No Curriculum Modules Found</h5>
                <p class="mb-0">Only modules uploaded to generate questions appear here. Upload a module via the AI Curriculum Generator to see it listed.</p>
            </div>`;
        }
    }
    
    window.refreshModules = fetchCurriculumModules;
    
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
window.deleteModule = async function(publicId, resourceType, firebaseKey) {
    const result = await Swal.fire({
        title: 'Delete Module?',
        text: "Are you sure you want to delete this module from the library?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) return;
    
    try {
        document.body.style.cursor = 'wait';
        
        // 1. Delete from Firebase RTDB
        if (firebaseKey && typeof db !== 'undefined') {
            try {
                await db.ref('quests/modules/' + firebaseKey).remove();
            } catch (fbErr) {
                console.warn("Failed removing from Firebase:", fbErr);
            }
        }
        
        // 2. Delete from Cloudinary if valid publicId
        if (publicId && !publicId.startsWith('-Ou')) {
            try {
                await fetch('../../backend/api/delete_cloudinary_module.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ public_id: publicId, resource_type: resourceType || 'image' })
                });
            } catch (cErr) {
                console.warn("Failed deleting from Cloudinary:", cErr);
            }
        }
        
        document.body.style.cursor = 'default';
        Swal.fire('Deleted!', 'Module removed successfully.', 'success');
        if (window.refreshModules) window.refreshModules();
    } catch (err) {
        document.body.style.cursor = 'default';
        console.error("Delete error:", err);
        Swal.fire('Error', "A network error occurred while trying to delete the module.", 'error');
    }
};

// Global Direct Download Handler
window.currentViewingUrl = '';
window.currentViewingTitle = '';

window.downloadModuleFile = async function(url, filename, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    if (!url || url === '#' || url === '') {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Unavailable', 'No downloadable file link found for this module.', 'info');
        } else {
            alert('No downloadable file link found for this module.');
        }
        return;
    }

    // Determine file extension from the URL (strip query/hash first)
    const cleanUrl = url.split('?')[0].split('#')[0];
    let extension = '.pdf';
    if (cleanUrl.toLowerCase().endsWith('.docx'))     extension = '.docx';
    else if (cleanUrl.toLowerCase().endsWith('.doc')) extension = '.doc';

    // Build a clean download filename with correct extension (no duplicate ext)
    let downloadName = (filename || 'module').replace(/\.[^/.]+$/, '') + extension;

    // Toast notification
    const Toast = (typeof Swal !== 'undefined') ? Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    }) : null;

    if (Toast) {
        Toast.fire({ icon: 'info', title: `Downloading ${downloadName}...` });
    }

    // Use the PHP-injected proxy base URL (always correct on any host/depth)
    const proxyBase = window.PROXY_DOWNLOAD_URL || 'backend/api/proxy_download.php';

    // Strip fl_attachment from URL before sending to proxy
    const cleanOriginalUrl = url.replace(/\/fl_attachment:[^/]*\//g, '/upload/');

    const proxyUrl = proxyBase
        + '?url='      + encodeURIComponent(cleanOriginalUrl)
        + '&filename=' + encodeURIComponent(downloadName);

    try {
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            let errorMsg = 'This module file is no longer available on cloud storage (it may have been deleted or expired).';
            try {
                const errData = await response.json();
                if (errData && errData.message) errorMsg = errData.message;
            } catch (jsonErr) {}

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'warning',
                    title: 'File Not Available',
                    text: errorMsg,
                    confirmButtonColor: '#4f46e5'
                });
            } else {
                alert(errorMsg);
            }
            return;
        }

        // Successfully received the file: Convert to Blob and trigger direct save
        const blob = await response.blob();
        
        // Detect actual downloaded content type to match file extension
        const mime = response.headers.get('content-type') || '';
        if (mime.includes('wordprocessingml') || mime.includes('docx')) {
            if (!downloadName.endsWith('.docx')) downloadName = downloadName.replace(/\.[^/.]+$/, '') + '.docx';
        } else if (mime.includes('pdf')) {
            if (!downloadName.endsWith('.pdf')) downloadName = downloadName.replace(/\.[^/.]+$/, '') + '.pdf';
        }

        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        }, 2000);

        if (Toast) {
            Toast.fire({ icon: 'success', title: 'Download complete!' });
        }
    } catch (netErr) {
        console.error('Download error:', netErr);
        if (typeof Swal !== 'undefined') {
            Swal.fire('Download Error', 'A network error occurred while downloading the file.', 'error');
        } else {
            alert('A network error occurred while downloading the file.');
        }
    }
};

// Global function to open the PDF viewer modal
window.openPdfViewer = function(url, title = 'Document') {
    if (url && url !== '#') {
        window.currentViewingUrl = url;
        window.currentViewingTitle = title;
        
        const modalEl = document.getElementById('pdfViewerModal');
        const modalBody = document.getElementById('pdfModalBody');
        const modalTitle = document.getElementById('pdfViewerModalLabel');
        
        if (modalTitle) {
            modalTitle.innerHTML = `<i class="fa-solid fa-file-pdf text-danger me-2"></i> ${title}`;
        }
        
        let pdfModal = bootstrap.Modal.getInstance(modalEl);
        if (!pdfModal) {
            pdfModal = new bootstrap.Modal(modalEl);
        }
        
        modalBody.innerHTML = `
            <div class="d-flex flex-column justify-content-center align-items-center h-100" style="min-height: 80vh;">
                <i class="fa-solid fa-circle-notch fa-spin fa-3x text-primary mb-3"></i>
                <h5 class="text-muted">Loading Document...</h5>
            </div>
        `;
        
        pdfModal.show();
        
        setTimeout(() => {
            let htmlContent = '<div class="text-center bg-dark p-3" style="min-height: 80vh; overflow-y: auto;">';
            
            const urlParts = url.split('/upload/');
            if (urlParts.length === 2) {
                const prefix = urlParts[0] + '/upload/';
                let suffix = urlParts[1];
                
                if (suffix.toLowerCase().endsWith('.pdf')) {
                    suffix = suffix.substring(0, suffix.length - 4) + '.jpg';
                }
                
                for (let i = 1; i <= 25; i++) {
                    const pageUrl = prefix + (i > 1 ? `pg_${i}/` : '') + suffix;
                    htmlContent += `
                        <img src="${pageUrl}" class="img-fluid shadow mb-3" alt="Page ${i}" 
                             style="max-width: 100%; border: 1px solid #444;" 
                             onerror="this.style.display='none';">
                    `;
                }
            } else {
                let fallbackUrl = url;
                if (fallbackUrl.toLowerCase().endsWith('.pdf')) {
                    fallbackUrl = fallbackUrl.substring(0, fallbackUrl.length - 4) + '.jpg';
                }
                htmlContent += `<img src="${fallbackUrl}" class="img-fluid shadow" alt="Document Preview">`;
            }
            
            htmlContent += `
                <div class="mt-4 pb-3">
                    <p class="text-white-50 small mb-2"><i class="fa-solid fa-info-circle me-1"></i> Multi-Page Document Preview</p>
                    <button onclick="downloadModuleFile('${url}', '${title.replace(/'/g, "\\'")}', event)" class="btn btn-sm btn-primary rounded-pill px-4 fw-bold">
                        <i class="fa-solid fa-cloud-arrow-down me-1"></i> Download Original File
                    </button>
                </div>
            </div>`;
            
            modalBody.innerHTML = htmlContent;
        }, 400);
    }
};
