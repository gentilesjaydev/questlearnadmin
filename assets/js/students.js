let studentPieChartInstance = null;
let studentCategoryChartInstance = null;
let studentBloomChartInstance = null;
let studentCompetencyChartInstance = null;
let currentViewedStudent = null;
let allUsersData = {};
let allStudentsList = [];
let availableGradesMap = {}; // e.g. { "Grade 6": ["Acacia", "Mabini"], "grade 7": ["A"] }

// Helper: Scan student record for latest gameplay or quiz attempt timestamp
function getStudentLastPlayedAt(student) {
    if (!student) return null;
    let latest = 0;

    // Check gameStats.lastPlayedAt
    if (student.gameStats && student.gameStats.lastPlayedAt) {
        latest = Math.max(latest, Number(student.gameStats.lastPlayedAt) || 0);
    }

    // Check gameHistory entries
    if (student.gameHistory && typeof student.gameHistory === 'object') {
        Object.values(student.gameHistory).forEach(h => {
            if (h && h.at) latest = Math.max(latest, Number(h.at) || 0);
            if (h && h.timestamp) latest = Math.max(latest, Number(h.timestamp) || 0);
        });
    }

    // Check gameLevels lastPlayedAt
    if (student.gameLevels && typeof student.gameLevels === 'object') {
        Object.values(student.gameLevels).forEach(lvl => {
            if (lvl && lvl.lastPlayedAt) latest = Math.max(latest, Number(lvl.lastPlayedAt) || 0);
        });
    }

    // Check firstAttempts
    if (student.firstAttempts && typeof student.firstAttempts === 'object') {
        Object.values(student.firstAttempts).forEach(att => {
            if (att && att.completedAt) latest = Math.max(latest, Number(att.completedAt) || 0);
            if (att && att.timestamp) latest = Math.max(latest, Number(att.timestamp) || 0);
        });
    }

    return latest > 0 ? latest : null;
}

// Pure Read-Time Helper: Extract true First-Attempt baseline without altering Firebase database
function extractStudentFirstAttemptStats(student) {
    if (!student) return { totalAnswers: 0, totalCorrect: 0, totalWrong: 0, retryCount: 0, categories: {} };

    // 1. If explicit firstAttemptStats exists, use directly
    if (student.firstAttemptStats && (student.firstAttemptStats.totalAnswers > 0 || student.firstAttemptStats.totalCorrect > 0)) {
        return {
            totalAnswers: Number(student.firstAttemptStats.totalAnswers) || 0,
            totalCorrect: Number(student.firstAttemptStats.totalCorrect) || 0,
            totalWrong: Number(student.firstAttemptStats.totalWrong) || 0,
            retryCount: Number(student.retryCount) || 0,
            categories: student.firstAttemptStats.categories || {}
        };
    }

    function normalizeCat(cat) {
        const c = String(cat || '').toLowerCase().replace(/[\s_-]+/g, '');
        if (c.includes('gram')) return 'grammar';
        if (c.includes('vocab')) return 'vocabulary';
        if (c.includes('read') || c.includes('comprehen')) return 'reading';
        if (c.includes('spell')) return 'spelling';
        return 'information_literacy';
    }

    let categories = {
        grammar: { correct: 0, wrong: 0, total: 0 },
        vocabulary: { correct: 0, wrong: 0, total: 0 },
        reading: { correct: 0, wrong: 0, total: 0 },
        spelling: { correct: 0, wrong: 0, total: 0 },
        information_literacy: { correct: 0, wrong: 0, total: 0 }
    };

    let totalCorrect = 0;
    let totalWrong = 0;
    let retryCount = 0;

    // 2. Derive strictly from gameHistory level_complete events with firstClear === true
    if (student.gameHistory && typeof student.gameHistory === 'object') {
        const levelClears = {};
        let replayRuns = 0;

        const entries = Object.values(student.gameHistory)
            .filter(e => e && typeof e === 'object')
            .sort((a, b) => (Number(a.at || a.timestamp) || 0) - (Number(b.at || b.timestamp) || 0));

        entries.forEach(e => {
            if (e.type === 'level_complete') {
                const cat = normalizeCat(e.category || e.questKind);
                const lvl = e.questLevel || e.level || 1;
                const levelKey = `${cat}_L${lvl}`;

                if (e.firstClear === true || !levelClears[levelKey]) {
                    if (!levelClears[levelKey]) {
                        levelClears[levelKey] = {
                            correct: Number(e.correct) || 0,
                            wrong: Number(e.wrong) || 0
                        };
                    }
                } else {
                    replayRuns++;
                }
            }
        });

        const clearedKeys = Object.keys(levelClears);
        if (clearedKeys.length > 0) {
            clearedKeys.forEach(k => {
                const item = levelClears[k];
                const cat = k.split('_L')[0];
                const c = item.correct;
                const w = item.wrong;
                totalCorrect += c;
                totalWrong += w;
                if (categories[cat]) {
                    categories[cat].correct += c;
                    categories[cat].wrong += w;
                    categories[cat].total += (c + w);
                }
            });

            if (student.gameLevels && typeof student.gameLevels === 'object') {
                Object.values(student.gameLevels).forEach(gl => {
                    const plays = Number(gl.plays) || 0;
                    if (plays > 1) retryCount += (plays - 1);
                });
            } else {
                retryCount = replayRuns;
            }

            return {
                totalAnswers: totalCorrect + totalWrong,
                totalCorrect: totalCorrect,
                totalWrong: totalWrong,
                retryCount: retryCount,
                categories: categories
            };
        }

        // In-progress questions answered before level completion
        const seenQuestionLevel = {};
        entries.forEach(e => {
            if (e.correct !== undefined && e.type !== 'level_complete') {
                const cat = normalizeCat(e.category || e.questKind);
                const lvl = e.level || 1;
                const key = `${cat}_L${lvl}`;
                if (!seenQuestionLevel[key]) seenQuestionLevel[key] = { correct: 0, wrong: 0 };
                if (e.correct === true) seenQuestionLevel[key].correct++;
                else if (e.correct === false) seenQuestionLevel[key].wrong++;
            }
        });

        Object.keys(seenQuestionLevel).forEach(k => {
            const cat = k.split('_L')[0];
            const c = seenQuestionLevel[k].correct;
            const w = seenQuestionLevel[k].wrong;
            totalCorrect += c;
            totalWrong += w;
            if (categories[cat]) {
                categories[cat].correct += c;
                categories[cat].wrong += w;
                categories[cat].total += (c + w);
            }
        });

        if (totalCorrect + totalWrong > 0) {
            return {
                totalAnswers: totalCorrect + totalWrong,
                totalCorrect: totalCorrect,
                totalWrong: totalWrong,
                retryCount: retryCount,
                categories: categories
            };
        }
    }

    // 3. Fallback: gameLevels or gameStats
    if (student.gameLevels && typeof student.gameLevels === 'object') {
        Object.values(student.gameLevels).forEach(gl => {
            const c = Number(gl.correct) || 0;
            const w = Number(gl.wrong) || 0;
            const plays = Number(gl.plays) || 1;
            const estC = plays > 0 ? Math.round(c / plays) : c;
            const estW = plays > 0 ? Math.round(w / plays) : w;
            totalCorrect += estC;
            totalWrong += estW;
            if (plays > 1) retryCount += (plays - 1);

            const cat = normalizeCat(gl.category || gl.questKind);
            if (categories[cat]) {
                categories[cat].correct += estC;
                categories[cat].wrong += estW;
                categories[cat].total += (estC + estW);
            }
        });

        if (totalCorrect + totalWrong > 0) {
            return {
                totalAnswers: totalCorrect + totalWrong,
                totalCorrect: totalCorrect,
                totalWrong: totalWrong,
                retryCount: retryCount,
                categories: categories
            };
        }
    }

    // 4. Ultimate fallback: gameStats
    if (student.gameStats) {
        return {
            totalAnswers: Number(student.gameStats.totalAnswers) || 0,
            totalCorrect: Number(student.gameStats.totalCorrect) || 0,
            totalWrong: Number(student.gameStats.totalWrong) || 0,
            retryCount: Number(student.retryCount) || 0,
            categories: categories
        };
    }

    return { totalAnswers: 0, totalCorrect: 0, totalWrong: 0, retryCount: 0, categories: categories };
}

