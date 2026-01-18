# Employee Leave Management System

A modern, full-stack employee leave management application with JWT authentication and role-based access control.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express](https://img.shields.io/badge/Express-v5-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **🔐 JWT Authentication** - Secure login with token-based auth
- **👥 Role-Based Access** - Employee, Manager, and Admin roles
- **📝 Leave Applications** - Employees can apply for different leave types
- **✅ Approval Workflow** - Managers/Admins can approve or reject requests
- **📊 Dashboard** - Role-specific views for employees and admins
- **🎨 Modern UI** - Premium black & gold themed interface

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Employee_leave_management.git
   cd Employee_leave_management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your settings (defaults work for testing)

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open browser**
   ```
   http://localhost:5000
   ```

## 👤 Default Test Accounts

After starting the app, register new accounts through the UI:

| Role | How to Create |
|------|---------------|
| Employee | Register with role "Employee" |
| Admin | Register with role "Admin" |

## 📁 Project Structure

```
├── config/
│   └── db.js              # Database configuration
├── controllers/
│   ├── authController.js  # Authentication logic
│   └── leaveController.js # Leave management logic
├── middleware/
│   ├── auth.js            # JWT verification
│   ├── roleAuth.js        # Role-based access control
│   └── errorHandler.js    # Global error handling
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   ├── leaveRoutes.js     # Leave endpoints
│   ├── adminRoutes.js     # Admin endpoints
│   └── managerRoutes.js   # Manager endpoints
├── public/
│   ├── index.html         # Main UI
│   ├── styles.css         # Styling
│   └── app.js             # Frontend logic
├── server.js              # Express server
├── schema.sql             # MySQL database schema
└── package.json
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |

### Leave Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/leaves/apply` | Apply for leave | Employee |
| GET | `/api/leaves/my-history` | View own leaves | Employee |
| GET | `/api/leaves/all` | View all leaves | Admin/Manager |
| PATCH | `/api/leaves/:id/status` | Approve/Reject | Admin/Manager |

## 🗄️ Database

The app includes a **mock database** for testing without MySQL setup.

For production with MySQL:
1. Create a database
2. Run `schema.sql` to create tables
3. Update `.env` with your MySQL credentials
4. Replace `config/db.js` with the MySQL version

## 🎨 UI Features

### Employee View
- Overview dashboard
- Apply for leave
- View leave history

### Admin View  
- Pending approvals (with employee reason)
- Approval history
- Logout

## 🛠️ Technologies

- **Backend**: Node.js, Express.js
- **Authentication**: JWT, bcryptjs
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **HTTP Client**: Axios

## 📄 License

MIT License - feel free to use this project for learning or production!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Made with ❤️ for efficient leave management
