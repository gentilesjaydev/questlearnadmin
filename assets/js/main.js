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
});
