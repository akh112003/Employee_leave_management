const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'mock_db.json');

function readDb() {
    if (!fs.existsSync(DB_FILE)) {
        const initial = { users: [], leaveRequests: [] };
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
        return initial;
    }
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch {
        return { users: [], leaveRequests: [] };
    }
}

function writeDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const roles = [
    { role_id: 1, role_name: 'Admin' },
    { role_id: 2, role_name: 'Manager' },
    { role_id: 3, role_name: 'Employee' }
];

const db = {
    query: async (sql, params = []) => {
        const sqlLower = sql.toLowerCase().replace(/\s+/g, ' ');
        const data = readDb();

        console.log('[DB] Query:', sql.substring(0, 60), '| Params:', params);

        // SELECT role by name
        if (sqlLower.includes('from roles') && sqlLower.includes('where role_name')) {
            const roleName = params[0];
            const role = roles.find(r => r.role_name.toLowerCase() === roleName.toLowerCase());
            console.log('[DB] Role lookup:', roleName, '->', role);
            return [role ? [role] : []];
        }

        // SELECT user with role JOIN (login/profile) - matches "from users u join roles r"
        if (sqlLower.includes('from users u') && sqlLower.includes('join roles r')) {
            const identifier = params[0];
            console.log('[DB] User+Role lookup for:', identifier);
            console.log('[DB] Available users:', data.users.map(u => u.email));
            const user = data.users.find(u => u.email === identifier || u.user_id == identifier);
            if (user) {
                const role = roles.find(r => r.role_id === user.role_id);
                console.log('[DB] Found user:', user.email, 'with role:', role?.role_name);
                return [[{ ...user, role_name: role.role_name }]];
            }
            console.log('[DB] User not found');
            return [[]];
        }

        // SELECT user by email (registration check) - matches "from users where email"
        if (sqlLower.includes('from users') && sqlLower.includes('where') && !sqlLower.includes('join')) {
            const email = params[0];
            const user = data.users.find(u => u.email === email);
            console.log('[DB] User check for:', email, '->', user ? 'exists' : 'not found');
            return [user ? [user] : []];
        }

        // INSERT user
        if (sqlLower.includes('insert into users')) {
            const newUser = {
                user_id: data.users.length + 1,
                first_name: params[0],
                last_name: params[1],
                email: params[2],
                password_hash: params[3],
                role_id: params[4]
            };
            data.users.push(newUser);
            writeDb(data);
            console.log('[DB] Created user:', newUser.email, 'ID:', newUser.user_id);
            return [{ insertId: newUser.user_id }];
        }

        // INSERT leave request
        if (sqlLower.includes('insert into leave_requests')) {
            const newReq = {
                request_id: data.leaveRequests.length + 1,
                user_id: params[0],
                type_id: params[1],
                start_date: params[2],
                end_date: params[3],
                total_days: params[4],
                reason: params[5],
                status: params[6],
                created_at: new Date().toISOString()
            };
            data.leaveRequests.push(newReq);
            writeDb(data);
            return [{ insertId: newReq.request_id }];
        }

        // SELECT leave requests
        if (sqlLower.includes('from leave_requests')) {
            if (sqlLower.includes('join users')) {
                const rows = data.leaveRequests.map(r => {
                    const user = data.users.find(u => u.user_id === r.user_id);
                    return { ...r, type_name: 'Leave', first_name: user?.first_name || '', last_name: user?.last_name || '', email: user?.email || '' };
                });
                return [rows];
            } else if (sqlLower.includes('where request_id')) {
                const req = data.leaveRequests.find(r => r.request_id == params[0]);
                return [req ? [req] : []];
            } else {
                const userId = params[0];
                const rows = data.leaveRequests.filter(r => r.user_id == userId).map(r => ({ ...r, type_name: 'Leave' }));
                return [rows];
            }
        }

        // UPDATE leave request
        if (sqlLower.includes('update leave_requests')) {
            const [status, managerId, comments, id] = params;
            const req = data.leaveRequests.find(r => r.request_id == id);
            if (req) {
                req.status = status;
                req.manager_id = managerId;
                req.comments = comments;
                writeDb(data);
            }
            return [{ affectedRows: req ? 1 : 0 }];
        }

        console.log('[DB] Unhandled query');
        return [[]];
    }
};

module.exports = db;
