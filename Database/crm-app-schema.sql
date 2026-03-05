SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS railway;
CREATE DATABASE railway;
USE railway;

/* ================= USERS ================= */

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* ALTERs from history */
ALTER TABLE users 
  ADD COLUMN role ENUM('admin','employee') DEFAULT 'admin';

ALTER TABLE users 
  ADD COLUMN owner_id INT NULL,
  ADD CONSTRAINT fk_users_owner
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;


/* ================= LEADS ================= */

CREATE TABLE leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  status ENUM('new','contacted','qualified','closed','lost') DEFAULT 'new',
  expected_value DECIMAL(10,2),
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

/* ALTERs from history */
ALTER TABLE leads ADD COLUMN source VARCHAR(50) DEFAULT 'manual';

ALTER TABLE leads
  ADD COLUMN project_info VARCHAR(255),
  ADD COLUMN address TEXT,
  ADD COLUMN proposal TEXT;

ALTER TABLE leads
  MODIFY COLUMN status ENUM(
    'new',
    'contacted',
    'follow_up',
    'qualified',
    'proposal_sent',
    'negotiation',
    'closed',
    'lost'
  ) DEFAULT 'new';

ALTER TABLE leads
  ADD COLUMN converted_at TIMESTAMP NULL;

ALTER TABLE leads
  ADD COLUMN converted TINYINT(1) DEFAULT 0;

ALTER TABLE leads
  ADD COLUMN workspace_id INT;
  
ALTER TABLE leads
ADD COLUMN budget DECIMAL(10,2) DEFAULT 0,
ADD COLUMN service VARCHAR(255);

SELECT * FROM leads;


/* ================= CLIENTS ================= */

CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  total_value DECIMAL(10,2) DEFAULT 0,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

/* ALTERs from history */
ALTER TABLE clients DROP COLUMN total_value;

ALTER TABLE clients
  ADD COLUMN status ENUM('active','inactive','blacklisted') DEFAULT 'active';

ALTER TABLE clients ADD COLUMN notes TEXT;

ALTER TABLE clients
  ADD COLUMN decision ENUM('qualified','not_interested','pending') DEFAULT 'qualified';

ALTER TABLE clients
  ADD COLUMN total_value DECIMAL(10,2) DEFAULT 0;

ALTER TABLE clients
  ADD COLUMN workspace_id INT;
  
ALTER TABLE clients
ADD COLUMN lead_id INT NULL;

ALTER TABLE clients
ADD CONSTRAINT fk_clients_lead
FOREIGN KEY (lead_id)
REFERENCES leads(id)
ON DELETE SET NULL;


UPDATE clients c
JOIN (
    SELECT id
    FROM clients
    WHERE lead_id IS NOT NULL
    ORDER BY id
    LIMIT 3
) t ON c.id = t.id
JOIN leads l ON c.lead_id = l.id
SET c.total_value = l.budget;


DESCRIBE clients;
SELECT * FROM clients;



/* ================= PROJECTS ================= */

CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  service_type VARCHAR(100),
  total_amount DECIMAL(12,2) NOT NULL,
  advance_amount DECIMAL(12,2) DEFAULT 0,
  remaining_amount DECIMAL(12,2) DEFAULT 0,
  payment_terms VARCHAR(255),
  status ENUM('active','completed','on_hold') DEFAULT 'active',
  current_phase ENUM('planning','design','development','testing','delivery') DEFAULT 'planning',
  progress_percent INT DEFAULT 0,
  start_date DATE,
  deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

/* ALTERs from history */
ALTER TABLE projects
  ADD COLUMN workspace_id INT NOT NULL;

ALTER TABLE projects
  ADD COLUMN owner_id INT NULL AFTER id;

ALTER TABLE projects
  ADD CONSTRAINT fk_projects_owner
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
  
ALTER TABLE projects
ADD COLUMN budget DECIMAL(10,2) DEFAULT 0;

ALTER TABLE projects
  MODIFY total_amount DECIMAL(10,2) NOT NULL,
  MODIFY advance_amount DECIMAL(10,2) NOT NULL,
  MODIFY remaining_amount DECIMAL(10,2) NOT NULL;
  
  SELECT * FROM projects;
  


/* ================= TASKS ================= */

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low','medium','high') DEFAULT 'medium',
  status ENUM('pending','in_progress','completed') DEFAULT 'pending',
  due_date DATE,
  assigned_to INT,
  created_by INT NOT NULL,
  client_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

/* ALTERs from history */
ALTER TABLE tasks ADD COLUMN project_id INT;
ALTER TABLE tasks ADD COLUMN workspace_id INT;

ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_project
  FOREIGN KEY (project_id) REFERENCES projects(id)
  ON DELETE CASCADE;

ALTER TABLE tasks
  MODIFY project_id INT NOT NULL;


/* ================= PAYMENTS ================= */

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

/* ALTERs from history */
ALTER TABLE payments ADD COLUMN project_id INT;
ALTER TABLE payments ADD COLUMN workspace_id INT;

ALTER TABLE payments
  ADD CONSTRAINT fk_project
  FOREIGN KEY (project_id) REFERENCES projects(id)
  ON DELETE CASCADE;

/* If backend expects payment status */
ALTER TABLE payments
  ADD COLUMN status ENUM('milestone','advance','complete','paid','pending')
  DEFAULT 'pending';
  
ALTER TABLE payments
ADD COLUMN payment_type ENUM('advance','milestone','final') DEFAULT 'advance';




/* ================= TASK HISTORY ================= */

CREATE TABLE task_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  old_title VARCHAR(255),
  old_description TEXT,
  old_status ENUM('pending','in_progress','completed'),
  old_priority ENUM('low','medium','high'),
  old_due_date DATE,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);


/* ================= LEAD NOTES ================= */

CREATE TABLE lead_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  note TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);


/* ================= PROJECT REQUIREMENTS ================= */

CREATE TABLE project_requirements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending','in_progress','completed') DEFAULT 'pending',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);


/* ================= PROJECT MEMBERS ================= */

CREATE TABLE project_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(100) DEFAULT 'member',
  assigned_by INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_project_user (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
);


/* ================= PROJECT ACTIVITY ================= */

CREATE TABLE project_activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


/* ================= PROJECT MILESTONES ================= */

CREATE TABLE project_milestones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  due_date DATE NULL,
  status ENUM('pending','in_progress','completed') DEFAULT 'pending',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);


/* ================= PROJECT FEATURES ================= */

CREATE TABLE project_features (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;