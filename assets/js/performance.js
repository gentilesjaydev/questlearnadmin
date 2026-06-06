document.addEventListener("DOMContentLoaded", function() {
    const analyticsContainer = document.getElementById('analyticsContainer');
    const generalStatsBox = document.getElementById('generalStatsBox');
    const studentTableBody = document.getElementById('analyticsTableBody');
    const aiInsightsBtn = document.getElementById('aiInsightsBtn');
    const aiInsightsResult = document.getElementById('aiInsightsResult');
    
    // Overall Charts
    let classAccuracyChartInstance = null;
    let overallPieChartInstance = null;

    // Student Modal Charts
    let studentPieChartInstance = null;
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

                                if (student.gameStats) {
                                    sTotal = student.gameStats.totalAnswers || 0;
                                    sCorrect = student.gameStats.totalCorrect || 0;
                                    sWrong = student.gameStats.totalWrong || 0;
                                }

                                totalQuestionsAnswered += sTotal;
                                totalCorrect += sCorrect;
                                totalWrong += sWrong;

                                const accuracy = sTotal > 0 ? Math.round((sCorrect / sTotal) * 100) : 0;
                                
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
                                    totalAnswered: sTotal
                                };
                                globalStats.push(studentPayload);

                                // Data for Bar Chart
                                if (sTotal > 0) {
                                    chartLabels.push(name);
                                    chartData.push(accuracy);
                                    chartColors.push(accuracy >= 70 ? '#10b981' : (accuracy >= 40 ? '#f59e0b' : '#ef4444'));
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
                                        <small class="text-muted" style="font-size:0.75rem;">${sCorrect} correct / ${sWrong} wrong</small>
                                    </td>
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
                        studentTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">No student data found.</td></tr>`;
                    }

                    const overallAccuracy = totalQuestionsAnswered > 0 ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) : 0;
                    
                    generalStatsBox.innerHTML = `
                        <div class="col-md-3">
                            <div class="bg-white p-4 rounded-3 shadow-sm border border-light text-center h-100">
                                <h6 class="text-muted text-uppercase small fw-bold mb-2">Total Students</h6>
                                <h2 class="fw-bolder mb-0 text-dark">${totalStudents}</h2>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="bg-white p-4 rounded-3 shadow-sm border border-light text-center h-100">
                                <h6 class="text-muted text-uppercase small fw-bold mb-2">Total Answers</h6>
                                <h2 class="fw-bolder mb-0 text-primary">${totalQuestionsAnswered.toLocaleString()}</h2>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="bg-white p-4 rounded-3 shadow-sm border border-light text-center h-100">
                                <h6 class="text-muted text-uppercase small fw-bold mb-2">Overall Accuracy</h6>
                                <h2 class="fw-bolder mb-0 ${overallAccuracy >= 70 ? 'text-success' : 'text-warning'}">${overallAccuracy}%</h2>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="bg-white p-4 rounded-3 shadow-sm border border-light text-center h-100">
                                <h6 class="text-muted text-uppercase small fw-bold mb-2">Needs Help</h6>
                                <h2 class="fw-bolder mb-0 text-danger">${globalStats.filter(s => s.hp <= 20).length}</h2>
                                <small class="text-muted" style="font-size:0.75rem;">Students with critical HP</small>
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
                                scales: { y: { beginAtZero: true, max: 100 } }
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
                                }
                            }
                        });
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
        
        const resultBox = document.getElementById('studentAiResult');
        resultBox.classList.add('d-none');
        resultBox.innerHTML = '';
        
        if (studentPieChartInstance) {
            studentPieChartInstance.destroy();
        }

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

        const modal = new bootstrap.Modal(document.getElementById('studentAnalyticsModal'));
        modal.show();
    };
});
