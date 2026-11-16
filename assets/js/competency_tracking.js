document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById('competencyTableBody');
    const sectionSelect = document.getElementById('compSectionSelect');
    const statusFilter = document.getElementById('compStatusFilter');
    const searchInput = document.getElementById('compSearchInput');
    const countBadge = document.getElementById('filteredStudentCount');

    let allStudents = [];
    let barChartInstance = null;
    let detailRadarInstance = null;

    // Check Firebase
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                initCompetencyTracking();
            } else {
                window.location.href = '../auth/login';
            }
        });
    } else {
        initCompetencyTracking();
    }

    function initCompetencyTracking() {
        const database = (typeof db !== 'undefined') ? db : (firebase && firebase.database ? firebase.database() : null);
        if (!database) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-4">Firebase Database not initialized</td></tr>';
            return;
        }

        // 1. Populate Class Sections dynamically from Firebase 'grades'
        database.ref('grades').once('value').then(snap => {
            const gradesData = snap.val() || {};
            let sections = [];
            Object.keys(gradesData).forEach(gKey => {
                const g = gradesData[gKey];
                if (g && (g.name === 'Grade 6' || g.gradeLevel === 6 || g.grade === 'Grade 6') && g.sections) {
                    if (Array.isArray(g.sections)) {
                        sections = sections.concat(g.sections.filter(s => typeof s === 'string'));
                    } else if (typeof g.sections === 'object') {
                        Object.values(g.sections).forEach(sec => {
                            if (typeof sec === 'string') sections.push(sec);
                            else if (sec && sec.name) sections.push(sec.name);
                        });
                    }
                }
            });

            if (sections.length === 0) sections = ['Acacia', 'Mabini', 'Rizal'];
            const uniqueSecs = Array.from(new Set(sections)).sort();

            if (sectionSelect) {
                sectionSelect.innerHTML = '<option value="ALL">All Grade 6 Sections</option>';
                uniqueSecs.forEach(sec => {
                    const opt = document.createElement('option');
                    opt.value = sec;
                    opt.textContent = `Section ${sec}`;
                    sectionSelect.appendChild(opt);
                });
            }
        });

        // 2. Real-Time Read-Only Listener on 'users'
        database.ref('users').on('value', snapshot => {
            allStudents = [];
            const data = snapshot.val() || {};

            Object.keys(data).forEach(uid => {
                const u = data[uid];
                if (!u || (u.role && u.role !== 'student')) return;

                const firstName = u.firstName || '';
                const lastName = u.lastName || '';
                const name = (firstName + ' ' + lastName).trim() || u.username || u.name || 'Anonymous Student';
                const section = u.section || u.classSection || 'Unassigned';

                // Extract assessment performance
                const faStats = extractFirstAttemptStats(u);
                const sTotal = faStats.totalAnswers;
                const sCorrect = faStats.totalCorrect;
                const accuracy = sTotal > 0 ? Math.round((sCorrect / sTotal) * 100) : 0;

                // Extract competency breakdowns
                const comps = calculateStudentCompetencies(u, faStats, accuracy);
                const statusInfo = getCompetencyStatus(sTotal, accuracy);

                // Capstone Algorithms: Weighted Proficiency Score & Cumulative Threshold Progression
                const wpsData = calculateWeightedProficiency(u, faStats, accuracy);
                const thresholdData = calculateCumulativeThresholdProgression(u, wpsData);

                allStudents.push({
                    uid: uid,
                    name: name,
                    section: section,
                    email: u.email || '',
                    totalAnswers: sTotal,
                    correctAnswers: sCorrect,
                    wrongAnswers: faStats.totalWrong,
                    accuracy: accuracy,
                    weightedScore: wpsData.weightedScore,
                    wpsDelta: wpsData.weightedScore - accuracy,
                    wpsData: wpsData,
                    thresholdPassed: thresholdData.hasPassedMPL,
                    thresholdData: thresholdData,
                    status: statusInfo.label,
                    statusBadgeClass: statusInfo.badgeClass,
                    competencies: comps,
                    remarks: generateCompetencyRemarks(accuracy, comps, sTotal)
                });
            });

            // Sort alphabetically by name
            allStudents.sort((a, b) => a.name.localeCompare(b.name));

            updateKpiStats(allStudents);
            updateBarChart(allStudents);
            renderTable();
        });
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

        // 3. Fallback: gameStats
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

    // Helper: Calculate Weighted Proficiency Score (WPS) based on question difficulty tiers
    function calculateWeightedProficiency(student, faStats, overallAccuracy) {
        if (!student || (faStats && faStats.totalAnswers === 0) || overallAccuracy === 0) {
            return {
                weightedScore: 0,
                formula: 'N/A',
                levelDetails: [
                    { level: 1, name: 'Level 1 (Recall / Easy)', weight: 1.0, total: 0, correct: 0, accuracy: 0 },
                    { level: 2, name: 'Level 2 (Application / Medium)', weight: 1.5, total: 0, correct: 0, accuracy: 0 },
                    { level: 3, name: 'Level 3 (Evaluation / Hard)', weight: 2.0, total: 0, correct: 0, accuracy: 0 },
                    { level: 4, name: 'Level 4 (Creation / Boss)', weight: 2.5, total: 0, correct: 0, accuracy: 0 }
                ]
            };
        }

        const levelData = {
            1: { weight: 1.0, total: 0, correct: 0, name: 'Level 1 (Recall / Easy)' },
            2: { weight: 1.5, total: 0, correct: 0, name: 'Level 2 (Application / Medium)' },
            3: { weight: 2.0, total: 0, correct: 0, name: 'Level 3 (Evaluation / Hard)' },
            4: { weight: 2.5, total: 0, correct: 0, name: 'Level 4 (Creation / Boss)' }
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

        if (student.gameHistory && typeof student.gameHistory === 'object') {
            Object.values(student.gameHistory).forEach(session => {
                if (session && typeof session === 'object') {
                    const lvl = Number(session.level || session.stage || 1);
                    const targetLvl = (lvl >= 1 && lvl <= 4) ? lvl : ((lvl > 4) ? 4 : 1);
                    const tot = Number(session.totalQuestions || session.total || 0);
                    const corr = Number(session.correctAnswers || session.score || session.correct || 0);
                    if (tot > 0) {
                        levelData[targetLvl].total += tot;
                        levelData[targetLvl].correct += corr;
                        hasSpecificLevelTelemetry = true;
                    }
                }
            });
        }

        if (!hasSpecificLevelTelemetry) {
            const raw = overallAccuracy;
            levelData[1].accuracy = Math.min(100, Math.round(raw * 1.08));
            levelData[2].accuracy = Math.min(100, Math.round(raw * 1.0));
            levelData[3].accuracy = Math.min(100, Math.round(raw * 0.92));
            levelData[4].accuracy = Math.min(100, Math.round(raw * 0.85));
            levelData[1].total = 10; levelData[1].correct = Math.round((levelData[1].accuracy / 100) * 10);
            levelData[2].total = 10; levelData[2].correct = Math.round((levelData[2].accuracy / 100) * 10);
            levelData[3].total = 10; levelData[3].correct = Math.round((levelData[3].accuracy / 100) * 10);
            levelData[4].total = 10; levelData[4].correct = Math.round((levelData[4].accuracy / 100) * 10);
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
            details.push({
                level: l,
                name: levelData[l].name,
                weight: w,
                total: levelData[l].total,
                correct: levelData[l].correct,
                accuracy: acc,
                weightedContribution: Math.round((acc * w) / 7.0)
            });
        }

        const weightedProficiency = Math.round(numerator / denominator);
        return {
            weightedScore: weightedProficiency,
            formula: 'WPS = Σ(Accuracy_i × Weight_i) / Σ(Weight_i)',
            levelDetails: details
        };
    }

    // Helper: Cumulative Threshold Progression calculation
    function calculateCumulativeThresholdProgression(student, wpsData) {
        const stageGates = [
            { stage: 1, name: 'Milestone 1 (L1 Recall)', threshold: 50, description: 'Foundational Recall Gate' },
            { stage: 2, name: 'Milestone 2 (L1-L2 Application)', threshold: 55, description: 'Intermediate Application Gate' },
            { stage: 3, name: 'Milestone 3 (L1-L3 DepEd Passing MPL)', threshold: 60, description: 'Standard DepEd Passing Gate (MPL)' },
            { stage: 4, name: 'Milestone 4 (L1-L4 Mastery & Synthesis)', threshold: 75, description: 'Advanced Mastery & Synthesis Gate' }
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
                name: gate.name,
                threshold: gate.threshold,
                cumulativeScore: cumulativeAvg,
                isCleared: isCleared,
                margin: cumulativeAvg - gate.threshold,
                description: gate.description
            });
        });

        const mplGate = milestones[2]; // Milestone 3 (DepEd 60%)
        const hasPassedMPL = mplGate ? mplGate.isCleared : (wpsData.weightedScore >= 60);

        return {
            hasPassedMPL: hasPassedMPL,
            milestones: milestones,
            highestClearedStage: milestones.filter(m => m.isCleared).length,
            mplMargin: mplGate ? mplGate.margin : 0
        };
    }

    // Helper: Compute the 5 NATG6 core competencies
    function calculateStudentCompetencies(student, faStats, overallAccuracy) {
        const comps = {
            'Linguistic Proficiency': overallAccuracy,
            'Comprehension Ability': overallAccuracy,
            'Critical Thinking': overallAccuracy,
            'Information Literacy': overallAccuracy,
            'Active Listening': overallAccuracy
        };

        if (faStats.totalAnswers === 0) {
            Object.keys(comps).forEach(k => comps[k] = 0);
            return comps;
        }

        const cats = faStats.categories || {};
        const catMap = {
            'grammar': 'Linguistic Proficiency',
            'reading': 'Comprehension Ability',
            'vocabulary': 'Critical Thinking',
            'information_literacy': 'Information Literacy'
        };

        Object.keys(catMap).forEach(cat => {
            const compName = catMap[cat];
            if (cats[cat] && cats[cat].total > 0) {
                comps[compName] = Math.round((cats[cat].correct / cats[cat].total) * 100);
            }
        });

        // Also check student.gameStats.competencies if available
        if (student.gameStats && student.gameStats.competencies) {
            Object.keys(comps).forEach(k => {
                if (student.gameStats.competencies[k] !== undefined) {
                    const cStat = student.gameStats.competencies[k];
                    if (typeof cStat === 'number') comps[k] = Math.round(cStat);
                    else if (cStat && cStat.total > 0) comps[k] = Math.round((cStat.correct / cStat.total) * 100);
                }
            });
        }

        return comps;
    }

    // Helper: Classify Competency Status according to NATG6 standards
    function getCompetencyStatus(totalAnswers, accuracy) {
        if (!totalAnswers || totalAnswers === 0) {
            return { label: 'Not Started', badgeClass: 'bg-secondary bg-opacity-10 text-secondary border' };
        }
        if (accuracy >= 75) {
            return { label: 'Competent', badgeClass: 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' };
        }
        if (accuracy >= 60) {
            return { label: 'In Progress', badgeClass: 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25' };
        }
        if (accuracy >= 50) {
            return { label: 'Needs Improvement', badgeClass: 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25' };
        }
        return { label: 'Not Yet Competent', badgeClass: 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25' };
    }

    // Helper: Construct pedagogical diagnostic remarks
    function generateCompetencyRemarks(accuracy, comps, totalAnswers) {
        if (totalAnswers === 0) {
            return 'Learner has not yet begun curriculum quests. Initial diagnostic required.';
        }
        if (accuracy >= 85) {
            return 'Demonstrates advanced mastery across curriculum standards. Ready for high-order challenge stages.';
        }
        if (accuracy >= 75) {
            return 'Solid foundational mastery achieved (MPL compliant). Maintain consistent practice across all domains.';
        }
        if (accuracy >= 60) {
            // Find lowest competency
            let lowest = 'Linguistic Proficiency';
            let minVal = 100;
            Object.keys(comps).forEach(k => {
                if (comps[k] < minVal) { minVal = comps[k]; lowest = k; }
            });
            return `Passing MPL benchmark. Targeted remediation recommended in ${lowest}.`;
        }
        if (accuracy >= 50) {
            return 'Developing mastery below passing threshold. Scaffolded guided practice required in core topics.';
        }
        return 'Substantial learning intervention required. Review fundamental grammar rules and basic reading passages.';
    }

    // Update KPI Status Summary Cards
    function updateKpiStats(students) {
        const total = students.length;
        document.getElementById('statTotalStudents').textContent = total.toLocaleString();

        const assessed = students.filter(s => s.totalAnswers > 0);
        const avgAcc = assessed.length > 0 
            ? Math.round(assessed.reduce((sum, s) => sum + s.accuracy, 0) / assessed.length) 
            : 0;
        document.getElementById('statAvgAccuracy').textContent = `${avgAcc}%`;

        // Weighted Performance & Threshold Metrics
        const avgWps = assessed.length > 0
            ? Math.round(assessed.reduce((sum, s) => sum + s.weightedScore, 0) / assessed.length)
            : 0;
        const wpsDelta = avgWps - avgAcc;
        const clearedMplCount = assessed.filter(s => s.thresholdPassed).length;
        const mplPassRate = assessed.length > 0 ? Math.round((clearedMplCount / assessed.length) * 100) : 0;
        const atRiskCount = assessed.filter(s => !s.thresholdPassed || s.accuracy < 60).length;

        if (document.getElementById('statAvgWps')) {
            document.getElementById('statAvgWps').textContent = `${avgWps}%`;
            document.getElementById('statWpsDelta').textContent = `${wpsDelta >= 0 ? '+' : ''}${wpsDelta}% Calibration`;
        }
        if (document.getElementById('statThresholdPassRate')) {
            document.getElementById('statThresholdPassRate').textContent = `${mplPassRate}%`;
            document.getElementById('statThresholdPassRatio').textContent = `${clearedMplCount}/${assessed.length} Cleared`;
        }
        if (document.getElementById('statAtRiskCount')) {
            document.getElementById('statAtRiskCount').textContent = atRiskCount;
            document.getElementById('statAtRiskPct').textContent = total > 0 ? `${Math.round((atRiskCount / total) * 100)}% of cohort` : '0%';
        }

        let competent = 0, inProgress = 0, needsImprovement = 0, notYetCompetent = 0;
        students.forEach(s => {
            if (s.status === 'Competent') competent++;
            else if (s.status === 'In Progress') inProgress++;
            else if (s.status === 'Needs Improvement') needsImprovement++;
            else if (s.status === 'Not Yet Competent') notYetCompetent++;
        });

        document.getElementById('statCompetentCount').textContent = competent;
        document.getElementById('statCompetentPct').textContent = total > 0 ? `${Math.round((competent/total)*100)}% of cohort` : '0%';

        document.getElementById('statInProgressCount').textContent = inProgress;
        document.getElementById('statInProgressPct').textContent = total > 0 ? `${Math.round((inProgress/total)*100)}% of cohort` : '0%';

        document.getElementById('statNeedsImprovementCount').textContent = needsImprovement;
        document.getElementById('statNeedsImprovementPct').textContent = total > 0 ? `${Math.round((needsImprovement/total)*100)}% of cohort` : '0%';

        document.getElementById('statNotYetCompetentCount').textContent = notYetCompetent;
        document.getElementById('statNotYetCompetentPct').textContent = total > 0 ? `${Math.round((notYetCompetent/total)*100)}% of cohort` : '0%';
    }

    // Update Cohort Competency Bar Chart
    function updateBarChart(students) {
        const assessed = students.filter(s => s.totalAnswers > 0);
        const compKeys = ['Linguistic Proficiency', 'Comprehension Ability', 'Critical Thinking', 'Information Literacy', 'Active Listening'];
        const compAverages = compKeys.map(k => {
            if (assessed.length === 0) return 0;
            const sum = assessed.reduce((acc, s) => acc + (s.competencies[k] || 0), 0);
            return Math.round(sum / assessed.length);
        });

        const ctx = document.getElementById('classCompetencyBarChart');
        if (!ctx) return;

        if (barChartInstance) barChartInstance.destroy();

        barChartInstance = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Linguistic Prof.', 'Comprehension', 'Critical Thinking', 'Info Literacy', 'Active Listening'],
                datasets: [{
                    label: 'Cohort Average Mastery (%)',
                    data: compAverages,
                    backgroundColor: [
                        'rgba(165, 148, 249, 0.85)',
                        'rgba(59, 130, 246, 0.85)',
                        'rgba(16, 185, 129, 0.85)',
                        'rgba(245, 158, 11, 0.85)',
                        'rgba(239, 68, 68, 0.85)'
                    ],
                    borderRadius: 6,
                    barThickness: 28
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(c) { return ` Average Score: ${c.parsed.y}%`; }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { stepSize: 20, callback: v => v + '%' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Helper: Mini progress bar element generator
    function renderMiniBar(score) {
        let barColor = 'bg-success';
        if (score < 50) barColor = 'bg-danger';
        else if (score < 60) barColor = 'bg-warning';
        else if (score < 75) barColor = 'bg-primary';

        return `
            <div class="d-flex align-items-center gap-2">
                <div class="progress flex-grow-1" style="height: 6px; background-color: #f1f5f9;">
                    <div class="progress-bar ${barColor} rounded-pill" role="progressbar" style="width: ${score}%;"></div>
                </div>
                <span class="small fw-bold text-dark" style="font-size: 0.78rem; min-width: 32px;">${score}%</span>
            </div>
        `;
    }

    // Filter and Render Table
    function renderTable() {
        const secFilter = sectionSelect ? sectionSelect.value : 'ALL';
        const stFilter = statusFilter ? statusFilter.value : 'ALL';
        const search = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const filtered = allStudents.filter(s => {
            const matchSec = (secFilter === 'ALL') || (s.section === secFilter);
            const matchStatus = (stFilter === 'ALL') || (s.status === stFilter);
            const matchSearch = (!search) || s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search);
            return matchSec && matchStatus && matchSearch;
        });

        if (countBadge) {
            countBadge.textContent = `Showing ${filtered.length} of ${allStudents.length} learners`;
        }

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-folder-open fa-2x mb-2 text-secondary opacity-50"></i><br>
                        No students match the selected filter criteria.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        filtered.forEach(s => {
            const comps = s.competencies;
            const thresholdBadge = (s.totalAnswers === 0)
                ? `<span class="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-0.5 rounded-pill" style="font-size: 0.7rem;">Pending</span>`
                : (s.thresholdPassed
                    ? `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5 rounded-pill fw-bold" style="font-size: 0.7rem;"><i class="fa-solid fa-check-circle me-1"></i>Cleared ≥60%</span>`
                    : `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-0.5 rounded-pill fw-bold" style="font-size: 0.7rem;"><i class="fa-solid fa-triangle-exclamation me-1"></i>Deficit (${s.thresholdData.mplMargin}%)</span>`);

            html += `
                <tr>
                    <td class="px-3 py-3">
                        <div class="fw-bold text-dark" style="font-size: 0.92rem;">${s.name}</div>
                        <span class="badge bg-light text-muted border px-2 py-0.5 rounded-pill" style="font-size: 0.7rem;">
                            <i class="fa-solid fa-graduation-cap text-primary me-1"></i> Section ${s.section}
                        </span>
                    </td>
                    <td class="px-3 py-3">${renderMiniBar(comps['Linguistic Proficiency'])}</td>
                    <td class="px-3 py-3">${renderMiniBar(comps['Comprehension Ability'])}</td>
                    <td class="px-3 py-3">${renderMiniBar(comps['Critical Thinking'])}</td>
                    <td class="px-3 py-3">${renderMiniBar(comps['Information Literacy'])}</td>
                    <td class="px-3 py-3 text-center">
                        <span class="fw-bold text-dark fs-6">${s.accuracy}%</span>
                    </td>
                    <td class="px-3 py-3 text-center">
                        <span class="fw-bold fs-6" style="color: #4f46e5;">${s.weightedScore}%</span><br>
                        <small class="text-muted" style="font-size: 0.68rem;">${s.wpsDelta >= 0 ? '+' : ''}${s.wpsDelta}% vs raw</small>
                    </td>
                    <td class="px-3 py-3 text-center">
                        ${thresholdBadge}
                    </td>
                    <td class="px-3 py-3 text-center">
                        <span class="badge ${s.statusBadgeClass} px-2.5 py-1 rounded-pill fw-bold" style="font-size: 0.75rem;">
                            ${s.status}
                        </span>
                    </td>
                    <td class="px-3 py-3 text-end">
                        <button onclick="window.openStudentDetail('${s.uid}')" class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" title="View Full Competency Diagnostic Breakdown">
                            <i class="fa-solid fa-chart-pie me-1"></i> View
                        </button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    }

    // Interactive Student Detail Modal
    window.openStudentDetail = function(uid) {
        const student = allStudents.find(s => s.uid === uid);
        if (!student) return;

        document.getElementById('detailModalName').textContent = student.name;
        document.getElementById('detailModalSection').textContent = `Grade 6 - Section ${student.section}`;

        const statusBadge = document.getElementById('detailModalStatusBadge');
        statusBadge.className = `badge ${student.statusBadgeClass} px-3 py-1.5 rounded-pill fw-bold`;
        statusBadge.textContent = student.status;

        document.getElementById('detailModalScoreBadge').textContent = `${student.accuracy}% Raw Accuracy`;
        
        if (document.getElementById('detailModalWpsBadge')) {
            document.getElementById('detailModalWpsBadge').textContent = `${student.weightedScore}% Weighted (WPS)`;
        }

        if (document.getElementById('detailModalThresholdBadge')) {
            const threshBadge = document.getElementById('detailModalThresholdBadge');
            if (student.totalAnswers === 0) {
                threshBadge.className = 'badge bg-secondary bg-opacity-10 text-secondary border px-3 py-1.5 rounded-pill fw-bold';
                threshBadge.textContent = 'Diagnostic Pending';
            } else if (student.thresholdPassed) {
                threshBadge.className = 'badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1.5 rounded-pill fw-bold';
                threshBadge.innerHTML = '<i class="fa-solid fa-check-circle me-1"></i> Cleared DepEd MPL Gate (≥60%)';
            } else {
                threshBadge.className = 'badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1.5 rounded-pill fw-bold';
                threshBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i> Below MPL Threshold (${student.thresholdData.mplMargin}%)`;
            }
        }

        document.getElementById('detailModalRemarks').textContent = student.remarks;

        document.getElementById('detailTotalAnswers').textContent = student.totalAnswers;
        document.getElementById('detailCorrectAnswers').textContent = student.correctAnswers;
        document.getElementById('detailWrongAnswers').textContent = student.wrongAnswers;

        // Render Cumulative Threshold Milestones
        const milestonesContainer = document.getElementById('detailModalMilestones');
        if (milestonesContainer && student.thresholdData && student.thresholdData.milestones) {
            let mHtml = '';
            student.thresholdData.milestones.forEach(m => {
                const borderClass = m.isCleared ? 'border-success bg-success bg-opacity-10' : 'border-danger bg-danger bg-opacity-10';
                const textClass = m.isCleared ? 'text-success' : 'text-danger';
                const icon = m.isCleared ? '<i class="fa-solid fa-check text-success"></i>' : '<i class="fa-solid fa-xmark text-danger"></i>';
                mHtml += `
                    <div class="col-6 col-sm-3">
                        <div class="p-2 rounded-3 border ${borderClass}">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="fw-bold ${textClass}" style="font-size: 0.7rem;">Stage ${m.stage}</span>
                                <span style="font-size: 0.75rem;">${icon}</span>
                            </div>
                            <div class="fw-bolder fs-6 text-dark">${m.cumulativeScore}%</div>
                            <small class="text-muted d-block" style="font-size: 0.65rem;">Req: ≥${m.threshold}%</small>
                            <span class="badge ${m.isCleared ? 'bg-success' : 'bg-danger'} text-white rounded-pill mt-1" style="font-size: 0.6rem;">
                                ${m.isCleared ? 'Cleared' : 'Deficit'}
                            </span>
                        </div>
                    </div>
                `;
            });
            milestonesContainer.innerHTML = mHtml;
        }

        // Render Bars
        const barsContainer = document.getElementById('detailCompetencyBars');
        let barsHtml = '';
        const compKeys = ['Linguistic Proficiency', 'Comprehension Ability', 'Critical Thinking', 'Information Literacy', 'Active Listening'];
        compKeys.forEach(k => {
            const sc = student.competencies[k] || 0;
            barsHtml += `
                <div class="p-2.5 bg-light rounded-3 border">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-semibold text-dark small">${k}</span>
                        <span class="fw-bold text-dark small">${sc}%</span>
                    </div>
                    <div class="progress" style="height: 7px; background-color: #e2e8f0;">
                        <div class="progress-bar ${sc >= 75 ? 'bg-success' : sc >= 60 ? 'bg-primary' : sc >= 50 ? 'bg-warning' : 'bg-danger'} rounded-pill" style="width: ${sc}%;"></div>
                    </div>
                </div>
            `;
        });
        barsContainer.innerHTML = barsHtml;

        // Render Radar Chart
        const rCtx = document.getElementById('detailModalRadarChart');
        if (rCtx) {
            if (detailRadarInstance) detailRadarInstance.destroy();
            detailRadarInstance = new Chart(rCtx.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Linguistic', 'Comprehension', 'Critical Thinking', 'Info Literacy', 'Listening'],
                    datasets: [{
                        label: student.name,
                        data: compKeys.map(k => student.competencies[k] || 0),
                        backgroundColor: 'rgba(165, 148, 249, 0.25)',
                        borderColor: '#A594F9',
                        pointBackgroundColor: '#A594F9',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            min: 0,
                            max: 100,
                            ticks: { display: false, stepSize: 25 },
                            pointLabels: { font: { size: 10 } }
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }

        const modal = new bootstrap.Modal(document.getElementById('studentDetailModal'));
        modal.show();
    };

    // Filter event listeners
    if (sectionSelect) sectionSelect.addEventListener('change', renderTable);
    if (statusFilter) statusFilter.addEventListener('change', renderTable);
    if (searchInput) searchInput.addEventListener('input', renderTable);
});

