/**
 * teachers.js - QuestLearn Teacher Account & Scoping Management
 * Securely registers teachers with Firebase Auth credentials and assigns them to specific Grade & Section scopes.
 */
document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById('teachersTableBody');
    const registerForm = document.getElementById('registerTeacherForm');
    const regSectionSelect = document.getElementById('teacherRegSectionSelect');
    const regSectionCustom = document.getElementById('teacherRegSectionCustom');
    const togglePasswordBtn = document.getElementById('toggleTeacherRegPassword');
    const regPasswordInput = document.getElementById('teacherRegPassword');
    const togglePasswordIcon = document.getElementById('toggleTeacherRegPasswordIcon');
    const errorAlert = document.getElementById('teacherRegisterErrorAlert');
    const errorMsg = document.getElementById('teacherRegisterErrorMsg');
    const submitBtn = document.getElementById('submitTeacherRegisterBtn');

    // ── Toggle Password Visibility ──────────────────────────────────────────
    if (togglePasswordBtn && regPasswordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            const isPassword = regPasswordInput.type === 'password';
            regPasswordInput.type = isPassword ? 'text' : 'password';
            if (togglePasswordIcon) {
                togglePasswordIcon.classList.toggle('fa-eye', !isPassword);
                togglePasswordIcon.classList.toggle('fa-eye-slash', isPassword);
            }
        });
    }

    // ── Toggle Custom Section Input ─────────────────────────────────────────
    if (regSectionSelect && regSectionCustom) {
        regSectionSelect.addEventListener('change', function() {
            if (this.value === 'Custom') {
                regSectionCustom.classList.remove('d-none');
                regSectionCustom.required = true;
                regSectionCustom.focus();
            } else {
                regSectionCustom.classList.add('d-none');
                regSectionCustom.required = false;
                regSectionCustom.value = '';
            }
        });
    }

    // ── Load & Display Teachers ─────────────────────────────────────────────
    if (tableBody) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                const usersRef = db.ref('users');
                
                usersRef.on('value', (snapshot) => {
                    tableBody.innerHTML = ''; 
                    const data = snapshot.val();
                    let hasTeachers = false;
                    
                    if (data) {
                        Object.keys(data).forEach(key => {
                            const teacher = data[key];
                            
                            if (teacher && teacher.role === 'teacher') {
                                hasTeachers = true;
                                const firstName = teacher.firstName || '';
                                const lastName = teacher.lastName || '';
                                const name = (firstName + ' ' + lastName).trim() || teacher.displayName || teacher.name || 'Unnamed Teacher';
                                const email = teacher.email || 'No email';
                                const grade = teacher.grade || 'Grade 6';
                                const section = teacher.section || 'Unassigned';
                                const dept = teacher.department || 'English';
                                const status = teacher.status || 'Active';
                                const statusColor = (status.toLowerCase() === 'active') ? 'success' : 'secondary';
                                
                                const rowHtml = `
                                <tr>
                                    <td class="px-4 py-3 fw-bold text-dark">
                                        <div class="d-flex align-items-center">
                                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=818cf8&color=ffffff&bold=true" class="rounded-circle me-3 shadow-sm" width="38" height="38">
                                            <div>
                                                <div>${name}</div>
                                                <small class="text-muted fw-normal">${dept}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-muted">
                                        <i class="fa-regular fa-envelope me-1 text-secondary"></i> ${email}
                                    </td>
                                    <td class="px-4 py-3">
                                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1.5 fw-semibold">
                                            <i class="fa-solid fa-chalkboard-user me-1.5"></i> ${grade} — ${section}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span class="badge bg-${statusColor} bg-opacity-10 text-${statusColor} px-3 py-1.5 rounded-pill border border-${statusColor} border-opacity-25 fw-semibold">
                                            <i class="fa-solid fa-circle-check me-1"></i> ${status}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-end text-nowrap">
                                        <button class="btn btn-sm btn-light border me-1 rounded-3 shadow-sm text-primary" 
                                            onclick="editTeacher('${key}', '${firstName.replace(/'/g, "\\'")}', '${lastName.replace(/'/g, "\\'")}', '${email}', '${grade.replace(/'/g, "\\'")}', '${section.replace(/'/g, "\\'")}', '${dept.replace(/'/g, "\\'")}')" 
                                            title="Edit Class Assignment">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button class="btn btn-sm btn-light border me-1 rounded-3 shadow-sm text-warning" 
                                            onclick="resetTeacherPassword('${email}', '${name.replace(/'/g, "\\'")}')" 
                                            title="Send Password Reset Email">
                                            <i class="fa-solid fa-key"></i>
                                        </button>
                                        <button class="btn btn-sm btn-light border rounded-3 shadow-sm text-danger" 
                                            onclick="deleteTeacher('${key}', '${name.replace(/'/g, "\\'")}')" 
                                            title="Remove Teacher">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                                `;
                                tableBody.innerHTML += rowHtml;
                            }
                        });
                    }
                    
                    if (!hasTeachers) {
                        tableBody.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center text-muted py-5">
                                <i class="fa-solid fa-chalkboard-user fa-3x mb-3 text-secondary opacity-50"></i>
                                <h5 class="fw-bold">No Teachers Registered</h5>
                                <p class="mb-0">Click the <strong>Register Teacher</strong> button above to add educator accounts with class assignments.</p>
                            </td>
                        </tr>`;
                    }
                });
            } else {
                window.location.href = '../auth/login';
            }
        });
    }

    // ── Form Submission: Register New Teacher with Firebase Auth & Section ─
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (errorAlert) errorAlert.classList.add('d-none');

            const fName = document.getElementById('teacherRegFirstName').value.trim();
            const lName = document.getElementById('teacherRegLastName').value.trim();
            const email = document.getElementById('teacherRegEmail').value.trim();
            const password = regPasswordInput.value;
            const grade = document.getElementById('teacherRegGradeSelect').value;
            let section = regSectionSelect.value;
            if (section === 'Custom') {
                section = regSectionCustom.value.trim();
            }
            const dept = document.getElementById('teacherRegDept').value.trim() || 'English';

            if (!fName || !lName || !email || !password || !section) {
                if (errorAlert && errorMsg) {
                    errorMsg.innerText = 'Please complete all required fields.';
                    errorAlert.classList.remove('d-none');
                }
                return;
            }

            if (password.length < 6) {
                if (errorAlert && errorMsg) {
                    errorMsg.innerText = 'Password must be at least 6 characters.';
                    errorAlert.classList.remove('d-none');
                }
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-2"></i> Creating Account...';
            }

            try {
                // Secondary app pattern so admin session remains logged in
                let secondaryApp = null;
                try {
                    secondaryApp = firebase.initializeApp(firebaseConfig, "TeacherRegistrationWorker");
                } catch(err) {
                    secondaryApp = firebase.app("TeacherRegistrationWorker");
                }

                // Create Firebase Authentication credentials
                const userCred = await secondaryApp.auth().createUserWithEmailAndPassword(email, password);
                const teacherUid = userCred.user.uid;

                // Write teacher record under users/{uid}
                const teacherRecord = {
                    uid: teacherUid,
                    firstName: fName,
                    lastName: lName,
                    email: email,
                    role: 'teacher',
                    grade: grade,
                    section: section,
                    department: dept,
                    status: 'Active',
                    createdAt: Date.now()
                };

                await db.ref('users/' + teacherUid).set(teacherRecord);
                await secondaryApp.auth().signOut();

                // Close Modal
                const modalEl = document.getElementById('registerTeacherModal');
                const modalInst = bootstrap.Modal.getInstance(modalEl);
                if (modalInst) modalInst.hide();

                registerForm.reset();
                if (regSectionCustom) regSectionCustom.classList.add('d-none');

                Swal.fire({
                    icon: 'success',
                    title: 'Teacher Account Created!',
                    html: `
                        <p class="mb-2"><strong>${fName} ${lName}</strong> has been registered successfully.</p>
                        <div class="p-3 bg-light rounded text-start small border">
                            <div><strong>Email:</strong> ${email}</div>
                            <div><strong>Assigned Scope:</strong> ${grade} — ${section}</div>
                            <div><strong>Department:</strong> ${dept}</div>
                        </div>
                        <small class="text-muted d-block mt-2">The teacher can now log in via <code>pages/auth/login</code> using this email and password.</small>
                    `,
                    confirmButtonColor: '#4f46e5'
                });
            } catch (err) {
                console.error("Teacher creation error:", err);
                let msg = err.message || 'Failed to create teacher account.';
                if (err.code === 'auth/email-already-in-use') {
                    msg = 'This email address is already in use by another account.';
                } else if (err.code === 'auth/invalid-email') {
                    msg = 'The email address format is invalid.';
                } else if (err.code === 'auth/weak-password') {
                    msg = 'Password should be at least 6 characters.';
                }
                if (errorAlert && errorMsg) {
                    errorMsg.innerText = msg;
                    errorAlert.classList.remove('d-none');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fa-solid fa-circle-check me-1.5"></i> Create Teacher Account';
                }
            }
        });
    }
});

// ── Update Operation: Edit Teacher Details & Class Scope ──────────────────
window.editTeacher = function(key, fName, lName, email, grade, section, dept) {
    Swal.fire({
        title: 'Edit Teacher Details & Class',
        html: `
            <div class="text-start">
                <div class="row g-2 mb-2">
                    <div class="col-6">
                        <label class="form-label text-muted small fw-bold mb-1">First Name</label>
                        <input id="edit-fname" class="swal2-input m-0 w-100" value="${fName}">
                    </div>
                    <div class="col-6">
                        <label class="form-label text-muted small fw-bold mb-1">Last Name</label>
                        <input id="edit-lname" class="swal2-input m-0 w-100" value="${lName}">
                    </div>
                </div>
                <div class="mb-2">
                    <label class="form-label text-muted small fw-bold mb-1">Email</label>
                    <input id="edit-email" type="email" class="swal2-input m-0 w-100" value="${email}">
                </div>
                <div class="row g-2 mb-2">
                    <div class="col-6">
                        <label class="form-label text-muted small fw-bold mb-1">Grade Level</label>
                        <input id="edit-grade" class="swal2-input m-0 w-100" value="${grade || 'Grade 6'}">
                    </div>
                    <div class="col-6">
                        <label class="form-label text-muted small fw-bold mb-1">Assigned Section</label>
                        <input id="edit-section" class="swal2-input m-0 w-100" value="${section || 'Apitong'}">
                    </div>
                </div>
                <div class="mb-0">
                    <label class="form-label text-muted small fw-bold mb-1">Department</label>
                    <input id="edit-dept" class="swal2-input m-0 w-100" value="${dept || 'English'}">
                </div>
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
                grade: document.getElementById('edit-grade').value.trim(),
                section: document.getElementById('edit-section').value.trim(),
                department: document.getElementById('edit-dept').value.trim()
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            db.ref('users/' + key).update(result.value)
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Teacher Updated!',
                        text: 'Teacher details and class section assignment have been saved.',
                        timer: 1800,
                        showConfirmButton: false
                    });
                })
                .catch(err => Swal.fire('Error', err.message, 'error'));
        }
    });
};

