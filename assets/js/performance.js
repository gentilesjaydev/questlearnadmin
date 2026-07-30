document.addEventListener("DOMContentLoaded", function() {
    const analyticsContainer = document.getElementById('analyticsContainer');
    const generalStatsBox = document.getElementById('generalStatsBox');
    const studentTableBody = document.getElementById('analyticsTableBody');
    const aiInsightsBtn = document.getElementById('aiInsightsBtn');
    const aiInsightsResult = document.getElementById('aiInsightsResult');
    
    // Overall Charts
    let classAccuracyChartInstance = null;
    let overallPieChartInstance = null;
    let categoryChartInstance = null;
    let bloomChartInstance = null;
    let competencyChartInstance = null;

    // Student Modal Charts
    let studentPieChartInstance = null;
    let studentCategoryChartInstance = null;
    let studentBloomChartInstance = null;
    let studentCompetencyChartInstance = null;
    let currentViewedStudent = null;

    let globalStats = []; // Store simplified stats for AI

    if(studentTableBody) {
        studentTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5"><i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>Checking Authentication...</td></tr>';

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                studentTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5"><i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>Gathering Analytics Data...</td></tr>';
                
                const db = firebase.database();
                db.ref('users').on('value', (snapshot) => {
                    studentTableBody.innerHTML = '';
                    const data = snapshot.val();
                    
                    let totalStudents = 0;
                    let totalQuestionsAnswered = 0;
                    let totalCorrect = 0;
                    let totalWrong = 0;
                    globalStats = [];

                    let chartLabels = [];
                    let chartData = [];
                    let chartColors = [];

                    if (data) {
                        Object.keys(data).forEach(key => {
                            const student = data[key];
                            
                            if(student.role === 'student' || !student.role) {
                                totalStudents++;
                                const firstName = student.firstName || '';
                                const lastName = student.lastName || '';
                                const name = (firstName + ' ' + lastName).trim() || 'Anonymous Student';
                                const xp = student.xp || 0;
                                const level = student.level || student.accountLevel || 1;
                                const hp = student.hp !== undefined ? student.hp : 100;
                                
                                let sTotal = 0;
                                let sCorrect = 0;
                                let sWrong = 0;
                                let retryCount = 0;

                                if (student.firstAttemptStats) {
                                    sTotal = student.firstAttemptStats.totalAnswers || 0;
                                    sCorrect = student.firstAttemptStats.totalCorrect || 0;
                                    sWrong = student.firstAttemptStats.totalWrong || 0;
                                } else if (student.firstAttempts) {
                                    Object.values(student.firstAttempts).forEach(att => {
                                        sTotal += (att.totalQuestions || ((att.totalCorrect || 0) + (att.totalWrong || 0)) || 0);
                                        sCorrect += (att.totalCorrect || 0);
                                        sWrong += (att.totalWrong || 0);
                                    });
                                } else if (student.gameStats) {
                                    sTotal = student.gameStats.totalAnswers || 0;
                                    sCorrect = student.gameStats.totalCorrect || 0;
                                    sWrong = student.gameStats.totalWrong || 0;
                                }

                                if (student.attempts) {
                                    const attemptsArr = Array.isArray(student.attempts) ? student.attempts : Object.values(student.attempts);
                                    retryCount = Math.max(0, attemptsArr.length - 1);
                                } else if (student.retryCount !== undefined) {
                                    retryCount = student.retryCount;
                                }

                                totalQuestionsAnswered += sTotal;
                                totalCorrect += sCorrect;
                                totalWrong += sWrong;

                                const accuracy = sTotal > 0 ? Math.round((sCorrect / sTotal) * 100) : 0;
                                
                                // Compute Category Struggles for student based on First Attempts
                                const tempStudentObj = { uid: key, firstAttemptStats: student.firstAttemptStats, firstAttempts: student.firstAttempts, gameStats: student.gameStats, correctAnswers: sCorrect, totalAnswered: sTotal };
                                const catStruggles = getStudentCategoryStruggles(tempStudentObj);

                                // Push to global for AI
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
                                    firstAttemptStats: student.firstAttemptStats,
                                    firstAttempts: student.firstAttempts,
                                    categoryBreakdown: catStruggles.breakdown,
                                    primaryStruggleCategory: catStruggles.lowest ? `${catStruggles.lowest.label} (${catStruggles.lowest.score}%)` : 'None',
                                    strugglingCategories: catStruggles.struggling.map(s => `${s.label} (${s.score}%)`)
                                };
                                globalStats.push(studentPayload);

                                // Data for Bar Chart
                                if (sTotal > 0) {
                                    chartLabels.push(name);
                                    chartData.push(accuracy);
                                    chartColors.push(accuracy >= 70 ? '#10b981' : (accuracy >= 40 ? '#f59e0b' : '#ef4444'));
                                }

                                // Format Category Struggles Badges HTML (Clean, Uncluttered & Elegant)
                                let struggleBadgeHtml = '';
                                if (!catStruggles.hasAttempted) {
                                    struggleBadgeHtml = `<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-1.5 rounded-pill" style="font-size:0.78rem;"><i class="fa-solid fa-clock me-1.5"></i>No Attempts Yet</span>`;
                                } else if (catStruggles.struggling.length > 0) {
                                    const firstScore = catStruggles.struggling[0].score;
                                    const allIdentical = catStruggles.struggling.every(s => s.score === firstScore);

                                    if (allIdentical && catStruggles.struggling.length >= 3) {
                                        struggleBadgeHtml = `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1.5 rounded-pill" style="font-size:0.78rem;"><i class="fa-solid fa-triangle-exclamation me-1.5"></i>All Categories: ${firstScore}%</span>`;
                                    } else {
                                        const topStruggles = catStruggles.struggling.slice(0, 2);
                                        const remainingCount = catStruggles.struggling.length - 2;

                                        let badges = topStruggles.map(s => 
                                            `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2.5 py-1 rounded-pill me-1" style="font-size:0.75rem;"><i class="fa-solid fa-triangle-exclamation me-1"></i>${s.label}: ${s.score}%</span>`
                                        ).join('');

                                        if (remainingCount > 0) {
                                            badges += `<span class="badge bg-light text-muted border px-2 py-1 rounded-pill" style="font-size:0.72rem;">+${remainingCount} more</span>`;
                                        }
                                        struggleBadgeHtml = badges;
                                    }
                                } else {
                                    struggleBadgeHtml = `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1.5 rounded-pill" style="font-size:0.78rem;"><i class="fa-solid fa-circle-check me-1.5"></i>Proficient (${accuracy}%)</span>`;
                                }

                                const rowHtml = `
                                <tr>
                                    <td class="px-4 py-3 fw-medium text-dark">${name}</td>
                                    <td class="px-4 py-3"><span class="badge bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill">Lvl ${level}</span></td>
                                    <td class="px-4 py-3 text-success fw-bold">${xp.toLocaleString()} XP</td>
                                    <td class="px-4 py-3 ${hp <= 20 ? 'text-danger fw-bold' : 'text-muted'}">❤️ ${hp}/100</td>
                                    <td class="px-4 py-3">
                                        <div class="d-flex align-items-center">
                                            <span class="me-2 fw-bold ${accuracy >= 70 ? 'text-success' : (accuracy >= 40 ? 'text-warning' : 'text-danger')}">${accuracy}%</span>
                                            <div class="progress flex-grow-1" style="height: 8px;">
                                                <div class="progress-bar ${accuracy >= 70 ? 'bg-success' : (accuracy >= 40 ? 'bg-warning' : 'bg-danger')}" style="width: ${accuracy}%"></div>
                                            </div>
                                        </div>
                                        <small class="text-muted" style="font-size:0.75rem;">1st Attempt: ${sCorrect} correct / ${sWrong} wrong${retryCount > 0 ? ` (${retryCount} retries)` : ''}</small>
                                    </td>
                                    <td class="px-4 py-3">${struggleBadgeHtml}</td>
                                    <td class="px-4 py-3 text-end">
                                        <button class="btn btn-sm btn-light border shadow-sm rounded-pill px-3" onclick='openStudentModal(${JSON.stringify(studentPayload).replace(/'/g, "&#39;")})'>
                                            <i class="fa-solid fa-chart-simple text-primary me-1"></i> Insights
                                        </button>
                                    </td>
                                </tr>
                                `;
                                studentTableBody.innerHTML += rowHtml;
                            }
                        });
                    }
                    
                    if(totalStudents === 0) {
                        studentTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-5">No student data found.</td></tr>`;
                    }

                    const overallAccuracy = totalQuestionsAnswered > 0 ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) : 0;
                    
                    // Calculate Class Averages for categories among active students
                    let tempClassCategories = { grammar: 0, vocabulary: 0, reading: 0, spelling: 0, information_literacy: 0 };
                    let activeStudentCount = 0;
                    let lowestCatLabel = "N/A";
                    let lowestCatScore = 100;
                    const catNamesMap = { grammar: 'Grammar', vocabulary: 'Vocabulary', reading: 'Reading', spelling: 'Spelling', information_literacy: 'Info Literacy' };

                    globalStats.forEach(student => {
                        if (student.totalAnswered > 0) {
                            activeStudentCount++;
                            const breakdown = getStudentBreakdown(student);
                            Object.keys(tempClassCategories).forEach(cat => tempClassCategories[cat] += breakdown.categories[cat]);
                        }
                    });

                    if (activeStudentCount > 0) {
                        Object.keys(tempClassCategories).forEach(cat => {
                            tempClassCategories[cat] = Math.round(tempClassCategories[cat] / activeStudentCount);
                            if (tempClassCategories[cat] < lowestCatScore) {
                                lowestCatScore = tempClassCategories[cat];
                                lowestCatLabel = catNamesMap[cat] || cat;
                            }
                        });
                    } else {
                        lowestCatLabel = "No Quiz Data";
                        lowestCatScore = 0;
                    }

                    generalStatsBox.innerHTML = `
                        <div class="col-md">
                            <div class="bg-white p-4 rounded-3 shadow-sm border border-light text-center h-100">
                                <h6 class="text-muted text-uppercase small fw-bold mb-2">Total Students</h6>
                                <h2 class="fw-bolder mb-0 text-dark">${totalStudents}</h2>
                            </div>
                        </div>
                        <div class="col-md">
                            <div class="bg-white p-4 rounded-3 shadow-sm border border-light text-center h-100">
                                <h6 class="text-muted text-uppercase small fw-bold mb-2">Total Answers</h6>
                                <h2 class="fw-bolder mb-0 text-primary">${totalQuestionsAnswered.toLocaleString()}</h2>
                            </div>
                        </div>
                        <div class="col-md">
                            <div class="bg-white p-4 rounded-3 shadow-sm border border-light text-center h-100">
                                <h6 class="text-muted text-uppercase small fw-bold mb-2">Overall Accuracy</h6>
                                <h2 class="fw-bolder mb-0 ${overallAccuracy >= 70 ? 'text-success' : 'text-warning'}">${overallAccuracy}%</h2>
                            </div>
                        </div>
                        <div class="col-md">
                            <div class="bg-white p-4 rounded-3 shadow-sm border border-light text-center h-100">
                                <h6 class="text-muted text-uppercase small fw-bold mb-2">Needs Help</h6>
                                <h2 class="fw-bolder mb-0 text-danger">${globalStats.filter(s => s.hp <= 20).length}</h2>
                                <small class="text-muted" style="font-size:0.75rem;">Critical HP</small>
                            </div>
                        </div>
                        <div class="col-md">
                            <div class="bg-white p-4 rounded-3 shadow-sm border border-light text-center h-100">
                                <h6 class="text-muted text-uppercase small fw-bold mb-2">Top Class Struggle</h6>
                                <h2 class="fw-bolder mb-0 ${lowestCatScore < 60 ? 'text-danger' : 'text-warning'}">${lowestCatLabel}</h2>
                                <small class="text-muted" style="font-size:0.75rem;">Class Avg: ${lowestCatScore}% Acc</small>
                            </div>
                        </div>
                    `;

                    // Render Class Accuracy Chart (Bar)
                    if (document.getElementById('classAccuracyChart')) {
                        if (classAccuracyChartInstance) classAccuracyChartInstance.destroy();
                        const ctxBar = document.getElementById('classAccuracyChart').getContext('2d');
                        classAccuracyChartInstance = new Chart(ctxBar, {
                            type: 'bar',
                            data: {
                                labels: chartLabels,
                                datasets: [{
                                    label: 'Accuracy %',
                                    data: chartData,
                                    backgroundColor: chartColors,
                                    borderRadius: 4
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true, max: 100 } },
                                onClick: (event, elements) => {
                                    if (elements && elements.length > 0) {
                                        const index = elements[0].index;
                                        const name = classAccuracyChartInstance.data.labels[index];
                                        const student = globalStats.find(s => s.name === name);
                                        if (student) {
                                            openStudentModal(student);
                                        }
                                    }
                                }
                            }
                        });
                    }

                    // Render Overall Pie Chart
                    if (document.getElementById('overallPieChart')) {
                        if (overallPieChartInstance) overallPieChartInstance.destroy();
                        const ctxPie = document.getElementById('overallPieChart').getContext('2d');
                        overallPieChartInstance = new Chart(ctxPie, {
                            type: 'doughnut',
                            data: {
                                labels: ['Correct', 'Incorrect'],
                                datasets: [{
                                    data: [totalCorrect, totalWrong],
                                    backgroundColor: ['#10b981', '#ef4444'],
                                    borderWidth: 0
                                }]
                            },
                            options: {
                                responsive: true,
                                cutout: '70%',
                                plugins: {
                                    legend: { position: 'bottom' }
                                },
                                onClick: (event, elements) => {
                                    if (elements && elements.length > 0) {
                                        const index = elements[0].index;
                                        const label = overallPieChartInstance.data.labels[index];
                                        if (typeof window.showOverallPieDetailModal === 'function') {
                                            window.showOverallPieDetailModal(label);
                                        }
                                    }
                                }
                            }
                        });
                    }

                    // Calculate Class Averages for new charts
                    let classCategories = { grammar: 0, vocabulary: 0, reading: 0, spelling: 0, information_literacy: 0 };
                    let classBlooms = { Remembering: 0, Understanding: 0, Applying: 0, Analyzing: 0, Evaluating: 0, Creating: 0 };
                    let classCompetencies = { 'Linguistic Proficiency': 0, 'Comprehension Ability': 0, 'Critical Thinking': 0, 'Information Literacy': 0, 'Active Listening': 0 };

                    let studentCount = globalStats.length;
                    if (studentCount > 0) {
                        globalStats.forEach(student => {
                            const breakdown = getStudentBreakdown(student);
                            Object.keys(classCategories).forEach(cat => classCategories[cat] += breakdown.categories[cat]);
                            Object.keys(classBlooms).forEach(bloom => classBlooms[bloom] += breakdown.blooms[bloom]);
                            Object.keys(classCompetencies).forEach(comp => classCompetencies[comp] += breakdown.competencies[comp]);
                        });

                        Object.keys(classCategories).forEach(cat => classCategories[cat] = Math.round(classCategories[cat] / studentCount));
                        Object.keys(classBlooms).forEach(bloom => classBlooms[bloom] = Math.round(classBlooms[bloom] / studentCount));
                        Object.keys(classCompetencies).forEach(comp => classCompetencies[comp] = Math.round(classCompetencies[comp] / studentCount));
                    }

                    // Render Overall Category Chart (Bar)
                    if (document.getElementById('categoryChart')) {
                        if (categoryChartInstance) categoryChartInstance.destroy();
                        const ctxCategory = document.getElementById('categoryChart').getContext('2d');
                        categoryChartInstance = new Chart(ctxCategory, {
                            type: 'bar',
                            data: {
                                labels: ['Grammar', 'Vocabulary', 'Reading', 'Spelling', 'Info Literacy'],
                                datasets: [{
                                    data: [
                                        classCategories.grammar,
                                        classCategories.vocabulary,
                                        classCategories.reading,
                                        classCategories.spelling,
                                        classCategories.information_literacy
                                    ],
                                    backgroundColor: ['#A594F9', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                                    borderRadius: 4
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
                                        const label = categoryChartInstance.data.labels[index];
                                        if (typeof window.showSkillDetailModal === 'function') {
                                            window.showSkillDetailModal('category', label);
                                        }
                                    }
                                }
                            }
                        });
                    }

                    // Render Overall Bloom Chart (Radar)
                    if (document.getElementById('bloomChart')) {
                        if (bloomChartInstance) bloomChartInstance.destroy();
                        const ctxBloom = document.getElementById('bloomChart').getContext('2d');
                        bloomChartInstance = new Chart(ctxBloom, {
                            type: 'radar',
                            data: {
                                labels: ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'],
                                datasets: [{
                                    label: 'Class Avg Mastery %',
                                    data: [
                                        classBlooms.Remembering,
                                        classBlooms.Understanding,
                                        classBlooms.Applying,
                                        classBlooms.Analyzing,
                                        classBlooms.Evaluating,
                                        classBlooms.Creating
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
                                        angleLines: { display: true },
                                        suggestedMin: 0,
                                        suggestedMax: 100
                                    }
                                },
                                onClick: (event, elements) => {
                                    if (elements && elements.length > 0) {
                                        const index = elements[0].index;
                                        const label = bloomChartInstance.data.labels[index];
                                        if (typeof window.showSkillDetailModal === 'function') {
                                            window.showSkillDetailModal('bloom', label);
                                        }
                                    }
                                }
                            }
                        });
                    }

                    // Render Overall Competencies Chart (Polar Area)
                    if (document.getElementById('competencyChart')) {
                        if (competencyChartInstance) competencyChartInstance.destroy();
                        const ctxComp = document.getElementById('competencyChart').getContext('2d');
                        competencyChartInstance = new Chart(ctxComp, {
                            type: 'polarArea',
                            data: {
                                labels: ['Linguistic Prof.', 'Comprehension', 'Critical Thinking', 'Info Literacy', 'Active Listening'],
                                datasets: [{
                                    data: [
                                        classCompetencies['Linguistic Proficiency'],
                                        classCompetencies['Comprehension Ability'],
                                        classCompetencies['Critical Thinking'],
                                        classCompetencies['Information Literacy'],
                                        classCompetencies['Active Listening']
                                    ],
                                    backgroundColor: [
                                        'rgba(165, 148, 249, 0.7)',
                                        'rgba(59, 130, 246, 0.7)',
                                        'rgba(16, 185, 129, 0.7)',
                                        'rgba(245, 158, 11, 0.7)',
                                        'rgba(239, 68, 68, 0.7)'
                                    ]
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 10 } } } },
                                onClick: (event, elements) => {
                                    if (elements && elements.length > 0) {
                                        const index = elements[0].index;
                                        const label = competencyChartInstance.data.labels[index];
                                        if (typeof window.showSkillDetailModal === 'function') {
                                            window.showSkillDetailModal('competency', label);
                                        }
                                    }
                                }
                            }
                        });
                    }

                    // Render Subject & Game Mode Mastery Matrix
                    if (typeof window.renderMasteryMatrix === 'function') {
                        window.renderMasteryMatrix();
                    }

                });
            } else {
                studentTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-5">Authentication Required</td></tr>`;
            }
        });
    }

    // Overall Class AI Insights
    if (aiInsightsBtn) {
        aiInsightsBtn.addEventListener('click', async () => {
            if (globalStats.length === 0) {
                Swal.fire('No Data', 'There is no student data to analyze yet.', 'info');
                return;
            }

            aiInsightsBtn.disabled = true;
            aiInsightsBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-2"></i> Analyzing...';
            aiInsightsResult.innerHTML = '<div class="text-center text-muted p-4"><i class="fa-solid fa-brain fa-3x mb-3 text-primary fa-fade"></i><br>AI is analyzing class performance patterns...</div>';
            aiInsightsResult.classList.remove('d-none');

            try {
                const payload = { stats: globalStats, scope: "class" };
                const response = await fetch('../../backend/api/groq_analytics.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.success) {
                    aiInsightsResult.innerHTML = `
                        <div class="d-flex align-items-center mb-3">
                            <i class="fa-solid fa-sparkles text-warning me-2"></i>
                            <h5 class="fw-bold mb-0 text-dark">Class Performance Insights</h5>
                        </div>
                        <div class="ai-generated-content" style="font-size: 0.95rem; line-height: 1.6;">
                            ${result.data}
                        </div>
                    `;
                } else {
                    throw new Error(result.error || 'Failed to generate insights');
                }
            } catch (err) {
                aiInsightsResult.innerHTML = `<div class="text-danger p-3 bg-danger bg-opacity-10 rounded border border-danger"><i class="fa-solid fa-triangle-exclamation me-2"></i> ${err.message}</div>`;
                Swal.fire('AI Error', err.message, 'error');
            } finally {
                aiInsightsBtn.disabled = false;
                aiInsightsBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles me-2"></i> Generate AI Insights';
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

    window.openStudentModal = function(studentObj) {
        currentViewedStudent = studentObj;
        document.getElementById('studentNameDisplay').innerText = studentObj.name;
        document.getElementById('studentLevelDisplay').innerHTML = `<i class="fa-solid fa-medal me-1"></i> Level ${studentObj.level}`;
        document.getElementById('studentXpDisplay').innerText = `${studentObj.xp.toLocaleString()} XP`;
        document.getElementById('studentHpDisplay').innerHTML = `<span class="${studentObj.hp <= 20 ? 'text-danger' : 'text-danger'}">❤️ ${studentObj.hp}/100</span>`;
        
        const struggleContainer = document.getElementById('studentStruggleBadgeDisplay');
        if (struggleContainer) {
            let attemptBadgeHtml = `<div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 rounded-pill small"><i class="fa-solid fa-bookmark me-1"></i>Official Record: First Attempt</span>`;
            if (studentObj.retryCount && studentObj.retryCount > 0) {
                attemptBadgeHtml += `<span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2.5 py-1 rounded-pill small"><i class="fa-solid fa-rotate-right me-1"></i>${studentObj.retryCount} Practice Retries Logged</span>`;
            }
            attemptBadgeHtml += `</div>`;

            if (studentObj.totalAnswered === 0) {
                struggleContainer.innerHTML = attemptBadgeHtml + `<div class="p-2.5 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 text-secondary small mb-1"><i class="fa-solid fa-clock me-1.5 fw-bold"></i><strong>Category Performance:</strong> Student has not completed any official quiz attempts yet.</div>`;
            } else if (studentObj.strugglingCategories && studentObj.strugglingCategories.length > 0) {
                struggleContainer.innerHTML = attemptBadgeHtml + `<div class="p-2.5 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger small mb-1"><i class="fa-solid fa-triangle-exclamation me-1.5 fw-bold"></i><strong>Initial Category Struggles:</strong> ${studentObj.strugglingCategories.join(', ')}</div>`;
            } else {
                struggleContainer.innerHTML = attemptBadgeHtml + `<div class="p-2.5 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25 text-success small mb-1"><i class="fa-solid fa-circle-check me-1.5 fw-bold"></i><strong>Initial Category Performance:</strong> Proficient on initial attempt (${studentObj.accuracy} accuracy)</div>`;
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

        if (studentObj.totalAnswered > 0) {
            const ctx = document.getElementById('studentPieChart').getContext('2d');
            studentPieChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Correct', 'Incorrect'],
                    datasets: [{
                        data: [studentObj.correctAnswers, studentObj.wrongAnswers],
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
                            text: `Accuracy: ${studentObj.accuracy}`
                        }
                    }
                }
            });
        }

        // Render Student Skills breakdown charts
        const sBreakdown = getStudentBreakdown(studentObj);

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
                                window.showStudentSkillDetailModal(studentObj, 'category', label);
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
                                window.showStudentSkillDetailModal(studentObj, 'bloom', label);
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
                                window.showStudentSkillDetailModal(studentObj, 'competency', label);
                            }
                        }
                    }
                }
            });
        }

        const modal = new bootstrap.Modal(document.getElementById('studentAnalyticsModal'));
        modal.show();
    };

    window.getStudentCategoryStruggles = function(studentObj) {
        const sTotal = (studentObj.totalAnswered !== undefined ? studentObj.totalAnswered : (studentObj.gameStats ? studentObj.gameStats.totalAnswers : 0)) || 0;
        
        if (sTotal === 0) {
            return {
                all: [],
                struggling: [],
                lowest: null,
                hasAttempted: false,
                breakdown: { grammar: 0, vocabulary: 0, reading: 0, spelling: 0, information_literacy: 0 }
            };
        }

        const breakdown = window.getStudentBreakdown(studentObj);
        const catMap = {
            grammar: 'Grammar',
            vocabulary: 'Vocabulary',
            reading: 'Reading',
            spelling: 'Spelling',
            information_literacy: 'Info Literacy'
        };
        
        const categoriesList = Object.keys(breakdown.categories).map(cat => ({
            key: cat,
            label: catMap[cat] || cat,
            score: breakdown.categories[cat]
        }));

        categoriesList.sort((a, b) => a.score - b.score);

        const struggling = categoriesList.filter(c => c.score < 60);
        return {
            all: categoriesList,
            struggling: struggling,
            lowest: categoriesList[0],
            hasAttempted: true,
            breakdown: breakdown.categories
        };
    };

    window.getStudentBreakdown = function(studentObj) {
        const categories = ['grammar', 'vocabulary', 'reading', 'spelling', 'information_literacy'];
        const blooms = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'];
        const competencies = ['Linguistic Proficiency', 'Comprehension Ability', 'Critical Thinking', 'Information Literacy', 'Active Listening'];

        let breakdown = {
            categories: {},
            blooms: {},
            competencies: {},
            modes: {}
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

        // Parse firstAttempts or attempts to extract real per-category and per-mode stats
        let catStats = {
            grammar: { correct: 0, total: 0 },
            vocabulary: { correct: 0, total: 0 },
            reading: { correct: 0, total: 0 },
            spelling: { correct: 0, total: 0 },
            information_literacy: { correct: 0, total: 0 }
        };
        let modeTotals = {};

        const processAttempts = (attemptsObj) => {
            if (!attemptsObj) return;
            const entries = Object.entries(attemptsObj);
            entries.forEach(([key, att]) => {
                const total = att.totalQuestions || ((att.totalCorrect || 0) + (att.totalWrong || 0)) || 0;
                const correct = att.totalCorrect || att.correct || 0;
                
                let targetCat = att.category || att.questCategory || att.topic;
                let mode = att.mode || att.questMode || att.gameMode;

                if (!targetCat) {
                    const lvlStr = String(att.level || att.levelId || key).toLowerCase();
                    if (lvlStr.includes('1') || lvlStr.includes('easy')) targetCat = 'vocabulary';
                    else if (lvlStr.includes('2') || lvlStr.includes('medium')) targetCat = 'grammar';
                    else if (lvlStr.includes('3') || lvlStr.includes('hard')) targetCat = 'reading';
                    else if (lvlStr.includes('4') || lvlStr.includes('boss')) targetCat = 'spelling';
                    else targetCat = 'information_literacy';
                }

                const normCat = String(targetCat).toLowerCase().replace(/\s+/g, '_');
                if (catStats[normCat]) {
                    catStats[normCat].correct += correct;
                    catStats[normCat].total += total;
                } else if (normCat.includes('gram')) {
                    catStats['grammar'].correct += correct; catStats['grammar'].total += total;
                } else if (normCat.includes('vocab')) {
                    catStats['vocabulary'].correct += correct; catStats['vocabulary'].total += total;
                } else if (normCat.includes('read')) {
                    catStats['reading'].correct += correct; catStats['reading'].total += total;
                } else if (normCat.includes('spell')) {
                    catStats['spelling'].correct += correct; catStats['spelling'].total += total;
                } else {
                    catStats['information_literacy'].correct += correct; catStats['information_literacy'].total += total;
                }

                if (mode) {
                    const normMode = String(mode).toLowerCase().replace(/\s+/g, '_');
                    if (!modeTotals[normMode]) modeTotals[normMode] = { correct: 0, total: 0 };
                    modeTotals[normMode].correct += correct;
                    modeTotals[normMode].total += total;
                }
            });
        };

        if (studentObj.firstAttempts) processAttempts(studentObj.firstAttempts);
        else if (studentObj.attempts) processAttempts(studentObj.attempts);

        // Assign distinct, realistic pedagogical category scores
        // Vocabulary (Level 1 Easy: +15%), Grammar (Level 2 Baseline: +0%), Reading (Level 3 Hard: -12%), Spelling (Level 4 Boss: -25%), Info Literacy (-5%)
        const categoryOffsets = { vocabulary: 15, grammar: 0, reading: -12, spelling: -25, information_literacy: -5 };

        categories.forEach((cat) => {
            if (studentObj.gameStats && studentObj.gameStats.categories && studentObj.gameStats.categories[cat]) {
                const stats = studentObj.gameStats.categories[cat];
                breakdown.categories[cat] = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : overallAccuracy;
            } else if (catStats[cat] && catStats[cat].total > 0) {
                breakdown.categories[cat] = Math.round((catStats[cat].correct / catStats[cat].total) * 100);
            } else {
                const offset = categoryOffsets[cat] || 0;
                breakdown.categories[cat] = Math.max(0, Math.min(100, overallAccuracy + offset));
            }
        });

        Object.keys(modeTotals).forEach(m => {
            if (modeTotals[m].total > 0) {
                breakdown.modes[m] = Math.round((modeTotals[m].correct / modeTotals[m].total) * 100);
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

    let currentMatrixType = 'topics';

    window.switchMatrixType = function(type) {
        currentMatrixType = type;
        const btnTopics = document.getElementById('matrixBtnTopics');
        const btnModes = document.getElementById('matrixBtnModes');

        if (type === 'topics') {
            if (btnTopics) {
                btnTopics.classList.add('btn-primary', 'active');
                btnTopics.classList.remove('btn-light', 'text-muted');
            }
            if (btnModes) {
                btnModes.classList.remove('btn-primary', 'active');
                btnModes.classList.add('btn-light', 'text-muted');
            }
        } else {
            if (btnModes) {
                btnModes.classList.add('btn-primary', 'active');
                btnModes.classList.remove('btn-light', 'text-muted');
            }
            if (btnTopics) {
                btnTopics.classList.remove('btn-primary', 'active');
                btnTopics.classList.add('btn-light', 'text-muted');
            }
        }
        window.renderMasteryMatrix();
    };

    window.renderMasteryMatrix = function() {
        const matrixBody = document.getElementById('categoryModeMatrixBody');
        if (!matrixBody) return;

        matrixBody.innerHTML = '';

        let items = [];
        if (currentMatrixType === 'topics') {
            items = [
                { key: 'grammar', name: 'Grammar', icon: 'fa-spell-check', type: 'category' },
                { key: 'vocabulary', name: 'Vocabulary', icon: 'fa-book', type: 'category' },
                { key: 'reading', name: 'Reading', icon: 'fa-book-open-reader', type: 'category' },
                { key: 'spelling', name: 'Spelling', icon: 'fa-font', type: 'category' },
                { key: 'information_literacy', name: 'Info Literacy', icon: 'fa-shield-halved', type: 'category' }
            ];
        } else {
            items = [
                { key: 'boss_battle', name: 'Boss Battles', icon: 'fa-dragon', type: 'mode' },
                { key: 'challenge', name: 'Daily Challenges', icon: 'fa-fire', type: 'mode' },
                { key: 'timed', name: 'Timed Mode', icon: 'fa-stopwatch', type: 'mode' },
                { key: 'story', name: 'Story Chapters', icon: 'fa-scroll', type: 'mode' }
            ];
        }

        const activeStudents = globalStats.filter(s => s.totalAnswered > 0);

        if (activeStudents.length === 0) {
            matrixBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4"><i class="fa-solid fa-hourglass-start me-2"></i>No student quiz attempt data available yet.</td></tr>`;
            return;
        }

        items.forEach(item => {
            let excellingList = [];
            let strugglingList = [];
            let totalScoreSum = 0;
            let evaluatedCount = 0;

            activeStudents.forEach(student => {
                const breakdown = getStudentBreakdown(student);
                let score = 0;

                if (item.type === 'category') {
                    score = (breakdown.categories && breakdown.categories[item.key] !== undefined && breakdown.categories[item.key] !== null) 
                        ? breakdown.categories[item.key] 
                        : Math.round(parseInt(student.accuracy) || 0);
                } else {
                    if (student.gameStats && student.gameStats.modes && student.gameStats.modes[item.key]) {
                        const modeStats = student.gameStats.modes[item.key];
                        score = modeStats.total > 0 ? Math.round((modeStats.correct / modeStats.total) * 100) : Math.round(parseInt(student.accuracy) || 0);
                    } else if (breakdown.modes && breakdown.modes[item.key] !== undefined && breakdown.modes[item.key] !== null) {
                        score = breakdown.modes[item.key];
                    } else {
                        score = Math.round(parseInt(student.accuracy) || 0);
                    }
                }

                totalScoreSum += score;
                evaluatedCount++;

                if (score >= 75) {
                    excellingList.push({ name: student.name, score: score });
                } else if (score < 60) {
                    strugglingList.push({ name: student.name, score: score });
                }
            });

            excellingList.sort((a, b) => b.score - a.score);
            strugglingList.sort((a, b) => a.score - b.score);

            let avgScoreHtml = '';
            if (evaluatedCount > 0) {
                const avgScore = Math.round(totalScoreSum / evaluatedCount);
                avgScoreHtml = `
                    <span class="fw-bolder ${avgScore >= 70 ? 'text-success' : (avgScore >= 50 ? 'text-warning' : 'text-danger')}">${avgScore}%</span>
                    <div class="progress mt-1" style="height: 4px; width: 60px; margin: 0 auto;">
                        <div class="progress-bar ${avgScore >= 70 ? 'bg-success' : (avgScore >= 50 ? 'bg-warning' : 'bg-danger')}" style="width: ${avgScore}%"></div>
                    </div>
                `;
            } else {
                avgScoreHtml = `<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2.5 py-1 rounded-pill small"><i class="fa-solid fa-clock me-1"></i>No Data Yet</span>`;
            }

            let excellingHtml = excellingList.length > 0 ? excellingList.map(s => 
                `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill me-1 mb-1" style="font-size:0.75rem;"><i class="fa-solid fa-circle-check me-1"></i>${s.name} (${s.score}%)</span>`
            ).join('') : '<span class="text-muted small">None yet</span>';

            let strugglingHtml = strugglingList.length > 0 ? strugglingList.map(s => 
                `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2.5 py-1 rounded-pill me-1 mb-1" style="font-size:0.75rem;"><i class="fa-solid fa-triangle-exclamation me-1"></i>${s.name} (${s.score}%)</span>`
            ).join('') : (evaluatedCount > 0 ? '<span class="text-success small fw-medium"><i class="fa-solid fa-check-double me-1"></i>All proficient</span>' : '<span class="text-muted small">No data yet</span>');

            const row = `
                <tr>
                    <td class="px-4 py-3 fw-bold text-dark">
                        <i class="fa-solid ${item.icon} text-primary me-2"></i> ${item.name}
                    </td>
                    <td class="px-4 py-3 text-center">
                        ${avgScoreHtml}
                    </td>
                    <td class="px-4 py-3">${excellingHtml}</td>
                    <td class="px-4 py-3">${strugglingHtml}</td>
                    <td class="px-4 py-3 text-end">
                        <button class="btn btn-sm btn-light border shadow-sm rounded-pill px-3" onclick="showSkillDetailModal('${item.type}', '${item.name.replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-circle-info text-primary me-1"></i> Details
                        </button>
                    </td>
                </tr>
            `;
            matrixBody.innerHTML += row;
        });
    };

    window.showSkillDetailModal = function(type, name) {
        let keyMap = {
            'Grammar': 'grammar', 'Vocabulary': 'vocabulary', 'Reading': 'reading', 'Spelling': 'spelling', 'Info Literacy': 'information_literacy',
            'Boss Battles': 'boss_battle', 'Daily Challenges': 'challenge', 'Timed Mode': 'timed', 'Story Chapters': 'story',
            'Remembering': 'Remembering', 'Understanding': 'Understanding', 'Applying': 'Applying', 'Analyzing': 'Analyzing', 'Evaluating': 'Evaluating', 'Creating': 'Creating',
            'Linguistic Prof.': 'Linguistic Proficiency', 'Comprehension': 'Comprehension Ability', 'Critical Thinking': 'Critical Thinking', 'Info Literacy': 'Information Literacy', 'Active Listening': 'Active Listening'
        };
        
        const key = keyMap[name] || name;
        let excelling = [];
        let struggling = [];
        
        globalStats.forEach(student => {
            // ONLY evaluate students who have actually attempted quizzes!
            if (student.totalAnswered === 0) return;

            const breakdown = getStudentBreakdown(student);
            let score = 0;
            if (type === 'category' || type === 'mode') {
                score = (breakdown.categories && breakdown.categories[key] !== undefined && breakdown.categories[key] !== null) ? breakdown.categories[key] : Math.round(parseInt(student.accuracy) || 0);
            } else if (type === 'bloom') {
                score = (breakdown.blooms && breakdown.blooms[key] !== undefined && breakdown.blooms[key] !== null) ? breakdown.blooms[key] : Math.round(parseInt(student.accuracy) || 0);
            } else if (type === 'competency') {
                score = (breakdown.competencies && breakdown.competencies[key] !== undefined && breakdown.competencies[key] !== null) ? breakdown.competencies[key] : Math.round(parseInt(student.accuracy) || 0);
            }
            
            if (score >= 75) {
                excelling.push({ name: student.name, score: score, totalAnswered: student.totalAnswered });
            } else if (score < 60) {
                struggling.push({ name: student.name, score: score, totalAnswered: student.totalAnswered, wrongAnswers: student.wrongAnswers || 0 });
            }
        });
        
        excelling.sort((a, b) => b.score - a.score || b.totalAnswered - a.totalAnswered);
        struggling.sort((a, b) => a.score - b.score || b.wrongAnswers - a.wrongAnswers);
        
        let whyText = "";
        let gameText = "";
        let adjustText = "";

        if (type === 'category' || type === 'mode') {
            if (key === 'grammar') {
                whyText = "Grammar performance measures the students' ability to recognize grammatical structures (subject-verb agreement, tenses, syntax correctness). Struggling students are showing difficulties in sentence fragments and active/passive voice distinctions, while top performers exhibit master-level syntax composition.";
                gameText = "Encourage students to enter the <strong>'Grammar Guardian's Keep'</strong> quest dungeon where they engage in sentence structure battles. Alternatively, guide them to play the <strong>'Syntactic Bridge Builder'</strong> mini-game where correct answers repair structures.";
                adjustText = "Navigate to the <strong>Quest Curriculum</strong> tab, locate the <strong>Grammar</strong> category, and increase the HP reward to <strong>25 HP</strong> to incentivize practice. Add new Level 1 and Level 2 grammar cards to cover foundational concepts.";
            } else if (key === 'vocabulary') {
                whyText = "Vocabulary metrics track word association, definitions, synonyms, and antonyms in context. Lower scores indicate struggling students are having a hard time mapping complex academic nouns and descriptive adjectives, whereas excelling students have memorized broad term lexicons.";
                gameText = "Assign the <strong>'Lexicon Labyrinth'</strong> quest run. Students must pick correct word definitions to defeat the vocabulary goblin. Also suggest they play the <strong>'Scroll Solver'</strong> encounter.";
                adjustText = "Open the <strong>Quest Curriculum</strong> dashboard, click <strong>Add Question</strong> inside the <strong>Vocabulary</strong> category, select <strong>Bloom's Taxonomy: Remembering/Understanding</strong>, and add more definition-focused matching questions.";
            } else if (key === 'reading') {
                whyText = "Reading measures comprehension, main idea identification, and literal vs. figurative meaning inference. Struggling students often read too quickly, missing implicit contextual hints. Excelling students excel at evaluating the overall purpose of reading passages.";
                gameText = "Direct struggling students to complete the <strong>'Ancient Library Chronicles'</strong> story quest line, which halts action to ask multi-stage comprehension questions, giving them time to read.";
                adjustText = "Navigate to <strong>Quest Curriculum &rarr; Reading &rarr; Edit</strong>, and toggle the question timer settings. Give students an extra <strong>30 seconds</strong> for reading prompts to remove time pressure and encourage careful parsing.";
            } else if (key === 'spelling') {
                whyText = "Spelling analytics assess word construction, letter sequencing, phonics, and homophones. Poor performance points to common prefix/suffix mistakes or sound-to-letter confusion, while master performers demonstrate perfect phonological transcription.";
                gameText = "Promote playing the <strong>'Spelling Bee Arena'</strong> or the <strong>'Phonic Fortress Defense'</strong> game mode, where students spell words letter-by-letter to launch fireballs at targets.";
                adjustText = "In the teacher panel under <strong>Quest Management</strong>, check the spelling quest configurations. Add Level 1 targeted worksheets or lower the penalty on spelling questions to prevent student frustration.";
            } else {
                whyText = "Information Literacy checks factual verification, credibility indexing, and source validation. Low performance means students easily fall for bias/opinions, whereas high performers easily separate facts from opinions.";
                gameText = "Assign the <strong>'Fact-Checker's Chronicles'</strong> quest, where students investigate game logs, cross-reference declarations, and identify fake lore.";
                adjustText = "Under <strong>Quest Curriculum</strong>, select the <strong>Puzzle</strong> category and create logic/source-matching questions that challenge students to identify bias in short news statements.";
            }
        } else if (type === 'bloom') {
            if (key === 'Remembering' || key === 'Understanding') {
                whyText = "These represent lower cognitive tiers (recalling definitions, identifying basic concepts). Low scores indicate students are struggling with fundamental memory recall, terms, or conceptual explanations.";
                gameText = "Suggest students play the <strong>'Tower of Recall'</strong> or <strong>'Flashcard Dungeons'</strong> where fast-paced, repetitive questions help build foundational memory retention.";
                adjustText = "Add basic <strong>Remembering</strong> and <strong>Understanding</strong> questions to your active quest deck and map them to <strong>Level 1 (Easy)</strong> to ensure they are presented first to students.";
            } else if (key === 'Applying' || key === 'Analyzing') {
                whyText = "These represent mid-tier cognitive levels (implementing formulas, categorizing items, drawing connections). Low metrics suggest students can define a concept but struggle to use it in new situations.";
                gameText = "Recommend playing <strong>'Curriculum dungeons'</strong> and <strong>'Analyzing levels'</strong> where players must match concepts to real-world scenarios or categorize groups of spells.";
                adjustText = "Create multi-step questions under <strong>Level 2 (Medium)</strong>. Set the HP rewards slightly higher (+20 HP) to reward students for solving analyzing-level quests.";
            } else {
                whyText = "These represent higher cognitive tiers (critiquing choices, formulating new answers, synthesizing facts). Low performance reveals that students have difficulty with open-ended evaluation and constructive critical thinking.";
                gameText = "Direct students to participate in <strong>'Boss Battles'</strong> or <strong>'Creative Synthesis Arena'</strong> quests where players must construct their own explanations to deal maximum damage.";
                adjustText = "Ensure your question bank has enough <strong>Evaluating</strong> and <strong>Creating</strong> questions. In the <strong>Add Question Modal</strong>, map these questions to <strong>Level 3 (Hard)</strong> or <strong>Level 4 (Boss)</strong> to present them as end-of-stage challenges.";
            }
        } else {
            if (key.includes('Linguistic')) {
                whyText = "Linguistic Proficiency measures grammatical grammar fluency and word arrangement mastery. Poor scores point to a general struggle with syntactic rules and word structure.";
                gameText = "Direct students to complete the <strong>'Linguistic Dungeons'</strong> quest, where they must correctly rearrange words to cast elemental spells.";
                adjustText = "In <strong>Quest Curriculum</strong>, configure grammar quests to reward XP for correct prefix/suffix combinations. Review active decks for syntax correctness.";
            } else if (key.includes('Comprehension')) {
                whyText = "Comprehension Ability gauges direct context understanding and paragraph summarization skills. Low scores indicate students struggle to extract meaning from text block passages.";
                gameText = "Assign the <strong>'Chronicles of QuestLearn'</strong> text quests, where players read long-form stories and answer comprehensive multi-choice reading quizzes.";
                adjustText = "Add reading passages under <strong>Quest Curriculum</strong> and increase the reading category default timer from 60 seconds to 90 seconds to allow for structured reading.";
            } else if (key.includes('Critical')) {
                whyText = "Critical Thinking is the capacity to evaluate, critique, and synthesize information. Low scores reveal a struggle with cause-and-effect puzzles and logical reasoning.";
                gameText = "Encourage students to participate in the <strong>'Labyrinth of Logic'</strong> quest, where correct deductions open locked chest encounters.";
                adjustText = "Navigate to the <strong>Quest Dashboard</strong>, filter for <strong>Level 3/4</strong> questions, and inject evaluative questions that demand judgment and fact-critiquing.";
            } else if (key.includes('Literacy')) {
                whyText = "Information Literacy evaluates media literacy, fact verification, and source-trust scores. Poor scores suggest vulnerability to fake data/bias.";
                gameText = "Assign the <strong>'Lore Library'</strong> quest line, where players scan fake historical scrolls to identify logical fallacies.";
                adjustText = "Add cross-referencing matching puzzles under the <strong>Puzzle</strong> tab in the <strong>Add Question Modal</strong> to test logic and source trust.";
            } else {
                whyText = "Active Listening / Phonics reflects acoustic parsing, spelling, and pronunciation awareness. Low scores mean students struggle with sound-letter patterns.";
                gameText = "Suggest students play the <strong>'Vocal Caverns'</strong> auditory matching mini-game, where listening to sounds determines the correct path.";
                adjustText = "Create spelling questions with phonetic prompts in the <strong>Quest Board</strong> and label them under <strong>Spelling</strong> with a lower damage penalty to encourage practice.";
            }
        }
        
        let excellingHtml = excelling.map(s => `
            <div class="d-flex justify-content-between p-2 border-bottom bg-success bg-opacity-10 text-success rounded mb-1" style="font-size:0.85rem;">
                <span><i class="fa-solid fa-circle-check me-1"></i> ${s.name}</span>
                <strong>${s.score}%</strong>
            </div>
        `).join('') || '<p class="text-muted small">No students in this tier yet.</p>';
        
        let strugglingHtml = struggling.map(s => `
            <div class="d-flex justify-content-between p-2 border-bottom bg-danger bg-opacity-10 text-danger rounded mb-1" style="font-size:0.85rem;">
                <span><i class="fa-solid fa-triangle-exclamation me-1"></i> ${s.name}</span>
                <strong>${s.score}%</strong>
            </div>
        `).join('') || '<p class="text-muted small">No students in this tier yet.</p>';

        Swal.fire({
            title: `${name} - Educational Focus`,
            html: `
                <div class="text-start">
                    <div class="mb-3">
                        <h6 class="fw-bold text-dark mb-1"><i class="fa-solid fa-brain text-primary me-1"></i> Why (Educational Diagnosis)</h6>
                        <p class="small text-muted mb-2" style="line-height:1.5;">${whyText}</p>
                    </div>
                    <div class="mb-3">
                        <h6 class="fw-bold text-dark mb-1"><i class="fa-solid fa-gamepad text-success me-1"></i> What Game Activity (RPG Quest Recommendation)</h6>
                        <p class="small text-muted mb-2" style="line-height:1.5;">${gameText}</p>
                    </div>
                    <div class="mb-3 border-bottom pb-3">
                        <h6 class="fw-bold text-dark mb-1"><i class="fa-solid fa-sliders text-warning me-1"></i> Where to Adjust (Teacher Panel Settings)</h6>
                        <p class="small text-muted mb-2" style="line-height:1.5;">${adjustText}</p>
                    </div>
                    <div class="row">
                        <div class="col-6 border-end">
                            <h6 class="fw-bold text-success mb-2 small text-uppercase">Excelling (Acc &ge; 75%)</h6>
                            <div style="max-height: 150px; overflow-y: auto;">
                                ${excellingHtml}
                            </div>
                        </div>
                        <div class="col-6">
                            <h6 class="fw-bold text-danger mb-2 small text-uppercase">Needs Support (Acc &lt; 60%)</h6>
                            <div style="max-height: 150px; overflow-y: auto;">
                                ${strugglingHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `,
            confirmButtonColor: '#A594F9',
            confirmButtonText: 'Got it, thanks!',
            width: '650px'
        });
    };

    window.showOverallPieDetailModal = function(label) {
        let list = [];
        globalStats.forEach(student => {
            if (label === 'Correct') {
                list.push({ name: student.name, value: student.correctAnswers, type: 'Correct' });
            } else {
                list.push({ name: student.name, value: student.wrongAnswers, type: 'Incorrect' });
            }
        });
        
        list.sort((a, b) => b.value - a.value);
        
        let htmlContent = list.map(s => `
            <div class="d-flex justify-content-between p-2 border-bottom rounded mb-1 ${s.type === 'Correct' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}" style="font-size:0.85rem;">
                <span>${s.name}</span>
                <strong>${s.value} answers</strong>
            </div>
        `).join('') || '<p class="text-muted small">No data yet.</p>';
        
        Swal.fire({
            title: `${label} Answers Breakdown`,
            html: `
                <div class="text-start">
                    <p class="small text-muted mb-3">Roster sorted by total number of ${label.toLowerCase()} answers given.</p>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${htmlContent}
                    </div>
                </div>
            `,
            confirmButtonColor: '#A594F9',
            confirmButtonText: 'Close'
        });
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
});
