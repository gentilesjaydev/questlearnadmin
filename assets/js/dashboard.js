document.addEventListener("DOMContentLoaded", function() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            initDashboard();
        } else {
            window.location.href = 'pages/auth/login';
        }
    });
});

function initDashboard() {
    // 1. Fetch Students
    db.ref('users').once('value').then((snapshot) => {
        if (snapshot.exists()) {
            let studentCount = 0;
            let totalXp = 0;
            let atRiskCount = 0;
            const xpDistribution = { '< 500': 0, '500 - 2000': 0, '> 2000': 0 };
            let studentList = [];

            // Analytics & Proficiency metrics
            let tierMastered = 0, tierProficient = 0, tierDeveloping = 0, tierNeedsSupport = 0;
            let totalWeightedSum = 0, totalRawSum = 0;
            let cohortThresholdClearedCount = 0, cohortCompetentCount = 0, cohortAtRiskCount = 0;
            let assessedCount = 0;
            
            snapshot.forEach((child) => {
                const data = child.val();
                if (data.role === 'student' || !data.role) {
                    studentCount++;
                    const xp = parseInt(data.xp) || 0;
                    const hp = parseInt(data.hp) || 0;
                    const level = parseInt(data.level) || 1;
                    totalXp += xp;
                    
                    // Consider a student "at risk" if their HP is dangerously low (e.g. <= 20)
                    if(hp <= 20) atRiskCount++;
                    
                    if (level === 1) xpDistribution['< 500']++;
                    else if (level === 2) xpDistribution['500 - 2000']++;
                    else xpDistribution['> 2000']++;
                    
                    const name = data.firstName ? `${data.firstName} ${data.lastName}` : 'Student';
                    studentList.push({ name: name, xp: xp, hp: hp, level: level });

                    // Assessment & Capstone Telemetry Extraction
                    const faStats = extractFirstAttemptStats(data);
                    const sTotal = faStats.totalAnswers;
                    const sCorrect = faStats.totalCorrect;
                    const accuracy = sTotal > 0 ? Math.round((sCorrect / sTotal) * 100) : 0;

                    if (sTotal > 0) {
                        assessedCount++;
                        totalRawSum += accuracy;

                        // DepEd 4-Tier Proficiency Distribution (based on diagnostic accuracy)
                        if (accuracy >= 75) tierMastered++;
                        else if (accuracy >= 60) tierProficient++;
                        else if (accuracy >= 50) tierDeveloping++;
                        else tierNeedsSupport++;

                        // Capstone Weighted Proficiency (WPS) & Cumulative Threshold Gate
                        const wpsData = calculateWeightedProficiency(data, faStats, accuracy);
                        const threshData = calculateCumulativeThresholdProgression(data, wpsData);

                        totalWeightedSum += wpsData.weightedScore;
                        if (threshData.hasPassedMPL) cohortThresholdClearedCount++;
                        if (wpsData.weightedScore >= 75) cohortCompetentCount++;
                        if (wpsData.weightedScore < 60) cohortAtRiskCount++;
                    }
                }
            });
            window.dashboardStudentList = studentList;
            
            document.getElementById('totalStudentsStat').innerText = studentCount.toLocaleString();
            document.getElementById('atRiskStat').innerText = atRiskCount.toLocaleString();
            
            const avgXp = studentCount > 0 ? Math.round(totalXp / studentCount) : 0;
            document.getElementById('avgCompletionStat').innerText = avgXp.toLocaleString() + ' XP';
            
            initDistributionChart(xpDistribution);
            
            // Draw Line Chart with top students
            studentList.sort((a, b) => b.xp - a.xp);
            const topStudents = studentList.slice(0, 7);
            const labels = topStudents.map(s => s.name.substring(0, 10));
            const dataPts = topStudents.map(s => s.xp);
            initPerformanceChart(labels, dataPts);
            
            // Populate feed using real users (up to 8 students in a responsive grid)
            const feedContainer = document.getElementById('recentActivityFeed');
            feedContainer.innerHTML = '';
            studentList.slice(0, 8).forEach(student => {
                const hpColor = student.hp <= 20 ? 'text-danger' : (student.hp < 50 ? 'text-warning' : 'text-success');
                const badgeColor = student.hp <= 20 ? 'danger' : (student.hp < 50 ? 'warning' : 'success');
                feedContainer.innerHTML += `
                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="d-flex align-items-center p-3 bg-light rounded-3 border border-light transition-fast hover-shadow h-100">
                            <div class="bg-white p-2.5 rounded-circle shadow-sm me-3 text-center" style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-user-graduate ${hpColor}"></i>
                            </div>
                            <div class="flex-grow-1 overflow-hidden">
                                <p class="mb-0 text-dark fw-bold text-truncate small">${student.name}</p>
                                <div class="d-flex align-items-center justify-content-between mt-1">
                                    <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-0.5" style="font-size: 0.7rem;">Lvl ${student.level}</span>
                                    <span class="badge bg-${badgeColor} bg-opacity-10 text-${badgeColor} rounded-pill px-2 py-0.5" style="font-size: 0.7rem;"><i class="fa-solid fa-heart me-1"></i>${student.hp}/100</span>
                                </div>
                                <small class="text-muted d-block mt-1" style="font-size: 0.75rem;"><i class="fa-solid fa-star text-warning me-1"></i>${student.xp.toLocaleString()} XP</small>
                            </div>
                        </div>
                    </div>
                `;
            });
            if(studentList.length === 0) {
                feedContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">No registered students found.</div>';
            }

            // Render NATG6 Proficiency Distribution & Performance Analytics Cards
            const cohortSize = assessedCount > 0 ? assessedCount : studentCount;
            const pct = n => cohortSize > 0 ? `${Math.round((n / cohortSize) * 100)}% of cohort` : '0% of cohort';
            const avgWps = assessedCount > 0 ? Math.round(totalWeightedSum / assessedCount) : 0;
            const avgRaw = assessedCount > 0 ? Math.round(totalRawSum / assessedCount) : 0;
            const delta = avgWps - avgRaw;
            const mplRate = assessedCount > 0 ? Math.round((cohortThresholdClearedCount / assessedCount) * 100) : 0;

            const elTierM = document.getElementById('dash_tierMasteredCount');
            if (elTierM) {
                elTierM.textContent = tierMastered;
                document.getElementById('dash_tierMasteredPct').textContent = pct(tierMastered);
                document.getElementById('dash_tierProficientCount').textContent = tierProficient;
                document.getElementById('dash_tierProficientPct').textContent = pct(tierProficient);
                document.getElementById('dash_tierDevelopingCount').textContent = tierDeveloping;
                document.getElementById('dash_tierDevelopingPct').textContent = pct(tierDeveloping);
                document.getElementById('dash_tierNeedsSupportCount').textContent = tierNeedsSupport;
                document.getElementById('dash_tierNeedsSupportPct').textContent = pct(tierNeedsSupport);
            }

            const elAvgWps = document.getElementById('dash_avgWps');
            if (elAvgWps) {
                elAvgWps.textContent = `${avgWps}%`;
                document.getElementById('dash_wpsDelta').textContent = `${delta >= 0 ? '+' : ''}${delta}% vs Raw`;
                document.getElementById('dash_mplPassRate').textContent = `${mplRate}%`;
                document.getElementById('dash_mplPassRatio').textContent = `${cohortThresholdClearedCount}/${assessedCount} cleared`;
                document.getElementById('dash_competentCount').textContent = cohortCompetentCount;
                document.getElementById('dash_competentPct').textContent = pct(cohortCompetentCount);
                document.getElementById('dash_atRiskWps').textContent = cohortAtRiskCount;
                document.getElementById('dash_atRiskWpsPct').textContent = pct(cohortAtRiskCount);
            }
        } else {
            // No users found
            document.getElementById('totalStudentsStat').innerText = '0';
            document.getElementById('avgCompletionStat').innerText = '0 XP';
            document.getElementById('atRiskStat').innerText = '0';
            initDistributionChart({ '< 500': 0, '500 - 2000': 0, '> 2000': 0 });
            initPerformanceChart([], []);
        }
    }).catch(err => console.error("Error fetching users:", err));

    // 2. Fetch Quest Categories (Gamified Data)
    db.ref('quests').once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const categoryCount = snapshot.numChildren();
            document.getElementById('activeQuestsStat').innerText = categoryCount.toLocaleString();
        } else {
            document.getElementById('activeQuestsStat').innerText = '0';
        }
    }).catch(err => console.error("Error fetching quests:", err));
}

