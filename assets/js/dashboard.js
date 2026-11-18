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
            const currentRole = sessionStorage.getItem('userRole') || 'teacher';
            const teacherSection = sessionStorage.getItem('teacherSection');
            const teacherGrade = sessionStorage.getItem('teacherGrade') || 'Grade 6';
            const isTeacherScoped = (currentRole === 'teacher' && teacherSection && teacherSection !== 'All');

            // Update UI Scope Badge
            const scopeBadge = document.getElementById('dashboardScopeBadge');
            const dashboardSubtitle = document.getElementById('dashboardSubtitle');
            if (scopeBadge) {
                if (isTeacherScoped) {
                    scopeBadge.innerHTML = `<i class="fa-solid fa-chalkboard-user me-1"></i> Class: ${teacherGrade} — Section ${teacherSection}`;
                    scopeBadge.className = "badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold border border-primary border-opacity-25";
                    scopeBadge.classList.remove('d-none');
                    if (dashboardSubtitle) dashboardSubtitle.textContent = `Real-time student performance and engagement telemetry for Section ${teacherSection}.`;
                } else {
                    scopeBadge.innerHTML = `<i class="fa-solid fa-shield-halved me-1"></i> School-Wide (All Classes)`;
                    scopeBadge.className = "badge bg-dark bg-opacity-10 text-dark px-3 py-2 rounded-pill fw-bold border border-dark border-opacity-25";
                    scopeBadge.classList.remove('d-none');
                    if (dashboardSubtitle) dashboardSubtitle.textContent = "Monitor student performance and game engagement across all Grade 6 cohorts.";
                }
            }

            let studentCount = 0;
            let totalXp = 0;
            let atRiskCount = 0;
            const xpDistribution = { '< 500': 0, '500 - 2000': 0, '> 2000': 0 };
            let studentList = [];

            // 1. Process all students using the exact Performance Analytics engine
            let globalStats = [];
            let totalQuestionsAnswered = 0;
            let totalCorrectAnswers = 0;

            snapshot.forEach((child) => {
                const student = child.val();
                if (student.role === 'student' || !student.role) {
                    // Class Scoping: Filter out students from other sections if logged in as a Section Teacher
                    if (isTeacherScoped && student.section && student.section.toLowerCase() !== teacherSection.toLowerCase()) {
                        return;
                    }

                    studentCount++;
                    const xp = parseInt(student.xp) || 0;
                    const hp = parseInt(student.hp) || 0;
                    const level = parseInt(student.level) || 1;
                    totalXp += xp;
                    
                    // Consider a student "at risk" if their HP is dangerously low (e.g. <= 20)
                    if(hp <= 20) atRiskCount++;
                    
                    if (level === 1) xpDistribution['< 500']++;
                    else if (level === 2) xpDistribution['500 - 2000']++;
                    else xpDistribution['> 2000']++;
                    
                    const firstName = student.firstName || '';
                    const lastName = student.lastName || '';
                    const name = (firstName + ' ' + lastName).trim() || 'Anonymous Student';
                    studentList.push({ name: name, xp: xp, hp: hp, level: level });

                    // Canonical First-Attempt diagnostic extraction (identical to performance.js)
                    const faStats = extractStudentFirstAttemptStats(student);
                    const sTotal = faStats.totalAnswers;
                    const sCorrect = faStats.totalCorrect;
                    const sWrong = faStats.totalWrong;

                    totalQuestionsAnswered += sTotal;
                    totalCorrectAnswers += sCorrect;

                    const accuracy = sTotal > 0 ? Math.round((sCorrect / sTotal) * 100) : 0;

                    globalStats.push({
                        uid: child.key,
                        name: name,
                        accuracy: accuracy,
                        correctAnswers: sCorrect,
                        totalAnswered: sTotal,
                        rawStudent: student,
                        firstAttemptStats: student.firstAttemptStats,
                        firstAttempts: student.firstAttempts
                    });
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

            // Calculate DepEd 4-Tier Proficiency Distribution (identical to performance.js)
            let tierMastered = 0;
            let tierProficient = 0;
            let tierDeveloping = 0;
            let tierNeedsSupport = 0;

            globalStats.forEach(s => {
                const acc = parseInt(s.accuracy) || 0;
                if (acc >= 75) {
                    tierMastered++;
                } else if (acc >= 60) {
                    tierProficient++;
                } else if (acc >= 50) {
                    tierDeveloping++;
                } else {
                    tierNeedsSupport++;
                }
            });

            const totalCohort = globalStats.length;
            const mPct = totalCohort > 0 ? Math.round((tierMastered / totalCohort) * 100) : 0;
            const pPct = totalCohort > 0 ? Math.round((tierProficient / totalCohort) * 100) : 0;
            const dPct = totalCohort > 0 ? Math.round((tierDeveloping / totalCohort) * 100) : 0;
            const nPct = totalCohort > 0 ? Math.round((tierNeedsSupport / totalCohort) * 100) : 0;

            const elTierM = document.getElementById('dash_tierMasteredCount');
            if (elTierM) {
                elTierM.innerText = tierMastered;
                document.getElementById('dash_tierMasteredPct').innerText = `${mPct}% of cohort`;
                document.getElementById('dash_tierProficientCount').innerText = tierProficient;
                document.getElementById('dash_tierProficientPct').innerText = `${pPct}% of cohort`;
                document.getElementById('dash_tierDevelopingCount').innerText = tierDeveloping;
                document.getElementById('dash_tierDevelopingPct').innerText = `${dPct}% of cohort`;
                document.getElementById('dash_tierNeedsSupportCount').innerText = tierNeedsSupport;
                document.getElementById('dash_tierNeedsSupportPct').innerText = `${nPct}% of cohort`;
            }

            // Calculate Capstone Weighted Scoring & Cumulative Threshold Cohort Metrics (identical to performance.js)
            let totalWeightedSum = 0;
            let cohortThresholdClearedCount = 0;
            let assessedCount = 0;
            let competentCount = 0;
            let atRiskWpsCount = 0;

            globalStats.forEach(s => {
                const wps = calculateWeightedProficiency(s);
                const thresh = calculateCumulativeThresholdProgression(s, wps);
                s.weightedScore = wps.weightedScore;

                if (s.totalAnswered > 0) {
                    totalWeightedSum += wps.weightedScore;
                    assessedCount++;
                    if (thresh.hasPassedMPL) cohortThresholdClearedCount++;
                    if (wps.weightedScore >= 75) competentCount++;
                    if (wps.weightedScore < 60) atRiskWpsCount++;
                }
            });

            const overallAccuracy = totalQuestionsAnswered > 0 ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) : 0;
            const classAvgWps = assessedCount > 0 ? Math.round(totalWeightedSum / assessedCount) : overallAccuracy;
            const wpsDelta = classAvgWps - overallAccuracy;
            const cohortPassingPct = assessedCount > 0 ? Math.round((cohortThresholdClearedCount / assessedCount) * 100) : 0;
            const competentPct = assessedCount > 0 ? Math.round((competentCount / assessedCount) * 100) : 0;
            const atRiskPct = assessedCount > 0 ? Math.round((atRiskWpsCount / assessedCount) * 100) : 0;

            const elAvgWps = document.getElementById('dash_avgWps');
            if (elAvgWps) {
                elAvgWps.innerText = `${classAvgWps}%`;
                document.getElementById('dash_wpsDelta').innerText = `${wpsDelta >= 0 ? '+' : ''}${wpsDelta}% vs Raw (${overallAccuracy}%)`;
                document.getElementById('dash_mplPassRate').innerText = `${cohortPassingPct}%`;
                document.getElementById('dash_mplPassRatio').innerText = `${cohortThresholdClearedCount}/${assessedCount} cleared`;
                document.getElementById('dash_competentCount').innerText = competentCount;
                document.getElementById('dash_competentPct').innerText = `${competentPct}% of assessed`;
                document.getElementById('dash_atRiskWps').innerText = atRiskWpsCount;
                document.getElementById('dash_atRiskWpsPct').innerText = `${atRiskPct}% of assessed`;
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

// Canonical Helper: Extract First-Attempt diagnostic statistics from student record (exact performance.js logic)
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

    // 4. Fallback: gameStats
    if (student.gameStats) {
        return {
            totalAnswers: Number(student.gameStats.totalAnswers) || 0,
            totalCorrect: Number(student.gameStats.totalCorrect) || 0,
            totalWrong: Number(student.gameStats.totalWrong) || 0,
            retryCount: Number(student.gameStats.retryCount) || 0,
            categories: student.gameStats.categories || {}
        };
    }

    return { totalAnswers: 0, totalCorrect: 0, totalWrong: 0, retryCount: 0, categories: {} };
}

// Canonical Helper: Calculate Weighted Proficiency Score (WPS) — identical to performance.js
function calculateWeightedProficiency(studentObj) {
    const weights = [
        { level: 1, name: 'Level 1 (Easy)', domain: 'Remembering & Understanding', weight: 1.0 },
        { level: 2, name: 'Level 2 (Medium)', domain: 'Applying & Analyzing', weight: 1.5 },
        { level: 3, name: 'Level 3 (Hard)', domain: 'Evaluating & Inference', weight: 2.0 },
        { level: 4, name: 'Level 4 (Boss)', domain: 'Creating & Synthesis', weight: 2.5 }
    ];

    const sTotal = (studentObj.totalAnswered !== undefined ? studentObj.totalAnswered : (studentObj.gameStats ? studentObj.gameStats.totalAnswers : 0)) || 0;
    const sCorrect = (studentObj.correctAnswers !== undefined ? studentObj.correctAnswers : (studentObj.gameStats ? studentObj.gameStats.totalCorrect : 0)) || 0;
    const rawAccuracy = sTotal > 0 ? Math.round((sCorrect / sTotal) * 100) : 0;

    if (sTotal === 0) {
        return {
            rawAccuracy: 0,
            weightedScore: 0,
            adjustmentDelta: 0,
            hasData: false,
            breakdown: weights.map(w => ({ ...w, correct: 0, total: 0, accuracy: 0, contribution: 0 }))
        };
    }

    let levelStats = {
        1: { correct: 0, total: 0 },
        2: { correct: 0, total: 0 },
        3: { correct: 0, total: 0 },
        4: { correct: 0, total: 0 }
    };

    const scanObj = studentObj.firstAttempts || (studentObj.rawStudent && studentObj.rawStudent.firstAttempts);
    let hasDirectLevels = false;
    if (scanObj && typeof scanObj === 'object') {
        Object.values(scanObj).forEach(att => {
            if (!att) return;
            const lvl = parseInt(att.level || att.questLevel || att.levelId || 0);
            if (lvl >= 1 && lvl <= 4) {
                hasDirectLevels = true;
                const tot = att.totalQuestions || ((att.totalCorrect || 0) + (att.totalWrong || 0)) || 1;
                const cor = att.totalCorrect || att.correct || 0;
                levelStats[lvl].correct += cor;
                levelStats[lvl].total += tot;
            }
        });
    }

    if (!hasDirectLevels) {
        const l1Acc = Math.min(100, Math.round(rawAccuracy * 1.10));
        const l2Acc = Math.round(rawAccuracy * 1.00);
        const l3Acc = Math.max(0, Math.round(rawAccuracy * 0.90));
        const l4Acc = Math.max(0, Math.round(rawAccuracy * 0.76));

        const qPerLvl = Math.max(1, Math.round(sTotal / 4));
        levelStats[1] = { correct: Math.min(qPerLvl, Math.round(qPerLvl * (l1Acc / 100))), total: qPerLvl };
        levelStats[2] = { correct: Math.min(qPerLvl, Math.round(qPerLvl * (l2Acc / 100))), total: qPerLvl };
        levelStats[3] = { correct: Math.min(qPerLvl, Math.round(qPerLvl * (l3Acc / 100))), total: qPerLvl };
        levelStats[4] = { correct: Math.min(qPerLvl, Math.round(qPerLvl * (l4Acc / 100))), total: qPerLvl };
    }

    let totalWeightedProduct = 0;
    let totalWeightSum = 0;

    const breakdown = weights.map(w => {
        const st = levelStats[w.level] || { correct: 0, total: 0 };
        const acc = st.total > 0 ? Math.round((st.correct / st.total) * 100) : rawAccuracy;
        const weightedPoints = (acc * w.weight);
        totalWeightedProduct += weightedPoints;
        totalWeightSum += w.weight;
        return {
            level: w.level,
            name: w.name,
            domain: w.domain,
            weight: w.weight,
            correct: st.correct,
            total: st.total,
            accuracy: acc,
            weightedPoints: Math.round(weightedPoints * 10) / 10
        };
    });

    const weightedScore = totalWeightSum > 0 ? Math.round(totalWeightedProduct / totalWeightSum) : rawAccuracy;
    const delta = weightedScore - rawAccuracy;

    return {
        rawAccuracy: rawAccuracy,
        weightedScore: weightedScore,
        adjustmentDelta: delta,
        hasData: true,
        breakdown: breakdown
    };
}

// Canonical Helper: Cumulative Threshold Progression calculation — identical to performance.js
function calculateCumulativeThresholdProgression(studentObj, wpsData) {
    const wps = wpsData || calculateWeightedProficiency(studentObj);
    const sTotal = (studentObj.totalAnswered !== undefined ? studentObj.totalAnswered : (studentObj.gameStats ? studentObj.gameStats.totalAnswers : 0)) || 0;

    const stages = [
        { stage: 1, label: 'Stage 1 (L1 Baseline)', threshold: 50, desc: 'Foundational Knowledge Gate' },
        { stage: 2, label: 'Stage 2 (L1+L2 Cumulative)', threshold: 55, desc: 'Functional Application Gate' },
        { stage: 3, label: 'Stage 3 (L1-L3 Cumulative)', threshold: 60, desc: 'DepEd MPL Passing Benchmark' },
        { stage: 4, label: 'Stage 4 (Comprehensive L1-L4)', threshold: 75, desc: 'Advanced Mastery Benchmark' }
    ];

    if (sTotal === 0 || !wps.hasData) {
        return {
            hasData: false,
            finalScore: 0,
            hasPassedMPL: false,
            statusLabel: 'Not Started',
            statusBadgeClass: 'bg-secondary',
            stages: stages.map(s => ({ ...s, cumulativeScore: 0, passed: false, margin: -s.threshold }))
        };
    }

    let runningCorrect = 0;
    let runningTotal = 0;
    const stageResults = [];

    wps.breakdown.forEach((b, idx) => {
        runningCorrect += b.correct;
        runningTotal += b.total;
        const cumScore = runningTotal > 0 ? Math.round((runningCorrect / runningTotal) * 100) : b.accuracy;
        const stDef = stages[idx] || { stage: idx + 1, label: `Stage ${idx+1}`, threshold: 60 };
        const margin = cumScore - stDef.threshold;
        stageResults.push({
            stage: stDef.stage,
            label: stDef.label,
            desc: stDef.desc,
            threshold: stDef.threshold,
            cumulativeScore: cumScore,
            passed: cumScore >= stDef.threshold,
            margin: margin
        });
    });

    const finalScore = wps.weightedScore;
    const hasPassedMPL = finalScore >= 60;

    return {
        hasData: true,
        finalScore: finalScore,
        rawAccuracy: wps.rawAccuracy,
        hasPassedMPL: hasPassedMPL,
        mplMargin: finalScore - 60,
        stages: stageResults
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
