/**
 * schools.js - School & Class Section Management
 * Manages institutional campus hierarchy and Grade 6 sections for teacher & student assignments.
 */
document.addEventListener("DOMContentLoaded", function() {
    const schoolsTableBody = document.getElementById('schoolsTableBody');
    const sectionsTableBody = document.getElementById('sectionsTableBody');
    const schoolCountBadge = document.getElementById('schoolCountBadge');
    const sectionCountBadge = document.getElementById('sectionCountBadge');
    const addSchoolForm = document.getElementById('addSchoolForm');
    const addSectionForm = document.getElementById('addSectionForm');

    let allUsers = {};
    let allSchools = {};
    let allSections = {};

    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = '../auth/login';
            return;
        }

        // 1. Listen to Users for count associations
        db.ref('users').on('value', (snap) => {
            allUsers = snap.val() || {};
            renderSchools();
            renderSections();
        });

        // 2. Listen to Schools & auto-seed if empty
        db.ref('schools').on('value', (snap) => {
            const data = snap.val();
            if (!data) {
                // Auto seed initial school
                const initialSchool = {
                    name: 'Central Elementary School',
                    district: 'District I, Division of Davao City',
                    createdAt: Date.now()
                };
                db.ref('schools').push(initialSchool);
                allSchools = {};
            } else {
                allSchools = data;
                renderSchools();
            }
        });

        // 3. Listen to Sections & auto-seed if empty
        db.ref('sections').on('value', (snap) => {
            const data = snap.val();
            if (!data) {
                // Auto seed initial Grade 6 sections
                const initialSections = ['Apitong', 'Acacia', 'Mahogany', 'Mabini', 'Rizal'];
                initialSections.forEach(sName => {
                    db.ref('sections').push({
                        name: sName,
                        grade: 'Grade 6',
                        createdAt: Date.now()
                    });
                });
                allSections = {};
            } else {
                allSections = data;
                renderSections();
            }
        });
    });

    // ── Render Schools Table ────────────────────────────────────────────────
    function renderSchools() {
        if (!schoolsTableBody) return;
        schoolsTableBody.innerHTML = '';
        const keys = Object.keys(allSchools);

        if (schoolCountBadge) {
            schoolCountBadge.textContent = `${keys.length} ${keys.length === 1 ? 'School' : 'Schools'}`;
        }

        if (keys.length === 0) {
            schoolsTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-school-circle-xmark fa-2x mb-3 text-secondary opacity-50"></i>
                        <p class="mb-0">No schools registered yet. Click <strong>Add School</strong> above.</p>
                    </td>
                </tr>`;
            return;
        }

        keys.forEach(k => {
            const s = allSchools[k];
            const sName = s.name || 'Unnamed School';
            const district = s.district || 'Unassigned District';

            // Calculate assigned teachers count
            let teacherCount = 0;
            Object.values(allUsers).forEach(u => {
                if (u && u.role === 'teacher' && u.school && u.school.toLowerCase() === sName.toLowerCase()) {
                    teacherCount++;
                }
            });

            const row = `
                <tr>
                    <td class="px-4 py-3 fw-bold text-dark">
                        <i class="fa-solid fa-school text-primary me-2"></i> ${sName}
                    </td>
                    <td class="px-4 py-3 text-muted">
                        ${district}
                    </td>
                    <td class="px-4 py-3 text-center">
                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1 fw-semibold">
                            ${teacherCount} ${teacherCount === 1 ? 'Teacher' : 'Teachers'}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-end text-nowrap">
                        <button class="btn btn-sm btn-light border me-1 rounded-3 shadow-sm text-primary" 
                            onclick="editSchool('${k}', '${sName.replace(/'/g, "\\'")}', '${district.replace(/'/g, "\\'")}')" 
                            title="Edit School">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-sm btn-light border rounded-3 shadow-sm text-danger" 
                            onclick="deleteSchool('${k}', '${sName.replace(/'/g, "\\'")}')" 
                            title="Delete School">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            schoolsTableBody.innerHTML += row;
        });
    }

    // ── Render Sections Table ───────────────────────────────────────────────
    function renderSections() {
        if (!sectionsTableBody) return;
        sectionsTableBody.innerHTML = '';
        const keys = Object.keys(allSections);

        if (sectionCountBadge) {
            sectionCountBadge.textContent = `${keys.length} ${keys.length === 1 ? 'Section' : 'Sections'}`;
        }

        if (keys.length === 0) {
            sectionsTableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-layer-group fa-2x mb-3 text-secondary opacity-50"></i>
                        <p class="mb-0">No sections added yet.</p>
                    </td>
                </tr>`;
            return;
        }

        keys.forEach(k => {
            const sec = allSections[k];
            const secName = sec.name || 'Unnamed Section';

            // Calculate enrolled students count
            let studentCount = 0;
            Object.values(allUsers).forEach(u => {
                if (u && (u.role === 'student' || !u.role) && u.section && u.section.toLowerCase() === secName.toLowerCase()) {
                    studentCount++;
                }
            });

            const row = `
                <tr>
                    <td class="px-4 py-3 fw-bold text-dark">
                        <i class="fa-solid fa-chalkboard-user text-primary me-2"></i> Section ${secName}
                    </td>
                    <td class="px-4 py-3 text-center">
                        <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-3 py-1 fw-semibold">
                            ${studentCount} Students
                        </span>
                    </td>
                    <td class="px-4 py-3 text-end text-nowrap">
                        <button class="btn btn-sm btn-light border rounded-3 shadow-sm text-danger" 
                            onclick="deleteSection('${k}', '${secName.replace(/'/g, "\\'")}')" 
                            title="Delete Section">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            sectionsTableBody.innerHTML += row;
        });
    }

    // ── Add School Form Submission ──────────────────────────────────────────
    if (addSchoolForm) {
        addSchoolForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('newSchoolName').value.trim();
            const district = document.getElementById('newSchoolDistrict').value.trim() || 'Central District';

            if (!name) return;

            db.ref('schools').push({
                name: name,
                district: district,
                createdAt: Date.now()
            }).then(() => {
                const modalEl = document.getElementById('addSchoolModal');
                const modalInst = bootstrap.Modal.getInstance(modalEl);
                if (modalInst) modalInst.hide();
                addSchoolForm.reset();

                Swal.fire({
                    icon: 'success',
                    title: 'School Added!',
                    text: `${name} is now available in teacher registration dropdowns.`,
                    timer: 1800,
                    showConfirmButton: false
                });
            }).catch(err => Swal.fire('Error', err.message, 'error'));
        });
    }

    // ── Add Section Form Submission ─────────────────────────────────────────
    if (addSectionForm) {
        addSectionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('newSectionName').value.trim();

            if (!name) return;

            db.ref('sections').push({
                name: name,
                grade: 'Grade 6',
                createdAt: Date.now()
            }).then(() => {
                const modalEl = document.getElementById('addSectionModal');
                const modalInst = bootstrap.Modal.getInstance(modalEl);
                if (modalInst) modalInst.hide();
                addSectionForm.reset();

                Swal.fire({
                    icon: 'success',
                    title: 'Section Added!',
                    text: `Section ${name} is now available across teacher and student registration.`,
                    timer: 1800,
                    showConfirmButton: false
                });
            }).catch(err => Swal.fire('Error', err.message, 'error'));
        });
    }
});

