let studentPieChartInstance = null;
let studentCategoryChartInstance = null;
let studentBloomChartInstance = null;
let studentCompetencyChartInstance = null;
let currentViewedStudent = null;
let allUsersData = {};

document.addEventListener("DOMContentLoaded", function() {
    const studentTableBody = document.getElementById('studentTableBody');
    const studentSearch = document.getElementById('studentSearch');

    if (studentSearch && studentTableBody) {
        studentSearch.addEventListener('keyup', function () {
            const searchTerm = this.value.trim().toLowerCase();
            const rows = studentTableBody.querySelectorAll('tr');

            rows.forEach((row) => {
                const nameCell = row.querySelector('td:first-child');

                // Leave loading, error, and empty-state rows visible.
                if (!nameCell || nameCell.colSpan > 1) return;

                const studentName = nameCell.textContent.toLowerCase();
                row.style.display = studentName.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
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
                    allUsersData = data || {};
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

    // Individual Student AI Insights
    const studentAiBtn = document.getElementById('studentAiBtn');
    if (studentAiBtn) {
        studentAiBtn.addEventListener('click', async () => {
            if (!currentViewedStudent) return;
            
            const resultBox = document.getElementById('studentAiResult');
            studentAiBtn.disabled = true;
            studentAiBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-2"></i> Analyzing...';
            resultBox.innerHTML = '<div class="text-center text-muted p-3"><i class="fa-solid fa-brain fa-2x mb-2 text-primary fa-fade"></i><br>Analyzing student behavior...</div>';
            resultBox.classList.remove('d-none');

            try {
                const payload = { stats: currentViewedStudent, scope: "individual" };
                const response = await fetch('../../backend/api/groq_analytics.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.success) {
                    resultBox.innerHTML = `
                        <div class="fw-bold mb-2 text-primary"><i class="fa-solid fa-sparkles"></i> Personalized AI Insight</div>
                        ${result.data}
                    `;
                } else {
                    throw new Error(result.error || 'Failed to generate insights');
                }
            } catch (err) {
                resultBox.innerHTML = `<div class="text-danger"><i class="fa-solid fa-triangle-exclamation"></i> ${err.message}</div>`;
            } finally {
                studentAiBtn.disabled = false;
                studentAiBtn.innerHTML = '<i class="fa-solid fa-brain me-2"></i> Analyze Student';
            }
        });
    }
});

// Global CRUD Functions for Students
window.viewStudent = function(key, name, xp, level, hp) {
    const rawStudent = allUsersData[key] || {};
    
    let sTotal = 0;
    let sCorrect = 0;
    let sWrong = 0;
    let retryCount = 0;

    if (rawStudent.firstAttemptStats) {
        sTotal = rawStudent.firstAttemptStats.totalAnswers || 0;
        sCorrect = rawStudent.firstAttemptStats.totalCorrect || 0;
        sWrong = rawStudent.firstAttemptStats.totalWrong || 0;
    } else if (rawStudent.firstAttempts) {
        Object.values(rawStudent.firstAttempts).forEach(att => {
            sTotal += (att.totalQuestions || ((att.totalCorrect || 0) + (att.totalWrong || 0)) || 0);
            sCorrect += (att.totalCorrect || 0);
            sWrong += (att.totalWrong || 0);
        });
    } else if (rawStudent.gameStats) {
        sTotal = rawStudent.gameStats.totalAnswers || 0;
        sCorrect = rawStudent.gameStats.totalCorrect || 0;
        sWrong = rawStudent.gameStats.totalWrong || 0;
    }

    if (rawStudent.attempts) {
        const attemptsArr = Array.isArray(rawStudent.attempts) ? rawStudent.attempts : Object.values(rawStudent.attempts);
        retryCount = Math.max(0, attemptsArr.length - 1);
    } else if (rawStudent.retryCount !== undefined) {
        retryCount = rawStudent.retryCount;
    }

    const accuracy = sTotal > 0 ? Math.round((sCorrect / sTotal) * 100) : 0;

    const studentPayload = {
        uid: key,
        name: name,
        level: level,
        hp: hp,
        xp: xp,
        accuracy: accuracy + '%',
        correctAnswers: sCorrect,
        wrongAnswers: sWrong,
        totalAnswered: sTotal,
        retryCount: retryCount,
        firstAttemptStats: rawStudent.firstAttemptStats,
        firstAttempts: rawStudent.firstAttempts,
        gameStats: rawStudent.gameStats
    };

    currentViewedStudent = studentPayload;
    
    document.getElementById('studentNameDisplay').innerText = studentPayload.name;
    document.getElementById('studentLevelDisplay').innerHTML = `<i class="fa-solid fa-medal me-1"></i> Level ${studentPayload.level}`;
    document.getElementById('studentXpDisplay').innerText = `${studentPayload.xp.toLocaleString()} XP`;
    document.getElementById('studentHpDisplay').innerHTML = `❤️ ${studentPayload.hp}/100`;
    
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
        if (studentObj.gameStats && studentObj.gameStats.categories && studentObj.gameStats.categories[cat]) {
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
    const contentOverview = document.getElementById('modal-content-overview');
    const contentSkills = document.getElementById('modal-content-skills');
    
    if (tabOverview && tabSkills && contentOverview && contentSkills) {
        if (tabName === 'overview') {
            tabOverview.classList.add('active', 'text-primary', 'border-bottom', 'border-primary', 'border-3');
            tabOverview.classList.remove('text-muted');
            tabSkills.classList.remove('active', 'text-primary', 'border-bottom', 'border-primary', 'border-3');
            tabSkills.classList.add('text-muted');
            
            contentOverview.classList.remove('d-none');
            contentSkills.classList.add('d-none');
        } else {
            tabSkills.classList.add('active', 'text-primary', 'border-bottom', 'border-primary', 'border-3');
            tabSkills.classList.remove('text-muted');
            tabOverview.classList.remove('active', 'text-primary', 'border-bottom', 'border-primary', 'border-3');
            tabOverview.classList.add('text-muted');
            
            contentOverview.classList.add('d-none');
            contentSkills.classList.remove('d-none');
            
            if (studentCategoryChartInstance) studentCategoryChartInstance.resize();
            if (studentBloomChartInstance) studentBloomChartInstance.resize();
            if (studentCompetencyChartInstance) studentCompetencyChartInstance.resize();
        }
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
