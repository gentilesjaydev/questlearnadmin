/**
 * admin_dashboard.js - Super Admin Hub Controller
 * Provides real-time administrative telemetry, institutional deployment matrix, and system health.
 */
document.addEventListener("DOMContentLoaded", function() {
    const activeTeachersStat = document.getElementById('activeTeachersStat');
    const totalSchoolsStat = document.getElementById('totalSchoolsStat');
    const totalSectionsStat = document.getElementById('totalSectionsStat');
    const totalStudentsStat = document.getElementById('totalStudentsStat');
    const adminsCountStat = document.getElementById('adminsCountStat');
    const teachersRosterBody = document.getElementById('teachersRosterBody');
    const schoolsOverviewBody = document.getElementById('schoolsOverviewBody');
    const systemStatusBadge = document.getElementById('systemStatusBadge');
    const currentAdminEmail = document.getElementById('currentAdminEmail');

    let allUsers = {};
    let allSchools = {};
    let allSections = {};

    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = '../auth/login';
            return;
        }

        // Verify Admin Access
        db.ref('users/' + user.uid).once('value').then((snap) => {
            const uData = snap.val() || {};
            const role = uData.role || sessionStorage.getItem('userRole');
            if (role !== 'admin') {
                // Non-admins (teachers) shouldn't be in Super Admin Hub
                window.location.href = '../../index';
                return;
            }

            if (currentAdminEmail) {
                currentAdminEmail.textContent = user.email || (uData.firstName ? `${uData.firstName} ${uData.lastName}` : 'Super Administrator');
            }
        });

        // Track Firebase Connection status
        db.ref('.info/connected').on('value', (snap) => {
            if (systemStatusBadge) {
                if (snap.val() === true) {
                    systemStatusBadge.innerHTML = '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1.5 rounded-pill"><i class="fa-solid fa-circle text-success me-1.5 fa-beat-fade"></i> Firebase RTDB Live</span>';
                } else {
                    systemStatusBadge.innerHTML = '<span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-1.5 rounded-pill"><i class="fa-solid fa-circle text-warning me-1.5"></i> Connecting...</span>';
                }
            }
        });

        // 1. Listen to Users
        db.ref('users').on('value', (snap) => {
            allUsers = snap.val() || {};
            updateMetrics();
            renderTeachersRoster();
            renderSchoolsOverview();
        });

        // 2. Listen to Schools
        db.ref('schools').on('value', (snap) => {
            allSchools = snap.val() || {};
            updateMetrics();
            renderSchoolsOverview();
        });

        // 3. Listen to Sections
        db.ref('sections').on('value', (snap) => {
            allSections = snap.val() || {};
            updateMetrics();
            renderSchoolsOverview();
        });
    });

    function updateMetrics() {
        let teacherCount = 0;
        let studentCount = 0;
        let adminCount = 0;

        Object.values(allUsers).forEach(u => {
            if (!u) return;
            const r = (u.role || '').toLowerCase();
            if (r === 'teacher') teacherCount++;
            else if (r === 'student' || !u.role) studentCount++;
            else if (r === 'admin') adminCount++;
        });

        const schoolCount = Object.keys(allSchools).length;
        const sectionCount = Object.keys(allSections).length;

        if (activeTeachersStat) activeTeachersStat.textContent = teacherCount;
        if (totalSchoolsStat) totalSchoolsStat.textContent = schoolCount;
        if (totalSectionsStat) totalSectionsStat.textContent = sectionCount;
        if (totalStudentsStat) totalStudentsStat.textContent = studentCount;
        if (adminsCountStat) adminsCountStat.textContent = adminCount;
    }

    function renderTeachersRoster() {
        if (!teachersRosterBody) return;
        teachersRosterBody.innerHTML = '';

        const teachers = [];
        Object.keys(allUsers).forEach(k => {
            const u = allUsers[k];
            if (u && u.role === 'teacher') {
                teachers.push({ key: k, ...u });
            }
        });

        if (teachers.length === 0) {
            teachersRosterBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-muted">
                        <i class="fa-solid fa-chalkboard-user fa-2x mb-2 text-secondary opacity-50"></i>
                        <p class="mb-0">No teachers registered yet.</p>
                        <a href="teachers" class="btn btn-sm btn-primary rounded-pill mt-2">
                            <i class="fa-solid fa-plus me-1"></i> Register First Teacher
                        </a>
                    </td>
                </tr>`;
            return;
        }

        // Show up to 6 teachers in the summary roster
        teachers.slice(0, 6).forEach(t => {
            const fName = t.firstName || '';
            const lName = t.lastName || '';
            const name = (fName + ' ' + lName).trim() || 'Unnamed Teacher';
            const email = t.email || 'No email';
            const school = t.school || 'Unassigned';
            const section = t.section || 'Unassigned';
            const grade = t.grade || 'Grade 6';

            const row = `
                <tr>
                    <td class="px-4 py-3">
                        <div class="d-flex align-items-center">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff" class="rounded-circle me-2.5" width="34" height="34">
                            <div>
                                <div class="fw-bold small text-dark">${name}</div>
                                <small class="text-muted" style="font-size:0.75rem;"><i class="fa-regular fa-envelope me-1"></i>${email}</small>
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2.5 py-1 small">
                            <i class="fa-solid fa-school me-1"></i>${school}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <span class="badge bg-light text-dark border rounded-pill px-2.5 py-1 small">
                            ${grade} • ${section}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                        <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1 small">
                            <i class="fa-solid fa-circle-check me-1"></i> Active
                        </span>
                    </td>
                    <td class="px-4 py-3 text-end">
                        <a href="teachers" class="btn btn-sm btn-light border rounded-3 text-primary shadow-sm" title="Manage in Teachers Panel">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    </td>
                </tr>
            `;
            teachersRosterBody.innerHTML += row;
        });
    }

    function renderSchoolsOverview() {
        if (!schoolsOverviewBody) return;
        schoolsOverviewBody.innerHTML = '';

        const sKeys = Object.keys(allSchools);
        if (sKeys.length === 0) {
            schoolsOverviewBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4 text-muted">
                        <i class="fa-solid fa-school-circle-xmark fa-2x mb-2 text-secondary opacity-50"></i>
                        <p class="mb-0">No campuses added yet.</p>
                        <a href="schools" class="btn btn-sm btn-outline-primary rounded-pill mt-2">
                            <i class="fa-solid fa-plus me-1"></i> Add Campus
                        </a>
                    </td>
                </tr>`;
            return;
        }

        sKeys.forEach(k => {
            const s = allSchools[k];
            const sName = s.name || 'Unnamed School';
            const district = s.district || 'Unassigned District';

            let teachersAssigned = 0;
            Object.values(allUsers).forEach(u => {
                if (u && u.role === 'teacher' && u.school && u.school.toLowerCase() === sName.toLowerCase()) {
                    teachersAssigned++;
                }
            });

            const row = `
                <tr>
                    <td class="px-4 py-3 fw-bold text-dark">
                        <i class="fa-solid fa-school text-primary me-2"></i> ${sName}
                    </td>
                    <td class="px-4 py-3 text-muted small">
                        ${district}
                    </td>
                    <td class="px-4 py-3 text-center">
                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2.5 py-1 fw-semibold small">
                            ${teachersAssigned} ${teachersAssigned === 1 ? 'Teacher' : 'Teachers'}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-end">
                        <a href="schools" class="btn btn-sm btn-light border rounded-3 text-primary shadow-sm" title="Manage Campus">
                            <i class="fa-solid fa-gear"></i>
                        </a>
                    </td>
                </tr>
            `;
            schoolsOverviewBody.innerHTML += row;
        });
    }
});