// Helper: Extract First-Attempt diagnostic statistics from student record
function extractFirstAttemptStats(student) {
    if (!student) return { totalAnswers: 0, totalCorrect: 0, totalWrong: 0, categories: {} };

    // 1. Explicit firstAttemptStats
    if (student.firstAttemptStats && (student.firstAttemptStats.totalAnswers > 0 || student.firstAttemptStats.totalCorrect > 0)) {
        return {
            totalAnswers: Number(student.firstAttemptStats.totalAnswers) || 0,
            totalCorrect: Number(student.firstAttemptStats.totalCorrect) || 0,
            totalWrong: Number(student.firstAttemptStats.totalWrong) || 0,
            categories: student.firstAttemptStats.categories || {}
        };
    }

    // 2. From firstAttempts dictionary
    if (student.firstAttempts && typeof student.firstAttempts === 'object') {
        let total = 0, correct = 0, wrong = 0;
        const categories = {};
        Object.values(student.firstAttempts).forEach(att => {
            if (att && typeof att === 'object') {
                const c = Number(att.correctAnswers || att.score || att.correct || 0);
                const t = Number(att.totalQuestions || att.total || att.questionsAnswered || 0);
                const w = Math.max(0, t - c);
                total += t;
                correct += c;
                wrong += w;

                const cat = (att.category || 'grammar').toLowerCase();
                if (!categories[cat]) categories[cat] = { total: 0, correct: 0 };
                categories[cat].total += t;
                categories[cat].correct += c;
            }
        });
        if (total > 0) {
            return { totalAnswers: total, totalCorrect: correct, totalWrong: wrong, categories: categories };
        }
    }

    // 3. Fallback: gameHistory level_complete
    if (student.gameHistory && typeof student.gameHistory === 'object') {
        let total = 0, correct = 0, wrong = 0;
        Object.values(student.gameHistory).forEach(e => {
            if (e && typeof e === 'object' && e.type === 'level_complete') {
                const c = Number(e.correct) || 0;
                const w = Number(e.wrong) || 0;
                correct += c;
                wrong += w;
                total += (c + w);
            }
        });
        if (total > 0) {
            return { totalAnswers: total, totalCorrect: correct, totalWrong: wrong, categories: {} };
        }
    }

    // 4. Fallback: gameStats
    if (student.gameStats) {
        return {
            totalAnswers: Number(student.gameStats.totalAnswers) || 0,
            totalCorrect: Number(student.gameStats.totalCorrect) || 0,
            totalWrong: Number(student.gameStats.totalWrong) || 0,
            categories: student.gameStats.categories || {}
        };
    }

    return { totalAnswers: 0, totalCorrect: 0, totalWrong: 0, categories: {} };
}

