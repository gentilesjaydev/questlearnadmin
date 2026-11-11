document.addEventListener("DOMContentLoaded", function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    
    // Create overlay element for mobile
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    if(sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('toggled');
            
            // If on mobile screen, toggle the overlay too
            if(window.innerWidth <= 768) {
                overlay.classList.toggle('active');
            }
        });
    }

    // Close sidebar when clicking overlay on mobile
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('toggled');
        overlay.classList.remove('active');
    });
    
    // Global SweetAlert2 Configuration
    if (typeof Swal !== 'undefined') {
        // A Toast mixin for quick non-intrusive notifications
        window.Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#ffffff',
            color: '#1e293b',
            iconColor: '#4f46e5',
            customClass: {
                popup: 'rounded-4 shadow-sm border border-light'
            },
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
    }
    
    // Global Logout Handler
    window.handleLogout = function(e) {
        if(e) e.preventDefault();
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Sign Out?',
                text: 'Are you sure you want to securely end your session?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2563eb',
                cancelButtonColor: '#94a3b8',
                confirmButtonText: 'Proceed',
                cancelButtonText: 'Cancel',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    const isInPages = window.location.pathname.includes('/pages/');
                    const loginPath = isInPages ? '../../pages/auth/login' : 'pages/auth/login';
                    
                    // Call firebase signOut if available
                    if(typeof auth !== 'undefined' && auth.signOut) {
                        auth.signOut().then(() => {
                            window.location.href = loginPath;
                        }).catch(err => {
                            window.location.href = loginPath;
                        });
                    } else {
                        window.location.href = loginPath;
                    }
                }
            });
        }
    };

    // ── Notification Bell (Live Student Activity & Game Events) ───────────────
    (function initNotifications() {
        const notifList    = document.getElementById('notifList');
        const notifDot     = document.getElementById('notifDot');
        const notifEmpty   = document.getElementById('notifEmpty');
        const markAllBtn   = document.getElementById('markAllReadBtn');

        if (!notifList) return;

        const STORAGE_KEY = 'ql_read_notifs';

        function getReadSet() {
            try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
            catch { return new Set(); }
        }
        function saveReadSet(set) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
        }

        function timeAgo(ts) {
            if (!ts) return 'Just now';
            const diff = Math.floor((Date.now() - ts) / 1000);
            if (diff < 60)   return 'Just now';
            if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
            if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
            return `${Math.floor(diff/86400)}d ago`;
        }

        function iconFor(type) {
            const icons = {
                battle_alert: 'fa-heart-crack text-danger',
                level_up:     'fa-trophy text-warning',
                playing:      'fa-gamepad text-primary',
                quiz:         'fa-circle-check text-success',
                new_student:  'fa-user-plus text-info',
                default:      'fa-bell text-secondary'
            };
            return icons[type] || icons.default;
        }

        function renderNotifs(items) {
            const readSet = getReadSet();
            const unread  = items.filter(n => !readSet.has(n.id));

            if (notifDot) {
                if (unread.length > 0) {
                    notifDot.textContent = unread.length > 99 ? '99+' : unread.length;
                    notifDot.classList.remove('d-none');
                } else {
                    notifDot.classList.add('d-none');
                }
            }

            if (!items || items.length === 0) {
                if (notifEmpty) notifEmpty.style.display = '';
                notifList.innerHTML = '';
                if (notifEmpty) notifList.appendChild(notifEmpty);
                return;
            }
            if (notifEmpty) notifEmpty.style.display = 'none';

            const html = items.map(n => {
                const isRead = readSet.has(n.id);
                return `
                <li class="notif-item d-flex gap-3 px-3 py-2.5 border-bottom ${isRead ? 'opacity-75' : 'bg-primary bg-opacity-5'}"
                    style="cursor:pointer; transition: background 0.15s;" data-id="${n.id}">
                    <div class="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm border"
                         style="width:36px;height:36px;min-width:36px;">
                        <i class="fa-solid ${iconFor(n.type)} small"></i>
                    </div>
                    <div class="flex-grow-1 py-0.5" style="min-width:0;">
                        <div class="d-flex justify-content-between align-items-baseline gap-1">
                            <span class="fw-bold text-dark text-truncate" style="font-size:0.83rem;">${n.title || 'Notification'}</span>
                            <span class="text-muted flex-shrink-0" style="font-size:0.7rem;">${timeAgo(n.timestamp)}</span>
                        </div>
                        <div class="text-muted text-break" style="font-size:0.76rem; line-height: 1.35;">${n.message || ''}</div>
                    </div>
                    ${!isRead ? '<div class="flex-shrink-0 d-flex align-items-center"><span class="rounded-circle bg-primary" style="width:8px;height:8px;display:inline-block;"></span></div>' : ''}
                </li>`;
            }).join('');

            notifList.innerHTML = html;

            notifList.querySelectorAll('.notif-item').forEach(el => {
                el.addEventListener('click', () => {
                    const id = el.dataset.id;
                    const rs = getReadSet();
                    rs.add(id);
                    saveReadSet(rs);
                    renderNotifs(window._cachedNotifs || []);
                });
            });
        }

        // READ-ONLY real-time listener: strictly calls and reads the data without damaging or writing to DB
        function attachUsersListener() {
            const database = (typeof db !== 'undefined') ? db : (typeof firebase !== 'undefined' && firebase.database ? firebase.database() : null);
            if (!database) return false;

            database.ref('users').on('value', snapshot => {
                const notifs = [];
                const now = Date.now();

                if (snapshot.exists()) {
                    let studentIndex = 0;
                    snapshot.forEach(child => {
                        const u = child.val();
                        if (!u) return;

                        // Check if student
                        if (u.role && u.role !== 'student') return;

                        studentIndex++;
                        const firstName = u.firstName || '';
                        const lastName = u.lastName || '';
                        const studentName = (firstName + ' ' + lastName).trim() || u.username || u.name || `Student ${studentIndex}`;
                        const xp = parseInt(u.xp) || 0;
                        const hp = u.hp !== undefined ? parseInt(u.hp) : 100;
                        const level = parseInt(u.level) || parseInt(u.accountLevel) || 1;

                        // Activity timestamp fallback to spread across recent hours
                        let baseTime = u.lastActive || u.lastPlayed || u.updatedAt || u.createdAt;
                        if (typeof baseTime === 'string') {
                            const p = new Date(baseTime).getTime();
                            if (!isNaN(p)) baseTime = p;
                        }
                        if (!baseTime || typeof baseTime !== 'number') {
                            baseTime = now - (studentIndex * 14 * 60 * 1000); // 14 mins apart
                        }

                        // 1. Critical Health (Battle damage)
                        if (hp <= 30 && hp > 0) {
                            notifs.push({
                                id: 'hp_' + child.key + '_' + hp,
                                type: 'battle_alert',
                                title: 'Critical Health in Battle',
                                message: `${studentName} took heavy damage! Remaining HP: ${hp}/100.`,
                                timestamp: baseTime
                            });
                        } else if (hp === 0) {
                            notifs.push({
                                id: 'faint_' + child.key,
                                type: 'battle_alert',
                                title: 'Fallen in Dungeon',
                                message: `${studentName} was defeated during a quest battle.`,
                                timestamp: baseTime
                            });
                        }

                        // 2. High Level Progress
                        if (level > 1) {
                            notifs.push({
                                id: 'lvl_' + child.key + '_' + level,
                                type: 'level_up',
                                title: `Level ${level} Achieved`,
                                message: `${studentName} reached Level ${level} in learning quests!`,
                                timestamp: baseTime - 3600000
                            });
                        }

                        // 3. Active Gameplay & XP Progress
                        if (xp > 0) {
                            notifs.push({
                                id: 'xp_' + child.key + '_' + xp,
                                type: 'playing',
                                title: 'Live Student Questing',
                                message: `${studentName} is actively playing (${xp.toLocaleString()} XP earned).`,
                                timestamp: baseTime
                            });
                        }

                        // 4. Questions & Quiz Activity
                        if (u.firstAttempts || u.firstAttemptStats) {
                            const stats = u.firstAttemptStats || {};
                            const total = stats.totalAnswers || (u.firstAttempts ? Object.keys(u.firstAttempts).length : 0);
                            const correct = stats.totalCorrect || 0;
                            if (total > 0) {
                                notifs.push({
                                    id: 'quiz_' + child.key + '_' + total,
                                    type: 'quiz',
                                    title: 'Quiz Quest Completed',
                                    message: `${studentName} answered ${total} questions (${correct} correct).`,
                                    timestamp: baseTime - 1200000
                                });
                            }
                        }

                        // 5. Registered Student Joined
                        notifs.push({
                            id: 'joined_' + child.key,
                            type: 'new_student',
                            title: 'Student Joined',
                            message: `${studentName} registered and entered QuestLearn.`,
                            timestamp: u.createdAt && typeof u.createdAt === 'number' ? u.createdAt : (baseTime - 86400000)
                        });
                    });
                }

                // Sort newest first & cap at 25 items
                notifs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                window._cachedNotifs = notifs.slice(0, 25);
                renderNotifs(window._cachedNotifs);
            }, err => {
                console.warn("Notifications read-only listener notice:", err);
            });

            return true;
        }

        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => {
                const rs = getReadSet();
                (window._cachedNotifs || []).forEach(n => rs.add(n.id));
                saveReadSet(rs);
                renderNotifs(window._cachedNotifs || []);
            });
        }

        // Attach listener immediately or retry until Firebase & Auth are initialized
        if (!attachUsersListener()) {
            let attempts = 0;
            const timer = setInterval(() => {
                attempts++;
                if (attachUsersListener() || attempts > 15) {
                    clearInterval(timer);
                }
            }, 300);
        }

        // Also re-trigger when Firebase Auth state changes so secure read permissions succeed
        try {
            const authObj = (typeof auth !== 'undefined') ? auth : (typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null);
            if (authObj && authObj.onAuthStateChanged) {
                authObj.onAuthStateChanged(user => {
                    if (user) {
                        attachUsersListener();
                    }
                });
            }
        } catch(e) {
            console.debug("Auth listener notice:", e);
        }
    })();
});
