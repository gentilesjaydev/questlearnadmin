document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById('teachersTableBody');
    const registerBtn = document.getElementById('registerTeacherBtn');

    if(tableBody) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5"><i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>Connecting to Firebase...</td></tr>';

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                const usersRef = db.ref('users');
                
                // Read operation
                usersRef.on('value', (snapshot) => {
                    tableBody.innerHTML = ''; 
                    const data = snapshot.val();
                    let hasTeachers = false;
                    
                    if (data) {
                        Object.keys(data).forEach(key => {
                            const teacher = data[key];
                            
                            // Only show teachers
                            if(teacher.role === 'teacher') {
                                hasTeachers = true;
                                const firstName = teacher.firstName || '';
                                const lastName = teacher.lastName || '';
                                const name = (firstName + ' ' + lastName).trim() || 'Unnamed Teacher';
                                const email = teacher.email || 'No email';
                                const dept = teacher.department || 'Unassigned';
                                const status = teacher.status || 'Active';
                                const statusColor = status === 'Active' ? 'success' : 'secondary';
                                
                                const rowHtml = `
                                <tr>
                                    <td class="px-4 py-4 fw-medium text-dark d-flex align-items-center">
                                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=64748b" class="rounded-circle me-3" width="35">
                                        ${name}
                                    </td>
                                    <td class="px-4 py-4 text-muted">${email}</td>
                                    <td class="px-4 py-4 fw-medium text-dark">${dept}</td>
                                    <td class="px-4 py-4"><span class="badge bg-${statusColor} bg-opacity-10 text-${statusColor} px-3 py-2 rounded-pill border border-${statusColor} border-opacity-25">${status}</span></td>
                                    <td class="px-4 py-4 text-end">
                                        <button class="btn btn-sm btn-light me-2 rounded-3 shadow-sm" onclick="editTeacher('${key}', '${firstName.replace(/'/g, "\\'")}', '${lastName.replace(/'/g, "\\'")}', '${email}', '${dept}')" title="Edit"><i class="fa-solid fa-pen text-warning"></i></button>
                                        <button class="btn btn-sm btn-light rounded-3 shadow-sm" onclick="deleteTeacher('${key}', '${name.replace(/'/g, "\\'")}')" title="Delete"><i class="fa-solid fa-trash text-danger"></i></button>
                                    </td>
                                </tr>
                                `;
                                tableBody.innerHTML += rowHtml;
                            }
                        });
                    }
                    
                    if(!hasTeachers) {
                        tableBody.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center text-muted py-5">
                                <i class="fa-solid fa-users-slash fa-3x mb-3 text-secondary opacity-50"></i>
                                <h5>No Teachers Found</h5>
                                <p class="mb-0">There are no accounts with the 'teacher' role in the database.</p>
                            </td>
                        </tr>`;
                    }
                });

                // Create operation
                if(registerBtn) {
                    registerBtn.addEventListener('click', () => {
                        Swal.fire({
                            title: 'Register New Teacher',
                            html: `
                                <div class="text-start">
                                    <input id="new-fname" class="swal2-input mb-3 w-100 m-0" placeholder="First Name">
                                    <input id="new-lname" class="swal2-input mb-3 w-100 m-0" placeholder="Last Name">
                                    <input id="new-email" type="email" class="swal2-input mb-3 w-100 m-0" placeholder="Email Address">
                                    <input id="new-dept" class="swal2-input w-100 m-0" placeholder="Department (e.g. Science)">
                                </div>
                            `,
                            showCancelButton: true,
                            confirmButtonColor: '#4f46e5',
                            confirmButtonText: 'Create Teacher Account',
                            preConfirm: () => {
                                return {
                                    firstName: document.getElementById('new-fname').value.trim(),
                                    lastName: document.getElementById('new-lname').value.trim(),
                                    email: document.getElementById('new-email').value.trim(),
                                    department: document.getElementById('new-dept').value.trim(),
                                    role: 'teacher',
                                    status: 'Active'
                                }
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Pushing a new record to the database directly
                                db.ref('users').push(result.value)
                                    .then(() => Toast.fire({ icon: 'success', title: 'Teacher Database Record Created!' }))
                                    .catch(err => Swal.fire('Error', err.message, 'error'));
                            }
                        });
                    });
                }
            } else {
                window.location.href = '../auth/login';
            }
        });
    }
});

// Update operation
window.editTeacher = function(key, fName, lName, email, dept) {
    Swal.fire({
        title: 'Edit Teacher Details',
        html: `
            <div class="text-start">
                <label class="form-label text-muted small fw-bold mb-1">First Name</label>
                <input id="edit-fname" class="swal2-input m-0 mb-3 w-100" value="${fName}">
                <label class="form-label text-muted small fw-bold mb-1">Last Name</label>
                <input id="edit-lname" class="swal2-input m-0 mb-3 w-100" value="${lName}">
                <label class="form-label text-muted small fw-bold mb-1">Email</label>
                <input id="edit-email" type="email" class="swal2-input m-0 mb-3 w-100" value="${email}">
                <label class="form-label text-muted small fw-bold mb-1">Department</label>
                <input id="edit-dept" class="swal2-input m-0 w-100" value="${dept}">
            </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'Save Updates',
        preConfirm: () => {
            return {
                firstName: document.getElementById('edit-fname').value.trim(),
                lastName: document.getElementById('edit-lname').value.trim(),
                email: document.getElementById('edit-email').value.trim(),
                department: document.getElementById('edit-dept').value.trim()
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            db.ref('users/' + key).update(result.value)
                .then(() => Toast.fire({ icon: 'success', title: 'Teacher details updated' }))
                .catch(err => Swal.fire('Error', err.message, 'error'));
        }
    });
};

// Delete operation
window.deleteTeacher = function(key, name) {
    Swal.fire({
        title: 'Delete Teacher?',
        text: `Are you sure you want to permanently delete ${name} from Firebase?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Yes, delete!'
    }).then((result) => {
        if (result.isConfirmed) {
            db.ref('users/' + key).remove()
                .then(() => Toast.fire({ icon: 'success', title: 'Teacher deleted' }))
                .catch(err => Swal.fire('Error', err.message, 'error'));
        }
    });
};
