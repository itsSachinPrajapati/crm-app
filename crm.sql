-- =============================================================================
-- CRM APP — DATABASE SCHEMA
-- =============================================================================


-- =============================================================================
-- 1. DATABASE
-- =============================================================================

CREATE DATABASE crm_app;
USE crm_app;


-- =============================================================================
-- 2. TABLE: users
-- =============================================================================

CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('admin','employee') DEFAULT 'admin',
    owner_id    INT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);


-- =============================================================================
-- 3. TABLE: clients
-- =============================================================================

CREATE TABLE clients (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100),
    phone       VARCHAR(20),
    project     VARCHAR(255) NOT NULL,
    status      ENUM('active','inactive','blacklisted') DEFAULT 'active',
    notes       TEXT,
    decision    ENUM('qualified','not_interested','pending') DEFAULT 'qualified',
    total_value DECIMAL(10,2) DEFAULT 0,
    workspace_id INT,
    user_id     INT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);


-- =============================================================================
-- 4. TABLE: leads
-- =============================================================================

CREATE TABLE leads (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    email          VARCHAR(100),
    phone          VARCHAR(20),
    status         ENUM(
                       'new', 'contacted', 'follow_up', 'qualified',
                       'proposal_sent', 'negotiation', 'closed', 'lost'
                   ) DEFAULT 'new',
    source         VARCHAR(50) DEFAULT 'manual',
    expected_value DECIMAL(10,2),
    project_info   VARCHAR(255),
    address        TEXT,
    proposal       TEXT,
    converted      TINYINT(1) DEFAULT 0,
    converted_at   TIMESTAMP NULL,
    workspace_id   INT,
    user_id        INT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);


-- =============================================================================
-- 5. TABLE: projects
-- =============================================================================

CREATE TABLE projects (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    owner_id         INT NOT NULL,
    client_id        INT NOT NULL,
    workspace_id     INT NOT NULL,
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    service_type     VARCHAR(100),
    total_amount     DECIMAL(10,2) NOT NULL,
    advance_amount   DECIMAL(10,2) NOT NULL,
    remaining_amount DECIMAL(10,2) NOT NULL,
    payment_terms    VARCHAR(255),
    status           ENUM('active','completed','on_hold') DEFAULT 'active',
    current_phase    ENUM('planning','design','development','testing','delivery') DEFAULT 'planning',
    progress_percent INT DEFAULT 0,
    start_date       DATE,
    deadline         DATE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id)  REFERENCES users(id)   ON DELETE CASCADE
);


-- =============================================================================
-- 6. TABLE: tasks
-- =============================================================================

CREATE TABLE tasks (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    priority     ENUM('low','medium','high')               DEFAULT 'medium',
    status       ENUM('pending','in_progress','completed') DEFAULT 'pending',
    due_date     DATE,
    assigned_to  INT,
    created_by   INT NOT NULL,
    client_id    INT NOT NULL,
    project_id   INT NOT NULL,
    workspace_id INT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id)    ON DELETE SET NULL,
    FOREIGN KEY (created_by)  REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (client_id)   REFERENCES clients(id)  ON DELETE CASCADE,
    FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE
);


-- =============================================================================
-- 7. TABLE: payments
-- =============================================================================

CREATE TABLE payments (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    client_id    INT NOT NULL,
    project_id   INT,
    workspace_id INT,
    amount       DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id)  REFERENCES clients(id)  ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);


-- =============================================================================
-- 8. TABLE: lead_notes
-- =============================================================================

CREATE TABLE lead_notes (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    lead_id    INT NOT NULL,
    note       TEXT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id)    REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);


-- =============================================================================
-- 9. TABLE: project_requirements
-- =============================================================================

CREATE TABLE project_requirements (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    project_id  INT NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    status      ENUM('pending','in_progress','completed') DEFAULT 'pending',
    created_by  INT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)    ON DELETE CASCADE
);


-- =============================================================================
-- 10. TABLE: project_features
-- =============================================================================

CREATE TABLE project_features (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    title      VARCHAR(255) NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);


-- =============================================================================
-- 11. TABLE: project_milestones
-- =============================================================================

CREATE TABLE project_milestones (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    project_id  INT NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT NULL,
    due_date    DATE NULL,
    status      ENUM('pending','in_progress','completed') DEFAULT 'pending',
    created_by  INT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)    ON DELETE CASCADE
);


-- =============================================================================
-- 12. TABLE: project_members
-- =============================================================================

CREATE TABLE project_members (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    project_id  INT NOT NULL,
    user_id     INT NOT NULL,
    role        VARCHAR(100) DEFAULT 'member',
    assigned_by INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_project_user (project_id, user_id),
    FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)     REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id)    ON DELETE CASCADE
);


-- =============================================================================
-- 13. TABLE: project_activity_logs
-- =============================================================================

CREATE TABLE project_activity_logs (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    user_id    INT NOT NULL,
    action     VARCHAR(255) NOT NULL,
    metadata   JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);


-- =============================================================================
-- 14. TABLE: task_history
-- =============================================================================

CREATE TABLE task_history (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    task_id         INT NOT NULL,
    old_title       VARCHAR(255),
    old_description TEXT,
    old_status      ENUM('pending','in_progress','completed'),
    old_priority    ENUM('low','medium','high'),
    old_due_date    DATE,
    changed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);


-- =============================================================================
-- CRM APP — DESCRIBE & SELECT ALL TABLES
-- =============================================================================


-- =============================================================================
-- 1. users
-- =============================================================================

DESCRIBE users;
SELECT * FROM users;


-- =============================================================================
-- 2. clients
-- =============================================================================

DESCRIBE clients;
SELECT * FROM clients;


-- =============================================================================
-- 3. leads
-- =============================================================================

DESCRIBE leads;
SELECT * FROM leads;


-- =============================================================================
-- 4. projects
-- =============================================================================

DESCRIBE projects;
SELECT * FROM projects;


-- =============================================================================
-- 5. tasks
-- =============================================================================

DESCRIBE tasks;
SELECT * FROM tasks;


-- =============================================================================
-- 6. payments
-- =============================================================================

DESCRIBE payments;
SELECT * FROM payments;


-- =============================================================================
-- 7. lead_notes
-- =============================================================================

DESCRIBE lead_notes;
SELECT * FROM lead_notes;


-- =============================================================================
-- 8. project_requirements
-- =============================================================================

DESCRIBE project_requirements;
SELECT * FROM project_requirements;


-- =============================================================================
-- 9. project_features
-- =============================================================================

DESCRIBE project_features;
SELECT * FROM project_features;


-- =============================================================================
-- 10. project_milestones
-- =============================================================================

DESCRIBE project_milestones;
SELECT * FROM project_milestones;


-- =============================================================================
-- 11. project_members
-- =============================================================================

DESCRIBE project_members;
SELECT * FROM project_members;


-- =============================================================================
-- 12. project_activity_logs
-- =============================================================================

DESCRIBE project_activity_logs;
SELECT * FROM project_activity_logs;


-- =============================================================================
-- 13. task_history
-- =============================================================================

DESCRIBE task_history;
SELECT * FROM task_history;