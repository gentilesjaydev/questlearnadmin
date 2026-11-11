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
            // Count the number of active game categories (grammar, vocabulary, etc.)
            const categoryCount = snapshot.numChildren();
            document.getElementById('activeQuestsStat').innerText = categoryCount.toLocaleString();
        } else {
            document.getElementById('activeQuestsStat').innerText = '0';
        }
    }).catch(err => console.error("Error fetching quests:", err));
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