// Helper: Format exact date & time with seconds
function formatExactDateTime(timestamp) {
    if (!timestamp) return 'No Attempts Yet';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) + ' at ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

// Helper: Format human-friendly relative time
function formatRelativeTime(timestamp) {
    if (!timestamp) return '';
    const now = Date.now();
    const diffSec = Math.floor((now - timestamp) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

document.addEventListener("DOMContentLoaded", function() {
    const studentTableBody = document.getElementById('studentTableBody');
    const sectionFilterSelect = document.getElementById('sectionFilterSelect');
    const studentSearchInput = document.getElementById('studentSearchInput');
    const regGradeSelect = document.getElementById('regGrade');
    const regSectionSelect = document.getElementById('regSectionSelect');
    const regSectionCustom = document.getElementById('regSectionCustom');
    const registerStudentForm = document.getElementById('registerStudentForm');
    const submitRegisterBtn = document.getElementById('submitRegisterBtn');
    const registerErrorAlert = document.getElementById('registerErrorAlert');
    const registerErrorMsg = document.getElementById('registerErrorMsg');
    const toggleRegPassword = document.getElementById('toggleRegPassword');
    const regPassword = document.getElementById('regPassword');
    const toggleRegPasswordIcon = document.getElementById('toggleRegPasswordIcon');

    // Password visibility toggle in registration modal
    if (toggleRegPassword && regPassword && toggleRegPasswordIcon) {
        toggleRegPassword.addEventListener('click', () => {
            const isPass = regPassword.type === 'password';
            regPassword.type = isPass ? 'text' : 'password';
            toggleRegPasswordIcon.classList.toggle('fa-eye', !isPass);
            toggleRegPasswordIcon.classList.toggle('fa-eye-slash', isPass);
        });
    }

    // Toggle custom section input in modal
    if (regSectionSelect && regSectionCustom) {
        regSectionSelect.addEventListener('change', function() {
            if (this.value === 'Custom') {
                regSectionCustom.classList.remove('d-none');
                regSectionCustom.required = true;
                regSectionCustom.focus();
            } else {
                regSectionCustom.classList.add('d-none');
                regSectionCustom.required = false;
            }
        });
    }

    // Update registration section dropdown when grade level changes
    function updateRegSectionsDropdown() {
        if (!regGradeSelect || !regSectionSelect) return;
        const selGrade = regGradeSelect.value;
        const sections = availableGradesMap[selGrade] || ['Acacia', 'Mabini', 'Rizal'];
        
        regSectionSelect.innerHTML = '<option value="" disabled selected>Select Section...</option>';
        sections.forEach(sName => {
            const opt = document.createElement('option');
            opt.value = sName;
            opt.textContent = sName;
            regSectionSelect.appendChild(opt);
        });
        const customOpt = document.createElement('option');
        customOpt.value = "Custom";
        customOpt.textContent = "+ Type custom section";
        regSectionSelect.appendChild(customOpt);
    }

    if (regGradeSelect) {
        regGradeSelect.addEventListener('change', updateRegSectionsDropdown);
    }

    // Live section filter listener
    if (sectionFilterSelect) {
        sectionFilterSelect.addEventListener('change', () => {
            renderStudentsTable();
        });
    }

    // Live search input listener
    if (studentSearchInput) {
        studentSearchInput.addEventListener('input', () => {
            renderStudentsTable();
        });
    }

    // Load available Grade 6 sections from Firebase Realtime Database
    db.ref('grades').on('value', (snapshot) => {
        const gradesData = snapshot.val() || {};
        let grade6Sections = [];
        
        Object.keys(gradesData).forEach(gKey => {
            const gObj = gradesData[gKey];
            const gradeName = (gObj.name || gKey).toLowerCase();
            
            // Only extract sections for Grade 6
            if (gradeName.includes('6') || gradeName.includes('six')) {
                if (gObj.sections) {
                    Object.keys(gObj.sections).forEach(sKey => {
                        const sObj = gObj.sections[sKey];
                        const secName = sObj.name || sKey;
                        if (!grade6Sections.includes(secName)) {
                            grade6Sections.push(secName);
                        }
                    });
                }
            }
        });

        // Default sections if none found in DB yet
        if (grade6Sections.length === 0) {
            grade6Sections = ['Acacia', 'Mabini', 'Rizal', 'Sampaguita'];
        }

        // Also include any section currently present on active students
        allStudentsList.forEach(s => {
            if (s.section && s.section !== 'Unassigned' && !grade6Sections.includes(s.section)) {
                grade6Sections.push(s.section);
            }
        });

        // Populate toolbar section filter dropdown
        if (sectionFilterSelect) {
            const currentSelected = sectionFilterSelect.value;
            sectionFilterSelect.innerHTML = '<option value="ALL">All Grade 6 Sections</option>';
            grade6Sections.forEach(sec => {
                const opt = document.createElement('option');
                opt.value = sec;
                opt.textContent = `Section ${sec}`;
                sectionFilterSelect.appendChild(opt);
            });

            if (currentSelected && Array.from(sectionFilterSelect.options).some(o => o.value === currentSelected)) {
                sectionFilterSelect.value = currentSelected;
            }
        }

        // Populate registration modal section dropdown
        if (regSectionSelect) {
            regSectionSelect.innerHTML = '<option value="" disabled selected>Select Section...</option>';
            grade6Sections.forEach(sec => {
                const opt = document.createElement('option');
                opt.value = sec;
                opt.textContent = `Section ${sec}`;
                regSectionSelect.appendChild(opt);
            });
            const customOpt = document.createElement('option');
            customOpt.value = 'Custom';
            customOpt.textContent = '+ Type custom section';
            regSectionSelect.appendChild(customOpt);
        }
    });

    // Handle Student Registration Form Submission (FR 1)
    if (registerStudentForm) {
        registerStudentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (registerErrorAlert) registerErrorAlert.classList.add('d-none');
            
            const fName = document.getElementById('regFirstName').value.trim();
            const lName = document.getElementById('regLastName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const grade = regGradeSelect ? regGradeSelect.value : 'Grade 6';
            let section = regSectionSelect ? regSectionSelect.value : 'Acacia';
            
            if (section === 'Custom' && regSectionCustom) {
                section = regSectionCustom.value.trim();
            }

            if (!section) {
                if (registerErrorAlert && registerErrorMsg) {
                    registerErrorMsg.innerText = 'Please select or enter a class section.';
                    registerErrorAlert.classList.remove('d-none');
                }
                return;
            }

            if (password.length < 6) {
                if (registerErrorAlert && registerErrorMsg) {
                    registerErrorMsg.innerText = 'Password must be at least 6 characters.';
                    registerErrorAlert.classList.remove('d-none');
                }
                return;
            }

            submitRegisterBtn.disabled = true;
            submitRegisterBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-1.5"></i> Creating Account...';

            try {
                // Use a secondary Firebase app so teacher's session is not logged out
                let secondaryApp = null;
                try {
                    secondaryApp = firebase.initializeApp(firebaseConfig, "StudentRegistrationWorker");
                } catch(err) {
                    secondaryApp = firebase.app("StudentRegistrationWorker");
                }

                const userCred = await secondaryApp.auth().createUserWithEmailAndPassword(email, password);
                const uid = userCred.user.uid;

                const studentRecord = {
                    uid: uid,
                    firstName: fName,
                    lastName: lName,
                    email: email,
                    grade: grade,
                    section: section,
                    role: 'student',
                    level: 1,
                    accountLevel: 1,
                    xp: 0,
                    hp: 100,
                    hpMax: 100,
                    status: 'active',
                    createdAt: Date.now()
                };

                // Store in RTDB under users/{uid}
                await db.ref('users/' + uid).set(studentRecord);
                await secondaryApp.auth().signOut();

                // Close Bootstrap modal
                const modalEl = document.getElementById('registerStudentModal');
                const modalInst = bootstrap.Modal.getInstance(modalEl);
                if (modalInst) modalInst.hide();

                registerStudentForm.reset();
                if (regSectionCustom) regSectionCustom.classList.add('d-none');

                Swal.fire({
                    icon: 'success',
                    title: 'Student Account Created!',
                    text: `${fName} ${lName} has been enrolled in ${grade} - ${section}.`,
                    timer: 3500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            } catch(authErr) {
                let msg = authErr.message;
                if (authErr.code === 'auth/email-already-in-use') {
                    msg = 'This email is already registered by another student or teacher.';
                } else if (authErr.code === 'auth/weak-password') {
                    msg = 'The password must be at least 6 characters long.';
                } else if (authErr.code === 'auth/invalid-email') {
                    msg = 'Please enter a valid email address.';
                }
                
                if (registerErrorAlert && registerErrorMsg) {
                    registerErrorMsg.innerText = msg;
                    registerErrorAlert.classList.remove('d-none');
                } else {
                    Swal.fire('Registration Failed', msg, 'error');
                }
            } finally {
                submitRegisterBtn.disabled = false;
                submitRegisterBtn.innerHTML = '<i class="fa-solid fa-circle-check me-1.5"></i> Create Student Account';
            }
        });
    }

    // Render Student Table with Live Search and Section Filtering
    function renderStudentsTable() {
        if (!studentTableBody) return;
        const query = studentSearchInput ? studentSearchInput.value.toLowerCase().trim() : '';
        const selectedFilter = sectionFilterSelect ? sectionFilterSelect.value : 'ALL';

        let filtered = allStudentsList.filter(s => {
            // Check Section filter (Grade 6)
            if (selectedFilter !== 'ALL') {
                if ((s.section || '').toLowerCase() !== selectedFilter.toLowerCase()) {
                    return false;
                }
            }

            // Check Search query
            if (query) {
                const matchName = s.name.toLowerCase().includes(query);
                const matchEmail = (s.email || '').toLowerCase().includes(query);
                const matchSection = (s.section || '').toLowerCase().includes(query);
                if (!matchName && !matchEmail && !matchSection) {
                    return false;
                }
            }

            return true;
        });

        // Update count badge
        const countBadge = document.getElementById('studentCountBadge');
        if (countBadge) {
            if (query || selectedFilter !== 'ALL') {
                countBadge.innerHTML = `<i class="fa-solid fa-filter me-1"></i> Showing ${filtered.length} of ${allStudentsList.length} Students`;
            } else {
                countBadge.innerHTML = `<i class="fa-solid fa-users me-1"></i> ${allStudentsList.length} Grade 6 Students`;
            }
        }

        studentTableBody.innerHTML = '';
        if (filtered.length === 0) {
            studentTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-5">
                        <i class="fa-solid fa-user-slash fa-3x mb-3 text-secondary opacity-50"></i>
                        <h5>No Matching Students Found</h5>
                        <p class="mb-0">Try clearing your search query or switching to 'All Grade 6 Sections'.</p>
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(student => {
            const rowHtml = `
            <tr>
                <td class="px-3 py-2.5 fw-medium text-dark text-nowrap">
                    <div class="d-flex align-items-center">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=e2e8f0&color=64748b" class="rounded-circle me-2.5" width="34" height="34">
                        <div>
                            <div class="fw-bold small text-truncate" style="max-width: 160px;">${student.name}</div>
                            <small class="text-muted text-truncate d-block" style="font-size:0.75rem; max-width: 160px;"><i class="fa-regular fa-envelope me-1"></i>${student.email || 'No email'}</small>
                        </div>
                    </div>
                </td>
                <td class="px-3 py-2.5 text-nowrap">
                    <span class="badge bg-light text-dark border px-2.5 py-1.5 rounded-pill" style="font-size:0.78rem;">
                        <i class="fa-solid fa-graduation-cap text-primary me-1"></i>Section ${student.section}
                    </span>
                </td>
                <td class="px-3 py-2.5 text-nowrap">
                    <span class="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1.5 rounded-pill border border-primary border-opacity-25" style="font-size:0.78rem;">
                        <i class="fa-solid fa-medal me-1"></i> Lvl ${student.level} | ❤️ ${student.hp}/100
                    </span>
                </td>
                <td class="px-3 py-2.5 text-nowrap">
                    ${student.lastPlayedAt ? `
                        <div class="d-flex flex-column">
                            <span class="fw-bold text-dark" style="font-size: 0.8rem;">
                                <i class="fa-regular fa-calendar-check me-1 text-primary"></i>${new Date(student.lastPlayedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <div class="text-muted" style="font-size:0.72rem;">
                                <i class="fa-regular fa-clock me-1"></i>${new Date(student.lastPlayedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                <span class="text-primary fw-semibold ms-1">(${formatRelativeTime(student.lastPlayedAt)})</span>
                            </div>
                        </div>
                    ` : `
                        <span class="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-1 rounded-pill" style="font-size: 0.75rem;">
                            <i class="fa-solid fa-clock me-1"></i>No Attempts
                        </span>
                    `}
                </td>
                <td class="px-3 py-2.5 fw-bold text-nowrap" style="color: #10b981; font-size: 0.88rem;">
                    ${student.xp.toLocaleString()} XP
                </td>
                <td class="px-3 py-2.5 text-end text-nowrap" style="min-width: 120px;">
                    <div class="d-inline-flex gap-1 justify-content-end align-items-center">
                        <button class="btn btn-sm btn-light rounded-3 shadow-sm border px-2 py-1" onclick="viewStudent('${student.key}', '${student.name.replace(/'/g, "\\'")}', ${student.xp}, ${student.level}, ${student.hp}, 'Grade 6', '${student.section.replace(/'/g, "\\'")}')" title="View Profile Analytics"><i class="fa-solid fa-eye text-primary"></i></button>
                        <button class="btn btn-sm btn-light rounded-3 shadow-sm border px-2 py-1" onclick="editStudent('${student.key}', '${student.firstName.replace(/'/g, "\\'")}', '${student.lastName.replace(/'/g, "\\'")}', ${student.xp}, '${student.section.replace(/'/g, "\\'")}')" title="Edit Student & Section"><i class="fa-solid fa-pen text-warning"></i></button>
                        <button class="btn btn-sm btn-light rounded-3 shadow-sm border px-2 py-1" onclick="deleteStudent('${student.key}', '${student.name.replace(/'/g, "\\'")}')" title="Delete Account"><i class="fa-solid fa-trash text-danger"></i></button>
                    </div>
                </td>
            </tr>
            `;
            studentTableBody.innerHTML += rowHtml;
        });
    }

    if(studentTableBody) {
        studentTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5"><i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>Checking Authentication...</td></tr>';

        // Wait for Firebase to confirm the user is logged in before fetching data
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                studentTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5"><i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>Syncing Users with Firebase...</td></tr>';
                
                const usersRef = db.ref('users');
                
                usersRef.on('value', (snapshot) => {
                    const data = snapshot.val();
                    allUsersData = data || {};
                    allStudentsList = [];
                    
                    if (data) {
                        Object.keys(data).forEach(key => {
                            const student = data[key];
                            
                            if(student.role === 'student' || !student.role) {
                                const firstName = student.firstName || '';
                                const lastName = student.lastName || '';
                                const name = (firstName + ' ' + lastName).trim() || 'Anonymous Student';
                                // XP: check root xp first, then nested gameStats, then totalXP, totalPoints, points
                                const xp = student.xp
                                    || (student.gameStats && (student.gameStats.totalXP || student.gameStats.xp || student.gameStats.totalPoints))
                                    || student.totalXP
                                    || student.totalPoints
                                    || student.points
                                    || 0;
                                const level = student.level || student.accountLevel || 1;
                                const hp = student.hp !== undefined ? student.hp : 100;
                                const grade = student.grade || student.gradeLevel || 'Grade 6';
                                const section = student.section || 'Unassigned';
                                const email = student.email || '';
                                const lastPlayedAt = getStudentLastPlayedAt(student);

                                allStudentsList.push({
                                    key: key,
                                    name: name,
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: email,
                                    xp: xp,
                                    level: level,
                                    hp: hp,
                                    grade: grade,
                                    section: section,
                                    lastPlayedAt: lastPlayedAt,
                                    raw: student
                                });
                            }
                        });
                    }
                    
                    // Render the table with filters
                    renderStudentsTable();
                }, (error) => {
                    studentTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-danger py-5">
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
                studentTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger py-5">
                        <i class="fa-solid fa-lock fa-3x mb-3"></i>
                        <h5>Authentication Required</h5>
                        <p>You must be logged in to Firebase to view live student data.</p>
                    </td>
                </tr>`;
            }
        });
    }

    // Individual Student AI Insights
    const studentAiBtn = document.getElementById('studentAiBtn');
    if (studentAiBtn) {
        studentAiBtn.addEventListener('click', async () => {
            if (!currentViewedStudent) return;
            
            const resultBox = document.getElementById('studentAiResult');
            studentAiBtn.disabled = true;
            studentAiBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-2"></i> Analyzing...';
            resultBox.innerHTML = '<div class="text-center text-muted p-3"><i class="fa-solid fa-brain fa-2x mb-2 text-primary fa-fade"></i><br>Analyzing student behavior with Qwen 27B...</div>';
            resultBox.classList.remove('d-none');

            try {
                // Clean student payload
                const cleanStudent = {
                    name: currentViewedStudent.name,
                    level: currentViewedStudent.level,
                    hp: currentViewedStudent.hp,
                    xp: currentViewedStudent.xp,
                    accuracy: currentViewedStudent.accuracy,
                    correctAnswers: currentViewedStudent.correctAnswers,
                    wrongAnswers: currentViewedStudent.wrongAnswers,
                    totalAnswered: currentViewedStudent.totalAnswered,
                    practiceRetries: currentViewedStudent.retryCount || 0
                };

                const payload = { stats: cleanStudent, scope: "individual" };
                const response = await fetch('../../backend/api/groq_analytics.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.success) {
                    resultBox.innerHTML = `
                        <div class="d-flex flex-wrap align-items-center justify-content-between border-bottom pb-2 mb-3 gap-2">
                            <div class="fw-bold text-primary d-flex align-items-center">
                                <i class="fa-solid fa-sparkles me-2 text-warning"></i>
                                <span>Personalized NATG6 Diagnostic Profile</span>
                            </div>
                            <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1 small">
                                <i class="fa-solid fa-check me-1"></i> Generated Successfully
                            </span>
                        </div>
                        <div class="ai-generated-content small" style="line-height: 1.65;">
                            ${result.data}
                        </div>
                    `;

                    Swal.fire({
                        icon: 'success',
                        title: 'Student Insight Generated!',
                        text: `Diagnostic profile for ${currentViewedStudent.name} is ready.`,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true
                    });
                } else {
                    throw new Error(result.error || 'Failed to generate insights');
                }
            } catch (err) {
                resultBox.innerHTML = `<div class="text-danger small"><i class="fa-solid fa-triangle-exclamation me-1"></i> ${err.message}</div>`;
                Swal.fire('AI Error', err.message, 'error');
            } finally {
                studentAiBtn.disabled = false;
                studentAiBtn.innerHTML = '<i class="fa-solid fa-brain me-2"></i> Analyze Student';
            }
        });
    }
});

// Global CRUD Functions for Students
window.viewStudent = function(key, name, xp, level, hp, grade, section) {
    const rawStudent = allUsersData[key] || {};
    
    // Extract true First-Attempt baseline without modifying Firebase
    const faStats = extractStudentFirstAttemptStats(rawStudent);
    const sTotal = faStats.totalAnswers;
    const sCorrect = faStats.totalCorrect;
    const sWrong = faStats.totalWrong;
    const retryCount = faStats.retryCount;

    const accuracy = sTotal > 0 ? Math.round((sCorrect / sTotal) * 100) : 0;

    const studentPayload = {
        uid: key,
        name: name,
        level: level,
        hp: hp,
        xp: xp,
        grade: grade || rawStudent.grade || 'Grade 6',
        section: section || rawStudent.section || 'Unassigned',
        accuracy: accuracy + '%',
        correctAnswers: sCorrect,
        wrongAnswers: sWrong,
        totalAnswered: sTotal,
        retryCount: retryCount,
        firstAttemptStats: rawStudent.firstAttemptStats,
        firstAttempts: rawStudent.firstAttempts,
        firstAttemptCategories: faStats.categories,
        gameStats: rawStudent.gameStats
    };

    currentViewedStudent = studentPayload;
    
    document.getElementById('studentNameDisplay').innerText = studentPayload.name;
    document.getElementById('studentLevelDisplay').innerHTML = `<i class="fa-solid fa-medal me-1"></i> Level ${studentPayload.level}`;
    document.getElementById('studentXpDisplay').innerText = `${studentPayload.xp.toLocaleString()} XP`;
    document.getElementById('studentHpDisplay').innerHTML = `❤️ ${studentPayload.hp}/100`;

    const classDisplay = document.getElementById('studentClassDisplay');
    if (classDisplay) {
        classDisplay.innerHTML = `<i class="fa-solid fa-graduation-cap me-1 text-primary"></i> ${studentPayload.grade} - ${studentPayload.section}`;
    }

    const retriesCountEl = document.getElementById('studentRetriesCount');
    if (retriesCountEl) {
        retriesCountEl.innerText = studentPayload.retryCount;
    }

    // Update Recent Play Attempt Display in Modal
    const lastPlayedTs = getStudentLastPlayedAt(rawStudent);
    const lastPlayedDisplay = document.getElementById('studentLastPlayedDisplay');
    const lastPlayedTimeAgo = document.getElementById('studentLastPlayedTimeAgo');
    
    if (lastPlayedDisplay) {
        if (lastPlayedTs) {
            lastPlayedDisplay.innerHTML = `<i class="fa-regular fa-calendar-check text-primary me-1.5"></i>${formatExactDateTime(lastPlayedTs)}`;
        } else {
            lastPlayedDisplay.innerHTML = `<span class="text-muted"><i class="fa-regular fa-circle-question me-1"></i>No play sessions recorded yet</span>`;
        }
    }
    if (lastPlayedTimeAgo) {
        if (lastPlayedTs) {
            lastPlayedTimeAgo.className = 'badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1.5 rounded-pill small fw-bold';
            lastPlayedTimeAgo.innerText = formatRelativeTime(lastPlayedTs);
        } else {
            lastPlayedTimeAgo.className = 'badge bg-secondary bg-opacity-10 text-secondary border px-3 py-1.5 rounded-pill small';
            lastPlayedTimeAgo.innerText = 'New Learner';
        }
    }

    // Populate Play Attempt History Table
    const historyTbody = document.getElementById('studentHistoryTableBody');
    const historyCountBadge = document.getElementById('historyCountBadge');
    let historyEntries = [];

    if (rawStudent.gameHistory && typeof rawStudent.gameHistory === 'object') {
        const rawList = [];
        Object.keys(rawStudent.gameHistory).forEach(hKey => {
            const h = rawStudent.gameHistory[hKey];
            if (h && typeof h === 'object') {
                const entryType = h.type || (h.hpAfter !== undefined ? 'quest' : 'session_start');
                rawList.push({
                    key: hKey,
                    at: Number(h.at || h.timestamp) || 0,
                    category: h.category || h.questKind || 'General English',
                    floorTitle: h.floorTitle || h.category || 'Dungeon Room',
                    floorLabel: h.floorLabel || '',
                    // level: level_complete uses questLevel, per-question uses level
                    level: h.questLevel || h.level || 1,
                    type: entryType,
                    correct: h.correct,
                    // XP: only level_complete entries have xpGain / totalXp
                    xpGain: h.xpGain || 0,
                    totalXp: h.totalXp || null,
                    // HP tracking
                    hpAfter: h.hpAfter !== undefined ? h.hpAfter : null,
                    hpDelta: h.hpDelta || 0,
                    // Level complete extras
                    firstClear: h.firstClear || false,
                    leveledUp: h.leveledUp || false,
                    wrong: h.wrong
                });
            }
        });

        // Sort chronologically (oldest first) to accurately identify first attempt vs practice replays
        rawList.sort((a, b) => a.at - b.at);

        const clearedLevelsSet = new Set();
        rawList.forEach(item => {
            const cat = String(item.category || '').toLowerCase().replace(/[\s_-]+/g, '');
            const lvl = item.level || 1;
            const key = `${cat}_L${lvl}`;

            if (!clearedLevelsSet.has(key)) {
                // Initial playthrough before level completion -> Included in Diagnostic Baseline
                item.isFirstAttempt = true;
                if (item.type === 'level_complete' || item.firstClear === true) {
                    clearedLevelsSet.add(key);
                }
            } else {
                // Replay session occurred after the level was already cleared -> Practice (Excluded)
                item.isFirstAttempt = false;
            }
        });

        // Sort newest first for teacher timeline
        historyEntries = rawList.sort((a, b) => b.at - a.at);
    }

    if (historyCountBadge) {
        historyCountBadge.innerText = `${historyEntries.length} Attempt${historyEntries.length === 1 ? '' : 's'} Logged`;
    }

    if (historyTbody) {
        if (historyEntries.length === 0) {
            historyTbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-5">
                        <i class="fa-solid fa-clock-rotate-left fa-2x mb-2 text-secondary opacity-50"></i>
                        <div class="fw-bold">No Play History Recorded</div>
                        <small>This student has not completed any gameplay sessions or quizzes yet.</small>
                    </td>
                </tr>
            `;
        } else {
            historyTbody.innerHTML = historyEntries.map(h => {
                const dateStr = h.at ? new Date(h.at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date';
                const timeStr = h.at ? new Date(h.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : '';

                const isLevelComplete = h.type === 'level_complete';
                const isSessionStart  = h.type === 'session_start';

                // Result badge
                let resultBadge;
                if (isLevelComplete) {
                    resultBadge = `<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 rounded-pill"><i class="fa-solid fa-flag-checkered me-1"></i>Level Clear${h.firstClear ? ' ⭐' : ''}</span>`;
                } else if (isSessionStart) {
                    resultBadge = `<span class="badge bg-secondary bg-opacity-10 text-secondary border px-2.5 py-1 rounded-pill"><i class="fa-solid fa-play me-1"></i>Session Start</span>`;
                } else if (h.correct === true) {
                    resultBadge = `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill"><i class="fa-solid fa-circle-check me-1"></i>Correct</span>`;
                } else if (h.correct === false) {
                    resultBadge = `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2.5 py-1 rounded-pill"><i class="fa-solid fa-circle-xmark me-1"></i>Incorrect</span>`;
                } else {
                    resultBadge = `<span class="badge bg-secondary bg-opacity-10 text-secondary border px-2.5 py-1 rounded-pill">Completed</span>`;
                }

                // Assessment Status badge
                let assessmentScopeBadge;
                if (h.isFirstAttempt) {
                    assessmentScopeBadge = `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5 rounded-pill" style="font-size:0.68rem;" title="Included in DepEd NATG6 Diagnostic Baseline"><i class="fa-solid fa-bookmark me-1"></i>1st Attempt (Baseline)</span>`;
                } else {
                    assessmentScopeBadge = `<span class="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-0.5 rounded-pill" style="font-size:0.68rem;" title="Practice Replay - Excluded from Assessment Score"><i class="fa-solid fa-rotate-right me-1"></i>Practice (Excluded)</span>`;
                }

                // XP column — only level_complete has xpGain
                let xpCol;
                if (isLevelComplete && h.xpGain > 0) {
                    xpCol = `<div class="text-success fw-bold">+${h.xpGain} XP</div>${h.totalXp !== null ? `<div class="text-muted" style="font-size:0.72rem;">Total: ${h.totalXp} XP</div>` : ''}`;
                } else if (isSessionStart) {
                    xpCol = `<span class="text-muted small">—</span>`;
                } else {
                    // Per-question: show HP change instead
                    xpCol = `<span class="text-muted small">—</span>`;
                }

                // HP column
                let hpCol;
                if (h.hpAfter !== null) {
                    const hpColor = h.hpAfter >= 70 ? 'text-success' : h.hpAfter >= 35 ? 'text-warning' : 'text-danger';
                    const hpSign = h.hpDelta > 0 ? `<span class="text-success small ms-1">+${h.hpDelta}</span>` : h.hpDelta < 0 ? `<span class="text-danger small ms-1">${h.hpDelta}</span>` : '';
                    hpCol = `<span class="${hpColor} fw-semibold">❤️ ${h.hpAfter}/100</span>${hpSign}`;
                } else if (isLevelComplete) {
                    hpCol = `<span class="text-muted small">—</span>`;
                } else {
                    hpCol = `<span class="text-muted small">—</span>`;
                }

                // Type / mode label
                const typeLabel = h.type ? h.type.replace(/_/g, ' ') : 'Quest';
                const leveledUpBadge = h.leveledUp ? `<span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 ms-1 px-1.5 py-0.5" style="font-size:0.68rem;">⬆ Leveled Up</span>` : '';

                return `
                    <tr class="${isLevelComplete ? 'table-primary bg-opacity-10' : ''}">
                        <td class="px-3 py-2.5">
                            <div class="fw-bold text-dark" style="font-size:0.85rem;">${dateStr}</div>
                            <small class="text-muted" style="font-size:0.73rem;"><i class="fa-regular fa-clock me-1"></i>${timeStr}</small>
                        </td>
                        <td class="px-3 py-2.5">
                            <span class="fw-semibold text-dark text-capitalize" style="font-size:0.85rem;">${h.floorTitle}</span>
                            ${h.floorLabel ? `<br><small class="text-muted" style="font-size:0.73rem;">${h.floorLabel}</small>` : ''}
                        </td>
                        <td class="px-3 py-2.5 text-nowrap">
                            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 rounded-pill" style="font-size:0.75rem;">Lvl ${h.level}</span>
                            <small class="text-muted ms-1 text-capitalize" style="font-size:0.75rem;">${typeLabel}</small>
                            ${leveledUpBadge}
                        </td>
                        <td class="px-3 py-2.5">
                            <div>${resultBadge}</div>
                            <div class="mt-1">${assessmentScopeBadge}</div>
                        </td>
                        <td class="px-3 py-2.5 text-end text-nowrap">${xpCol}</td>
                        <td class="px-3 py-2.5 text-end text-nowrap">${hpCol}</td>
                    </tr>
                `;
            }).join('');
        }
    }
    
    const resultBox = document.getElementById('studentAiResult');
    resultBox.classList.add('d-none');
    resultBox.innerHTML = '';

    // Reset modal tab to overview
    if (typeof switchModalTab === 'function') switchModalTab('overview');
    
    if (studentPieChartInstance) studentPieChartInstance.destroy();
    if (studentCategoryChartInstance) studentCategoryChartInstance.destroy();
    if (studentBloomChartInstance) studentBloomChartInstance.destroy();
    if (studentCompetencyChartInstance) studentCompetencyChartInstance.destroy();

    if (studentPayload.totalAnswered > 0) {
        const ctx = document.getElementById('studentPieChart').getContext('2d');
        studentPieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Correct', 'Incorrect'],
                datasets: [{
                    data: [studentPayload.correctAnswers, studentPayload.wrongAnswers],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '65%',
                plugins: {
                    legend: { position: 'bottom' },
                    title: {
                        display: true,
                        text: `Accuracy: ${studentPayload.accuracy}`
                    }
                }
            }
        });
    }

    const sBreakdown = getStudentBreakdown(studentPayload);

    if (document.getElementById('studentCategoryChart')) {
        const ctxSC = document.getElementById('studentCategoryChart').getContext('2d');
        studentCategoryChartInstance = new Chart(ctxSC, {
            type: 'bar',
            data: {
                labels: ['Grammar', 'Vocab', 'Reading', 'Spelling', 'Info Lit'],
                datasets: [{
                    data: [
                        sBreakdown.categories.grammar,
                        sBreakdown.categories.vocabulary,
                        sBreakdown.categories.reading,
                        sBreakdown.categories.spelling,
                        sBreakdown.categories.information_literacy
                    ],
                    backgroundColor: ['#A594F9', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                    borderRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, max: 100 } },
                onClick: (event, elements) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const label = studentCategoryChartInstance.data.labels[index];
                        if (typeof window.showStudentSkillDetailModal === 'function') {
                            window.showStudentSkillDetailModal(studentPayload, 'category', label);
                        }
                    }
                }
            }
        });
    }

    if (document.getElementById('studentBloomChart')) {
        const ctxSB = document.getElementById('studentBloomChart').getContext('2d');
        studentBloomChartInstance = new Chart(ctxSB, {
            type: 'radar',
            data: {
                labels: ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'],
                datasets: [{
                    label: 'Mastery %',
                    data: [
                        sBreakdown.blooms.Remembering,
                        sBreakdown.blooms.Understanding,
                        sBreakdown.blooms.Applying,
                        sBreakdown.blooms.Analyzing,
                        sBreakdown.blooms.Evaluating,
                        sBreakdown.blooms.Creating
                    ],
                    backgroundColor: 'rgba(165, 148, 249, 0.2)',
                    borderColor: '#A594F9',
                    borderWidth: 2,
                    pointBackgroundColor: '#A594F9'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: { display: false }
                    }
                },
                onClick: (event, elements) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const label = studentBloomChartInstance.data.labels[index];
                        if (typeof window.showStudentSkillDetailModal === 'function') {
                            window.showStudentSkillDetailModal(studentPayload, 'bloom', label);
                        }
                    }
                }
            }
        });
    }

    if (document.getElementById('studentCompetencyChart')) {
        const ctxSComp = document.getElementById('studentCompetencyChart').getContext('2d');
        studentCompetencyChartInstance = new Chart(ctxSComp, {
            type: 'bar',
            data: {
                labels: ['Linguistic Prof.', 'Comprehension', 'Critical Thinking', 'Info Literacy', 'Active Listening'],
                datasets: [{
                    data: [
                        sBreakdown.competencies['Linguistic Proficiency'],
                        sBreakdown.competencies['Comprehension Ability'],
                        sBreakdown.competencies['Critical Thinking'],
                        sBreakdown.competencies['Information Literacy'],
                        sBreakdown.competencies['Active Listening']
                    ],
                    backgroundColor: [
                        'rgba(165, 148, 249, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100 } },
                onClick: (event, elements) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const label = studentCompetencyChartInstance.data.labels[index];
                        if (typeof window.showStudentSkillDetailModal === 'function') {
                            window.showStudentSkillDetailModal(studentPayload, 'competency', label);
                        }
                    }
                }
            }
        });
    }

    const modal = new bootstrap.Modal(document.getElementById('studentAnalyticsModal'));
    modal.show();
};

window.getStudentBreakdown = function(studentObj) {
    const categories = ['grammar', 'vocabulary', 'reading', 'spelling', 'information_literacy'];
    const blooms = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'];
    const competencies = ['Linguistic Proficiency', 'Comprehension Ability', 'Critical Thinking', 'Information Literacy', 'Active Listening'];

    let breakdown = {
        categories: {},
        blooms: {},
        competencies: {}
    };

    const sTotal = (studentObj.totalAnswered !== undefined ? studentObj.totalAnswered : (studentObj.gameStats ? studentObj.gameStats.totalAnswers : 0)) || 0;
    const sCorrect = (studentObj.correctAnswers !== undefined ? studentObj.correctAnswers : (studentObj.gameStats ? studentObj.gameStats.totalCorrect : 0)) || 0;

    if (sTotal === 0) {
        categories.forEach(cat => breakdown.categories[cat] = 0);
        blooms.forEach(b => breakdown.blooms[b] = 0);
        competencies.forEach(c => breakdown.competencies[c] = 0);
        return breakdown;
    }

    const overallAccuracy = Math.round((sCorrect / sTotal) * 100);

    categories.forEach((cat) => {
        if (studentObj.firstAttemptCategories && studentObj.firstAttemptCategories[cat] && studentObj.firstAttemptCategories[cat].total > 0) {
            const stats = studentObj.firstAttemptCategories[cat];
            breakdown.categories[cat] = Math.round((stats.correct / stats.total) * 100);
        } else if (studentObj.gameStats && studentObj.gameStats.categories && studentObj.gameStats.categories[cat]) {
            const stats = studentObj.gameStats.categories[cat];
            breakdown.categories[cat] = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : overallAccuracy;
        } else {
            breakdown.categories[cat] = overallAccuracy;
        }
    });

    blooms.forEach((bloom) => {
        if (studentObj.gameStats && studentObj.gameStats.bloom && studentObj.gameStats.bloom[bloom]) {
            const stats = studentObj.gameStats.bloom[bloom];
            breakdown.blooms[bloom] = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : overallAccuracy;
        } else {
            breakdown.blooms[bloom] = overallAccuracy;
        }
    });

    competencies.forEach((comp) => {
        if (studentObj.gameStats && studentObj.gameStats.competencies && studentObj.gameStats.competencies[comp]) {
            const stats = studentObj.gameStats.competencies[comp];
            breakdown.competencies[comp] = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : overallAccuracy;
        } else {
            breakdown.competencies[comp] = overallAccuracy;
        }
    });

    return breakdown;
};

window.switchModalTab = function(tabName) {
    const tabOverview = document.getElementById('modal-tab-overview');
    const tabSkills = document.getElementById('modal-tab-skills');
    const tabHistory = document.getElementById('modal-tab-history');
    const contentOverview = document.getElementById('modal-content-overview');
    const contentSkills = document.getElementById('modal-content-skills');
    const contentHistory = document.getElementById('modal-content-history');
    
    // Reset all tabs
    [tabOverview, tabSkills, tabHistory].forEach(t => {
        if (t) {
            t.classList.remove('active', 'text-primary', 'border-bottom', 'border-primary', 'border-3');
            t.classList.add('text-muted');
        }
    });

    // Hide all content containers
    [contentOverview, contentSkills, contentHistory].forEach(c => {
        if (c) c.classList.add('d-none');
    });

    if (tabName === 'overview') {
        if (tabOverview) {
            tabOverview.classList.add('active', 'text-primary', 'border-bottom', 'border-primary', 'border-3');
            tabOverview.classList.remove('text-muted');
        }
        if (contentOverview) contentOverview.classList.remove('d-none');
    } else if (tabName === 'skills') {
        if (tabSkills) {
            tabSkills.classList.add('active', 'text-primary', 'border-bottom', 'border-primary', 'border-3');
            tabSkills.classList.remove('text-muted');
        }
        if (contentSkills) contentSkills.classList.remove('d-none');
        if (studentCategoryChartInstance) studentCategoryChartInstance.resize();
        if (studentBloomChartInstance) studentBloomChartInstance.resize();
        if (studentCompetencyChartInstance) studentCompetencyChartInstance.resize();
    } else if (tabName === 'history') {
        if (tabHistory) {
            tabHistory.classList.add('active', 'text-primary', 'border-bottom', 'border-primary', 'border-3');
            tabHistory.classList.remove('text-muted');
        }
        if (contentHistory) contentHistory.classList.remove('d-none');
    }
};

window.showStudentSkillDetailModal = function(studentObj, type, name) {
    let keyMap = {
        'Grammar': 'grammar', 'Vocab': 'vocabulary', 'Reading': 'reading', 'Spelling': 'spelling', 'Info Lit': 'information_literacy',
        'Remembering': 'Remembering', 'Understanding': 'Understanding', 'Applying': 'Applying', 'Analyzing': 'Analyzing', 'Evaluating': 'Evaluating', 'Creating': 'Creating',
        'Linguistic Prof.': 'Linguistic Proficiency', 'Comprehension': 'Comprehension Ability', 'Critical Thinking': 'Critical Thinking', 'Info Literacy': 'Information Literacy', 'Active Listening': 'Active Listening'
    };
    
    const key = keyMap[name] || name;
    const breakdown = getStudentBreakdown(studentObj);
    
    let score = 0;
    if (type === 'category') score = breakdown.categories[key] || 0;
    else if (type === 'bloom') score = breakdown.blooms[key] || 0;
    else if (type === 'competency') score = breakdown.competencies[key] || 0;
    
    let whyText = "";
    let gameText = "";
    let adjustText = "";

    if (score >= 75) {
        whyText = `${studentObj.name} has demonstrated excellent mastery of ${name} (${score}% accuracy), correctly parsing complex challenges in this domain and maintaining high performance.`;
        gameText = `Encourage ${studentObj.name} to challenge the high-difficulty <strong>'Lvl 4 Boss Battles'</strong> or configure peer-tutoring quests where they can earn bonus gold by helping other players.`;
        adjustText = `Navigate to the <strong>Student Roster</strong>, click edit on ${studentObj.name}'s account, and award them <strong>100 XP</strong> as a milestone reward, or enable advanced quest access.`;
    } else if (score >= 50) {
        whyText = `${studentObj.name} is developing key skills in ${name} (${score}% accuracy) but makes mistakes under pressure or with complex items.`;
        gameText = `Assign <strong>'Lvl 2 (Medium)'</strong> category quests (e.g. Grammar Guardian Keep) to reinforce these developing skills before moving to harder boss encounters.`;
        adjustText = `Open the <strong>Quest Board</strong> and review active items. Create tailored multiple-choice puzzles for this competency to provide targeted practice.`;
    } else {
        whyText = `${studentObj.name} is struggling significantly with ${name} (${score}% accuracy). They are making frequent errors on foundational concepts.`;
        gameText = `Have them play <strong>'Lvl 1 Recall Dungeons'</strong> to build confidence and repeat the basics in a low-penalty environment.`;
        adjustText = `Navigate to <strong>Quest Curriculum</strong> and lower the HP penalty (-5 HP) or increase HP rewards (+25 HP) for ${name} category questions for ${studentObj.name} to ease frustration.`;
    }
    
    Swal.fire({
        title: `${studentObj.name} - ${name} Mastery`,
        html: `
            <div class="text-start">
                <div class="d-flex align-items-center mb-3">
                    <div class="h3 fw-bold mb-0 me-3 ${score >= 75 ? 'text-success' : (score >= 50 ? 'text-warning' : 'text-danger')}">${score}%</div>
                    <span class="badge ${score >= 75 ? 'bg-success' : (score >= 50 ? 'bg-warning text-dark' : 'bg-danger')}">
                        ${score >= 75 ? 'Mastered' : (score >= 50 ? 'Developing' : 'Needs Practice')}
                    </span>
                </div>
                <div class="mb-3">
                    <h6 class="fw-bold text-dark mb-1"><i class="fa-solid fa-circle-question text-primary me-1"></i> Diagnosis (Why)</h6>
                    <p class="small text-muted mb-0" style="line-height:1.5;">${whyText}</p>
                </div>
                <div class="mb-3">
                    <h6 class="fw-bold text-dark mb-1"><i class="fa-solid fa-gamepad text-success me-1"></i> Quest Assignment (What Game)</h6>
                    <p class="small text-muted mb-0" style="line-height:1.5;">${gameText}</p>
                </div>
                <div class="mb-0">
                    <h6 class="fw-bold text-dark mb-1"><i class="fa-solid fa-wrench text-warning me-1"></i> Action Plan (Where to Adjust)</h6>
                    <p class="small text-muted mb-0" style="line-height:1.5;">${adjustText}</p>
                </div>
            </div>
        `,
        confirmButtonColor: '#A594F9',
        confirmButtonText: 'Apply Recommendation'
    });
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

window.editStudent = function(key, fName, lName, xp, section) {
    const currentSection = section || 'Acacia';

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Manage Student Account',
            html: `
                <div class="text-start">
                    <label class="form-label text-muted small fw-bold mb-1">First Name</label>
                    <input id="edit-fname" class="swal2-input m-0 mb-3 w-100" value="${fName}">
                    <label class="form-label text-muted small fw-bold mb-1">Last Name</label>
                    <input id="edit-lname" class="swal2-input m-0 mb-3 w-100" value="${lName}">
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="form-label text-muted small fw-bold mb-1">Grade Level</label>
                            <input id="edit-grade" class="swal2-input m-0 w-100 bg-light" value="Grade 6" readonly>
                        </div>
                        <div class="col-6">
                            <label class="form-label text-muted small fw-bold mb-1">Grade 6 Section</label>
                            <input id="edit-section" class="swal2-input m-0 w-100" value="${currentSection}" placeholder="e.g. Acacia">
                        </div>
                    </div>
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
                    grade: 'Grade 6',
                    section: document.getElementById('edit-section').value.trim() || 'Acacia',
                    xp: parseInt(document.getElementById('edit-xp').value) || 0
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const updates = result.value;
                db.ref('users/' + key).update(updates)
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Student Account Updated!',
                            text: 'Student profile and section have been saved.',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 2500
                        });
                    })
                    .catch(err => Swal.fire('Error', 'Could not update student: ' + err.message, 'error'));
            }
        });
    }
};