// ── Password Reset Operation ──────────────────────────────────────────────
window.resetTeacherPassword = function(email, name) {
    Swal.fire({
        title: 'Reset Password?',
        html: `Send an official Firebase password reset link to <strong>${name}</strong> at <code>${email}</code>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#eab308',
        confirmButtonText: '<i class="fa-solid fa-paper-plane me-1"></i> Send Reset Link'
    }).then((result) => {
        if (result.isConfirmed) {
            firebase.auth().sendPasswordResetEmail(email)
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Reset Email Sent!',
                        text: `A password reset link has been dispatched to ${email}.`,
                        confirmButtonColor: '#4f46e5'
                    });
                })
                .catch(err => {
                    Swal.fire('Error', err.message, 'error');
                });
        }
    });
};

// ── Delete Operation ──────────────────────────────────────────────────────
window.deleteTeacher = function(key, name) {
    Swal.fire({
        title: 'Delete Teacher?',
        text: `Are you sure you want to remove ${name} from the database?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Yes, delete!'
    }).then((result) => {
        if (result.isConfirmed) {
            db.ref('users/' + key).remove()
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Teacher Deleted',
                        timer: 1500,
                        showConfirmButton: false
                    });
                })
                .catch(err => Swal.fire('Error', err.message, 'error'));
        }
    });
};
