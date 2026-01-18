// --- State Management ---
let currentUser = null;
const api = axios.create({
    baseURL: '/api'
});

// Interceptor to add JWT token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
});

// --- DOM References ---
const screens = {
    login: document.getElementById('login-section'),
    register: document.getElementById('register-section'),
    dashboard: document.getElementById('dashboard-section')
};

const views = document.querySelectorAll('.view');
const navLinks = document.querySelectorAll('.nav-links li[data-view]');

// --- Navigation Logic ---
function showScreen(screenId) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenId].classList.add('active');
}

function showView(viewId) {
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    document.getElementById('view-title').innerText =
        document.querySelector(`.nav-links li[data-view="${viewId}"]`).innerText;

    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-links li[data-view="${viewId}"]`).classList.add('active');

    // Trigger data fetch based on view
    if (viewId === 'leave-history') fetchMyHistory();
    if (viewId === 'admin-approvals') fetchAllRequests();
    if (viewId === 'approval-history') fetchApprovalHistory();
}

// --- Auth Handling ---
document.getElementById('show-register').addEventListener('click', () => showScreen('register'));
document.getElementById('show-login').addEventListener('click', () => showScreen('login'));

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        firstName: document.getElementById('reg-fname').value,
        lastName: document.getElementById('reg-lname').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value
    };

    try {
        await api.post('/auth/register', data);
        alert('Registration successful! Please login.');
        showScreen('login');
    } catch (err) {
        document.getElementById('reg-error').innerText = err.response?.data?.message || 'Registration failed';
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);

        await initDashboard();
    } catch (err) {
        errorEl.innerText = err.response?.data?.message || 'Login failed';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});

async function initDashboard() {
    try {
        const res = await api.get('/auth/profile');
        currentUser = res.data.user;

        document.getElementById('user-name').innerText = currentUser.first_name || currentUser.email;
        document.getElementById('user-role').innerText = currentUser.role_name || localStorage.getItem('role');

        const role = localStorage.getItem('role');

        if (role === 'ADMIN' || role === 'MANAGER') {
            // Show admin-only menus
            document.getElementById('nav-approvals').classList.remove('hidden');
            document.getElementById('nav-approval-history').classList.remove('hidden');
            // Hide employee-only menus
            document.getElementById('nav-overview').classList.add('hidden');
            document.getElementById('nav-apply').classList.add('hidden');
            document.getElementById('nav-history').classList.add('hidden');
            // Start on Pending Approvals
            showScreen('dashboard');
            showView('admin-approvals');
        } else {
            // Employee view
            showScreen('dashboard');
            showView('dashboard-home');
        }
    } catch (err) {
        localStorage.clear();
        showScreen('login');
    }
}

// --- Leave Management Logic ---
document.getElementById('leave-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        typeId: document.getElementById('leave-type').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        reason: document.getElementById('leave-reason').value
    };

    try {
        await api.post('/leaves/apply', data);
        alert('Application submitted!');
        e.target.reset();
        showView('leave-history');
    } catch (err) {
        alert(err.response?.data?.message || 'Submission failed');
    }
});

async function fetchMyHistory() {
    try {
        const res = await api.get('/leaves/my-history');
        const body = document.getElementById('history-body');
        body.innerHTML = res.data.leaves.map(l => `
            <tr>
                <td>${l.type_name}</td>
                <td>${formatDate(l.start_date)} - ${formatDate(l.end_date)}</td>
                <td>${l.total_days}</td>
                <td><span class="status-badge status-${l.status.toLowerCase()}">${l.status}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function fetchAllRequests() {
    try {
        const res = await api.get('/leaves/all');
        const body = document.getElementById('approvals-body');
        const pendingLeaves = res.data.allLeaves.filter(l => l.status === 'Pending');
        body.innerHTML = pendingLeaves.map(l => `
            <tr>
                <td>${l.first_name} ${l.last_name}<br><small>${l.email}</small></td>
                <td>${l.type_name}</td>
                <td>${formatDate(l.start_date)} - ${formatDate(l.end_date)}</td>
                <td>${l.reason || '-'}</td>
                <td>
                    <button class="action-btn btn-approve" onclick="updateStatus(${l.request_id}, 'Approved')">Approve</button>
                    <button class="action-btn btn-reject" onclick="updateStatus(${l.request_id}, 'Rejected')">Reject</button>
                </td>
            </tr>
        `).join('');
        if (pendingLeaves.length === 0) {
            body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">No pending requests</td></tr>';
        }
    } catch (err) {
        console.error(err);
    }
}

async function fetchApprovalHistory() {
    try {
        const res = await api.get('/leaves/all');
        const body = document.getElementById('approval-history-body');
        const processedLeaves = res.data.allLeaves.filter(l => l.status !== 'Pending');
        body.innerHTML = processedLeaves.map(l => `
            <tr>
                <td>${l.first_name} ${l.last_name}<br><small>${l.email}</small></td>
                <td>${l.type_name}</td>
                <td>${formatDate(l.start_date)} - ${formatDate(l.end_date)}</td>
                <td>${l.reason || '-'}</td>
                <td><span class="status-badge status-${l.status.toLowerCase()}">${l.status}</span></td>
            </tr>
        `).join('');
        if (processedLeaves.length === 0) {
            body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">No history yet</td></tr>';
        }
    } catch (err) {
        console.error(err);
    }
}

window.updateStatus = async (id, status) => {
    try {
        await api.patch(`/leaves/${id}/status`, { status });
        fetchAllRequests();
    } catch (err) {
        alert('Action failed');
    }
};

// --- Utilities ---
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Global Nav Listeners
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const viewId = link.getAttribute('data-view');
        showView(viewId);
    });
});

// Auto-init
if (localStorage.getItem('token')) {
    initDashboard();
}
