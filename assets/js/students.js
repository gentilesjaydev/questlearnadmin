document.addEventListener("DOMContentLoaded", function() {
    const studentTableBody = document.getElementById('studentTableBody');
    
    if(studentTableBody) {
        studentTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-5"><i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>Checking Authentication...</td></tr>';

        // Wait for Firebase to confirm the user is logged in before fetching data
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // User IS logged in, now we can safely fetch data
                studentTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-5"><i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>Syncing Users with Firebase...</td></tr>';
                
                const usersRef = db.ref('users');
                
                usersRef.on('value', (snapshot) => {
                    studentTableBody.innerHTML = ''; // Clear loading
                    const data = snapshot.val();
                    let hasStudents = false;
                    
                    if (data) {
                        Object.keys(data).forEach(key => {
                            const student = data[key];
                            
                            if(student.role === 'student' || !student.role) {
                                hasStudents = true;
                                const firstName = student.firstName || '';
                                const lastName = student.lastName || '';
                                const name = (firstName + ' ' + lastName).trim() || 'Anonymous Student';
                                const xp = student.xp || 0;
                                const level = student.level || student.accountLevel || 1;
                                const hp = student.hp !== undefined ? student.hp : 100;
                                
                                const rowHtml = `
                                <tr>
                                    <td class="px-4 py-4 fw-medium text-dark d-flex align-items-center">
                                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=64748b" class="rounded-circle me-3" width="38">
                                        ${name}
                                    </td>
                                    <td class="px-4 py-4"><span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill border border-primary border-opacity-25"><i class="fa-solid fa-medal me-1"></i> Lvl ${level} | ❤️ ${hp}/100</span></td>
                                    <td class="px-4 py-4 fw-bold" style="color: #10b981;">${xp.toLocaleString()} XP</td>
                                    <td class="px-4 py-4 text-end">
                                        <button class="btn btn-sm btn-light me-2 rounded-3 shadow-sm" onclick="viewStudent('${key}', '${name.replace(/'/g, "\\'")}', ${xp}, ${level}, ${hp})" title="View Profile"><i class="fa-solid fa-eye text-primary"></i></button>
                                        <button class="btn btn-sm btn-light me-2 rounded-3 shadow-sm" onclick="editStudent('${key}', '${student.firstName || ''}', '${student.lastName || ''}', ${xp})" title="Edit Account"><i class="fa-solid fa-pen text-warning"></i></button>
                                        <button class="btn btn-sm btn-light rounded-3 shadow-sm" onclick="deleteStudent('${key}', '${name.replace(/'/g, "\\'")}')" title="Delete Account"><i class="fa-solid fa-trash text-danger"></i></button>
                                    </td>
                                </tr>
                                `;
                                studentTableBody.innerHTML += rowHtml;
                            }
                        });
                    }
                    
                    if(!hasStudents) {
                        studentTableBody.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center text-muted py-5">
                                <i class="fa-solid fa-users fa-3x mb-3 text-secondary opacity-50"></i>
                                <h5>No Students Found</h5>
                                <p class="mb-0">Your Firebase 'users' node has no student data yet.</p>
                            </td>
                        </tr>`;
                    }
                }, (error) => {
                    studentTableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-danger py-5">
                            <i class="fa-solid fa-triangle-exclamation fa-3x mb-3"></i>
                            <h5>Firebase Connection Error</h5>
                            <p>${error.message}</p>
                        </td>
                    </tr>`;
                    
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Database Error',
                            text: error.message,
                            confirmButtonColor: '#4f46e5'
                        });
                    }
                });
            } else {
                // User is NOT logged in! The rules block them.
                studentTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-danger py-5">
                        <i class="fa-solid fa-lock fa-3x mb-3"></i>
                        <h5>Authentication Required</h5>
                        <p>You must be logged in to Firebase to view live student data.</p>
                        <p class="small text-muted">Because your Firebase rules are set to "auth != null", the server is actively blocking this page from loading data.</p>
                    </td>
                </tr>`;
            }
        });
    }
});

// Global CRUD Functions for Students
window.viewStudent = function(key, name, xp, level, hp) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Player Profile',
            html: `
                <div class="text-center mb-4">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=64748b&size=80" class="rounded-circle mb-3 shadow-sm">
                    <h4 class="fw-bold text-dark">${name}</h4>
                    <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill"><i class="fa-solid fa-medal me-1"></i> Level ${level}</span>
                </div>
                <div class="text-start bg-light p-3 rounded-3">
                    <p class="mb-2"><strong>Database UID:</strong> <span class="text-muted" style="font-size:0.85rem;">${key}</span></p>
                    <p class="mb-2"><strong>Current HP:</strong> <span class="${hp <= 20 ? 'text-danger' : 'text-success'} fw-bold">${hp}/100</span></p>
                    <p class="mb-0"><strong>Total XP:</strong> <span class="text-success fw-bold">${xp.toLocaleString()} XP</span></p>
                </div>
            `,
            confirmButtonColor: '#4f46e5',
            confirmButtonText: 'Close'
        });
    }
};

window.deleteStudent = function(key, name) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Delete Student?',
            text: `Are you absolutely sure you want to permanently delete ${name} from the Firebase database? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, delete them!'
        }).then((result) => {
            if (result.isConfirmed) {
                db.ref('users/' + key).remove()
                    .then(() => {
                        if(typeof Toast !== 'undefined') Toast.fire({ icon: 'success', title: 'Student permanently deleted' });
                    })
                    .catch(err => {
                        Swal.fire('Error', 'Could not delete student: ' + err.message, 'error');
                    });
            }
        });
    }
};

window.editStudent = function(key, fName, lName, xp) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Manage Student Account',
            html: `
                <div class="text-start">
                    <label class="form-label text-muted small fw-bold mb-1">First Name</label>
                    <input id="edit-fname" class="swal2-input m-0 mb-3 w-100" value="${fName}">
                    <label class="form-label text-muted small fw-bold mb-1">Last Name</label>
                    <input id="edit-lname" class="swal2-input m-0 mb-3 w-100" value="${lName}">
                    <label class="form-label text-muted small fw-bold mb-1">Total XP</label>
                    <input id="edit-xp" type="number" class="swal2-input m-0 w-100" value="${xp}">
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Save Changes',
            preConfirm: () => {
                return {
                    firstName: document.getElementById('edit-fname').value.trim(),
                    lastName: document.getElementById('edit-lname').value.trim(),
                    xp: parseInt(document.getElementById('edit-xp').value) || 0
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const updates = result.value;
                db.ref('users/' + key).update(updates)
                    .then(() => {
                        if(typeof Toast !== 'undefined') Toast.fire({ icon: 'success', title: 'Student account updated!' });
                    })
                    .catch(err => Swal.fire('Error', 'Could not update student: ' + err.message, 'error'));
            }
        });
    }
};
