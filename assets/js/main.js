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

    // ── Notification Bell ──────────────────────────────────────────────────
    (function initNotifications() {
        const notifList    = document.getElementById('notifList');
        const notifDot     = document.getElementById('notifDot');
        const notifEmpty   = document.getElementById('notifEmpty');
        const markAllBtn   = document.getElementById('markAllReadBtn');

        if (!notifList) return; // navbar not on this page

        const STORAGE_KEY = 'ql_read_notifs';

        function getReadSet() {
            try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
            catch { return new Set(); }
        }
        function saveReadSet(set) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
        }

        function timeAgo(ts) {
            if (!ts) return '';
            const diff = Math.floor((Date.now() - ts) / 1000);
            if (diff < 60)   return `${diff}s ago`;
            if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
            if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
            return `${Math.floor(diff/86400)}d ago`;
        }

        function iconFor(type) {
            const icons = {
                new_student: 'fa-user-plus text-success',
                quest:       'fa-gamepad text-primary',
                module:      'fa-file-lines text-warning',
                default:     'fa-bell text-secondary'
            };
            return icons[type] || icons.default;
        }

        function renderNotifs(items) {
            const readSet = getReadSet();
            const unread  = items.filter(n => !readSet.has(n.id));

            // Dot indicator
            if (notifDot) {
                unread.length > 0 ? notifDot.classList.remove('d-none') : notifDot.classList.add('d-none');
            }

            if (items.length === 0) {
                if (notifEmpty) notifEmpty.style.display = '';
                return;
            }
            if (notifEmpty) notifEmpty.style.display = 'none';

            // Render newest-first (already sorted)
            const html = items.map(n => {
                const isRead = readSet.has(n.id);
                return `
                <li class="notif-item d-flex gap-3 px-3 py-2 border-bottom ${isRead ? 'opacity-75' : 'bg-primary bg-opacity-5'}"
                    style="cursor:pointer;" data-id="${n.id}">
                    <div class="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm border"
                         style="width:36px;height:36px;min-width:36px;">
                        <i class="fa-solid ${iconFor(n.type)} small"></i>
                    </div>
                    <div class="flex-grow-1 py-1">
                        <div class="fw-semibold text-dark" style="font-size:0.85rem;">${n.title || 'Notification'}</div>
                        <div class="text-muted" style="font-size:0.78rem;">${n.message || ''}</div>
                        <div class="text-muted mt-1" style="font-size:0.72rem;">${timeAgo(n.timestamp)}</div>
                    </div>
                    ${!isRead ? '<div class="flex-shrink-0 d-flex align-items-center"><span class="rounded-circle bg-primary" style="width:8px;height:8px;display:inline-block;"></span></div>' : ''}
                </li>`;
            }).join('');

            notifList.innerHTML = html;

            // Mark individual as read on click
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

        function loadFromFirebase() {
            if (typeof firebase === 'undefined' || !firebase.database) return;
            const db = firebase.database();

            // Listen for new students in the last 7 days
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            const notifs = [];

            // Students joined recently
            db.ref('students').orderByChild('createdAt').startAt(sevenDaysAgo).once('value', snap => {
                if (snap.exists()) {
                    snap.forEach(child => {
                        const s = child.val();
                        notifs.push({
                            id: 'student_' + child.key,
                            type: 'new_student',
                            title: 'New Student Joined',
                            message: `${s.username || s.email || 'A student'} joined QuestLearn.`,
                            timestamp: s.createdAt || null
                        });
                    });
                }

                // Sort newest first & cap at 20
                notifs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                window._cachedNotifs = notifs.slice(0, 20);
                renderNotifs(window._cachedNotifs);
            });
        }

        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => {
                const rs = getReadSet();
                (window._cachedNotifs || []).forEach(n => rs.add(n.id));
                saveReadSet(rs);
                renderNotifs(window._cachedNotifs || []);
            });
        }

        // Try loading once Firebase is ready (may load after main.js)
        if (typeof firebase !== 'undefined' && firebase.database) {
            loadFromFirebase();
        } else {
            // Wait until firebase is set up by other scripts
            window.addEventListener('firebase-ready', loadFromFirebase);
            setTimeout(loadFromFirebase, 2500);
        }
    })();
});