// ── Edit School ─────────────────────────────────────────────────────────────
window.editSchool = function(key, name, district) {
    Swal.fire({
        title: 'Edit School Campus',
        html: `
            <div class="text-start">
                <div class="mb-3">
                    <label class="form-label text-muted small fw-bold mb-1">School Name</label>
                    <input id="edit-school-name" class="swal2-input m-0 w-100" value="${name}">
                </div>
                <div class="mb-0">
                    <label class="form-label text-muted small fw-bold mb-1">District / Division</label>
                    <input id="edit-school-district" class="swal2-input m-0 w-100" value="${district}">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'Save Updates',
        preConfirm: () => {
            return {
                name: document.getElementById('edit-school-name').value.trim(),
                district: document.getElementById('edit-school-district').value.trim()
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            db.ref('schools/' + key).update(result.value)
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'School Updated!',
                        timer: 1500,
                        showConfirmButton: false
                    });
                })
                .catch(err => Swal.fire('Error', err.message, 'error'));
        }
    });
};

// ── Delete School ───────────────────────────────────────────────────────────
window.deleteSchool = function(key, name) {
    Swal.fire({
        title: `Delete ${name}?`,
        text: 'This will remove the campus from the selection dropdowns.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Yes, delete!'
    }).then((result) => {
        if (result.isConfirmed) {
            db.ref('schools/' + key).remove()
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'School Removed',
                        timer: 1500,
                        showConfirmButton: false
                    });
                })
                .catch(err => Swal.fire('Error', err.message, 'error'));
        }
    });
};

// ── Delete Section ──────────────────────────────────────────────────────────
window.deleteSection = function(key, name) {
    Swal.fire({
        title: `Delete Section ${name}?`,
        text: 'This will remove the section from selection dropdowns.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Yes, delete!'
    }).then((result) => {
        if (result.isConfirmed) {
            db.ref('sections/' + key).remove()
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Section Removed',
                        timer: 1500,
                        showConfirmButton: false
                    });
                })
                .catch(err => Swal.fire('Error', err.message, 'error'));
        }
    });
};
