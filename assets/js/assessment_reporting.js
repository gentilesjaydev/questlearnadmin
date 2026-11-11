document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById('assessmentReportTableBody');
    const sectionSelect = document.getElementById('reportSectionSelect');
    const tierSelect = document.getElementById('reportTierSelect');
    const domainSelect = document.getElementById('reportDomainSelect');
    const searchInput = document.getElementById('reportSearchInput');
    const countBadge = document.getElementById('reportRecordCountBadge');

    let allReportRecords = [];

    // Authenticate with Firebase
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                initAssessmentReporting();
            } else {
                window.location.href = '../auth/login';
            }
        });
    } else {
        initAssessmentReporting();
    }

    function initAssessmentReporting() {
        const database = (typeof db !== 'undefined') ? db : (firebase && firebase.database ? firebase.database() : null);
        if (!database) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Firebase Database not initialized</td></tr>';
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
            allReportRecords = [];
            const data = snapshot.val() || {};

            let totalAssessed = 0;
            let passingCount = 0;
            let totalAccuracySum = 0;
            let totalEvaluatedQuestions = 0;

            Object.keys(data).forEach(uid => {
                const u = data[uid];
                if (!u || (u.role && u.role !== 'student')) return;

                const firstName = u.firstName || '';
                const lastName = u.lastName || '';
                const name = (firstName + ' ' + lastName).trim() || u.username || u.name || 'Anonymous Student';
                const section = u.section || u.classSection || 'Unassigned';
                const email = u.email || '';

                // Extract assessment stats
                const faStats = extractFirstAttemptStats(u);
                const sTotal = faStats.totalAnswers;
                const sCorrect = faStats.totalCorrect;
                const accuracy = sTotal > 0 ? Math.round((sCorrect / sTotal) * 100) : 0;

                if (sTotal > 0) {
                    totalAssessed++;
                    totalAccuracySum += accuracy;
                    totalEvaluatedQuestions += sTotal;
                    if (accuracy >= 60) passingCount++;
                }

                const resultTier = getResultTier(sTotal, accuracy);

                // Main Comprehensive Diagnostic Record
                allReportRecords.push({
                    uid: uid,
                    studentName: name,
                    section: section,
                    email: email,
                    assessmentTarget: 'NATG6 Comprehensive Diagnostic',
                    domain: 'all',
                    domainLabel: 'All Domains (General English)',
                    correct: sCorrect,
                    total: sTotal,
                    accuracy: accuracy,
                    resultTier: resultTier.label,
                    badgeClass: resultTier.badgeClass,
                    remarks: generateAssessmentRemarks(accuracy, sTotal)
                });

                // Domain-Specific Records if student has category answers
                const cats = faStats.categories || {};
                const catLabels = {
                    'grammar': 'Grammar & Structure',
                    'vocabulary': 'Vocabulary & Meaning',
                    'reading': 'Reading Comprehension',
                    'information_literacy': 'Information Literacy'
                };

                Object.keys(catLabels).forEach(catKey => {
                    if (cats[catKey] && cats[catKey].total > 0) {
                        const cTotal = cats[catKey].total;
                        const cCorrect = cats[catKey].correct;
                        const cAcc = Math.round((cCorrect / cTotal) * 100);
                        const cTier = getResultTier(cTotal, cAcc);

                        allReportRecords.push({
                            uid: uid,
                            studentName: name,
                            section: section,
                            email: email,
                            assessmentTarget: `${catLabels[catKey]} Assessment`,
                            domain: catKey,
                            domainLabel: catLabels[catKey],
                            correct: cCorrect,
                            total: cTotal,
                            accuracy: cAcc,
                            resultTier: cTier.label,
                            badgeClass: cTier.badgeClass,
                            remarks: generateAssessmentRemarks(cAcc, cTotal, catLabels[catKey])
                        });
                    }
                });
            });

            // Update KPI Stats Cards
            document.getElementById('kpiTotalStudents').textContent = totalAssessed.toLocaleString();
            const passingRate = totalAssessed > 0 ? Math.round((passingCount / totalAssessed) * 100) : 0;
            document.getElementById('kpiPassingRate').textContent = `${passingRate}%`;
            const meanScore = totalAssessed > 0 ? Math.round(totalAccuracySum / totalAssessed) : 0;
            document.getElementById('kpiMeanScore').textContent = `${meanScore}%`;
            document.getElementById('kpiTotalQuestions').textContent = totalEvaluatedQuestions.toLocaleString();

            renderReportTable();
        });
    }

    // Extract First-Attempt diagnostic statistics
    function extractFirstAttemptStats(student) {
        if (!student) return { totalAnswers: 0, totalCorrect: 0, totalWrong: 0, categories: {} };

        if (student.firstAttemptStats && (student.firstAttemptStats.totalAnswers > 0 || student.firstAttemptStats.totalCorrect > 0)) {
            return {
                totalAnswers: Number(student.firstAttemptStats.totalAnswers) || 0,
                totalCorrect: Number(student.firstAttemptStats.totalCorrect) || 0,
                totalWrong: Number(student.firstAttemptStats.totalWrong) || 0,
                categories: student.firstAttemptStats.categories || {}
            };
        }

        if (student.firstAttempts && typeof student.firstAttempts === 'object') {
            let total = 0, correct = 0, wrong = 0;
            const categories = {};
            Object.values(student.firstAttempts).forEach(att => {
                if (att && typeof att === 'object') {
                    const c = Number(att.correctAnswers || att.score || att.correct || 0);
                    const t = Number(att.totalQuestions || att.total || att.questionsAnswered || 0);
                    total += t;
                    correct += c;
                    wrong += Math.max(0, t - c);

                    const cat = (att.category || 'grammar').toLowerCase();
                    if (!categories[cat]) categories[cat] = { total: 0, correct: 0 };
                    categories[cat].total += t;
                    categories[cat].correct += c;
                }
            });
            if (total > 0) return { totalAnswers: total, totalCorrect: correct, totalWrong: wrong, categories: categories };
        }

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

    // DepEd 4-Tier Proficiency Level Classification
    function getResultTier(total, accuracy) {
        if (!total || total === 0) {
            return { label: 'Not Started', badgeClass: 'bg-secondary bg-opacity-10 text-secondary border' };
        }
        if (accuracy >= 75) {
            return { label: 'Mastered', badgeClass: 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' };
        }
        if (accuracy >= 60) {
            return { label: 'Proficient', badgeClass: 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25' };
        }
        if (accuracy >= 50) {
            return { label: 'Developing', badgeClass: 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25' };
        }
        return { label: 'Needs Support', badgeClass: 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25' };
    }

    // DepEd NATG6 Diagnostic Remarks construct
    function generateAssessmentRemarks(accuracy, total, domainTitle) {
        if (total === 0) return 'No diagnostic test recorded yet.';
        const target = domainTitle ? `in ${domainTitle}` : 'overall';
        if (accuracy >= 75) return `Mastery achieved ${target} (MPL standard met). Ready for advanced evaluation.`;
        if (accuracy >= 60) return `Proficient ${target} (MPL passing benchmark achieved). Periodic review advised.`;
        if (accuracy >= 50) return `Developing proficiency ${target}. Targeted remediation and scaffolding required.`;
        return `Below passing benchmark ${target}. Immediate guided pedagogical intervention needed.`;
    }

    // Filter and Render Report Table
    function renderReportTable() {
        const secFilter = sectionSelect ? sectionSelect.value : 'ALL';
        const tierFilter = tierSelect ? tierSelect.value : 'ALL';
        const domFilter = domainSelect ? domainSelect.value : 'ALL';
        const search = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const filtered = allReportRecords.filter(r => {
            const matchSec = (secFilter === 'ALL') || (r.section === secFilter);
            const matchTier = (tierFilter === 'ALL') || (r.resultTier === tierFilter);
            const matchDom = (domFilter === 'ALL') || (r.domain === domFilter) || (domFilter === 'ALL' && r.domain === 'all');
            const matchSearch = (!search) || r.studentName.toLowerCase().includes(search) || r.email.toLowerCase().includes(search);
            return matchSec && matchTier && matchDom && matchSearch;
        });

        if (countBadge) {
            countBadge.textContent = `${filtered.length} Assessment Records`;
        }

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-file-circle-exclamation fa-2x mb-2 text-secondary opacity-50"></i><br>
                        No assessment records match the current filter selection.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        filtered.forEach(r => {
            html += `
                <tr>
                    <td class="px-3 py-3">
                        <div class="fw-bold text-dark" style="font-size: 0.92rem;">${r.studentName}</div>
                        <small class="text-muted">${r.email || 'Student Account'}</small>
                    </td>
                    <td class="px-3 py-3">
                        <span class="badge bg-light text-dark border px-2.5 py-1 rounded-pill small">
                            <i class="fa-solid fa-graduation-cap text-primary me-1"></i> Section ${r.section}
                        </span>
                    </td>
                    <td class="px-3 py-3">
                        <div class="fw-semibold text-dark small">${r.assessmentTarget}</div>
                        <small class="text-muted" style="font-size: 0.72rem;">${r.domainLabel}</small>
                    </td>
                    <td class="px-3 py-3 text-center">
                        <span class="fw-bold text-dark">${r.correct}</span> <span class="text-muted small">/ ${r.total}</span>
                    </td>
                    <td class="px-3 py-3 text-center">
                        <span class="fw-bolder ${r.accuracy >= 60 ? 'text-primary' : 'text-danger'} fs-6">${r.accuracy}%</span>
                    </td>
                    <td class="px-3 py-3 text-center">
                        <span class="badge ${r.badgeClass} px-2.5 py-1 rounded-pill fw-bold" style="font-size: 0.75rem;">
                            ${r.resultTier}
                        </span>
                    </td>
                    <td class="px-3 py-3 small text-muted" style="line-height: 1.4;">
                        ${r.remarks}
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    }

    // Print Handler
    window.printAssessmentReport = function() {
        window.print();
    };

    // CSV Export Handler
    window.exportAssessmentCsv = function() {
        if (!allReportRecords || allReportRecords.length === 0) {
            Swal.fire('No Data', 'No assessment records available to export.', 'info');
            return;
        }

        const secFilter = sectionSelect ? sectionSelect.value : 'ALL';
        const tierFilter = tierSelect ? tierSelect.value : 'ALL';
        const domFilter = domainSelect ? domainSelect.value : 'ALL';
        const search = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const exportData = allReportRecords.filter(r => {
            const matchSec = (secFilter === 'ALL') || (r.section === secFilter);
            const matchTier = (tierFilter === 'ALL') || (r.resultTier === tierFilter);
            const matchDom = (domFilter === 'ALL') || (r.domain === domFilter) || (domFilter === 'ALL' && r.domain === 'all');
            const matchSearch = (!search) || r.studentName.toLowerCase().includes(search) || r.email.toLowerCase().includes(search);
            return matchSec && matchTier && matchDom && matchSearch;
        });

        const headers = ["Student Name", "Section", "Email", "Assessment Target", "Domain", "Items Correct", "Total Items", "Accuracy (%)", "Diagnostic Result", "Pedagogical Remarks"];
        const rows = exportData.map(r => [
            `"${r.studentName.replace(/"/g, '""')}"`,
            `"${r.section}"`,
            `"${r.email}"`,
            `"${r.assessmentTarget}"`,
            `"${r.domainLabel}"`,
            r.correct,
            r.total,
            r.accuracy,
            `"${r.resultTier}"`,
            `"${r.remarks.replace(/"/g, '""')}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `QuestLearn_Assessment_Report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (typeof Toast !== 'undefined') {
            Toast.fire({ icon: 'success', title: 'Assessment CSV exported successfully!' });
        }
    };

    // Filter event listeners
    if (sectionSelect) sectionSelect.addEventListener('change', renderReportTable);
    if (tierSelect) tierSelect.addEventListener('change', renderReportTable);
    if (domainSelect) domainSelect.addEventListener('change', renderReportTable);
    if (searchInput) searchInput.addEventListener('input', renderReportTable);
});
