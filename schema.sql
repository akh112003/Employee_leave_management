-- Create Database
CREATE DATABASE IF NOT EXISTS leave_mgmt_db;
USE leave_mgmt_db;

-- 1. Roles Table
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- 2. Departments Table
CREATE TABLE departments (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT,
    dept_id INT,
    manager_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
    FOREIGN KEY (manager_id) REFERENCES users(user_id)
);

-- 4. Leave Types Table
CREATE TABLE leave_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    default_annual_allowance INT DEFAULT 0
);

-- 5. User Leave Balances Table
CREATE TABLE leave_balances (
    balance_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type_id INT NOT NULL,
    total_days DECIMAL(5, 2) NOT NULL,
    used_days DECIMAL(5, 2) DEFAULT 0,
    remaining_days DECIMAL(5, 2) GENERATED ALWAYS AS (total_days - used_days) STORED,
    year YEAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (type_id) REFERENCES leave_types(type_id),
    UNIQUE (user_id, type_id, year)
);

-- 6. Leave Requests Table
CREATE TABLE leave_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT,
    status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
    manager_id INT, -- Current approver
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (type_id) REFERENCES leave_types(type_id),
    FOREIGN KEY (manager_id) REFERENCES users(user_id)
);

-- Seed Initial Data (Optional)
INSERT INTO roles (role_name, description) VALUES 
('Admin', 'Full system access'),
('Manager', 'Can approve/reject leave requests'),
('Employee', 'Standard user');

INSERT INTO departments (dept_name) VALUES 
('Human Resources'),
('Engineering'),
('Special Projects'),
('Operations');

INSERT INTO leave_types (type_name, description, default_annual_allowance) VALUES 
('Sick Leave', 'Leave for medical reasons', 12),
('Vacation Leave', 'Personal vacation time', 15),
('Maternity Leave', 'Paid leave for new mothers', 90),
('Paternity Leave', 'Paid leave for new fathers', 14),
('Unpaid Leave', 'Leave without pay', 365);