// Helper: Calculate Weighted Proficiency Score (WPS)
function calculateWeightedProficiency(student, faStats, overallAccuracy) {
    if (!student || (faStats && faStats.totalAnswers === 0) || overallAccuracy === 0) {
        return {
            weightedScore: 0,
            levelDetails: [
                { level: 1, weight: 1.0, accuracy: 0 },
                { level: 2, weight: 1.5, accuracy: 0 },
                { level: 3, weight: 2.0, accuracy: 0 },
                { level: 4, weight: 2.5, accuracy: 0 }
            ]
        };
    }

    const levelData = {
        1: { weight: 1.0, total: 0, correct: 0 },
        2: { weight: 1.5, total: 0, correct: 0 },
        3: { weight: 2.0, total: 0, correct: 0 },
        4: { weight: 2.5, total: 0, correct: 0 }
    };

    let hasSpecificLevelTelemetry = false;
    if (student.firstAttempts && typeof student.firstAttempts === 'object') {
        Object.values(student.firstAttempts).forEach(attempt => {
            if (attempt && typeof attempt === 'object') {
                const lvl = Number(attempt.level || attempt.stage || attempt.difficultyLevel || 1);
                const targetLvl = (lvl >= 1 && lvl <= 4) ? lvl : ((lvl > 4) ? 4 : 1);
                const tot = Number(attempt.totalQuestions || attempt.total || attempt.questionsAnswered || 0);
                const corr = Number(attempt.correctAnswers || attempt.score || attempt.correct || 0);
                if (tot > 0) {
                    levelData[targetLvl].total += tot;
                    levelData[targetLvl].correct += corr;
                    hasSpecificLevelTelemetry = true;
                }
            }
        });
    }

    if (!hasSpecificLevelTelemetry) {
        levelData[1].accuracy = Math.min(100, Math.round(overallAccuracy * 1.08));
        levelData[2].accuracy = Math.min(100, Math.round(overallAccuracy * 1.0));
        levelData[3].accuracy = Math.min(100, Math.round(overallAccuracy * 0.92));
        levelData[4].accuracy = Math.min(100, Math.round(overallAccuracy * 0.85));
    } else {
        for (let l = 1; l <= 4; l++) {
            if (levelData[l].total > 0) {
                levelData[l].accuracy = Math.round((levelData[l].correct / levelData[l].total) * 100);
            } else {
                const fallbacks = [overallAccuracy * 1.05, overallAccuracy, overallAccuracy * 0.9, overallAccuracy * 0.8];
                levelData[l].accuracy = Math.min(100, Math.round(fallbacks[l - 1]));
            }
        }
    }

    let numerator = 0;
    let denominator = 0;
    const details = [];

    for (let l = 1; l <= 4; l++) {
        const acc = levelData[l].accuracy;
        const w = levelData[l].weight;
        numerator += (acc * w);
        denominator += w;
        details.push({ level: l, weight: w, accuracy: acc });
    }

    return {
        weightedScore: Math.round(numerator / denominator),
        levelDetails: details
    };
}

// Helper: Cumulative Threshold Progression calculation
function calculateCumulativeThresholdProgression(student, wpsData) {
    const stageGates = [
        { stage: 1, threshold: 50 },
        { stage: 2, threshold: 55 },
        { stage: 3, threshold: 60 },
        { stage: 4, threshold: 75 }
    ];

    let runningWeightSum = 0;
    let runningScoreSum = 0;
    const milestones = [];

    wpsData.levelDetails.forEach((ld, idx) => {
        runningWeightSum += ld.weight;
        runningScoreSum += (ld.accuracy * ld.weight);
        const cumulativeAvg = Math.round(runningScoreSum / runningWeightSum);
        const gate = stageGates[idx];
        const isCleared = cumulativeAvg >= gate.threshold;

        milestones.push({
            stage: gate.stage,
            threshold: gate.threshold,
            cumulativeScore: cumulativeAvg,
            isCleared: isCleared
        });
    });

    const mplGate = milestones[2]; // Milestone 3 (DepEd 60%)
    const hasPassedMPL = mplGate ? mplGate.isCleared : (wpsData.weightedScore >= 60);

    return {
        hasPassedMPL: hasPassedMPL,
        milestones: milestones
    };
}

// Chart.js Default styling overrides for professional look
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#64748b';

let perfChartInstance = null;
function initPerformanceChart(labels, dataPts) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    if(perfChartInstance) perfChartInstance.destroy();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

    perfChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length ? labels : ['No Data'],
            datasets: [{
                label: 'Total XP',
                data: dataPts.length ? dataPts : [0],
                borderColor: '#2563eb',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#2563eb',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: { backgroundColor: '#0f172a', padding: 12, cornerRadius: 8 }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9', drawBorder: false } },
                x: { grid: { display: false, drawBorder: false } }
            },
            interaction: { intersect: false, mode: 'index' }
        }
    });
}

let distChartInstance = null;
function initDistributionChart(dataMap) {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    if(distChartInstance) distChartInstance.destroy();
    
    const hasData = (dataMap['< 500'] + dataMap['500 - 2000'] + dataMap['> 2000']) > 0;
    const chartData = hasData ? [dataMap['< 500'], dataMap['500 - 2000'], dataMap['> 2000']] : [1, 0, 0];
    const bgColors = hasData ? ['#94a3b8', '#2563eb', '#16a34a'] : ['#e2e8f0', '#e2e8f0', '#e2e8f0'];

    distChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Level 1', 'Level 2', 'Level 3+'],
            datasets: [{
                data: chartData,
                backgroundColor: bgColors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, boxWidth: 8 } }
            }
        }
    });
}
